const ETIQUETAS = { rojo: "Rojo", amarillo: "Amarillo", verde: "Verde" };

const Semaforo = ({ color }) => (
  <span className={`semaforo semaforo--${color}`}>
    <span className="semaforo-punto" aria-hidden="true" />
    {ETIQUETAS[color]}
  </span>
);

export default Semaforo;
