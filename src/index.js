import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import tagRoutes from './routes/tag.routes.js';
import taskRoutes from './routes/task.routes.js';
import { verifyToken } from './middlewares/auth.middleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);

app.use('/api/categories', verifyToken, categoryRoutes);
app.use('/api/tags', verifyToken, tagRoutes);
app.use('/api/tasks', verifyToken, taskRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

const startServer = async () => {

    app.listen(PORT, () => {
        console.log(`Iniciando servidor en http://localhost:${PORT}`);
    });
}

startServer();
