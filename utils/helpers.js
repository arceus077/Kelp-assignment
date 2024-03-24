require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false // This might be necessary if your PostgreSQL provider uses self-signed certificates
    }
});

const csvToJson = (filePath) => {
    console.log('Method: csvToJson', { filePath });
    const csvData = fs.readFileSync(filePath, 'utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(','); // Headers will always be present in first line
    const jsonResult = [];

    for (let i = 1; i < lines.length; i++) {
        const singleObj = {};
        const currentline = lines[i].split(','); // current line in csv to process

        headers.forEach((value, headerIndex) => {
            // Split the header on the dot to handle nested properties
            const headerParts = value.trim().split('.');
            // Pass the reference of our object to modify all sub-levels (nested objects) as we iterate over them based on depth
            let currentObj = singleObj;

            // Iterate over the parts to handle nesting
            headerParts.forEach((part, index) => {
                // If we're at the last part (Object Property), assign the value
                if (index === headerParts.length - 1) {
                    currentObj[part] = currentline[headerIndex].trim(); // Trim to remove any leading/trailing whitespace
                } else {
                    // If the next level doesn't exist, create it
                    if (!currentObj[part]) currentObj[part] = {};
                    // Move our reference down to the next level
                    currentObj = currentObj[part];
                }
            });
        });

        jsonResult.push(singleObj);
    }

    return jsonResult;
}

async function printAgeDistribution() {
    console.log('Method: printAgeDistribution');
    try {
        const tableData = [
            { 'Age-Group': "< 20", '% Distribution': 0 },
            { 'Age-Group': "20 to 40", '% Distribution': 0 },
            { 'Age-Group': "40 to 60", '% Distribution': 0 },
            { 'Age-Group': "> 60", '% Distribution': 0 },
        ];
        const results = [];
        const response = await getAgeDistributedUsers();
        console.log('Age Distribution successfully fetched for DB');

        // console.log('Age-Group | % Distribution');
        response?.rows.forEach(row => {
            results.push({ "ageGroup": row.age_group, "count": +row.percentage.toFixed(2) });
            // console.log(`${row.age_group} | ${row.percentage.toFixed(2)}%`);
        });

        // Finds the correct table value for every age group and assigns corresponding value
        tableData.forEach((tableValue) => {
            const ageGroupKey = tableValue['Age-Group'];
            const singleAgeGroup = results.find((val) => val.ageGroup === ageGroupKey);
            if (singleAgeGroup) tableValue['% Distribution'] = singleAgeGroup.count;
        })

        console.log('Table Data - ');
        // Displays all data in tabular format as required
        console.table(tableData, ['Age-Group', '% Distribution']);
        return tableData;
    } catch (error) {
        console.error('Error in printing age distribution', error);
        throw error;
    }
}

const insertUsers = async (users) => {
    console.log('Method: insertUsers');
    const client = await pool.connect();
    const queryText = 'INSERT INTO users(name, age, address, additional_info) VALUES($1, $2, $3, $4)';
    try {
        // We are using transaction based query for failsafe operations
        await client.query('BEGIN');
        // Truncate Old Date for new entries
        await client.query('TRUNCATE users');
        for (const user of users) {
            const { name, age, address, ...additionalInfo } = user;
            const fullName = `${name.firstName} ${name.lastName}`;
            const additionalInfoForDb = Object.keys(additionalInfo).length === 0 ? null : JSON.stringify(additionalInfo);
            const addressForDb = Object.keys(address).length === 0 ? null : JSON.stringify(address);

            await client.query(queryText, [fullName, age, addressForDb, additionalInfoForDb]);
        }
        await client.query('COMMIT');
        console.log('Data inserted for all users');
    } catch (error) {
        console.error('Error in inserting users in Database', error);
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const getAgeDistributedUsers = async () => {
    console.log('Method: getAgeDistributedUsers');
    const client = await pool.connect();
    try {
        // Query to calculate the distribution of 4 age groups
        const query = `
            SELECT
                CASE
                    WHEN age < 20 THEN '< 20'
                    WHEN age BETWEEN 20 AND 40 THEN '20 to 40'
                    WHEN age BETWEEN 40 AND 60 THEN '40 to 60'
                    WHEN age > 60 THEN '> 60'
                END AS age_group,
                COUNT(*)::FLOAT / SUM(COUNT(*)) OVER() * 100 AS percentage
            FROM users
            GROUP BY age_group
            ORDER BY age_group;
        `;

        return client.query(query);
    } catch (error) {
        console.error('Error in fetching users from Database', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    csvToJson,
    insertUsers,
    getAgeDistributedUsers,
    printAgeDistribution,
}