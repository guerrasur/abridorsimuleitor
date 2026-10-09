# Instrucciones del proyecto

## Alcance y estética
- Prototipo estático, mobile-first, sin dependencias ni build. Fondo blanco, textos mínimos y neutros.
- Mantener la secuencia: tocar la punta del sobre, abrir la solapa, sacar la carta y permitir inspeccionarla.
- La carta adapta `public/card-motion.js` y el reflejo `.certificate::after` de `guerrasur/rifavital`. Conservar calibración inicial, límite de inclinación, soporte de orientación de pantalla, permiso de Safari desde un toque explícito y alternativas de mouse/dedo.
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
