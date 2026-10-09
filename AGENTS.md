# Instrucciones del proyecto

## Alcance y estética
- Prototipo estático, mobile-first, sin dependencias ni build. Fondo blanco, sobre y marco de carta en blanco y negro; personajes con colores extravagantes planos. Colores planos, contraste fuerte; sin degradados decorativos ni sombras difusas. Textos mínimos y neutros.
- Mantener la secuencia: tocar la esquina del paquete vertical de figuritas, desprender el borde superior sellado, sacar la carta y permitir inspeccionarla.
- La carta adapta `public/card-motion.js` y el reflejo `.certificate::after` de `guerrasur/rifavital`. Conservar calibración inicial, límite de inclinación, soporte de orientación de pantalla, permiso de Safari desde un toque explícito y alternativas de mouse/dedo.
- El sobre debe parecer un paquete de cartas/figuritas, con sellos superior e inferior dentados, nunca un sobre postal con solapa triangular. Mantener el reflejo móvil de la carta en escala de grises.
- Respetar `prefers-reduced-motion`. Los sensores requieren HTTPS y validación física en celular; no afirmar que una prueba simulada verifica el giroscopio real.

## Actualizaciones obligatorias
Mecánica adaptada de `guerrasur/suiload-web/web/device.js`.
- Mostrar siempre la versión en el header y conservar un botón Actualizar.
- En cada cambio publicado, incrementar SemVer y sincronizar `version.js`, `version.json`, texto inicial en `index.html` y TODOS los parámetros `?v=` de HTML/importaciones.
- Chequear `version.json` relativo a la página (compatible con subcarpetas de GitHub Pages), con `cache: no-store` y timestamp: al iniciar, cada 5 minutos, al volver a la pestaña y al recuperar conexión.
- Comparar versiones numéricamente; actualizar automáticamente solo ante una versión mayor, sin pedir confirmación.
- Esperar a que termine la apertura antes de recargar. Guardar/restaurar la carta revelada en sessionStorage.
- Evitar bucles de recarga por despliegues parciales. No borrar datos de otros proyectos ni desregistrar sus service workers.
- Publicar todos los archivos/versiones juntos en un commit. No agregar un service worker que pueda servir assets viejos sin diseñar primero su actualización.

## Verificación
- Servir con `python3 -m http.server 8000` desde la raíz.
- Comprobar viewport de celular y escritorio, apertura, repetición, reflejo con mouse/dedo, permiso de sensores y movimiento reducido.
- Probar actualización a una versión mayor, pausa durante apertura, restauración del estado, error de red y versión igual/menor.
- El despliegue no se asume: informar por separado si solo se guardaron cambios en el repo.

## Personajes procedurales
- `characters.js` separa cabeza, piel, pelo, color de pelo, ojos, nariz, boca, ropa y color de ropa. El cuerpo base es siempre el mismo.
- Dibujos SVG por capas, colores planos y contornos negros. Mantener todas las combinaciones dentro del viewBox y la cara legible.
- Generar exactamente una vez al abrir cada sobre, nunca al mover la carta. Preservar el mismo personaje después de la actualización automática y validar los índices al restaurar.
- Ampliar variantes en TRAITS junto con sus dibujos/paletas; incrementar schema si cambia el significado de índices existentes.

- Desde v1.3.0 los personajes usan landmarks faciales comunes y pelo recortado a cada cabeza; dibujos más suaves inspirados en avatares tipo Mii. Agregar cejas, orejas, lentes, barba y detalles como capas independientes. Schema 2 migra personajes schema 1 con variantes neutras, conservando sus rasgos originales.

## Nombres por cuatro bloques
- `names.js` contiene los top 20 nombres y top 20 apellidos de Argentina del ranking general de Forebears, sin filtrar por género. Fuentes: https://forebears.io/argentina/forenames y https://forebears.io/argentina/surnames (consulta 2026-10-09). No presentarlo como ranking oficial actualizado del RENAPER.
- Cortar cada palabra NFC por cantidad de letras, dando la letra extra a la primera mitad. Cuatro elecciones independientes: inicio de nombre + final de nombre, inicio de apellido + final de apellido. Conservar tildes y capitalizar solo el inicio de cada palabra.
- Schema 3 guarda los cuatro índices en nameParts; cartas anteriores conservan su nombre y apariencia con legacyName al actualizar. No asociar identidad o rasgos al género del nombre.

- Desde v1.5.0 centrar el paquete en el viewport, independientemente de los controles. Mantener paquete alargado y texto mínimo. Animación en dos fases: desprender tira sellada; sacar carta mientras baja el envoltorio y asentar carta en el centro. Esperar animation.finished antes de marcar la app libre para actualizar.
