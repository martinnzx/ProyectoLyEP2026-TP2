# Forma de Trabajo del Equipo

Para la resolución de este Trabajo Práctico de Legislación y Ejercicio Profesional, nuestro equipo adoptó una metodología de trabajo colaborativa basada en buenas prácticas de la industria del software.

## 1. Organización del Repositorio
- Se estableció un repositorio central ("Fork") desde el repositorio base provisto por el profesor.
- Se utilizó un flujo de trabajo basado en **Git Flow simplificado**. La rama `main` se mantuvo intacta como reflejo de producción, mientras que la rama `develop` se utilizó como punto de integración general para todo el equipo.

## 2. Fase de Análisis y Relevamiento
- Tal como indica la consigna, la primera tarea no fue escribir código. Cada integrante descargó el proyecto y realizó una lectura técnica individual sin alterar el código fuente.
- Se registraron los hallazgos de forma aislada para fomentar diferentes perspectivas (ver carpeta `Docs`).
- Posteriormente, se realizó una consolidación grupal, cuyo resultado quedó asentado en el archivo unificado `ANALISIS.md`. Este documento sirvió como nuestra principal hoja de ruta, categorizando problemas según su impacto en Calidad de Código, UX/UI, Seguridad, Arquitectura, etc.

## 3. Implementación de Mejoras
- Cada integrante seleccionó al menos un hallazgo de impacto (Alto o Medio) para resolver.
- Se crearon ramas individuales tipo "feature" (ej: `feature/ux-estados-vacios`, `feature/validacion-clientes`) partiendo siempre desde la rama actualizada `develop`.
- El progreso de cada integrante se registró de forma cronológica en el archivo `dia.md`, que funcionó como nuestra bitácora del proyecto o *Daily Standup* asíncrona.

## 4. Estándares y Calidad
- **Commits Semánticos:** Se adoptó la convención de *Conventional Commits* (ej: `feat:`, `fix:`, `docs:`, `chore:`) para garantizar que el historial del proyecto sea completamente legible y auditable a simple vista.
- **Documentación de Especificaciones:** Por cada mejora implementada, el responsable generó un documento de especificación técnica previo (`spec_X.md`) y un documento de resultados posterior (`doc_X.md`) para dejar por escrito el qué, cómo y por qué de su trabajo.
- **Integración Segura (Pull Requests):** Ningún integrante subió código ("Push directo") hacia las ramas principales. Todo el trabajo fue integrado mediante "Pull Requests" (PR) documentados, incluyendo el detalle de los archivos modificados y referenciando el código del hallazgo que resolvían.

Esta disciplina metodológica nos permitió trabajar en paralelo, integrar el código sin conflictos mayores y alcanzar los objetivos técnicos requeridos.
