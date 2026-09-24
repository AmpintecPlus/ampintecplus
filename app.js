// Antigravity (Gemini): Confirmed ready to collaborate with Claude (Sonnet) for code implementation.
document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'zh';

  // --- 1. 初始化語言切換 ---
  const langSwitchBtn = document.getElementById('js-lang-switch');

  // 輔助函式：根據 dot-path 讀取 translation 物件 (例如 "hero.title")
  function getTranslationValue(lang, path) {
    const keys = path.split('.');
    let value = translations[lang];
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        return null;
      }
    }
    return value;
  }

  // 切換語言主函式
  function switchLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';

    // 遍歷所有文字翻譯元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = getTranslationValue(lang, key);
      if (text !== null) {
        // 如果內容含有 HTML 標記，則使用 innerHTML，否則使用 textContent
        if (/<[a-z][\s\S]*>/i.test(text)) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // 遍歷所有 placeholder 元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = getTranslationValue(lang, key);
      if (text !== null) {
        el.setAttribute('placeholder', text);
      }
    });

    // 遍歷所有自訂屬性綁定元素 (例如 data-i18n-attr="data-target:hero.stat_lead_val")
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const binding = el.getAttribute('data-i18n-attr');
      const pairs = binding.split(';');
      pairs.forEach(pair => {
        const parts = pair.split(':').map(s => s.trim());
        if (parts.length === 2) {
          const [attr, key] = parts;
          const val = getTranslationValue(lang, key);
          if (val !== null) {
            el.setAttribute(attr, val);
          }
        }
      });
    });

    // 動態更新 head title & description (SEO 需求與英文去中文)
    const titleVal = getTranslationValue(lang, 'meta.title');
    if (titleVal) {
      document.title = titleVal;
    }
    const descVal = getTranslationValue(lang, 'meta.description');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (descVal && metaDesc) {
      metaDesc.setAttribute('content', descVal);
    }

    // 切換按鈕文字提示 (中文切換為 TW)
    if (langSwitchBtn) {
      langSwitchBtn.textContent = lang === 'zh' ? 'EN' : 'TW';
    }

    // 當數據與語系更新時，重置動畫標記並重新播放 Count-up 動畫
    ['stat-precision', 'stat-lead', 'stat-cycle'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('animated');
    });
    animateStats();

    // 重製表單可能需要的提示（如有正在進行的驗證狀態）
  }

  if (langSwitchBtn) {
    langSwitchBtn.addEventListener('click', () => {
      const nextLang = currentLang === 'zh' ? 'en' : 'zh';
      switchLanguage(nextLang);
    });
  }

  // 預設載入中文
  switchLanguage('zh');


  // --- 2. 漢堡選單 (RWD) ---
  const navToggle = document.getElementById('js-nav-toggle');
  const navMenu = document.getElementById('js-nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('mobile-active');
    });

    // 點擊選單連結時自動收起選單
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('mobile-active');
      });
    });

    // 點擊選單以外的任何地方收起選單
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('open');
        navMenu.classList.remove('mobile-active');
      }
    });
  }


  // --- 3. Header 滾動與 Nav Active 狀態監聽 ---
  const header = document.querySelector('.header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // 滾動背景毛玻璃效果
    if (window.scrollY > 50) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }

    // 當前 Section 的導覽列高亮
    let currentActiveId = '';
    sections.forEach(sec => {
      const sectionTop = sec.offsetTop - parseInt(getComputedStyle(document.documentElement).scrollPaddingTop) - 10;
      const sectionHeight = sec.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentActiveId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentActiveId}`) {
        link.classList.add('active');
      }
    });
  });


  // --- 4. 數據 Count-up / Count-down 動畫 ---
  function animateStats() {
    // 精度動畫：從 1.0 mm 遞減到 0.1 mm (公差越小越精密)
    const precEl = document.getElementById('stat-precision');
    if (precEl && !precEl.classList.contains('animated')) {
      precEl.classList.add('animated');
      let start = 1.0;
      const target = parseFloat(precEl.getAttribute('data-target'));
      const duration = 1500;
      const startTime = performance.now();

      function updatePrecision(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // 線性插值遞減
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

    // 交期動畫：從 0 天遞增到 14 天
    const leadEl = document.getElementById('stat-lead');
    if (leadEl && !leadEl.classList.contains('animated')) {
      leadEl.classList.add('animated');
      let start = 0;
      const target = parseInt(leadEl.getAttribute('data-target'));
      const duration = 1500;
      const startTime = performance.now();

      function updateLead(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const val = Math.floor(start + (target - start) * progress);
        leadEl.textContent = `${val} ${currentLang === 'zh' ? '天起' : 'Days'}`;
        if (progress < 1) {
          requestAnimationFrame(updateLead);
        } else {
          leadEl.textContent = `${target} ${currentLang === 'zh' ? '天起' : 'Days'}`;
        }
      }
      requestAnimationFrame(updateLead);
    }

    // 研發週期動畫：從 0% 遞增到 90%
    const cycleEl = document.getElementById('stat-cycle');
    if (cycleEl && !cycleEl.classList.contains('animated')) {
      cycleEl.classList.add('animated');
      let start = 0;
      const target = parseInt(cycleEl.getAttribute('data-target'));
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

  // 延遲一點點觸發以呈現流暢感，或滾動時再次確認觸發
  setTimeout(animateStats, 300);


  // --- 5. 進度條動畫 (Intersection Observer) ---
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


  // --- 6. FAQ 手風琴展開/收合 ---
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });


  // --- 7. 聯絡表單前端驗證與模擬送出 ---
  const contactForm = document.getElementById('js-contact-form');
  const toast = document.getElementById('js-toast');
  const toastText = document.getElementById('js-toast-text');

  function showToast(message, isSuccess = true) {
    if (!toast || !toastText) return;
    toastText.textContent = message;

    if (isSuccess) {
      toast.style.borderLeftColor = 'var(--color-gold)';
      toast.querySelector('.toast-icon').textContent = '✓';
      toast.querySelector('.toast-icon').style.color = 'var(--color-gold)';
    } else {
      toast.style.borderLeftColor = '#ff3b30';
      toast.querySelector('.toast-icon').textContent = '✕';
      toast.querySelector('.toast-icon').style.color = '#ff3b30';
    }

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // Google Apps Script 部署後的 Web App URL (請在此處替換為您的 Apps Script 部署網址)
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4UJfNMm4Ozca_46U7zr4VO4hJ6HAFedDsrwak4XoYKUxG_SXzLn5nybVuizx1of0a/exec';

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const company = document.getElementById('company').value.trim();
      const name = document.getElementById('name').value.trim();
      const job = document.getElementById('job') ? document.getElementById('job').value.trim() : '';
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const desc = document.getElementById('description').value.trim();
      const consent = document.getElementById('consent').checked;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!company || !name || !email || !phone || !desc || !consent) {
        const errorMsg = translations[currentLang].contact.toast_error;
        showToast(errorMsg, false);
        return;
      }

      if (!emailRegex.test(email)) {
        const emailErrorMsg = currentLang === 'zh' ? '請輸入有效的 Email 地址。' : 'Please enter a valid email address.';
        showToast(emailErrorMsg, false);
        return;
      }

      const phoneRegex = /^[0-9+\-\s]+$/;
      if (!phoneRegex.test(phone)) {
        const phoneErrorMsg = currentLang === 'zh' ? '請輸入有效的電話號碼（僅限數字、+、- 或空格）。' : 'Please enter a valid phone number (digits, +, -, or spaces only).';
        showToast(phoneErrorMsg, false);
        return;
      }

      // 取得送出按鈕並顯示載入狀態
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = currentLang === 'zh' ? '傳送中...' : 'Sending...';
      }

      // 準備送出的資料 payload
      const formData = new URLSearchParams();
      formData.append('company', company);
      formData.append('name', name);
      formData.append('job', job);
      formData.append('title', job);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('description', desc);
      formData.append('requirement', desc);

      // 如果未設定真實 URL 則進行模擬傳送
      if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
          const successMsg = translations[currentLang].contact.toast_success;
          showToast(successMsg, true);
          contactForm.reset();
        }, 1000);
      } else {
        // 發送至 Google Apps Script
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        })
          .then(() => {
            const successMsg = translations[currentLang].contact.toast_success;
            showToast(successMsg, true);
            contactForm.reset();
          })
          .catch(err => {
            console.error('Submit Error:', err);
            const failMsg = currentLang === 'zh' ? '傳送失敗，請稍後再試或直接來信詢問。' : 'Submission failed. Please try again later or email us directly.';
            showToast(failMsg, false);
          })
          .finally(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalBtnText;
            }
          });
      }
    });
  }


  // --- 8. 痛點卡片手風琴控制 ---
  const painpointCards = document.querySelectorAll('.painpoint-card');
  painpointCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const body = card.querySelector('.painpoint-card-body');
      const toggle = card.querySelector('.painpoint-toggle');
      const isActive = card.classList.contains('active');

      if (isActive) {
        card.classList.remove('active');
        body.style.maxHeight = null;
        if (toggle) toggle.textContent = '+';
      } else {
        card.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
        if (toggle) toggle.textContent = '−';
      }
    });
  });


  // --- 8.5. 核心技術加工能力 Tab 分類切換 ---
  const capBtns = document.querySelectorAll('.cap-cat-btn');
  const capPanels = document.querySelectorAll('.cap-panel');

  capBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCat = btn.getAttribute('data-cat');

      // 切換按鈕 active 狀態
      capBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 切換面板 active 狀態 (顯示對應面板，隱藏其他)
      capPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.getAttribute('id') === `panel-${targetCat}`) {
          panel.classList.add('active');
        }
      });
    });
  });


});
