document.addEventListener('DOMContentLoaded', () => {
  const isZh = document.documentElement.lang.indexOf('zh') === 0;

  // --- 1. 漢堡選單 (RWD) ---
  const navToggle = document.getElementById('js-nav-toggle');
  const navMenu = document.getElementById('js-nav-menu');

  function closeMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.classList.remove('open');
    navMenu.classList.remove('mobile-active');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.classList.add('open');
    navMenu.classList.add('mobile-active');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  if (navToggle && navMenu) {
    navToggle.setAttribute('aria-expanded', 'false');

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // 點擊選單連結時自動收起選單
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // 點擊選單以外的任何地方收起選單
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Esc 鍵收起選單（鍵盤操作）
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeMenu();
      }
    });
  }


  // --- 2. Header 滾動與 Nav Active 狀態監聽 ---
  const header = document.querySelector('.header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // 滾動背景毛玻璃效果
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }

    // 當前 Section 的導覽列高亮（僅適用於單頁內有多個 <section> 錨點的頁面）
    if (sections.length > 0) {
      let currentActiveId = '';
      sections.forEach(sec => {
        const sectionTop = sec.offsetTop - parseInt(getComputedStyle(document.documentElement).scrollPaddingTop || '0') - 10;
        const sectionHeight = sec.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentActiveId = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (currentActiveId && link.getAttribute('href') === `#${currentActiveId}`) {
          link.classList.add('active');
        }
      });
    }
  });


  // --- 3. 數據 Count-up / Count-down 動畫 ---
  function animateStats() {
    // 精度動畫：從 1.0 mm 遞減到目標公差
    const precEl = document.getElementById('stat-precision');
    if (precEl && !precEl.classList.contains('animated')) {
      precEl.classList.add('animated');
      const start = 1.0;
      const target = parseFloat(precEl.getAttribute('data-target'));
      const duration = 1500;
      const startTime = performance.now();

      function updatePrecision(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const val = start - (start - target) * progress;
        precEl.textContent = `±${val.toFixed(1)} mm`;
        if (progress < 1) {
          requestAnimationFrame(updatePrecision);
        } else {
          precEl.textContent = `±${target.toFixed(1)} mm`;
        }
      }
      requestAnimationFrame(updatePrecision);
    }

    // 交期動畫：從 0 遞增到目標天數
    const leadEl = document.getElementById('stat-lead');
    if (leadEl && !leadEl.classList.contains('animated')) {
      leadEl.classList.add('animated');
      const start = 0;
      const target = parseInt(leadEl.getAttribute('data-target'), 10);
      const duration = 1500;
      const startTime = performance.now();

      function updateLead(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const val = Math.floor(start + (target - start) * progress);
        leadEl.textContent = `${val} ${isZh ? '天起' : 'Days'}`;
        if (progress < 1) {
          requestAnimationFrame(updateLead);
        } else {
          leadEl.textContent = `${target} ${isZh ? '天起' : 'Days'}`;
        }
      }
      requestAnimationFrame(updateLead);
    }

    // 研發週期動畫：從 0% 遞增到目標百分比
    const cycleEl = document.getElementById('stat-cycle');
    if (cycleEl && !cycleEl.classList.contains('animated')) {
      cycleEl.classList.add('animated');
      const start = 0;
      const target = parseInt(cycleEl.getAttribute('data-target'), 10);
      const duration = 1500;
      const startTime = performance.now();

      function updateCycle(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const val = Math.floor(start + (target - start) * progress);
        cycleEl.textContent = `${val}%`;
        if (progress < 1) {
          requestAnimationFrame(updateCycle);
        } else {
          cycleEl.textContent = `${target}%`;
        }
      }
      requestAnimationFrame(updateCycle);
    }
  }

  // 延遲一點點觸發以呈現流暢感
  setTimeout(animateStats, 300);


  // --- 4. 進度條動畫 (Intersection Observer) ---
  // (a) 研發週期進度條
  const cycleTrigger = document.getElementById('js-cycle-trigger');
  const amBar = document.getElementById('js-cycle-am-bar');

  if (cycleTrigger && amBar) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          amBar.style.width = '15.3%';
          observer.unobserve(cycleTrigger);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(cycleTrigger);
  }

  // (b) 三方量化比較圖表進度條
  const chartTrigger = document.getElementById('js-advantages-chart-trigger');
  const barFills = document.querySelectorAll('.advantages-chart .bar-fill');

  if (chartTrigger && barFills.length > 0) {
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          barFills.forEach(bar => {
            const score = parseFloat(bar.getAttribute('data-score'));
            bar.style.width = (score * 10) + '%';
          });
          chartObserver.unobserve(chartTrigger);
        }
      });
    }, { threshold: 0.1 });

    chartObserver.observe(chartTrigger);
  }


  // --- 5. FAQ 手風琴展開/收合（含鍵盤操作支援） ---
  const faqQuestions = document.querySelectorAll('.faq-question');

  function toggleFaq(question) {
    const item = question.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isActive = item.classList.contains('active');

    document.querySelectorAll('.faq-item').forEach(otherItem => {
      otherItem.classList.remove('active');
      const otherAnswer = otherItem.querySelector('.faq-answer');
      if (otherAnswer) otherAnswer.style.maxHeight = null;
      const otherQuestion = otherItem.querySelector('.faq-question');
      if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
    });

    if (!isActive) {
      item.classList.add('active');
      if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      question.setAttribute('aria-expanded', 'true');
    }
  }

  faqQuestions.forEach(question => {
    // 讓原本是 <div> 的題目可以用鍵盤操作（Tab 聚焦、Enter/Space 觸發）
    if (!question.hasAttribute('tabindex')) {
      question.setAttribute('tabindex', '0');
    }
    question.setAttribute('role', 'button');
    question.setAttribute('aria-expanded', 'false');

    question.addEventListener('click', () => toggleFaq(question));
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleFaq(question);
      }
    });
  });


  // --- 6. 痛點卡片手風琴控制 ---
  const painpointCards = document.querySelectorAll('.painpoint-card');
  painpointCards.forEach(card => {
    card.addEventListener('click', () => {
      const body = card.querySelector('.painpoint-card-body');
      const toggle = card.querySelector('.painpoint-toggle');
      const isActive = card.classList.contains('active');

      if (isActive) {
        card.classList.remove('active');
        if (body) body.style.maxHeight = null;
        if (toggle) toggle.textContent = '+';
      } else {
        card.classList.add('active');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
        if (toggle) toggle.textContent = '−';
      }
    });
  });


  // --- 7. 核心技術加工能力 Tab 分類切換 ---
  const capBtns = document.querySelectorAll('.cap-cat-btn');
  const capPanels = document.querySelectorAll('.cap-panel');

  capBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCat = btn.getAttribute('data-cat');

      capBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      capPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.getAttribute('id') === `panel-${targetCat}`) {
          panel.classList.add('active');
        }
      });
    });
  });
});
