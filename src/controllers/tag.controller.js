import crypto from 'crypto';
import { pool } from '../db/connection.js';
import { tagDecorator, tagsListDecorator } from '../decorators/tag.decorator.js';
import { isValidUUID } from '../utils/validatorUUID.js';
import { getPaginationParams } from '../utils/pagination.js';

export const store = async (req, res) => {
    try{
        const { name_tag } = req.body;
        const user_id = req.user.id;

        if(!name_tag || !user_id){
            return res.status(400).json({ error: 'Todos los campos son necesarios' });
        }

        if(!isValidUUID(user_id)){
            return res.status(400).json({ error: 'ID del usuario es invalido' });
        };

        const tagId = crypto.randomUUID();
        const query = 'INSERT INTO tags(id, name, user_id) VALUES(?, ?, ?)';

        await pool.query(query, [tagId, name_tag, user_id]);

        const newTag = { id: tagId, name: name_tag, user_id };

        res.status(201).json({ 
            data: tagDecorator(newTag) 
        });
        
    }catch(e){
        if(e.code === 'ER_DUP_ENTRY'){
            return res.status(422).json({ error: 'Ya tienes una etiqueta con ese nombre' });
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

        const countQuery = 'SELECT COUNT(id) AS total FROM tags WHERE user_id = ?';
        const [countResult] = await pool.query(countQuery, [user_id]);
        const total = countResult[0].total;

        const [rows] = await pool.query('SELECT * FROM tags WHERE user_id = ? LIMIT ? OFFSET ?', [user_id, limit, offset]);

        const lastPage = Math.ceil(total / limit) || 1;

        res.status(200).json({ 
            data: tagsListDecorator(rows),
            total,
            current_page: page,
            last_page: lastPage,
            per_page: limit
        });

    }catch(e){
        res.status(500).json({ error: 'Error al obtener las etiquetas' });
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
            'SELECT * FROM tags WHERE id = ? AND user_id = ?', 
            [id, user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Etiqueta no encontrada o no tienes permisos' });
        }

        res.status(200).json({
            ...tagDecorator(rows[0])
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la etiqueta especifica' });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name_tag } = req.body;
        const user_id = req.user.id;

        if (!name_tag || !user_id || !isValidUUID(user_id) || !isValidUUID(id)){
            return res.status(400).json({ error: 'Faltan datos o IDs invalidos' });
        } 

        const [result] = await pool.query(
            'UPDATE tags SET name = ? WHERE id = ? AND user_id = ?', 
            [name_tag, id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Etiqueta no encontrada o no tienes permisos' });
        }

        const [dataTag] = await pool.query(
            'SELECT * FROM tags WHERE id = ? AND user_id = ?', 
            [id, user_id]
        );

        res.status(200).json({ 
            message: 'Etiqueta actualizada correctamente',
            data: tagDecorator(dataTag[0])
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar etiqueta' });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id; 

        if(!user_id || !isValidUUID(user_id) || !isValidUUID(id)){
            return res.status(400).json({ error: 'IDs requeridos o invalidos' })
        }

        const [dataTag] = await pool.query(
            'SELECT * FROM tags WHERE id = ? AND user_id = ?', 
            [id, user_id]
        );

        const [result] = await pool.query(
            'DELETE FROM tags WHERE id = ? AND user_id = ?', 
            [id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Etiqueta no encontrada o no tienes permisos' });
        }

        res.status(200).json({ 
            message: 'Etiqueta eliminada correctamente',
            data: tagDecorator(dataTag[0])
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar etiqueta' });
    }
};