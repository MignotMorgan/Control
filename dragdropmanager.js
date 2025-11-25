class DragDropManager {
  static start(){
    const mouse = Core.mouse;
    const dnd = Core.dragdrop;
    const control = Core.mousehover.control;
    dnd.control = control;
    dnd.parent = control.parent || null;
    dnd.startX = mouse.x;
    dnd.startY = mouse.y;
    dnd.offsetX = mouse.x - control.form.Inside.x - control.Absolute.x;
    dnd.offsetY = mouse.y - control.form.Inside.y - control.Absolute.y;
    dnd.srcX = control.Absolute.x;
    dnd.srcY = control.Absolute.y;
    dnd.armed = true;
    dnd.active = false;
    control.Drag.start();
  }
  static move(){
    const mouse = Core.mouse;
    const mousehover = Core.mousehover;
    const dnd = Core.dragdrop;
    const control = dnd.control;
    if (dnd.armed && !dnd.active){
      const dx = Math.abs(mouse.x - dnd.startX);
      const dy = Math.abs(mouse.y - dnd.startY);
      if (dx + dy >= Core.DRAG_ACTIVATION){
        dnd.active = true;
      }
    }
    if(!dnd.active){ return; }
    const xForm = mouse.x - control.form.Inside.x - dnd.offsetX;
    const yForm = mouse.y - control.form.Inside.y - dnd.offsetY;
    control.Move.to(xForm, yForm);
    dnd.target = mousehover.control ? mousehover.control.Drop.target() : null;
    if(dnd.target && dnd.target.clip){ this.autoScroll(dnd.target, mouse.x, mouse.y); }
  }
  static dropControl(){
    const mouse = Core.mouse;
    const mousehover = Core.mousehover;
    const dnd = Core.dragdrop;
    const control = dnd.control;
    let target = dnd.target;
    if(!control){ this.reset(); return; }
    if(dnd.armed && !dnd.active){ this.reset(); return; }
    if(target === null){ this.restore(); return; }
    let valid = control.Drag.validate(target) && target.Drop.validate(control);
    if(valid && target !== control ){
      const mouseFormX = mouse.x - target.form.Inside.x;
      const mouseFormY = mouse.y - target.form.Inside.y;
      const desiredFormX = mouseFormX - dnd.offsetX;
      const desiredFormY = mouseFormY - dnd.offsetY;
      const relX = desiredFormX - target.Absolute.x - target.Border.left;
      const relY = desiredFormY - target.Absolute.y - target.Border.top;
      if(control.parent) control.parent.Lineage.remove(control);
      control.Inside.x = relX;
      control.Inside.y = relY;
      target.add(control);

    } else {
      control.Move.to(dnd.srcX, dnd.srcY);
    }
    this.reset();
  }

  static autoScroll(container, mouseX, mouseY){
    if(!container || !container.clip) return;
    const innerW = container.Size.width - container.Border.left - container.Border.right;
    const innerH = container.Size.height - container.Border.top - container.Border.bottom;
    if(innerW <= 0 || innerH <= 0) return;
    const threshold = Core.AUTOSCROLL;
    const localX = mouseX - container.form.Inside.x - container.Absolute.x - container.Border.left;
    const localY = mouseY - container.form.Inside.y - container.Absolute.y - container.Border.top;
    let stepV = 0, stepH = 0;
    if(localY < threshold){ stepV = (threshold - localY) * 0.5; }
    else if(localY > innerH - threshold){ stepV = -(localY - (innerH - threshold)) * 0.5; }
    if(localX < threshold){ stepH = (threshold - localX) * 0.5; }
    else if(localX > innerW - threshold){ stepH = -(localX - (innerW - threshold)) * 0.5; }
    if(stepV === 0 && stepH === 0) return;
    container.Move.scroll(stepV, stepH);
  }
   static restore(){
    const dnd = Core.dragdrop;
    const control = dnd.control;
    if(!control){ this.reset(); return; }
    control.Move.to(dnd.srcX, dnd.srcY);
    this.reset();
  }
  static reset(){
    const dnd = Core.dragdrop;
    dnd.armed = false;
    dnd.active = false;
    dnd.control = null;
    dnd.parent = null;
    dnd.target = null;
    dnd.srcX = 0;
    dnd.srcY = 0;
    dnd.startX = 0;
    dnd.startY = 0;
    dnd.offsetX = 0;
    dnd.offsetY = 0;
    dnd.data = { text: "", files: null };
  }

  static dragenter(){
    const dnd = Core.dragdrop;
    if(dnd.control){ dnd.control.Drag.enter(); }
    if(dnd.target){ dnd.target.Drop.enter(); }
  }
  static dragover(){
    const dnd = Core.dragdrop;
    if(dnd.control){ dnd.control.Drag.over(); }
    if(dnd.target){ dnd.target.Drop.over(); }
  }
  static dragleave(){
    const dnd = Core.dragdrop;
    if(dnd.control){ dnd.control.Drag.leave(); }
    if(dnd.target){ dnd.target.Drop.leave(); }
  }
  static drop(){
    const dnd = Core.dragdrop;
    if(dnd.control){ dnd.control.Drag.drop(); }
    if(dnd.target){ dnd.target.Drop.drop(); }
  }
}
