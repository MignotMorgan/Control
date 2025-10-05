// runtime.js
// Boucle d'animation et attachement des événements navigateur

// Configuration centrale fournie par config.js via window.Config

// Drag & Drop: utilisation de la classe statique DragDropManager (pas d'instanciation)

function cjsLoop(){
    for(let i = 0; i < controls.length; i++){
        controls[i].paint.clear();
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

// Gestionnaires d'événements et logique d'interaction
/**
 * Gestion du déplacement de la souris: met à jour la position, le survol,
 * gère le drag interne (feedback + détection cible) et l'auto-scroll.
 */
function onMouseMove(e){
    // Position souris standard (client) + défilement page
    let x = e.clientX + (document.documentElement.scrollLeft || window.pageXOffset || 0);
    let y = e.clientY + (document.documentElement.scrollTop || window.pageYOffset || 0);
    
    mouse.x = x;
    mouse.y = y;

    mousehover.selected = null;
    for(let i = controls.length - 1; i >= 0; i--)
        if( controls[i].contains(mouse.x, mouse.y) )
            controls[i].Mouse.hover();

    if( mousehover.control != mousehover.selected )
    {
        if( mousehover.control != null )
        {
            mousehover.control.Mouse.leave();
        }
        if( mousehover.selected != null )
        {
            mousehover.selected.Mouse.enter();
        }
        mousehover.control = mousehover.selected;
    }

    if(dragdrop.active && dragdrop.control){
        DragDropManager.move();
    }
    DragDropManager.maybeActivate();

    if(transformation.control == null)
    {
        transformation.left = false;
        transformation.right = false;
        transformation.top = false;
        transformation.bottom = false;
        
        if( mousehover.control != null && mousehover.control.canResize )
        {
            if(mouse.x <= mousehover.control.form.Inside.x + mousehover.control.x + transformation.border)transformation.left = true;
            if(mouse.y <= mousehover.control.form.Inside.y + mousehover.control.y + transformation.border)transformation.top = true;
            if(mouse.x >= mousehover.control.form.Inside.x + mousehover.control.x + mousehover.control.width - transformation.border)transformation.right = true;
            if(mouse.y >= mousehover.control.form.Inside.y + mousehover.control.y + mousehover.control.height - transformation.border)transformation.bottom = true;
        }
    }
    else if( transformation.resize ) 
    {
        if(transformation.lock)return;
        transformation.lock = true;
        transformation.control.Transformation.Resize.on();
        transformation.lock = false;
    }
    else { transformation.control.Transformation.Move.on(); }

    // Mise à jour du curseur selon le contexte (resize/move/drag/default)
    let cursor = "default";
    if(transformation.control == null && mousehover.control && mousehover.control.canResize){
        const L = transformation.left, R = transformation.right, T = transformation.top, B = transformation.bottom;
        if((L && T) || (R && B)) cursor = "nwse-resize";
        else if((R && T) || (L && B)) cursor = "nesw-resize";
        else if(L || R) cursor = "ew-resize";
        else if(T || B) cursor = "ns-resize";
        //else if(mousehover.control.canMove) cursor = "move";
    } else if(dragdrop.active){
        //cursor = "grabbing";
    } else if(mousehover.control && mousehover.control.canMove){
        //cursor = "move";
    }
    document.body.style.cursor = cursor;
}

/** Clic gauche: focus, armement éventuel du drag interne, clic gauche sinon */
function onMouseDownLeft(e){
    if( mousehover.control != null)
    {
        mousehover.control.onFocus();
        // Armer un drag interne s'il est autorisé (activation au mouvement si seuil dépassé)
        if(mousehover.control.canDrag){
            DragDropManager.start();
            // Ne pas déclencher de clic immédiat: on décidera au mouseup si c'est un drag ou un clic
        } else {
            // Comportement clic standard quand pas de drag armé
            mousehover.control.Mouse.clickLeft();
        }
    }
    return false;
}
/** Relâchement clic gauche: fin de drag, tentative de drop, ou clic gauche up */
function onMouseUpLeft(e){
    transformation.control = null;
    transformation.resize = false;
    // Si un drag était armé mais n'a pas été activé, simule un clic sur le contrôle armé
    let consumedClick = false;

        if(dragdrop.armed && !dragdrop.active && dragdrop.control){
            dragdrop.control.Mouse.clickLeft();
            dragdrop.control.Mouse.clickLeftUp();
            consumedClick = true;
            DragDropManager.reset();
        }
  
    if( !consumedClick && mousehover.control != null)
        mousehover.control.Mouse.clickLeftUp();
    // Si un drag interne est actif, on délègue le drop au manager

        if(dragdrop.active && dragdrop.control){
            DragDropManager.dropControl(mouse.x, mouse.y);
        }

    return false;
}
/** Clic droit: focus + menu (clickRight) + préparation transformation */
function onMouseDownRight(e){
    if( mousehover.control != null)
    {
        mousehover.control.onFocus();
        mousehover.control.Mouse.clickRight();
        mousehover.control.Transformation.on();
        return false;
    }
    return false;
}
/** Relâchement clic droit */
function onMouseUpRight(e){
    mouse.time = mouse.up - mouse.down;

    if( mousehover.control != null)
        mousehover.control.Mouse.clickRightUp();
    onClear();
    return false;
};

/** Répartiteur général mousedown: droit vs gauche */
function onMouseDown(e){
    mouse.down = Date.now();

    if (e.button === 2) { onMouseDownRight(e); }
    else { onMouseDownLeft(e); }
}
/** Répartiteur général mouseup: droit vs gauche */
function onMouseUp(e){
    mouse.up = Date.now();
    mouse.time = mouse.up - mouse.down;

    if (e.button === 2){ onMouseUpRight(e); }
    else { onMouseUpLeft(e); }
}
/** Réinitialise l'état de transformation */
function onClear(){
    transformation.control = null;
    transformation.resize = false;
    transformation.lock = false;
};

/** Gestion des touches enfoncées (keydown) */
function onKeyDown(e){
    // Met à jour l'état des modificateurs
    Modifiers.shift = e.shiftKey;
    Modifiers.ctrl = e.ctrlKey;
    Modifiers.alt = e.altKey;
    Modifiers.meta = e.metaKey;
    Modifiers.keyCode = e.keyCode ? e.keyCode : e.which;
    if(e.key === 'CapsLock') Modifiers.capslock = !Modifiers.capslock;
    Modifiers.key = e.key;
    // Construit une chaîne de raccourci simple (ex: Ctrl+Shift+S)
    const parts = [];
    if(Modifiers.ctrl) parts.push('Ctrl');
    if(Modifiers.shift) parts.push('Shift');
    if(Modifiers.alt) parts.push('Alt');
    if(Modifiers.meta) parts.push('Meta');
    // N'ajoute la touche que si elle est imprimable ou une touche standard
    if(e.key && e.key.length > 0) parts.push(e.key);
    Modifiers.shortcut = parts.join('+');

    // Délègue au contrôle ayant le focus s'il existe
    if(typeof focus !== 'undefined' && focus !== null && focus.Input && focus.Input.Keyboard && typeof focus.Input.Keyboard.onKeyDown === 'function'){
        focus.Input.Keyboard.onKeyDown(Modifiers);
    }
}

/** Gestion des touches relâchées (keyup) */
function onKeyUp(e){
    Modifiers.shift = e.shiftKey;
    Modifiers.ctrl = e.ctrlKey;
    Modifiers.alt = e.altKey;
    Modifiers.meta = e.metaKey;
    Modifiers.keyCode = e.keyCode ? e.keyCode : e.which;
    Modifiers.key = e.key;
    if(typeof focus !== 'undefined' && focus !== null && focus.Input && focus.Input.Keyboard && typeof focus.Input.Keyboard.onKeyUp === 'function'){
        focus.Input.Keyboard.onKeyUp(Modifiers);
    }
}

// Gestionnaire global de la molette
function onWheel(e){
    // Normalise le delta sur la base de l'événement standard 'wheel'
    // La plupart des navigateurs fournissent deltaY (positif = vers le bas)
    let deltaX = 0;
    let deltaY = 0;
    if('deltaY' in e || 'deltaX' in e){
        deltaX = e.deltaX || 0;
        deltaY = e.deltaY || 0;
    } else if('wheelDelta' in e){
        // Ancien WebKit: wheelDelta positif vers le haut, on inverse pour respecter la convention
        deltaY = -e.wheelDelta;
    } else if('detail' in e){
        // Ancien Firefox: detail positif vers le bas par incréments de 3
        deltaY = e.detail * 16; // approx pour rapprocher de pixels
    }

    // Route vers le contrôle sous la souris en priorité, sinon vers le focus
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

// Gestionnaire global du drag & drop
function onDragEnter(e){
    e.preventDefault();
    // Pendant un drag, mousemove n'est pas toujours émis: on met à jour la position et le hover
    if (typeof onMouseMove === 'function') onMouseMove(e);
    DragDropManager.dragenter();
}
function onDragOver(e){
    e.preventDefault();
    // Met à jour la position et le contrôle survolé pendant le drag
    if (typeof onMouseMove === 'function') onMouseMove(e);
    DragDropManager.dragover();
}

function onDragLeave(e){
    e.preventDefault();
    // Met à jour la position (facultatif) puis notifie le contrôle courant
    if (typeof onMouseMove === 'function') onMouseMove(e);
    DragDropManager.dragleave();
}

function onDrop(e){
    e.preventDefault();
    // Pendant le drop, mettre à jour la position/hover
    if (typeof onMouseMove === 'function') onMouseMove(e);
    try{
        if(e.dataTransfer){
            dragdrop.data.text = e.dataTransfer.getData('text') || e.dataTransfer.getData('text/plain') || "";
            dragdrop.data.files = (e.dataTransfer.files && e.dataTransfer.files.length) ? e.dataTransfer.files : null;
        }
    }catch(err){ /* certains navigateurs restreignent l'accès */ }
    dragdrop.target = mousehover.control ? mousehover.control : (typeof focus !== 'undefined' ? focus : null);
    DragDropManager.drop();
}





window.addEventListener("load", () => {
    // Attache les événements souris/clavier
    window.document.addEventListener("mousemove", onMouseMove);
    window.document.addEventListener("mouseup", onMouseUp);
    window.document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    // Molette
    window.addEventListener("wheel", onWheel);
    // Drag & Drop global
    window.addEventListener("dragenter", onDragEnter); // Début du survol d'une zone de dépôt: autorise le drop et notifie le contrôle courant
    window.addEventListener("dragover", onDragOver);   // Survol continu pendant le drag: empêche le défaut et met à jour position/hover
    window.addEventListener("dragleave", onDragLeave);  // Sortie de la zone de dépôt: nettoie l'état de survol
    window.addEventListener("drop", onDrop);            // Lâcher effectif: récupère texte/fichiers et délègue le drop au contrôle ciblé

    // Démarre la boucle d'animation
    queueNewFrame();
});
