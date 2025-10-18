/**
 * Fabrique d'objets UI: centralise la création d'un contrôle complet
 * (géométrie, transformations, dessin, hiérarchie, entrées, paint optionnel).
 * Permet de spécialiser le type de contrôle via héritage (ex: FactoryForm).
 */
class Factory{
    /**
     * Crée un contrôle et initialise ses sous-composants essentiels.
     * @param {number} x Position absolue initiale (Location.x)
     * @param {number} y Position absolue initiale (Location.y)
     * @param {number} width Largeur
     * @param {number} [height=width] Hauteur (par défaut = width)
     * @param {number} [top=10] Bordure supérieure
     * @param {number} [right=top] Bordure droite
     * @param {number} [bottom=top] Bordure inférieure
     * @param {number} [left=right] Bordure gauche
     * @returns {Control} Contrôle prêt à l'emploi
     */
    create(x, y, width, height=width, top=10, right=top, bottom=top, left=right){

        let control = this.createControl();

        control.Geometric = this.createGeometric(control, x, y, width, height, top, right, bottom, left);
        control.Lineage = this.createLineage(control);
        control.Input = this.createInput(control);
        control.Draw = this.createDraw(control);
        //control.paint = this.createPaint(x, y, width, height);
        control.initialize();

        return control;
    }
    
    /** Crée l'instance de base (peut être surchargée pour retourner une sous-classe). */
    createControl(){ return new Control(); }
    /** Crée un support de dessin pour ce contrôle (par défaut null, surcharge dans FactoryForm). */
    createPaint(x, y, width, height, hide = false){ return null; }
    createGeometric(control, x, y, width, height, top, right, bottom, left){
        let geometric = new Geometric(control);
        geometric.Rectangle = this.createRectangle(control, x, y, width, height, top, right, bottom, left);
        geometric.Transformation = this.createTransformation(control);
        //geometric.Draw = this.createDraw(control);
        return geometric;
        }
    /** Crée une Rectangle rectangulaire avec Location/Inside/Size/Border initialisés. */
    createRectangle(control, x, y, width, height, top, right, bottom, left){
        let rectangle = new Rectangle(control);
        rectangle.Location = this.createLocation(x, y);
        rectangle.Absolute = this.createLocation(x, y);
        rectangle.Inside = this.createLocation(x, y);
        rectangle.Size = this.createSize(width, height);
        rectangle.Border = this.createBorder(top, right, bottom, left);
        return rectangle;
    }
    createLocation(x, y){ return new Location(x, y); }
    createSize(width, height){ return new Size(width, height); }
    createBorder(top, right, bottom, left){ return new Border(top, right, bottom, left); }

    /** Crée le conteneur Transformation et ses opérations. */
    createTransformation(control){
        let transformation = new Transformation(control);
        transformation.Move = this.createMove(control);
        transformation.Resize = this.createResize(control);
        transformation.Scale = this.createScale(control);
        return transformation;
    }    
    createMove(control){return new Move(control); }
    createResize(control){return new Resize(control); }
    createScale(control){return new Scale(control); }

    /** Crée le module de dessin pour ce contrôle (Draw par défaut). */
    createDraw(control){return new Draw(control); }

    /** Crée le module hiérarchique (Lineage) et les extensions Drag/Drop. */
    createLineage(control){
        let lineage = new Lineage(control);
        lineage.Drag = this.createDrag(control);
        lineage.Drop = this.createDrop(control);
        return lineage;
    }
    createDrag(control){ return new Drag(control); }
    createDrop(control){ return new Drop(control); }
    
    /** Crée les modules d’entrée (souris/clavier). */
    createInput(control){
        let input = new Input(control);
        input.Mouse = this.createMouse(control);
        input.Keyboard = this.createKeyboard(control);
        return input;
    }
    createMouse(control){ return new Mouse(control); }
    createKeyboard(control){ return new Keyboard(control); }

}



/**
 * Fabrique spécialisée pour Form:
 * - Retourne une instance de `Form` au lieu de `Control`.
 * - Associe un `PaintCanvas` à la Form.
 * - Utilise des versions adaptées de Draw/Move/Resize/Scale pour la Form.
 */
class FactoryForm extends Factory{  
    createControl(){return new Form(); }
    createPaint(x, y, width, height, hide = false){ return new PaintCanvas(x, y, width, height, hide);}
    createRectangle(control, x, y, width, height, top, right, bottom, left){
        let rectangle = new Rectangle(control);
        rectangle.Location = this.createLocation(0, 0);
        rectangle.Absolute = this.createLocation(0, 0);
        rectangle.Inside = this.createLocation(x, y);
        rectangle.Size = this.createSize(width, height);
        rectangle.Border = this.createBorder(top, right, bottom, left);
        return rectangle;
    }
    createDraw(control){
        const draw = new DrawForm(control);
        const paint = this.createPaint(control.Inside.x, control.Inside.y, control.width, control.height);
        draw.Paint = paint;
        //if(control && control instanceof Form){ control.paint = paint; }
        return draw;
    }
    createMove(control){ return new MoveForm(control); }
    createResize(control){ return new ResizeForm(control); }
    createScale(control){ return new ScaleForm(control); }
}

/**
 * Fabrique dédiée aux contrôles texte riches.
 * Retourne des instances de `TextControl` avec modules adaptés (Draw/Keyboard).
 */
class FactoryText extends Factory{
    /** @returns {TextControl} */
    createControl(){ return new TextControl(); }
    /** @returns {DrawTextControl} */
    createDraw(control){ return new DrawTextControl(control); }
    /** @returns {TextKeyboard} */
    createKeyboard(control){ return new TextKeyboard(control); }
    /** @returns {TextMouse} */
    createMouse(control){ return new TextMouse(control); }
}