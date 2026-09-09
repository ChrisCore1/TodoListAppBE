import crypto from 'crypto';
import { pool } from '../db/connection.js';
import { categoryDecorator, categoriesListDecorator } from '../decorators/category.decorator.js';
import { isValidUUID } from '../utils/validatorUUID.js';

export const store = async (req, res) => {
    try{
        const { name, user_id } = req.body;
        if(!name || !user_id){
            return res.status(400).json({ error: 'Todos los campos son necesarios llenar' });
        }

        if(!isValidUUID(user_id)){
            return res.status(400).json({ error: 'ID del usuario es invalido' });
        }

        const categoryId = crypto.randomUUID();
        const query = 'INSERT INTO categories(id, name, user_id) VALUES(?, ?, ?)';

        await pool.query(query, [categoryId, name, user_id]);

        const newCategory = { id: categoryId, name, user_id };

        res.status(201).json({
            data: categoryDecorator(newCategory)
        });
    }catch(e){
        if(e.code === 'ER_DUP_ENTRY'){
            return res.status(409).json({ error: 'Ya tienes una categoria con ese nombre' });
        }
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const index = async (req, res) => {
    try{
        const { user_id } = req.query;

        if(!user_id || !isValidUUID(user_id)){
            return res.status(400).json({ error: 'ID del usuario es requerido y debe ser valido' });
        } 

        const [rows] = await pool.query('SELECT * FROM categories WHERE user_id = ?', [user_id]);

        res.status(200).json({
            data: categoriesListDecorator(rows)
        });
    }catch(e){
        res.status(500).json({ error: 'Error al obtener las categorias' });
    }
};

export const show = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.query;

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
            data: categoryDecorator(rows[0])
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la categoria especifica' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, user_id } = req.body;

        if (!name || !user_id || !isValidUUID(user_id) || !isValidUUID(id)){
            return res.status(400).json({ error: 'Faltan datos o IDs invalidos' });
        } 

        const [result] = await pool.query(
            'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?', 
            [name, id, user_id]
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
            data: categoryDecorator(dataCategory[0])
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la categoria' });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.query;

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
