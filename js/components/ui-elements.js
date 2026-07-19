export const UI = {
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    
    const colors = { success: '#22C55E', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' };
    toast.style.borderLeftColor = colors[type] || colors.info;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  openModal(htmlContent, onRender = () => {}) {
    const container = document.getElementById('modal-container');
    const body = document.getElementById('modal-body');
    body.innerHTML = htmlContent;
    container.classList.add('active');
    onRender(body);
  },

  closeModal() {
    document.getElementById('modal-container').classList.remove('active');
  }
};