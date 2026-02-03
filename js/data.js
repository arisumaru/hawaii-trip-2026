const DATA = {
  trip: {
    title: "ハワイ旅行 2026",
    startDate: "2026-02-26",
    endDate: "2026-03-04",
    destination: {
      name: "ホノルル",
      timezone: "Pacific/Honolulu",
      latitude: 21.3069,
      longitude: -157.8583
    }
  },

  flights: {
    outbound: {
      date: "2026-02-26",
      flightNumber: "NH186",
      airline: "ANA",
      departure: { airport: "HND", time: "21:55", terminal: "2" },
      arrival: { airport: "HNL", time: "09:45", terminal: "2" }
    },
    return: {
      date: "2026-03-04",
      flightNumber: "NH185",
      airline: "ANA",
      departure: { airport: "HNL", time: "12:55", terminal: "2" },
      arrival: { airport: "HND", time: "17:20+1", terminal: "2" }
    }
  },

  schedule: [
    {
      day: 1,
      date: "2026-02-26",
      title: "出発・到着日",
      events: [
        { time: "21:55", title: "羽田空港出発", location: "羽田空港", note: "NH186便" },
        { time: "09:45", title: "ホノルル到着", location: "ダニエル・K・イノウエ国際空港", note: "同日着" },
        { time: "12:00", title: "ホテルチェックイン", location: "ワイキキ", note: "" },
        { time: "14:00", title: "ワイキキビーチ散策", location: "ワイキキビーチ", note: "" }
      ]
    },
    {
      day: 2,
      date: "2026-02-27",
      title: "ダイヤモンドヘッド",
      events: [
        { time: "06:00", title: "ダイヤモンドヘッド登山", location: "ダイヤモンドヘッド", note: "早朝がおすすめ" },
        { time: "10:00", title: "朝食", location: "カフェ・カイラ", note: "パンケーキ" },
        { time: "13:00", title: "アラモアナセンター", location: "アラモアナ", note: "ショッピング" },
        { time: "18:00", title: "サンセットディナー", location: "ワイキキ", note: "" }
      ]
    },
    {
      day: 3,
      date: "2026-02-28",
      title: "ノースショア",
      events: [
        { time: "08:00", title: "ノースショアツアー出発", location: "ワイキキ", note: "ツアーバス" },
        { time: "10:30", title: "ハレイワタウン散策", location: "ハレイワ", note: "ガーリックシュリンプ" },
        { time: "13:00", title: "ウミガメビーチ", location: "ラニアケアビーチ", note: "" },
        { time: "17:00", title: "ワイキキ帰着", location: "ワイキキ", note: "" }
      ]
    },
    {
      day: 4,
      date: "2026-03-01",
      title: "コオリナ",
      events: [
        { time: "09:00", title: "コオリナへ移動", location: "ワイキキ", note: "レンタカー" },
        { time: "11:00", title: "コオリナビーチ", location: "コオリナ", note: "" },
        { time: "14:00", title: "アウラニ見学", location: "アウラニ・ディズニー", note: "" },
        { time: "18:00", title: "ディナー", location: "コオリナ", note: "" }
      ]
    },
    {
      day: 5,
      date: "2026-03-02",
      title: "カイルア",
      events: [
        { time: "09:00", title: "カイルアへ移動", location: "ワイキキ", note: "" },
        { time: "10:30", title: "カイルアビーチ", location: "カイルア", note: "" },
        { time: "13:00", title: "ランチ", location: "カイルアタウン", note: "" },
        { time: "16:00", title: "ワイキキ帰着", location: "ワイキキ", note: "" }
      ]
    },
    {
      day: 6,
      date: "2026-03-03",
      title: "自由行動",
      events: [
        { time: "10:00", title: "ワイキキ散策", location: "ワイキキ", note: "" },
        { time: "12:00", title: "ランチ", location: "ワイキキ", note: "" },
        { time: "14:00", title: "ショッピング", location: "ロイヤルハワイアンセンター", note: "" },
        { time: "19:00", title: "ディナー", location: "ワイキキ", note: "" }
      ]
    },
    {
      day: 7,
      date: "2026-03-04",
      title: "最終日・帰国",
      events: [
        { time: "09:00", title: "ホテルチェックアウト", location: "ワイキキ", note: "" },
        { time: "10:00", title: "空港へ移動", location: "", note: "" },
        { time: "12:55", title: "ホノルル出発", location: "ダニエル・K・イノウエ国際空港", note: "NH185便" },
        { time: "17:20", title: "羽田到着", location: "羽田空港", note: "翌日着" }
      ]
    }
  ],

  budget: {
    total: 500000,
    currency: "JPY",
    categories: [
      { id: "food", name: "食事", color: "#FF6B6B" },
      { id: "transport", name: "交通", color: "#4ECDC4" },
      { id: "activity", name: "アクティビティ", color: "#45B7D1" },
      { id: "shopping", name: "買い物", color: "#96CEB4" },
      { id: "other", name: "その他", color: "#DDA0DD" }
    ]
  },

  checklist: {
    documents: [
      { id: "passport", name: "パスポート", checked: false },
      { id: "ticket", name: "航空券（eチケット）", checked: false },
      { id: "hotel", name: "ホテル予約確認書", checked: false },
      { id: "insurance", name: "海外旅行保険証", checked: false },
      { id: "esta", name: "ESTA承認書", checked: false },
      { id: "wallet", name: "財布・現金", checked: false },
      { id: "creditcard", name: "クレジットカード", checked: false }
    ],
    clothes: [
      { id: "tshirt", name: "Tシャツ (5枚)", checked: false },
      { id: "shorts", name: "短パン (3枚)", checked: false },
      { id: "swimsuit", name: "水着", checked: false },
      { id: "sandals", name: "サンダル", checked: false },
      { id: "sneakers", name: "スニーカー", checked: false },
      { id: "jacket", name: "羽織りもの", checked: false }
    ],
    toiletries: [
      { id: "sunscreen", name: "日焼け止め", checked: false },
      { id: "toothbrush", name: "歯ブラシ・歯磨き粉", checked: false },
      { id: "shampoo", name: "シャンプー・リンス", checked: false },
      { id: "razor", name: "ひげ剃り", checked: false }
    ],
    electronics: [
      { id: "phone", name: "スマートフォン", checked: false },
      { id: "charger", name: "充電器", checked: false },
      { id: "battery", name: "モバイルバッテリー", checked: false },
      { id: "camera", name: "カメラ", checked: false }
    ],
    medicine: [
      { id: "painkiller", name: "頭痛薬", checked: false },
      { id: "stomach", name: "胃腸薬", checked: false },
      { id: "bandaid", name: "絆創膏", checked: false }
    ]
  },

  places: [
    // 宿泊ホテル
    { id: "marriott_koolina", name: "Marriott's Ko Olina Beach Club", category: "🏨 ホテル", lat: 21.3362, lng: -158.1230, url: "https://www.marriott.com/en-us/hotels/hnlko-marriotts-ko-olina-beach-club/overview/" },
    { id: "marriott_waikiki", name: "Waikiki Beach Marriott Resort & Spa", category: "🏨 ホテル", lat: 21.2720, lng: -157.8235, url: "https://www.marriott.com/en-us/hotels/hnlmc-waikiki-beach-marriott-resort-and-spa/overview/" },

    // 観光スポット
    { id: "waikiki", name: "ワイキキビーチ", category: "ビーチ", lat: 21.2766, lng: -157.8278 },
    { id: "diamondhead", name: "ダイヤモンドヘッド", category: "自然", lat: 21.2614, lng: -157.8057 },
    { id: "alamoana", name: "アラモアナセンター", category: "ショッピング", lat: 21.2908, lng: -157.8442 },
    { id: "haleiwa", name: "ハレイワタウン", category: "観光", lat: 21.5934, lng: -158.1031 },

    // コオリナ - 高級レストラン
    { id: "noe", name: "Noe (Four Seasons)", category: "🍽️ 高級", lat: 21.3389, lng: -158.1231, budget: "$100-150/人", url: "https://www.fourseasons.com/oahu/dining/restaurants/noe/" },
    { id: "minas", name: "Mina's Fish House", category: "🍽️ 高級", lat: 21.3389, lng: -158.1231, budget: "$80-150/人", url: "https://www.fourseasons.com/oahu/dining/restaurants/minas_fish_house/" },
    { id: "amaama", name: "AMA AMA (Disney Aulani)", category: "🍽️ 高級", lat: 21.3396, lng: -158.1275, budget: "$130-150/人", url: "https://www.disneyaulani.com/dining/table-service/ama-ama-restaurant/" },
    { id: "roys", name: "Roy's Ko Olina", category: "🍽️ 高級", lat: 21.3342, lng: -158.1189, budget: "$50-80/人", url: "https://www.royyamaguchi.com/roys-ko-olina" },

    // コオリナ - カジュアル
    { id: "monkeypod", name: "Monkeypod Kitchen", category: "🍴 カジュアル", lat: 21.3362, lng: -158.1214, budget: "$30-50/人", url: "https://www.monkeypodkitchen.com/" },
    { id: "longhis", name: "Longhi's Ko Olina", category: "🍴 カジュアル", lat: 21.3378, lng: -158.1253, budget: "$30-50/人", url: "https://www.longhis.com/koolina-restaurant" },
    { id: "mekiko", name: "Mekiko Cantina", category: "🍴 カジュアル", lat: 21.3362, lng: -158.1214, budget: "$25-40/人", url: "https://koolinashops.com/dining/" },

    // コオリナ - テイクアウト
    { id: "eggsnthings_ko", name: "Eggs 'n Things Ko Olina", category: "🥡 テイクアウト", lat: 21.3362, lng: -158.1214, budget: "$15-25/人", url: "https://eggsnthings.com/ko-olina-menu/" },

    // ワイキキ - 高級レストラン
    { id: "michels", name: "Michel's at the Colony Surf", category: "🍽️ 高級", lat: 21.2625, lng: -157.8196, budget: "$130-180/人", url: "https://www.michelshawaii.com/" },
    { id: "arancino", name: "Arancino di Mare", category: "🍽️ 高級", lat: 21.2733, lng: -157.8237, budget: "$50-80/人", url: "https://arancino-dimare.arancino.com/" },

    // ワイキキ - カジュアル
    { id: "tikis", name: "Tiki's Grill & Bar", category: "🍴 カジュアル", lat: 21.2742, lng: -157.8235, budget: "$30-50/人", url: "https://www.tikis.com/" },
    { id: "lulus", name: "Lulu's Waikiki", category: "🍴 カジュアル", lat: 21.2746, lng: -157.8230, budget: "$25-45/人", url: "https://www.luluswaikiki.com/" },
    { id: "cheesecake", name: "Cheesecake Factory", category: "🍴 カジュアル", lat: 21.2782, lng: -157.8295, budget: "$25-40/人", url: "https://www.thecheesecakefactory.com/" },

    // ワイキキ - テイクアウト
    { id: "rainbow", name: "Rainbow Drive-In", category: "🥡 テイクアウト", lat: 21.2708, lng: -157.8139, budget: "$10-15/人", url: "https://www.rainbowdrivein.com/" },
    { id: "marugame", name: "Marugame Udon", category: "🥡 テイクアウト", lat: 21.2796, lng: -157.8266, budget: "$8-15/人", url: "https://www.marugameudon.com/locations/waikiki/" },
    { id: "ono", name: "Ono Seafood", category: "🥡 テイクアウト", lat: 21.2746, lng: -157.8145, budget: "$12-20/人", url: "https://www.yelp.com/biz/ono-seafood-honolulu" },
    { id: "leonards", name: "Leonard's Bakery", category: "🥡 テイクアウト", lat: 21.2757, lng: -157.8128, budget: "$2-10/人", url: "https://leonardshawaii.com/" },
    { id: "steakshack", name: "Steak Shack", category: "🥡 テイクアウト", lat: 21.2839, lng: -157.8369, budget: "$10以下/人", url: "" }
  ],

  emergencyContacts: [
    { name: "緊急通報（警察・救急・消防）", phone: "911", note: "アメリカ共通" },
    { name: "在ホノルル日本国総領事館", phone: "+1-808-543-3111", note: "平日8:00-16:30" },
    { name: "海外旅行保険", phone: "+81-3-1234-5678", note: "24時間対応（要変更）" },
    { name: "JALカスタマーセンター", phone: "+1-800-525-3663", note: "アメリカ国内" },
    { name: "クレジットカード紛失", phone: "+1-303-967-1096", note: "VISA（要確認）" }
  ]
};
