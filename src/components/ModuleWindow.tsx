import React, { useState } from 'react';
import type { WindowAction, WindowMetaIndicator } from '../store';

interface Bounds {
    width: number;
    height: number;
}

export interface ModuleWindowProps {
    id: string;
    title: string;
    badge?: string;
    isActive?: boolean;
    isMinimized?: boolean;
    children: React.ReactNode;
    toolbar?: React.ReactNode;
    subtabs?: React.ReactNode;
    statusbar?: React.ReactNode;
    bottomStrip?: React.ReactNode;
    metaIndicators?: WindowMetaIndicator[];
    actions?: WindowAction[];
    actionStates?: Partial<Record<WindowAction['type'], boolean>>;
    style?: React.CSSProperties;
    bounds?: Bounds;
    onAction?: (action: WindowAction['type']) => void;
    onMove?: (x: number, y: number) => void;
    onResize?: (w: number, h: number, x?: number, y?: number) => void;
    onFocus?: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function ModuleWindow({
    id,
    title,
    badge,
    isActive = false,
    isMinimized = false,
    children,
    toolbar,
    subtabs,
    statusbar,
    bottomStrip,
    metaIndicators = [],
    actions = [],
    actionStates,
    style,
    bounds,
    onAction,
    onMove,
    onResize,
    onFocus
}: ModuleWindowProps) {

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);

    const initialLeft = parseFloat(String(style?.left ?? '0'));
    const initialTop = parseFloat(String(style?.top ?? '0'));
    const initialWidth = parseFloat(String(style?.width ?? '0'));
    const initialHeight = parseFloat(String(style?.height ?? '0'));

    const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
        onFocus?.();
        const target = e.target as HTMLElement;
        if (target.closest('.panel-actions') || target.closest('button')) return;

        setIsDragging(true);
        const startX = e.clientX;
        const startY = e.clientY;

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const maxLeft = Math.max(0, (bounds?.width ?? Number.MAX_SAFE_INTEGER) - initialWidth);
            const maxTop = Math.max(0, (bounds?.height ?? Number.MAX_SAFE_INTEGER) - (isMinimized ? 28 : initialHeight));
            const nextX = clamp(initialLeft + (moveEvent.clientX - startX), 0, maxLeft);
            const nextY = clamp(initialTop + (moveEvent.clientY - startY), 0, maxTop);
            onMove?.(nextX, nextY);
        };

        const handlePointerUp = () => {
            setIsDragging(false);
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    const handleResizeStart = (e: React.PointerEvent<HTMLElement>, direction: string) => {
        e.stopPropagation();
        e.preventDefault();
        if (isMinimized) return;
        onFocus?.();
        setIsResizing(direction);

        const startX = e.clientX;
        const startY = e.clientY;
        const minWidth = 320;
        const minHeight = 220;

        const handleResizeMove = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newLeft = initialLeft;
            let newTop = initialTop;

            if (direction.includes('e')) newWidth = Math.max(minWidth, initialWidth + dx);
            if (direction.includes('s')) newHeight = Math.max(minHeight, initialHeight + dy);
            if (direction.includes('w')) {
                newWidth = Math.max(minWidth, initialWidth - dx);
                newLeft = initialLeft + (initialWidth - newWidth);
            }
            if (direction.includes('n')) {
                newHeight = Math.max(minHeight, initialHeight - dy);
                newTop = initialTop + (initialHeight - newHeight);
            }

            if (bounds) {
                newLeft = clamp(newLeft, 0, Math.max(0, bounds.width - newWidth));
                newTop = clamp(newTop, 0, Math.max(0, bounds.height - newHeight));
                newWidth = Math.min(newWidth, bounds.width - newLeft);
                newHeight = Math.min(newHeight, bounds.height - newTop);
            }

            onResize?.(newWidth, newHeight, newLeft, newTop);
        };

        const handleResizeEnd = () => {
            setIsResizing(null);
            document.removeEventListener('pointermove', handleResizeMove);
            document.removeEventListener('pointerup', handleResizeEnd);
        };

        document.addEventListener('pointermove', handleResizeMove);
        document.addEventListener('pointerup', handleResizeEnd);
    };

    return (
        <section
            id={id}
            className={`terminal-panel ${isActive ? 'is-focused' : 'is-inactive'} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isMinimized ? 'is-minimized' : ''}`}
            style={style}
            onPointerDown={() => onFocus?.()}
        >
            <header className="panel-titlebar" onPointerDown={handlePointerDown}>
                <div className="panel-titlegroup">
                    <span className="panel-app-icon"></span>
                    <div className="panel-titletext">
                        {title}
                        {badge && <span className="panel-badge">{badge}</span>}
                    </div>
                </div>

                <div className="panel-title-meta">
                    {metaIndicators.map((indicator) => (
                        <span key={indicator.label} className="micro-indicator">
                            {indicator.liveDot && <span className="mini-dot"></span>}
                            {indicator.label}
                        </span>
                    ))}
                </div>

                <div className="panel-actions">
                    {actions.map((action) => (
                        <button
                            key={action.type}
                            className={`icon-btn ${actionStates?.[action.type] ? 'is-on' : ''} ${action.type === 'close' ? 'close' : ''}`.trim()}
                            title={action.label}
                            onClick={() => onAction?.(action.type)}
                        >
                            {action.icon}
                        </button>
                    ))}
                </div>
            </header>

            {!isMinimized && subtabs && <nav className="panel-subtabs">{subtabs}</nav>}
            {!isMinimized && toolbar && <div className="panel-toolbar">{toolbar}</div>}
            {!isMinimized && <div className="panel-body">{children}</div>}
            {!isMinimized && bottomStrip && <div className="panel-bottomstrip">{bottomStrip}</div>}
            {!isMinimized && statusbar && <footer className="panel-statusbar">{statusbar}</footer>}

            <span className="resize-handle n" onPointerDown={(e) => handleResizeStart(e, 'n')}></span>
            <span className="resize-handle s" onPointerDown={(e) => handleResizeStart(e, 's')}></span>
            <span className="resize-handle e" onPointerDown={(e) => handleResizeStart(e, 'e')}></span>
            <span className="resize-handle w" onPointerDown={(e) => handleResizeStart(e, 'w')}></span>
            <span className="resize-handle ne" onPointerDown={(e) => handleResizeStart(e, 'ne')}></span>
            <span className="resize-handle nw" onPointerDown={(e) => handleResizeStart(e, 'nw')}></span>
            <span className="resize-handle se" onPointerDown={(e) => handleResizeStart(e, 'se')}></span>
            <span className="resize-handle sw" onPointerDown={(e) => handleResizeStart(e, 'sw')}></span>
        </section>
    );
}