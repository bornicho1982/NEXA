
const fs = require('fs');
const path = require('path');

const target = path.join(process.cwd(), '.next');

try {
    if (fs.existsSync(target)) {
        console.log(`Attempting to remove ${target}...`);
        fs.rmSync(target, { recursive: true, force: true });
        console.log('Successfully deleted .next directory.');
    } else {
        console.log('.next directory does not exist.');
    }
} catch (e) {
    console.error(`Failed to delete .next directory: ${e.message}`);
    process.exit(1);
}
