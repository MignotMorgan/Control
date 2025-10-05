// textcontrol.js
// Contrôle d'édition de texte riche (base). Fournit un éditeur multi‑ligne avec caret, sélection,
// insertion/suppression, navigation clavier, rendu avec wrapping simple, et styles (gras/italique/souligné/couleur).
//
// Glossaire (mots simples):
// - « caret »: le curseur d'édition, la petite barre verticale qui clignote pour indiquer la position d'écriture.
// - « sélection »: la partie du texte surlignée (ex: quand on maintient Shift et on clique ou on déplace).
// - « run » (segment de style): un morceau de texte auquel on associe un style (gras, italique, couleur...).
// - « layout » (mise en page): l'étape qui découpe le texte en lignes visibles selon la largeur disponible.
// - « wrapping »: le retour automatique à la ligne lorsque le texte dépasse la largeur.
// - « IME »: méthode de saisie (Input Method Editor) utilisée pour composer des caractères complexes (ex: chinois),
//   ou ajouter des accents; on reçoit des événements de composition avant que le texte final ne soit inséré.

/**
 * Représente le modèle de texte riche.
 * - Stocke le contenu sous forme de "runs" (segments stylés)
 * - Expose des opérations de modification (insert, delete) et de style (apply/toggle)
 * - Maintient un cache du texte brut (`text`) pour le layout et certains calculs
 */

class TextModel {
    constructor(text = ""){
        // runs: [{ text, bold, italic, underline, color }]
        this.runs = [{ text: text || "", bold: false, italic: false, underline: false, color: "#111" }];
        this.text = text || ""; // cache du contenu brut pour le layout
        this._version = 0; // incrémenté à chaque modification
    }
    _rebuildText(){ this.text = this.runs.map(r=>r.text).join(""); this._version++; }
    setText(t){
        const s = t != null ? String(t) : "";
        this.runs = [{ text: s, bold: false, italic: false, underline: false, color: "#111" }];
        this._rebuildText();
    }
    /**
     * Localise un index absolu (dans le texte brut) dans les runs
     * @param {number} index position absolue dans `text`
     * @returns {{ri:number, off:number}} index de run et décalage interne
     */
    _locate(index){
        // retourne {ri, off} pour index dans le flux plain text
        let acc = 0;
        for(let i=0;i<this.runs.length;i++){
            const len = this.runs[i].text.length;
            if(index <= acc + len) return { ri: i, off: index - acc };
            acc += len;
        }
        return { ri: this.runs.length-1, off: this.runs[this.runs.length-1]?.text.length || 0 };
    }
    /**
     * Force une frontière de run à `index` en découpant le run si nécessaire.
     * Retourne l'index du run démarrant à `index`.
     */
    _splitAt(index){
        // Objectif simple: faire en sorte qu'un « segment de style » (run)
        // commence exactement à la position demandée.
        // Pourquoi ? Parce qu'on veut pouvoir appliquer un style 
        // sur une portion précise du texte sans affecter le reste.
        // Pour y parvenir, si la coupure tombe au milieu d'un segment,
        // on le découpe en deux segments identiques de style.
        // Cette fonction renvoie l'indice du segment qui débute à `index`.
        index = Math.max(0, Math.min(index, this.text.length));
        const {ri, off} = this._locate(index);
        const run = this.runs[ri];
        if(!run) return 0;
        if(off === 0) return ri;
        if(off === run.text.length) return ri+1;
        // Ici, on coupe le segment existant en deux parties « left » et « right »
        // avec le même style, seule la portion de texte change.
        const left = { ...run, text: run.text.slice(0, off) };
        const right = { ...run, text: run.text.slice(off) };
        this.runs.splice(ri, 1, left, right);
        return ri+1;
    }
    /** Fusionne les runs adjacents qui partagent exactement le même style. */
    _mergeAdjacent(){
        const out = [];
        for(const r of this.runs){
            const last = out[out.length-1];
            if(last && last.bold===r.bold && last.italic===r.italic && last.underline===r.underline && last.color===r.color){
                last.text += r.text;
            } else out.push({...r});
        }
        this.runs = out;
    }
    /**
     * Insère une chaîne `s` au style `style` à la position `index`.
     * @param {number} index position absolue
     * @param {string} s texte à insérer
     * @param {{bold?:boolean, italic?:boolean, underline?:boolean, color?:string}} style style appliqué au texte inséré
     */
    insertAt(index, s, style){
        // Insère le texte `s` à la position indiquée en lui associant un style.
        // On commence par forcer une frontière de segment à `index` pour
        // pouvoir insérer « proprement » sans mélanger les styles.
        if(!s) return; 
        index = Math.max(0, Math.min(index, this.text.length));
        const at = this._splitAt(index);
        const run = { text: s, bold: !!(style && style.bold), italic: !!(style && style.italic), underline: !!(style && style.underline), color: (style && style.color) || "#111" };
        this.runs.splice(at, 0, run);
        // Après insertion, on fusionne les segments voisins qui auraient
        // exactement le même style, pour éviter la fragmentation.
        this._mergeAdjacent();
        this._rebuildText();
    }
    /** Supprime [start,end) en coordonnées absolues (texte brut). */
    deleteRange(start, end){
        // Supprime le texte dans l'intervalle [start, end).
        // Si start et end sont inversés, on les remet dans l'ordre.
        if(start === end) return; 
        if(start > end){ const t = start; start = end; end = t; }
        start = Math.max(0, Math.min(start, this.text.length));
        end = Math.max(0, Math.min(end, this.text.length));
        if(end <= start) return;
        // On force une frontière de segment au début et à la fin de la zone à supprimer
        // afin de pouvoir retirer des segments entiers sans casser les styles autour.
        const a = this._splitAt(start);
        const b = this._splitAt(end);
        // supprime runs a..b-1
        this.runs.splice(a, b-a);
        // On fusionne afin d'éviter d'avoir des petits segments consécutifs identiques.
        this._mergeAdjacent();
        this._rebuildText();
    }
    /**
     * Applique ou bascule une propriété de style sur l'intervalle [start,end).
     * @param {number} start
     * @param {number} end
     * @param {'bold'|'italic'|'underline'|'color'} prop
     * @param {boolean} [toggle=true] si vrai, inverse; sinon fixe `value`
     * @param {any} [value=true] valeur à appliquer si `toggle` est faux
     */
    applyStyle(start, end, prop, toggle=true, value=true){
        // Applique (ou inverse) un style sur la zone [start, end).
        // Exemple: mettre en gras, en italique, souligner, ou changer la couleur.
        if(start === end) return; if(start > end){ const t = start; start = end; end = t; }
        start = Math.max(0, Math.min(start, this.text.length));
        end = Math.max(0, Math.min(end, this.text.length));
        // Comme pour l'insertion/suppression, on force des frontières de segments
        // pour pouvoir appliquer le style sans le « déborder » sur les parties non visées.
        const a = this._splitAt(start);
        const b = this._splitAt(end);
        for(let i=a;i<b;i++){
            if(toggle){ this.runs[i][prop] = !this.runs[i][prop]; }
            else { this.runs[i][prop] = value; }
        }
        // Fusion post-traitement pour éviter les doublons de segments identiques côte à côte.
        this._mergeAdjacent();
        this._rebuildText();
    }
    /** Retourne une copie superficielle des runs intersectant [start,end). */
    getRunsInRange(start, end){
        start = Math.max(0, Math.min(start, this.text.length));
        end = Math.max(0, Math.min(end, this.text.length));
        const a = this._splitAt(start);
        const b = this._splitAt(end);
        const slice = this.runs.slice(a, b).map(r=>({...r}));
        return slice;
    }
}

/**
 * Modèle de sélection (caret):
 * - anchor/head = bornes de sélection
 * - start/end = ordre croissant
 */
class SelectionModel {
    constructor(){ this.anchor = 0; this.head = 0; }
    get start(){ return Math.min(this.anchor, this.head); }
    get end(){ return Math.max(this.anchor, this.head); }
    get empty(){ return this.anchor === this.head; }
    collapseTo(pos){ this.anchor = this.head = pos; }
    setRange(a, b){ this.anchor = a; this.head = b; }
}

// Calcul de mise en page très simple: coupe le texte en lignes selon la largeur intérieure.
// Cache le résultat tant que version du texte et dimensions n'ont pas changé.
/**
 * Calcule le layout (découpage en lignes) à partir du texte brut.
 * Note: le wrapping se fait sur le texte brut et non par runs;
 * le rendu applique ensuite les styles run par run.
 */
class TextLayout {
    constructor(control){
        this.control = control;
        this._cache = null; // { version, width, lines: [{text, start, end}] }
        this.lineHeight = 16; // px
        this.font = "13px sans-serif";
        this.paddingLeft = 4;
        this.paddingTop = 4;
    }
    get innerWidth(){
        return this.control.width - this.control.Border.left - this.control.Border.right - this.paddingLeft*2;
    }
    ensure(){
        // Calcule (ou réutilise) le découpage en lignes.
        // C'est comme si on coupait un paragraphe trop long pour qu'il tienne dans une boîte.
        const model = this.control.textModel;
        const W = Math.max(0, this.innerWidth);
        const paint = this.control.form && this.control.form.paint;
        // Petite optimisation: si ni le texte ni la largeur n'ont changé, on réutilise le résultat précédent.
        if(this._cache && this._cache.version === model._version && this._cache.width === W) return this._cache;
        paint.save();
        paint.font = this.font;
        const lines = [];
        // On sépare d'abord le texte par les retours à la ligne «\n» (chaque entrée est un paragraphe).
        const paragraphs = model.text.split("\n");
        let offset = 0; // position absolue dans le texte brut
        for(let p=0;p<paragraphs.length;p++){
            let rest = paragraphs[p];
            if(rest.length === 0){
                // Paragraphe vide: on crée une ligne vide
                lines.push({ text: "", start: offset, end: offset });
            } else {
                // Style-aware path: mesure par run si activé
                if(this.control && this.control.styleAwareLayout){
                    const modelText = model.text; // texte brut
                    const paraAbsStart = offset;   // index absolu du début de ce paragraphe
                    let restAbs = paraAbsStart;   // index absolu courant dans le paragraphe
                    // Construire une map rapide: absIndex -> style run via TextModel._locate
                    while(rest.length > 0){
                        if(this.control && this.control.wrap === false){
                            // Pas de wrap: ligne complète
                            const seg = rest;
                            lines.push({ text: seg, start: restAbs, end: restAbs + seg.length });
                            restAbs += seg.length;
                            offset += seg.length;
                            rest = rest.slice(seg.length);
                            continue;
                        }
                        let remaining = W;
                        let lineStartAbs = restAbs;
                        let lineText = "";
                        // Remplir la ligne par segments stylés
                        while(rest.length > 0 && remaining > 0){
                            const loc = this.control.textModel._locate(restAbs);
                            const run = this.control.textModel.runs[loc.ri];
                            const runRemain = (run && run.text) ? (run.text.length - loc.off) : rest.length;
                            const chunkLen = Math.min(runRemain, rest.length);
                            const chunk = rest.slice(0, chunkLen);
                            // Appliquer la police du run
                            const fontParts = [];
                            if(run && run.italic) fontParts.push("italic");
                            if(run && run.bold) fontParts.push("bold");
                            fontParts.push(this.font);
                            paint.font = fontParts.join(" ");
                            // Recherche binaire: max k chars qui tiennent dans 'remaining'
                            let lo = 0, hi = chunk.length;
                            while(lo < hi){
                                const mid = Math.floor((lo + hi + 1)/2);
                                const w = paint.measureText(chunk.slice(0, mid)).width;
                                if(w <= remaining) lo = mid; else hi = mid - 1;
                            }
                            let take = lo;
                            if(take === 0){
                                // Rien ne tient de ce run: si la ligne est vide, forcer 1 char pour progresser
                                if(lineText.length === 0 && chunk.length > 0){ take = 1; }
                            }
                            if(take > 0){
                                const takenText = chunk.slice(0, take);
                                lineText += takenText;
                                const w = paint.measureText(takenText).width;
                                remaining -= w;
                                rest = rest.slice(take);
                                restAbs += take;
                            } else {
                                // pas de progression, on sort pour finaliser la ligne
                                break;
                            }
                        }
                        // Word wrap par mots: reculer jusqu'au dernier espace si on n'est pas à la fin du paragraphe
                        if(this.control && this.control.wordWrap === 'word' && rest.length > 0 && lineText.length > 0){
                            let splitAt = -1;
                            for(let i=lineText.length-1; i>=0; i--){
                                if(/\s/.test(lineText.charAt(i))){ splitAt = i; break; }
                            }
                            if(splitAt >= 0 && splitAt < lineText.length - 1){
                                const carry = lineText.slice(splitAt+1);
                                // réinjecter le reste de la ligne au début de rest
                                rest = carry + rest;
                                restAbs -= carry.length;
                                lineText = lineText.slice(0, splitAt+1);
                            } else if(this.control.hyphenate){
                                // Pas d'espace pour couper proprement: hyphénation
                                const hy = (this.control.hyphenChar || '-');
                                // tant que le tiret ne tient pas, on retire des chars à la fin de lineText
                                let trial = lineText;
                                // Sécurité: garder au moins 1 caractère avant le tiret
                                while(trial.length > 1 && paint.measureText(trial + hy).width > W){
                                    const back = trial.charAt(trial.length-1);
                                    trial = trial.slice(0, -1);
                                    rest = back + rest; // réinjecte le dernier char au début du reste
                                    restAbs -= 1;
                                }
                                lineText = trial + hy;
                            }
                        }
                        lines.push({ text: lineText, start: lineStartAbs, end: lineStartAbs + lineText.length });
                        offset = lineStartAbs + lineText.length;
                    }
                } else {
                    // Si wrap désactivé: aucune coupe, une seule ligne pour le paragraphe
                    if(this.control && this.control.wrap === false){
                        const whole = rest;
                        lines.push({ text: whole, start: offset, end: offset + whole.length });
                        offset += whole.length;
                    } else {
                        // On remplit la ligne avec autant de caractères que possible sans dépasser la largeur W
                        while(rest.length > 0){
                            // Utilise la fonction d'aide de Paint (mesure simple) pour trouver un point de coupe raisonnable (max)
                            let first = this.control.form.paint.cutText(rest, W)[0];
                            if(first.length === 0){
                                // Sécurité: si rien ne rentre, on prend au moins 1 caractère
                                first = rest.charAt(0);
                            } else if(this.control && this.control.wordWrap === 'word' && first.length < rest.length){
                                // Favoriser la coupure à la limite de mot en reculant jusqu'au dernier séparateur visible
                                let splitAt = -1;
                                for(let i = first.length - 1; i >= 0; i--){
                                    const ch = first.charAt(i);
                                    if(/\s/.test(ch)) { splitAt = i; break; }
                                }
                                if(splitAt > 0){
                                    // Coupe à splitAt+1 pour inclure l'espace terminal sur la ligne actuelle
                                    const wordLine = first.slice(0, splitAt+1);
                                    const carry = first.slice(splitAt+1);
                                    lines.push({ text: wordLine, start: offset, end: offset + wordLine.length });
                                    offset += wordLine.length;
                                    // réinjecter le reste de 'first' au début de 'rest'
                                    rest = carry + rest.slice(first.length);
                                    continue; // prochaine itération
                                } else if(this.control.hyphenate && first.length > 1){
                                    // Aucun espace pour couper: hyphénation en ajoutant un tiret
                                    const hy = (this.control.hyphenChar || '-');
                                    // Réduire first pour que first+hy tienne dans W
                                    let f = first;
                                    while(f.length > 1 && (this.control.form.paint.measureText ? this.control.form.paint.measureText(f + hy).width : paint.measureText(f + hy).width) > W){
                                        f = f.slice(0, -1);
                                    }
                                    const hyLine = f + hy;
                                    lines.push({ text: hyLine, start: offset, end: offset + hyLine.length });
                                    offset += hyLine.length;
                                    rest = rest.slice(f.length); // On ne consomme que f (sans le hyphen du reste)
                                    continue;
                                }
                            }
                            // Coupe standard (caractère) ou pas de recul possible
                            lines.push({ text: first, start: offset, end: offset + first.length });
                            offset += first.length;
                            rest = rest.slice(first.length);
                        }
                    }
                }
            }
            if(p < paragraphs.length - 1){
                // Ajoute le saut de ligne au flux brut pour conserver la bonne position absolue
                lines[lines.length-1].end += 1;
                offset += 1;
            }
        }
        //if(g && g.restore) g.restore();
        paint.restore();
        // Mémorise le résultat pour accélérer les prochains appels
        this._cache = { version: model._version, width: W, lines };
        return this._cache;
    }
    // Retourne l'index de ligne contenant index (en bornant aux bornes valides)
    lineIndexOf(index){
        const c = this.ensure();
        if(c.lines.length === 0) return 0;
        for(let i=0;i<c.lines.length;i++){
            const L = c.lines[i];
            // Si l'index tombe exactement sur la fin d'une ligne qui se termine par '\n',
            // on considère visuellement qu'il est au début de la ligne suivante.
            if(index < L.start) return i;
            if(index < L.end) return i;
            if(index === L.end){
                const isNL = (this.control.textModel.text[L.end-1] === '\n');
                if(isNL && i+1 < c.lines.length) return i+1;
                return i;
            }
        }
        return c.lines.length - 1;
    }
    // Renvoie la position x absolue (écran) du caret à index
    xForIndex(index){
        const c = this.ensure();
        const paint = this.control.form && this.control.form.paint;
        paint.save(); 
        paint.font = this.font;
        const left = this.control.form.Inside.x + this.control.x + this.control.Border.left + this.paddingLeft;
        const li = this.lineIndexOf(index);
        const L = c.lines[li];
        const endNoNL = (this.control.textModel.text[L.end-1] === '\n') ? L.end-1 : L.end;
        const idxClamped = Math.min(index, endNoNL);
        const pre = this.control.textModel.text.slice(L.start, idxClamped);
        const w = paint.measureText(pre).width;
        const x = left + w;
        paint.restore();
        return x;
    }
    // Calcule l'index caret pour une position x à la ligne lineIdx
    indexForX(lineIdx, x){
        const c = this.ensure();
        const paint = this.control.form && this.control.form.paint;
        paint.save(); 
        paint.font = this.font;        
        const left = this.control.form.Inside.x + this.control.x + this.control.Border.left + this.paddingLeft;
        const li = Math.max(0, Math.min(lineIdx, c.lines.length-1));
        const L = c.lines[li];
        const endNoNL = (this.control.textModel.text[L.end-1] === '\n') ? L.end-1 : L.end;
        let idx = L.start;
        for(let i=0;i<=endNoNL-L.start;i++){
            const w = paint.measureText(this.control.textModel.text.slice(L.start, L.start+i)).width;
            if(left + w >= x){ idx = L.start + i; break; }
            if(i === endNoNL-L.start){ idx = endNoNL; break; }
        }
        paint.restore();
        return idx;
    }
    // Conversion index absolu -> position écran (x,y)
    caretToXY(index){
        // Convertit une position dans le texte (ex: 10ème caractère) en coordonnées écran (x,y).
        // Cela sert à placer le caret (curseur) exactement où il faut.
        const c = this.ensure();
        const paint = this.control.form && this.control.form.paint;
        paint.save(); 
        paint.font = this.font;        
        let x = this.paddingLeft + this.control.Border.left - (this.control._scrollX||0); // marge intérieure horizontale avec scrollX
        let y = this.paddingTop + this.control.Border.top - (this.control._scrollY||0);   // marge intérieure verticale avec scrollY
        let accY = y; // position verticale de la ligne en cours
        for(let i=0;i<c.lines.length;i++){
            const L = c.lines[i];
            if(index <= L.start){
                const res = { x: x, y: accY };
                paint.restore();
                return res;
            }
            if(index <= L.end){
                const within = L.text.slice(0, index - L.start); // texte avant le caret sur cette ligne
                const w = paint.measureText(within).width;            // largeur du texte avant le caret
                const res = { x: x + w, y: accY };
                paint.restore();
                return res;
            }
            accY += this.lineHeight;
        }
        paint.restore();
        //g.restore && g.restore();
        return { x: x, y: accY };
    }
    // Hit testing: (x,y) -> index texte
    xyToCaret(x, y){
        // Fait l'opération inverse: à partir d'une position écran (x,y) où on a cliqué,
        // retrouve l'index du caractère le plus proche dans le texte.
        const c = this.ensure();
        const paint = this.control.form && this.control.form.paint;
        paint.save(); 
        paint.font = this.font;
        // Calcule la zone intérieure (coin supérieur gauche) en coordonnées écran
        const left = this.control.form.Inside.x + this.control.x + this.control.Border.left + this.paddingLeft - (this.control._scrollX||0);
        const top = this.control.form.Inside.y + this.control.y + this.control.Border.top + this.paddingTop - (this.control._scrollY||0);
        // Convertit la position cliquée en une position relative à la zone intérieure
        const innerY = Math.max(0, y - top);
        // Trouve l'index de ligne correspondant à innerY
        const lineIdx = Math.min(c.lines.length - 1, Math.floor(innerY / this.lineHeight));
        const L = c.lines[lineIdx];
        const baseX = left; // début de la ligne
        let idx = L.start;  // valeur par défaut: début de la ligne
        let acc = 0;
        for(let i=0;i<=L.text.length;i++){
            const w = paint.measureText(L.text.slice(0, i)).width;
            // Dès que la largeur cumulée dépasse la position cliquée,
            // on déduit que le caret doit se placer avant ce caractère.
            if(baseX + w >= x){ idx = L.start + i; break; }
            acc = w;
            if(i === L.text.length){ idx = L.end; break; }
        }
        paint.restore();
        return idx;
    }
}

/**
 * Dessine le contrôle de texte:
 * - cadre via super.draw
 * - sélection (fond sur intervalle sélectionné)
 * - texte par runs stylés (gras/italique/underline/couleur)
 * - caret clignotant
 * - placeholder si vide
 */
class DrawTextControl extends Draw{
    constructor(control){ super(control); }
    draw(paint, x, y, width, height){
        // Cadre standard via super
        super.draw(paint, x, y, width, height);
        // Zone intérieure
        const innerX = x + this.control.Border.left + this.control.textLayout.paddingLeft;
        const innerY = y + this.control.Border.top + this.control.textLayout.paddingTop;
        // Utilise PaintCanvas (save/restore/font) et configure via getters/setters
        paint.save();
        paint.font = this.control.textLayout.font;
        paint.textbaseline = "top";
        paint.fillColor = "#111";
        const layoutCache = this.control.textLayout.ensure();
        const lines = layoutCache.lines;
        // Sélection
        const sel = this.control.selection;
        const hasSel = !sel.empty;
        const lineHeight = this.control.textLayout.lineHeight;
        // Scrolling
        const scrollX = this.control._scrollX || 0;
        const scrollY = this.control._scrollY || 0;
        const innerW0 = Math.max(0, width - this.control.Border.left - this.control.Border.right - this.control.textLayout.paddingLeft*2);
        const innerH0 = Math.max(0, height - this.control.Border.top - this.control.Border.bottom - this.control.textLayout.paddingTop*2);
        const contentH = lines.length * lineHeight;
        // Premier passage: détecte scroll vertical
        const hasVScroll = !!this.control.showScrollbarY && (contentH > innerH0);
        const sbW = hasVScroll ? (this.control.scrollbarWidth || 8) : 0;
        const innerW1 = Math.max(0, innerW0 - sbW);
        // Largeur de contenu approximative (mesure texte brut par ligne)
        let contentW = 0;
        for(const L of lines){ contentW = Math.max(contentW, paint.measureText(L.text).width); }
        // Détecte scroll horizontal (utile surtout si wrap=false)
        const allowHX = !!this.control.showScrollbarX && (!!this.control.scrollX || this.control.wrap === false);
        const hasHScroll = allowHX && (contentW > innerW1);
        const sbH = hasHScroll ? (this.control.scrollbarWidth || 8) : 0;
        // Hauteur intérieure finale (si HScroll, réduit la hauteur utile pour le texte)
        const innerH = Math.max(0, innerH0 - sbH);
        // Recalcule au besoin la fenêtre verticale si la barre horizontale est apparue
        const hasVScroll2 = !!this.control.showScrollbarY && (contentH > innerH);
        const sbW2 = hasVScroll2 ? (this.control.scrollbarWidth || 8) : 0;
        const innerW = Math.max(0, innerW0 - sbW2);
        // Clipper la zone intérieure pour le rendu du texte/selection/caret
        const clipX = x + this.control.Border.left;
        const clipY = y + this.control.Border.top;
        const clipW = Math.max(0, width - this.control.Border.left - this.control.Border.right);
        const clipH = Math.max(0, height - this.control.Border.top - this.control.Border.bottom);
        paint.clipRectangle(clipX, clipY, clipW, clipH, () => {
            // Dessine les lignes
            let drawY = innerY - scrollY;
            // Détermine l'intervalle de lignes visibles (optimisation basique)
            const firstVisible = Math.max(0, Math.floor((scrollY) / lineHeight));
            const lastVisible = Math.min(lines.length - 1, Math.floor((scrollY + innerH) / lineHeight));
            for(let i=firstVisible;i<=lastVisible;i++){
                const L = lines[i];
                // Sélection de fond par segment sur la ligne
                if(hasSel){
                    const s = Math.max(L.start, sel.start);
                    const e = Math.min(L.end, sel.end);
                    if(e > s){
                        const preW = paint.measureText(this.control.textModel.text.slice(L.start, s)).width;
                        const selText = this.control.textModel.text.slice(s, e);
                        // Délègue le surlignage au PaintCanvas
                        paint.drawTextBackground(innerX + preW - scrollX, drawY, selText, {
                            color: "#c5cae9",
                            alpha: 0.35,
                            height: lineHeight,
                            yOffset: 0
                        });
                    }
                }
                // Texte par runs stylés
                const segs = this.control.textModel.getRunsInRange(L.start, L.end);
                let dx = innerX - scrollX;
                for(const seg of segs){
                    const style = seg;
                    const fontParts = [];
                    if(style.italic) fontParts.push("italic");
                    if(style.bold) fontParts.push("bold");
                    fontParts.push(this.control.textLayout.font);
                    const text = seg.text;
                    // Ellipsis en mode une-ligne (wrap=false) si activé
                    if(this.control.wrap === false && this.control.ellipsis){
                        let remainingWidth = innerW - (dx - (innerX - scrollX));
                        if(remainingWidth <= 0){
                            // plus de place sur cette ligne
                            break;
                        }
                        const fullW = paint.measureText(text).width;
                        if(fullW <= remainingWidth){
                            paint.drawText(dx, drawY, text, { color: style.color, font: fontParts.join(" "), underline: style.underline });
                            dx += fullW;
                        } else {
                            // Couper et ajouter …
                            const ell = "\u2026"; // …
                            const ellW = paint.measureText(ell).width;
                            const room = Math.max(0, remainingWidth - ellW);
                            const cut = this.control.form.paint.cutText(text, room)[0];
                            const drawTxt = cut + ell;
                            paint.drawText(dx, drawY, drawTxt, { color: style.color, font: fontParts.join(" "), underline: style.underline });
                            dx += paint.measureText(drawTxt).width;
                            // Fin de la ligne en ellipsis
                            break;
                        }
                    } else {
                        // Rendu normal
                        paint.drawText(dx, drawY, text, { color: style.color, font: fontParts.join(" "), underline: style.underline });
                        const w = paint.measureText(text).width;
                        dx += w;
                    }
                }
                drawY += lineHeight;
            }

            // Caret (toujours visible quand _showCaret est vrai)
            if(this.control._showCaret){
                const head = this.control.selection.head;
                const lineIdx = this.control.textLayout.lineIndexOf(head);
                const L = lines[lineIdx] || { start:0, end:0, text:"" };
                // Ignore le saut de ligne final pour la position horizontale
                const endNoNL = (this.control.textModel.text[L.end-1] === '\n') ? L.end-1 : L.end;
                const idxClamped = Math.min(head, endNoNL);
                const preText = this.control.textModel.text.slice(L.start, idxClamped);
                const preW = paint.measureText(preText).width;
                const cx = (innerX - scrollX) + preW;
                const cy = (innerY - scrollY) + lineIdx * lineHeight;
                paint.drawRectangle(cx, cy, 2, lineHeight, "#2979ff");
            }
        });
        // Barre de scroll verticale (visuelle) si overflow
        if(hasVScroll2){
            const trackX = innerX + innerW;
            const trackY = innerY;
            const trackW = sbW;
            const trackH = innerH;
            // Track
            paint.drawRectangle(trackX, trackY, trackW, trackH, "rgba(0,0,0,0.05)");
            // Thumb
            const maxScroll = Math.max(1, contentH - innerH);
            const thumbH = Math.max(20, Math.floor(innerH * (innerH / contentH)));
            const thumbMaxY = innerH - thumbH;
            const thumbOff = Math.floor((scrollY / maxScroll) * thumbMaxY);
            paint.drawRectangle(trackX, trackY + thumbOff, trackW, thumbH, "rgba(0,0,0,0.25)");
        }
        // Barre de scroll horizontale (visuelle) si overflow
        if(hasHScroll){
            const trackX = innerX;
            const trackY = innerY + innerH;
            const trackW = innerW;
            const trackH = sbH;
            paint.drawRectangle(trackX, trackY, trackW, trackH, "rgba(0,0,0,0.05)");
            const maxScrollX = Math.max(1, contentW - innerW);
            const thumbW = Math.max(20, Math.floor(innerW * (innerW / contentW)));
            const thumbMaxX = innerW - thumbW;
            const thumbOffX = Math.floor(((this.control._scrollX||0) / maxScrollX) * thumbMaxX);
            paint.drawRectangle(trackX + thumbOffX, trackY, thumbW, trackH, "rgba(0,0,0,0.25)");
        }
        // Placeholder si vide et pas de focus
        if(lines.length === 1 && lines[0].text === "" && focus !== this.control && this.control.placeholder){
            const ph = this.control.placeholder;
            paint.drawText(innerX, innerY, ph.text || "", { color: ph.color || "#9e9e9e" });
        }
        paint.restore();
    }
}

/**
 * Gestion clavier spécifique au TextControl:
 * - Navigation (flèches, Home/End)
 * - Édition (Backspace/Delete/Enter)
 * - Raccourcis (Ctrl+A/C/X/V, Ctrl+Z/Y, Ctrl+B/I/U)
 * - IME (compositionstart/update/end)
 */
class TextKeyboard extends Keyboard{
    constructor(control){ super(control); }
    onKeyDown(mod){
        const c = this.control;
        const m = c.textModel;
        const sel = c.selection;
        const key = mod.key;
        const ctrl = mod.ctrl || mod.meta; // Cmd sur Mac
        const shift = mod.shift;
        // Raccourcis
        if(ctrl && key){
            switch(key.toLowerCase()){
                case 'a': sel.setRange(0, m.text.length); c.invalidate(); return;
                case 'c': /* tentative copie */ c.copySelection(); return;
                case 'x': c.copySelection(true); return;
                case 'v': c.pasteClipboard(); return;
                case 'z': c.undo(); return;
                case 'y': c.redo(); return;
                case 'b': c.toggleStyle('bold'); return;
                case 'i': c.toggleStyle('italic'); return;
                case 'u': c.toggleStyle('underline'); return;
                case 'home': c.moveDocumentBoundary(true, shift); return;
                case 'end': c.moveDocumentBoundary(false, shift); return;
            }
        }
        // Navigation
        switch(key){
            case 'ArrowLeft': c.moveCaretHoriz(-1, shift); return;
            case 'ArrowRight': c.moveCaretHoriz(1, shift); return;
            case 'ArrowUp': c.moveCaretVertical(-1, shift); return;
            case 'ArrowDown': c.moveCaretVertical(1, shift); return;
            case 'Home': c.moveLineBoundary(true, shift); return;
            case 'End': c.moveLineBoundary(false, shift); return;
            case 'PageUp': c.pageMove(-1, shift); return;
            case 'PageDown': c.pageMove(1, shift); return;
            case 'Backspace':
                c.pushHistory();
                if(!sel.empty){ m.deleteRange(sel.start, sel.end); sel.collapseTo(sel.start); }
                else if(sel.start > 0){ m.deleteRange(sel.start-1, sel.start); sel.collapseTo(sel.start-1); }
                c.invalidate(); return;
            case 'Delete':
                c.pushHistory();
                if(!sel.empty){ m.deleteRange(sel.start, sel.end); sel.collapseTo(sel.start); }
                else if(sel.start < m.text.length){ m.deleteRange(sel.start, sel.start+1); }
                c.invalidate(); return;
            case 'Enter':
                c.typeText("\n"); return;
            default:
                // Caractères imprimables (hors modifs ctrl/meta)
                if(key && key.length === 1 && !ctrl){ c.typeText(key); return; }
        }
    }
    // IME composition support
    onCompositionStart(data){
        const c = this.control;
        c._composing = true;
        c._compositionText = "";
    }
    onCompositionUpdate(data){
        const c = this.control;
        c._compositionText = data || "";
        // Optionnel: afficher la composition; pour simplicité, on ne dessine pas de preview séparée ici
    }
    onCompositionEnd(data){
        const c = this.control;
        const text = (data != null ? String(data) : c._compositionText || "");
        if(text){ c.typeText(text); }
        c._composing = false;
        c._compositionText = "";
    }
}

/**
 * Contrôle d'édition de texte riche.
 * Responsabilités:
 * - coordonner modèle (TextModel), layout (TextLayout), rendu (DrawTextControl)
 * - gérer caret/sélection (SelectionModel) et styles de saisie (currentStyle)
 * - fournir Undo/Redo et Clipboard
 */
class TextControl extends Control{
    constructor(){
        super();
        this.textModel = new TextModel("");
        this.selection = new SelectionModel();
        this.textLayout = new TextLayout(this);
        this._showCaret = true;
        this._blinkTimer = 0;
        this.canFocus = true;
        this._dirty = true; // demande de re‑layout
        // Placeholder optionnel: { text, color }
        this.placeholder = null;
        // Historique Undo/Redo simple
        this._history = [];
        this._redo = [];
        this._historyLimit = 200;
        // Style courant (pour la frappe)
        this.currentStyle = { bold:false, italic:false, underline:false, color:"#111" };
        // IME state
        this._composing = false;
        this._compositionText = "";
        // Sélection à la souris (drag)
        this._selecting = false;
        // Gestion multi-clics pour sélection mot/ligne
        this._lastClickTime = 0;
        this._lastClickIndex = -1;
        this._lastClickCount = 0;
        // X préféré pour navigation verticale (colonne visuelle)
        this._preferredX = null;
        // --- Options d'affichage/comportement ---
        // Clipping
        this.clipContent = true;
        // Wrap & ellipsis
        this.wrap = true;            // multi-ligne par défaut
        this.ellipsis = false;       // pas d'ellipsis en multi-ligne
        this.wordWrap = 'word';      // 'word' ou 'char'
        // Scroll
        this.scrollY = true;
        this.scrollX = false;        // inutile si wrap=true
        this._scrollY = 0;
        this._scrollX = 0;
        // Scrollbars visuelles
        this.showScrollbarY = true;
        this.showScrollbarX = false;
        this.scrollbarWidth = 8;
        // Auto-resize
        this.autoResizeY = false;    // viewport fixe par défaut (Preset A)
        this.autoResizeX = false;    // déconseillé par défaut
        this.minHeight = 0;
        this.maxHeight = 600;        // borne raisonnable par défaut
        this.minWidth = 0;
        this.maxWidth = 10000;
        // Caret visibility
        this.keepCaretVisible = true;
        // Layout conscient des styles (à implémenter étape ultérieure)
        this.styleAwareLayout = false;
        // Hyphénation optionnelle pour le word-wrap
        this.hyphenate = false;
        this.hyphenChar = '-';
        // Molette
        this.wheelStep = this.textLayout.lineHeight; // pas par cran de molette
        // Drag de la barre de scroll verticale
        this._dragScrollbarY = false;
        this._dragScrollbarYOffset = 0; // écart souris->haut du thumb
        // Drag de la barre de scroll horizontale
        this._dragScrollbarX = false;
        this._dragScrollbarXOffset = 0; // écart souris->gauche du thumb
    }
    initialize(){
        super.initialize();
        // Spécialise les modules Input/Draw si nécessaire (au cas où la Factory de base a mis des valeurs par défaut)
        this.Input.Keyboard = new TextKeyboard(this);
        this.Input.Mouse = new TextMouse(this);
        this.Geometric.Draw = new DrawTextControl(this);
        // Maintenant que Geometric est présent, on peut activer les capacités
        this.canResize = true;
        this.canMove = true;
        this.Border.left = this.Border.left || 6;
        this.Border.top = this.Border.top || 6;
        this.Border.right = this.Border.right || 6;
        this.Border.bottom = this.Border.bottom || 6;
        // Activer le clipping de contenu
        this.clip = !!this.clipContent;
    }
    // Réinitialise l'état de clignotement du caret et le force visible
    resetCaretBlink(){
        this._showCaret = true;
        this._blinkTimer = Date.now();
    }
    // Prise de focus: fait remonter ce contrôle et force l'affichage du caret
    onFocus(){
        super.onFocus();
        this.resetCaretBlink();
        this.invalidate();
    }
    set text(value){ this.textModel.setText(value); this.selection.collapseTo(Math.min(this.selection.head, this.textModel.text.length)); this.invalidate(); }
    get text(){ return this.textModel.text; }
    invalidate(){ this._dirty = true; }
    onDraw(paint, x, y){
        if(this._dirty){ this.textLayout.ensure(); this._dirty = false; }
        // Auto-resize avant le dessin des enfants
        this.applyAutoResize();
        super.onDraw(paint, x, y);
        // clignotement caret simple
        const now = Date.now();
        if(now - this._blinkTimer > 500){ this._showCaret = !this._showCaret; this._blinkTimer = now; }
    }
    // Saisie texte
    typeText(s){
        this.pushHistory();
        const sel = this.selection; const m = this.textModel;
        if(!sel.empty){ m.deleteRange(sel.start, sel.end); sel.collapseTo(sel.start); }
        m.insertAt(sel.start, s, this.currentStyle);
        sel.collapseTo(sel.start + s.length);
        this._preferredX = this.textLayout.xForIndex(this.selection.head);
        this.resetCaretBlink();
        if(this.keepCaretVisible) this.ensureCaretVisible();
        this.invalidate();
    }
    // Mouvement caret
    moveCaretHoriz(dir, extend){
        const m = this.textModel; const sel = this.selection;
        let pos = extend ? sel.head : sel.end;
        pos += dir;
        pos = Math.max(0, Math.min(m.text.length, pos));
        if(extend){ sel.head = pos; } else { sel.collapseTo(pos); }
        this._preferredX = this.textLayout.xForIndex(this.selection.head);
        this.resetCaretBlink();
        if(this.keepCaretVisible) this.ensureCaretVisible();
        this.invalidate();
    }
    moveCaretVertical(dir, extend){
        const m = this.textModel; const sel = this.selection;
        const head = sel.head;
        const layout = this.textLayout;
        const currentLine = layout.lineIndexOf(head);
        const targetLine = Math.max(0, Math.min(currentLine + dir, layout.ensure().lines.length - 1));
        // colonne visuelle préférée
        if(this._preferredX == null){ this._preferredX = layout.xForIndex(head); }
        const idx = layout.indexForX(targetLine, this._preferredX);
        if(extend){ sel.head = idx; } else { sel.collapseTo(idx); }
        // Si on atteint une extrémité (haut/bas), corrige la colonne préférée pour la conserver sur prochains moves
        this._preferredX = layout.xForIndex(sel.head);
        this.resetCaretBlink();
        if(this.keepCaretVisible) this.ensureCaretVisible();
        this.invalidate();
    }
    moveLineBoundary(toStart, extend){
        const layout = this.textLayout.ensure();
        const head = this.selection.head;
        let lineIdx = 0;
        for(let i=0;i<layout.lines.length;i++){ if(head >= layout.lines[i].start && head <= layout.lines[i].end){ lineIdx = i; break; } }
        const L = layout.lines[lineIdx];
        // Ignore le '\n' final pour la fin de ligne
        const endNoNL = (this.textModel.text[L.end-1] === '\n') ? L.end-1 : L.end;
        const pos = toStart ? L.start : endNoNL;
        if(extend){ this.selection.head = pos; } else { this.selection.collapseTo(pos); }
        // Met à jour la colonne préférée
        this._preferredX = this.textLayout.xForIndex(this.selection.head);
        this.resetCaretBlink();
        if(this.keepCaretVisible) this.ensureCaretVisible();
        this.invalidate();
    }
    // PageUp/PageDown: déplacement d'une page de lignes et scroll associé
    pageMove(dir, extend){
        const lineH = this.textLayout.lineHeight;
        const viewLines = Math.max(1, Math.floor(Math.max(0, this.innerHeight) / lineH));
        const deltaLines = Math.max(1, viewLines - 1) * (dir < 0 ? -1 : 1);
        // déplace le caret par lignes visibles
        const layout = this.textLayout.ensure();
        const head = this.selection.head;
        const currentLine = this.textLayout.lineIndexOf(head);
        const targetLine = Math.max(0, Math.min(currentLine + deltaLines, layout.lines.length - 1));
        if(this._preferredX == null){ this._preferredX = this.textLayout.xForIndex(head); }
        const idx = this.textLayout.indexForX(targetLine, this._preferredX);
        if(extend){ this.selection.head = idx; } else { this.selection.collapseTo(idx); }
        this._preferredX = this.textLayout.xForIndex(this.selection.head);
        // ajuste le scroll d'une page
        this._scrollY = Math.max(0, this._scrollY + deltaLines * lineH);
        // bornage
        const contentH = layout.lines.length * lineH;
        const maxY = Math.max(0, contentH - Math.max(0, this.innerHeight));
        this._scrollY = Math.max(0, Math.min(this._scrollY, maxY));
        this.resetCaretBlink();
        if(this.keepCaretVisible) this.ensureCaretVisible();
        this.invalidate();
    }
    // Ctrl+Home / Ctrl+End: aller au début/fin du document
    moveDocumentBoundary(toStart, extend){
        const pos = toStart ? 0 : this.textModel.text.length;
        if(extend){ this.selection.head = pos; } else { this.selection.collapseTo(pos); }
        // scroll au début/fin
        if(toStart){ this._scrollY = 0; }
        else {
            const lines = this.textLayout.ensure().lines;
            const contentH = lines.length * this.textLayout.lineHeight;
            const maxY = Math.max(0, contentH - Math.max(0, this.innerHeight));
            this._scrollY = Math.max(0, maxY);
        }
        this._preferredX = this.textLayout.xForIndex(this.selection.head);
        this.resetCaretBlink();
        if(this.keepCaretVisible) this.ensureCaretVisible();
        this.invalidate();
    }
    // Clipboard helpers (meilleurs résultats en HTTPS/permissions)
    async copySelection(cut=false){
        try{
            const sel = this.selection; if(sel.empty) return;
            const txt = this.textModel.text.slice(sel.start, sel.end);
            if(navigator.clipboard && navigator.clipboard.writeText){ await navigator.clipboard.writeText(txt); }
            if(cut){ this.textModel.deleteRange(sel.start, sel.end); this.selection.collapseTo(sel.start); this.invalidate(); }
        }catch(_){ /* fallback: ignoré */ }
    }
    async pasteClipboard(){
        try{
            if(navigator.clipboard && navigator.clipboard.readText){ const t = await navigator.clipboard.readText(); this.typeText(t); }
        }catch(_){ /* pas d'autorisation */ }
    }
    // Historique
    snapshot(){ return { text: this.textModel.text, sel: { a:this.selection.anchor, h:this.selection.head } }; }
    restore(state){
        this.textModel.setText(state.text);
        this.selection.anchor = state.sel.a; this.selection.head = state.sel.h;
        this.invalidate();
    }
    pushHistory(){
        const s = this.snapshot();
        this._history.push(s);
        if(this._history.length > this._historyLimit) this._history.shift();
        this._redo.length = 0;
    }
    undo(){
        if(this._history.length === 0) return;
        const current = this.snapshot();
        const prev = this._history.pop();
        this._redo.push(current);
        this.restore(prev);
    }
    redo(){
        if(this._redo.length === 0) return;
        const current = this.snapshot();
        const next = this._redo.pop();
        this._history.push(current);
        this.restore(next);
    }
    // Rich text: toggle/apply style
    toggleStyle(prop){
        const sel = this.selection;
        if(!sel.empty){
            this.pushHistory();
            this.textModel.applyStyle(sel.start, sel.end, prop, true);
            if(this.keepCaretVisible) this.ensureCaretVisible();
            this.invalidate();
        } else {
            // change typing style
            this.currentStyle[prop] = !this.currentStyle[prop];
        }
    }

    // --- Scrolling & Auto-resize helpers ---
    get innerWidth(){
        return this.width - this.Border.left - this.Border.right - this.textLayout.paddingLeft*2;
    }
    get innerHeight(){
        return this.height - this.Border.top - this.Border.bottom - this.textLayout.paddingTop*2;
    }
    ensureCaretVisible(){
        const lines = this.textLayout.ensure().lines;
        if(lines.length === 0) return;
        const head = this.selection.head;
        const li = this.textLayout.lineIndexOf(head);
        const lineTop = li * this.textLayout.lineHeight;
        const lineBottom = lineTop + this.textLayout.lineHeight;
        const viewTop = this._scrollY;
        const viewBottom = this._scrollY + Math.max(0, this.innerHeight);
        if(lineTop < viewTop){ this._scrollY = lineTop; }
        else if(lineBottom > viewBottom){ this._scrollY = lineBottom - Math.max(0, this.innerHeight); }
        // bornage
        const contentH = lines.length * this.textLayout.lineHeight;
        const maxY = Math.max(0, contentH - Math.max(0, this.innerHeight));
        this._scrollY = Math.max(0, Math.min(this._scrollY, maxY));
    }
    applyAutoResize(){
        const lines = this.textLayout.ensure().lines;
        // Auto-resize vertical
        if(this.autoResizeY){
            const idealInnerH = lines.length * this.textLayout.lineHeight;
            const idealH = this.Border.top + this.Border.bottom + this.textLayout.paddingTop*2 + idealInnerH;
            const minH = Math.max(this.minHeight||0, 0);
            const maxH = Math.max(this.maxHeight||0, minH);
            const clamped = Math.max(minH, Math.min(idealH, maxH));
            if(clamped !== this.height){ this.height = clamped; }
        }
        // Auto-resize horizontal (optionnel)
        if(this.autoResizeX){
            // largeur maximale des lignes (approx: mesurer le texte brut)
            const paint = this.form && this.form.paint;
            if(paint){
                paint.save();
                paint.font = this.textLayout.font;
                let maxLineW = 0;
                for(const L of lines){
                    const w = paint.measureText(L.text).width;
                    if(w > maxLineW) maxLineW = w;
                }
                paint.restore();
                const idealInnerW = maxLineW;
                const idealW = this.Border.left + this.Border.right + this.textLayout.paddingLeft*2 + idealInnerW;
                const minW = Math.max(this.minWidth||0, 0);
                const maxW = Math.max(this.maxWidth||0, minW);
                const clamped = Math.max(minW, Math.min(idealW, maxW));
                if(clamped !== this.width){ this.width = clamped; }
            }
        }
        // Bornage du scroll après resize
        const contentH = lines.length * this.textLayout.lineHeight;
        const maxY = Math.max(0, contentH - Math.max(0, this.innerHeight));
        this._scrollY = Math.max(0, Math.min(this._scrollY, maxY));
    }
    // Configure un viewport fixe (désactive l'auto-resize Y et applique une hauteur optionnelle)
    useFixedViewport(height){
        this.autoResizeY = false;
        if(typeof height === 'number' && isFinite(height) && height > 0){
            this.height = height;
        }
        this.invalidate();
    }
}

// Souris pour TextControl: placement du caret et sélection simple avec Shift
/**
 * Gestion souris pour TextControl:
 * - clic gauche: place le caret (hit test)
 * - Shift+clic: étend la sélection jusqu'à la position cliquée
 */
class TextMouse extends Mouse{
    constructor(control){ super(control); }
    /**
     * Mise à jour continue lors du déplacement de la souris.
     * Utilisée ici pour étendre la sélection pendant le drag.
     */
    hover(){
        super.hover();
        const c = this.control;
        if(c._selecting){
            const idx = c.textLayout.xyToCaret(mouse.x, mouse.y);
            c.selection.head = idx;
            c.resetCaretBlink && c.resetCaretBlink();
            c.invalidate();
        }
    }
    /**
     * Mouse down gauche: initialise le début de sélection.
     * Gère aussi le double-clic pour sélectionner un mot complet.
     */
    clickLeft(){
        const c = this.control;
        const now = Date.now();
        const idx = c.textLayout.xyToCaret(mouse.x, mouse.y);
        const dbl = (now - c._lastClickTime) < 300 && Math.abs(idx - c._lastClickIndex) <= 1;
        if(typeof Modifiers !== 'undefined' && Modifiers && Modifiers.shift){
            // Étend la sélection depuis l'ancre
            c.selection.head = idx;
        } else if(dbl){
            // Sélection du mot sous le curseur
            const range = c.getWordRangeAt(idx);
            c.selection.setRange(range.start, range.end);
        } else {
            // Nouveau point d'insertion et début de drag select
            c.selection.collapseTo(idx);
            c.onFocus && c.onFocus();
            c._selecting = true;
        }
        c._lastClickTime = now;
        c._lastClickIndex = idx;
        // Définit la colonne préférée pour la navigation verticale
        c._preferredX = c.textLayout.xForIndex(c.selection.head);
        c.resetCaretBlink && c.resetCaretBlink();
        c.invalidate();
    }
    /** Mouse up gauche: termine la sélection par glisser. */
    clickLeftUp(){
        const c = this.control;
        c._selecting = false;
        // Termine un drag éventuel de scrollbar
        c._dragScrollbarY = false;
        c._dragScrollbarX = false;
    }
    /** Molette: scroll vertical (et horizontal avec Shift) */
    wheel(deltaX, deltaY){
        const c = this.control;
        // Si Shift, utiliser deltaY pour le scroll horizontal si activé
        let dx = 0, dy = 0;
        if(typeof Modifiers !== 'undefined' && Modifiers && Modifiers.shift && c.scrollX){
            dx = (deltaY || 0);
        } else {
            dx = (deltaX || 0);
            dy = (deltaY || 0);
        }
        // Appliquer un pas raisonnable si les deltas sont unitaires
        const step = c.wheelStep || c.textLayout.lineHeight || 16;
        // Si les deltas semblent être par "crans" (petits), amplifier
        if(Math.abs(dx) > 0 && Math.abs(dx) < 1) dx *= step;
        if(Math.abs(dy) > 0 && Math.abs(dy) < 1) dy *= step;
        c.scrollBy(dx, dy);
    }
    // Pendant un drag de scrollbar, on utilise hover() comme callback de suivi pour mettre à jour scrollY
    hover(){
        const c = this.control;
        if(c._dragScrollbarY){
            const innerX = c.form.Inside.x + c.x + c.Border.left + c.textLayout.paddingLeft;
            const innerY = c.form.Inside.y + c.y + c.Border.top + c.textLayout.paddingTop;
            const innerW0 = Math.max(0, c.width - c.Border.left - c.Border.right - c.textLayout.paddingLeft*2);
            const innerH = Math.max(0, c.height - c.Border.top - c.Border.bottom - c.textLayout.paddingTop*2);
            const lines = c.textLayout.ensure().lines;
            const contentH = lines.length * c.textLayout.lineHeight;
            const hasVScroll = !!c.showScrollbarY && (contentH > innerH);
            if(!hasVScroll){ c._dragScrollbarY = false; return; }
            const sbW = c.scrollbarWidth || 8;
            const innerW = Math.max(0, innerW0 - sbW);
            const trackX = innerX + innerW;
            const trackY = innerY;
            const trackH = innerH;
            const maxScroll = Math.max(1, contentH - innerH);
            const thumbH = Math.max(20, Math.floor(innerH * (innerH / contentH)));
            const thumbMaxY = innerH - thumbH;
            // Nouvelle position du haut du thumb basée sur la souris
            let newThumbTop = Math.max(0, Math.min(thumbMaxY, (mouse.y - trackY) - (c._dragScrollbarYOffset||0)));
            const newScroll = Math.floor((newThumbTop / thumbMaxY) * maxScroll);
            c._scrollY = Math.max(0, Math.min(newScroll, maxScroll));
            c.invalidate();
            return;
        }
        if(c._dragScrollbarX){
            const innerX = c.form.Inside.x + c.x + c.Border.left + c.textLayout.paddingLeft;
            const innerY = c.form.Inside.y + c.y + c.Border.top + c.textLayout.paddingTop;
            const innerW0 = Math.max(0, c.width - c.Border.left - c.Border.right - c.textLayout.paddingLeft*2);
            const innerH0 = Math.max(0, c.height - c.Border.top - c.Border.bottom - c.textLayout.paddingTop*2);
            const lines = c.textLayout.ensure().lines;
            // mesurer largeur contenu
            let contentW = 0; const paint = c.form && c.form.paint; if(paint){ paint.save(); paint.font = c.textLayout.font; for(const L of lines){ contentW = Math.max(contentW, paint.measureText(L.text).width); } paint.restore(); }
            // recalcul innerH/innerW comme dans draw
            const allowHX = !!c.showScrollbarX && (!!c.scrollX || c.wrap === false);
            const hasHScroll = allowHX && (contentW > innerW0);
            const sbH = hasHScroll ? (c.scrollbarWidth || 8) : 0;
            const innerH = Math.max(0, innerH0 - sbH);
            // tenir compte de la barre verticale potentielle
            const contentH = lines.length * c.textLayout.lineHeight;
            const hasVScroll = !!c.showScrollbarY && (contentH > innerH);
            const sbW = hasVScroll ? (c.scrollbarWidth || 8) : 0;
            const innerW = Math.max(0, innerW0 - sbW);
            const trackX = innerX;
            const trackY = innerY + innerH;
            const maxScrollX = Math.max(1, contentW - innerW);
            const thumbW = Math.max(20, Math.floor(innerW * (innerW / contentW)));
            const thumbMaxX = innerW - thumbW;
            let newThumbLeft = Math.max(0, Math.min(thumbMaxX, (mouse.x - trackX) - (c._dragScrollbarXOffset||0)));
            const newScrollX = Math.floor((newThumbLeft / thumbMaxX) * maxScrollX);
            c._scrollX = Math.max(0, Math.min(newScrollX, maxScrollX));
            c.invalidate();
            return;
        }
        // Comportement hover existant: sélection d'enfant etc.
        super.hover();
    }
}

// Helpers de TextControl pour bornes de mot/ligne
// Implémentés sous la classe pour rester proches de l'utilisation dans TextMouse
TextControl.prototype.getWordRangeAt = function(index){
    const text = this.textModel.text;
    const n = text.length;
    index = Math.max(0, Math.min(index, n));
    if(n === 0){ return { start: 0, end: 0 }; }
    // Définition simple des « séparateurs »
    const isSep = (ch)=> /\s|[\-_,.;:!?()\[\]{}"'`]/.test(ch);
    // Si le caret est à la fin d'un mot (sur un séparateur), regarde à gauche
    let i0 = index;
    if(i0 > 0 && i0 < n && isSep(text[i0]) && !isSep(text[i0-1])) i0 = i0-1;
    // Étend vers la gauche
    let start = i0;
    while(start > 0 && !isSep(text[start-1])) start--;
    // Étend vers la droite
    let end = i0;
    while(end < n && !isSep(text[end])) end++;
    return { start, end };
};
