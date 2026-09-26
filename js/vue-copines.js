/*
 * La vue « Avec ses copines » : la goutte-héroïne et sa bande, à la même
 * taille qu'elle, au même moment que la scène. Ni loupe ni billes — des
 * personnages, dans le registre qu'un enfant de 5 ans connaît (la bande de
 * la cour de récréation) : serrées dans l'eau qu'on voit ; chauffées, elles
 * s'éparpillent chacune de son côté et pâlissent jusqu'au pointillé (la
 * vapeur) ; dans le froid, elles se rapprochent en petits groupes (le
 * nuage) ; collées en une grosse goutte, trop lourdes, elles tombent (la
 * pluie). Le site ne prétend rien sur la matière : il ne parle que du
 * groupe. Cette vue ne se manipule pas : elle suit l'état de la scène.
 */
import {
  TAU, pNormalise, etape, avancementEtape, forme, visibilite, ecartement, regroupement, agitation,
  altitude, faitFroid, soleilChauffe, chargeNuage, forcePluie, grosseGoutte
} from './model.js';
import { dessinerGoutte, dessinerFantome } from './goutte.js';
import { dessinerFlocon } from './pictos.js';

var FOND = '#171f36';

/* La bande : l'héroïne au centre (la première), six copines autour, en
 * coordonnées locales (disque unité, y vers le bas comme le canvas). Le
 * paquet est serré : chaque voisine touche la suivante. */
var BANDE = [
  { x: 0, y: 0 },
  { x: 0.42, y: 0 }, { x: -0.42, y: 0 },
  { x: 0.21, y: -0.364 }, { x: -0.21, y: -0.364 },
  { x: 0.21, y: 0.364 }, { x: -0.21, y: 0.364 }
];
/* Dans le nuage, trois petits groupes : chaque copine rejoint le sien
 * (l'héroïne garde deux copines avec elle). */
var AMAS = [0, 1, 2, 1, 2, 0, 0];
var CENTRES_AMAS = [{ x: -0.08, y: 0.38 }, { x: 0.58, y: -0.34 }, { x: -0.6, y: -0.3 }];
/* La direction de fuite de chacune quand elle s'envole : chacune de son
 * côté (l'héroïne monte tout droit). */
var FUITES = BANDE.map(function (b, i) {
  if (i === 0) return { x: 0, y: -1 };
  var a = Math.atan2(b.y, b.x) + (i % 2 ? 0.35 : -0.3);
  return { x: Math.cos(a), y: Math.sin(a) };
});

/* Les positions de la bande pour une position p du voyage, en coordonnées
 * locales. Les trois lois pures du modèle : l'écartement (serrées ↔
 * éparpillées), le regroupement (un paquet ↔ trois petits groupes),
 * l'agitation (les chaudes frémissent). */
function positionsBande(p, horloge) {
  var ec = ecartement(p);
  var reg = regroupement(p);
  var agi = agitation(p);
  var t = horloge ? horloge / 1000 : 0;
  return BANDE.map(function (b, i) {
    /* serrées ↔ éparpillées : chacune de son côté, et la vapeur monte */
    var ex = b.x + FUITES[i].x * ec * 0.85;
    var ey = b.y + FUITES[i].y * ec * 0.85 - ec * 0.3 * ((i * 0.37 + t * 0.06) % 1);
    /* regroupées en trois petits groupes */
    var c = CENTRES_AMAS[AMAS[i]];
    var gx = c.x + b.x * 0.4, gy = c.y + b.y * 0.4;
    var x = ex * (1 - reg) + gx * reg;
    var y = ey * (1 - reg) + gy * reg;
    /* l'agitation : les copines chaudes gigotent (seulement quand l'horloge tourne) */
    if (horloge) {
      x += Math.sin(t * (2.2 + 0.3 * i) + i) * 0.035 * agi;
      y += Math.cos(t * (1.9 + 0.2 * i) + i * 1.7) * 0.035 * agi;
    }
    return { x: x, y: y, i: i };
  });
}

/* Les repères de la scène, en pictogrammes que l'enfant connaît : l'eau où
 * l'on flotte, le Soleil qui chauffe, les flocons du froid, la pluie. */
function dessinerRepere(ctx, W, H, cx, cy, R, p, horloge) {
  var t = horloge ? horloge / 1400 : 0;

  /* l'eau : la bande y flotte dans la mer et la rivière (toute la rivière,
   * même sur le flanc de la montagne) ; elle descend et disparaît quand les
   * copines s'envolent, et remonte pendant qu'il pleut — continu partout */
  var e = etape(p);
  var niveau = 1;
  if (e === 'montee') niveau = Math.max(0, Math.min(1, 1 - altitude(p) * 5));
  else if (e === 'nuage') niveau = 0;
  else if (e === 'pluie') niveau = avancementEtape(p);
  if (niveau > 0.01) {
    /* la ligne d'eau passe AU-DESSUS des pointes : la bande est dans
     * l'eau, comme la goutte sous la surface de la mer sur la scène */
    var haut = cy - R * 0.72;
    var yEau = haut + (1 - niveau) * (H + R * 0.2 - haut);
    var mer = ctx.createLinearGradient(0, yEau, 0, H);
    mer.addColorStop(0, '#3a8fcc');
    mer.addColorStop(1, '#1d4f7d');
    ctx.fillStyle = mer;
    ctx.fillRect(0, yEau, W, H - yEau);
    ctx.save();
    ctx.strokeStyle = 'rgba(214, 240, 255, 0.5)';
    ctx.lineWidth = Math.max(1.2, R * 0.012);
    ctx.lineCap = 'round';
    for (var k = 0; k < 5; k++) {
      var vx = W * (0.1 + 0.2 * k) + R * 0.03 * Math.sin(t + k);
      var vy = yEau + R * (0.06 + 0.16 * ((k * 0.61) % 1));
      var l = R * 0.09;
      ctx.beginPath();
      ctx.moveTo(vx - l, vy);
      ctx.quadraticCurveTo(vx - l / 2, vy - l * 0.45, vx, vy);
      ctx.quadraticCurveTo(vx + l / 2, vy + l * 0.45, vx + l, vy);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* Les deux repères de température ne s'affichent JAMAIS ensemble : le
   * Soleil tant que la bande chauffe et n'a pas atteint le froid ; les
   * flocons quand il fait froid ET que les copines commencent à
   * réapparaître — le froid se voit par son effet, pas cinq points avant
   * (retour utilisateur : « les flocons apparaissent trop tôt »). */
  var chaud = soleilChauffe(p) && !faitFroid(p);
  var froid = faitFroid(p) && visibilite(p) > 0;

  /* le Soleil qui chauffe : dans le coin, comme sur la scène */
  if (chaud) {
    var sx = W * 0.13, sy = H * 0.13, sr = R * 0.2;
    ctx.save();
    var halo = ctx.createRadialGradient(sx, sy, sr * 0.8, sx, sy, sr * 2.4);
    halo.addColorStop(0, 'rgba(255, 207, 92, 0.4)');
    halo.addColorStop(1, 'rgba(255, 207, 92, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(sx, sy, sr * 2.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ffcf5c';
    ctx.lineWidth = Math.max(2, sr * 0.13);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (var m = 0; m < 10; m++) {
      var a = (m / 10) * TAU + (horloge ? horloge / 9000 : 0);
      ctx.moveTo(sx + Math.cos(a) * sr * 1.25, sy + Math.sin(a) * sr * 1.25);
      ctx.lineTo(sx + Math.cos(a) * sr * 1.62, sy + Math.sin(a) * sr * 1.62);
    }
    ctx.stroke();
    ctx.fillStyle = '#ffcf5c';
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, TAU); ctx.fill();
    ctx.restore();
  }

  /* le froid : trois flocons dans les coins, comme là-haut sur la scène */
  if (froid) {
    [[0.1, 0.12, 0.11], [0.88, 0.1, 0.09], [0.9, 0.5, 0.075]].forEach(function (pos) {
      dessinerFlocon(ctx, pos[0] * W, pos[1] * H, R * pos[2], 0.8);
    });
  }

  /* le nuage : la bande serrée en fait un — il naît dans le froid quand
   * les copines se regroupent, blanchit puis grisonne en se chargeant */
  var charge = chargeNuage(p);
  /* (pas de reste de nuage dans la rivière : ici on ne voit que la bande) */
  var alphaNuage = e === 'nuage' ? charge * regroupement(p) : (e === 'pluie' ? charge : 0);
  if (alphaNuage > 0.02) {
    var tn = Math.min(1, charge);
    var r = Math.round(233 + (150 - 233) * tn), g = Math.round(237 + (160 - 237) * tn), b = Math.round(248 + (186 - 248) * tn);
    ctx.save();
    ctx.globalAlpha = Math.min(1, alphaNuage) * 0.85;
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    var largeur = R * (1.5 + 0.5 * charge);
    var boules = [[0, 0.1, 0.42], [-0.34, 0.16, 0.3], [0.34, 0.14, 0.32], [-0.14, -0.1, 0.34], [0.16, -0.12, 0.33]];
    ctx.beginPath();
    boules.forEach(function (bl) {
      ctx.moveTo(cx + bl[0] * largeur + bl[2] * largeur, cy + bl[1] * largeur);
      ctx.arc(cx + bl[0] * largeur, cy + bl[1] * largeur, bl[2] * largeur, 0, TAU);
    });
    ctx.fill();
    ctx.restore();
  }

  /* la pluie : des traits qui tombent derrière la bande */
  var force = forcePluie(p);
  if (force > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(124, 196, 255, ' + (0.6 * force) + ')';
    ctx.lineWidth = Math.max(1.5, R * 0.02);
    ctx.lineCap = 'round';
    var tp = horloge ? horloge / 700 : 0;
    ctx.beginPath();
    for (var n = 0; n < 12; n++) {
      var fx2 = W * ((n * 0.083 + 0.04) % 1);
      var phase = ((n * 0.37) + tp * 0.9) % 1;
      var fy2 = phase * (H + R * 0.3) - R * 0.15;
      var l2 = R * 0.14;
      ctx.moveTo(fx2, fy2);
      ctx.lineTo(fx2 - l2 * 0.15, fy2 + l2);
    }
    ctx.stroke();
    ctx.restore();
  }
}

/* Le dessin complet : les repères, puis la bande. Sert à la vue et au médaillon. */
function dessinerBande(ctx, W, H, p, horloge, compact) {
  var cx = W / 2, cy = H / 2;
  var R = Math.min(W, H) * 0.42;
  var f = forme(p);
  var ec = ecartement(p);
  var grosse = grosseGoutte(p);

  ctx.fillStyle = FOND;
  ctx.fillRect(0, 0, W, H);
  dessinerRepere(ctx, W, H, cx, cy, R, p, horloge);

  /* la grosse goutte : la bande collée dedans — elle se dessine à mesure
   * que les groupes se collent, à la fin du nuage, et tombe entière */
  if (grosse > 0.02) {
    var sg = R * 0.62;
    ctx.save();
    ctx.globalAlpha = grosse;
    ctx.translate(cx, cy + R * 0.1);
    ctx.beginPath();
    ctx.moveTo(0, -1.9 * sg);
    ctx.bezierCurveTo(0.15 * sg, -1.3 * sg, sg, -0.7 * sg, sg, 0.15 * sg);
    ctx.arc(0, 0.15 * sg, sg, 0, Math.PI, false);
    ctx.bezierCurveTo(-sg, -0.7 * sg, -0.15 * sg, -1.3 * sg, 0, -1.9 * sg);
    ctx.closePath();
    ctx.fillStyle = 'rgba(124, 196, 255, 0.25)';
    ctx.fill();
    ctx.lineWidth = Math.max(2, R * 0.04);
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();
    ctx.restore();
  }

  /* la bande, de haut en bas (les rangs du bas passent devant), l'héroïne
   * un peu plus grande et plus franche */
  var positions = positionsBande(p, horloge).slice().sort(function (a, b) { return a.y - b.y; });
  var echelle = R * 0.72;
  positions.forEach(function (b) {
    var heroine = b.i === 0;
    var s = R * (heroine ? 0.18 : 0.15) * (1 - 0.1 * grosse) * (compact ? 1.08 : 1);
    var x = cx + b.x * echelle, y = cy + b.y * echelle;
    if (ec > 0.5) {
      /* de la vapeur : chacune pâlit jusqu'au pointillé — on ne la voit
       * plus, mais elle est là (le pointillé reste bien lisible) */
      var alphaFantome = 0.95 - (ec - 0.5) * 0.9;
      dessinerFantome(ctx, x, y, s, alphaFantome * (heroine ? 1 : 0.8));
      if (ec < 0.85) dessinerGoutte(ctx, x, y, s, (0.85 - ec) / 0.35, f, !heroine);
    } else {
      dessinerGoutte(ctx, x, y, s, 1 - ec * 0.5, f, !heroine);
    }
  });
}

export function creerVueCopines(canvas) {
  var ctx = canvas.getContext('2d');
  return {
    rendre: function (p, horloge) {
      var W = canvas.width, H = canvas.height;
      if (W === 0 || H === 0) return;
      ctx.clearRect(0, 0, W, H);
      var compact = W < 520 * (window.devicePixelRatio || 1);
      dessinerBande(ctx, W, H, pNormalise(p), horloge, compact);
    }
  };
}

/* Le médaillon mobile : la bande en miniature, dans un rond. */
export function dessinerMiniCopines(ctx, w, h, p) {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, TAU); ctx.clip();
  dessinerBande(ctx, w, h, pNormalise(p), null, true);
  ctx.restore();
}
