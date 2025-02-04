const fs = require('fs');
const csv = require('csv-parser');
const Database = require('better-sqlite3');
const dbFile = 'oda_korea_dataset.db';

// DB initialize
const initializeDatabase = () => {
    const db = new Database(dbFile);

    // create table
    db.prepare(`CREATE TABLE IF NOT EXISTS oda_data (
        project_number TEXT,
        year INTEGER,
        donor_name TEXT,
        agency_name TEXT,
        crs_id TEXT,
        recipient_name TEXT,
        channel_code INTEGER,
        nature_of_submission TEXT,
        bi_multi TEXT,
        finance_t TEXT,
        aid_t TEXT,
        flow_code TEXT,
        project_title TEXT,
        purpose_code INTEGER,
        sdg_focus TEXT,
        expected_start_date TEXT,
        completion_date TEXT,
        gender INTEGER,
        environment INTEGER,
        dig INTEGER,
        trade INTEGER,
        rmnch INTEGER,
        drr INTEGER,
        disability INTEGER,
        nutrition INTEGER,
        ftc INTEGER,
        pba INTEGER,
        investment_project INTEGER,
        project_type_intervention INTEGER,
        blended_finance_type INTEGER,
        biodiversity INTEGER,
        climate_mitigation INTEGER,
        climate_adaptation INTEGER,
        desertification INTEGER,
        usd_commitment REAL,
        usd_disbursement REAL,
        usd_received REAL,
        usd_adjustment REAL,
        usd_grant_equiv REAL,
        usd_amount_untied REAL,
        usd_amount_partial_tied REAL,
        usd_amount_tied REAL,
        usd_irtc REAL,
        usd_export_credit REAL,
        commitment_date TEXT,
        type_repayment TEXT,
        number_repayment INTEGER,
        interest1 REAL,
        repaydate1 TEXT,
        repaydate2 TEXT,
        usd_interest REAL,
        usd_outstanding REAL,
        usd_arrears_principal REAL,
        usd_arrears_interest REAL,
        usd_outstanding_next_year REAL,
        usd_interest_next_year REAL,
        recipient_code INTEGER,
        nature_of_submission_disbursement TEXT
    )`).run();

    // prepared statement for inserting CSV data
    const insertStmt = db.prepare(`INSERT INTO oda_data VALUES (${Array(58).fill('?').join(', ')})`);

    // insert data using transaction
    const insertMany = db.transaction((rows) => {
        for (const row of rows) {
            insertStmt.run(Object.values(row));
        }
    });

    // read CSV file and insert data
    const rows = [];
    fs.createReadStream('server/models/oda_korea_dataset.csv')
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => {
            try {
                insertMany(rows);
                console.log('CSV file processing completed.');
                db.close();
            } catch (err) {
                console.error('Error inserting data:', err);
                db.close();
            }
        });
};

// initialize DB if file does not exist
if (!fs.existsSync(dbFile)) {
    initializeDatabase();
}

module.exports = {
    initializeDatabase
};
