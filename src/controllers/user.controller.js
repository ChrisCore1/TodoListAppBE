import bcrypy from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../db/connection.js';
import { userDecorator } from '../decorators/user.decorator.js';

export const registerUser = async (req, res) => {
    try{
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({ error: 'Todos los campos son necesarios llenar' });
        }

        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

        if(existingUsers.length > 0){
            return res.status(422).json({ error: 'El correo electronico ya esta registrado' });
        }

        if(password.length < 8){
            return res.status(422).json({ error: 'La contraseña debe tener minimo 8 caracteres' });
        }

        const hashedPassword = await bcrypy.hash(password, 10);
        const userId = crypto.randomUUID();
        
        const query = `
            INSERT INTO users(id, name, email, password)
            VALUES(?, ?, ?, ?)
        `;
        await pool.query(query, [userId, name, email, hashedPassword]);

        const newUser = { id: userId, name, email }

        res.status(201).json({
            data: userDecorator(newUser)
        });
    }catch(e){
        console.error('Error ', e);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
