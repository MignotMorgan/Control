window.onload = ()=>{
    let factory = new Factory();
    let form = (new FactoryForm).create(100, 10, 1750, 750);
    form.id = "00";
    form.canMove = true;
    form.canResize = true;
    form.canScale = true;

    // Contrôle principal avec clipping (zone de démo)
    let control = factory.create(200, 100, 350, 250);
    control.id = "01";
    control.canMove = true;
    control.canResize = true;
    control.canDrop = true;
    // Active le clipping pour que les enfants ne débordent pas visuellement du contrôle
    control.clip = true;
    form.add(control);

    let control_11 = factory.create(205, 10, 150, 150);
    control_11.id = "11";
    control_11.canMove = true;
    control_11.canResize = true;
    control_11.canDrag = true;
    control_11.canDrop = true;
    control.add(control_11);

    let control_12 = factory.create(20, 10, 50, 50);
    control_12.id = "12";
    control_12.canMove = true;
    control_12.canResize = true;
    control_12.canDrag = true;
    control_11.add(control_12);

    // Contenu défilable à l'intérieur du contrôle clipé
    let control_2 = factory.create(-25, -5, 200, 600); // hauteur > zone clipée pour démontrer le scroll
    control_2.id = "02";
    control_2.canMove = true;
    control_2.canDrag = true; // pourra être déplacé (drag interne)
    control.add(control_2);
    
    let control_25 = factory.create(20, 0, 100, 100);
    control_25.id = "25";
    control_25.canMove = true;
    control_2.add(control_25);

    let control_3 = factory.create(10, 400, 250, 250);
    control_3.id = "03";
    control_3.canMove = true;
    control_3.canResize = true;
    form.add(control_3);

    let control_4 = factory.create(0, 0, 150, 150);
    control_4.id = "04";
    control_4.canMove = true;
    control_4.canDrop = true; // cible de drop possible
    control_3.add(control_4);

    let control_5 = factory.create(5, 5, 50, 50);
    control_5.id = "05";
    control_5.canMove = true;
    control_5.canDrag = true; // source de drag interne
    control_4.add(control_5);

    let control_6 = factory.create(700,325, 500, 400);
    control_6.id = "06";
    control_6.canMove = true;
    control_6.canResize = true;
    control_6.canDrop = true; // accepte le drop interne
    form.add(control_6);



    // Démo Drag & Drop HTML5 gérée désormais via control.Drop.* (handlers Input.Mouse supprimés)
    let control_7 = factory.create(50,50, 50, 40);
    control_7.id = "07";
    control_6.add(control_7);


    
    let factorytext = new FactoryText();
    let editor = factorytext.create(700, 20, 500, 300);
    editor.id = "editor";
    editor.canMove = true;
    editor.canResize = true;
    editor.text = (
        "Hello TextControl!\n" +
        "Tape du texte, sélectionne, copie/colle…\n\n" +
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.\n" +
        "Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.\n" +
        "Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.\n" +
        "Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim.\n" +
        "Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue.\n" +
        "Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales.\n" +
        "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh.\n" +
        "Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.\n" +
        "Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar.\n" +
        "Nulla sollicitudin. Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula.\n" +
        "Pellentesque rhoncus nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas.\n" +
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n"
    );
    form.add(editor);
    // Place l'éditeur au premier plan pour éviter qu'il ne soit couvert (z-order)
    form.Lineage.firstPosition(editor);
    // Donne le focus à l'éditeur au démarrage pour rendre le caret visible immédiatement
    if(typeof editor.onFocus === 'function') editor.onFocus();
    editor.useFixedViewport(220);
    editor.scrollY = true;

    // Démo: Thèmes avec images locales (Background.jpg et Border.png)
    // On crée deux gros contrôles pour mieux voir le rendu.
    const themedBgCtrl = factory.create(1250, 20, 500, 350);
    themedBgCtrl.id = "themedBg";
    themedBgCtrl.canMove = true;
    themedBgCtrl.canResize = true;
    form.add(themedBgCtrl);

    const themedBorderCtrl = factory.create(1200, 400, 500, 350);
    themedBorderCtrl.id = "themedBorder";
    themedBorderCtrl.canMove = true;
    themedBorderCtrl.canResize = true;
    form.add(themedBorderCtrl);

    // Chargement des images locales (assurez-vous que Background.jpg et Border.png sont à côté de votre page)
    const imgBg = new Image();
    const imgBorder = new Image();
    imgBg.src = "Background.jpg";
    imgBorder.src = "Border2.jpg";

    // Applique un background image sur themedBgCtrl
    themedBgCtrl.theme = {
        background: {
            color: "#ffffff",
            image: null, // définie à l'onload
            // Choix: pas de répétition, on ajuste à la zone visible
            repeat: null,
            size: 'stretch'
        }
    };
    imgBg.onload = ()=>{
        themedBgCtrl.theme.background.image = imgBg;
    };

    // Applique une bordure nine-slice sur themedBorderCtrl
    themedBorderCtrl.theme = {
        base: {
            borderColor: "#000",
            lineWidth: 1,
            borderImage: {
                image: null, // définie à l'onload
                // Les valeurs seront calculées proportionnellement à l'image chargée (voir onload ci-dessous)
                slice: { top: 16, right: 16, bottom: 16, left: 16 },
                widths: { top: 48, right: 48, bottom: 48, left: 48 },
                fillCenter: false
            }
        },
        background: {
            color: "#f9f9f9" // fond neutre pour mettre en valeur la bordure
        }
    };
    imgBorder.onload = ()=>{
        // Calcule les slices à 20% de la plus petite dimension de l'image
        const iw = imgBorder.naturalWidth || imgBorder.width || 0;
        const ih = imgBorder.naturalHeight || imgBorder.height || 0;
        const s = Math.max(1, Math.round(Math.min(iw, ih) * 0.20));
        const w = 28; // épaisseur cible de la bordure
        const bi = themedBorderCtrl.theme.base.borderImage;
        bi.image = imgBorder;
        bi.slice = { top: s, right: s, bottom: s, left: s };
        bi.widths = { top: w, right: w, bottom: w, left: w };
        themedBorderCtrl.Border.right = w;
        themedBorderCtrl.Border.bottom = w;
        themedBorderCtrl.Border.left = w;
    };
 
};