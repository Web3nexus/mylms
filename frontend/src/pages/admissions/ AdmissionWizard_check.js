import fs from 'fs';

const content = fs.readFileSync('web/frontend/src/pages/admissions/AdmissionWizard.tsx', 'utf8');
const lines = content.split('\n');

let openTags = 0;
let closeTags = 0;

lines.forEach((line, index) => {
    const openingMatches = line.match(/<div/g);
    const closingMatches = line.match(/<\/div/g);
    
    if (openingMatches) {
        openTags += openingMatches.length;
    }
    if (closingMatches) {
        closeTags += closingMatches.length;
    }
    
    if (openTags !== closeTags) {
        // console.log(`Line ${index + 1}: Open=${openTags}, Close=${closeTags} (Diff=${openTags - closeTags}) - ${line.trim().substring(0, 50)}`);
    }
});

console.log(`Total Open Divs: ${openTags}`);
console.log(`Total Close Divs: ${closeTags}`);

// Identify the specific areas where the imbalance grows
let balance = 0;
lines.forEach((line, index) => {
    const openingMatches = line.match(/<div/g);
    const closingMatches = line.match(/<\/div/g);
    
    const prevBalance = balance;
    if (openingMatches) balance += openingMatches.length;
    if (closingMatches) balance -= closingMatches.length;
    
    if (balance !== prevBalance) {
      console.log(`Line ${index + 1}: Balance ${balance} (Was ${prevBalance}) - ${line.trim().substring(0, 80)}`);
    }
});
