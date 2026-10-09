import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';

// POST /api/auth/login - Iniciar sesión
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Debe ingresar email y contraseña' 
            });
        }

        // Buscar usuario por email
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ 
                message: 'Credenciales inválidas' 
            });
        }

        // Comparar contraseña usando bcrypt
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Credenciales inválidas' 
            });
        }

        // toJSON() elimina automáticamente la contraseña de la respuesta
        res.status(200).json({
            message: 'Autenticación exitosa',
            usuario
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/auth/register - Registrar un nuevo usuario del sistema
export const register = async (req, res, next) => {
    try {
        const { email, password, nombre, sector } = req.body;

        if (!email || !password || !nombre || !sector) {
            return res.status(400).json({ 
                message: 'Todos los campos son obligatorios: email, password, nombre y sector' 
            });
        }

        if (!['Soporte', 'Gerencia'].includes(sector)) {
            return res.status(400).json({ 
                message: "El sector debe ser 'Soporte' o 'Gerencia'" 
            });
        }

        const existeUsuario = await Usuario.findOne({ email });
        if (existeUsuario) {
            return res.status(400).json({ 
                message: 'El email ya se encuentra registrado' 
            });
        }

        const nuevoUsuario = new Usuario({
            email,
            password,
            nombre,
            sector
        });

        const usuarioGuardado = await nuevoUsuario.save();
        res.status(201).json(usuarioGuardado);
    } catch (error) {
        next(error);
    }
};

// GET /api/auth/usuarios - Listar usuarios (útil para administración/pruebas)
export const getUsuarios = async (req, res, next) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
};