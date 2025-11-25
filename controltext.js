

// textcontrol.js
// Contrôle d'édition de texte simplifié et évolutif
// Support mono/multiligne, API complète de modification, architecture modulaire

/**
 * Classe ControlText - Contrôle d'édition de texte
 * Hérite de Control et fournit une API complète pour l'édition de texte
 * 
 * OPTIONS:
 *   - multiline: boolean (défaut: false) - Active le mode multiligne
 *   - readonly: boolean (défaut: false) - Mode lecture seule  
 *   - maxLength: number|null (défaut: null) - Longueur maximale du texte
 *   - placeholder: string (défaut: "") - Texte affiché quand vide
 * 
 * API PUBLIQUE:
 *   - value (get/set) - Propriété pour lire/écrire le texte
 *   - setText(text) - Remplace tout le texte
 *   - getText() - Récupère le texte
 *   - insertText(text, position) - Insère du texte à une position
 *   - deleteText(start, end) - Supprime du texte entre start et end
 *   - replaceText(start, end, newText) - Remplace une portion de texte
 *   - insertAtCursor(text) - Insère du texte à la position du curseur
 *   - deleteAtCursor(forward) - Supprime un caractère au curseur
 *   - clear() - Efface tout le texte
 *   - selectAll() - Sélectionne tout le texte
 *   - getSelectedText() - Récupère le texte sélectionné
 */
class CursorText {
    #position = 0;
    #line = 0;
    #column = 0;
    #x = 0;
    #y = 0;
    #lastX = 0;
    constructor(control){
        this.control = control;
    }
    get position(){ return this.#position; }
    set position(value){ this.#position = value; }
    get line(){ return this.#line; }
    set line(value){ this.#line = value; }
    get column(){ return this.#column; }
    set column(value){ this.#column = value; }
    get x(){ return this.#x; }
    set x(value){ this.#x = value; }
    get y(){ return this.#y; }
    set y(value){ this.#y = value; }
    get lastX(){ return this.#lastX; }
    set lastX(value){ this.#lastX = value; }
}
class ControlText extends Control {
    #text = "";
    #lines = [""];
    #modified = false;
    #margin = {top: 10, right: 10, bottom: 10, left: 10}
    #cursor = new CursorText(this);
    #scroll = 6;
    constructor() {
        super();

        // Configuration
        this.multiline = true;
        this.wrap = true;
        this.readonly = false;
        this.maxLength = -1;
        //this.margin = {top: 10, right: 10, bottom: 10, left: 10}
        //this.cursor = {position:0, line:0, column:0, x:0, y:0, lastX:0}
        this.selection = {start:0, end:0}

    }
    get text(){ return this.#text; }
    set text(value){ this.#text = value; this.modified = true; }
    get lines(){ return this.#lines; }
    set lines(value){ this.#lines = value; }
    get modified(){ return this.#modified; }
    set modified(value){ this.#modified = value; }

    get cursor(){ return this.#cursor; }
    get margin(){ return this.#margin; }
    get font(){ return this.Theme?.background?.font; }
    get scroll(){ return this.#scroll; }
    set scroll(value){ this.#scroll = value; }
    
    initialize(){
        super.initialize();
        //this.clip = true;
    }
    modifiedLines(){
        if (this.modified) {
            if (this.multiline && this.wrap) {
                this.lines = this.wrapText();
            } else if (this.multiline) {
                this.lines = this.text.split('\n');
            } else {
                this.lines = [this.text];
            }
            this.modified = false;
            this.cursorPosition();
            this.cursor.lastX = this.cursor.x;
        }
    }
    rectangleText(){
        const size = this.Size;
        const border = this.Border;
        return {
            x: this.Absolute.x + border.left + this.margin.left,
            y: this.Absolute.y + border.top + this.margin.top,
            width: size.width - border.left - border.right - this.margin.left - this.margin.right,
            height: size.height - border.top - border.bottom - this.margin.top - this.margin.bottom
        };
    }
    wrapText() {
        const wrappedLines = [];
        const font = this.font;
        const paint = this.Paint;
        const paragraphs = this.#text.split('\n');

        if(!this.wrap || !font || !paint){
            return paragraphs;
        }
        
        const rect = this.rectangleText();
        const maxWidth = rect.width;

        for (let para of paragraphs) {
            if (para === '') {
                wrappedLines.push('');
                continue;
            }
            
            const words = para.split(' ');
            let currentLine = '';
            
            for (let i = 0; i < words.length; i++) {
                const testLine = currentLine === '' ? words[i] : currentLine + ' ' + words[i];
                const metrics = paint.measureText(testLine, font);
                
                if (metrics.width > maxWidth && currentLine !== '') {
                    wrappedLines.push(currentLine);
                    currentLine = words[i];
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine !== '') {
                wrappedLines.push(currentLine);
            }
        }
        return wrappedLines;
    }
    insertText(text) {
        if(this.readonly) return;
        if (this.maxLength > 0 && this.#text.length + text.length > this.maxLength) {
            return; // ou truncate
        }
        const cursor = this.cursor;
        const position = cursor.position;
        this.#text = this.#text.substring(0, position) + text + this.#text.substring(position);
        this.modified = true;
        this.cursor.position = position + text.length;
    }
    cursorMouse(){
        const mouseInside = this.Mouse.inside();
        const mouseX = mouseInside.x - this.Border.left - this.margin.left;
        const mouseY = mouseInside.y - this.Border.top - this.margin.top;
        this.cursor.position = this.positionInside(mouseX, mouseY);
        this.cursorPosition();
        this.cursor.lastX = this.cursor.x;
    }
    positionInside(insideX, insideY){
        const rect = this.rectangleText();
        const font = this.font;
        const paint = this.Paint;
        if (!font || !paint) return -1;
        
        const lineTarget = Math.max(0, Math.min(Math.floor(insideY / font.size) + this.scroll, this.lines.length - 1));
        
        const lineText = this.lines[lineTarget] || "";
        let column = 0;
    
        for (let i = 0; i <= lineText.length; i++) {
            const textWidth = paint.measureText(lineText.substring(0, i), font)?.width || 0;
            if (textWidth <= insideX) { column = i; }
            else{ break; }
        }
        let position = 0;
        for (let i = 0; i < lineTarget; i++) {
            position += this.lines[i].length + 1;
        }
        position += column;
        return position;
    }
    cursorPosition(){
        const font = this.font;
        const paint = this.Paint;
        if (!font || !paint) return ;
        const cursor = this.cursor;

        let nbrChar = 0;
        
        for (let i = 0; i < this.lines.length; i++) {
            const lineLength = this.lines[i].length;
            if(cursor.position <= nbrChar + lineLength){
                cursor.line = i;
                cursor.column = cursor.position - nbrChar;
                break;
            }
            nbrChar += lineLength + 1;
        }
        this.cursor.x = paint.measureText(this.lines[cursor.line].substring(0, cursor.column), font)?.width || 0;
        this.cursor.y = (cursor.line - this.scroll) * font.size;
    }
    moveLine(line){
        const cursor = this.cursor;
        let scrollLine = cursor.line - this.scroll + line;

        if(scrollLine < 0 && this.scroll + scrollLine >= 0){
            this.scroll += scrollLine;
            scrollLine = 0;
        }else if(scrollLine < 0){
            scrollLine = 0;
            this.scroll = 0;
        }else if(scrollLine > this.maxLine()-1 && this.scroll + line < this.maxScroll()){
            this.scroll += line;
            scrollLine = this.maxLine()-1;
        }else if(scrollLine > this.maxLine()-1){
            scrollLine = this.maxLine()-1; 
            this.scroll = this.maxScroll();
        }


        //scrollLine = Math.max(0, Math.min(scrollLine, this.maxLine()-1));
        cursor.position = this.positionInside(cursor.lastX, scrollLine * this.font.size);
        this.cursorPosition();
    }
    moveColumn(column){
        const cursor = this.cursor;
        cursor.position += column;
        this.cursorPosition();
        this.cursor.lastX = this.cursor.x;
    }
    maxLine(){
        const rect = this.rectangleText();
        const font = this.font;
        return Math.floor(rect.height / font.size);
    }
    maxScroll(){
        return Math.max(0, this.lines.length - this.maxLine());
    }
}

// ================================================
// CLASSE TEXTDRAW - Rendu visuel
// ================================================

class DrawText extends Draw {
    constructor(control) {
        super(control);
    }
    
    // Dessine le contrôle: cadre, placeholder/texte, sélection, caret et enfants. Invalide le layout si wrap+multiligne
    draw() {
        super.draw();
        const control = this.control;
        const paint = control.Paint;
        if (!paint) return;
        if(control.modified){ control.modifiedLines(); }
        const rect = control.rectangleText();
        const font = control.font;
        const scroll = control.scroll;
        
        
        // Calculer le nombre maximum de lignes visibles
        const linesToDraw = Math.min(control.lines.length-scroll, control.maxLine());
 
        if (control.clip){
            paint.clipRectangle(rect.x, rect.y, rect.width, rect.height, ()=>{
                for(let i = 0; i < linesToDraw; i++){
                    paint.drawText(rect.x, rect.y + font.size * (i+1), control.lines[i+scroll], font);
                }
            });
        }else{
            for(let i = 0; i < linesToDraw; i++){
                paint.save();
                paint.drawText(rect.x, rect.y + font.size * (i+1), control.lines[i+scroll], font);
                paint.restore();
            }
        }
        this.drawCursor();

        paint.drawText(rect.x, rect.y, "scroll :" + control.scroll, font);
    }
    drawCursor(){
        const control = this.control;
        if (control.readonly) return;
        if (control !== Core.focus) return; // Seulement si le contrôle a le focus
        
        const paint = control.Paint;
        if (!paint) return;
        const rect = control.rectangleText();
        const font = control.font;
        const cursor = control.cursor;
        if( cursor.x < 0 || cursor.y < 0 ) return;
        if(cursor.x > rect.width || cursor.y + font.size > rect.height) return;

        paint.save();
        paint.drawLine(
            rect.x + cursor.x, rect.y + cursor.y, 
            rect.x + cursor.x, rect.y + cursor.y + font.size,
            font.color || 'black', 1
        );
        paint.restore();
    }
}

// ================================================
// CLASSE TEXTMOUSE - Gestion de la souris
// ================================================

class MouseText extends Mouse {
    constructor(control) {
        super(control);
    }
    
    // Focus le contrôle, positionne le curseur au point cliqué et prépare une sélection par drag (dragStartPos)
    clickLeft() {
        super.clickLeft();
        const control = this.control;
        if (control.readonly) return;
        
        control.cursorMouse();
    }
    
    // Termine la sélection par drag (réinitialise dragStartPos)
    clickLeftUp() {

    }
    
    // Pendant un drag, met à jour la sélection (start/end) selon la position souris et déplace le curseur
    hover() {
        super.hover();
        const control = this.control;
    }

}

// ================================================
// CLASSE TEXTKEYBOARD - Gestion du clavier
// ================================================

class KeyboardText extends Keyboard {
    constructor(control) {
        super(control);
    }
    
    // Gère la navigation et l'édition au clavier (flèches, Home/End, Backspace/Delete, Enter/Tab, Ctrl+A/C/X/Z/Y, saisie)
    keyDown() {
        super.keyDown();
        const control = this.control;
        const modifiers = Core.modifiers;
        if (control.readonly) return;
        
        const key = modifiers.key;
        const ctrl = modifiers.ctrl;
        const shift = modifiers.shift;
        
        // Raccourcis clavier
        if (ctrl) {
            switch (key) {
                case 'a':
                    return;
                case 'c':
                    // Copier (géré par le système)
                    return;
                case 'x':
                    return;
            }
        }
        
        // Navigation
        if (key === 'ArrowLeft') {
            control.moveColumn(-1);
        } else if (key === 'ArrowRight') {
            control.moveColumn(1);
        } else if (key === 'ArrowUp') {
            control.moveLine(-1);
        } else if (key === 'ArrowDown') {
            control.moveLine(1);
        } else if (key === 'Home') {
            //control._moveCursor('home', shift);
        } else if (key === 'End') {
            //control._moveCursor('end', shift);
        } else if (key === 'Backspace') {
            //control.deleteAtCursor(false);
        } else if (key === 'Delete') {
            //control.deleteAtCursor(true);
        } else if (key === 'Enter') {
            if (control.multiline) {
                control.insertText('\n');
            }
        } else if (key === 'Tab') {
            control.insertText('    ');
        } else if (key.length === 1 && !ctrl) {
            control.insertText(key);
        }
    }
}

class ResizeText extends Resize {
    constructor(control){
        super(control);
    }
    to(width, height){
        super.to(width, height);
        this.control.modified = true;
    };
}

class ScaleText extends Scale {
    constructor(control){
        super(control);
    }
    to(ratio_width, ratio_height){
        super.to(ratio_width, ratio_height);
        this.control.modified = true;
    };
}

class FactoryText extends Factory{
    createControl(){ return new ControlText(); }
    createDraw(control){
        const draw = new DrawText(control); 
        draw.Theme = this.createTheme();
        return draw;
    }
    createKeyboard(control){ return new KeyboardText(control); }
    createMouse(control){ return new MouseText(control); }
    createResize(control){ return new ResizeText(control); }
    createScale(control){ return new ScaleText(control); }
}