/**
 * Responsabilité: dessin d'un contrôle et de ses enfants.
 * Gère optionnellement un clipping via une surface de peinture offscreen (this.clip).
 */
class Draw {
    #Paint;
    constructor(control) {
        this.control = control;
        this.#Paint = null;
        this.#clip = false;
    }
    // Champ privé
    #clip;
    /**
     * Indique si le contrôle doit clipper (masquer) le rendu de ses enfants
     * dans sa zone intérieure (zone utile = taille - bordures).
     * Terme: «clipping» = découper/limiter le dessin à un rectangle.
     */
    get clip(){ return this.#clip === true; }
    set clip(value){ this.#clip = !!value; }

    /**
     * Renvoie la surface de peinture (canvas abstrait) à utiliser:
     * - si un Paint local est défini, l'utiliser
     * - sinon, récupérer celui de la `form` par défaut
     */
    get Paint(){
        if(this.#Paint !== null) return this.#Paint;
        const form = this.control && this.control.form;
        if(form && form.Draw && form.Draw.Paint != null) return form.Draw.Paint; 
        return null;//undefined;
    }
    set Paint(value){ this.#Paint = value; }    
    // Exécute le dessin du contrôle, puis de ses enfants (avec ou sans clipping)
    /**
     * Exécute le rendu du contrôle:
     * - paint,x,y optionnels permettent un rendu relatif (appel depuis un parent)
     * - si un clip est actif, les enfants sont dessinés dans la surface offscreen
     */
    execute(){ //paint, x, y) {
        const control = this.control;
        const paint = this.Paint;
        //const x = control.x;
        //const y = control.y;

//        if(paint === null || paint === undefined)
//            this.draw(control.form.paint, control.x, control.y, control.width, control.height);
//        else
        this.draw(paint, control.Absolute.x, control.Absolute.y, control.width, control.height);

        if(this.#clip === true){
            // Détermine le paint cible et le rect de clip dans le repère du paint
            const B = control.Border;
            const ix = control.Absolute.x + B.left;
            const iy = control.Absolute.y + B.top;
            const iw = control.width - B.left - B.right;
            const ih = control.height - B.top - B.bottom;
            // On demande au moteur de peinture de ne dessiner les enfants
            // qu'à l'intérieur du rectangle (clipping temporaire via callback)
            paint.clipRectangle(ix, iy, iw, ih, () => { this.drawChildren(); });
        }else{
            this.drawChildren();
        }
    }
    /**
     * Dessine récursivement les enfants.
     * Remarque: l'ordre d'empilement (z-order) est géré par l'ordre dans `children`.
     */
    drawChildren(){
        const control = this.control;
        const children = control.children;
        if(children != null)
            for(let i = 0; i < children.length; i++)
               // if(children[i] !== dragdrop.control)
                    children[i].Draw.execute();
    }

    // Dessine le cadre du contrôle (bords + intérieur) et des repères visuels
    /**
     * Pipeline de rendu d'un contrôle:
     * 1) `drawBaseFrame`: bordures extérieures (ou image nine-slice si définie)
     * 2) `drawBackground`: fond de la zone intérieure
     * 3) feedback drag & drop et poignées de redimensionnement
     * Terme: «nine-slice» = image découpe 9 zones pour redimensionner la bordure
     * sans déformer les coins.
     */
    draw(paint, x, y, width, height){
        const state = this.computeVisualState();
        this.drawBaseFrame(paint, x, y, width, height, state);
        this.drawBackground(paint, x, y, width, height, state);
        //this.drawInnerBorder(paint, x, y, width, height, state);
        //this.drawHoverOutline(paint, x, y, width, height, state);
        this.drawDragDropFeedback(paint, x, y, width, height, state);
        this.drawResizeHandles(paint, x, y, width, height, state);
    }

    // Fond
    /**
     * Peint le fond de la zone «Inside» du contrôle.
     * - Peut être une couleur, un motif répété, ou une image ajustée.
     */
    drawBackground(paint, x, y, width, height, state){
        const control = this.control;
        const inside = control.Rectangle.rectangleBackground();
        const theme = state.theme;
/*
        const t = state.theme.background;
        if(t && t.image){
            // Si repeat est défini, on utilise un pattern; sinon on ajuste l'image selon size
            if(t.repeat){
//                console.log("drawBackground repeat");
                paint.drawPatternImage(t.image, inside.x, inside.y, inside.width, inside.height, { repeat: t.repeat, offsetX: t.offsetX||0, offsetY: t.offsetY||0 });
            } else {
 //               console.log("drawBackground fit");
                paint.drawImageFitting(t.image, inside.x, inside.y, inside.width, inside.height, t.size || 'stretch');
            }
        } else {
//            console.log("drawBackground", inside.x, inside.y, inside.width, inside.height, t.color);
            paint.drawRectangle(inside.x, inside.y, inside.width, inside.height, t.color);
        }
*/
            paint.drawRectangle(inside.x, inside.y, inside.width, inside.height, "blue");//theme.background.color);
    }






    // Construit un état visuel unique utilisé par toutes les sous-fonctions
    /**
     * Construit un état visuel commun pour toutes les étapes du rendu:
     * - hover, drag & drop, redimensionnement, taille des poignées, thème.
     */
    computeVisualState(){
        const control = this.control;
        const st = {
            hovered: false,
            drag: { active:false, isSource:false, isTarget:false, invalid:false },
            resize: { active:false, left:false, top:false, right:false, bottom:false },
            handleSize: 8,
            theme: this.getTheme()
        };
        // Hover (ignoré visuellement pendant un drag actif)
        if(typeof mousehover !== 'undefined' && mousehover && mousehover.control === control){
            st.hovered = true;
        }
        // Drag & Drop via état global `dragdrop`
        if (typeof dragdrop !== 'undefined'){
            const src = dragdrop.control;
            const tgt = dragdrop.target;
            st.drag.active = !!dragdrop.active;
            st.drag.isSource = !!src && src === control;
            st.drag.isTarget = !!tgt && tgt === control;
            const overThis = (typeof mousehover !== 'undefined' && mousehover && mousehover.control === control);
            const invalid = (!control.canDrop) || (src && src === control);
            st.drag.invalid = st.drag.active && overThis && invalid;
        }
        // Transformation / redimensionnement
        if(typeof transformation !== 'undefined' && transformation && transformation.control === control){
            st.resize.active = !!transformation.resize;
            st.resize.left = !!transformation.left;
            st.resize.top = !!transformation.top;
            st.resize.right = !!transformation.right;
            st.resize.bottom = !!transformation.bottom;
        }
        // Taille des poignées
        if(typeof Config !== 'undefined' && Config && Config.RESIZE_HANDLE_SIZE){
            st.handleSize = Config.RESIZE_HANDLE_SIZE;
        }
        return st;
    }

    // Thème par défaut + surcharge instance (this.theme) ou control.theme
    /**
     * Retourne le thème effectif en fusionnant:
     * - valeurs par défaut
     * - surcharges au niveau `this.theme` ou `control.theme`
     * Terme: merge «shallow»/«deep» contrôlé: on évite de descendre dans
     * les objets non-plain (ex: `HTMLImageElement`).
     */
    getTheme(){
        const control = this.control;
        const defaults = {
            base: { borderColor: "#000", lineWidth: 1, borderImage: null /* { image, slice:{t,r,b,l}, widths:{t,r,b,l}, fillCenter:true } */ },
            background: { color: "white", image: null, repeat: 'repeat', size: 'stretch', offsetX: 0, offsetY: 0 },
            innerBorder: { color: "grey", lineWidth: 1 },
            hover: { color: "red", lineWidth: 2, dash: [6,4] },
            drop: {
                target: { color: "#00c853", lineWidth: 3 },
                invalid: { color: "#d50000", lineWidth: 2, dash: [4,3] }
            },
            drag: {
                sourceGhost: { fill: "#2979ff", stroke: "#2979ff", alpha: 0.35, lineWidth: 2, dash: [3,2] }
            },
            resize: {
                handleFill: "#ffffff",
                handleStroke: "#2979ff"
            }
        };
        const override = this.theme || (control && control.theme) || {};
        // Merge avec garde: ne pas descendre dans les objets non "plain" (ex: HTMLImageElement)
        function isPlainObject(obj){ return obj && typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype; }
        function merge(a,b){
            const o = { ...a };
            for(const k in b){
                const bv = b[k];
                const av = a ? a[k] : undefined;
                if(isPlainObject(bv)) o[k] = merge(isPlainObject(av) ? av : {}, bv);
                else o[k] = bv;
            }
            return o;
        }
        return merge(defaults, override);
    }

    // Cadre externe standard
    /**
     * Dessine la bordure externe:
     * - soit via une image «nine-slice» si `state.theme.base.borderImage` est défini
     * - sinon via des rectangles/bordure simple
     */
    drawBaseFrame(paint, x, y, width, height, state){
        const control = this.control;
        const t = state.theme.base;
        // Border image (nine-slice) si fourni: ne peindre que la bordure, pas le centre
        if(t && t.borderImage && t.borderImage.image){
            const bi = t.borderImage;
            const slice = bi.slice || { top:0, right:0, bottom:0, left:0 };
            // Largeurs de destination: par défaut, utiliser l'épaisseur de la bordure du contrôle
            const B = control.Border;
            const wds = bi.widths || { top:B.top, right:B.right, bottom:B.bottom, left:B.left };
            paint.drawNineSlice(
                bi.image,
                x, y, width, height,
                { top:slice.top||0, right:slice.right||0, bottom:slice.bottom||0, left:slice.left||0 },
                { top:wds.top||0, right:wds.right||0, bottom:wds.bottom||0, left:wds.left||0 },
                false // fillCenter=false: n'utiliser l'image que sur la bordure
            );
        } else {
            const b = control.Border;
            const c = "red"
            paint.drawRectangle(x, y, width, b.top, c);
            paint.drawRectangle(x, y, b.left, height, c);
            paint.drawRectangle(x+width-b.right, y, b.right, height, c);
            paint.drawRectangle(x, y+height-b.bottom, width, b.bottom, c);
            paint.borderRectangleStyled(x, y, width, height, { color: t.borderColor, lineWidth: t.lineWidth });
        }
    }


    // Bordure intérieure de la zone utile (Inside)
    /**
     * Dessine la bordure intérieure de la zone «Inside» (utile pour le debug/thème).
     */
    drawInnerBorder(paint, x, y, width, height, state){
        const control = this.control;
        const t = state.theme.innerBorder;
        paint.borderRectangleStyled(
            x+control.Border.left,
            y+control.Border.top,
            control.width-control.Border.left-control.Border.right,
            control.height-control.Border.top-control.Border.bottom,
            { color: t.color, lineWidth: t.lineWidth }
        );
    }

    // Surbrillance au survol (désactivée pendant un drag actif)
    /**
     * Surbrillance lors du survol (non affichée durant un drag actif).
     */
    drawHoverOutline(paint, x, y, width, height, state){
        if(!state.drag.active && state.hovered){
            const t = state.theme.hover;
            paint.borderRectangleStyled(x, y, width, height, { color: t.color, lineWidth: t.lineWidth, dash: t.dash });
        }
    }

    // Feedback Drag & Drop (cible valide/invalide, ghost de la source)
    /**
     * Indications visuelles pour le drag & drop:
     * - cible valide/incorrecte, et «ghost» de la source.
     * Terme: «alpha» = opacité; une alpha plus faible rend l'élément translucide.
     */
    drawDragDropFeedback(paint, x, y, width, height, state){
        if(state.drag.active){
            const td = state.theme.drop;
            if(state.drag.isTarget){
                paint.borderRectangleStyled(x, y, width, height, { color: td.target.color, lineWidth: td.target.lineWidth });
            } else if(state.drag.invalid){
                paint.borderRectangleStyled(x, y, width, height, { color: td.invalid.color, lineWidth: td.invalid.lineWidth, dash: td.invalid.dash });
            }
            if(state.drag.isSource){
                const tg = state.theme.drag.sourceGhost;
                paint.withAlpha(tg.alpha, ()=>{
                    paint.drawRectangle(x, y, width, height, tg.fill);
                });
                paint.borderRectangleStyled(x, y, width, height, { color: tg.stroke, lineWidth: tg.lineWidth, dash: tg.dash });
            }
        }
    }

    // Poignées de redimensionnement
    /**
     * Dessine les poignées de redimensionnement (8 carrés autour du contrôle)
     * lorsque le contrôle est survolé ou en cours de transformation.
     */
    drawResizeHandles(paint, x, y, width, height, state){
        const control = this.control;
        const showHandles = control.canResize && (
            (typeof mousehover !== 'undefined' && mousehover && mousehover.control === control) ||
            (typeof transformation !== 'undefined' && transformation && transformation.control === control)
        );
        if(!showHandles) return;
        const hs = state.handleSize;
        const half = Math.floor(hs/2);
        const left = x;
        const right = x + width;
        const top = y;
        const bottom = y + height;
        const cx = x + Math.floor(width/2);
        const cy = y + Math.floor(height/2);
        const handles = [
            [left, top],           // TL
            [cx, top],             // T
            [right, top],          // TR
            [right, cy],           // R
            [right, bottom],       // BR
            [cx, bottom],          // B
            [left, bottom],        // BL
            [left, cy]             // L
        ];
        const t = state.theme.resize;
        paint.withAlpha(0.9, ()=>{
            for(let i=0;i<handles.length;i++){
                const hx = handles[i][0] - half;
                const hy = handles[i][1] - half;
                paint.drawRectangle(hx, hy, hs, hs, t.handleFill);
                paint.borderRectangle(hx, hy, hs, hs, t.handleStroke);
            }
        });
    }
}
/**
 * Variante de Draw pour la Form: adapte l'ordre de dessin (arrière->avant)
 * et affiche des informations de débogage (souris, transformation).
 */
class DrawForm extends Draw{
    constructor(control){
        super(control);
    }
    /**
     * Dessin de la Form:
     * - dessine le cadre légèrement inset (x+1,y+1,width-2,height-2)
     * - affiche des informations de debug (positions souris, états transformation/dragdrop)
     */
    draw(paint, x, y, width, height){
        super.draw(paint, x+1, y+1, width-2, height-2);
        // Affichage d'informations utiles pour le débogage
        let ix = 20 // position X du texte
        let iy = 20; // position Y du texte (ligne de base)
        paint.drawText(ix, iy, "souris : " + mouse.x + " : " + mouse.y + " temps : " + mouse.time);
        if(mousehover.control != null && mousehover.selected != null)
        {
            iy += 20;
            paint.drawText(ix, iy, "souris dans le contrôle : " + (mouse.x - mousehover.control.form.Inside.x - mousehover.control.Absolute.x) + " : " + (mouse.y - mousehover.control.form.Inside.y - mousehover.control.Absolute.y));
            iy += 20;
            paint.drawText(ix, iy, "mousehover : " + mousehover.control.id + " X: " + mousehover.control.Inside.x + " Y: " + mousehover.control.Inside.y + " width: " + mousehover.control.width + " height: " + mousehover.control.height + " parent: " + (mousehover.control.parent === null ? "null" : mousehover.control.parent.id));
        }
        iy += 20;
        if(transformation.control != null)
            paint.drawText(ix, iy, "transformation : " + transformation.control.id + " redim: " + transformation.resize + " gauche: " + transformation.left + " haut: " + transformation.top + " droite: " + transformation.right + " bas: " + transformation.bottom);
        else
            paint.drawText(ix, iy, "transformation : null");

        iy += 20;
        paint.drawText(ix, iy, "armed: " + dragdrop.armed + " active: " + dragdrop.active + " control: " + (dragdrop.control === null ? "null" : dragdrop.control.id) + " parent: " + (dragdrop.parent === null ? "null" : dragdrop.parent.id) + " target: " + (dragdrop.target === null ? "null" : dragdrop.target.id));
        // (HUD drag temporaire retiré)
    }
    /**
     * Dessin des enfants de la Form en ordre inverse (arrière -> avant),
     * puis dessin d'un éventuel contrôle en cours de drag en dernier.
     */
    drawChildren(paint, x, y)
    {
        const control = this.control;
        const children = control.children;
        if( children != null )
            for(let i = children.length - 1; i >= 0 ; i--)
                if ( children[i] != null && children[i].visible )
                    children[i].Draw.execute(paint, x, y);
    
        if(dragdrop.control != null)dragdrop.control.Draw.execute(paint, x, y);
    };
}
