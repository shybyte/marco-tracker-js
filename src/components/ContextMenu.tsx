import {
  type Accessor,
  createContext,
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  Show,
  useContext,
} from 'solid-js';
import styles from './ContextMenu.module.css';

export interface ContextMenuController<T> {
  anchor: Accessor<{ x: number; y: number } | null>;
  data: Accessor<T | undefined>;
  open: (event: MouseEvent, payload: T) => void;
  close: () => void;
}

const ContextMenuContext = createContext<{ close: () => void }>();

export function createContextMenuController<T>(): ContextMenuController<T> {
  const [anchor, setAnchor] = createSignal<{ x: number; y: number } | null>(null);
  const [data, setData] = createSignal<T | undefined>(undefined);

  const open = (event: MouseEvent, payload: T) => {
    event.preventDefault();
    event.stopPropagation();
    setData(() => payload);
    setAnchor({ x: event.clientX, y: event.clientY });
  };

  const close = () => {
    setAnchor(null);
    setData(undefined);
  };

  return {
    anchor,
    data,
    open,
    close,
  };
}

interface ContextMenuProps<T> {
  anchor: Accessor<{ x: number; y: number } | null>;
  onClose: () => void;
  payload: T | undefined;
  children: (payload: T) => JSX.Element;
}

export function ContextMenu<T>(props: ContextMenuProps<T>) {
  let menuRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (!menuRef) {
      return;
    }

    const position = props.anchor();

    if (position) {
      menuRef.style.setProperty('--context-menu-anchor-x', `${position.x}px`);
      menuRef.style.setProperty('--context-menu-anchor-y', `${position.y}px`);
      menuRef.showPopover();
    } else {
      menuRef.hidePopover();
    }
  });

  createEffect(() => {
    if (!props.anchor()) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (menuRef && !menuRef.contains(event.target as Node)) {
        props.onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        props.onClose();
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('contextmenu', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    onCleanup(() => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('contextmenu', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    });
  });

  return (
    <ContextMenuContext.Provider value={{ close: props.onClose }}>
      <div
        ref={menuRef}
        class={styles.menu}
        role="menu"
        popover="manual"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Show when={props.payload}>{(payload) => props.children(payload())}</Show>
      </div>
    </ContextMenuContext.Provider>
  );
}

interface ContextMenuItemProps {
  onClick: () => void;
  children: JSX.Element;
}

export function ContextMenuItem(props: ContextMenuItemProps) {
  const contextMenuContext = useContext(ContextMenuContext);

  if (!contextMenuContext) {
    throw new Error('ContextMenuItem must be used within a ContextMenu');
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        props.onClick();
        contextMenuContext.close();
      }}
    >
      {props.children}
    </button>
  );
}
