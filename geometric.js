/**
 * Représente une position 2D absolue (coordonnées en pixels)
 * Utilisée pour la position de la figure (`Location`) et la position interne (`Inside`).
 */
class Location {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Représente la taille (largeur x hauteur) en pixels d'une figure.
 */
class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

/**
 * Représente l'épaisseur des bordures d'un contrôle (haut, droite, bas, gauche).
 */
class Border {
    constructor(top, right, bottom, left) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
}

/**
 * Modèle de base d'une figure rectangulaire liée à un contrôle.
 * - Location: position absolue du contrôle dans la Form.                               Position dans le canvas. (Draw)
 * - Inside: position interne du contenu (relative à la zone intérieure du parent).     Position dans le Control parent. (Transformation : Move, Resize, Scale)

* - !!!!! Inverser Location et Inside. Location = position dans le parent. Absolute = position dans le canvas. (plus intuitif)
 
* - Size: taille du contrôle.
* - Border: épaisseur des bordures (définit la zone intérieure visible utile).
*/
class Rectangle {
    constructor(control){
        this.control = control;
        this.Location;
        this.Inside;
        this.Size;
        this.Border;
    }
    containMouse(){
        return this.contains(mouse.x, mouse.y);
    }
    contains(x, y){
        const control = this.control;
        const location = this.Location;
        return ( x > control.form.Inside.x +  location.x && x < control.form.Inside.x + location.x + this.Size.width 
            && y > control.form.Inside.y + location.y && y < control.form.Inside.y + location.y + this.Size.height );
    }
}

/**
 * Conteneur géométrique attaché à un contrôle.
 * Regroupe la figure (Rectangle), les transformations (Move/Resize/Scale), et le rendu (Draw).
 */
class Geometric{
    constructor(control){
        this.control = control;
        this.Rectangle;
        this.Transformation;
        this.Draw;
    }
}
