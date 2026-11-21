/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
/**
 * Procedural Randomized VU Meter Glass Shatter Engine:
 * Generates organic, non-repeating spiderweb glass fracture patterns with sharp
 * radial impact fissures, jagged concentric polygon rings, micro-branches, and
 * specular glass glints. Supports dynamic random re-generation and smooth self-healing.
 */

export function generateShatterInner(cx: number, cy: number, id: number): string {
  // Impact epicenter: randomized in the +1 to +3 VU needle pinning zone
  const ox = cx + 55 + (Math.random() * 60);
  const oy = cy - 45 + (Math.random() * 45);

  const numRays = 9 + Math.floor(Math.random() * 4); // 9 to 12 radial fissures
  const baseStep = (Math.PI * 2) / numRays;

  interface Pt { x: number; y: number }
  const rays: Pt[][] = [];
  const rings = [22, 58, 112, 175, 245];

  // 1. Generate randomized radial rays with jagged intermediate vertices
  for (let r = 0; r < numRays; r++) {
    const angle = (r * baseStep) + ((Math.random() - 0.5) * baseStep * 0.55);
    const rayPts: Pt[] = [{ x: ox, y: oy }];
    let curR = 0;
    const maxR = 250 + Math.random() * 75;

    for (let step = 0; step < rings.length; step++) {
      curR = rings[step] + (Math.random() - 0.5) * 16;
      if (curR > maxR) break;
      const jAng = angle + ((Math.random() - 0.5) * 0.28);
      rayPts.push({
        x: Math.round(ox + Math.cos(jAng) * curR),
        y: Math.round(oy + Math.sin(jAng) * curR)
      });
    }
    // Terminal tip
    const endR = maxR + Math.random() * 30;
    const endAng = angle + ((Math.random() - 0.5) * 0.35);
    rayPts.push({
      x: Math.round(ox + Math.cos(endAng) * endR),
      y: Math.round(oy + Math.sin(endAng) * endR)
    });
    rays.push(rayPts);
  }

  // 2. Generate radial SVG path data
  let radialPathD = '';
  for (const ray of rays) {
    radialPathD += `M ${ray[0].x} ${ray[0].y} `;
    for (let p = 1; p < ray.length; p++) {
      radialPathD += `L ${ray[p].x} ${ray[p].y} `;
    }
  }

  // 3. Generate jagged concentric polygon fracture rings
  let ringPathD = '';
  for (let ringIdx = 1; ringIdx < rings.length; ringIdx++) {
    let started = false;
    for (let r = 0; r < numRays; r++) {
      const ray = rays[r];
      const pt = ray[ringIdx] || ray[ray.length - 1];
      if (!started) {
        ringPathD += `M ${pt.x} ${pt.y} `;
        started = true;
      } else {
        ringPathD += `L ${pt.x} ${pt.y} `;
      }
    }
    ringPathD += 'Z ';
  }

  // 4. Generate random micro-fissure shoots branching off rays
  let microPathD = '';
  const numShoots = 12 + Math.floor(Math.random() * 8);
  for (let s = 0; s < numShoots; s++) {
    const ray = rays[Math.floor(Math.random() * rays.length)];
    const ptIdx = 1 + Math.floor(Math.random() * (ray.length - 2));
    const origin = ray[ptIdx];
    const shootAng = (Math.random() * Math.PI * 2);
    const shootLen = 14 + Math.random() * 26;
    const mx = Math.round(origin.x + Math.cos(shootAng) * shootLen);
    const my = Math.round(origin.y + Math.sin(shootAng) * shootLen);
    microPathD += `M ${origin.x} ${origin.y} L ${mx} ${my} `;
  }

  // 5. Specular shard highlight polygons
  let shardsD = '';
  const numShards = 3 + Math.floor(Math.random() * 3);
  for (let sh = 0; sh < numShards; sh++) {
    const r1 = Math.floor(Math.random() * (numRays - 1));
    const r2 = r1 + 1;
    const depth = 1 + Math.floor(Math.random() * (rings.length - 2));
    const p1 = rays[r1][depth];
    const p2 = rays[r1][depth + 1] || rays[r1][depth];
    const p3 = rays[r2][depth + 1] || rays[r2][depth];
    const p4 = rays[r2][depth];
    if (p1 && p2 && p3 && p4) {
      const op = (0.07 + Math.random() * 0.08).toFixed(2);
      shardsD += `<polygon points="${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}" fill="#ffffff" opacity="${op}"/>`;
    }
  }

  return `
    <!-- Subtle fractured glass desaturation / micro-crystalline veil -->
    <radialGradient id="shatterGlow_${id}" cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="230" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.38"/>
      <stop offset="25%" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="60%" stop-color="#c8e4f5" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.0"/>
    </radialGradient>
    <circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="225" fill="url(#shatterGlow_${id})"/>

    <!-- Primary Impact Center Crater -->
    <circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="4.5" fill="#ffffff" opacity="0.95"/>
    <circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="9.5" fill="none" stroke="#ffffff" stroke-width="2.2" opacity="0.88"/>
    <circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="16" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.75"/>

    <!-- Dark Crevice Fracture Shadows (Depth behind cracks) -->
    <g stroke="#05070a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" fill="none">
      <path d="${radialPathD}"/>
      <path d="${ringPathD}"/>
      <path d="${microPathD}"/>
    </g>

    <!-- Sharp White Specular Fractures & Cracks (Light-catching glass edges) -->
    <g stroke="#ffffff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" fill="none">
      <path d="${radialPathD}"/>
      <path d="${ringPathD}"/>
    </g>

    <!-- Fine Micro-Fissures -->
    <path d="${microPathD}" stroke="#ffffff" stroke-width="0.8" opacity="0.8" fill="none"/>

    <!-- Specular Shard Highlights (Prismatic glass facets) -->
    ${shardsD}
  `;
}

export function renderGlassShatter(cx: number, cy: number, id: number): string {
  return `
    <!-- VU Meter Shattered Glass Fracture Overlay with Smooth Self-Healing Support -->
    <g class="vu-glass-shatter" id="vu_shatter_${id}" data-cx="${cx}" data-cy="${cy}" data-id="${id}" style="display: none; opacity: 0; transition: opacity 1.8s ease-out; pointer-events: none;">
      ${generateShatterInner(cx, cy, id)}
    </g>
  `;
}

export function updateRandomShatter(el: SVGElement, cx: number, cy: number, id: number): void {
  el.innerHTML = generateShatterInner(cx, cy, id);
}
