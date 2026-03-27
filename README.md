# עשינו עסק 🎲

משחק לוח מרובה שחקנים בסגנון מונופול, בעולמות SpongeBob · Roblox · Brawl Stars · Minecraft

---

## הרצה מקומית

```bash
cd esinu-esek
npm install
node server.js
```

פתח http://localhost:3006 בדפדפן.

---

## מבנה הפרויקט

```
esinu-esek/
├── server.js              # שרת Express + Socket.IO + Next.js
├── data/
│   ├── board.js           # נתוני הלוח (40 משבצות)
│   └── cards.js           # קלפי הזדמנות + אוצר
├── lib/
│   ├── boardData.js       # נתוני לוח לצד הלקוח
│   └── socketClient.js    # מנהל Socket.IO בצד הלקוח
├── pages/
│   ├── index.js           # דף הבית
│   ├── room.js            # יצירה/הצטרפות לחדר
│   ├── lobby/[id].js      # לובי המתנה
│   └── game/[id].js       # דף המשחק
├── components/
│   ├── Board/
│   │   ├── Board.js       # לוח המשחק
│   │   └── BoardTile.js   # משבצת בודדת
│   ├── Game/
│   │   ├── Dice.js        # קוביות
│   │   ├── ActionPanel.js # פאנל פעולות
│   │   ├── PlayerPanel.js # רשימת שחקנים
│   │   ├── EventLog.js    # יומן אירועים
│   │   ├── PropertyModal.js # חלון נכס
│   │   ├── TradeModal.js  # חלון עסקה
│   │   └── WinnerModal.js # מסך ניצחון
│   └── UI/
│       └── Chat.js        # צ'אט
└── styles/globals.css     # עיצוב גלובלי
```

---

## Deploy ל-Railway

1. דחוף לגיטהאב:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/esinu-esek.git
git push -u origin main
```

2. ב-Railway: New Project → Deploy from GitHub repo → בחר את הרפו
3. הגדרות: Start Command = `npm start`, Build Command = `npm run build`
4. Railway יקצה URL אוטומטית

---

## מאפיינים

- ✅ מולטיפלייר בזמן אמת (Socket.IO)
- ✅ 40 משבצות עם ערכים עבריים
- ✅ קנייה, שכירות, שיפורים (בתים/מלון)
- ✅ משכנתא
- ✅ מערכת קלפים (הזדמנות + אוצר)
- ✅ כלא וכל חוקי הכלא
- ✅ עסקאות בין שחקנים
- ✅ פשיטת רגל ועיצוב ניצחון
- ✅ צ'אט
- ✅ חוקי בית (חניה חופשית, מכירה פומבית, ועוד)
- ✅ ממשק עברי RTL מלא
