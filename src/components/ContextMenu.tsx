import { Accessor, JSX, createEffect, createSignal, onCleanup } from 'solid-js';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  anchor: Accessor<{ x: number; y: number } | null>;
  onClose: () => void;
  children: JSX.Element;
}

export interface ContextMenuController<T> {
  anchor: Accessor<{ x: number; y: number } | null>;
  data: Accessor<T | undefined>;
  open: (event: MouseEvent, payload: T) => void;
  close: () => void;
}

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

export function ContextMenu(props: ContextMenuProps) {
  let menuRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (!menuRef) {
      return;
    }

    const position = props.anchor();

    if (position) {
      setMenuPosition(menuRef, position.x, position.y);
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
    <div
      ref={menuRef}
      class={styles.menu}
      role="menu"
      popover="manual"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      {props.children}
    </div>
  );
}

function setMenuPosition(menu: HTMLDivElement, x: number, y: number) {
  menu.style.setProperty('--context-menu-anchor-x', `${x}px`);
  menu.style.setProperty('--context-menu-anchor-y', `${y}px`);
}
