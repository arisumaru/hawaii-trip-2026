// 天気予報モジュール（Open-Meteo API）
const Weather = {
  API_URL: 'https://api.open-meteo.com/v1/forecast',

  locations: {
    honolulu: { name: 'ホノルル', latitude: 21.3069, longitude: -157.8583 },
    koolina: { name: 'コオリナ', latitude: 21.3380, longitude: -158.1280 }
  },

  currentLocation: 'honolulu',

  init() {
    this.fetchWeather();
    this.bindEvents();
  },

  bindEvents() {
    const self = this;

    document.getElementById('refresh-weather')?.addEventListener('click', function() {
      self.fetchWeather();
    });

    document.getElementById('btn-honolulu')?.addEventListener('click', function() {
      self.switchLocation('honolulu');
    });

    document.getElementById('btn-koolina')?.addEventListener('click', function() {
      self.switchLocation('koolina');
    });
  },

  switchLocation(locationId) {
    this.currentLocation = locationId;

    // ボタンのアクティブ状態を更新
    document.querySelectorAll('.location-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${locationId}`)?.classList.add('active');

    // タイトル更新
    document.getElementById('weather-location-name').textContent = this.locations[locationId].name;

    // 天気を取得
    this.fetchWeather();
  },

  async fetchWeather() {
    const container = document.getElementById('weather-container');
    container.innerHTML = '<p>読み込み中...</p>';

    const location = this.locations[this.currentLocation];
    const { latitude, longitude } = location;

    const params = new URLSearchParams({
      latitude,
      longitude,
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'Pacific/Honolulu',
      forecast_days: 7
    });

    try {
      const response = await fetch(`${this.API_URL}?${params}`);
      const data = await response.json();
      this.render(data);
    } catch (error) {
      container.innerHTML = '<p>天気情報を取得できませんでした</p>';
      console.error('Weather fetch error:', error);
    }
  },

  render(data) {
    const container = document.getElementById('weather-container');
    const { daily } = data;

    if (!daily || !daily.time) {
      container.innerHTML = '<p>天気データがありません</p>';
      return;
    }

    const cards = daily.time.map((date, i) => {
      const weatherCode = daily.weather_code[i];
      const maxTemp = Math.round(daily.temperature_2m_max[i]);
      const minTemp = Math.round(daily.temperature_2m_min[i]);
      const rain = daily.precipitation_probability_max[i];

      return `
        <div class="weather-card">
          <div class="weather-date">${this.formatDate(date)}</div>
          <div class="weather-icon">${this.getWeatherIcon(weatherCode)}</div>
          <div class="weather-temp">${maxTemp}° / ${minTemp}°</div>
          <div class="weather-rain">☔ ${rain}%</div>
        </div>
      `;
    }).join('');

    container.innerHTML = cards;
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}(${weekday})`;
  },

  getWeatherIcon(code) {
    // WMO Weather interpretation codes
    const icons = {
      0: '☀️',           // Clear sky
      1: '🌤️', 2: '⛅', 3: '☁️',  // Partly cloudy
      45: '🌫️', 48: '🌫️',        // Fog
      51: '🌦️', 53: '🌦️', 55: '🌧️',  // Drizzle
      56: '🌧️', 57: '🌧️',        // Freezing drizzle
      61: '🌧️', 63: '🌧️', 65: '🌧️',  // Rain
      66: '🌧️', 67: '🌧️',        // Freezing rain
      71: '❄️', 73: '❄️', 75: '❄️',  // Snow
      77: '❄️',                   // Snow grains
      80: '🌦️', 81: '🌧️', 82: '⛈️',  // Showers
      85: '❄️', 86: '❄️',        // Snow showers
      95: '⛈️',                   // Thunderstorm
      96: '⛈️', 99: '⛈️'         // Thunderstorm with hail
    };
    return icons[code] || '🌡️';
  }
};
