interface DragEvent {
    type: string;
    clientX: number;
    clientY: number;
    dragStartX: number;
    dragStartY: number;
    accumulatedX: number;
    accumulatedY: number;
}
interface DragStartEvent extends DragEvent {
    type: 'dragstart';
}
interface DragMoveEvent extends DragEvent {
    type: 'dragmove';
    count: number;
}
interface DragEndEvent extends DragEvent {
    type: 'dragend';
}
interface DragCancelEvent {
    type: 'dragcancel';
    dragStartX: number;
    dragStartY: number;
    accumulatedX: number;
    accumulatedY: number;
}
interface DragEventMap {
    dragstart: DragStartEvent;
    dragmove: DragMoveEvent;
    dragend: DragEndEvent;
    dragcancel: DragCancelEvent;
}
export declare class DragEventDispatcher {
    private _isDragging;
    private _$el;
    private _eventDispatcher;
    private _count;
    private _dragStartX;
    private _dragStartY;
    private _dragLastX;
    private _dragLastY;
    private _accumulatedX;
    private _accumulatedY;
    private _onDragStart;
    private _onDragMove;
    private _onDragEnd;
    constructor($el: Element);
    readonly isDragging: boolean;
    addEventListener<K extends keyof DragEventMap>(type: K, listener: (event: DragEventMap[K]) => any): void;
    removeEventListener<K extends keyof DragEventMap>(type: K, listener: (event: DragEventMap[K]) => any): void;
    forceDragEnd(): void;
    destroy(): void;
    private _handleDragStart;
    private _handleDragMove;
    private _handleDragEnd;
}
export {};
