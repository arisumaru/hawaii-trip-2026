// パスワード保護モジュール
const Auth = {
  // パスワードのハッシュ値（SHA-256）
  HASH: '517e0952ae5caa556eb4622153d1f7a121577fc7c3197c182395fb9cc30c183b',
  STORAGE_KEY: 'hawaii_trip_auth',

  init() {
    // 認証済みかチェック
    if (this.isAuthenticated()) {
      this.showContent();
      return;
    }

    this.bindEvents();
  },

  isAuthenticated() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored === this.HASH;
  },

  async checkPassword(password) {
    const hash = await this.sha256(password);
    return hash === this.HASH;
  },

  async sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  showContent() {
    const screen = document.getElementById('password-screen');
    if (screen) {
      screen.classList.add('hidden');
    }
  },

  async handleSubmit() {
    const input = document.getElementById('password-input');
    const error = document.getElementById('password-error');
    const password = input.value;

    if (!password) {
      error.textContent = 'パスワードを入力してください';
      return;
    }

    const isValid = await this.checkPassword(password);

    if (isValid) {
      localStorage.setItem(this.STORAGE_KEY, this.HASH);
      this.showContent();
    } else {
      error.textContent = 'パスワードが違います';
      input.value = '';
      input.focus();
    }
  },

  bindEvents() {
    const submitBtn = document.getElementById('password-submit');
    const input = document.getElementById('password-input');

    submitBtn?.addEventListener('click', () => this.handleSubmit());

    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSubmit();
      }
    });
  }
};

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
