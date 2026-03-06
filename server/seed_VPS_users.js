import { initDatabase, runSql } from './db.js';
import bcrypt from 'bcryptjs';

async function main() {
    await initDatabase();

    console.log("Seeding specific users for VPS...");

    // Verificator
    const vPassword = bcrypt.hashSync('P@ssw0rd', 10);
    try {
        runSql('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Diaz Parmy', 'diazparmy@mail.unnes.ac.id', vPassword, 'verificator']);
        console.log("✅ Verificator user 'diazparmy@mail.unnes.ac.id' added successfully.");
    } catch (e) {
        console.log("⚠️ Verificator user might already exist. Original error:", e.message);
    }

    // Supervisor
    const sPassword = bcrypt.hashSync('HermawanPamot1965', 10);
    try {
        runSql('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Hermawan Pamot', 'hermawan_pamot@mail.unnes.ac.id', sPassword, 'supervisor']);
        console.log("✅ Supervisor user 'hermawan_pamot@mail.unnes.ac.id' added successfully.");
    } catch (e) {
        console.log("⚠️ Supervisor user might already exist. Original error:", e.message);
    }
}

main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
