import { Core } from './core.js';

export class Move {
    #active = false;
    constructor(control){
        this.control = control;
    }
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
    on(){
        const control = this.control;
        const mouse = Core.mouse;
        const transformation = Core.transformation;
        const x = mouse.x - control.form.Inside.x - transformation.offsetX;
        const y = mouse.y - control.form.Inside.y - transformation.offsetY;

        // Bring the whole ancestry to the absolute front during move
        //if(control && control.Lineage){ control.Lineage.bringHierarchyToFront(control); }

        const parent = control.parent;
        if( parent && parent.clip){ this.to(x, y); }
        else{ this.toIn(x, y); }
    };
    to(x, y){
        const control = this.control;
        const parent = control.parent;
        control.Inside.x = x - parent.Absolute.x - parent.Border.left;
        control.Inside.y = y - parent.Absolute.y - parent.Border.top;
        control.Absolute.x = x;
        control.Absolute.y = y;

        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                control.children[i].Move.parentMove();
    };
    toIn(x, y){
        const control = this.control;
        const parent = control.parent;
        if( x > parent.right - parent.Border.right - control.Size.width ) x = parent.right - control.Size.width - parent.Border.right;
        if( y > parent.bottom - parent.Border.bottom - control.Size.height ) y = parent.bottom - control.Size.height - parent.Border.bottom;
        if( x < parent.Absolute.x + parent.Border.left ) x = parent.Absolute.x + parent.Border.left;
        if( y < parent.Absolute.y + parent.Border.top ) y = parent.Absolute.y + parent.Border.top;
        this.to(x, y);
    };
    parentMove(){
        const control = this.control;
        const parent = control.parent;
        if (parent === null) return;
        const x = parent.Absolute.x + parent.Border.left + control.Inside.x;
        const y = parent.Absolute.y + parent.Border.top + control.Inside.y;
        if (parent.clip === true){ this.to(x, y); }
        else{ this.toIn(x, y); }
    };
    scroll(stepV = 0, stepH = 0){
        const control = this.control;
        if(!control.clip) return;
        if(control.children === null || control.children.length === 0) return;
        if(stepV === 0 && stepH === 0) return;
        
        let distTop = 0;
        let distBottom = 0;
        let distLeft = 0;
        let distRight = 0;

        for(let i = 0; i < control.children.length; i++){
            const ch = control.children[i];
            if( ch.Inside.y < distTop ) distTop = ch.Inside.y;
            if( ch.Inside.y + ch.Size.height > distBottom ) distBottom = ch.Inside.y + ch.Size.height;
            if( ch.Inside.x < distLeft ) distLeft = ch.Inside.x;
            if( ch.Inside.x + ch.Size.width > distRight ) distRight = ch.Inside.x + ch.Size.width;
        }
        
        const visibleHeight = control.Size.height - control.Border.top - control.Border.bottom;
        const visibleWidth = control.Size.width - control.Border.left - control.Border.right;
        if (stepV > 0 && distTop >= 0) stepV = 0;
        if (stepV < 0 && distBottom <= visibleHeight) stepV = 0;
        if (stepH > 0 && distLeft >= 0) stepH = 0;
        if (stepH < 0 && distRight <= visibleWidth) stepH = 0;

        if (stepV > 0 && distTop + stepV > 0) stepV = -distTop;
        if (stepV < 0 && distBottom + stepV < visibleHeight) stepV = visibleHeight - distBottom;
        if (stepH > 0 && distLeft + stepH > 0) stepH = -distLeft;
        if (stepH < 0 && distRight + stepH < visibleWidth) stepH = visibleWidth - distRight;

        for(let i = 0; i < control.children.length; i++){
            const ch = control.children[i];
            ch.Move.to(ch.Absolute.x + stepH, ch.Absolute.y + stepV);
        }
    }
}

export class Resize {
    #active = false;
    constructor(control){
        this.control = control;
    }
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
    on(){
        const control = this.control;
        const parent = control.parent;
        const border = control.Border;
        const mouse = Core.mouse;
        const transformation = Core.transformation;
        let left = control.Absolute.x;
        let top = control.Absolute.y;
        let right = control.Absolute.x + control.Size.width;
        let bottom = control.Absolute.y + control.Size.height;

        let minsizeWidth = border.left + border.right+1 > transformation.border*2 ? border.left + border.right+1 : transformation.border*2;
        let minsizeHeight = border.top + border.bottom+1 > transformation.border*2 ? border.top + border.bottom+1 : transformation.border*2;

        if( transformation.left ){
            left = mouse.x - control.form.Inside.x;
            if( parent !== null && parent.clip === false && left < parent.Absolute.x + parent.Border.left )left = parent.Absolute.x + parent.Border.left;
            if( left > control.right - minsizeWidth )left = control.right - minsizeWidth;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let l = 0; l < control.children.length; l++)
                    if( left + control.children[l].Inside.x + control.children[l].Size.width + border.left + border.right > right )
                        left = right - control.children[l].Inside.x - control.children[l].Size.width - border.left - border.right;
        }
        if( transformation.top ){
            top = mouse.y - control.form.Inside.y;
            if( parent !== null && parent.clip === false && top < parent.Absolute.y + parent.Border.top ) top = parent.Absolute.y + parent.Border.top;
            if( top > control.bottom - minsizeHeight )top = control.bottom - minsizeHeight;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let t = 0; t < control.children.length; t++)
                    if( top + control.children[t].Inside.y + control.children[t].Size.height + border.top + border.bottom > bottom )
                        top = bottom - control.children[t].Inside.y - control.children[t].Size.height - border.top - border.bottom;
        }
        if( transformation.right ){
            right = mouse.x - control.form.Inside.x;
            if( parent !== null && parent.clip === false && right > parent.Absolute.x + parent.Size.width - parent.Border.right ) right =  parent.Absolute.x + parent.Size.width - parent.Border.right;
            if( right < control.Absolute.x + minsizeWidth )right = control.Absolute.x + minsizeWidth;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let r = 0; r < control.children.length; r++)
                    if( left + control.children[r].Inside.x + control.children[r].Size.width + border.left + border.right > right )
                        right = left + control.children[r].Inside.x + control.children[r].Size.width + border.left + border.right;
        }
        if( transformation.bottom ){
            bottom = mouse.y - control.form.Inside.y;
            if( parent !== null && parent.clip === false && bottom > parent.Absolute.y + parent.Size.height - parent.Border.bottom ) bottom = parent.Absolute.y + parent.Size.height - parent.Border.bottom;
            if( bottom < control.Absolute.y + minsizeHeight )bottom = control.Absolute.y + minsizeHeight;

            if( control.children !== null && !control.canScale && control.clip === false )
                for(let b = 0; b < control.children.length; b++)
                    if( top + control.children[b].Inside.y + control.children[b].Size.height + border.top + border.bottom > bottom )
                        bottom = top + control.children[b].Inside.y + control.children[b].Size.height + border.top + border.bottom;
        }
        if(control.clip === true){
            if( right - left -border.left-border.right < 2){
                if( transformation.left )left = control.Absolute.x;
                if( transformation.right )right = control.Absolute.x + control.Size.width;
            }
            if( bottom - top -border.top-border.bottom < 2){
                if( transformation.top )top = control.Absolute.y;
                if( transformation.bottom )bottom = control.Absolute.y + control.Size.height;
            }
        }
        if(control.canScale){
            let width = right - left;
            let height = bottom - top;
            let ratio_width = width / control.Size.width;
            let ratio_height = height / control.Size.height;

            let ratio_size = control.Scale.minimumScale( {width:ratio_width, height:ratio_height} );
            if(transformation.left && ratio_size.width === 1)left = control.Absolute.x;
            if(transformation.top && ratio_size.height === 1)top = control.Absolute.y;
            if(transformation.left || transformation.top)
                control.Scale.moveToScale(left, top);
            control.Scale.to(ratio_size.width, ratio_size.height);
        }
        else{
            if(transformation.left || transformation.top)
                control.Move.to(left, top);
            this.to(right - left, bottom - top);
        }
    }
    to(width, height=width){
        const control = this.control;
        const border = control.Border;
        control.Size.width = width;
        control.Size.height = height;

        if(control.clip === true){
        }

        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                control.children[i].Resize.parentResize();
    }
    parentResize(){}
}

export class Scale {
    #active = false;
    constructor(control){
        this.control = control;
    }
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }
    to(ratio_width, ratio_height){
        const control = this.control;
        const border = control.Border;
        control.Size.width = control.Size.width * ratio_width;
        control.Size.height = control.Size.height * ratio_height;

        border.left = border.left * ratio_width;
        border.right = border.right * ratio_width;
        border.top = border.top * ratio_height;
        border.bottom = border.bottom * ratio_height;

        if(control.clip === true){
        }

        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                control.children[i].Scale.parentScale(ratio_width, ratio_height);
    }
    moveToScale(x, y){
        const control = this.control;
        const parent = control.parent;
        control.Inside.x = parent === null ? x : x - parent.Absolute.x - parent.Border.left;
        control.Inside.y = parent === null ? y : y - parent.Absolute.y - parent.Border.top;
        //control.x = x;
        //control.y = y;
        control.Absolute.x = x;
        control.Absolute.y = y;
    }
    parentScale(ratio_width, ratio_height){
        const control = this.control;
        const parent = control.parent;
        this.moveToScale(parent.Absolute.x + parent.Border.left + (control.Inside.x * ratio_width), parent.Absolute.y + parent.Border.top + (control.Inside.y * ratio_height) );
        this.to(ratio_width, ratio_height);
    }
    minimumScale(ratio_size){
        const control = this.control;
        const border = control.Border;
        if(control.clip === true){
            if( (control.Size.width-border.left-border.right) * ratio_size.width < 2)ratio_size.width = 1;
            if( (control.Size.height-border.top-border.bottom) * ratio_size.height < 2)ratio_size.height = 1;
        }
        if(control.canResize && control.Size.width * ratio_size.width < 2)ratio_size.width = 1;
        else if(control.Size.width * ratio_size.width < 2)ratio_size.width = 1;
        if(control.canResize && control.Size.height * ratio_size.height < 2)ratio_size.height = 1;
        else if(control.Size.height * ratio_size.height < 2)ratio_size.height = 1;
        if( control.children !== null )
            for(let i = 0; i < control.children.length; i++)
                ratio_size = control.children[i].Scale.minimumScale(ratio_size);
        return ratio_size;
    }

}

export class Transformation {
    constructor(control){
        this.control = control;
        this.Move;
        this.Resize;
        this.Scale;
    }
    on(){
        const control = this.control;
        const mouse = Core.mouse;
        const transformation = Core.transformation;
        if(  transformation.left || transformation.top || transformation.right || transformation.bottom ){
            transformation.control = control;
            transformation.resize = true;
        }else if( control.canMove ){
            transformation.control = control;
            transformation.offsetX = mouse.x - control.form.Inside.x - control.Absolute.x;
            transformation.offsetY = mouse.y - control.form.Inside.y - control.Absolute.y;
        }else if( control.parent !== null ){
            control.parent.Transformation.on();
        }
    }
}
