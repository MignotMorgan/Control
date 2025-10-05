// Configuration globale de l'application (constantes partagées)
// Utilisation: Config.DRAG_ACTIVATION_THRESHOLD, Config.SNAP_GRID, Config.AUTOSCROLL_THRESHOLD

window.Config = Object.freeze({
  // Pixels de déplacement avant d'activer le drag interne
  DRAG_ACTIVATION_THRESHOLD: 6,
  // Taille de la grille de snapping (px)
  SNAP_GRID: 10,
  // Zone (en px) proche des bords d'un conteneur clipé qui déclenche l'auto-scroll
  AUTOSCROLL_THRESHOLD: 20,
  // Taille (px) des poignées de redimensionnement
  RESIZE_HANDLE_SIZE: 8
});
