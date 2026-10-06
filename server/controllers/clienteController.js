import Cliente from '../models/Cliente.js';

// GET /api/clientes - Obtener todos los clientes
export const getClientes = async (req, res, next) => {
    try {
        const clientes = await Cliente.find();
        res.status(200).json(clientes);
    } catch (error) {
        next(error);
    }
};

// GET /api/clientes/:id - Obtener un cliente por ID
export const getClienteById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findById(id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.status(200).json(cliente);
    } catch (error) {
        next(error);
    }
};

// POST /api/clientes - Crear un nuevo cliente
export const createCliente = async (req, res, next) => {
    try {
        const { email, username, name, phone, address } = req.body;

        if (!email || !username || !name?.firstname) {
            return res.status(400).json({ 
                message: 'Los campos email, username y name.firstname son obligatorios' 
            });
        }

        const existeUsername = await Cliente.findOne({ username });
        if (existeUsername) {
            return res.status(400).json({ message: 'El username ya está en uso' });
        }

        const nuevoCliente = new Cliente({
            email,
            username,
            name: {
                firstname: name.firstname,
                lastname: name.lastname || '-'
            },
            phone,
            address
        });

        const clienteGuardado = await nuevoCliente.save();
        res.status(201).json(clienteGuardado);
    } catch (error) {
        next(error);
    }
};

// PUT /api/clientes/:id - Actualizar un cliente
export const updateCliente = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clienteActualizado = await Cliente.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!clienteActualizado) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json(clienteActualizado);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/clientes/:id - Eliminar un cliente
export const deleteCliente = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clienteEliminado = await Cliente.findByIdAndDelete(id);

        if (!clienteEliminado) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.status(200).json({ message: 'Cliente eliminado correctamente', id });
    } catch (error) {
        next(error);
    }
};