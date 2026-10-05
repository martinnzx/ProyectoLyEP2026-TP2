import '../css/formcliente.css'
import { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import useClientes from "../hooks/useClientes";

const FormCliente = () => {
    const { crearCliente } = useClientes();

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [ciudad, setCiudad] = useState("");

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const manejarSubmit = async (e) => {

        e.preventDefault();

        setMensaje("");
        setError("");

        if (
            nombre.trim() === "" ||
            email.trim() === "" ||
            telefono.trim() === "" ||
            ciudad.trim() === ""
        ) {

            setError("Complete todos los campos.");

            return;
        } 
        if (telefono.trim().length < 7) {
            setError("El teléfono debe tener al menos 7 caracteres.");
            return;
        }
        if (isNaN(telefono.trim())) {
         setError("El teléfono debe contener únicamente números.");
         return;
     }
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Por favor, ingrese un formato de correo electrónico válido.");
            return;
        }
        if (nombre.trim().length < 3) {
         setError("El nombre debe tener al menos 3 caracteres.");
         return;
     }
     if (ciudad.trim().length < 2) {
         setError("La ciudad debe tener al menos 2 caracteres.");
         return;
     }
        const nuevoCliente = {

            email,

            username: nombre.toLowerCase().replace(/\s/g, ""),

            name: {
                firstname: nombre,
                lastname: "-"
            },

            address: {
                city: ciudad
            },

            phone: telefono
        };

        try {

            setLoading(true);

            const cliente = await crearCliente(nuevoCliente);

            setMensaje(
                `Cliente creado correctamente. ID: ${cliente.id}`
            );

            setNombre("");
            setEmail("");
            setTelefono("");
            setCiudad("");

        } catch {

            setError(
                "Ocurrió un error al crear el cliente."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className='formulario-cliente'>

            <h3>Nuevo Cliente</h3>

            <Form onSubmit={manejarSubmit}>

                <Form.Group className="mb-3">

                    <Form.Label htmlFor="cliente-nombre">Nombre</Form.Label>

                    <Form.Control
                        id="cliente-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) =>
                            setNombre(e.target.value)
                        }
                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label htmlFor="cliente-email">Email</Form.Label>

                    <Form.Control
                        id="cliente-email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label htmlFor="cliente-telefono">Teléfono</Form.Label>

                    <Form.Control
                        id="cliente-telefono"
                        type="text"
                        value={telefono}
                        onChange={(e) =>
                            setTelefono(e.target.value)
                        }
                    />

                </Form.Group>

                <Form.Group className="mb-3">

                    <Form.Label htmlFor="cliente-ciudad">Ciudad</Form.Label>

                    <Form.Control
                        id="cliente-ciudad"
                        type="text"
                        value={ciudad}
                        onChange={(e) =>
                            setCiudad(e.target.value)
                        }
                    />

                </Form.Group>

                <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                >

                    {
                        loading
                            ? <Spinner size="sm" />
                            : "Guardar Cliente"
                    }

                </Button>

            </Form>

            {
                mensaje &&
                <Alert
                    className="mt-3"
                    variant="success"
                    role="alert"
                    aria-live="polite"
                >
                    {mensaje}
                </Alert>
            }

            {
                error &&
                <Alert
                    className="mt-3"
                    variant="danger"
                    role="alert"
                    aria-live="assertive"
                >
                    {error}
                </Alert>
            }

        </div>

    );
};

export default FormCliente;