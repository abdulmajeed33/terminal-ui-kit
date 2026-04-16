import React, { useState } from 'react';

export interface ModuleWindowProps {
    id: string;
    title: string;
    badge?: string;
    isActive?: boolean;
    children: React.ReactNode;
    toolbar?: React.ReactNode;
    subtabs?: React.ReactNode;
    statusbar?: React.ReactNode;
    style?: React.CSSProperties;
    onClose?: () => void;
    onMinimize?: () => void;
    onMaximize?: () => void;
    onMove?: (x: number, y: number) => void;
    onResize?: (w: number, h: number) => void;
    onFocus?: () => void;
}

export function ModuleWindow({
    id,
    title,
    badge,
    isActive = false,
    children,
    toolbar,
    subtabs,
    statusbar,
    style,
    onClose,
    onMinimize,
    onMaximize,
    onMove,
    onResize,
    onFocus
}: ModuleWindowProps) {

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
        onFocus?.();
        const target = e.target as HTMLElement;
        if (target.closest('.panel-actions') || target.closest('button')) return;
        
        setIsDragging(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const initialLeft = parseFloat(style?.left as string || '0');
        const initialTop = parseFloat(style?.top as string || '0');

        const handlePointerMove = (moveEvent: PointerEvent) => {
            onMove?.(initialLeft + (moveEvent.clientX - startX), initialTop + (moveEvent.clientY - startY));
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
        onFocus?.();
        setIsResizing(direction);
        
        const startX = e.clientX;
        const startY = e.clientY;
        const initialWidth = parseFloat(style?.width as string || '0');
        const initialHeight = parseFloat(style?.height as string || '0');
        const initialLeft = parseFloat(style?.left as string || '0');
        const initialTop = parseFloat(style?.top as string || '0');

        const minWidth = 320;
        const minHeight = 220;

        const handleResizeMove = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            
            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newLeft = initialLeft;
            let newTop = initialTop;

            if (direction.includes('e')) {
                newWidth = Math.max(minWidth, initialWidth + dx);
            }
            if (direction.includes('s')) {
                newHeight = Math.max(minHeight, initialHeight + dy);
            }
            if (direction.includes('w')) {
                newWidth = Math.max(minWidth, initialWidth - dx);
                newLeft = initialLeft + (initialWidth - newWidth);
            }
            if (direction.includes('n')) {
                newHeight = Math.max(minHeight, initialHeight - dy);
                newTop = initialTop + (initialHeight - newHeight);
            }

            if (direction.includes('w') || direction.includes('n')) {
                onMove?.(newLeft, newTop);
            }
            onResize?.(newWidth, newHeight);
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
            className={`terminal-panel ${isActive ? 'is-focused' : 'is-inactive'} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
            style={style}
            onPointerDown={() => onFocus?.()}
        >
            <header className="panel-titlebar" onPointerDown={handlePointerDown}>
                <div className="panel-titlegroup">
                    <span className="panel-app-icon"></span>
                    <div className="panel-titletext">
                        {title}
                        {badge && <>{" "}<span className="panel-badge">{badge}</span></>}
                    </div>
                </div>

                <div className="panel-title-meta">
                    <span className="micro-indicator">
                        <span className="mini-dot"></span>Realtime
                    </span>
                </div>

                <div className="panel-actions">
                    <button className="icon-btn" title="Link">⛓</button>
                    <button className="icon-btn" title="Pin">•</button>
                    <button className="icon-btn" title="Minimize" onClick={onMinimize}>–</button>
                    <button className="icon-btn" title="Maximize" onClick={onMaximize}>□</button>
                    <button className="icon-btn close" title="Close" onClick={onClose}>×</button>
                </div>
            </header>

            {subtabs && <nav className="panel-subtabs">{subtabs}</nav>}
            {toolbar && <div className="panel-toolbar">{toolbar}</div>}

            <div className="panel-body">
                {children}
            </div>

            {statusbar && (
                <footer className="panel-statusbar">
                    {statusbar}
                </footer>
            )}

            {/* Resize Handles */}
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