// 緊急連絡先モジュール
const Emergency = {
  customContacts: [],
  deletedDefaultIds: [],
  CUSTOM_PATH: 'emergency/custom',
  DELETED_PATH: 'emergency/deleted',
  customSnapshot: '',
  deletedSnapshot: '',

  init() {
    this.watchCustomContacts();
    this.watchDeletedIds();
    this.render();
    this.bindEvents();
  },

  watchCustomContacts() {
    FirebaseDB.onValue(this.CUSTOM_PATH, (data) => {
      const normalized = this.normalizeArray(data);
      const serialized = JSON.stringify(normalized);
      if (serialized === this.customSnapshot) {
        return;
      }
      this.customSnapshot = serialized;
      this.customContacts = normalized;
      this.render();
    });
  },

  watchDeletedIds() {
    FirebaseDB.onValue(this.DELETED_PATH, (data) => {
      const normalized = this.normalizeArray(data);
      const serialized = JSON.stringify(normalized);
      if (serialized === this.deletedSnapshot) {
        return;
      }
      this.deletedSnapshot = serialized;
      this.deletedDefaultIds = normalized;
      this.render();
    });
  },

  normalizeArray(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Object.values(data);
  },

  saveCustomContacts() {
    this.customSnapshot = JSON.stringify(this.customContacts);
    FirebaseDB.save(this.CUSTOM_PATH, this.customContacts);
  },

  saveDeletedIds() {
    this.deletedSnapshot = JSON.stringify(this.deletedDefaultIds);
    FirebaseDB.save(this.DELETED_PATH, this.deletedDefaultIds);
  },

  getAllContacts() {
    // デフォルト連絡先（削除されたものを除く）
    const defaultContacts = DATA.emergencyContacts
      .map((c, i) => ({ ...c, id: 'default_' + i }))
      .filter(c => !this.deletedDefaultIds.includes(c.id));

    return [...defaultContacts, ...this.customContacts];
  },

  addContact(name, phone, note) {
    const id = 'custom_' + Date.now();
    this.customContacts.push({ id, name, phone, note });
    this.saveCustomContacts();
    this.render();
  },

  deleteContact(id) {
    if (id.startsWith('custom_')) {
      this.customContacts = this.customContacts.filter(c => c.id !== id);
      this.saveCustomContacts();
    } else {
      if (!this.deletedDefaultIds.includes(id)) {
        this.deletedDefaultIds.push(id);
      }
      this.saveDeletedIds();
    }
    this.render();
  },

  render() {
    const container = document.getElementById('emergency-container');
    if (!container) return;

    const contacts = this.getAllContacts();

    if (contacts.length === 0) {
      container.innerHTML = '<p class="no-results">連絡先がありません</p>';
      return;
    }

    const html = contacts.map(contact => `
      <div class="emergency-item">
        <div class="emergency-info">
          <span class="emergency-name">${contact.name}</span>
          <a href="tel:${contact.phone}" class="emergency-phone">${contact.phone}</a>
          ${contact.note ? `<span class="emergency-note">${contact.note}</span>` : ''}
        </div>
        <button type="button" class="delete-item-btn" data-id="${contact.id}">×</button>
      </div>
    `).join('');

    container.innerHTML = html;
  },

  bindEvents() {
    // 削除ボタン
    document.getElementById('emergency-container')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-item-btn')) {
        this.deleteContact(e.target.dataset.id);
      }
    });

    // 追加フォーム
    document.getElementById('emergency-add-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const name = form.contactName.value.trim();
      const phone = form.contactPhone.value.trim();
      const note = form.contactNote.value.trim();

      if (name && phone) {
        this.addContact(name, phone, note);
        form.reset();
      }
    });
  }
};
