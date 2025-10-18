
class Theme {
    #name;
    constructor(control) {
        this.control = control;
        this.#name = "";
    }
    name(){ return this.#name;}
    name(value){this.#name = value;}



}
