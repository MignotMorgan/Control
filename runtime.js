
function cjsLoop(){
    const controls = Core.controls;
    for(let i = 0; i < controls.length; i++){
        controls[i].Paint.clear();
        controls[i].onDraw(undefined);
    }
    queueNewFrame();
}

let cjs_loop = -1;
function queueNewFrame(){
    if (window.requestAnimationFrame)
        cjs_loop = window.requestAnimationFrame(cjsLoop);
    else if (window.msRequestAnimationFrame)
        cjs_loop = window.msRequestAnimationFrame(cjsLoop);
    else if (window.webkitRequestAnimationFrame)
        cjs_loop = window.webkitRequestAnimationFrame(cjsLoop);
    else if (window.mozRequestAnimationFrame)
        cjs_loop = window.mozRequestAnimationFrame(cjsLoop);
    else if (window.oRequestAnimationFrame)
        cjs_loop = window.oRequestAnimationFrame(cjsLoop);
    else {
        queueNewFrame = function() { }
        cjs_loop = window.setInterval(cjsLoop, 16.7);
    }
}

function onMouseMove(e){
    let x = e.clientX + (document.documentElement.scrollLeft || window.pageXOffset || 0);
    let y = e.clientY + (document.documentElement.scrollTop || window.pageYOffset || 0);
    const mouse = Core.mouse;
    mouse.x = x;
    mouse.y = y;

    const mousehover = Core.mousehover;
    const transformation = Core.transformation;
    const controls = Core.controls;
    const dnd = Core.dragdrop;

    mousehover.selected = null;
    for(let i = controls.length - 1; i >= 0; i--)
        if( controls[i].containMouse() )
            controls[i].Mouse.hover();

    if( mousehover.control != mousehover.selected ){
        if( mousehover.control != null ){
            mousehover.control.Mouse.leave();
        }
        if( mousehover.selected != null ){
            mousehover.selected.Mouse.enter();
        }
        mousehover.control = mousehover.selected;
    }

    if(dnd.control){ DragDropManager.move(); }

    if(transformation.control == null){
        transformation.left = false;
        transformation.right = false;
        transformation.top = false;
        transformation.bottom = false;
        
        if( mousehover.control != null && mousehover.control.canResize ){
            if(mouse.x <= mousehover.control.form.Inside.x + mousehover.control.Absolute.x + transformation.border)transformation.left = true;
            if(mouse.y <= mousehover.control.form.Inside.y + mousehover.control.Absolute.y + transformation.border)transformation.top = true;
            if(mouse.x >= mousehover.control.form.Inside.x + mousehover.control.Absolute.x + mousehover.control.Size.width - transformation.border)transformation.right = true;
            if(mouse.y >= mousehover.control.form.Inside.y + mousehover.control.Absolute.y + mousehover.control.Size.height - transformation.border)transformation.bottom = true;
        }
    }
    else if( transformation.resize ){
        if(transformation.lock)return;
        transformation.lock = true;
        transformation.control.Resize.on();
        transformation.lock = false;
    }
    else { transformation.control.Move.on(); }

    let cursor = "default";
    if(transformation.control == null && mousehover.control && mousehover.control.canResize){
        const L = transformation.left, R = transformation.right, T = transformation.top, B = transformation.bottom;
        if((L && T) || (R && B)) cursor = "nwse-resize";
        else if((R && T) || (L && B)) cursor = "nesw-resize";
        else if(L || R) cursor = "ew-resize";
        else if(T || B) cursor = "ns-resize";
    } 
    document.body.style.cursor = cursor;
}

function onMouseDownLeft(e){
    const mousehover = Core.mousehover;
    if( mousehover.control != null){
        mousehover.control.onFocus();
        if(mousehover.control.canDrag){
            DragDropManager.start();
        } else {
            mousehover.control.Mouse.clickLeft();
        }
    }
    return false;
}

function onMouseUpLeft(e){
    const dnd = Core.dragdrop;
    const transformation = Core.transformation;
    const mousehover = Core.mousehover;
    transformation.control = null;
    transformation.resize = false;
    //let consumedClick = false;

    if(dnd.armed && !dnd.active && dnd.control){
        dnd.control.Mouse.clickLeft();
        dnd.control.Mouse.clickLeftUp();
    //    consumedClick = true;
        DragDropManager.reset();
    }
    else if(dnd.active && dnd.control){
        DragDropManager.dropControl();
    }
    else if(mousehover.control != null){
        mousehover.control.Mouse.clickLeftUp();
    }

    return false;
}

function onMouseDownRight(e){
    const mousehover = Core.mousehover;
    if( mousehover.control != null){
        mousehover.control.onFocus();
        mousehover.control.Transformation.on();
        mousehover.control.Mouse.clickRight();
        return false;
    }
    return false;
}

function onMouseUpRight(e){
    const mouse = Core.mouse;
    const mousehover = Core.mousehover;
    mouse.time = mouse.up - mouse.down;

    if( mousehover.control != null){
        mousehover.control.Mouse.clickRightUp();
    }
    onClear();
    return false;
};

function onMouseDown(e){
    const mouse = Core.mouse;
    mouse.down = Date.now();

    if (e.button === 2) { onMouseDownRight(e); }
    else { onMouseDownLeft(e); }
}

function onMouseUp(e){
    const mouse = Core.mouse;
    mouse.up = Date.now();
    mouse.time = mouse.up - mouse.down;

    if (e.button === 2){ onMouseUpRight(e); }
    else { onMouseUpLeft(e); }
}

function onClear(){
    const transformation = Core.transformation;
    transformation.control = null;
    transformation.resize = false;
    transformation.lock = false;
};

function onKeyDown(e){
    const modifiers = Core.modifiers;
    const focus = Core.focus;

    modifiers.shift = e.shiftKey;
    modifiers.ctrl = e.ctrlKey;
    modifiers.alt = e.altKey;
    modifiers.meta = e.metaKey;
    modifiers.keyCode = e.keyCode ? e.keyCode : e.which;
    if(e.key === 'CapsLock') modifiers.capslock = !modifiers.capslock;
    modifiers.key = e.key;
    const parts = [];
    if(modifiers.ctrl) parts.push('Ctrl');
    if(modifiers.shift) parts.push('Shift');
    if(modifiers.alt) parts.push('Alt');
    if(modifiers.meta) parts.push('Meta');
    if(e.key && e.key.length > 0) parts.push(e.key);
    modifiers.shortcut = parts.join('+');

    if(focus !== null){
        focus.Input.Keyboard.keyDown();
    }
}

function onKeyUp(e){
    const modifiers = Core.modifiers;
    const focus = Core.focus;

    modifiers.shift = e.shiftKey;
    modifiers.ctrl = e.ctrlKey;
    modifiers.alt = e.altKey;
    modifiers.meta = e.metaKey;
    modifiers.keyCode = e.keyCode ? e.keyCode : e.which;
    modifiers.key = e.key;
    if(focus !== null){
        focus.Input.Keyboard.keyUp();
    }
}

function onWheel(e){
    const focus = Core.focus;
    const mousehover = Core.mousehover;
    let deltaX = 0;
    let deltaY = 0;
    if('deltaY' in e || 'deltaX' in e){
        deltaX = e.deltaX || 0;
        deltaY = e.deltaY || 0;
    } else if('wheelDelta' in e){
        deltaY = -e.wheelDelta;
    } else if('detail' in e){
        deltaY = e.detail * 16;
    }

    let target = null;
    if(typeof mousehover !== 'undefined' && mousehover.control){
        target = mousehover.control;
    } else if(typeof focus !== 'undefined' && focus){
        target = focus;
    }
    if(target && target.Input && target.Input.Mouse && typeof target.Input.Mouse.wheel === 'function'){
        target.Input.Mouse.wheel(deltaX, deltaY);
    }
}

function onDragEnter(e){
    e.preventDefault();
    onMouseMove(e);
    DragDropManager.dragenter();
}

function onDragOver(e){
    e.preventDefault();
    onMouseMove(e);
    DragDropManager.dragover();
}

function onDragLeave(e){
    e.preventDefault();
    onMouseMove(e);
    DragDropManager.dragleave();
}

function onDrop(e){
    e.preventDefault();
    onMouseMove(e);
    try{
        if(e.dataTransfer){
            dragdrop.data.text = e.dataTransfer.getData('text') || e.dataTransfer.getData('text/plain') || "";
            dragdrop.data.files = (e.dataTransfer.files && e.dataTransfer.files.length) ? e.dataTransfer.files : null;
        }
    }catch(err){ }
    DragDropManager.drop();
}

window.addEventListener("load", () => {
    window.document.addEventListener("mousemove", onMouseMove);
    window.document.addEventListener("mouseup", onMouseUp);
    window.document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("wheel", onWheel);
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    queueNewFrame();
});
