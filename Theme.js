class ThemeImages{
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


class Theme {
    #name;
    constructor(){
        this.#name = "default";
        this.background = {
            color: "#ffffff", 
            image:{Url: "", size: 'stretch'}, 
            rectangle:{ color: "#000", lineWidth: 2 },
            border: { color: "#cf2929ff", rectangle:{ color: "#000", lineWidth: 2} }
        };

        if(this.background.image.Url !== "") ThemeImages.add(this.background.imageUrl);
        this.drag = { color: "#2979ff", alpha: 0.5 };

    }
    get name(){ return this.#name;}
    set name(value){this.#name = value;}
    get backgroundImage(){ return ThemeImages.get(this.background.image.Url);}
    set backgroundImage(value){this.background.image.Url = value; ThemeImages.add(value);}
}