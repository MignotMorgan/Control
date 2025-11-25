
class Factory {
    create(x, y, width, height=width, top=10, right=top, bottom=top, left=right){

        let control = this.createControl();

        control.Geometric = this.createGeometric(control, x, y, width, height, top, right, bottom, left);
        control.Lineage = this.createLineage(control);
        control.Input = this.createInput(control);
        control.Draw = this.createDraw(control);
        control.initialize();

        return control;
    }
    
    createControl(){ return new Control(); }
    createPaint(x, y, width, height, hide = false){ return null; }
    createGeometric(control, x, y, width, height, top, right, bottom, left){
        let geometric = new Geometric(control);
        geometric.Rectangle = this.createRectangle(control, x, y, width, height, top, right, bottom, left);
        geometric.Transformation = this.createTransformation(control);
        return geometric;
        }
    createRectangle(control, x, y, width, height, top, right, bottom, left){
        let rectangle = new Rectangle(control);
        rectangle.Location = this.createPoint(x, y);
        rectangle.Absolute = this.createPoint(x, y);
        rectangle.Inside = this.createPoint(x, y);
        rectangle.Size = this.createSize(width, height);
        rectangle.Border = this.createBorder(top, right, bottom, left);
        return rectangle;
    }
    createPoint(x, y){ return new Point(x, y); }
    createSize(width, height){ return new Size(width, height); }
    createBorder(top, right, bottom, left){ return new Border(top, right, bottom, left); }

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

    createDraw(control){
        const draw = new Draw(control); 
        draw.Theme = this.createTheme();
        return draw;
    }
    createTheme(){ return new Theme(); }
    createLineage(control){
        let lineage = new Lineage(control);
        lineage.Drag = this.createDrag(control);
        lineage.Drop = this.createDrop(control);
        return lineage;
    }
    createDrag(control){ return new Drag(control); }
    createDrop(control){ return new Drop(control); }
    
    createInput(control){
        let input = new Input(control);
        input.Mouse = this.createMouse(control);
        input.Keyboard = this.createKeyboard(control);
        return input;
    }
    createMouse(control){ return new Mouse(control); }
    createKeyboard(control){ return new Keyboard(control); }

}


