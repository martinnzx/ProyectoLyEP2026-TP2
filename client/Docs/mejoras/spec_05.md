# Especificación de mejora 05: Validación preventiva y robusta del formulario de clientes

## 1. Propósito
Implementar validaciones preventivas y robustas en el componente `FormCliente.jsx` para asegurar la integridad de los datos de entrada, prevenir el envío de cargas incompletas y mejorar el feedback visual al usuario antes de ejecutar la petición HTTP.

## 2. Problema actual
- El formulario de alta permite enviar registros con campos vacíos o con espacios en blanco si no se controlan estrictamente en la capa de presentación.
- El modelo enviado puede ser incompleto o frágil, afectando la consistencia con el listado y el detalle.
- La ausencia de validaciones estrictas de formato (como correo electrónico y longitud de teléfono) genera riesgos de inconsistencia de datos.

## 3. Alcance

### Incluido
- Validación de campos obligatorios (nombre, email, teléfono y ciudad).
- Validación de formato de correo electrónico mediante expresión regular.
- Verificación de longitud mínima para el campo de teléfono.
- Control de estados de carga y despliegue de alertas visuales claras (`Alert` de React-Bootstrap) ante errores de validación.
- Limpieza automática del formulario exclusivamente tras un alta exitosa.

### Fuera de alcance
- Modificación del backend o de la API externa (FakeStoreAPI).
- Cambios en la lógica de eliminación o grilla de clientes.

## 4. Requisitos funcionales

### RF-01 - Validación de campos obligatorios
El sistema deberá verificar que los campos Nombre, Email, Teléfono y Ciudad no estén vacíos antes de procesar el alta. De haber campos incompletos, se detendrá el envío y se mostrará una alerta de error.

### RF-02 - Validación de formato de email
Se incorporará una expresión regular para asegurar que el texto ingresado en el campo email posea una estructura válida antes de enviar los datos.

### RF-03 - Validación de longitud de teléfono
El campo de teléfono deberá cumplir con una longitud mínima de caracteres para evitar registros con números incompletos o inválidos.

### RF-04 - Control de envío y feedback visual
El botón de envío se deshabilitará durante la carga (`loading`), mostrando un indicador visual (`Spinner`), y las alertas de éxito o error se renderizarán de manera condicional.

## 5. Criterios de aceptación

- **CA-01:** Intentar enviar el formulario vacío detiene la ejecución y muestra una advertencia visual.
- **CA-02:** Un correo electrónico con formato incorrecto frena el envío y advierte al usuario.
- **CA-03:** Un teléfono con menos caracteres de los permitidos bloquea la petición.
- **CA-04:** Un formulario con datos válidos realiza el envío exitoso, muestra el mensaje de confirmación y limpia los campos automáticamente.