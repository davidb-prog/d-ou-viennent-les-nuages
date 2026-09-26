/*
 * La goutte, dessinée une seule fois pour toute la famille de vues : la
 * scène « Dehors » (l'héroïne seule) et la vue « Avec ses copines » (la même,
 * entourée de sa bande). C'est ce qui dit à l'enfant « c'est toujours elle » :
 * même larme, même visage, mêmes couleurs, d'une vue à l'autre.
 */
export var GOUTTE = '#7cc4ff';
export var GOUTTE_CLAIR = '#d6f0ff';
export var GOUTTE_SOMBRE = '#2f7fb8';
/* les copines : la même goutte, un ton plus clair — l'héroïne reste la plus
 * franche, c'est elle qu'on suit */
export var COPINE = '#a4d6ff';
export var COPINE_CLAIR = '#eaf7ff';
export var COPINE_SOMBRE = '#4d97cf';
export var ENCRE = '#0b1020';
var TAU = Math.PI * 2;

/* La goutte-héroïne : une larme ronde avec un visage. Coordonnées locales,
 * la pointe en haut, le rond en bas ; `s` est le rayon du rond. */
export function dessinerGoutte(ctx, x, y, s, alpha, forme_, copine) {
  if (alpha <= 0.005) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(0, -1.9 * s);
  ctx.bezierCurveTo(0.15 * s, -1.3 * s, s, -0.7 * s, s, 0.15 * s);
  ctx.arc(0, 0.15 * s, s, 0, Math.PI, false);
  ctx.bezierCurveTo(-s, -0.7 * s, -0.15 * s, -1.3 * s, 0, -1.9 * s);
  ctx.closePath();
  var degrade = ctx.createRadialGradient(-0.3 * s, -0.1 * s, s * 0.1, 0, 0.1 * s, 1.4 * s);
  degrade.addColorStop(0, copine ? COPINE_CLAIR : GOUTTE_CLAIR);
  degrade.addColorStop(0.45, copine ? COPINE : GOUTTE);
  degrade.addColorStop(1, copine ? COPINE_SOMBRE : GOUTTE_SOMBRE);
  ctx.fillStyle = degrade;
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, s * 0.16);
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  /* le visage : deux yeux, un sourire (une gouttelette de nuage a le même
   * visage en plus petit — c'est toujours elle) ; sous 4 px de rayon il ne
   * serait qu'une tache (le médaillon) */
  if (s < 4) { ctx.restore(); return; }
  ctx.fillStyle = ENCRE;
  ctx.beginPath();
  ctx.arc(-0.34 * s, 0.05 * s, s * 0.13, 0, TAU);
  ctx.arc(0.34 * s, 0.05 * s, s * 0.13, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.lineWidth = Math.max(1.2, s * 0.11);
  ctx.strokeStyle = ENCRE;
  ctx.lineCap = 'round';
  if (forme_ === 'goutte') {
    /* la bouche ronde de la chute : « ooooh ! » */
    ctx.arc(0, 0.5 * s, s * 0.16, 0, TAU);
  } else {
    ctx.arc(0, 0.32 * s, s * 0.34, 0.15 * Math.PI, 0.85 * Math.PI);
  }
  ctx.stroke();
  /* le reflet */
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.ellipse(-0.45 * s, -0.55 * s, s * 0.14, s * 0.26, -0.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* Le fantôme de la goutte quand elle est de la vapeur : un pointillé à sa
 * place — on ne la voit plus, mais elle est là (c'est aussi ce que le
 * doigt attrape). */
export function dessinerFantome(ctx, x, y, s, alpha) {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.setLineDash([Math.max(2, s * 0.35), Math.max(2, s * 0.3)]);
  ctx.lineWidth = Math.max(1.5, s * 0.14);
  ctx.strokeStyle = GOUTTE_CLAIR;
  ctx.beginPath();
  ctx.moveTo(0, -1.9 * s);
  ctx.bezierCurveTo(0.15 * s, -1.3 * s, s, -0.7 * s, s, 0.15 * s);
  ctx.arc(0, 0.15 * s, s, 0, Math.PI, false);
  ctx.bezierCurveTo(-s, -0.7 * s, -0.15 * s, -1.3 * s, 0, -1.9 * s);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

