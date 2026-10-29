/* 点击特效：在页面空白处点击时，从鼠标位置飘出一颗发光的爱心。
   零依赖 · 不影响任何现有功能 · 键盘/无障碍友好（自动跳过表单元素）
   想调整效果，只改下面的 CONFIG 即可。 */
(function () {
  'use strict';

  // ===== 可调参数 =====
  var CONFIG = {
    colors: ['#00e5ff', '#00ff9c', '#3b82f6', '#ff4fa3', '#ffd166'], // 赛博色板，随机取
    size: [18, 30],        // 爱心随机大小区间(px)
    rise: [90, 170],       // 向上飘升的高度区间(px)
    drift: [-46, 46],      // 左右随机漂移(px)
    duration: [1100, 1600],// 动画时长区间(ms)
    maxOnce: 3,            // 单次点击最多生成几颗
    maxOnScreen: 40        // 同屏最多存在多少颗，防止连点卡顿
  };

  // 系统开启了「减弱动效」就不播 —— 尊重无障碍设置
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  } catch (e) {}

  if (!window.Element || !Element.prototype.animate) return; // 老浏览器不支持 WAAPI 就直接退出

  var HEART_PATH =
    'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09' +
    'C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

  var living = 0;
  var rand = function (min, max) { return Math.random() * (max - min) + min; };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  function createHeart(x, y) {
    var size = Math.round(rand(CONFIG.size[0], CONFIG.size[1]));
    var color = pick(CONFIG.colors);

    var el = document.createElement('span');
    el.className = 'click-heart';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      'position:fixed;left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size + 'px;' +
      'margin-left:' + (-size / 2) + 'px;margin-top:' + (-size / 2) + 'px;' +
      'pointer-events:none;z-index:9999;will-change:transform,opacity;' +
      'filter:drop-shadow(0 0 8px ' + color + ');';
    el.innerHTML =
      '<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block">' +
      '<path d="' + HEART_PATH + '" fill="' + color + '"></path></svg>';

    document.body.appendChild(el);
    living++;

    var dx = rand(CONFIG.drift[0], CONFIG.drift[1]);
    var dy = -rand(CONFIG.rise[0], CONFIG.rise[1]);
    var rot = rand(-28, 28);
    var dur = rand(CONFIG.duration[0], CONFIG.duration[1]);

    var anim = el.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(0.2)', opacity: 0 },
      { transform: 'translate(' + dx * 0.25 + 'px,' + dy * 0.22 + 'px) rotate(' + rot * 0.4 + 'deg) scale(1.15)', opacity: 1, offset: 0.22 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(0.55)', opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(.22,.61,.36,1)' });

    anim.onfinish = anim.oncancel = function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      living--;
    };
  }

  function isInteractive(node) {
    if (!node || !node.closest) return false;
    return !!node.closest('a,button,input,textarea,select,summary,label,[role="button"]');
  }

  function handler(e) {
    // 刚拖选过文字就不触发
    try {
      if (window.getSelection && String(window.getSelection()).length > 0) return;
    } catch (err) {}

    if (isInteractive(e.target)) return; // 点链接/按钮/输入框时不打扰

    var count = rand(1, CONFIG.maxOnce) | 0 || 1;
    var room = CONFIG.maxOnScreen - living;
    if (room <= 0) return;
    if (count > room) count = room;

    for (var i = 0; i < count; i++) {
      createHeart(e.clientX, e.clientY);
    }
  }

  window.addEventListener('click', handler, { passive: true });
  // 移动端用 touchend，避免 click 的延迟与兼容问题
  window.addEventListener('touchend', function (e) {
    var t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    if (isInteractive(e.target)) return;
    handler({ clientX: t.clientX, clientY: t.clientY, target: e.target });
  }, { passive: true });
})();
