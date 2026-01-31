// スケジュールモジュール
const Schedule = {
  currentDay: 1,
  customNotes: {},
  NOTES_PATH: 'schedule/notes',
  notesSnapshot: '',

  init() {
    this.watchNotes();
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

  getNote(day, eventIndex) {
    const key = `${day}-${eventIndex}`;
    if (this.customNotes[key] !== undefined) {
      return this.customNotes[key];
    }
    const dayData = DATA.schedule.find(d => d.day === day);
    return dayData?.events[eventIndex]?.note || '';
  },

  setNote(day, eventIndex, note) {
    const key = `${day}-${eventIndex}`;
    this.customNotes = {
      ...this.customNotes,
      [key]: note,
    };
    this.notesSnapshot = JSON.stringify(this.customNotes);
    FirebaseDB.save(this.NOTES_PATH, this.customNotes);
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
    const dayData = DATA.schedule.find(d => d.day === this.currentDay);

    if (!dayData) {
      contentContainer.innerHTML = '<p>スケジュールがありません</p>';
      return;
    }

    const eventsHtml = dayData.events.map((event, index) => {
      const note = this.getNote(this.currentDay, index);
      return `
        <tr>
          <td><strong>${event.time}</strong></td>
          <td>${event.title}</td>
          <td>${event.location}</td>
          <td>
            <textarea class="note-input" data-day="${this.currentDay}" data-index="${index}" rows="1">${note}</textarea>
          </td>
        </tr>
      `;
    }).join('');

    contentContainer.innerHTML = `
      <div class="schedule-day active">
        <h4><span class="schedule-date">${this.formatDate(dayData.date)}</span> <span class="schedule-title">${dayData.title}</span></h4>
        <table>
          <thead>
            <tr>
              <th>時間</th>
              <th>予定</th>
              <th>場所</th>
              <th>メモ</th>
            </tr>
          </thead>
          <tbody>
            ${eventsHtml}
          </tbody>
        </table>
      </div>
    `;
  },

  switchDay(day) {
    this.currentDay = day;
    this.render();
  },

  bindEvents() {
    document.getElementById('schedule-tabs')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.tagName === 'A' && e.target.dataset.day) {
        const day = parseInt(e.target.dataset.day);
        this.switchDay(day);
      }
    });

    // メモ入力の保存
    document.getElementById('schedule-content')?.addEventListener('input', (e) => {
      if (e.target.classList.contains('note-input')) {
        const day = parseInt(e.target.dataset.day);
        const index = parseInt(e.target.dataset.index);
        this.setNote(day, index, e.target.value);
      }
    });
  }
};
