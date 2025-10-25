/*
class ThemeManager {
    static #themes
    static #default

    static get themes(){
        if (!this.#themes){this.#themes = new Map();}
        return this.#themes;
    }
    static get default(){
        if (!this.#default){this.#default = new Theme();}
        return this.#default;
    }
    static get(name){
        if (this.themes.has(name)){return this.themes.get(name);}
        return this.default;
    }
    static add(theme){
        if(!this.themes.has(theme.name)){this.themes.set(theme.name, theme);}
    }
}
*/
class ThemeImages {
    static #images = new Map();
    //static get images(){return this.#images;}
    static get(url){
        if(this.#images.has(url)){return this.#images.get(url);}
        return this.add(url);
    }
    static add(url){
        if(this.#images.has(url)){return this.#images.get(url);}
        const image = new Image();
        image.src = url;
        this.#images.set(url, image);
        return image;
    }
}


class Theme {
    #name;
    //#backgroundImage = null;
    constructor() {
        //this.control = control;
        this.#name = "default";
        this.background = {
            color: "#ffffff", 
            image:{Url: "", size: 'stretch'}, 
            rectangle:{ color: "#000", lineWidth: 2 },
            border: { color: "#cf2929ff", rectangle:{ color: "#000", lineWidth: 2} }
        };

        if(this.background.image.Url !== "") ThemeImages.add(this.background.imageUrl);
        //this.border = { color: "#cf2929ff", rectangle:{ color: "#000", lineWidth: 2}};

        this.drag = { color: "#2979ff", alpha: 0.5 };

        //this.#backgroundImage = null;
        //if(this.background.imageUrl){
        //    this.#backgroundImage = new ThemeImage(this.background.imageUrl);
        //}
        /*
        this.background = { color: "white", image: null, repeat: 'repeat', size: 'stretch', offsetX: 0, offsetY: 0 };
        this.border = { color: "black", lineWidth: 1, style: 'solid' };
        this.hover = { color: "red", lineWidth: 2, style: 'solid' };
        this.drop = { color: "blue", lineWidth: 2, style: 'solid' };
        this.resize = { color: "green", lineWidth: 2, style: 'solid' };
        this.drag = { color: "yellow", lineWidth: 2, style: 'solid' };
        */
    }
    get name(){ return this.#name;}
    set name(value){this.#name = value;}
    get backgroundImage(){ return ThemeImages.get(this.background.image.Url);}
    set backgroundImage(value){this.background.image.Url = value; ThemeImages.add(value);}
    
    //get backgroundImage(){ return this.#backgroundImage;}
    //set backgroundImage(value){this.#backgroundImage = value;}


}

/**
 * Représente une image d'arrière-plan utilisable par un thème de contrôle.
 *
 * Propriétés principales:
 * - image: objet image HTML chargé depuis `url`.
 * - repeat: mode de répétition du motif (pattern) ou null pour un affichage unique.
 * - size: stratégie d'ajustement si `repeat` est null.
 * - offsetX/offsetY: décalage du motif ou de l'image dans le fond.
 *
 * Notes d'usage:
 * - Lorsque `repeat` est défini (ex: 'repeat', 'repeat-x', 'repeat-y'), l'image
 *   est utilisée comme motif répété.
 * - Lorsque `repeat` est null, `size` contrôle l'ajustement ('stretch', 'contain', 'cover').
 */
/*
class ThemeImage {

    #loaded;
    constructor(url) {
        this.#loaded = false;
        this.image = new Image();
        this.image.onload = ()=>{ this.#loaded = true; };
        this.image.src = url;
    }
    get loaded(){ return this.#loaded; }
    set loaded(value){ this.#loaded = value; }
}
*/