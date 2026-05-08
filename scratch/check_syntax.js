const fs = require('fs');
const content = fs.readFileSync('dashboard/src/app/dashboard/settings/page.tsx', 'utf8');

const stacks = {
    '{': [],
    '(': [],
    '[': []
};

const pairs = {
    '}': '{',
    ')': '(',
    ']': '['
};

let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        if (char === '{' || char === '(' || char === '[') {
            stacks[char].push(i + 1);
        } else if (char === '}' || char === ')' || char === ']') {
            let pair = pairs[char];
            if (stacks[pair].length === 0) {
                console.log(`Extra ${char} at line ${i + 1}`);
            } else {
                stacks[pair].pop();
            }
        }
    }
}

for (let char in stacks) {
    if (stacks[char].length > 0) {
        console.log(`Unclosed ${char} from lines: ${stacks[char].join(', ')}`);
    }
}
