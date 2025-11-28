import { Core } from './core.js';

export class ThemeImages {
    static #images = new Map();
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

export class Themes {
    static #themes = new Map();
    static #default = null;
    static get default(){
        if(this.#default === null){this.#default = new Theme();}
        return this.#default;
    }
    static get(name){
        if(this.#themes.has(name)){return this.#themes.get(name);}
        return this.default;
    }
    static add(theme){
        if(this.#themes.has(theme.name)){return this.#themes.get(theme.name);}
        this.#themes.set(theme.name, theme);
        return theme;
    }
}

export class Theme {
    #name;
    #customized = false;
    #background = {
        color: "#ffffff", 
        image:{Url: "", mode: 'stretch'}, 
        rectangle:{ color: "#000", lineWidth: 2 },
        border: { color: "#cf2929ff", rectangle:{ color: "#000", lineWidth: 2} },
        font : { family: "Arial", size: 16, style: "bold", color: "#000" }
    };
    #drag = { color: "#2979ff", alpha: 0.5 };
    #text = { 
        font : { family: "Arial", size: 16, style: "bold", color: "#000" },
        cursor:{ color: "#000", lineWidth: 1 },
        margin: Core.TEXTMARGIN, 
        scroll: Core.TEXTSCROLL 
    };
    
    constructor(name = "default"){
        this.#name = name;
    }
    
    get name(){ return this.#name;}
    get background(){ return this.#background;}
    get drag(){ return this.#drag;}
    get text(){ return this.#text;}
    get backgroundImage(){ return ThemeImages.get(this.background.image.Url);}
    set backgroundImage(value){this.background.image.Url = value; ThemeImages.add(value);}

    get customized(){ return this.#customized; }
    set customized(value){ this.#customized = value; }
    clone(name = this.name){
        const theme = new Theme(name);
        theme.background.color = this.background.color;
        theme.background.image.Url = this.background.image.Url;
        theme.background.image.mode = this.background.image.mode;
        theme.background.rectangle.color = this.background.rectangle.color;
        theme.background.rectangle.lineWidth = this.background.rectangle.lineWidth;
        theme.background.border.color = this.background.border.color;
        theme.background.border.rectangle.color = this.background.border.rectangle.color;
        theme.background.border.rectangle.lineWidth = this.background.border.rectangle.lineWidth;
        theme.background.font.family = this.background.font.family;
        theme.background.font.size = this.background.font.size;
        theme.background.font.style = this.background.font.style;
        theme.background.font.color = this.background.font.color;
        theme.drag.color = this.drag.color;
        theme.drag.alpha = this.drag.alpha;
        return theme;
    }   
}

