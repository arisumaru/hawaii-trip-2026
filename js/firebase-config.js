// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDH21R1Dlv5_RwPFaIH3f7A8-YaNh0eLnU",
  authDomain: "hawaii-trip-2026.firebaseapp.com",
  databaseURL: "https://hawaii-trip-2026-default-rtdb.firebaseio.com",
  projectId: "hawaii-trip-2026",
  storageBucket: "hawaii-trip-2026.firebasestorage.app",
  messagingSenderId: "1033085083233",
  appId: "1:1033085083233:web:07fbcbf94323e07da39420"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Firebase ユーティリティ
const FirebaseDB = {
  // データを保存
  async save(path, data) {
    try {
      await db.ref(path).set(data);
      return true;
    } catch (error) {
      console.error('Firebase save error:', error);
      return false;
    }
  },

  // データを取得
  async get(path) {
    try {
      const snapshot = await db.ref(path).once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Firebase get error:', error);
      return null;
    }
  },

  // リアルタイムリスナーを設定
  onValue(path, callback) {
    db.ref(path).on('value', (snapshot) => {
      callback(snapshot.val());
    });
  },

  // リスナーを解除
  off(path) {
    db.ref(path).off();
  }
};
