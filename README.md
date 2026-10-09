# Abridor Simuleitor

Prototipo v1.3.0. Paquete de figuritas y carta en blanco y negro, con colores planos. Tocá la esquina superior: se desprende el borde sellado y sale una carta holográfica. La carta responde al mouse o al dedo; en celulares compatibles, el botón Activar movimiento habilita el sensor (HTTPS y permiso del navegador).

Sin instalación ni compilación. Para probar localmente:

```sh
python3 -m http.server 8000
```

Abrir http://localhost:8000. Puede alojarse como sitio estático desde la raíz, incluyendo GitHub Pages. La actualización automática revisa version.json y conserva la carta abierta. Ver AGENTS.md para reglas de futuras versiones.
