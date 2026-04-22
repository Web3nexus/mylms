import fs from 'fs';

const content = fs.readFileSync('web/frontend/src/pages/admissions/AdmissionWizard.tsx', 'utf8');
const lines = content.split('\n');

let depth = 0;
lines.forEach((line, index) => {
    const openingMatches = line.match(/<div/g) || [];
    const closingMatches = line.match(/<\/div/g) || [];
    const selfClosing = line.match(/<div[^>]*\/>/g) || [];
    
    const opening = openingMatches.length - selfClosing.length;
    const closing = closingMatches.length;

    const prevDepth = depth;
    depth += (opening - closing);
    
    if (depth !== prevDepth) {
        console.log(`L${index + 1}: Depth ${depth} (Was ${prevDepth}) - ${line.trim().substring(0, 80)}`);
    }
});
