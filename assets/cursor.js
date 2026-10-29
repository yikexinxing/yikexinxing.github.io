/* 自定义鼠标：一个蓝色小球 + 一圈稍大的阴影光晕（滞后跟随）。
   零依赖 · 触摸设备自动不启用 · 尊重「减弱动效」设置
   想调整外观/手感，改下面的 CONFIG 即可。 */
(function () {
  'use strict';

  // ===== 可调参数 =====
  var CONFIG = {
    ballSize: 9,        // 小球直径(px)
    haloSize: 24,       // 外层阴影圈直径(px)
    ballColor: '#3b82f6',
    haloColor: '59,130,246',
    ballLerp: 0.35,     // 小球跟随速度(0~1，越大越贴手)
    haloLerp: 0.16,     // 阴影跟随速度，越小拖动感越强
    hoverTargets: 'a,button,[role="button"],input,select,summary'
  };

  // 只有真正的鼠标（非触摸屏）才启用
  try {
    if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  } catch (e) { return; }

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var style = document.createElement('style');
  style.type = 'text/css';
  style.textContent =
    '.cursor-ball,.cursor-halo{position:fixed;left:0;top:0;border-radius:50%;pointer-events:none;' +
    'z-index:100000;transform:translate3d(-50%,-50%,0);backface-visibility:hidden;display:none}' +
    '.cursor-ball{width:' + CONFIG.ballSize + 'px;height:' + CONFIG.ballSize + 'px;' +
    'background:' + CONFIG.ballColor + ';box-shadow:0 0 8px rgba(' + CONFIG.haloColor + ',.9),0 0 20px rgba(' + CONFIG.haloColor + ',.5)}' +
    '.cursor-halo{width:' + CONFIG.haloSize + 'px;height:' + CONFIG.haloSize + 'px;' +
    'background:rgba(' + CONFIG.haloColor + ',.10);border:1px solid rgba(' + CONFIG.haloColor + ',.45);' +
    'box-shadow:0 0 14px rgba(' + CONFIG.haloColor + ',.28)}' +
    '.cursor-ball.is-hover{background:#00e5ff;box-shadow:0 0 10px rgba(0,229,255,.95),0 0 24px rgba(0,229,255,.55)}' +
    '.cursor-halo.is-hover{width:38px;height:38px;border-color:rgba(0,229,255,.6);background:rgba(0,229,255,.08)}' +
    'body.cursor-custom,body.cursor-custom *{cursor:none!important}' +
    '@media (prefers-reduced-motion:reduce){.cursor-ball,.cursor-halo{transition:none}}';
  document.head.appendChild(style);

  var ball = document.createElement('div');
  ball.className = 'cursor-ball';
  var halo = document.createElement('div');
  halo.className = 'cursor-halo';
  document.body.appendChild(halo);
  document.body.appendChild(ball);
  document.body.classList.add('cursor-custom');

  var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  var bx = tx, by = ty, hx = tx, hy = ty;
  var visible = false;
  var raf = null;

  function setPos(el, x, y) {
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
  }

  function loop() {
    bx += (tx - bx) * (reduceMotion ? 1 : CONFIG.ballLerp);
    by += (ty - by) * (reduceMotion ? 1 : CONFIG.ballLerp);
    hx += (tx - hx) * (reduceMotion ? 1 : CONFIG.haloLerp);
    hy += (ty - hy) * (reduceMotion ? 1 : CONFIG.haloLerp);
    setPos(ball, bx, by);
    setPos(halo, hx, hy);
    raf = requestAnimationFrame(loop);
  }

  function show() {
    if (visible) return;
    visible = true;
    ball.style.display = 'block';
    halo.style.display = 'block';
  }
  function hide() {
    visible = false;
    ball.style.display = 'none';
    halo.style.display = 'none';
  }

  window.addEventListener('mousemove', function (e) {
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) { bx = hx = tx; by = hy = ty; show(); }

    var t = e.target;
    var over = false;
    try { over = !!(t && t.closest && t.closest(CONFIG.hoverTargets)); } catch (err) {}
    ball.classList.toggle('is-hover', over);
    halo.classList.toggle('is-hover', over);
  }, { passive: true });

  document.addEventListener('mouseleave', hide);
  document.addEventListener('mouseenter', show);
  window.addEventListener('blur', hide);

  if (!raf) raf = requestAnimationFrame(loop);
})();
