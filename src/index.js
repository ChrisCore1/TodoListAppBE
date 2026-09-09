import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

const startServer = async () => {

    app.listen(PORT, () => {
        console.log(`Iniciando servidor en http://localhost:${PORT}`);
    });
}

startServer();
