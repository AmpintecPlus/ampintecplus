document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('js-contact-form');
  if (!form) return;

  const isZh = document.documentElement.lang.indexOf('zh') === 0;
  const toast = document.getElementById('js-toast');
  const toastText = document.getElementById('js-toast-text');
  const endpoint = form.dataset.endpoint;
  const salesEmail = form.dataset.salesEmail;

  function showToast(html, isSuccess) {
    if (!toast || !toastText) return;
    toastText.innerHTML = html;

    const icon = toast.querySelector('.toast-icon');
    if (isSuccess) {
      toast.style.borderLeftColor = 'var(--color-gold)';
      if (icon) {
        icon.textContent = '✓';
        icon.style.color = 'var(--color-gold)';
      }
    } else {
      toast.style.borderLeftColor = '#ff3b30';
      if (icon) {
        icon.textContent = '✕';
        icon.style.color = '#ff3b30';
      }
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 6000);
  }

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Honeypot：有值視為機器人，靜默丟棄，不顯示任何訊息
    const honeypot = form.querySelector('#website');
    if (honeypot && honeypot.value.trim() !== '') {
      return;
    }

    const company = form.querySelector('#company').value.trim();
    const name = form.querySelector('#name').value.trim();
    const job = form.querySelector('#job') ? form.querySelector('#job').value.trim() : '';
    const email = form.querySelector('#email').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const description = form.querySelector('#description').value.trim();
    const consent = form.querySelector('#consent').checked;
    const lang = form.querySelector('input[name="lang"]').value;
    const page = form.querySelector('input[name="page"]').value;

    const errorMsg = isZh
      ? '請填寫所有必填欄位並勾選同意條款。'
      : 'Please fill in all required fields and check the consent box.';

    if (!company || !name || !email || !phone || !description || !consent) {
      showToast(esc(errorMsg), false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = isZh ? '請輸入有效的 Email 地址。' : 'Please enter a valid email address.';
      showToast(esc(msg), false);
      return;
    }

    const phoneRegex = /^[0-9+\-\s]+$/;
    if (!phoneRegex.test(phone)) {
      const msg = isZh
        ? '請輸入有效的電話號碼（僅限數字、+、- 或空格）。'
        : 'Please enter a valid phone number (digits, +, -, or spaces only).';
      showToast(esc(msg), false);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = isZh ? '傳送中...' : 'Sending...';
    }

    const payload = { company, name, job, title: job, email, phone, description, requirement: description, lang, page };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const successMsg = isZh
      ? '感謝您的諮詢，我們將盡快與您聯繫！'
      : "Thank you for your inquiry — we'll be in touch shortly!";
    const failLead = isZh
      ? '傳送失敗，請稍後再試或直接來信詢問：'
      : 'Submission failed. Please try again later or email us directly:';
    const failHtml = esc(failLead) + ' <a href="mailto:' + salesEmail + '">' + salesEmail + '</a>';

    function resetButton() {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }

    if (!endpoint) {
      clearTimeout(timeoutId);
      resetButton();
      showToast(failHtml, false);
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeoutId);
        resetButton();
        if (data && data.result === 'success') {
          showToast(esc(successMsg), true);
          form.reset();
        } else {
          // 失敗：保留表單內容，不清空
          showToast(failHtml, false);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        resetButton();
        // 網路錯誤、逾時、非 JSON 回應：保留表單內容，不清空
        showToast(failHtml, false);
      });
  });
});
