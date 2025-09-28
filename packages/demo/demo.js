// Demo file showcasing Baseline Vanguard auto-fixes
import moment from 'moment'; // Will suggest native Intl API

const userPrefs = { theme: "dark", notifications: true };
const items = [1, 2, 3, 4, 5];

// FEATURE #1: Array.prototype.at() - will be auto-fixed to bracket notation
const lastItem = items.at(-1);
const secondToLast = userPrefs.at(-2);

// FEATURE #2: hasOwnProperty - will be auto-fixed to Object.hasOwn()
if (userPrefs.hasOwnProperty("theme")) {
  console.log("Has theme");
}

if (items.hasOwnProperty("length")) {
  console.log("Has length property");
}

// FEATURE #3: Heavy library usage - will suggest native alternatives
const now = moment().format('YYYY-MM-DD');
console.log("Formatted date:", now);
