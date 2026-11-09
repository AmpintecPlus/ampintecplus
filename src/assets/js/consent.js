document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('js-cookie-banner');
  if (!banner) return;

  const CONSENT_KEY = banner.dataset.consentKey;
  const MAX_AGE_DAYS = Number(banner.dataset.consentMaxAgeDays) || 365;
  const GA_ID = banner.dataset.gaId || '';
  const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  const acceptBtn = document.getElementById('js-cookie-accept');
  const rejectBtn = document.getElementById('js-cookie-reject');
  const settingsBtn = document.getElementById('js-cookie-settings');

  // --- Consent Mode v2：預設全部拒絕（在任何第三方腳本可能載入之前就設定）---
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });

  function hasRealGaId() {
    return !!GA_ID && GA_ID.indexOf('[') !== 0;
  }

  function readConsent() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed.analytics !== 'boolean' || typeof parsed.ts !== 'number') return null;
      if (Date.now() - parsed.ts > MAX_AGE_MS) return null; // 已過期，視為沒有紀錄
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(analytics) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics, ts: Date.now() }));
    } catch (e) {
      /* localStorage 無法使用時，仍可正常瀏覽，僅無法記住選擇 */
    }
  }

  function showBanner() {
    banner.hidden = false;
  }

  function hideBanner() {
    banner.hidden = true;
  }

  function deleteCookie(name) {
    const paths = ['/'];
    const domains = [undefined, window.location.hostname, '.' + window.location.hostname.replace(/^www\./, '')];
    paths.forEach((path) => {
      domains.forEach((domain) => {
        let cookieStr = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path;
        if (domain) cookieStr += '; domain=' + domain;
        document.cookie = cookieStr;
      });
    });
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        deleteCookie(name);
      }
    });
  }

  function loadGA4() {
    if (!hasRealGaId()) {
      // GA4 ID 還是佔位符（例如 "[GA4 ID]"），依規則一律不載入，不插入任何第三方腳本
      return;
    }
    if (document.getElementById('js-ga4-script')) return; // 已載入過，不重複載入

    gtag('consent', 'update', { analytics_storage: 'granted' });

    const script = document.createElement('script');
    script.id = 'js-ga4-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function applyConsent(analytics) {
    if (analytics) {
      loadGA4();
    } else {
      gtag('consent', 'update', { analytics_storage: 'denied' });
      deleteAnalyticsCookies();
    }
  }

  // --- 初始化：依現有（未過期的）同意紀錄決定是否顯示橫幅、是否載入 GA4 ---
  const existing = readConsent();
  if (existing) {
    hideBanner();
    if (existing.analytics) {
      loadGA4();
    }
  } else {
    showBanner();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      writeConsent(true);
      applyConsent(true);
      hideBanner();
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      writeConsent(false);
      applyConsent(false);
      hideBanner();
    });
  }

  // 頁尾「Cookie 設定」：隨時重新打開橫幅，讓訪客變更或撤回同意
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showBanner();
      if (acceptBtn) acceptBtn.focus();
    });
  }
});
