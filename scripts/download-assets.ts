
const fs = require('fs');
const path = require('path');
const https = require('https');

const ASSETS = [
    { name: 'ammo-primary.svg', url: 'https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/ammo-primary.svg' },
    { name: 'ammo-special.svg', url: 'https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/ammo-special.svg' },
    { name: 'ammo-heavy.svg', url: 'https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/ammo-heavy.svg' },
    { name: 'breaker-barrier.svg', url: 'https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/breaker_barrier.svg' },
    { name: 'breaker-overload.svg', url: 'https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/breaker_overload.svg' },
    { name: 'breaker-unstoppable.svg', url: 'https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/breaker_unstoppable.svg' }
];

const targetDir = path.join(process.cwd(), 'src', 'components', 'assets');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

ASSETS.forEach(asset => {
    const file = fs.createWriteStream(path.join(targetDir, asset.name));
    https.get(asset.url, function (response) {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${asset.name}`);
        });
    }).on('error', (err) => {
        fs.unlink(asset.name);
        console.error(`Error downloading ${asset.name}: ${err.message}`);
    });
});
