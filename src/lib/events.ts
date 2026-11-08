/** A route-scoped listener registry, including media queries and capture options. */
export class EventScope {
  private cleanups: (() => void)[] = [];
  on<K extends keyof WindowEventMap>(target: Window, name: K, listener: (event: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
  on<K extends keyof DocumentEventMap>(target: Document, name: K, listener: (event: DocumentEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
  on<K extends keyof HTMLElementEventMap>(target: HTMLElement | null, name: K, listener: (event: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
  on(target: MediaQueryList, name: 'change', listener: (event: MediaQueryListEvent) => void, options?: boolean | AddEventListenerOptions): void;
  on(target: EventTarget | null, name: string, listener: unknown, options?: boolean | AddEventListenerOptions) {
    if (!target) return;
    const handler = listener as EventListener;
    target.addEventListener(name, handler, options);
    this.cleanups.push(() => target.removeEventListener(name, handler, options));
  }
  dispose() { this.cleanups.splice(0).reverse().forEach(cleanup => cleanup()); }
}
