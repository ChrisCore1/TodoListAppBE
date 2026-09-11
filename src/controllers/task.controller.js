import crypto from 'crypto';
import { pool } from '../db/connection.js';
import { taskDecorator, tasksListDecorator } from '../decorators/task.decorator.js';
import { isValidUUID } from '../utils/validatorUUID.js';
import { normalizedTags } from '../utils/normalizedTags.js';

const getTaskQuery = `
    SELECT 
        tasks.*, 
        categories.name AS category_name,
        GROUP_CONCAT(tags.name) AS tags
    FROM tasks
    LEFT JOIN categories ON tasks.category_id = categories.id
    LEFT JOIN tags_tasks ON tasks.id = tags_tasks.task_id
    LEFT JOIN tags ON tags_tasks.tag_id = tags.id
    WHERE tasks.id = ? AND tasks.user_id = ?
    GROUP BY tasks.id
`;

export const store = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { title, description, category_id, tags } = req.body;
        const user_id = req.user.id;

        if (!title || !category_id || !user_id) {
            return res.status(400).json({ error: 'Titulo, categoria y usuario son necesarios' });
        }

        if (!isValidUUID(user_id) || !isValidUUID(category_id)) {
            return res.status(400).json({ error: 'IDs invalidos' });
        }

        const taskId = crypto.randomUUID();
        
        await connection.beginTransaction();

        const insertTaskQuery = `
            INSERT INTO tasks (id, title, description, category_id, user_id) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await connection.query(insertTaskQuery, [taskId, title, description || '', category_id, user_id]);

        const tagsNormalized = normalizedTags(tags);

        if (tagsNormalized.length > 0) {
            const insertTagsQuery = 'INSERT INTO tags_tasks (tag_id, task_id) VALUES (?, ?)';
            for (const tagId of tagsNormalized) {
                if (isValidUUID(tagId)) {
                    await connection.query(insertTagsQuery, [tagId, taskId]);
                }
            }
        }

        const [newTask] = await connection.query(getTaskQuery, [taskId, user_id]);

        await connection.commit();

        res.status(201).json({ 
            data: taskDecorator(newTask[0])
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al crear la tarea' });
    } finally {
        connection.release();
    }
};

export const index = async (req, res) => {
    try {
        const user_id = req.user.id;

        if (!user_id || !isValidUUID(user_id)) {
            return res.status(400).json({ error: 'user_id es requerido y válido' });
        }

        const query = `
            SELECT 
                tasks.*, 
                categories.name AS category_name,
                GROUP_CONCAT(tags.name) AS tags
            FROM tasks
            LEFT JOIN categories ON tasks.category_id = categories.id
            LEFT JOIN tags_tasks ON tasks.id = tags_tasks.task_id
            LEFT JOIN tags ON tags_tasks.tag_id = tags.id
            WHERE tasks.user_id = ?
            GROUP BY tasks.id
        `;

        const [rows] = await pool.query(query, [user_id]);

        res.status(200).json({ 
            data: tasksListDecorator(rows) 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las tareas' });
    }
};

export const show = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        if (!user_id || !isValidUUID(user_id) || !isValidUUID(id)) {
            return res.status(400).json({ error: 'IDs invalidos o incompletos' });
        }

        const [rows] = await pool.query(getTaskQuery, [id, user_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada o sin permisos' });
        }

        res.status(200).json({ 
            data: taskDecorator(rows[0]) 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la tarea' });
    }
};

export const update = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { title, description, status, category_id, tags } = req.body;
        const user_id = req.user.id;

        if (!user_id || !isValidUUID(user_id) || !isValidUUID(id)) {
            return res.status(400).json({ error: 'IDs invalidos' });
        }

        await connection.beginTransaction();

        const updateQuery = `
            UPDATE tasks 
            SET title = COALESCE(?, title), 
                description = COALESCE(?, description), 
                status = COALESCE(?, status), 
                category_id = COALESCE(?, category_id)
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await connection.query(updateQuery, [title, description, status, category_id, id, user_id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Tarea no encontrada o sin permisos' });
        }

        const tagsNormalized = normalizedTags(tags);

        if (tagsNormalized.length >= 0) {
            await connection.query('DELETE FROM tags_tasks WHERE task_id = ?', [id]);

            if(tagsNormalized.length > 0){
                const insertTagsQuery = 'INSERT INTO tags_tasks (tag_id, task_id) VALUES (?, ?)';
                for (const tagId of tagsNormalized) {
                    if (isValidUUID(tagId)) {
                        await connection.query(insertTagsQuery, [tagId, id]);
                    }
                }
            }
        }

        const [dataTask] = await connection.query(getTaskQuery, [id, user_id]);

        await connection.commit();

        res.status(200).json({ 
            message: 'Tarea actualizada correctamente',
            data: taskDecorator(dataTask[0])
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Error al actualizar la tarea' });
    } finally {
        connection.release();
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        if (!user_id || !isValidUUID(user_id) || !isValidUUID(id)) {
            return res.status(400).json({ error: 'IDs inválidos' });
        }

        const [dataTask] = await pool.query(getTaskQuery, [id, user_id]);

        const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada o sin permisos' });
        }

        res.status(200).json({ 
            message: 'Tarea eliminada correctamente',
            data: taskDecorator(dataTask[0])
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
};
