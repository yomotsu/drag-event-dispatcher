/*!
 * drag-event-dispatcher
 * https://github.com/yomotsu/drag-event-dispatcher
 * (c) 2020 @yomotsu
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.DragEventDispatcher = factory());
}(this, (function () { 'use strict';

	var EventDispatcher = (function () {
	    function EventDispatcher() {
	        this._listeners = {};
	    }
	    EventDispatcher.prototype.addEventListener = function (type, listener) {
	        var listeners = this._listeners;
	        if (listeners[type] === undefined)
	            listeners[type] = [];
	        if (listeners[type].indexOf(listener) === -1)
	            listeners[type].push(listener);
	    };
	    EventDispatcher.prototype.removeEventListener = function (type, listener) {
	        var listeners = this._listeners;
	        var listenerArray = listeners[type];
	        if (listenerArray !== undefined) {
	            var index = listenerArray.indexOf(listener);
	            if (index !== -1)
	                listenerArray.splice(index, 1);
	        }
	    };
	    EventDispatcher.prototype.dispatchEvent = function (event) {
	        var listeners = this._listeners;
	        var listenerArray = listeners[event.type];
	        if (listenerArray !== undefined) {
	            event.target = this;
	            var array = listenerArray.slice(0);
	            for (var i = 0, l = array.length; i < l; i++) {
	                array[i].call(this, event);
	            }
	        }
	    };
	    return EventDispatcher;
	}());

	function isTouchEvent(event) {
	    return 'TouchEvent' in window && event instanceof TouchEvent;
	}

	var passiveFalse = { passive: false };
	var DragEventDispatcher = (function () {
	    function DragEventDispatcher($el) {
	        this._isDragging = false;
	        this._eventDispatcher = new EventDispatcher();
	        this._count = 0;
	        this._dragStartX = 0;
	        this._dragStartY = 0;
	        this._dragLastX = 0;
	        this._dragLastY = 0;
	        this._accumulatedX = 0;
	        this._accumulatedY = 0;
	        this._$el = $el;
	        this._onDragStart = this._handleDragStart.bind(this);
	        this._onDragMove = this._handleDragMove.bind(this);
	        this._onDragEnd = this._handleDragEnd.bind(this);
	        this._$el.addEventListener('mousedown', this._onDragStart);
	        this._$el.addEventListener('touchstart', this._onDragStart);
	    }
	    Object.defineProperty(DragEventDispatcher.prototype, "isDragging", {
	        get: function () {
	            return this._isDragging;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    DragEventDispatcher.prototype.addEventListener = function (type, listener) {
	        this._eventDispatcher.addEventListener(type, listener);
	    };
	    DragEventDispatcher.prototype.removeEventListener = function (type, listener) {
	        this._eventDispatcher.removeEventListener(type, listener);
	    };
	    DragEventDispatcher.prototype.forceDragEnd = function () {
	        document.removeEventListener('mousemove', this._onDragMove);
	        document.removeEventListener('touchmove', this._onDragMove, passiveFalse);
	        document.removeEventListener('mouseup', this._onDragEnd);
	        document.removeEventListener('touchend', this._onDragEnd);
	        this._isDragging = false;
	        this._eventDispatcher.dispatchEvent({
	            type: 'dragcancel',
	            dragStartX: this._dragStartX,
	            dragStartY: this._dragStartY,
	            accumulatedX: this._accumulatedX,
	            accumulatedY: this._accumulatedY,
	        });
	    };
	    DragEventDispatcher.prototype.destroy = function () {
	        this.forceDragEnd();
	    };
	    DragEventDispatcher.prototype._handleDragStart = function (event) {
	        event.preventDefault();
	        document.removeEventListener('mousemove', this._onDragMove);
	        document.removeEventListener('touchmove', this._onDragMove, passiveFalse);
	        document.removeEventListener('mouseup', this._onDragEnd);
	        document.removeEventListener('touchend', this._onDragEnd);
	        var _event = isTouchEvent(event)
	            ? event.touches[0]
	            : event;
	        this._isDragging = true;
	        this._count = 0;
	        this._accumulatedX = 0;
	        this._accumulatedY = 0;
	        this._dragStartX = _event.clientX;
	        this._dragStartY = _event.clientY;
	        this._dragLastX = _event.clientX;
	        this._dragLastY = _event.clientY;
	        this._eventDispatcher.dispatchEvent({
	            type: 'dragstart',
	            clientX: _event.clientX,
	            clientY: _event.clientY,
	            dragStartX: this._dragStartX,
	            dragStartY: this._dragStartY,
	            deltaY: 0,
	            deltaX: 0,
	            accumulatedX: this._accumulatedX,
	            accumulatedY: this._accumulatedY,
	        });
	        document.addEventListener('mousemove', this._onDragMove);
	        document.addEventListener('touchmove', this._onDragMove, passiveFalse);
	        document.addEventListener('mouseup', this._onDragEnd);
	        document.addEventListener('touchend', this._onDragEnd);
	    };
	    DragEventDispatcher.prototype._handleDragMove = function (event) {
	        event.preventDefault();
	        var _event = isTouchEvent(event)
	            ? event.touches[0]
	            : event;
	        this._count += 1;
	        var deltaX = _event.clientX - this._dragLastX;
	        var deltaY = _event.clientY - this._dragLastY;
	        this._accumulatedX += deltaX;
	        this._accumulatedY += deltaY;
	        this._dragLastX = _event.clientX;
	        this._dragLastY = _event.clientY;
	        this._eventDispatcher.dispatchEvent({
	            type: 'dragmove',
	            count: this._count,
	            clientX: _event.clientX,
	            clientY: _event.clientY,
	            dragStartX: this._dragStartX,
	            dragStartY: this._dragStartY,
	            deltaY: deltaY,
	            deltaX: deltaX,
	            accumulatedX: this._accumulatedX,
	            accumulatedY: this._accumulatedY,
	        });
	    };
	    DragEventDispatcher.prototype._handleDragEnd = function (event) {
	        this.forceDragEnd();
	        var _event = isTouchEvent(event)
	            ? event.changedTouches[0]
	            : event;
	        this._eventDispatcher.dispatchEvent({
	            type: 'dragend',
	            clientX: _event.clientX,
	            clientY: _event.clientY,
	            dragStartX: this._dragStartX,
	            dragStartY: this._dragStartY,
	            deltaY: 0,
	            deltaX: 0,
	            accumulatedX: this._accumulatedX,
	            accumulatedY: this._accumulatedY,
	        });
	    };
	    return DragEventDispatcher;
	}());

	return DragEventDispatcher;

})));
