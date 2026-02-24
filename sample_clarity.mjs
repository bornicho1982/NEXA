import fs from 'fs';
const run = async () => {
    const res = await fetch("https://database-clarity.github.io/Live-Clarity-Database/descriptions/dim.json");
    const data = await res.json();
    const firstKey = Object.keys(data)[0];
    fs.writeFileSync('clarity_sample.json', JSON.stringify(data[firstKey], null, 2));
    console.log("Written!");
};
run();
