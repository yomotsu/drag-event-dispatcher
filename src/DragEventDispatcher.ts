import { EventDispatcher, Listener } from './EventDispatcher';
import { isTouchEvent } from './utils/isTouchEvent';

interface DragEvent {
	type: string;
	clientX: number;
	clientY: number;
	dragStartX: number,
	dragStartY: number,
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
	dragStartX: number,
	dragStartY: number,
	accumulatedX: number;
	accumulatedY: number;
}

interface DragEventMap {
	dragstart: DragStartEvent;
	dragmove: DragMoveEvent;
	dragend: DragEndEvent;
	dragcancel: DragCancelEvent;
}

const passiveFalse = { passive: false } as AddEventListenerOptions;

export class DragEventDispatcher {

	private _isDragging = false;
	private _$el: Element;
	private _eventDispatcher = new EventDispatcher();

	private _count = 0;
	private _dragStartX = 0;
	private _dragStartY = 0;
	private _dragLastX = 0;
	private _dragLastY = 0;
	private _accumulatedX = 0;
	private _accumulatedY = 0;

	private _onDragStart: ( event: Event ) => void;
	private _onDragMove: ( event: Event ) => void;
	private _onDragEnd: ( event: Event ) => void;

	constructor( $el: Element ) {

		this._$el = $el;

		this._onDragStart = this._handleDragStart.bind( this );
		this._onDragMove = this._handleDragMove.bind( this );
		this._onDragEnd = this._handleDragEnd.bind( this );

		this._$el.addEventListener( 'mousedown', this._onDragStart );
		this._$el.addEventListener( 'touchstart', this._onDragStart );

	}

	get isDragging() {

		return this._isDragging;

	}

	addEventListener<K extends keyof DragEventMap>(
		type: K,
		listener: ( event: DragEventMap[ K ] ) => any,
	): void {

		this._eventDispatcher.addEventListener( type, listener as Listener );

	}

	removeEventListener<K extends keyof DragEventMap>(
		type: K,
		listener: ( event: DragEventMap[ K ] ) => any,
	): void {

		this._eventDispatcher.removeEventListener( type, listener as Listener );

	}

	forceDragEnd() {

		document.removeEventListener( 'mousemove', this._onDragMove );
		document.removeEventListener( 'touchmove', this._onDragMove, passiveFalse );
		document.removeEventListener( 'mouseup', this._onDragEnd );
		document.removeEventListener( 'touchend', this._onDragEnd );

		this._isDragging = false;

		this._eventDispatcher.dispatchEvent( {
			type: 'dragcancel',
			dragStartX: this._dragStartX,
			dragStartY: this._dragStartY,
			accumulatedX: this._accumulatedX,
			accumulatedY: this._accumulatedY,
		} );

	}

	destroy() {

		this.forceDragEnd();

	}

	private _handleDragStart( event: Event ) {

		event.preventDefault();

		document.removeEventListener( 'mousemove', this._onDragMove );
		document.removeEventListener( 'touchmove', this._onDragMove, passiveFalse );
		document.removeEventListener( 'mouseup', this._onDragEnd );
		document.removeEventListener( 'touchend', this._onDragEnd );

		const _event = isTouchEvent( event )
			? ( event as TouchEvent ).touches[ 0 ]
			: ( event as MouseEvent );

		this._isDragging = true;
		this._count = 0;
		this._accumulatedX = 0;
		this._accumulatedY = 0;
		this._dragStartX = _event.clientX;
		this._dragStartY = _event.clientY;
		this._dragLastX = _event.clientX;
		this._dragLastY = _event.clientY;

		this._eventDispatcher.dispatchEvent( {
			type: 'dragstart',
			clientX: _event.clientX,
			clientY: _event.clientY,
			dragStartX: this._dragStartX,
			dragStartY: this._dragStartY,
			deltaY: 0,
			deltaX: 0,
			accumulatedX: this._accumulatedX,
			accumulatedY: this._accumulatedY,
		} );

		document.addEventListener( 'mousemove', this._onDragMove );
		document.addEventListener( 'touchmove', this._onDragMove, passiveFalse );
		document.addEventListener( 'mouseup', this._onDragEnd );
		document.addEventListener( 'touchend', this._onDragEnd );

	}

	private _handleDragMove( event: Event ) {

		event.preventDefault();

		const _event = isTouchEvent( event )
			? ( event as TouchEvent ).touches[ 0 ]
			: ( event as MouseEvent );
		this._count += 1;
		const deltaX = _event.clientX - this._dragLastX;
		const deltaY = _event.clientY - this._dragLastY;
		this._accumulatedX += deltaX;
		this._accumulatedY += deltaY;

		this._dragLastX = _event.clientX;
		this._dragLastY = _event.clientY;

		this._eventDispatcher.dispatchEvent( {
			type: 'dragmove',
			count: this._count,
			clientX: _event.clientX,
			clientY: _event.clientY,
			dragStartX: this._dragStartX,
			dragStartY: this._dragStartY,
			deltaY,
			deltaX,
			accumulatedX: this._accumulatedX,
			accumulatedY: this._accumulatedY,
		} );

	}

	private _handleDragEnd( event: Event ) {

		this.forceDragEnd();

		const _event = isTouchEvent( event )
			? ( event as TouchEvent ).changedTouches[ 0 ]
			: ( event as MouseEvent );

		this._eventDispatcher.dispatchEvent( {
			type: 'dragend',
			clientX: _event.clientX,
			clientY: _event.clientY,
			dragStartX: this._dragStartX,
			dragStartY: this._dragStartY,
			deltaY: 0,
			deltaX: 0,
			accumulatedX: this._accumulatedX,
			accumulatedY: this._accumulatedY,
		} );

	}

}
