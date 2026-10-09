# Abridor Simuleitor

Prototipo v1.8.0. Paquete de figuritas y carta en blanco y negro, con colores planos. Tocá o arrastrá la esquina superior: la carta asoma. Arrastrala hacia arriba y soltá para extraerla y dejar caer el envoltorio. Los sobres eligen entre 89 personajes fijos; Ver personajes permite recorrer la edición completa. La carta responde al mouse o al dedo; en celulares compatibles, el botón Activar movimiento habilita el sensor (HTTPS y permiso del navegador).

Sin instalación ni compilación. Para probar localmente:

```sh
python3 -m http.server 8000
```

Abrir http://localhost:8000. Puede alojarse como sitio estático desde la raíz, incluyendo GitHub Pages. La actualización automática revisa version.json y conserva la carta abierta. Ver AGENTS.md para reglas de futuras versiones.

## Nombres aleatorios
Los nombres nuevos combinan cuatro mitades elegidas independientemente, sin filtro de género. Base: los primeros 20 nombres y apellidos de los rankings generales de [Forebears (nombres)](https://forebears.io/argentina/forenames) y [Forebears (apellidos)](https://forebears.io/argentina/surnames), consultados el 09/10/2026. No es un ranking oficial actual del RENAPER. La división se hace por letras; por ejemplo Carlos → Car + los. Los datos originales y las mitades están en names.js.
