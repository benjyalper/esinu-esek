/**
 * Client-side board data (mirrors data/board.js for frontend use)
 */

export const BOARD_TILES = [
  { id:0,  type:'go',             name:'התחלה',                 emoji:'🏁', bonus:200 },
  { id:1,  type:'property',       name:'ביקיני בוטום',           emoji:'🐠', group:'brown',     price:60,  rent:[2,10,30,90,160,250],    housePrice:50,  mortgage:30 },
  { id:2,  type:'community_chest',name:'קלף אוצר',              emoji:'📦' },
  { id:3,  type:'property',       name:'מסעדת הסרטן הפריך',     emoji:'🦀', group:'brown',     price:60,  rent:[4,20,60,180,320,450],   housePrice:50,  mortgage:30 },
  { id:4,  type:'tax',            name:'מס ביקיני',             emoji:'💸', amount:200 },
  { id:5,  type:'railroad',       name:'בית הספר לשיט',         emoji:'🚢', price:200, rent:[25,50,100,200], mortgage:100 },
  { id:6,  type:'property',       name:'כפית הדלי',             emoji:'🪣', group:'light_blue', price:100, rent:[6,30,90,270,400,550],   housePrice:50,  mortgage:50 },
  { id:7,  type:'chance',         name:'קלף הזדמנות',           emoji:'❓' },
  { id:8,  type:'property',       name:'לגונת הצדפות',          emoji:'🐚', group:'light_blue', price:100, rent:[6,30,90,270,400,550],   housePrice:50,  mortgage:50 },
  { id:9,  type:'property',       name:'שדות המדוזות',          emoji:'🪼', group:'light_blue', price:120, rent:[8,40,100,300,450,600],  housePrice:50,  mortgage:60 },
  { id:10, type:'jail',           name:'כלא / סתם ביקור',       emoji:'🏛️' },
  { id:11, type:'property',       name:'רחוב Steal a Brainrot', emoji:'🧠', group:'pink',       price:140, rent:[10,50,150,450,625,750], housePrice:100, mortgage:70 },
  { id:12, type:'utility',        name:'חברת האנרגיה',          emoji:'⚡', price:150, mortgage:75 },
  { id:13, type:'property',       name:'כיכר Obby',             emoji:'🏃', group:'pink',       price:140, rent:[10,50,150,450,625,750], housePrice:100, mortgage:70 },
  { id:14, type:'property',       name:'שדרת Brookhaven',       emoji:'🏡', group:'pink',       price:160, rent:[12,60,180,500,700,900], housePrice:100, mortgage:80 },
  { id:15, type:'railroad',       name:'תחנת Roblox',           emoji:'🚂', price:200, rent:[25,50,100,200], mortgage:100 },
  { id:16, type:'property',       name:'סמטת Adopt Me',         emoji:'🐶', group:'orange',     price:180, rent:[14,70,200,550,750,950], housePrice:100, mortgage:90 },
  { id:17, type:'community_chest',name:'קלף אוצר',              emoji:'📦' },
  { id:18, type:'property',       name:'אזור Tower Defense',    emoji:'🗼', group:'orange',     price:180, rent:[14,70,200,550,750,950], housePrice:100, mortgage:90 },
  { id:19, type:'property',       name:'רחוב Doors',            emoji:'🚪', group:'orange',     price:200, rent:[16,80,220,600,800,1000],housePrice:100, mortgage:100 },
  { id:20, type:'free_parking',   name:'חניה חופשית',           emoji:'🅿️' },
  { id:21, type:'property',       name:"רחוב Gem Grab",         emoji:'💎', group:'red',        price:220, rent:[18,90,250,700,875,1050],housePrice:150, mortgage:110 },
  { id:22, type:'chance',         name:'קלף הזדמנות',           emoji:'❓' },
  { id:23, type:'property',       name:'שדרת Showdown',         emoji:'💥', group:'red',        price:220, rent:[18,90,250,700,875,1050],housePrice:150, mortgage:110 },
  { id:24, type:'property',       name:'אזור Brawl Ball',       emoji:'⚽', group:'red',        price:240, rent:[20,100,300,750,925,1100],housePrice:150,mortgage:120 },
  { id:25, type:'railroad',       name:'תחנת Brawl Stars',      emoji:'⭐', price:200, rent:[25,50,100,200], mortgage:100 },
  { id:26, type:'property',       name:'כיכר Heist',            emoji:'🏦', group:'yellow',     price:260, rent:[22,110,330,800,975,1150],housePrice:150,mortgage:130 },
  { id:27, type:'utility',        name:'חברת המים',             emoji:'💧', price:150, mortgage:75 },
  { id:28, type:'community_chest',name:'קלף אוצר',              emoji:'📦' },
  { id:29, type:'property',       name:'תחנת Starr Drop',       emoji:'🌟', group:'yellow',     price:260, rent:[22,110,330,800,975,1150],housePrice:150,mortgage:130 },
  { id:30, type:'go_to_jail',     name:'לך לכלא!',              emoji:'👮' },
  { id:31, type:'property',       name:'מכרות יהלומים',         emoji:'⛏️', group:'green',      price:300, rent:[26,130,390,900,1100,1275],housePrice:200,mortgage:150 },
  { id:32, type:'property',       name:'שדרת Redstone',         emoji:'🔴', group:'green',      price:300, rent:[26,130,390,900,1100,1275],housePrice:200,mortgage:150 },
  { id:33, type:'chance',         name:'קלף הזדמנות',           emoji:'❓' },
  { id:34, type:'property',       name:'מבצר הנדר',             emoji:'🏰', group:'green',      price:320, rent:[28,150,450,1000,1200,1400],housePrice:200,mortgage:160 },
  { id:35, type:'railroad',       name:'תחנת Minecraft',        emoji:'🚃', price:200, rent:[25,50,100,200], mortgage:100 },
  { id:36, type:'community_chest',name:'קלף אוצר',              emoji:'📦' },
  { id:37, type:'property',       name:'סטאר פארק',             emoji:'🎡', group:'dark_blue',  price:350, rent:[35,175,500,1100,1300,1500],housePrice:200,mortgage:175 },
  { id:38, type:'tax',            name:'מס יוקרה',              emoji:'💰', amount:100 },
  { id:39, type:'property',       name:'הבית של בובספוג',       emoji:'🧽', group:'dark_blue',  price:400, rent:[50,200,600,1400,1700,2000],housePrice:200,mortgage:200 },
];

export const PROPERTY_GROUPS = {
  brown:     { name:'ביקיני בוטום קלאסיקות', color:'#8B4513', textColor:'#fff',  count:2 },
  light_blue:{ name:'עולם הים הפתוח',        color:'#87CEEB', textColor:'#000',  count:3 },
  pink:      { name:'רובלוקס שכונות',          color:'#FF69B4', textColor:'#fff',  count:3 },
  orange:    { name:'עולמות Roblox',            color:'#FF8C00', textColor:'#fff',  count:3 },
  red:       { name:'בראול סטארס אזורים',     color:'#DC143C', textColor:'#fff',  count:3 },
  yellow:    { name:'אזורי Brawl Premium',     color:'#FFD700', textColor:'#000',  count:3 },
  green:     { name:'מיינקראפט עולמות',        color:'#228B22', textColor:'#fff',  count:3 },
  dark_blue: { name:'אתרי יוקרה',              color:'#00008B', textColor:'#fff',  count:2 },
};

// Board layout: for each cell in the 11x11 grid, which tile id goes there
// Grid position [row][col] -> tile id
// Row 0 = top, Row 10 = bottom; Col 0 = right (RTL), Col 10 = left
export function getBoardLayout() {
  // RTL Hebrew layout: dir="rtl" reverses grid columns (col 0 = visual RIGHT, col 10 = visual LEFT)
  // Counterclockwise path: GO (bottom-left) → up left side → right along top → down right side → left along bottom
  //
  // col 0..10 in data = visual RIGHT..LEFT on screen
  //
  // topRow    col 0=FP(top-right),  col 10=Jail(top-left)
  // bottomRow col 0=GTJ(btm-right), col 10=GO(btm-left)
  // col10     rows 1-9: tiles 9→1  (left column going down in data = visually going UP toward Jail)
  // col0      rows 1-9: tiles 21→29 (right column going down = visually going DOWN toward GTJ)

  const topRow    = [20,19,18,17,16,15,14,13,12,11,10]; // col 0→10: FP→Jail
  const bottomRow = [30,31,32,33,34,35,36,37,38,39, 0]; // col 0→10: GTJ→GO
  const col10     = [ 9, 8, 7, 6, 5, 4, 3, 2, 1];      // rows 1-9: near-Jail → near-GO
  const col0      = [21,22,23,24,25,26,27,28,29];       // rows 1-9: near-FP  → near-GTJ

  const grid = Array.from({ length: 11 }, () => Array(11).fill(null));

  topRow.forEach((tileId, col) => { grid[0][col]      = tileId; });
  bottomRow.forEach((tileId, col) => { grid[10][col]  = tileId; });
  col10.forEach((tileId, i) => { grid[i + 1][10]      = tileId; });
  col0.forEach((tileId, i) => { grid[i + 1][0]        = tileId; });

  return grid;
}
