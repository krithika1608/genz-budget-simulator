export const BUDGET = 10000, DAYS = 30, BASE = 130, PRIOR = 5, SUR = 8, SAVE_KEY = 'thirty-v3';
export const CATS = {
  food: { label: 'Food', icon: '🍜', color: '#ff8a3d' },
  transport: { label: 'Transport', icon: '🛺', color: '#2fb8ff' },
  fun: { label: 'Going out', icon: '🎉', color: '#ff5fa8' },
  shopping: { label: 'Shopping', icon: '🛍️', color: '#a06bff' },
  study: { label: 'Study', icon: '📚', color: '#2fd08b' },
  health: { label: 'Health', icon: '💊', color: '#ff5d6c' },
  other: { label: 'Other', icon: '✨', color: '#9aa0b4' }
};
export const PALETTES = [{ id: 'lagoon', name: 'Lagoon', sw: 'linear-gradient(135deg,#0a7f70,#ff7a59)' }, { id: 'violet', name: 'Violet', sw: 'linear-gradient(135deg,#5b3df5,#ff6fb5)' }, { id: 'sunset', name: 'Sunset', sw: 'linear-gradient(135deg,#cf4312,#c2307f)' }];
export const QUICK = [
  { n: 'Chai', a: 30, c: 'food', i: '☕' }, { n: 'Lunch', a: 120, c: 'food', i: '🍛' }, { n: 'Auto ride', a: 60, c: 'transport', i: '🛺' },
  { n: 'Boba', a: 220, c: 'fun', i: '🧋' }, { n: 'Movie', a: 300, c: 'fun', i: '🎬' }, { n: 'Groceries', a: 250, c: 'food', i: '🛒' }
];
export const EVENTS = [
  { id: 'screen', title: 'Your phone screen cracked', icon: '📱', amount: 1200, text: 'It slipped off the bed. A repair shop quotes ₹1,200.' },
  { id: 'bday', title: 'Best friend’s birthday', icon: '🎂', amount: 450, text: 'Everyone is chipping in for a surprise dinner.' },
  { id: 'fever', title: 'Fever and a clinic visit', icon: '🤒', amount: 520, text: 'Doctor, tests and medicines add up fast.' },
  { id: 'charger', title: 'Laptop charger died', icon: '🔌', amount: 650, text: 'You need it for tomorrow’s assignment.' },
  { id: 'cab', title: 'Last metro missed', icon: '🚕', amount: 340, text: 'A late-night cab is the only way home.' },
  { id: 'fine', title: 'Library fine and ID reprint', icon: '🪪', amount: 300, text: 'Lost ID card, overdue books. Ouch.' }
];
export const SIM_TYPES = [
  { id: 'purchase', label: 'Buy something', icon: '🛍️' }, { id: 'subscribe', label: 'Start a subscription', icon: '📺' },
  { id: 'cancel', label: 'Cancel a subscription', icon: '✂️' }, { id: 'save', label: 'Save to a goal', icon: '🎯' }, { id: 'income', label: 'Earn money', icon: '💸' }
];
export const SIM_PRESETS = {
  purchase: [{ name: 'Late-night Swiggy', amount: 350, cat: 'food' }, { name: 'Concert ticket', amount: 1500, cat: 'fun', day: 14 }, { name: 'Sneakers', amount: 3999, cat: 'shopping', emi: true }, { name: 'Textbook', amount: 450, cat: 'study' }],
  subscribe: [{ name: 'Gym membership', amount: 499 }, { name: 'Hotstar', amount: 149 }, { name: 'AI study tool', amount: 1650 }],
  income: [{ name: 'Freelance gig', amount: 1200 }, { name: 'Sold old phone', amount: 3000 }, { name: 'Pocket money top-up', amount: 500 }]
};
