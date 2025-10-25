class DragDropManager {
  static start() {
    const dnd = dragdrop;
    const control = mousehover.control;
    dnd.control = control;
    dnd.parent = control.parent || null;
    dnd.startX = mouse.x;
    dnd.startY = mouse.y
    dnd.offsetX = mouse.x - control.form.Inside.x - control.Absolute.x;
    dnd.offsetY = mouse.y - control.form.Inside.y - control.Absolute.y;
    dnd.srcX = control.Absolute.x;
    dnd.srcY = control.Absolute.y;
    dnd.armed = true;
    dnd.active = false;
    control.Drag.start();
  }
  static move() {
    const dnd = dragdrop;
    const control = dnd.control;
    if (dnd.armed && !dnd.active){
      const dx = Math.abs(mouse.x - dnd.startX);
      const dy = Math.abs(mouse.y - dnd.startY);
      if (dx + dy >= Config.DRAG_ACTIVATION_THRESHOLD){
        dnd.active = true;
      }
    }
    if(!dnd.active){ return; }
    const xForm = mouse.x - control.form.Inside.x - dnd.offsetX;
    const yForm = mouse.y - control.form.Inside.y - dnd.offsetY;
    control.Transformation.Move.to(xForm, yForm);
    dnd.target = mousehover.control ? mousehover.control.Drop.target() : null;
    if(dnd.target && dnd.target.clip){ this.autoScroll(dnd.target, mouse.x, mouse.y); }
  }
  static dropControl() {
    const dnd = dragdrop;
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
      const relX = desiredFormX - target.x - target.Border.left;
      const relY = desiredFormY - target.y - target.Border.top;
        if(control.parent) control.parent.Lineage.remove(control);
        control.Inside.x = relX;
        control.Inside.y = relY;
        target.add(control);

    } else {
      control.Transformation.Move.to(dnd.srcX, dnd.srcY);
    }
    this.reset();
  }

  static autoScroll(container, mouseX, mouseY) {
    if(!container || !container.clip) return;
    const innerW = container.width - container.Border.left - container.Border.right;
    const innerH = container.height - container.Border.top - container.Border.bottom;
    if(innerW <= 0 || innerH <= 0) return;
    const threshold = Config.AUTOSCROLL_THRESHOLD;
    const localX = mouseX - container.form.Inside.x - container.Absolute.x - container.Border.left;
    const localY = mouseY - container.form.Inside.y - container.Absolute.y - container.Border.top;
    let stepV = 0, stepH = 0;
    if(localY < threshold){ stepV = (threshold - localY) * 0.5; }
    else if(localY > innerH - threshold){ stepV = -(localY - (innerH - threshold)) * 0.5; }
    if(localX < threshold){ stepH = (threshold - localX) * 0.5; }
    else if(localX > innerW - threshold){ stepH = -(localX - (innerW - threshold)) * 0.5; }
    if(stepV === 0 && stepH === 0) return;
    container.Transformation.Move.scroll(stepV, stepH);
  }
   static restore() {
    const dnd = dragdrop;
    const control = dnd.control;
    if(!control){ this.reset(); return; }
    control.Transformation.Move.to(dnd.srcX, dnd.srcY);
    this.reset();
  }
  static reset() {
    dragdrop.armed = false;
    dragdrop.active = false;
    dragdrop.control = null;
    dragdrop.parent = null;
    dragdrop.target = null;
    dragdrop.srcX = 0;
    dragdrop.srcY = 0;
    dragdrop.startX = 0;
    dragdrop.startY = 0;
    dragdrop.offsetX = 0;
    dragdrop.offsetY = 0;
    dragdrop.data = { text: "", files: null };
  }

  static dragenter(){
    if(dragdrop.control){ dragdrop.control.Drag.enter(); }
    if(dragdrop.target){ dragdrop.target.Drop.enter(); }
  }
  static dragover(){
    if(dragdrop.control){ dragdrop.control.Drag.over(); }
    if(dragdrop.target){ dragdrop.target.Drop.over(); }
  }
  static dragleave(){
    if(dragdrop.control){ dragdrop.control.Drag.leave(); }
    if(dragdrop.target){ dragdrop.target.Drop.leave(); }
  }
  static drop(){
    if(dragdrop.control){ dragdrop.control.Drag.drop(); }
    if(dragdrop.target){ dragdrop.target.Drop.drop(); }
  }
}
