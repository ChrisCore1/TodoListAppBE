import express from 'express';
import dotenv from 'dotenv';
import { dbConnection } from './db/connection.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

const startServer = async () => {
    
    await dbConnection();

    app.listen(PORT, () => {
        console.log(`Iniciando servidor en http://localhost:${PORT}`);
    });
}

startServer();
