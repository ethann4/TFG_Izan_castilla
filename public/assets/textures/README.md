Texturas futuras para el configurador.

El configurador actual genera texturas proceduralmente en JavaScript para no
bloquear el proyecto por falta de assets. Mas adelante puedes sustituirlas por:

- cuero.jpg
- alcantara.jpg
- carbono.jpg
- carbono_forjado.jpg
- cuero_perforado.jpg

La funcion `createTextureLibrary()` de `configurator.js` es el punto preparado
para sustituir las texturas procedurales por imagenes reales usando
`BABYLON.Texture` y materiales PBR.
