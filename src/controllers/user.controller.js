import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
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

        const hashedPassword = await bcrypt.hash(password, 10);
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
        res.status(500).json({ error: 'Error del servidor' });
    }
};

export const login = async (req, res) => {
    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son necesarios' });
        }

        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        const user = rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_KEY,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Inicio de sesion exitoso',
            data: userDecorator(user),
            token: token
        });

    }catch(e) {
        res.status(500).json({ error: 'Error del servidor' });
    }
};
