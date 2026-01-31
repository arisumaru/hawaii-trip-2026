// 費用管理モジュール
const Budget = {
  expenses: [],
  customCategories: [],
  EXPENSES_PATH: 'budget/expenses',
  CATEGORIES_PATH: 'budget/categories',
  selectedCurrency: 'jpy',
  currencySymbols: {
    jpy: '¥',
    usd: '$'
  },

  async init() {
    await Promise.all([this.setupExpenseSync(), this.setupCategorySync()]);
    this.bindEvents();
  },

  getCategories() {
    const defaultCategories = DATA.budget.categories;
    return [...defaultCategories, ...this.customCategories];
  },

  ensureArray(data) {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object') {
      return Object.values(data);
    }
    return [];
  },

  normalizeExpenses(data) {
    return this.ensureArray(data).map(exp => ({
      ...exp,
      currency: exp.currency || 'jpy'
    }));
  },

  async setupExpenseSync() {
    return new Promise((resolve) => {
      FirebaseDB.onValue(this.EXPENSES_PATH, (data) => {
        const isInitial = !this._expensesSynced;
        this.expenses = this.normalizeExpenses(data);
        if (isInitial) {
          this._expensesSynced = true;
          resolve();
        }
        this.render();
      });
    });
  },

  async setupCategorySync() {
    return new Promise((resolve) => {
      FirebaseDB.onValue(this.CATEGORIES_PATH, (data) => {
        const isInitial = !this._categoriesSynced;
        this.customCategories = this.ensureArray(data);
        if (isInitial) {
          this._categoriesSynced = true;
          resolve();
        }
        this.renderCategories();
        this.renderCategoryList();
      });
    });
  },

  async saveExpenses() {
    await FirebaseDB.save(this.EXPENSES_PATH, this.expenses);
  },

  async saveCustomCategories() {
    await FirebaseDB.save(this.CATEGORIES_PATH, this.customCategories);
  },

  addCategory(name) {
    const id = 'cat_' + Date.now();
    this.customCategories.push({ id, name, color: '#888888' });
    this.saveCustomCategories();
    this.renderCategories();
    this.renderCategoryList();
  },

  deleteCategory(id) {
    this.customCategories = this.customCategories.filter(c => c.id !== id);
    this.saveCustomCategories();
    this.renderCategories();
    this.renderCategoryList();
  },

  renderCategories() {
    const select = document.getElementById('expense-category');
    select.innerHTML = this.getCategories().map(cat =>
      `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
  },

  renderCategoryList() {
    // カテゴリリスト表示は不要
  },

  addExpense(item, amount, category, currency = 'jpy') {
    this.expenses.push({
      id: Date.now(),
      date: new Date().toISOString(),
      item,
      amount: parseInt(amount),
      category,
      currency,
      note: ''
    });
    this.saveExpenses();
    this.render();
  },

  updateNote(id, note) {
    const expense = this.expenses.find(e => e.id === id);
    if (expense) {
      expense.note = note;
      this.saveExpenses();
    }
  },

  deleteExpense(id) {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.saveExpenses();
    this.render();
  },

  getTotalSpent() {
    return this.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  },

  getCategoryName(categoryId) {
    const cat = this.getCategories().find(c => c.id === categoryId);
    return cat ? cat.name : categoryId;
  },

  formatCurrency(amount, currency = 'jpy') {
    const symbol = this.currencySymbols[currency] || this.currencySymbols.jpy;
    const value = Number(amount) || 0;
    return `${symbol}${value.toLocaleString()}`;
  },

  render() {
    const spent = this.getTotalSpent();
    document.getElementById('budget-spent').textContent = this.formatCurrency(spent, this.selectedCurrency);

    const tbody = document.querySelector('#expense-list tbody');
    tbody.innerHTML = this.expenses.map(e => `
      <tr>
        <td>${e.item}</td>
        <td>${this.getCategoryName(e.category)}</td>
        <td>${this.formatCurrency(e.amount, e.currency || 'jpy')}</td>
        <td><textarea class="note-input" data-id="${e.id}" rows="1">${e.note || ''}</textarea></td>
        <td><button class="delete-btn" data-id="${e.id}">削除</button></td>
      </tr>
    `).join('');

    if (this.expenses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">費用履歴がありません</td></tr>';
    }
  },

  bindEvents() {
    // 費用追加フォーム
    document.getElementById('expense-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const item = form.item.value.trim();
      const amount = form.amount.value;
      const category = form.category.value;
      const currency = this.selectedCurrency;

      if (item && amount) {
        this.addExpense(item, amount, category, currency);
        form.reset();
      }
    });

    // 削除ボタン
    document.querySelector('#expense-list tbody')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.dataset.id);
        this.deleteExpense(id);
      }
    });

    // メモ入力
    document.querySelector('#expense-list tbody')?.addEventListener('input', (e) => {
      if (e.target.classList.contains('note-input')) {
        const id = parseInt(e.target.dataset.id);
        this.updateNote(id, e.target.value);
      }
    });

    // カテゴリ追加フォーム
    document.getElementById('expense-category-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const name = form.categoryName.value.trim();
      if (name) {
        this.addCategory(name);
        form.reset();
      }
    });

    // 通貨切り替えボタン
    const currencyButtons = document.querySelectorAll('.currency-btn');
    currencyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectCurrency(btn.dataset.currency);
      });
    });
    this.updateCurrencyButtons();

    // カテゴリ削除ボタン
    document.getElementById('expense-category-list')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-cat-btn')) {
        this.deleteCategory(e.target.dataset.id);
      }
    });
  },

  selectCurrency(currency) {
    if (!currency) return;
    this.selectedCurrency = currency;
    this.updateCurrencyButtons();
    this.render();
  },

  updateCurrencyButtons() {
    document.querySelectorAll('.currency-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.currency === this.selectedCurrency);
    });
  }
};
