// Declaración global para permitir imports de ficheros .css como side-effect
// Evita el error TS2882: "Cannot find module or type declarations for side-effect import".
// Next.js manejará el CSS en el bundler; aquí solo silenciamos el error de tipos.
declare module '*.css';
