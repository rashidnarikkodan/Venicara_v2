(function () {
  let _notyf = null;

  function getNotyf() {
    if (!_notyf && typeof Notyf !== 'undefined') {
      _notyf = new Notyf({
        duration: 3500,
        position: { x: 'right', y: 'bottom' },
        ripple: false,
        dismissible: true,
        types: [
          {
            type: 'success',
            background: '#1a1a1a',
            icon: { className: 'fa-solid fa-check', tagName: 'i', color: '#d4af37' },
          },
          {
            type: 'error',
            background: '#1a1a1a',
            icon: { className: 'fa-solid fa-xmark', tagName: 'i', color: '#ef4444' },
          },
          {
            type: 'info',
            background: '#1a1a1a',
            icon: { className: 'fa-solid fa-info', tagName: 'i', color: '#60a5fa' },
          },
        ],
      });
    }
    return _notyf;
  }

  window.showToast = function (type, message) {
    if (!message) return;
    const notyf = getNotyf();
    if (!notyf) {
      console.log(`[Toast ${type}]:`, message);
      return;
    }
    if (type === 'success') {
      notyf.success(message);
    } else if (type === 'error') {
      notyf.error(message);
    } else {
      notyf.open({ type: 'info', message });
    }
  };

  // Legacy showAlert alias
  window.showAlert = window.showToast;

  // Auto-fire server-rendered flash messages on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    const successEl = document.getElementById('flash-success');
    const errorEl = document.getElementById('flash-error');

    if (successEl && successEl.dataset.message) {
      showToast('success', successEl.dataset.message);
    }
    if (errorEl && errorEl.dataset.message) {
      showToast('error', errorEl.dataset.message);
    }
  });

  // Global 401/unauthenticated redirect handler for fetch() API calls
  window.handleApiResponse = function (response, data) {
    if (response.status === 401) {
      const redirectUrl = (data && data.data && data.data.redirect) || '/auth/login';
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  };

  // Global Wishlist Button Delegated Handler for all productCard instances
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.wishlist-btn');
    if (!btn) return;

    // If already handled by a page-specific handler that stopped propagation, return
    if (btn.dataset.handling === 'true') return;
    btn.dataset.handling = 'true';

    e.preventDefault();
    e.stopPropagation();

    const icon = btn.querySelector('i');
    const productId = btn.dataset.productId;
    const variantId = btn.dataset.variantId;

    try {
      const res = await fetch(`/wishlist/items/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ variantId }),
      });

      const data = await res.json();
      if (!window.handleApiResponse(res, data)) return;

      if (data.success || data.status) {
        window.showToast('success', data.message);
        const action = data.data?.action;
        if (icon) {
          if (action === 'removed') {
            icon.classList.remove('fa-solid', 'text-gold-500');
            icon.classList.add('fa-regular');
          } else if (action === 'added') {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid', 'text-gold-500');
          } else {
            icon.classList.toggle('fa-regular');
            icon.classList.toggle('fa-solid');
            icon.classList.toggle('text-gold-500');
          }
        }
      } else {
        window.showToast('error', data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      window.showToast('error', 'Connection error. Please try again.');
    } finally {
      setTimeout(() => {
        delete btn.dataset.handling;
      }, 300);
    }
  });
})();
