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
const OFFSET = 4;

export function ContextMenu(props: ContextMenuProps) {
  let menuRef: HTMLDivElement | undefined;

  createEffect(() => {
    const position = props.anchor();
    if (!menuRef) {
      return;
    }

    if (position) {
      const pointerX = position.x + OFFSET;
      const pointerY = position.y + OFFSET;
      setMenuPosition(menuRef, pointerX, pointerY);
      menuRef.showPopover();
      requestAnimationFrame(() => {
        if (!menuRef || !menuRef.matches(':popover-open')) {
          return;
        }
        const { x, y } = clampToViewport(menuRef, pointerX, pointerY);
        setMenuPosition(menuRef, x, y);
      });
    } else {
      if (menuRef.matches(':popover-open')) {
        menuRef.hidePopover();
      }
    }
  });

  createEffect(() => {
    if (!props.anchor()) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const menu = menuRef;
      if (menu && !menu.contains(event.target as Node)) {
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
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
}

function clampToViewport(menu: HTMLDivElement, x: number, y: number) {
  const width = menu.offsetWidth;
  const height = menu.offsetHeight;
  const maxX = Math.max(OFFSET, window.innerWidth - width - OFFSET);
  const maxY = Math.max(OFFSET, window.innerHeight - height - OFFSET);

  return {
    x: Math.min(Math.max(x, OFFSET), maxX),
    y: Math.min(Math.max(y, OFFSET), maxY),
  };
}
