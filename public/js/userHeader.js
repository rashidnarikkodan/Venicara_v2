// userHeader.js - Global notifications handled by toast.js
// Backward compatibility fallback if needed
if (typeof showAlert === 'undefined' && typeof showToast !== 'undefined') {
  window.showAlert = window.showToast;
}
