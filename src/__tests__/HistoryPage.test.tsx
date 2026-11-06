import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HistoryPage from '../pages/HistoryPage';

const fixture = vi.hoisted(() => ({
  generation: {
    id: 'fixture-1', contentType: 'article', prompt: 'Synthetic article',
    generatedContent: 'Synthetic content', createdAt: '2026-10-29T00:00:00Z',
    wordCount: 2, isFavorite: false, parameters: { tone: 'formal', length: 'short' },
  },
  toggleFavorite: vi.fn(), deleteGeneration: vi.fn(), loadHistory: vi.fn(),
}));
vi.mock('../stores/useAppStore', () => ({
  useAppStore: () => ({
    history: [fixture.generation], searchFilters: {}, loadHistory: fixture.loadHistory,
    setSearchFilters: vi.fn(), getFilteredHistory: () => [fixture.generation],
    toggleFavorite: fixture.toggleFavorite, deleteGeneration: fixture.deleteGeneration,
  }),
}));

let container: HTMLDivElement;
let root: Root;
beforeEach(async () => {
  vi.clearAllMocks();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter><HistoryPage /></MemoryRouter>); });
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});
const click = async (element: Element) => {
  await act(async () => { (element as HTMLElement).click(); });
};
const button = (text: string) => [...container.querySelectorAll('button')]
  .find(element => element.textContent?.trim() === text)!;

describe('history interactions', () => {
  it('selects and deselects a record', async () => {
    await click(container.querySelectorAll('input[type="checkbox"]')[1]);
    expect(container.textContent).toContain('已选择 1 项');
    await click(container.querySelectorAll('input[type="checkbox"]')[1]);
    expect(container.textContent).not.toContain('已选择 1 项');
  });
  it('opens details, copies content, toggles favorite, and closes', async () => {
    await click(container.querySelector('h3')!);
    expect(container.querySelector('.fixed')).not.toBeNull();
    await click(button('复制'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Synthetic content');
    const modal = button('关闭').closest('.fixed')!;
    const favorite = modal.querySelector('button')!;
    await click(favorite);
    expect(fixture.toggleFavorite).toHaveBeenCalledWith('fixture-1');
    await click(button('关闭'));
    expect(container.querySelector('.fixed')).toBeNull();
  });
  it('deletes only selected records after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await click(container.querySelectorAll('input[type="checkbox"]')[1]);
    await click(button('批量删除'));
    expect(fixture.deleteGeneration).toHaveBeenCalledExactlyOnceWith('fixture-1');
    expect(container.textContent).not.toContain('已选择 1 项');
  });
  it('exports the selected record as UTF-8 text and releases its download URL', async () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:fixture');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    });
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('history-fixture-1.txt');
      expect(this.href).toBe('blob:fixture');
    });
    try {
      await click(container.querySelector('h3')!);
      await click(button('导出'));
      expect(anchorClick).toHaveBeenCalledOnce();
      const blob = createObjectURL.mock.calls[0][0] as Blob;
      expect(blob.type).toBe('text/plain;charset=utf-8');
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });
      expect(text).toBe(fixture.generation.generatedContent);
      await new Promise(resolve => window.setTimeout(resolve, 1100));
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:fixture');
      expect(document.querySelector('a[download]')).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
