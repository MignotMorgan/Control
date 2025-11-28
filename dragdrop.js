export class Drag {
    #active = false;
    constructor(control){
        this.control = control;
    }
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }

    start(){}
    validate(target){ return true; }
    enter(){}
    over(){}
    leave(){}
    drop(){}
}

export class Drop {
    #active = false;
    constructor(control){
        this.control = control;
    }
    get active(){ return this.#active === true; }
    set active(value){ this.#active = !!value; }

    target(){
        if(this.active){ return this.control; }
        else if(!this.control.canMove && this.control.parent){ return this.control.parent.Drop.target(); }
        else{ return null; }
    }
    validate(source){ return true; }
    enter(){}
    over(){}
    leave(){}
    drop(){}
}
