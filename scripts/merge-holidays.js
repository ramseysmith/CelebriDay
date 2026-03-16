const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../src/data");
const outFile = path.join(dataDir, "holidays.json");

const months = ["01","02","03","04","05","06","07","08","09","10","11","12"];
let combined = [];

for (const m of months) {
  const file = path.join(dataDir, `holidays_${m}.json`);
  if (!fs.existsSync(file)) {
    console.error(`MISSING: holidays_${m}.json`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  combined = combined.concat(data);
}

combined.sort((a, b) => a.month !== b.month ? a.month - b.month : a.day - b.day);

fs.writeFileSync(outFile, JSON.stringify(combined, null, 2));
console.log(`Written ${combined.length} days to holidays.json`);

// Verify coverage
const days = new Set(combined.map(d => `${d.month}-${d.day}`));
console.log(`Total unique days: ${days.size}`);

let missing = [];
for (let m = 1; m <= 12; m++) {
  // Use non-leap year (2023) so Feb has 28 days
  const daysInMonth = new Date(2023, m, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    if (!days.has(`${m}-${d}`)) missing.push(`${m}/${d}`);
  }
}

if (missing.length > 0) {
  console.error("MISSING DAYS:", missing.join(", "));
} else {
  console.log("All 365 days covered!");
}

// Check for dashes
let dashCount = 0;
for (const entry of combined) {
  for (const h of entry.holidays) {
    for (const [key, val] of Object.entries(h)) {
      if (typeof val === "string" && val.includes("-")) {
        dashCount++;
        console.warn(`DASH FOUND in ${entry.month}/${entry.day} "${h.name}" field "${key}": ${val}`);
      }
    }
  }
}
if (dashCount === 0) console.log("No dashes found in any text fields.");
