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
 *   - undo() - Annule la dernière modification
 *   - redo() - Rétablit la dernière modification annulée
 */
class ControlText extends Control {
    #text = "";
    #lines = [""];
    #modified = false;
    constructor() {
        super();

        // Configuration
        this.multiline = true;
        this.wrap = true;
        this.readonly = false;
        this.maxLength = -1;
        this.margin = {top: 10, right: 10, bottom: 10, left: 10}
        

    }
    get text(){ return this.#text; }
    set text(value){ this.#text = value; this.modified = true; }
    get lines(){ return this.#lines; }
    set lines(value){ this.#lines = value; }
    get modified(){ return this.#modified; }
    set modified(value){ this.#modified = value; }

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
    /**
     * Effectue le retour à la ligne automatique du texte en fonction de la largeur du contrôle
     * @returns {string[]} - Tableau des lignes après wrapping
     */
    wrapText() {
        const wrappedLines = [];
        const font = this.Theme?.background?.font;
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
        const font = control.Theme.background.font;
        
        
        // Calculer le nombre maximum de lignes visibles
        const lineHeight = font.size;
        const maxVisibleLines = Math.floor(rect.height / lineHeight);
        const linesToDraw = Math.min(control.lines.length, maxVisibleLines);
 
        if (control.clip){
            paint.clipRectangle(rect.x, rect.y, rect.width, rect.height, ()=>{
                for(let i = 0; i < linesToDraw; i++){
                    paint.drawText(rect.x, rect.y + lineHeight * (i+1), control.lines[i], font);
                }
            });
        }else{
            for(let i = 0; i < linesToDraw; i++){
                paint.save();
                paint.drawText(rect.x, rect.y + lineHeight * (i+1), control.lines[i], font);
                paint.restore();
            }
        }
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

    }
    
    // Termine la sélection par drag (réinitialise dragStartPos)
    clickLeftUp() {

    }
    
    // Pendant un drag, met à jour la sélection (start/end) selon la position souris et déplace le curseur
    hover() {
        super.hover();
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
        if (control.readonly) return;
        
        const key = Modifiers.key;
        const ctrl = Modifiers.ctrl;
        const shift = Modifiers.shift;
        
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
            //control._moveCursor('left', shift);
        } else if (key === 'ArrowRight') {
            //control._moveCursor('right', shift);
        } else if (key === 'ArrowUp') {
            //if (control.multiline) control._moveCursor('up', shift);
        } else if (key === 'ArrowDown') {
            //if (control.multiline) control._moveCursor('down', shift);
        } else if (key === 'Home') {
            //control._moveCursor('home', shift);
        } else if (key === 'End') {
            //control._moveCursor('end', shift);
        } else if (key === 'Backspace') {
            //control.deleteAtCursor(false);
        } else if (key === 'Delete') {
            //control.deleteAtCursor(true);
        } else if (key === 'Enter') {
            //if (control.multiline) {
                //control.insertAtCursor('\n');
            //}
        } else if (key === 'Tab') {
            //control.insertAtCursor('    ');
        } else if (key.length === 1 && !ctrl) {
            //control.insertAtCursor(key);
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
