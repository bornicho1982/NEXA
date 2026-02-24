const checkUrll = async (url) => {
    try {
        const res = await fetch(url);
        console.log(`URL: ${url} | Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            console.log(`Found! Keys: ${Object.keys(data).slice(0, 5).join(', ')}`);
        }
    } catch (e) {
        console.log(`URL: ${url} | Error: ${e.message}`);
    }
};

const urls = [
    "https://raw.githubusercontent.com/Database-Clarity/Live-Clarity-Database/master/descriptions.json",
    "https://raw.githubusercontent.com/Database-Clarity/Live-Clarity-Database/main/descriptions.json",
    "https://raw.githubusercontent.com/DestinyItemManager/d2-additional-info/master/data/descriptions.json",
    "https://raw.githubusercontent.com/DestinyItemManager/DIM/master/src/data/d2/descriptions.json",
    "https://raw.githubusercontent.com/database-projects/d2-clarity/master/descriptions.json",
    "https://database-clarity.github.io/Live-Clarity-Database/descriptions.json",
    "https://raw.githubusercontent.com/Database-Clarity/Live-Clarity-Database/main/docs/descriptions.json"
];

const run = async () => {
    for (const u of urls) {
        await checkUrll(u);
    }
}
run();
