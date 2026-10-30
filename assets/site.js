(function () {
  'use strict';

  function qs(selector, root) { return (root || document).querySelector(selector); }
  function updateTime() {
    var el = qs('#sysTime');
    if (el) el.textContent = new Date().toTimeString().slice(0, 8);
  }
  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function card(post, activity) {
    var date = escapeHTML((post.date || '').replace(/-/g, '.'));
    var category = escapeHTML(post.category || 'POST');
    var title = escapeHTML(post.title);
    var excerpt = escapeHTML(post.excerpt || '');
    var href = 'article.html?id=' + encodeURIComponent(post.id);
    if (activity) {
      return '<a class="activity-item" href="' + href + '"><time datetime="' + escapeHTML(post.date || '') + '">' + date + '</time><div><div class="activity-type">' + category + '</div><h3>' + title + '</h3><p>' + excerpt + '</p></div><span class="activity-arrow" aria-hidden="true">→</span></a>';
    }
    return '<a class="article-card" href="' + href + '"><div class="article-meta-top"><span class="article-tag">[ ' + category + ' ]</span><time class="article-date" datetime="' + escapeHTML(post.date || '') + '">' + date + '</time></div><h3>' + title + '</h3><p>' + excerpt + '</p><div class="article-link">&gt; READ_MORE</div></a>';
  }
  function matches(post, query) {
    var text = [post.title, post.excerpt, post.category].concat(post.tags || []).join(' ').toLowerCase();
    return !query || text.indexOf(query.toLowerCase()) !== -1;
  }
  function render(list, container, empty, query, activity) {
    if (!container) return;
    var q = (query || '').trim();
    var filtered = list.filter(function (post) { return matches(post, q); });
    container.innerHTML = filtered.map(function (post) { return card(post, activity); }).join('');
    if (empty) empty.hidden = filtered.length !== 0;
  }
  function initNavigation() {
    var toggle = qs('.nav-toggle');
    var links = qs('#navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }
    document.querySelectorAll('.nav-dropdown').forEach(function (item, index) {
      var trigger = qs('.dropdown-trigger', item);
      var menu = qs('.dropdown-menu', item);
      if (!trigger || !menu) return;
      var menuId = menu.id || 'dropdown-menu-' + index;
      menu.id = menuId;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-controls', menuId);
      menu.setAttribute('role', 'menu');
      menu.querySelectorAll('a').forEach(function (link) { link.setAttribute('role', 'menuitem'); });
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var open = item.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(open));
      });
      menu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          item.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
          if (links) links.classList.remove('is-open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
      });
    });
    document.addEventListener('click', function (event) {
      document.querySelectorAll('.nav-dropdown.open').forEach(function (item) {
        if (!item.contains(event.target)) {
          item.classList.remove('open');
          var trigger = qs('.dropdown-trigger', item);
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') document.querySelectorAll('.nav-dropdown.open').forEach(function (item) { item.classList.remove('open'); var trigger = qs('.dropdown-trigger', item); if (trigger) trigger.setAttribute('aria-expanded', 'false'); });
    });
  }
  function initSearch(form, input, container, empty) {
    if (!form || !input || !container) return;
    var run = function () { render(window.NEWSTAR_POSTS || [], container, empty, input.value, false); };
    form.addEventListener('submit', function (event) { event.preventDefault(); run(); });
    input.addEventListener('input', run);
    run();
  }
  function initCategoryList() {
    document.querySelectorAll('[data-category-list]').forEach(function (container) {
      var category = container.getAttribute('data-category-list');
      var posts = (window.NEWSTAR_POSTS || []).filter(function (post) { return category === 'life' ? post.category === 'LIFE' : post.category !== 'LIFE'; });
      render(posts, container, qs('.empty-state', container.parentElement), '', container.classList.contains('activity-list'));
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    updateTime();
    window.setInterval(updateTime, 1000);
    initNavigation();
    var posts = window.NEWSTAR_POSTS || [];
    var count = qs('#postCount');
    if (count) count.textContent = String(posts.length).padStart(2, '0');
    var catCount = qs('#categoryCount');
    if (catCount) {
      var cats = {};
      posts.forEach(function (post) { cats[post.category || 'POST'] = 1; });
      catCount.textContent = String(Object.keys(cats).length).padStart(2, '0');
    }
    var dayCount = qs('#dayCount');
    if (dayCount) {
      var start = new Date(window.NEWSTAR_SITE_START || '2026-09-08T00:00:00');
      var days = Math.floor((Date.now() - start.getTime()) / 86400000) + 1;
      dayCount.textContent = String(days > 0 ? days : 1);
    }
    initSearch(qs('#globalSearchForm'), qs('#globalSearch'), qs('#homeArticles'), qs('#homeEmpty'));
    initSearch(qs('#blogSearchForm'), qs('#blogSearch'), qs('#blogArticles'), qs('#blogEmpty'));
    initCategoryList();
    initVideoBackground();
  });

  // 背景视频：系统开启「减弱动效」或省电模式时不自动播放，只显示静态封面
  function initVideoBackground() {
    var video = qs('.video-bg video');
    if (!video) return;
    try {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        video.removeAttribute('autoplay');
        video.pause();
        return;
      }
    } catch (e) {}
    var play = video.play();
    if (play && typeof play.catch === 'function') play.catch(function () {});
  }
}());
