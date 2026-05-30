# SIGEP II — Proyecto Full Stack (Versión Móvil con Ionic React)

Sistema web y móvil para la gestión de usuarios y hoja de vida de servidores públicos.  
El proyecto está dividido en dos aplicaciones:

- **Backend:** API REST construida con Spring Boot (sin cambios).
- **Frontend:** aplicación móvil construida con **Ionic React + Capacitor**, que reemplaza la versión anterior basada en Vite.

La aplicación permite gestionar usuarios, autenticación, completar la hoja de vida por secciones, cargar documentos (usando cámara o galería), validar información y descargar la hoja de vida en PDF. Incluye capacidades nativas (geolocalización, vibración, notificaciones locales) y se ejecuta en dispositivos Android (iOS también es compatible, aunque no se detalla aquí).

---

## 1. Tecnologías principales

### Backend (sin cambios)

- Java 21
- Spring Boot 3.2.0
- Spring Security + JWT
- MongoDB
- Maven Wrapper
- Cloudflare R2 (almacenamiento de archivos)
- OpenPDF (generación de PDF)
- Dotenv (variables de entorno)

### Frontend (nuevo)

- **Ionic React 8** (framework de UI)
- **Capacitor 8** (acceso a capacidades nativas)
- React 19 + TypeScript
- Vite (bundler, usado internamente por Ionic)
- React Router DOM 5 (compatible con Ionic)
- Axios
- Plugins de Capacitor:
    - `@capacitor/camera`
    - `@capacitor/geolocation`
    - `@capacitor/haptics`
    - `@capacitor/local-notifications`
- Estilos: CSS global + componentes Ionic

---

## 2. Estructura general del proyecto

```txt
SIGEP-II-api/
├── backend/                # (igual que antes)
│   ├── .env
│   ├── pom.xml
│   └── src/
│
└── sigep-ionic/            # Nuevo frontend móvil
    ├── package.json
    ├── ionic.config.json
    ├── capacitor.config.ts
    ├── .env
    └── src/
        ├── components/
        │   ├── common/
        │   │   └── FileUploadField.tsx   # con soporte para cámara
        │   ├── MainLayout.tsx            # layout con menú lateral
        │   └── ProtectedRoute.tsx
        ├── context/
        │   └── AuthContext.tsx
        ├── hooks/
        │   └── useAuth.ts
        ├── pages/
        │   ├── auth/
        │   │   ├── LoginPage.tsx
        │   │   ├── ForgotPasswordPage.tsx
        │   │   └── ResetPasswordPage.tsx
        │   ├── curriculum/
        │   │   ├── DatosPersonalesPage.tsx
        │   │   ├── EducacionPage.tsx
        │   │   ├── ExperienciaPage.tsx
        │   │   └── GerenciaPublicaPage.tsx
        │   ├── dashboard/
        │   │   └── DashboardPage.tsx
        │   └── usuarios/
        │       ├── ChangePasswordPage.tsx
        │       ├── CreateUserPage.tsx
        │       └── DisableUserPage.tsx
        ├── services/
        │   └── api.ts
        ├── types/
        ├── utils/
        └── theme/
            └── global.css
```
## 3. Módulos funcionales

**No cambian respecto a la versión Vite.**  
El frontend móvil implementa exactamente los mismos módulos:

- **Autenticación y usuarios**: login, registro, inhabilitación, cambio de contraseña, recuperación.
- **Hoja de vida**:
    - Datos personales (básicos, demográficos, contacto).
    - Educación (formación académica, educación para el trabajo, idiomas).
    - Experiencia laboral (general y docente).
    - Gerencia pública (publicaciones, premios, proyectos, corporaciones).
- **Carga de archivos**: con cámara o galería en el móvil.
- **Descarga de hoja de vida** en PDF.

---

## 4. Requisitos previos (adicionales para móvil)

Además de los requisitos del backend (Java 21, MongoDB, Node.js, etc.), necesitas:

- **Android Studio** (para compilar y ejecutar la app en Android).
- **JDK 11 o superior** (para Android Studio).
- Un **dispositivo Android** con modo desarrollador y depuración USB activada (o un emulador).

Verifica versiones:

```bash
java -version
node -v
npm -v
ionic --version   # npm install -g @ionic/cli si no lo tienes
```

## 5. Configuración del frontend móvil

### 5.1. Variables de entorno

Crea el archivo `sigep-ionic/.env` en la raiz de sigep-ionic.

#### 🔧 Para desarrollo con backend local (Spring Boot en tu PC):
```env
VITE_API_URL=http://localhost:8080
```
#### ☁️ Para usar el backend desplegado en la nube (Render en este caso):
```env
VITE_API_URL=https://sigep-ii-api.onrender.com
```
### 5.2. Instalación de dependencias

```bash
cd sigep-ionic
npm install
```
### 5.3. Instalación de plugins de Capacitor

```bash
npm install @capacitor/camera @capacitor/geolocation @capacitor/haptics @capacitor/local-notifications --legacy-peer-deps
npx cap sync
```
### 5.4. Configuración de Capacitor
El archivo capacitor.config.ts debe estar correctamente inicializado. Si no lo tienes, crea uno básico:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.sigep',
  appName: 'SIGEP II',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```
Luego agrega la plataforma Android:

```bash
npx cap add android
```
## 6. Ejecución en modo desarrollo (web)
Para probar la interfaz en el navegador (sin capacidades nativas):

```bash
cd sigep-ionic
ionic serve
```
La aplicación estará disponible en http://localhost:8100

## 7. Ejecución en dispositivo Android
Sigue estos pasos en orden:

### 7.1. Construir la aplicación

```bash
ionic build
```
Genera la carpeta dist/ con los archivos optimizados.
### 7.2. Sincronizar con Capacitor

```bash
npx cap sync
```
Esto copia los archivos a la carpeta android/ y actualiza la configuración.

### 7.3. Abrir proyecto en Android Studio
```bash
npx cap open android
```
Esto abrirá Android Studio con el proyecto listo.
### 7.4. Ejecutar la app
- Conecta tu dispositivo Android por USB (con depuración USB activada) o inicia un emulador.
- En Android Studio, haz clic en Run o presiona Shift + F10.
- La aplicación se compilará, instalará y se abrirá automáticamente en el dispositivo.

### 7.5. Prueba de capacidades nativas
Una vez instalada, verifica:
- **Cámara:** en cualquier campo de carga de archivos, usa el botón "Cámara / Galería".
- **Geolocalización:** en Datos Personales -> Datos de Contacto -> botón "Usar mi ubicación actual".
- **Vibración y notificaciones:** al guardar cualquier formulario, el dispositivo vibrará y aparecerá una notificación local.

