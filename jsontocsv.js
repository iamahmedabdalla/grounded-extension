import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';

const jsonFilePath = path.join('tests', 'AnalysedEmails.json');

function convertJSONToCSV(jsonData) {
    const headers = Object.keys(jsonData[0]);
    
    const csvString = stringify(jsonData, {
        header: true,
        columns: headers
    });

    return csvString;
}


try {
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(jsonContent);

    const csvData = convertJSONToCSV(jsonData);
    const csvFilePath = path.join('tests', 'AnalysedEmails.csv');
    fs.writeFileSync(csvFilePath, csvData, 'utf8');

    console.log('JSON file has been converted to CSV and saved as', csvFilePath);
} catch (error) {
    console.error('Error converting JSON to CSV:', error);
}