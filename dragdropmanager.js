/*
 Gestionnaire centralisé de Drag & Drop interne (glisser-déposer) pour les contrôles.
 Objectif: coordonner un cycle de glisser-déposer de bout en bout, sans imposer la présentation.

 Principes généraux:
 - «Drag interne» désigne le déplacement d’un contrôle dans l’interface, via la souris.
 - L’état global `dragdrop` mémorise la source, la position d’origine et des informations de suivi.
 - «Repère Form»: toutes les coordonnées calculées/converties tiennent compte de l’offset de la Form et des bordures.
 - «Clip» (clipping): si une cible est clipée, le contenu visible est limité à sa zone intérieure (Inside),
   le placement lors du drop doit rester dans cette zone.
 - «Snapping» (aimantation): optionnel, arrondit la position aux multiples d’une grille (ex: 10 px) pour aligner les éléments.
 - Validation: la cible doit être «drop-able» (canDrop), et des veto personnalisés peuvent s’appliquer via `Drag` et `Drop`.
*/
class DragDropManager {
  /*
   Démarre (arme) un drag potentiel.
   - Enregistre la source et son contexte (parent, position de départ, offset de prise).
   - «offset de prise» = différence souris/coin haut-gauche du contrôle au moment du clic, pour garder
     la même articulation visuelle pendant le déplacement.
  */
  static start() {
    const dnd = dragdrop;
    const control = mousehover.control;
    dnd.control = control;                 // source du drag
    dnd.parent = control.parent || null;   // parent d'origine pour restaurations éventuelles
    dnd.startX = mouse.x;                   // position souris au départ (fenêtre/page)
    dnd.startY = mouse.y
    // Offset de prise calculé dans le repère de la Form (absolu dans la scène)
    dnd.offsetX = mouse.x - control.form.Inside.x - control.x;
    dnd.offsetY = mouse.y - control.form.Inside.y - control.y;
    // Position absolue d'origine (utile en cas d'annulation ou de drop invalide)
    dnd.srcX = control.x;
    dnd.srcY = control.y;
    dnd.armed = true;   // armé: prêt à s'activer si le seuil de mouvement est dépassé
    dnd.active = false; // pas encore actif tant que le seuil n'est pas franchi

    control.Drag.start();
  }

  /*
   Active le drag quand le seuil de mouvement est dépassé.
   - Évite d’activer un drag pour de micro-mouvements involontaires.
   - Une fois actif, on met à jour immédiatement pour un feedback fluide (ghost/position/cible).
  */
  static maybeActivate() {
    const dnd = dragdrop;
    if(!dnd.armed || dnd.active || !dnd.control) return;
    const dx = Math.abs(mouse.x - dnd.startX); // déplacement horizontal depuis le départ
    const dy = Math.abs(mouse.y - dnd.startY); // déplacement vertical depuis le départ
    // Ici, un seuil pourrait être appliqué (ex: dx+dy >= 6). Pour l’instant, activation immédiate.
    dnd.active = true; // passe en mode drag actif
    try { this.move(); } catch(_){ }

  }

  /*
   Met à jour la position de feedback et la cible de drop courante.
   - Déplace visuellement la source en respectant l’offset de prise et le repère de la Form.
   - Recalcule la cible sous la souris (en remontant aux ancêtres acceptant le drop si nécessaire).
   - Déclenche un auto-défilement si la cible est clipée et que la souris frôle ses bords.
  */
  static move() {
    const dnd = dragdrop;
    const control = dnd.control;
    if(!dnd.active || !control) return;
    const xForm = mouse.x - control.form.Inside.x - dnd.offsetX;
    const yForm = mouse.y - control.form.Inside.y - dnd.offsetY;
    control.Transformation.Move.to(xForm, yForm); // feedback visuel (position absolue)
    const hovered = (typeof mousehover !== 'undefined' && mousehover) ? mousehover.control : null;
    const newTarget = this.computeTarget(hovered);
    if(newTarget !== dnd.target){
      const oldTarget = dnd.target; // réservé à des callbacks éventuels (changement de cible)
      dnd.target = newTarget;       // nouvelle cible courante
    }
    if(dnd.target && dnd.target.clip){ this.autoScroll(dnd.target, mouse.x, mouse.y); } // auto-scroll si clip
  }

  /*
   Tente d’effectuer le drop:
   - Calcule la position locale Inside dans la cible (repère cible + bordures).
   - Valide la cible: canDrop, veto côté source (`Drag.validateDrop`) et côté cible (`Drop.validateDrop`).
   - Respecte le clipping: refuse si la position sort de la zone visible.
   - Applique un «snapping» optionnel à une grille.
   - Re-parente la source dans la cible et positionne via `Inside`.
   - Restaure sinon la position d’origine.
  */
  static dropControl(mouseX, mouseY) {
    const dnd = dragdrop;
    const control = dnd.control;
    if(!control){ this.reset(); return; }
    if(dnd.armed && !dnd.active){ this.reset(); return; }
    let target = dnd.target;
    if(!target){
      const hovered = (typeof mousehover !== 'undefined' && mousehover) ? mousehover.control : null;
      target = this.computeTarget(hovered);
    }

    const isDescendant = (node, potentialAncestor) => {
      let p = node;
      while(p){ if(p === potentialAncestor) return true; p = p.parent; }
      return false;
    };

    if(target && target !== control && !isDescendant(target, control)){
      // Conversion en repère de la Form de la cible
      const mouseFormX = mouseX - target.form.Inside.x;
      const mouseFormY = mouseY - target.form.Inside.y;
      // Position «souhaitée» dans le repère de la Form, en respectant l’offset de prise
      const desiredFormX = mouseFormX - dnd.offsetX;
      const desiredFormY = mouseFormY - dnd.offsetY;
      const relX = desiredFormX - target.x - target.Border.left;
      const relY = desiredFormY - target.y - target.Border.top;

      // Validation cumulative: capacité de la cible + veto source + veto cible
      let valid = !!target.canDrop;
      try { if(control.Drag && typeof control.Drag.validateDrop === 'function') valid = !!control.Drag.validateDrop(target, { localX: relX, localY: relY }); } catch(_){ }
      try { if(target.Drop && typeof target.Drop.validateDrop === 'function') valid = valid && !!target.Drop.validateDrop(target, { localX: relX, localY: relY }); } catch(_){ }

      if(valid){
        if(target.clip){ // Contrainte: rester dans la zone intérieure visible
          const innerW = target.width - target.Border.left - target.Border.right;
          const innerH = target.height - target.Border.top - target.Border.bottom;
          const maxX = innerW - control.width;
          const maxY = innerH - control.height;
          const inClipX = relX >= 0 && relX <= maxX;
          const inClipY = relY >= 0 && relY <= maxY;
          if(!(inClipX && inClipY)){
            control.Transformation.Move.to(dnd.srcX, dnd.srcY);
            this.reset();
            return;
          }
        }
        let relXSnap = relX, relYSnap = relY; // snapping optionnel
        let grid = null;

        if(typeof grid === 'number' && grid > 0){
          const snap = (v)=> Math.round(v / grid) * grid;
          relXSnap = snap(relX);
          relYSnap = snap(relY);
        }
        if(control.parent) control.parent.Lineage.remove(control); // reparentage
        control.Inside.x = relXSnap;
        control.Inside.y = relYSnap;
        target.add(control);
     } else {
        control.Transformation.Move.to(dnd.srcX, dnd.srcY);
      }
    } else {
      control.Transformation.Move.to(dnd.srcX, dnd.srcY);
    }
    this.reset();
  }

  /*
   Annule le drag en cours et restaure la position d’origine du contrôle source.
  */
  static cancel() {
    const dnd = dragdrop;
    const control = dnd.control;
    if(!control){ this.reset(); return; }
    control.Transformation.Move.to(dnd.srcX, dnd.srcY);
    this.reset();
  }

  /*
   Détermine la meilleure cible de drop à partir d’un contrôle survolé.
   - Remonte la hiérarchie tant qu’un ancêtre n’accepte pas le drop (canDrop).
   - Exclut la source et ses descendants (évite les cycles).
   - Applique un veto cible optionnel via `Drop.validateDropCandidate(source)`.
  */
  static computeTarget(hovered) {
    const dnd = dragdrop;
    const control = dnd.control;
    if(!hovered) return null;
    let candidate = hovered;
    const isDescendant = (node, potentialAncestor) => {
      let p = node;
      while(p){ if(p === potentialAncestor) return true; p = p.parent; }
      return false;
    };
    while(candidate && !candidate.canDrop) candidate = candidate.parent;
    if(!candidate) return null;
    if(control && (candidate === control || isDescendant(candidate, control))) return null;
    try { if(candidate.Drop && typeof candidate.Drop.validateDropCandidate === 'function'){
      if(!candidate.Drop.validateDropCandidate(control)) return null;
    } } catch(_){ }
    return candidate;
  }

  /*
   Auto-défilement vertical d’un conteneur clipé lorsque la souris frôle le haut/bas.
   - Convertit la souris en coordonnées locales (dans la zone intérieure utile).
   - Fait défiler un enfant de contenu si celui-ci dépasse la hauteur visible.
   - Applique des bornes pour ne pas défiler au-delà des limites.
  */
  static autoScroll(container, mouseX, mouseY) {
    if(!container || !container.clip) return;
    const innerW = container.width - container.Border.left - container.Border.right;
    const innerH = container.height - container.Border.top - container.Border.bottom;
    if(innerW <= 0 || innerH <= 0) return;
    // Seuil en pixels à partir du bord pour déclencher l'auto-défilement
    const threshold = (typeof Config !== 'undefined' && Config && typeof Config.AUTO_SCROLL_THRESHOLD === 'number')
      ? Config.AUTO_SCROLL_THRESHOLD
      : 20;
    const localX = mouseX - container.form.Inside.x - container.x - container.Border.left;
    const localY = mouseY - container.form.Inside.y - container.y - container.Border.top;
    let dy = 0;
    if(localY < threshold){ dy = (threshold - localY) * 0.5; }
    else if(localY > innerH - threshold){ dy = -(localY - (innerH - threshold)) * 0.5; }
    if(dy === 0) return;
    if(!container.children || container.children.length === 0) return;
    let contentChild = null;
    for(let i=0;i<container.children.length;i++){
      const ch = container.children[i];
      if(ch.height > innerH){ contentChild = ch; break; }
    }
    if(!contentChild) return;
    let insideY = contentChild.Inside.y + dy;
    const minY = Math.min(0, innerH - contentChild.height);
    const maxY = 0;
    if(insideY < minY) insideY = minY;
    if(insideY > maxY) insideY = maxY;
    if(insideY !== contentChild.Inside.y){
      contentChild.Inside.y = insideY;
      contentChild.Transformation.Move.parentMove();
    }
  }

  /*
   Réinitialise l’état global du DnD après un drop (réussi ou refusé) ou une annulation.
  */
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
    if(mousehover.control && mousehover.control.Drop && typeof mousehover.control.Drop.enter === 'function')
      mousehover.control.Drop.enter();
  }
  static dragover(){
    if(mousehover.control && mousehover.control.Drop && typeof mousehover.control.Drop.over === 'function')
      mousehover.control.Drop.over();
  }
  static dragleave(){
    if(mousehover.control && mousehover.control.Drop && typeof mousehover.control.Drop.leave === 'function')
      mousehover.control.Drop.leave();
  }
  static drop(){
    if(dragdrop.target && dragdrop.target.Drop && typeof dragdrop.target.Drop.drop === 'function')
      dragdrop.target.Drop.drop();
  }
}

