# Relevamiento, comprensión y mejora de la aplicación

El documento tiene por objeto: analizar el código, comprender la aplicación, evaluar su código, identificar problemas y registrar oportunidades de mejora.

Se pide obtener como resultado del análisis:

## 1. Datos generales
  - nombre de la aplicación
  - versión
  - repositorio
  
## 2. Objetivo y alcance

### 2.1 Objetivo de la aplicación

Describir qué problema resuelve la aplicación, para quién y cuál es el resultado esperado para sus usuarios.

### 2.2 Alcance funcional

- Funcionalidades incluídas
- Funcionalidades no incluidas que pudieren ser importantes a los efectos del fin del proyecto
- Analizar si existe persistencia de datos, perfiles de usuario, usuarios

### 2.3 Criterios de éxito

- Saber si el resultado de cada operación es el esperado
- Saber si se trabaja con rutas protegidas
- Validaciones de errores

## 3. Usuarios y procesos

### 3.1 Usuarios
- Listado y detalle de usuarios y roles fijos

### 3.2 Flujo principal
- Detalle de flujo principal y flujos alternativos
- Inicio y cierre de sesión

### 3.3 Casos de uso relevantes

- Detalle de actor involucrado, precondiciones y resultados esperados

## 4. Inventario técnico

### 4.1 Tecnologías y dependencias


### 4.2 Estructura del proyecto

- Ubicación, resposabilidad y dependencias principales

### 4.3 Integraciones externas
- Por ejemplo consumo de apis, autenticación, etc.

## 5. Arquitectura y flujo de datos

### 5.1 Descripción de la arquitectura

Describir cómo se relacionan las páginas, componentes, rutas, contexto y servicios.

### 5.2 Flujo por funcionalidad

Para cada funcionalidad importante, documentar:

- Entrada del usuario.
- Componente que recibe la interacción.
- Estado que se modifica.
- Servicio o API involucrada.
- Transformación de datos.
- Respuesta visible.
- Manejo de carga, error y estado vacío.

## 6. Evaluación del código

### 6.1 Corrección y comportamiento

- [ ] Las rutas llevan a la vista esperada.
- [ ] Las rutas protegidas rechazan usuarios no autorizados.
- [ ] Los formularios validan entradas y muestran mensajes claros.
- [ ] Las respuestas de API se procesan correctamente.
- [ ] Los errores de red no dejan la interfaz en un estado inconsistente.
- [ ] No existen estados imposibles o actualizaciones sobre componentes desmontados.

### 6.2 Mantenibilidad

- [ ] Cada componente tiene una responsabilidad clara.
- [ ] La lógica de negocio no está duplicada en varias vistas.
- [ ] Los nombres de componentes, funciones y variables son descriptivos.
- [ ] Las props y los estados tienen un flujo fácil de seguir.
- [ ] Las constantes y configuraciones no están dispersas.
- [ ] Los estilos no dependen accidentalmente del orden de importación.

### 6.3 Calidad y seguridad

- [ ] No se almacenan secretos en el repositorio.
- [ ] La autenticación no depende únicamente de datos manipulables en el cliente.
- [ ] Las entradas de usuario se validan antes de enviarse.
- [ ] Los errores no exponen información sensible.
- [ ] Las dependencias están actualizadas y justificadas.
- [ ] La aplicación funciona con teclado y tecnologías de asistencia.

### 6.4 Rendimiento

- [ ] Se evitan solicitudes innecesarias o repetidas.
- [ ] Se muestran estados de carga durante operaciones asíncronas.
- [ ] Las listas grandes tienen estrategia de paginación o filtrado.
- [ ] Los recursos estáticos tienen un tamaño razonable.
- [ ] La compilación de producción finaliza sin advertencias relevantes.

## 7. Hallazgos

Registrar evidencia concreta. Cada hallazgo debe poder comprobarse en el código, en la ejecución o en una prueba.

### 7.1 Criterio de priorización

- **Crítica:** impide una operación principal, provoca pérdida de datos o genera un riesgo de seguridad grave.
- **Alta:** afecta una funcionalidad importante, muchos usuarios o la estabilidad de la aplicación.
- **Media:** genera deuda técnica, errores acotados o una experiencia degradada.
- **Baja:** mejora de claridad, consistencia, accesibilidad o mantenimiento sin impacto inmediato.

## 8. Oportunidades de mejora
 Evaluar características de carácter técnico consideradas errores y mejoras para la aplicación, por ejemplo responsibidad en las pantallas.

| ID | Oportunidad | Beneficio esperado | Esfuerzo | Dependencias | Prioridad |
|---|---|---|---|---|---|
| M-001 | Completar | Calidad, seguridad, rendimiento o experiencia | S / M / L | Completar | Alta / Media / Baja |

Separar las mejoras en:

- **Correcciones:** resuelven un problema existente.
- **Refactorizaciones:** mejoran la estructura sin cambiar el comportamiento esperado.
- **Nuevas capacidades:** agregan funcionalidad.
- **Prevención:** reducen la probabilidad de futuros errores.

## 9. Plan de acción

| Orden | Acción | Hallazgo u oportunidad | Responsable | Criterio de aceptación | Estado |
|---:|---|---|---|---|---|
| 1 | Describir acción concreta | H-001 / M-001 | Nombre | Cómo se comprobará que quedó resuelto | Pendiente |

### Definition of Done

- [ ] El cambio tiene una descripción clara.
- [ ] Se actualizó o agregó la prueba correspondiente.
- [ ] `npm run lint` finaliza correctamente.
- [ ] `npm run build` finaliza correctamente.
- [ ] Se verificaron los flujos afectados.
- [ ] Se revisaron accesibilidad y responsive.
- [ ] La documentación quedó actualizada.

## 10. Validación y evidencias

### Comandos ejecutados

### Evidencias

- Capturas o videos: Completar.
- Logs relevantes: Completar.
- Resultados de pruebas: Completar.
- Comparación antes/después: Completar.

## 11. Conclusión

### Estado general

Describir brevemente la situación actual de la aplicación, sus principales fortalezas y los riesgos que deben atenderse primero.

### Próximos pasos

1. Resolver hallazgos críticos y altos.
2. Cubrir con pruebas los flujos principales.
3. Ejecutar nuevamente la evaluación técnica.
4. Actualizar este documento con los resultados.

## 12. Historial del documento

| Fecha | Responsable | Cambios | Versión |

| 2026-09-03 | Miranda Cesar German | Relevamiento inicial | 0.1 |
