// メインアプリケーション
const App = {
  init() {
    this.renderFlight();
    this.startCountdown();
    this.startLocalTimeClock();
    this.updateLastUpdated();
    this.initTopTabs();

    // 各モジュール初期化
    if (typeof Weather !== 'undefined') Weather.init();
    if (typeof Budget !== 'undefined') Budget.init();
    if (typeof Todo !== 'undefined') Todo.init();
    if (typeof Checklist !== 'undefined') Checklist.init();
    if (typeof Schedule !== 'undefined') Schedule.init();
    if (typeof Places !== 'undefined') Places.init();
    if (typeof Emergency !== 'undefined') Emergency.init();
  },

  // トップタブ切り替え
  initTopTabs() {
    const tabs = document.querySelectorAll('.top-tab');
    const contents = document.querySelectorAll('.tab-content');
    const title = document.getElementById('trip-title');

    const switchTab = (targetId) => {
      tabs.forEach(t => t.classList.remove('active'));
      const targetTab = document.querySelector(`.top-tab[data-tab="${targetId}"]`);
      if (targetTab) targetTab.classList.add('active');

      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${targetId}`) {
          content.classList.add('active');
        }
      });
      localStorage.setItem('hawaii_active_tab', targetId);
    };

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
      });
    });

    // タイトルクリックで基本情報に遷移
    if (title) {
      title.addEventListener('click', () => {
        switchTab('basic');
      });
    }

    // 保存されたタブを復元
    const savedTab = localStorage.getItem('hawaii_active_tab');
    if (savedTab) {
      switchTab(savedTab);
    } else {
      switchTab('basic');
    }
  },

  // フライト情報表示
  renderFlight() {
    const { outbound, return: ret } = DATA.flights;

    // 往路
    document.getElementById('flight-out-date').textContent = this.formatDate(outbound.date);
    document.getElementById('flight-out-number').textContent = `${outbound.airline} ${outbound.flightNumber}`;
    document.getElementById('flight-out-departure').textContent = `${outbound.departure.airport} ${outbound.departure.time}`;
    document.getElementById('flight-out-arrival').textContent = `${outbound.arrival.airport} ${outbound.arrival.time}`;

    // 復路
    document.getElementById('flight-return-date').textContent = this.formatDate(ret.date);
    document.getElementById('flight-return-number').textContent = `${ret.airline} ${ret.flightNumber}`;
    document.getElementById('flight-return-departure').textContent = `${ret.departure.airport} ${ret.departure.time}`;
    document.getElementById('flight-return-arrival').textContent = `${ret.arrival.airport} ${ret.arrival.time}`;
  },

  // 緊急連絡先表示
  renderEmergencyContacts() {
    const tbody = document.querySelector('#emergency-table tbody');
    tbody.innerHTML = DATA.emergencyContacts.map(contact => `
      <tr>
        <th>${contact.name}</th>
        <td><a href="tel:${contact.phone}">${contact.phone}</a></td>
        <td><small>${contact.note}</small></td>
      </tr>
    `).join('');
  },

  // 訪問予定地リスト表示
  renderPlaces() {
    const ul = document.getElementById('places-list');

    // カテゴリでグループ化
    const categories = [...new Set(DATA.places.map(p => p.category))];

    ul.innerHTML = categories.map(cat => {
      const places = DATA.places.filter(p => p.category === cat);
      const placesHtml = places.map(place => {
        const searchQuery = encodeURIComponent(place.name + ' Hawaii');
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
        const budgetInfo = place.budget ? `<span class="place-budget">${place.budget}</span>` : '';
        const siteLink = place.url ? `<a href="${place.url}" target="_blank" class="place-url">🔗</a>` : '';
        return `
          <li>
            <a href="${mapUrl}" target="_blank" class="place-map-link">📍 ${place.name}</a>
            ${budgetInfo}
            ${siteLink}
          </li>
        `;
      }).join('');

      return `
        <li class="place-category-group">
          <strong>${cat}</strong>
          <ul>${placesHtml}</ul>
        </li>
      `;
    }).join('');
  },

  // カウントダウン
  startCountdown() {
    const update = () => {
      const startDate = new Date(DATA.trip.startDate);
      const now = new Date();
      const diff = startDate - now;

      if (diff > 0) {
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        document.getElementById('countdown').innerHTML = `出発まであと <strong>${days}</strong> 日`;
      } else {
        document.getElementById('countdown').innerHTML = '<strong>旅行中！</strong>';
      }
    };
    update();
    setInterval(update, 60000); // 1分ごと更新
  },

  // ホノルル現地時間
  startLocalTimeClock() {
    const update = () => {
      const now = new Date();
      const options = {
        timeZone: DATA.trip.destination.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      const time = now.toLocaleTimeString('ja-JP', options);
      document.getElementById('local-time').innerHTML = `ホノルル現地時間: <strong>${time}</strong>`;
    };
    update();
    setInterval(update, 1000); // 1秒ごと更新
  },

  // 最終更新日
  updateLastUpdated() {
    const now = new Date();
    document.getElementById('last-updated').textContent = now.toLocaleDateString('ja-JP');
  },

  // 日付フォーマット
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}(${weekday})`;
  }
};

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => App.init());
