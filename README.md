### 2. README para el Repositorio FRONTEND

**Archivo:** `README.md` (Ubicar en la raíz de la carpeta `frontend` o `tiendarushav`)

```markdown
# Rushav Frontend - Cliente Web E-commerce

Este repositorio contiene la interfaz de usuario (Front-end) para la plataforma "Rushav". Es una Aplicación de Página Única (SPA) desarrollada con React que consume la API REST del backend para ofrecer una experiencia de compra y administración completa.

## Descripción del Proyecto

La aplicación cliente ofrece dos áreas principales:
1.  **Área Pública:** Catálogo de productos con filtros por categoría y género, carrito de compras persistente en el navegador, y flujo de pago (checkout) con generación de órdenes.
2.  **Área de Administración:** Panel protegido para la gestión de usuarios, productos, categorías y visualización del historial de ventas.

## Tecnologías Utilizadas

* **Framework:** React 19.
* **Herramienta de Build:** Vite.
* **Estilos:** React Bootstrap y CSS personalizado (Diseño responsivo y sistema de diseño propio).
* **Enrutamiento:** React Router DOM.
* **Estado Global:** React Context API (para gestión de autenticación y sesión).
* **Testing:** Vitest y React Testing Library.

## Requisitos Previos

* Node.js versión 18 o superior.
* NPM (Node Package Manager).
* **Importante:** El Backend de Rushav debe estar en ejecución en el puerto 8080 para que la aplicación funcione correctamente.

## Instrucciones de Instalación

1.  **Descargar el código:**
    Clone o descargue el repositorio en su equipo local.

2.  **Instalar dependencias:**
    Abra una terminal en la carpeta raíz del proyecto y ejecute:
    ```bash
    npm install
    ```

## Instrucciones de Ejecución

Para iniciar el servidor de desarrollo local:

```bash
npm run dev
Una vez iniciado, la aplicación estará disponible en:

URL: http://localhost:5173

Ejecución de Pruebas (Testing)
El proyecto incluye una suite de pruebas unitarias para validar componentes críticos como el Login, el Header, el Footer y formularios de contacto. Para ejecutar las pruebas y ver los resultados en consola:

Bash

npm run test
Funcionalidades Clave Implementadas
Autenticación JWT: Manejo de sesión mediante tokens Bearer, almacenamiento seguro en LocalStorage y protección de rutas privadas (Admin).

Gestión de Productos: CRUD completo de productos con soporte para subida de imágenes al servidor.

Carrito de Compras: Funcionalidad de agregar, eliminar y modificar cantidades, con cálculo automático de totales y persistencia local.

Checkout y Boleta: Formulario de finalización de compra que envía la orden al backend para el cálculo de IVA, validación de stock y persistencia en base de datos. Se muestra el detalle de la compra al finalizar.

Validaciones: Formularios con validación de datos (frontend) y manejo de errores de integridad referencial provenientes del backend.
