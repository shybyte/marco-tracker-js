import { Accessor, JSX, createEffect, createSignal, onCleanup } from 'solid-js';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  anchor: Accessor<{ x: number; y: number } | null>;
  onClose: () => void;
  children: JSX.Element;
}

type PopoverElement = HTMLDivElement & {
  showPopover: () => void;
  hidePopover: () => void;
};

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
  let menuRef: PopoverElement | undefined;

  createEffect(() => {
    const position = props.anchor();
    const menu = menuRef;
    if (!menu) {
      return;
    }

    if (position) {
      const pointerX = position.x + 4;
      const pointerY = position.y + 4;
      menu.style.left = `${pointerX}px`;
      menu.style.top = `${pointerY}px`;
      menu.showPopover();
      requestAnimationFrame(() => {
        if (!menuRef || !menuRef.matches(':popover-open')) {
          return;
        }
        const width = menuRef.offsetWidth;
        const height = menuRef.offsetHeight;
        const maxX = Math.max(0, window.innerWidth - width - 4);
        const maxY = Math.max(0, window.innerHeight - height - 4);
        const clampedX = Math.min(Math.max(pointerX, 4), maxX);
        const clampedY = Math.min(Math.max(pointerY, 4), maxY);
        menuRef.style.left = `${clampedX}px`;
        menuRef.style.top = `${clampedY}px`;
      });
    } else {
      if (menu.matches(':popover-open')) {
        menu.hidePopover();
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
