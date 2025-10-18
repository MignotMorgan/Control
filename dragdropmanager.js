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
    const dnd = dragdrop;                  // état global du cycle DnD
    const control = mousehover.control;    // contrôle sous la souris au mousedown (source du drag)
    dnd.control = control;                 // mémorisation de la source
    dnd.parent = control.parent || null;   // parent d'origine (utile si retour en arrière)
    dnd.startX = mouse.x;                  // coordonnées souris au déclenchement (repère global)
    dnd.startY = mouse.y
    // Calcul de l'offset de prise dans le repère de la Form:
    // différence entre la position de la souris et le coin haut-gauche du contrôle au clic.
    // Cela permet de conserver la même "prise" visuelle pendant tout le drag.
    dnd.offsetX = mouse.x - control.form.Inside.x - control.Absolute.x;
    dnd.offsetY = mouse.y - control.form.Inside.y - control.Absolute.y;
    // Position absolue d'origine de la source (repère Form): sert à restaurer si drop invalide/annulé.
    dnd.srcX = control.Absolute.x;
    dnd.srcY = control.Absolute.y;
    dnd.armed = true;   // armé: prêt à devenir actif si le déplacement dépasse un seuil
    dnd.active = false; // inactif tant que le seuil n'est pas franchi

    // Hook de démarrage côté source (pour visuels ou états spécifiques)
    control.Drag.start();
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

    // Active le drag quand le seuil de mouvement est dépassé.
    if (dnd.armed && !dnd.active){
      const dx = Math.abs(mouse.x - dnd.startX); // delta horizontal depuis le clic
      const dy = Math.abs(mouse.y - dnd.startY); // delta vertical depuis le clic
      // Seuil d'activation (anti-jitter): évite de déclencher un drag par un léger tremblement
      if (dx + dy >= Config.DRAG_ACTIVATION_THRESHOLD){
        dnd.active = true; // passe en mode drag actif
      }
    }

    // Tant que le drag n'est pas actif, ne pas bouger visuellement la source
    if(!dnd.active){ return; }
    // Convertit la souris en repère Form puis compense l'offset de prise pour le feedback visuel
    const xForm = mouse.x - control.form.Inside.x - dnd.offsetX;
    const yForm = mouse.y - control.form.Inside.y - dnd.offsetY;
    control.Transformation.Move.to(xForm, yForm); // feedback visuel (position absolue)

    // Sélection dynamique de la cible via le contrat Drop.target() du contrôle survolé
    dnd.target = mousehover.control ? mousehover.control.Drop.target() : null;

    // Si la cible est clipée et que la souris est proche des bords, déclencher un auto-défilement
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
  static dropControl() {
    // Récupération de l'état global du DnD et des acteurs
    const dnd = dragdrop;
    const control = dnd.control; // source en cours de drag
    let target = dnd.target;     // cible actuelle déduite pendant move()

    // Garde-fous: pas de source => rien à déposer
    if(!control){ this.reset(); return; }
    // Drag armé mais jamais devenu actif (clic sans mouvement) => annulation propre
    if(dnd.armed && !dnd.active){ this.reset(); return; }
    // Note: si vous préférez refuser explicitement target === null, décommentez le guard ci-dessous
    if(target === null){ this.restore(); return; }

      // Validation cumulative: capacité de la cible + veto côté source + veto côté cible
      let valid = control.Drag.validate(target) && target.Drop.validate(control);
    // Cible éligible: existe, n'est pas la source et n'est pas un descendant de la source
    if(valid && target !== control ){
      // 1) Conversion des coordonnées souris -> repère Form de la cible
      const mouseFormX = mouse.x - target.form.Inside.x;
      const mouseFormY = mouse.y - target.form.Inside.y;
      // 2) Compensation de l'offset de prise pour conserver l'articulation visuelle de la prise
      const desiredFormX = mouseFormX - dnd.offsetX;
      const desiredFormY = mouseFormY - dnd.offsetY;
      // 3) Passage en coordonnées locales Inside de la cible (soustraction de la position et des bordures)
      const relX = desiredFormX - target.x - target.Border.left;
      const relY = desiredFormY - target.y - target.Border.top;

        // Re-parentage: retirer du parent courant avant d'ajouter à la cible
        if(control.parent) control.parent.Lineage.remove(control); // reparentage
        // Position finale dans le repère Inside de la cible
        control.Inside.x = relX;
        control.Inside.y = relY;
        // Ajout effectif à la cible
        target.add(control);

    } else {
      // Cible manquante ou non éligible: revenir à la position d'origine
      control.Transformation.Move.to(dnd.srcX, dnd.srcY);
    }
    // Nettoyage systématique de l'état DnD (réussi ou non)
    this.reset();
  }

  static autoScroll(container, mouseX, mouseY) {
    // Ne fonctionne que pour des conteneurs qui rognent (clip) leur contenu
    if(!container || !container.clip) return;
    // Dimensions visibles intérieures (Inside) du conteneur: largeur/hauteur utile hors bordures
    const innerW = container.width - container.Border.left - container.Border.right;
    const innerH = container.height - container.Border.top - container.Border.bottom;
    if(innerW <= 0 || innerH <= 0) return; // rien de scrollable si zone non positive
    // Seuil de proximité des bords (en px) pour déclencher l'auto-scroll
    const threshold = Config.AUTOSCROLL_THRESHOLD;
    // Conversion de la souris en coordonnées locales (Inside) du conteneur
    const localX = mouseX - container.form.Inside.x - container.Absolute.x - container.Border.left;
    const localY = mouseY - container.form.Inside.y - container.Absolute.y - container.Border.top;

    // Vitesses proportionnelles à la proximité des bords
    let stepV = 0, stepH = 0;
    if(localY < threshold){ stepV = (threshold - localY) * 0.5; }
    else if(localY > innerH - threshold){ stepV = -(localY - (innerH - threshold)) * 0.5; }
    if(localX < threshold){ stepH = (threshold - localX) * 0.5; }
    else if(localX > innerW - threshold){ stepH = -(localX - (innerW - threshold)) * 0.5; }

    if(stepV === 0 && stepH === 0) return; // pas d'auto-scroll si la souris est au centre

    // Utilise la fonction centrale de scroll du Move pour appliquer bornes/clamps et propagation
    container.Transformation.Move.scroll(stepV, stepH);
  }

  /*
   Annule le drag en cours et restaure la position d’origine du contrôle source.
  */
   static restore() {
    const dnd = dragdrop;
    const control = dnd.control;
    if(!control){ this.reset(); return; }
    control.Transformation.Move.to(dnd.srcX, dnd.srcY);
    this.reset();
  }

  /*
   Réinitialise l’état global du DnD après un drop (réussi ou refusé) ou une annulation.
  */
  static reset() {
    // Réinitialisation complète de l'état global DnD pour éviter toute fuite entre interactions
    dragdrop.armed = false;            // plus armé
    dragdrop.active = false;           // plus actif
    dragdrop.control = null;           // oubli de la source
    dragdrop.parent = null;            // oubli du parent d'origine
    dragdrop.target = null;            // oubli de la cible potentielle
    dragdrop.srcX = 0;                 // remise à zéro positions d'origine
    dragdrop.srcY = 0;
    dragdrop.startX = 0;               // remise à zéro du point de départ souris
    dragdrop.startY = 0;
    dragdrop.offsetX = 0;              // offset de prise nul
    dragdrop.offsetY = 0;
    dragdrop.data = { text: "", files: null }; // payload associée au drag (texte/fichiers) vidée
  }

  static dragenter(){
    // Relais d'événement: informe le contrôle survolé que la zone de drop est entrée
    if(mousehover.control){
      mousehover.control.Drop.enter();
    }
  }
  static dragover(){
    // Relais d'événement: mise à jour continue pendant le survol (peut gérer un highlight)
    if(mousehover.control){
      mousehover.control.Drop.over();
    }
  }
  static dragleave(){
    // Relais d'événement: indique que la souris sort de la zone de drop du contrôle survolé
    if(mousehover.control){
      mousehover.control.Drop.leave();
    }
  }
  static drop(){
    // Relais d'événement: déclenche le hook de drop sur la cible la plus pertinente
    if(mousehover.control){
      mousehover.control.Drop.drop();
    }
  }
}

