/*
 * Les pictogrammes partagés par les vues : ce que l'enfant reconnaît du
 * premier coup d'œil. Ici le flocon — six branches et leurs petites
 * ramifications, jamais trois traits croisés (on y lisait une étoile, et
 * une étoile dit « la nuit », pas « le froid »).
 */
export function dessinerFlocon(ctx, x, y, r, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#e9f4ff';
  ctx.lineWidth = Math.max(1, r * 0.16);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (var k = 0; k < 6; k++) {
    var a = (k / 6) * Math.PI * 2;
    var ux = Math.cos(a), uy = Math.sin(a);
    /* la branche */
    ctx.moveTo(x, y);
    ctx.lineTo(x + ux * r, y + uy * r);
    /* ses deux ramifications, en V, aux deux tiers */
    var bx = x + ux * r * 0.62, by = y + uy * r * 0.62;
    var l = r * 0.34;
    var a1 = a + Math.PI / 3, a2 = a - Math.PI / 3;
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a1) * l, by + Math.sin(a1) * l);
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a2) * l, by + Math.sin(a2) * l);
  }
  ctx.stroke();
  ctx.restore();
}
