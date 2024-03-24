require('dotenv').config();
const {
    csvToJson,
    insertUsers,
    printAgeDistribution,
} = require('../utils/helpers');

class AgeDistribution {
    static getAgeDistribution = async (req, res) => {
        console.log('Controller: getAgeDistribution')
        try {
            const csvFilePath = process.env.CSV_FILE_PATH;
            const usersJson = csvToJson(csvFilePath);
            await insertUsers(usersJson);
            const result = await printAgeDistribution();

            return res.status(200).json({ data: result });
        } catch (error) {
            return res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = AgeDistribution