// 持ち物チェックリストモジュール
const Checklist = {
  ITEMS_PATH: 'checklist/items',
  CATEGORIES_PATH: 'checklist/categories',
  items: {},
  customItems: [],
  customCategories: [],
  deletedDefaultItems: [],
  deletedDefaultCategories: [],
  pendingCategorySelection: null,
  defaultCategories: [
    { id: 'documents', name: '大事', icon: '📄' },
    { id: 'clothes', name: '衣類', icon: '👕' },
    { id: 'toiletries', name: '日用品', icon: '🧴' },
    { id: 'electronics', name: '電子機器', icon: '📱' },
    { id: 'medicine', name: '医薬品', icon: '💊' }
  ],

  async init() {
    await this.fetchInitialData();
    this.setupRealtimeListeners();
    this.render();
    this.bindEvents();
  },

  async fetchInitialData() {
    const [categoriesData, itemsData] = await Promise.all([
      FirebaseDB.get(this.CATEGORIES_PATH),
      FirebaseDB.get(this.ITEMS_PATH)
    ]);
    this.handleCategoriesData(categoriesData);
    this.handleItemsData(itemsData);
  },

  setupRealtimeListeners() {
    FirebaseDB.onValue(this.CATEGORIES_PATH, (data) => {
      this.handleCategoriesData(data);
      this.render();
    });
    FirebaseDB.onValue(this.ITEMS_PATH, (data) => {
      this.handleItemsData(data);
      this.render();
    });
  },

  handleCategoriesData(data) {
    const snapshot = data || {};
    this.customCategories = Array.isArray(snapshot.customCategories) ? [...snapshot.customCategories] : [];
    this.deletedDefaultCategories = Array.isArray(snapshot.deletedDefaultCategories)
      ? [...snapshot.deletedDefaultCategories]
      : [];
    this.ensureDefaultItems();
  },

  handleItemsData(data) {
    const snapshot = data || {};
    this.items = snapshot.items && typeof snapshot.items === 'object' ? { ...snapshot.items } : {};
    this.customItems = Array.isArray(snapshot.customItems) ? [...snapshot.customItems] : [];
    this.deletedDefaultItems = Array.isArray(snapshot.deletedDefaultItems)
      ? [...snapshot.deletedDefaultItems]
      : [];
    this.ensureDefaultItems();
  },

  ensureDefaultItems() {
    this.getActiveDefaultCategories().forEach(cat => {
      (DATA.checklist[cat.id] || []).forEach(item => {
        if (!(item.id in this.items)) {
          this.items[item.id] = false;
        }
      });
    });
  },

  persistItems() {
    FirebaseDB.save(this.ITEMS_PATH, {
      items: this.items,
      customItems: this.customItems,
      deletedDefaultItems: this.deletedDefaultItems
    });
  },

  persistCategories() {
    FirebaseDB.save(this.CATEGORIES_PATH, {
      customCategories: this.customCategories,
      deletedDefaultCategories: this.deletedDefaultCategories
    });
  },

  getActiveDefaultCategories() {
    return this.defaultCategories.filter(
      cat => !this.deletedDefaultCategories.includes(cat.id)
    );
  },

  getCategories() {
    return [...this.getActiveDefaultCategories(), ...this.customCategories];
  },

  isDefaultCategory(catId) {
    return this.defaultCategories.some(cat => cat.id === catId);
  },

  addItem(name, category) {
    const id = 'custom_' + Date.now();
    const categories = this.getCategories();
    const targetCategory = category || (categories.length ? categories[0].id : 'documents');
    this.customItems.push({ id, name, category: targetCategory });
    this.items[id] = false;
    this.persistItems();
    this.render();
  },

  addCategory(name) {
    const id = 'checklist_cat_' + Date.now();
    this.customCategories.push({ id, name, icon: '📦' });
    this.pendingCategorySelection = id;
    this.persistCategories();
    this.render();
  },

  deleteItem(id) {
    if (!id) return;
    if (id.startsWith('custom_')) {
      this.customItems = this.customItems.filter(item => item.id !== id);
    } else if (!this.deletedDefaultItems.includes(id)) {
      this.deletedDefaultItems.push(id);
    }
    delete this.items[id];
    this.persistItems();
    this.render();
  },

  deleteCategory(catId) {
    if (!catId) return;

    const itemsInCategory = this.getItemsForCategory(catId);
    itemsInCategory.forEach(item => {
      delete this.items[item.id];
      if (DATA.checklist[catId]?.some(i => i.id === item.id)) {
        if (!this.deletedDefaultItems.includes(item.id)) {
          this.deletedDefaultItems.push(item.id);
        }
      }
    });

    this.customItems = this.customItems.filter(item => item.category !== catId);

    if (this.isDefaultCategory(catId)) {
      if (!this.deletedDefaultCategories.includes(catId)) {
        this.deletedDefaultCategories.push(catId);
      }
    } else {
      this.customCategories = this.customCategories.filter(cat => cat.id !== catId);
    }

    this.persistItems();
    this.persistCategories();
    this.render();
  },

  toggleItem(id) {
    if (!id) return;
    this.items[id] = !this.items[id];
    this.persistItems();
    this.updateItemUI(id);
  },

  updateItemUI(id) {
    const checkbox = document.querySelector(`input[data-id="${id}"]`);
    if (checkbox) {
      checkbox.checked = this.items[id];
      checkbox.closest('.checklist-item').classList.toggle('checked', this.items[id]);
    }
  },

  getItemsForCategory(catId) {
    const defaultItems = (DATA.checklist[catId] || []).filter(
      item => !this.deletedDefaultItems.includes(item.id)
    );
    const customItems = this.customItems.filter(item => item.category === catId);
    return [...defaultItems, ...customItems];
  },

  render() {
    const container = document.getElementById('checklist-container');
    if (!container) return;

    const html = this.getCategories().map(cat => {
      const items = this.getItemsForCategory(cat.id);
      const itemsHtml = items.map(item => {
        return `
          <div class="checklist-item ${this.items[item.id] ? 'checked' : ''}">
            <label>
              <input type="checkbox" data-id="${item.id}" ${this.items[item.id] ? 'checked' : ''}>
              ${item.name}
            </label>
            <button type="button" class="delete-item-btn" data-id="${item.id}">×</button>
          </div>
        `;
      }).join('');

      const deleteButton = `<button type="button" class="delete-category-btn" data-category="${cat.id}">削除</button>`;

      return `
        <div class="checklist-category">
          <div class="checklist-category-title">
            ${cat.icon} ${cat.name}
            ${deleteButton}
          </div>
          ${itemsHtml}
        </div>
      `;
    }).join('');

    container.innerHTML = html;
    this.updateCategorySelect(this.pendingCategorySelection);
    this.pendingCategorySelection = null;
  },

  updateCategorySelect(preferredCategoryId) {
    const select = document.getElementById('checklist-category');
    if (!select) return;
    const categories = this.getCategories();
    const currentValue = select.value;
    select.innerHTML = categories
      .map(cat => `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`)
      .join('');
    const fallbackId = categories[0]?.id || '';
    let selectedId = preferredCategoryId || currentValue || fallbackId;
    if (!categories.some(cat => cat.id === selectedId)) {
      selectedId = fallbackId;
    }
    if (selectedId) {
      select.value = selectedId;
    }
  },

  bindEvents() {
    document.getElementById('checklist-container')?.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox' && e.target.dataset.id) {
        this.toggleItem(e.target.dataset.id);
      }
    });

    document.getElementById('checklist-container')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-item-btn')) {
        this.deleteItem(e.target.dataset.id);
      }

      if (e.target.classList.contains('delete-category-btn')) {
        this.deleteCategory(e.target.dataset.category);
      }
    });

    document.getElementById('checklist-add-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const name = form.itemName.value.trim();
      const category = form.category?.value;
      if (name) {
        this.addItem(name, category);
        form.reset();
        if (category && form.category) {
          form.category.value = category;
        }
      }
    });

    document.getElementById('checklist-category-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const name = form.categoryName.value.trim();
      if (name) {
        this.addCategory(name);
        form.reset();
      }
    });
  }
};
