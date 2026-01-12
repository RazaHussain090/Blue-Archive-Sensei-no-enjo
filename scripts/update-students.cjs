const fs = require('fs');
const https = require('https');
const path = require('path');

const URL = 'https://schaledb.com/data/en/students.json';
const OUTPUT_PATH = path.join(__dirname, '../public/data/students.json');

console.log(`Fetching student data from ${URL}...`);

https.get(URL, (res) => {
    if (res.statusCode !== 200) {
        console.error(`Failed to fetch data. Status Code: ${res.statusCode}`);
        process.exit(1);
    }

    let data = '';
    res.on('data', chunk => data += chunk);
    
    res.on('end', () => {
        try {
            // Verify it's valid JSON
            const json = JSON.parse(data);
            const count = Object.keys(json).length;
            
            // Transform object to array if needed, but keeping original structure is often better for lookup.
            // For this tool, let's keep it as is, or maybe convert to array for the list? 
            // Let's save the raw data.
            
            fs.writeFileSync(OUTPUT_PATH, JSON.stringify(json, null, 2));
            console.log(`Successfully saved ${count} students to ${OUTPUT_PATH}`);
        } catch (err) {
            console.error('Error parsing or writing JSON:', err);
        }
    });
}).on('error', (err) => {
    console.error('Network error:', err);
});
