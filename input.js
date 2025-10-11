// Gestion de la souris pour un contrôle
class Mouse {
    constructor(control) {
        this.control = control;
    }
    hover(){
        const control = this.control;
        const form = control.form;
        const children = control.children;
        // En mode drag interne, on ignore le contrôle déplacé et ses descendants pour le survol
        if(typeof dragdrop !== 'undefined' && dragdrop.active){
            // Teste si this.control est le contrôle draggué ou un descendant
            let isDraggedOrDesc = false;
            if(dragdrop.control){
                if(control === dragdrop.control){
                    isDraggedOrDesc = true;
                } else {
                    let p = control.parent;
                    while(p){
                        if(p === dragdrop.control){ isDraggedOrDesc = true; break; }
                        p = p.parent;
                    }
                }
            }
            if(isDraggedOrDesc) return; // ne pas capturer le hover, laisse une chance aux éléments dessous
        }

        mousehover.selected = control;

        if(control.clip === false || (mouse.x >= form.Inside.x + control.x+control.Border.left 
            && mouse.x <= form.Inside.x + control.right-control.Border.right 
            && mouse.y >= form.Inside.y + control.y+control.Border.top 
            && mouse.y <= form.Inside.y + control.bottom-control.Border.bottom
        ))
        {
            if( children !== null )
                for(var i = 0; i < children.length; i++)
                {       
                    if ( children[i].enable && children[i].containMouse() )
                    {
                        children[i].Mouse.hover();
                        return;
                    }
                }
        }
    }
    enter(){}
    leave(){}
    clickLeft(){};
    clickLeftUp(){
        //alert("click");
        this.control.Transformation.Move.scroll(10, 0);
    };
    clickRight(){};
    clickRightUp(){this.control.Transformation.Move.scroll(-10, 0);};
    // Appelé lors d'un mouvement de molette. Par défaut ne fait rien.
    // deltaY > 0 = défilement vers le bas, deltaY < 0 = vers le haut (convention standard)
    // deltaX peut être utilisé pour le défilement horizontal.
    wheel(deltaX, deltaY){ }
}

// Gestion du clavier pour un contrôle
class Keyboard {
    constructor(control) {
        this.control = control;
    }
    // Appelé quand une touche est enfoncée
    onKeyDown(modifiers){ /* surcharge dans les contrôles si besoin */ }
    // Appelé quand une touche est relâchée
    onKeyUp(modifiers){ /* surcharge dans les contrôles si besoin */ }
}
class Input {
    constructor(control) {
        this.control = control;
        this.Mouse;
        this.Keyboard;
    }
}
