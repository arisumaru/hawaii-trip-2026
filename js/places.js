// 訪問地・レストランモジュール
const Places = {
  currentArea: 'all',
  currentCat: 'all',
  map: null,
  markers: [],
  editingPlaceId: null,
  customImages: {},
  customMemos: {},
  pendingImage: null,
  remoteCustomPlaceIds: new Set(),

  // コオリナエリアの店舗ID
  defaultKoolinaIds: ['marriott_koolina', 'noe', 'minas', 'amaama', 'roys', 'monkeypod', 'longhis', 'mekiko', 'eggsnthings_ko'],
  koolinaIds: [],

  // カテゴリ別マーカー色
  markerColors: {
    '🏨 ホテル': '#e91e63',
    '🍽️ 高級': '#e74c3c',
    '🍴 カジュアル': '#3498db',
    '🥡 テイクアウト': '#2ecc71',
    'ビーチ': '#f39c12',
    '自然': '#27ae60',
    'ショッピング': '#9b59b6',
    '観光': '#e67e22'
  },

  init() {
    this.koolinaIds = [...this.defaultKoolinaIds];
    this.loadCustomPlaces();
    this.render();
    this.bindEvents();
    this.bindTabEvents();
  },

  initMap() {
    const mapContainer = document.getElementById('places-map');
    if (!mapContainer) return;

    // 既にマップがあれば再描画のみ
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
      return;
    }

    try {
      // オアフ島中央付近を初期表示
      this.map = L.map('places-map').setView([21.4, -157.9], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.updateMarkers();
    } catch (e) {
      console.error('Map initialization error:', e);
    }
  },

  // タブ表示時にマップを初期化
  bindTabEvents() {
    const placesTab = document.querySelector('.top-tab[data-tab="places"]');
    if (placesTab) {
      placesTab.addEventListener('click', () => {
        // タブ切り替え後に少し遅延してマップを初期化
        setTimeout(() => {
          this.initMap();
        }, 100);
      });
    }
  },

  updateMarkers() {
    if (!this.map) return;

    // 既存マーカーを削除
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    const places = this.getFilteredPlaces();

    places.forEach(place => {
      if (!place.lat || !place.lng) return;

      const color = this.markerColors[place.category] || '#666';

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(this.map)
        .bindPopup(`
          <strong>${place.name}</strong><br>
          <span style="font-size:0.8em;color:#666;">${place.category}</span>
          ${place.budget ? `<br><span style="font-size:0.8em;color:#3498db;">${place.budget}</span>` : ''}
        `);

      this.markers.push(marker);
    });
  },

  getFilteredPlaces() {
    return DATA.places.filter(place => {
      // エリアフィルター
      let areaMatch = true;
      if (this.currentArea === 'koolina') {
        areaMatch = this.koolinaIds.includes(place.id);
      } else if (this.currentArea === 'waikiki') {
        areaMatch = !this.koolinaIds.includes(place.id);
      }

      // カテゴリフィルター
      let catMatch = true;
      if (this.currentCat === 'hotel') {
        catMatch = place.category && place.category.includes('ホテル');
      } else if (this.currentCat === 'spot') {
        catMatch = !place.budget && !place.category.includes('ホテル');
      } else if (this.currentCat === 'fine') {
        catMatch = place.category && place.category.includes('高級');
      } else if (this.currentCat === 'casual') {
        catMatch = place.category && place.category.includes('カジュアル');
      } else if (this.currentCat === 'takeout') {
        catMatch = place.category && place.category.includes('テイクアウト');
      }

      return areaMatch && catMatch;
    });
  },

  render() {
    const grid = document.getElementById('places-grid');
    if (!grid) return;

    const places = this.getFilteredPlaces();

    if (places.length === 0) {
      grid.innerHTML = '<p class="no-results">該当する店舗がありません</p>';
      return;
    }

    grid.innerHTML = places.map(place => {
      const searchQuery = encodeURIComponent(place.name + ' Hawaii');
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
      const budgetHtml = place.budget ? `<span class="place-card-budget">${place.budget}</span>` : '';
      const urlHtml = place.url ? `<a href="${place.url}" target="_blank" class="place-card-link">公式サイト</a>` : '';
      const memo = this.customMemos[place.id] || place.memo || '';
      const memoBtnHtml = memo ? `<button class="place-card-memo-btn" type="button" data-id="${place.id}" data-memo="${encodeURIComponent(memo)}">📝 メモ</button>` : '';
      let imgSrc;
      let imgStyle = '';
      if (this.customImages && this.customImages[place.id]) {
        imgSrc = this.customImages[place.id];
      } else {
        imgSrc = `images/restaurants/${place.id}.jpg`;
        imgStyle = 'onerror="this.style.display=\\\'none\\\'"';
      }

      return `
        <div class="place-card">
          <div class="place-card-image">
            <img src="${imgSrc}" alt="${place.name}" ${imgStyle}>
            <span class="place-card-category">${place.category}</span>
            <button class="place-card-edit" data-id="${place.id}" title="編集">✎</button>
          </div>
          <div class="place-card-body">
            <h4 class="place-card-name">${place.name}</h4>
            <div class="place-card-info">
              ${budgetHtml}
            </div>
            <div class="place-card-actions">
              <a href="${mapUrl}" target="_blank" class="place-card-map">📍 地図</a>
              ${urlHtml}
              ${memoBtnHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  setArea(area) {
    this.currentArea = area;
    document.querySelectorAll('.area-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.area === area);
    });
    this.render();
    this.updateMarkers();

    // エリアに応じてマップの表示位置を変更
    if (this.map) {
      if (area === 'koolina') {
        this.map.setView([21.339, -158.123], 14);
      } else if (area === 'waikiki') {
        this.map.setView([21.276, -157.827], 14);
      } else {
        this.map.setView([21.4, -157.9], 10);
      }
    }
  },

  setCat(cat) {
    this.currentCat = cat;
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === cat);
    });
    this.render();
    this.updateMarkers();
  },

  openDialog(placeId = null) {
    const dialog = document.getElementById('add-place-dialog');
    const form = document.getElementById('add-place-form');
    const title = document.getElementById('place-dialog-title');
    const submitBtn = document.getElementById('place-dialog-submit');
    const memoField = form.querySelector('[name="memo"]');

    form.reset();
    form.querySelector('[name="editId"]').value = '';
    if (memoField) {
      memoField.value = '';
    }

    if (placeId) {
      this.editingPlaceId = placeId;
      title.textContent = 'お店・スポットを編集';
      submitBtn.textContent = '保存する';

      const place = DATA.places.find(p => p.id === placeId);
      if (!place) return;

      form.querySelector('[name="editId"]').value = place.id;
      form.querySelector('[name="mapUrl"]').value = place.url || '';
      form.querySelector('[name="placeName"]').value = place.name;
      form.querySelector('[name="category"]').value = place.category;
      form.querySelector('[name="budget"]').value = place.budget || '';
      if (memoField) {
        memoField.value = this.customMemos[place.id] || place.memo || '';
      }

      const area = this.koolinaIds.includes(place.id) ? 'koolina' : 'waikiki';
      form.querySelector('[name="area"]').value = area;

      form.querySelector('[name="mapUrl"]').required = false;
    } else {
      this.editingPlaceId = null;
      title.textContent = 'お店・スポットを追加';
      submitBtn.textContent = '追加する';
      form.querySelector('[name="mapUrl"]').required = true;
    }

    // 画像プレビューをリセット
    this.clearImagePreview();

    // 編集モードでカスタム画像がある場合はプレビュー表示
    if (placeId && this.customImages && this.customImages[placeId]) {
      this.pendingImage = this.customImages[placeId];
      this.showImagePreview(this.customImages[placeId]);
    }

    dialog.showModal();
  },

  bindEvents() {
    // エリアフィルター
    document.querySelectorAll('.area-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setArea(btn.dataset.area);
      });
    });

    // カテゴリフィルター
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setCat(btn.dataset.cat);
      });
    });

    // 追加ボタン
    const addBtn = document.getElementById('add-place-btn');
    const dialog = document.getElementById('add-place-dialog');
    const closeBtn = document.getElementById('close-place-dialog');
    const form = document.getElementById('add-place-form');

    if (addBtn && dialog) {
      addBtn.addEventListener('click', () => {
        this.openDialog();
      });

      closeBtn.addEventListener('click', () => {
        dialog.close();
      });

      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          dialog.close();
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const editId = formData.get('editId');

        if (editId) {
          this.updatePlace(formData);
        } else {
          this.addPlace(formData);
        }

        form.reset();
        dialog.close();
        this.editingPlaceId = null;
      });
    }

    const grid = document.getElementById('places-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const memoBtn = e.target.closest('.place-card-memo-btn');
        if (memoBtn) {
          e.preventDefault();
          e.stopPropagation();
          const memo = memoBtn.dataset.memo ? decodeURIComponent(memoBtn.dataset.memo) : '';
          this.showMemoPopup(memo);
          return;
        }
        const editBtn = e.target.closest('.place-card-edit');
        if (editBtn) {
          e.preventDefault();
          e.stopPropagation();
          const placeId = editBtn.dataset.id;
          this.openDialog(placeId);
        }
      });
    }
    this.bindImageDropEvents();
  },

  // 新しい場所を追加
  addPlace(formData) {
    const mapUrl = formData.get('mapUrl');
    const name = formData.get('placeName');
    const area = formData.get('area');
    const category = formData.get('category');
    const budget = formData.get('budget');
    const memo = (formData.get('memo') || '').trim();

    // 座標を抽出（Google Maps URLから）
    const coords = this.extractCoords(mapUrl);

    // ユニークIDを生成
    const id = 'custom_' + Date.now();

    const newPlace = {
      id: id,
      name: name,
      category: category,
      lat: coords.lat,
      lng: coords.lng,
      url: mapUrl,
      custom: true
    };

    if (budget) {
      newPlace.budget = budget;
    }
    if (memo) {
      newPlace.memo = memo;
    }

    // コオリナエリアの場合はkoolinaIdsに追加
    if (area === 'koolina') {
      this.koolinaIds.push(id);
    }

    // カスタム画像がある場合は保存
    if (this.pendingImage) {
      if (!this.customImages) this.customImages = {};
      this.customImages[id] = this.pendingImage;
      this.pendingImage = null;
    }

    // DATA.placesに追加
    DATA.places.push(newPlace);

    this.saveCustomPlaces();

    // 再描画
    this.render();
    this.updateMarkers();
  },

  updatePlace(formData) {
    const editId = formData.get('editId');
    const place = DATA.places.find(p => p.id === editId);
    if (!place) return;

    const mapUrl = formData.get('mapUrl');
    const name = formData.get('placeName');
    const area = formData.get('area');
    const category = formData.get('category');
    const budget = formData.get('budget');
    const memo = (formData.get('memo') || '').trim();

    place.name = name;
    place.category = category;
    place.url = mapUrl || place.url;

    if (budget) {
      place.budget = budget;
    } else {
      delete place.budget;
    }
    if (memo) {
      place.memo = memo;
      this.customMemos[editId] = memo;
    } else {
      delete place.memo;
      delete this.customMemos[editId];
    }

    if (mapUrl) {
      const coords = this.extractCoords(mapUrl);
      if (coords.lat !== 21.3069 || coords.lng !== -157.8583) {
        place.lat = coords.lat;
        place.lng = coords.lng;
      }
    }

    const isCurrentlyKoolina = this.koolinaIds.includes(editId);
    if (area === 'koolina' && !isCurrentlyKoolina) {
      this.koolinaIds.push(editId);
    } else if (area !== 'koolina' && isCurrentlyKoolina) {
      this.koolinaIds = this.koolinaIds.filter(id => id !== editId);
    }

    if (place.custom) {
      this.saveCustomPlaces();
    }

    // 画像の更新
    if (this.pendingImage) {
      if (!this.customImages) this.customImages = {};
      this.customImages[editId] = this.pendingImage;
      this.pendingImage = null;
    }

    // メモと画像を保存
    this.saveCustomPlaces();

    this.render();
    this.updateMarkers();
  },

  async processImage(file) {
    return new Promise((resolve, reject) => {
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('ファイルサイズが大きすぎます（10MB以下）'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 400;
          const maxHeight = 300;
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(base64);
        };
        img.onerror = () => reject(new Error('画像読み込み失敗'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('ファイル読み込み失敗'));
      reader.readAsDataURL(file);
    });
  },

  bindImageDropEvents() {
    const dropZone = document.getElementById('image-drop-zone');
    const fileInput = document.getElementById('image-file-input');
    const removeBtn = document.getElementById('remove-image-btn');

    if (!dropZone) return;

    dropZone.addEventListener('click', (e) => {
      if (e.target !== removeBtn && !(removeBtn && removeBtn.contains(e.target))) {
        if (fileInput) {
          fileInput.click();
        }
      }
    });

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) await this.handleImageFile(file);
      });
    }

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        await this.handleImageFile(file);
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearImagePreview();
      });
    }
  },

  async handleImageFile(file) {
    try {
      const base64 = await this.processImage(file);
      this.pendingImage = base64;
      this.showImagePreview(base64);
    } catch (error) {
      alert(error.message);
    }
  },

  showImagePreview(base64) {
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-image');
    const dropContent = document.getElementById('drop-zone-content');
    if (!preview || !previewImg || !dropContent) return;
    
    previewImg.src = base64;
    preview.hidden = false;
    dropContent.style.display = 'none';
  },

  clearImagePreview() {
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-image');
    const dropContent = document.getElementById('drop-zone-content');
    const fileInput = document.getElementById('image-file-input');
    if (!preview || !previewImg || !dropContent) return;
    
    previewImg.src = '';
    preview.hidden = true;
    dropContent.style.display = '';
    if (fileInput) {
      fileInput.value = '';
    }
    this.pendingImage = null;
  },

  // Google Maps URLから座標を抽出
  extractCoords(url) {
    // デフォルト座標（ホノルル中心）
    let lat = 21.3069;
    let lng = -157.8583;

    try {
      // パターン1: @21.xxx,-157.xxx
      const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (atMatch) {
        lat = parseFloat(atMatch[1]);
        lng = parseFloat(atMatch[2]);
        return { lat, lng };
      }

      // パターン2: !3d21.xxx!4d-157.xxx
      const dMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
      if (dMatch) {
        lat = parseFloat(dMatch[1]);
        lng = parseFloat(dMatch[2]);
        return { lat, lng };
      }

      // パターン3: ll=21.xxx,-157.xxx
      const llMatch = url.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (llMatch) {
        lat = parseFloat(llMatch[1]);
        lng = parseFloat(llMatch[2]);
        return { lat, lng };
      }
    } catch (e) {
      console.error('座標の抽出に失敗:', e);
    }

    return { lat, lng };
  },

  showMemoPopup(memo) {
    if (!memo) return;

    const overlay = document.createElement('div');
    overlay.className = 'memo-popup-overlay';
    overlay.innerHTML = `
      <div class="memo-popup">
        <header class="memo-popup-header">メモ</header>
        <div class="memo-popup-content"></div>
        <button type="button" class="memo-popup-close">閉じる</button>
      </div>
    `;
    const content = overlay.querySelector('.memo-popup-content');
    if (content) {
      content.textContent = memo;
    }

    const removeOverlay = () => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    };

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('.memo-popup-close')) {
        removeOverlay();
      }
    });

    document.body.appendChild(overlay);
  },

  // カスタム場所をFirebaseへ保存
  saveCustomPlaces() {
    const customPlaces = DATA.places.filter(p => p.custom);
    const placeMap = {};
    customPlaces.forEach(place => {
      placeMap[place.id] = place;
    });

    const customKoolinaIds = this.koolinaIds.filter(id => id.startsWith('custom_'));
    const images = this.customImages || {};
    const memos = this.customMemos || {};

    FirebaseDB.save('places/custom', placeMap);
    FirebaseDB.save('places/koolinaIds', customKoolinaIds);
    FirebaseDB.save('places/images', images);
    FirebaseDB.save('places/memos', memos);
  },

  // Firebaseからカスタム情報を同期
  loadCustomPlaces() {
    this.customImages = {};
    this.customMemos = {};
    this.remoteCustomPlaceIds = new Set();

    FirebaseDB.onValue('places/custom', (data) => {
      this.applyFirebaseCustomPlaces(data);
    });
    FirebaseDB.onValue('places/images', (data) => {
      this.customImages = data || {};
      this.render();
      this.updateMarkers();
    });
    FirebaseDB.onValue('places/memos', (data) => {
      this.customMemos = data || {};
      this.render();
    });
    FirebaseDB.onValue('places/koolinaIds', (data) => {
      this.applyFirebaseKoolinaIds(data);
    });
  },

  applyFirebaseCustomPlaces(rawData) {
    const normalized = this.normalizeFirebaseCustomPlaces(rawData);
    const remoteIds = new Set(Object.keys(normalized));
    const idsToRemove = [];

    this.remoteCustomPlaceIds.forEach(id => {
      if (!remoteIds.has(id)) {
        idsToRemove.push(id);
      }
    });

    if (idsToRemove.length > 0) {
      DATA.places = DATA.places.filter(place => !place.custom || !idsToRemove.includes(place.id));
    }

    this.remoteCustomPlaceIds = remoteIds;

    Object.values(normalized).forEach(place => {
      const customPlace = { ...place, custom: true };
      const index = DATA.places.findIndex(p => p.id === customPlace.id);
      if (index >= 0) {
        DATA.places[index] = {
          ...DATA.places[index],
          ...customPlace
        };
      } else {
        DATA.places.push(customPlace);
      }
    });

    this.render();
    this.updateMarkers();
  },

  normalizeFirebaseCustomPlaces(data) {
    if (!data) return {};
    const normalized = {};

    if (Array.isArray(data)) {
      data.forEach(place => {
        if (place && place.id) {
          normalized[place.id] = place;
        }
      });
      return normalized;
    }

    if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        if (!value) return;
        const id = (value && value.id) ? value.id : key;
        if (!id) return;
        normalized[id] = { ...value, id };
      });
    }

    return normalized;
  },

  applyFirebaseKoolinaIds(data) {
    const customIds = Array.isArray(data) ? data.filter(Boolean) : [];
    this.koolinaIds = [...this.defaultKoolinaIds, ...customIds];
    this.render();
    this.updateMarkers();
  }
};
