import useEstadoConexion from "../hooks/useEstadoConexion";

const formatoFecha = (iso) =>
  new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });

const EstadoConexion = () => {
  const { conectado, descargaUsada } = useEstadoConexion();

  if (conectado) {
    return <p className="estado-conexion estado-conexion--ok">En línea · datos actualizados</p>;
  }

  return (
    <p className="estado-conexion estado-conexion--offline">
      Sin conexión: trabajando con los datos descargados
      {descargaUsada ? ` el ${formatoFecha(descargaUsada)}` : ""}. Lo que registres queda pendiente de sincronizar.
    </p>
  );
};

export default EstadoConexion;
