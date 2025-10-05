/**
 * Abstraction de dessin: définit l'API minimale pour dessiner et gérer un support graphique.
 * Implémentations possibles: Canvas 2D, WebGL, etc.
 *
 * @abstract
 */
class Paint{
    /**
     * Classe abstraite représentant un contexte de dessin.
     * Toutes les méthodes de dessin sont implémentées dans les classes concrètes
     * comme PaintCanvas (basée sur Canvas 2D).
     */
    constructor(x, y, width, height, hide = false){
        this.hide = hide;
    }

    // State accessors (must be implemented by subclass)
    get font(){ throw new Error('Paint.font getter must be implemented by the subclass'); }
    set font(value){ throw new Error('Paint.font setter must be implemented by the subclass'); }
    get textbaseline(){ throw new Error('Paint.textbaseline getter must be implemented by the subclass'); }
    set textbaseline(value){ throw new Error('Paint.textbaseline setter must be implemented by the subclass'); }
    get fillColor(){ throw new Error('Paint.fillColor getter must be implemented by the subclass'); }
    set fillColor(value){ throw new Error('Paint.fillColor setter must be implemented by the subclass'); }

    clear(){ throw new Error('Paint.clear() must be implemented by the subclass'); }
    save(){ throw new Error('Paint.save() must be implemented by the subclass'); }
    restore(){ throw new Error('Paint.restore() must be implemented by the subclass'); }
    move(x, y){ throw new Error('Paint.move(x, y) must be implemented by the subclass'); }
    resize(width, height){ throw new Error('Paint.resize(width, height) must be implemented by the subclass'); }
    measureText(text){ throw new Error('Paint.measureText(text) must be implemented by the subclass'); }
    cutText(text, width){ throw new Error('Paint.cutText(text, width) must be implemented by the subclass'); }
    drawPaint(paint, x, y){ throw new Error('Paint.drawPaint(paint, x, y) must be implemented by the subclass'); }
    borderRectangle(x, y, width, height, color = 'black'){ throw new Error('Paint.borderRectangle(...) must be implemented by the subclass'); }
    drawRectangle(x, y, width, height, color = 'black'){ throw new Error('Paint.drawRectangle(...) must be implemented by the subclass'); }
    borderCircle(x, y, radius, color = 'black'){ throw new Error('Paint.borderCircle(...) must be implemented by the subclass'); }
    drawCircle(x, y, radius, color = 'black'){ throw new Error('Paint.drawCircle(...) must be implemented by the subclass'); }
    drawLine(x1, y1, x2, y2, color = 'black'){ throw new Error('Paint.drawLine(...) must be implemented by the subclass'); }
    borderText(x, y, text, color = 'black'){ throw new Error('Paint.borderText(...) must be implemented by the subclass'); }
    drawText(x, y, text, options = {}){ throw new Error('Paint.drawText(...) must be implemented by the subclass'); }
    drawTextBackground(x, yTop, text, options = {}){ throw new Error('Paint.drawTextBackground(...) must be implemented by the subclass'); }
    borderRectangleStyled(x, y, width, height, options = {}){ throw new Error('Paint.borderRectangleStyled(...) must be implemented by the subclass'); }
    withAlpha(alpha, fn){ throw new Error('Paint.withAlpha(alpha, fn) must be implemented by the subclass'); }
    clipRectangle(x, y, width, height, fn){ throw new Error('Paint.clipRectangle(x, y, width, height, fn) must be implemented by the subclass'); }
    createPattern(image, repeat = 'repeat'){ throw new Error('Paint.createPattern(...) must be implemented by the subclass'); }
    drawPatternImage(image, x, y, w, h, options = {}){ throw new Error('Paint.drawPatternImage(...) must be implemented by the subclass'); }
    drawImageFitting(image, x, y, w, h, mode = 'stretch'){ throw new Error('Paint.drawImageFitting(...) must be implemented by the subclass'); }
    drawNineSlice(image, x, y, w, h, slice, widths, fillCenter = true){ throw new Error('Paint.drawNineSlice(...) must be implemented by the subclass'); }
    dispose(){ throw new Error('Paint.dispose() must be implemented by the subclass'); }
}

/**
 * Implémentation basée sur Canvas 2D (HTMLCanvasElement + 2D context).
 * Crée un <canvas> positionné en absolu et expose des primitives de dessin.
 */
class PaintCanvas extends Paint{
    constructor(x, y, width, height, hide = false){
        super(x, y, width, height, hide);
        // Crée et configure un élément <canvas>
        this.canvas = document.createElement('canvas');
        if(this.hide)
            this.canvas.style.display = 'none';
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = x+"px";
        this.canvas.style.top = y+"px";
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.oncontextmenu = ()=> { return false; };
        this.context = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
        // Caches simples pour patterns et mesures
        this._patternCache = new Map(); // key: imageId|repeat -> CanvasPattern
        this.default();
    }
    // Getter/Setter for font (replaces previous font(font) method)
    get font(){ return this.context.font; }
    set font(value){ this.context.font = value; }
    // Getter/Setter for textBaseline
    get textbaseline(){ return this.context.textBaseline; }
    set textbaseline(value){ this.context.textBaseline = value; }
    // Getter/Setter for fill color (fillStyle)
    get fillColor(){ return this.context.fillStyle; }
    set fillColor(value){ this.context.fillStyle = value; }

    /**
     * Efface l'intégralité de la surface de rendu.
     * Utilise clearRect sur toute la zone du canvas.
     */
    clear(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    save(){ this.context.save(); }
    restore(){ this.context.restore(); }
    /**
     * Réinitialise les paramètres graphiques du contexte 2D aux valeurs par défaut
     * (couleurs, police, alpha, jonctions de lignes, etc.).
     */
    default(){
        const ctx = this.context;
        ctx.fillStyle = "#000000";
        ctx.filter = "none";
        ctx.font = "10px sans-serif";
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.imageSmoothingEnabled = true;
        ctx.lineCap = "butt";
        ctx.lineDashOffset = 0;
        ctx.lineJoin = "miter";
        ctx.lineWidth = 1;
        ctx.miterLimit = 10;
        ctx.shadowBlur = 0;
        ctx.shadowColor = "rgba(0, 0, 0, 0)";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = "#000000";
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
    }
    /**
     * Déplace la position CSS du canvas dans la page.
     * @param {number} x - Nouvelle position gauche en pixels.
     * @param {number} y - Nouvelle position haut en pixels.
     */
    move(x, y){
        this.canvas.style.left = x+"px";
        this.canvas.style.top = y+"px";
    }    
    /**
     * Redimensionne le canvas (attributs width/height), réinitialisant implicitement le contexte.
     * @param {number} width - Largeur en pixels.
     * @param {number} height - Hauteur en pixels.
     */
    resize(width, height){
        this.canvas.width = width;
        this.canvas.height = height;
    }
    // Deprecated: use setter paint.font = value
    measureText(text){ return this.context.measureText(text); }
    /**
     * Coupe une chaîne pour qu'elle tienne dans une largeur donnée en utilisant measureText.
     * @param {string} text - Texte d'entrée.
     * @param {number} width - Largeur maximale en pixels.
     * @returns {[string,string]} - [tête coupée, reste].
     */
    cutText(text, width){
        // Cas limites
        if(!text || text.length === 0) return ["", ""];
        if(!(width > 0)) return ["", text];

        const ctx = this.context;
        const full = ctx.measureText(text).width;
        if(full <= width) return [text, ""];

        // Recherche binaire de la plus grande coupe qui tient
        let lo = 0;              // tient
        let hi = text.length;    // ne tient pas (on sait que full > width)
        while(lo < hi){
            const mid = Math.floor((lo + hi + 1) / 2);
            const w = ctx.measureText(text.slice(0, mid)).width;
            if(w <= width){
                lo = mid; // mid tient
            } else {
                hi = mid - 1; // mid ne tient pas
            }
        }
        // lo est la plus grande longueur qui tient (peut être 0 si rien ne tient)
        const head = text.slice(0, lo);
        const tail = text.slice(lo);
        return [head, tail];
    }
    /**
     * Dessine un autre Paint (offscreen, clip) à la position donnée.
     */
    drawPaint(paint, x, y){
        this.context.drawImage(paint.canvas, x, y);        
    }
    /**
     * Trace un rectangle en contour simple.
     */
    borderRectangle(x, y, width, height, color = "black"){
        this.context.strokeStyle = color;
        this.context.strokeRect(x, y, width, height);
    }
    /**
     * Remplit un rectangle d'une couleur unie.
     */
    drawRectangle(x, y, width, height, color = "black"){
        const ctx = this.context;
        const prevFill = ctx.fillStyle;
        try{
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        } finally {
            ctx.fillStyle = prevFill;
        }
    }
    drawLine(x1, y1, x2, y2, color = "black"){
        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }
    /**
     * Trace un cercle en contour.
     */
    borderCircle(x, y, radius, color = "black"){
        const ctx = this.context;
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    /**
     * Remplit un cercle d'une couleur unie.
     */
    drawCircle(x, y, radius, color = "black"){
        const ctx = this.context;
        ctx.beginPath();
        ctx.lineWidth=2;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }
    /**
     * Trace le contour d'un texte à la position indiquée.
     */
    borderText(x, y, text, color = "black"){
        this.context.strokeStyle = color;
        this.context.strokeText(text, x, y);
    }
    /**
     * Dessine un fond de sélection derrière un texte (sans dessiner le texte lui-même).
     * Utilise measureText pour calculer la largeur du rectangle.
     * options: { color="#c5cae9", alpha=0.35, height: required, yOffset=0 }
     */
    drawTextBackground(x, yTop, text, options = {}){
        const { color = "#c5cae9", alpha = 0.35, height, yOffset = 0 } = options;
        if(!text || text.length === 0) return;
        // La hauteur doit venir du layout (lineHeight) pour un rendu cohérent
        if(!height || height <= 0){
            // Fallback minimal: ne rien dessiner si la hauteur est inconnue
            return;
        }
        const w = this.measureText(text).width;
        if(!w || w <= 0) return;
        this.withAlpha(alpha, ()=>{
            this.drawRectangle(x, yTop + yOffset, w, height, color);
        });
    }
    /**
     * Dessine un texte plein avec options.
     * options: {
     *   color?: string,
     *   font?: string,
     *   underline?: boolean,
     *   background?: { color?: string, alpha?: number, height: number, yOffset?: number }
     * }
     */
    drawText(x, y, text, options = {}){
        const ctx = this.context;
        const {
            color = "",
            font = "",
            underline = false,
            background = null,
        } = options || {};

        // Dessine le fond de sélection si demandé
        if(background){
            this.drawTextBackground(x, y, text, background);
        }

        // Si le texte est vide, on ne dessine que le background
        if(!text || text.length === 0){
            return;
        }

        if(color !== ""){
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
        }
        if(font !== "") ctx.font = font;
        ctx.fillText(text, x, y);

        if(underline){
            const m = ctx.measureText(text);
            let underlineY;
            if(ctx.textBaseline === 'top'){
                if(background && background.height){
                    underlineY = y + background.height - 2;
                } else if(typeof m.actualBoundingBoxAscent === 'number' && typeof m.actualBoundingBoxDescent === 'number'){
                    underlineY = y + (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) - 2;
                } else {
                    underlineY = y + 12; // fallback approximatif
                }
            } else {
                underlineY = y + 2;
            }
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, underlineY);
            ctx.lineTo(x + m.width, underlineY);
            ctx.stroke();
        }
    }
    /**
     * Trace un rectangle de contour stylisé (couleur, épaisseur, pointillés).
     * @param {Object} options - { color, lineWidth, dash, dashOffset }
     */
    borderRectangleStyled(x, y, width, height, options = {}){
        const { color = "black", lineWidth = 2, dash = [], dashOffset = 0 } = options;
        const ctx = this.context;
        const prev = { strokeStyle: ctx.strokeStyle, lineWidth: ctx.lineWidth, dash: ctx.getLineDash(), dashOffset: ctx.lineDashOffset };
        try{
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            if(ctx.setLineDash){ ctx.setLineDash(dash); }
            if(typeof dashOffset === 'number'){ ctx.lineDashOffset = dashOffset; }
            ctx.strokeRect(x, y, width, height);
        } finally {
            ctx.strokeStyle = prev.strokeStyle;
            ctx.lineWidth = prev.lineWidth;
            if(ctx.setLineDash){ ctx.setLineDash(prev.dash || []); }
            ctx.lineDashOffset = prev.dashOffset || 0;
        }
    }
    /**
     * Exécute une opération de dessin avec une opacité temporaire.
     * Restaure l'alpha précédent en fin d'appel (try/finally).
     */
    withAlpha(alpha, fn){
        const ctx = this.context;
        const prev = ctx.globalAlpha;
        try{
            ctx.globalAlpha = alpha;
            fn();
        } finally {
            ctx.globalAlpha = prev;
        }
    }
    /**
     * Applique un clipping rectangulaire (save/clip/restore) et exécute la fonction fournie.
     * Restaure toujours l'état du contexte, même en cas d'exception.
     */
    clipRectangle(x, y, width, height, fn){
        const ctx = this.context;
        ctx.save();
        try{
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();
            if(typeof fn === 'function') fn();
        } finally {
            ctx.restore();
        }
    }
    /**
     * Crée (et met en cache) un pattern Canvas à partir d'une image.
     * Le cache évite de recréer le pattern à chaque frame.
     */
    createPattern(image, repeat = 'repeat'){
        const ctx = this.context;
        const key = (image && image.src ? image.src : String(image)) + '|' + repeat;
        if(!this._patternCache) this._patternCache = new Map();
        if(this._patternCache.has(key)) return this._patternCache.get(key);
        const pat = ctx.createPattern(image, repeat);
        if(pat) this._patternCache.set(key, pat);
        return pat;
    }
    /**
     * Remplit un rectangle avec un pattern d'image répété.
     * Gère un offset (scroll) pour les animations de motif.
     */
    drawPatternImage(image, x, y, w, h, options = {}){
        const { repeat = 'repeat', offsetX = 0, offsetY = 0 } = options;
        const ctx = this.context;
        const pat = this.createPattern(image, repeat);
        if(!pat){ return; }
        ctx.save();
        ctx.translate(x + offsetX, y + offsetY);
        ctx.fillStyle = pat;
        ctx.fillRect(-offsetX, -offsetY, w, h);
        ctx.restore();
    }
    /**
     * Dessine une image ajustée dans un rectangle selon un mode:
     * - stretch: occupe exactement (w,h)
     * - cover: couvre sans bandes (peut rogner)
     * - contain: tout visible (peut laisser des bandes)
     * - none: taille originale
     */
    drawImageFitting(image, x, y, w, h, mode = 'stretch'){
        const ctx = this.context;
        const sw = image.naturalWidth || image.width;
        const sh = image.naturalHeight || image.height;
        if(!sw || !sh) return;
        if(mode === 'stretch'){
            ctx.drawImage(image, x, y, w, h);
            return;
        }
        if(mode === 'none'){
            ctx.drawImage(image, x, y);
            return;
        }
        const sr = sw / sh; const dr = w / h;
        let dw, dh, dx, dy;
        if(mode === 'cover'){
            if(sr > dr){ dh = h; dw = dh * sr; } else { dw = w; dh = dw / sr; }
        } else { // contain
            if(sr > dr){ dw = w; dh = dw / sr; } else { dh = h; dw = dh * sr; }
        }
        dx = x + (w - dw) / 2;
        dy = y + (h - dh) / 2;
        ctx.drawImage(image, dx, dy, dw, dh);
    }
    /**
     * Dessine une bordure en nine-slice à partir d'une image:
     * les coins ne sont pas déformés, seuls les segments centraux sont étirés.
     * @param {Object} slice - { top,right,bottom,left } en pixels source.
     * @param {Object} widths - { top,right,bottom,left } en pixels destination.
     * @param {boolean} fillCenter - si vrai, remplit le centre avec la zone centrale étirée.
     */
    drawNineSlice(image, x, y, w, h, slice, widths, fillCenter = true){
        const sw = image.naturalWidth || image.width;
        const sh = image.naturalHeight || image.height;
        if(!sw || !sh) return;
        const s = slice; const d = widths;
        const sL = s.left, sR = s.right, sT = s.top, sB = s.bottom;
        const midSW = sw - sL - sR;
        const midSH = sh - sT - sB;
        const dL = d.left, dR = d.right, dT = d.top, dB = d.bottom;
        const midDW = Math.max(0, w - dL - dR);
        const midDH = Math.max(0, h - dT - dB);
        const ctx = this.context;
        if(dL>0 && dT>0) ctx.drawImage(image, 0, 0, sL, sT, x, y, dL, dT);
        if(dR>0 && dT>0) ctx.drawImage(image, sw - sR, 0, sR, sT, x + w - dR, y, dR, dT);
        if(dL>0 && dB>0) ctx.drawImage(image, 0, sh - sB, sL, sB, x, y + h - dB, dL, dB);
        if(dR>0 && dB>0) ctx.drawImage(image, sw - sR, sh - sB, sR, sB, x + w - dR, y + h - dB, dR, dB);
        if(midSW > 0 && dT > 0 && midDW > 0) ctx.drawImage(image, sL, 0, midSW, sT, x + dL, y, midDW, dT);
        if(midSW > 0 && dB > 0 && midDW > 0) ctx.drawImage(image, sL, sh - sB, midSW, sB, x + dL, y + h - dB, midDW, dB);
        if(dL > 0 && midSH > 0 && midDH > 0) ctx.drawImage(image, 0, sT, sL, midSH, x, y + dT, dL, midDH);
        if(dR > 0 && midSH > 0 && midDH > 0) ctx.drawImage(image, sw - sR, sT, sR, midSH, x + w - dR, y + dT, dR, midDH);
        if(fillCenter && midSW > 0 && midSH > 0 && midDW > 0 && midDH > 0) ctx.drawImage(image, sL, sT, midSW, midSH, x + dL, y + dT, midDW, midDH);
    }
    /**
     * Libère les ressources associées (détache le canvas du DOM).
     */
    dispose(){
        try{
            if(this.canvas && this.canvas.parentNode){
                this.canvas.parentNode.removeChild(this.canvas);
            }
        } catch(_){}
        this.canvas = null;
        this.context = null;
    }
}    
