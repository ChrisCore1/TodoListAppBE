import crypto from 'crypto';
import { pool } from '../db/connection.js';
import { categoryDecorator, categoriesListDecorator } from '../decorators/category.decorator.js';
import { isValidUUID } from '../utils/validatorUUID.js';
import { getPaginationParams } from '../utils/pagination.js';

export const store = async (req, res) => {
    try{
        const { name_category } = req.body;
        const user_id = req.user.id;

        if(!name_category || !user_id){
            return res.status(400).json({ error: 'Todos los campos son necesarios llenar' });
        }

        if(!isValidUUID(user_id)){
            return res.status(400).json({ error: 'ID del usuario es invalido' });
        }

        const categoryId = crypto.randomUUID();
        const query = 'INSERT INTO categories(id, name, user_id) VALUES(?, ?, ?)';

        await pool.query(query, [categoryId, name_category, user_id]);

        const newCategory = { id: categoryId, name: name_category, user_id };

        res.status(201).json({
            data: categoryDecorator(newCategory)
        });
    }catch(e){
        if(e.code === 'ER_DUP_ENTRY'){
            return res.status(422).json({ error: 'Ya tienes una categoria con ese nombre' });
        }
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const index = async (req, res) => {
    try{
        const user_id = req.user.id;

        if(!user_id || !isValidUUID(user_id)){
            return res.status(400).json({ error: 'ID del usuario es requerido y debe ser valido' });
        } 

        const { page, limit, offset } = getPaginationParams(req.query);

        const countQuery = 'SELECT COUNT(id) AS total FROM categories WHERE user_id = ?';
        const [countResult] = await pool.query(countQuery, [user_id]);
        const total = countResult[0].total;

        const [rows] = await pool.query('SELECT * FROM categories WHERE user_id = ? LIMIT ? OFFSET ?', [user_id, limit, offset]);

        const lastPage = Math.ceil(total / limit) || 1;

        res.status(200).json({
            data: categoriesListDecorator(rows),
            total,
            current_page: page,
            last_page: lastPage,
            per_page: limit
        });
    }catch(e){
        res.status(500).json({ error: 'Error al obtener las categorias' });
    }
};

export const show = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        if (!user_id || !isValidUUID(user_id) || !isValidUUID(id)) {
            return res.status(400).json({ error: 'IDs requeridos o invalidos' });
        }

        const [rows] = await pool.query(
            'SELECT id, name, user_id FROM categories WHERE id = ? AND user_id = ?', 
            [id, user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Categoria no encontrada o no tienes permisos' });
        }

        res.status(200).json({
            ...categoryDecorator(rows[0])
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la categoria especifica' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name_category } = req.body;
        const user_id = req.user.id;

        if (!name_category || !user_id || !isValidUUID(user_id) || !isValidUUID(id)){
            return res.status(400).json({ error: 'Faltan datos o IDs invalidos' });
        } 

        const [result] = await pool.query(
            'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?', 
            [name_category, id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoria no encontrada o no tienes permisos' });
        }

        const [dataCategory] = await pool.query(
            'SELECT id, name, user_id FROM categories WHERE id = ? AND user_id = ?', 
            [id, user_id]
        );

        res.status(200).json({ 
            message: 'Categoria actualizada correctamente',
            ...categoryDecorator(dataCategory[0])
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la categoria' });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        if(!user_id || !isValidUUID(user_id) || !isValidUUID(id)){
            return res.status(400).json({ error: 'IDs requeridos o invalidos' })
        }

        const [dataCategory] = await pool.query(
            'SELECT id, name, user_id FROM categories WHERE id = ? AND user_id = ?', 
            [id, user_id]
        );
        
        const [result] = await pool.query(
            'DELETE FROM categories WHERE id = ? AND user_id = ?', 
            [id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoria no encontrada o no tienes permisos' });
        }

        res.status(200).json({ 
            message: 'Categoria eliminada correctamente',
            data: categoryDecorator(dataCategory[0])
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la categoria' });
    }
};
