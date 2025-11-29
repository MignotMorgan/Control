import { Control } from './control.js';
import { Geometric, Rectangle, Point, Size, Border } from './geometric.js';
import { Transformation, Move, Resize, Scale } from './transformation.js';
import { Draw } from './draw.js';
import { Themes } from './theme.js';
import { Lineage } from './lineage.js';
import { Drag, Drop } from './dragdrop.js';
import { Input, Mouse, Keyboard } from './input.js';

export class Factory {
    create(x, y, width, height=width, top=10, right=top, bottom=top, left=right){

        const control = this.createControl();

        control.Geometric = this.createGeometric(control, x, y, width, height, top, right, bottom, left);
        control.Geometric.Rectangle = this.createRectangle(control, x, y, width, height, top, right, bottom, left);
        control.Geometric.Rectangle.Location = this.createLocation(x, y);
        control.Geometric.Rectangle.Absolute = this.createAbsolute(x, y);
        control.Geometric.Rectangle.Inside = this.createInside(x, y);
        control.Geometric.Rectangle.Size = this.createSize(width, height);
        control.Geometric.Rectangle.Border = this.createBorder(top, right, bottom, left);
        control.Geometric.Transformation = this.createTransformation(control);
        control.Geometric.Transformation.Move = this.createMove(control);
        control.Geometric.Transformation.Resize = this.createResize(control);
        control.Geometric.Transformation.Scale = this.createScale(control);
        control.Lineage = this.createLineage(control);
        control.Lineage.Drag = this.createDrag(control);
        control.Lineage.Drop = this.createDrop(control);
        control.Input = this.createInput(control);
        control.Input.Mouse = this.createMouse(control);
        control.Input.Keyboard = this.createKeyboard(control);
        control.Draw = this.createDraw(control);
        control.Draw.Theme = this.createTheme();
        control.Draw.Paint = this.createPaint(control.Inside.x, control.Inside.y, control.Size.width, control.Size.height);
        control.initialize();

        return control;
    }
    
    createControl(){ return new Control(); }
    createGeometric(control, x, y, width, height, top, right, bottom, left){ return new Geometric(control); }
    createRectangle(control, x, y, width, height, top, right, bottom, left){ return new Rectangle(control); }
    createLocation(x, y){ return new Point(x, y); }
    createAbsolute(x, y){ return new Point(x, y); }
    createInside(x, y){ return new Point(x, y); }
    createSize(width, height){ return new Size(width, height); }
    createBorder(top, right, bottom, left){ return new Border(top, right, bottom, left); }
    createTransformation(control){ return new Transformation(control); }
    createMove(control){return new Move(control); }
    createResize(control){return new Resize(control); }
    createScale(control){return new Scale(control); }
    createLineage(control){ return new Lineage(control); }
    createDrag(control){ return new Drag(control); }
    createDrop(control){ return new Drop(control); }
    createInput(control){ return new Input(control); }
    createMouse(control){ return new Mouse(control); }
    createKeyboard(control){ return new Keyboard(control); }
    createDraw(control){ return new Draw(control); }
    createTheme(){ return Themes.default; }
    createPaint(x, y, width, height, hide = false){ return null; }

}


