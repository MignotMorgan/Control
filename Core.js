

class Core {
    static #version = "1.0.0";
    static #controls = [];
    static #mouse = { x:0, y:0, down:Date.now(), up:Date.now(), time:0 };
    static #mousehover = { control:null, selected:null };
    static #modifiers = { shift:false, ctrl:false, alt:false, meta:false, capslock:false, keyCode:0, key:"", shortcut:"" };
    static #dragdrop = { armed:false, active:false, control:null, parent:null, target:null, srcX:0, srcY:0, startX:0, startY:0, offsetX:0, offsetY:0, data:{ text:"", files: null } };
    static #transformation = { control:null, offsetX:0, offsetY:0, resize:false, border:5, left:false, top:false, right:false, bottom:false, lock:false };
    static #focus = null;

    static #DRAG_ACTIVATION = 6;
    static #AUTOSCROLL = 20;
    static #AUTOSCROLL_SPEED = 0.5;

    static #TEXTMARGIN = {top: 10, right: 10, bottom: 10, left: 10};
    static #TEXTSCROLL = 6;

    constructor() {
    }
    static get version(){ return this.#version; }
    static get controls(){ return this.#controls; }
    static get mouse(){ return this.#mouse; }
    static get mousehover(){ return this.#mousehover; }
    static get modifiers(){ return this.#modifiers; }
    static get dragdrop(){ return this.#dragdrop; }
    static get transformation(){ return this.#transformation; }
    static get focus(){ return this.#focus; }
    static set focus(value){ this.#focus = value; }

    static get DRAG_ACTIVATION(){ return this.#DRAG_ACTIVATION; }
    static get AUTOSCROLL(){ return this.#AUTOSCROLL; }
    static get AUTOSCROLL_SPEED(){ return this.#AUTOSCROLL_SPEED; }
    static get TEXTMARGIN(){ return this.#TEXTMARGIN; }
    static get TEXTSCROLL(){ return this.#TEXTSCROLL; }
}