/** A route-scoped listener registry, including media queries and capture options. */
export class EventScope {
  private registrations: {
    target: EventTarget;
    name: string;
    handler: EventListener;
    capture: boolean;
    options?: boolean | AddEventListenerOptions;
  }[] = [];
  on<K extends keyof WindowEventMap>(
    target: Window,
    name: K,
    listener: (event: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  on<K extends keyof DocumentEventMap>(
    target: Document,
    name: K,
    listener: (event: DocumentEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  on<K extends keyof HTMLElementEventMap>(
    target: HTMLElement | null,
    name: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  on(
    target: MediaQueryList,
    name: "change",
    listener: (event: MediaQueryListEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  on(
    target: EventTarget | null,
    name: string,
    listener: unknown,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (!target) return;
    const handler = listener as EventListener;
    target.addEventListener(name, handler, options);
    const capture = typeof options === "boolean" ? options : !!options?.capture;
    // Resize can detach/re-attach the wheel handler. Track that registration once.
    if (
      !this.registrations.some(
        (item) =>
          item.target === target &&
          item.name === name &&
          item.handler === handler &&
          item.capture === capture,
      )
    ) {
      this.registrations.push({ target, name, handler, capture, options });
    }
  }
  dispose() {
    this.registrations
      .splice(0)
      .reverse()
      .forEach(({ target, name, handler, options }) =>
        target.removeEventListener(name, handler, options),
      );
  }
}
