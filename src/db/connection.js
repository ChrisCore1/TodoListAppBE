import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const dbConnection = async () => {
    try {
        const [rows] = await pool.query('SELECT 1');
        console.log('Conexion a la base de datos exitosa', rows[0]);
    } catch (e) {
        console.error('Error al conectar con la base de datos:', e.message);
        process.exit(1); 
    }
};
