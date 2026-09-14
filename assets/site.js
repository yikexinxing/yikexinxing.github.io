// 全站交互脚本：使 dropdown 点击不导航（保持 hover 行为），文章卡可点、添加客户端搜索、活动项点击等
document.addEventListener('DOMContentLoaded', function () {
  // 1) 禁止 dropdown-trigger 的默认导航行为（用户要求点击“朋友圈”不跳转）
  document.querySelectorAll('.dropdown-trigger').forEach(function (a) {
    a.addEventListener('click', function (e) {
      // 阻止链接导航，保持 hover 下拉菜单的原始行为
      e.preventDefault();
      // 为可选的无障碍/移动设备支持，切换一个 open 类以便 CSS 可以在需要时显示菜单
      var parent = this.closest('.nav-dropdown');
      if (parent) {
        parent.classList.toggle('open');
        var expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', (!expanded).toString());
      }
    });
  });

  // 2) 使整张 article-card 可点击（对 <a> 不需要额外处理）
  document.querySelectorAll('.article-card').forEach(function (card) {
    // 如果卡片是 <a>，浏览器会自动处理；为了兼容，也支持点击内部 .article-link 跳转
    card.addEventListener('click', function (e) {
      var link = this.getAttribute('href') || this.dataset.href;
      if (link) {
        // 点击 READ_MORE 也会触发此处，直接导航
        window.location.href = link;
      }
    });
  });

  // 3) 客户端搜索：根据标题/内容过滤 article-card（简单即时搜索）
  var searchInput = document.getElementById('globalSearch');
  var searchBtn = document.getElementById('searchBtn');
  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', function () {
      var q = searchInput.value.trim().toLowerCase();
      var cards = document.querySelectorAll('.article-list .article-card');
      cards.forEach(function (c) {
        var text = (c.textContent || '').toLowerCase();
        c.style.display = q === '' || text.indexOf(q) !== -1 ? '' : 'none';
      });
    });
    // 回车触发搜索
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') searchBtn.click();
    });
  }

  // 4) 小的无障碍改进：为所有 article-link 添加 role/aria
  document.querySelectorAll('.article-link').forEach(function (el) {
    el.setAttribute('role', 'link');
    el.setAttribute('aria-label', (el.closest('.article-card')?.querySelector('h3')?.textContent || 'article') + ' 阅读更多');
  });
});
