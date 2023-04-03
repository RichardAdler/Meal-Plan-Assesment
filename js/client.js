document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
  
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        window.open('/login', 'loginPopup', 'width=400,height=400');
      });
    }
  });
  