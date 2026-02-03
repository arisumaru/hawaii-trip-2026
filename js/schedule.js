// スケジュールモジュール
const Schedule = {
  currentDay: 1,
  customNotes: {},
  customEvents: {},
  deletedDefaultEvents: {},
  NOTES_PATH: 'schedule/notes',
  EVENTS_PATH: 'schedule/events',
  notesSnapshot: '',
  eventsSnapshot: '',

  init() {
    this.watchNotes();
    this.watchEvents();
    this.render();
    this.bindEvents();
  },

  watchNotes() {
    FirebaseDB.onValue(this.NOTES_PATH, (data) => {
      const normalized = data || {};
      const serialized = JSON.stringify(normalized);
      if (serialized === this.notesSnapshot) {
        this.customNotes = normalized;
        return;
      }
      this.notesSnapshot = serialized;
      this.customNotes = normalized;
      this.renderContent();
    });
  },

  watchEvents() {
    const snapshot = data => {
      const normalized = {
        customEvents: {},
        deletedDefaultEvents: {},
        ...(data || {}),
      };
      const serialized = JSON.stringify(normalized);
      if (serialized === this.eventsSnapshot) {
        this.customEvents = normalized.customEvents || {};
        this.deletedDefaultEvents = normalized.deletedDefaultEvents || {};
        return;
      }
      this.eventsSnapshot = serialized;
      this.customEvents = normalized.customEvents || {};
      this.deletedDefaultEvents = normalized.deletedDefaultEvents || {};
      this.renderContent();
    };

    FirebaseDB.onValue(this.EVENTS_PATH, snapshot);
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month} / ${day} (${weekday})`;
  },

  render() {
    this.renderTabs();
    this.renderContent();
  },

  renderTabs() {
    const tabsContainer = document.getElementById('schedule-tabs');
    const tabs = DATA.schedule.map(day => `
      <li>
        <a href="#" data-day="${day.day}" class="${day.day === this.currentDay ? 'active' : ''}">
          Day ${day.day}
        </a>
      </li>
    `).join('');
    tabsContainer.innerHTML = `<ul>${tabs}</ul>`;
  },

  renderContent() {
    const contentContainer = document.getElementById('schedule-content');
    if (!contentContainer) return;
    const dayData = DATA.schedule.find(d => d.day === this.currentDay);

    if (!dayData) {
      contentContainer.innerHTML = '<p>スケジュールがありません</p>';
      return;
    }

    const deletedIndexes = new Set(this.deletedDefaultEvents[this.currentDay] || []);
    const defaultEvents = dayData.events
      .map((event, index) => ({ ...event, source: 'default', defaultIndex: index }))
      .filter(item => !deletedIndexes.has(item.defaultIndex));

    const customEvents = (this.customEvents[this.currentDay] || []).map(event => ({
      ...event,
      source: 'custom',
    }));

    const combinedEvents = [...defaultEvents, ...customEvents];
    combinedEvents.sort((a, b) => {
      const timeA = a.time || '';
      const timeB = b.time || '';
      return timeA.localeCompare(timeB);
    });

    const eventsHtml = combinedEvents.length
      ? combinedEvents.map((event) => {
        const isCustom = event.source === 'custom';
        const noteKey = isCustom
          ? `custom-${event.id}`
          : `default-${this.currentDay}-${event.defaultIndex}`;
        const noteValue = this.getNote(noteKey);
        const deleteId = isCustom
          ? event.id
          : `default-${this.currentDay}-${event.defaultIndex}`;
        return `
          <tr>
            <td><strong>${this.escapeHtml(event.time)}</strong></td>
            <td>${this.escapeHtml(event.title)}</td>
            <td>${this.escapeHtml(event.location)}</td>
            <td>
              <textarea class="note-input" rows="1" data-note-key="${this.escapeHtml(noteKey)}">${this.escapeHtml(noteValue)}</textarea>
            </td>
            <td>
              <button type="button" class="schedule-delete-btn" data-event-id="${this.escapeHtml(deleteId)}">×</button>
            </td>
          </tr>
        `;
      }).join('')
      : `
        <tr>
          <td colspan="5" class="empty-row">予定はありません</td>
        </tr>
      `;

    contentContainer.innerHTML = `
      <div class="schedule-day active">
        <h4>
          <span class="schedule-date">${this.formatDate(dayData.date)}</span>
          <span class="schedule-title">${this.escapeHtml(dayData.title)}</span>
        </h4>
        <table>
          <thead>
            <tr>
              <th>時間</th>
              <th>予定</th>
              <th>場所</th>
              <th>メモ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${eventsHtml}
          </tbody>
        </table>
      </div>
    `;
  },

  getNote(key) {
    if (!key) return '';
    return this.customNotes[key] || '';
  },

  setNote(key, note) {
    if (!key) return;
    this.customNotes = {
      ...this.customNotes,
      [key]: note,
    };
    this.notesSnapshot = JSON.stringify(this.customNotes);
    FirebaseDB.save(this.NOTES_PATH, this.customNotes);
  },

  addEvent(day, time, title, location) {
    if (!day || !time || !title) return;
    const newEvent = {
      id: this.generateEventId(),
      time,
      title,
      location: location || '',
    };
    const events = [...(this.customEvents[day] || []), newEvent];
    events.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    this.customEvents = {
      ...this.customEvents,
      [day]: events,
    };
    this.persistEvents();
    this.renderContent();
  },

  deleteEvent(day, eventId) {
    if (!day || !eventId) return;
    if (eventId.startsWith('default-')) {
      const parts = eventId.split('-');
      const index = parseInt(parts[2], 10);
      if (Number.isNaN(index)) return;
      const existing = this.deletedDefaultEvents[day] || [];
      if (existing.includes(index)) return;
      const updated = [...existing, index];
      this.deletedDefaultEvents = {
        ...this.deletedDefaultEvents,
        [day]: updated,
      };
    } else {
      const events = (this.customEvents[day] || []).filter(evt => evt.id !== eventId);
      this.customEvents = {
        ...this.customEvents,
        [day]: events,
      };
    }
    this.persistEvents();
    this.renderContent();
  },

  persistEvents() {
    const payload = {
      customEvents: this.customEvents,
      deletedDefaultEvents: this.deletedDefaultEvents,
    };
    const serialized = JSON.stringify(payload);
    this.eventsSnapshot = serialized;
    FirebaseDB.save(this.EVENTS_PATH, payload);
  },

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  },

  escapeHtml(value) {
    if (value === undefined || value === null) {
      return '';
    }
    return value
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  bindEvents() {
    document.getElementById('schedule-tabs')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.tagName === 'A' && e.target.dataset.day) {
        const day = parseInt(e.target.dataset.day, 10);
        this.switchDay(day);
      }
    });

    document.getElementById('schedule-add-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const time = formData.get('time')?.toString().trim();
      const title = formData.get('title')?.toString().trim();
      const location = formData.get('location')?.toString().trim() || '';
      if (!time || !title) return;
      this.addEvent(this.currentDay, time, title, location);
      form.reset();
    });

    const contentContainer = document.getElementById('schedule-content');
    contentContainer?.addEventListener('input', (e) => {
      const target = e.target;
      if (target.classList.contains('note-input')) {
        const key = target.dataset.noteKey;
        this.setNote(key, target.value);
      }
    });

    contentContainer?.addEventListener('click', (e) => {
      const target = e.target;
      if (target.classList.contains('schedule-delete-btn')) {
        const eventId = target.dataset.eventId;
        this.deleteEvent(this.currentDay, eventId);
      }
    });
  },

  switchDay(day) {
    this.currentDay = day;
    this.render();
  },
};
