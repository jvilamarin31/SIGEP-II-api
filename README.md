# SIGEP II — Proyecto Full Stack

Sistema web para la gestión de usuarios y hoja de vida de servidores públicos. El proyecto está dividido en dos aplicaciones:

- **Backend:** API REST construida con Spring Boot.
- **Frontend:** aplicación web construida con React, TypeScript y Vite.

El sistema permite gestionar usuarios, autenticar sesiones, completar la hoja de vida por secciones, cargar documentos, validar información del formulario y descargar la hoja de vida consolidada en PDF.

---

## 1. Tecnologías principales

### Backend

- Java 21
- Spring Boot 3.2.0
- Spring Security
- JWT con `jjwt`
- MongoDB
- Maven Wrapper
- Lombok
- Bean Validation
- Cloudflare R2 para almacenamiento de archivos
- OpenPDF para generación de hoja de vida en PDF
- Dotenv para lectura automática de variables desde `.env`

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Axios
- CSS propio
- Validaciones de formularios en cliente
- Carga de archivos PDF e imágenes

---

## 2. Estructura general del proyecto

```txt
SIGEP-II-api/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/apirest/backend/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── dtos/
│       │   ├── exceptions/
│       │   ├── jwts/
│       │   ├── models/
│       │   ├── repositories/
│       │   └── services/
│       └── resources/
│           ├── application.properties
│           └── META-INF/
│               └── spring.factories
│
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── .env
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── services/
        ├── styles/
        ├── types/
        └── utils/
```

---

## 3. Módulos funcionales

### Autenticación y usuarios

Permite:

- Iniciar sesión.
- Crear usuarios.
- Inhabilitar usuarios.
- Cambiar contraseña.
- Solicitar enlace de recuperación.
- Recuperar contraseña desde token.
- Proteger rutas del frontend según sesión activa.
- Manejar roles principales del sistema.

### Hoja de vida / Curriculum

Está dividido en:

1. **Datos personales**
   - Datos básicos.
   - Datos demográficos.
   - Datos de contacto.
   - Soporte para crear hoja de vida sin libreta militar.

2. **Educación**
   - Formación académica.
   - Educación para el trabajo.
   - Idiomas.

3. **Experiencia laboral**
   - Experiencia laboral general.
   - Experiencia laboral docente.

4. **Gerencia pública**
   - Publicaciones.
   - Premios y reconocimientos.
   - Participación en proyectos.
   - Participación en corporaciones o entidades.

5. **Archivos**
   - Carga de PDF, JPG, JPEG y PNG.
   - Almacenamiento en Cloudflare R2.
   - Consulta de documentos cargados.

6. **PDF**
   - Descarga de la hoja de vida completa.
   - Inclusión de datos personales, educación, experiencia laboral y gerencia pública.
   - Documentos mostrados como enlaces clicables.

---

## 4. Requisitos previos

Instala antes de ejecutar el proyecto:

- Java 21.
- Node.js 20 o superior.
- npm.
- Acceso a una base de datos MongoDB.
- Cuenta de Cloudflare con R2 habilitado.
- Git, opcional pero recomendado.

Verifica versiones:

```bash
java -version
node -v
npm -v
```

---

## 5. Configuración del backend

Archivo principal:

```txt
backend/src/main/resources/application.properties
```

Configuración recomendada:

```properties
spring.application.name=backend

spring.data.mongodb.uri=${SPRING_MONGODB_URI:mongodb://localhost:27017/BD-SIGED-II}
spring.data.mongodb.database=${SPRING_MONGODB_DATABASE:BD-SIGED-II}

jwt.llave=${JWT_SECRET:CAMBIAR_POR_UN_SECRETO_SEGURO}
jwt.expiracion=${JWT_EXPIRACION:3600000}

resend.api.key=${RESEND_API_KEY:}

spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

cloudflare.r2.account-id=${CLOUDFLARE_R2_ACCOUNT_ID:}
cloudflare.r2.access-key-id=${CLOUDFLARE_R2_ACCESS_KEY_ID:}
cloudflare.r2.secret-access-key=${CLOUDFLARE_R2_SECRET_ACCESS_KEY:}
cloudflare.r2.bucket-name=${CLOUDFLARE_R2_BUCKET_NAME:}
cloudflare.r2.endpoint=${CLOUDFLARE_R2_ENDPOINT:}
cloudflare.r2.public-url=${CLOUDFLARE_R2_PUBLIC_URL:}
```

---

## 6. Variables de entorno del backend

El proyecto puede leer automáticamente variables desde:

```txt
backend/.env
```

El archivo debe estar al mismo nivel que `pom.xml`.

Ejemplo:

```env

CLOUDFLARE_R2_ACCOUNT_ID=tu_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=tu_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=tu_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=sigep-documentos
CLOUDFLARE_R2_ENDPOINT=https://tu_account_id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxxxx.r2.dev
```

## 7. Configuración de Cloudflare R2

Para usar la carga de documentos debes crear un bucket en Cloudflare R2.

### Datos necesarios

```env
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_PUBLIC_URL=
```

### Cómo obtenerlos

1. Entra al panel de Cloudflare.
2. Ve a **Storage & databases > R2**.
3. Crea un bucket, por ejemplo:

```txt
sigep-documentos
```

4. Copia el **Account ID**.
5. Crea un token R2 con permisos de lectura y escritura sobre ese bucket.
6. Copia:
   - Access Key ID.
   - Secret Access Key.
7. Arma el endpoint:

```txt
https://TU_ACCOUNT_ID.r2.cloudflarestorage.com
```

8. Para la URL pública puedes usar:
   - `r2.dev` para pruebas.
   - Un dominio personalizado para producción.

Ejemplo:

```env
CLOUDFLARE_R2_ACCOUNT_ID=abc123
CLOUDFLARE_R2_ACCESS_KEY_ID=xxxxxxxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxxxxxxx
CLOUDFLARE_R2_BUCKET_NAME=sigep-documentos
CLOUDFLARE_R2_ENDPOINT=https://abc123.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

---

## 8. Ejecutar backend en local

Desde la raíz del proyecto:

```bash
cd backend
```

En Linux o macOS:

```bash
./mvnw spring-boot:run
```

En Windows:

```bash
mvnw.cmd spring-boot:run
```

Cuando levante correctamente, la API queda disponible en:

```txt
http://localhost:8080
```

Si el `.env` no se lee automáticamente, verifica:

- Que el archivo se llame exactamente `.env`.
- Que esté dentro de `backend/`.
- Que estés ejecutando el backend desde la carpeta `backend`.
- Que exista `backend/src/main/resources/META-INF/spring.factories`.
- Que la clase de carga de dotenv esté en `backend/src/main/java/com/apirest/backend/config/`.

---

## 9. Configuración del frontend

Archivo:

```txt
frontend/.env
```

Contenido para ambiente local:

```env
VITE_API_URL=http://localhost:8080
```

El frontend usa esta variable en:

```txt
frontend/src/services/api.ts
```

La URL del backend no debe quedar escrita directamente en el código.

---

## 10. Ejecutar frontend en local

Desde la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

La aplicación web queda disponible normalmente en:

```txt
http://localhost:5173
```

---

## 11. Flujo básico de uso

### 1. Iniciar sesión

El usuario ingresa con tipo de identificación, número de identificación y contraseña.

El backend responde con un JWT. El frontend guarda la sesión en `localStorage`.

### 2. Acceder al panel principal

Después del login, el usuario entra al dashboard.

### 3. Completar datos personales

El orden correcto es:

```txt
Datos básicos
↓
Datos demográficos
↓
Datos de contacto
```

Los datos básicos crean el curriculum inicial del usuario.

### 4. Completar educación

El usuario puede agregar varios registros de:

- Formación académica.
- Educación para el trabajo.
- Idiomas.

Cada registro nuevo se crea con `POST`. Si ya existe un registro y tiene `id`, se actualiza con `PUT`.

### 5. Completar experiencia laboral

El usuario puede agregar:

- Experiencia laboral general.
- Experiencia docente.

Cada registro nuevo se crea con `POST`. Los registros existentes se actualizan usando su identificador.

### 6. Completar gerencia pública

Esta sección permite registrar y consultar información de gerencia pública.

### 7. Descargar hoja de vida

Desde el dashboard se puede descargar el PDF consolidado de la hoja de vida.

---

## 12. Autenticación y roles

El backend usa JWT con Spring Security.

### Rutas públicas

No requieren token:

```txt
POST /api/auth/login
POST /api/auth/pedirEnlace
POST /api/auth/recuperarContraseña
```

### Rutas protegidas

El resto de rutas requiere token:

```http
Authorization: Bearer TOKEN_JWT
```

### Roles principales

```txt
servidorPublico
jefeDeTalentoHumano
```

El rol `jefeDeTalentoHumano` puede crear e inhabilitar usuarios.

---

## 13. OpenAPI

El proyecto está organizado como API REST y puede documentarse con OpenAPI.

### Habilitar Swagger UI

Agrega en:

```txt
backend/pom.xml
```

dentro de `<dependencies>`:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.17</version>
</dependency>
```

Luego ejecuta de nuevo el backend.

URLs esperadas:

```txt
http://localhost:8080/v3/api-docs
http://localhost:8080/swagger-ui/index.html
```

### Permitir Swagger UI en seguridad

En `SecurityConfig.java`, agrega estas rutas como públicas:

```java
.requestMatchers(
    "/api/auth/login",
    "/api/auth/pedirEnlace",
    "/api/auth/recuperarContraseña",
    "/v3/api-docs/**",
    "/swagger-ui/**",
    "/swagger-ui.html"
).permitAll()
```

Para probar rutas protegidas desde Swagger UI:

1. Inicia sesión en `/api/auth/login`.
2. Copia el token.
3. Usa el botón **Authorize**.
4. Pega el token como Bearer Token.

---

## 14. Referencia rápida de API

Base URL local:

```txt
http://localhost:8080
```

### Auth

| Método | Ruta | Descripción | Token |
|---|---|---|---|
| POST | `/api/auth/login` | Inicia sesión | No |
| POST | `/api/auth/registro` | Crea usuario | Sí |
| PUT | `/api/auth/inhabilitarUsuario` | Inhabilita usuario | Sí |
| PUT | `/api/auth/cambiarContraseña` | Cambia contraseña del usuario autenticado | Sí |
| POST | `/api/auth/pedirEnlace` | Solicita enlace de recuperación | No |
| POST | `/api/auth/recuperarContraseña?token=...` | Recupera contraseña | No |

### Archivos

| Método | Ruta | Descripción | Token |
|---|---|---|---|
| POST | `/api/archivos` | Carga archivo PDF o imagen | Sí |
| GET | `/api/archivos/{nombreArchivo}` | Consulta archivo cargado | Sí |

### PDF

| Método | Ruta | Descripción | Token |
|---|---|---|---|
| GET | `/api/curriculum/pdf` | Descarga la hoja de vida completa en PDF | Sí |

### Datos personales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/curriculum/datosPersonales/datosBasicos` | Registra datos básicos |
| PUT | `/api/curriculum/datosPersonales/datosBasicos` | Actualiza datos básicos |
| GET | `/api/curriculum/datosPersonales/datosBasicos` | Obtiene datos básicos |
| POST | `/api/curriculum/datosPersonales/datosDemograficos` | Registra datos demográficos |
| PUT | `/api/curriculum/datosPersonales/datosDemograficos` | Actualiza datos demográficos |
| GET | `/api/curriculum/datosPersonales/datosDemograficos` | Obtiene datos demográficos |
| POST | `/api/curriculum/datosPersonales/datosContacto` | Registra datos de contacto |
| PUT | `/api/curriculum/datosPersonales/datosContacto` | Actualiza datos de contacto |
| GET | `/api/curriculum/datosPersonales/datosContacto` | Obtiene datos de contacto |

### Educación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/curriculum/educacion/formacionAcademica` | Registra formación académica |
| PUT | `/api/curriculum/educacion/formacionAcademica` | Actualiza formación académica |
| GET | `/api/curriculum/educacion/formacionAcademica` | Lista formaciones académicas |
| GET | `/api/curriculum/educacion/formacionAcademica/{formacionId}` | Consulta una formación académica |
| POST | `/api/curriculum/educacion/trabajo` | Registra educación para el trabajo |
| PUT | `/api/curriculum/educacion/trabajo` | Actualiza educación para el trabajo |
| GET | `/api/curriculum/educacion/trabajo` | Lista educación para el trabajo |
| GET | `/api/curriculum/educacion/trabajo/{educacionId}` | Consulta una educación para el trabajo |
| POST | `/api/curriculum/educacion/idioma` | Registra idioma |
| PUT | `/api/curriculum/educacion/idioma` | Actualiza idioma |
| GET | `/api/curriculum/educacion/idioma` | Lista idiomas |
| GET | `/api/curriculum/educacion/idioma/{idiomaId}` | Consulta un idioma |

### Experiencia laboral

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/curriculum/experienciaLaboral` | Registra experiencia laboral |
| PUT | `/api/curriculum/experienciaLaboral` | Actualiza experiencia laboral |
| GET | `/api/curriculum/experienciaLaboral` | Lista experiencias laborales |
| GET | `/api/curriculum/experienciaLaboral/{experienciaLaboralId}` | Consulta una experiencia laboral |
| POST | `/api/curriculum/experienciaLaboral/docente` | Registra experiencia docente |
| PUT | `/api/curriculum/experienciaLaboral/docente` | Actualiza experiencia docente |
| GET | `/api/curriculum/experienciaLaboral/docente` | Lista experiencias docentes |
| GET | `/api/curriculum/experienciaLaboral/docente/{experienciaLaboralId}` | Consulta una experiencia docente |

### Gerencia pública

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/curriculum/gerenciaPublica/publicacion` | Registra publicación |
| GET | `/api/curriculum/gerenciaPublica/publicacion` | Lista publicaciones |
| GET | `/api/curriculum/gerenciaPublica/publicacion/{publicacionId}` | Consulta publicación |
| POST | `/api/curriculum/gerenciaPublica/premioReconocimiento` | Registra premio o reconocimiento |
| GET | `/api/curriculum/gerenciaPublica/premioReconocimiento` | Lista premios o reconocimientos |
| GET | `/api/curriculum/gerenciaPublica/premioReconocimiento/{premioId}` | Consulta premio o reconocimiento |
| POST | `/api/curriculum/gerenciaPublica/participacionProyecto` | Registra participación en proyecto |
| GET | `/api/curriculum/gerenciaPublica/participacionProyecto` | Lista participaciones en proyectos |
| GET | `/api/curriculum/gerenciaPublica/participacionProyecto/{participacionId}` | Consulta participación en proyecto |
| POST | `/api/curriculum/gerenciaPublica/participacionCorporacionEntidad` | Registra participación en corporación o entidad |
| GET | `/api/curriculum/gerenciaPublica/participacionCorporacionEntidad` | Lista participaciones en corporaciones o entidades |
| GET | `/api/curriculum/gerenciaPublica/participacionCorporacionEntidad/{corporacionId}` | Consulta participación en corporación o entidad |

---

## 15. Ejemplos de uso con cURL

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tipoIdentificacion": "CedulaDeCiudadania",
    "numeroIdentificacion": "123456789",
    "contraseña": "Clave123"
  }'
```

Respuesta esperada:

```json
{
  "tipoIdentificacion": "CedulaDeCiudadania",
  "numeroIdentificacion": "123456789",
  "token": "TOKEN_JWT"
}
```

### Crear datos básicos sin libreta militar

```bash
curl -X POST http://localhost:8080/api/curriculum/datosPersonales/datosBasicos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_JWT" \
  -d '{
    "nombre": "Juan Pérez",
    "tipoIdentificacion": "CedulaDeCiudadania",
    "numeroIdentificacion": "123456789",
    "fechaNacimiento": "1990-01-01T00:00:00.000Z",
    "email": "juan@example.com",
    "genero": "MASCULINO",
    "tieneLibretaMilitar": false,
    "personaExpuestaPoliticamente": false
  }'
```

### Crear datos básicos con libreta militar

```bash
curl -X POST http://localhost:8080/api/curriculum/datosPersonales/datosBasicos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_JWT" \
  -d '{
    "nombre": "Juan Pérez",
    "tipoIdentificacion": "CedulaDeCiudadania",
    "numeroIdentificacion": "123456789",
    "fechaNacimiento": "1990-01-01T00:00:00.000Z",
    "email": "juan@example.com",
    "genero": "MASCULINO",
    "tieneLibretaMilitar": true,
    "claseLibretaMilitar": "PRIMERA_CLASE",
    "numeroLibretaMilitar": "123456",
    "distritoMilitar": 12,
    "personaExpuestaPoliticamente": false
  }'
```

### Subir archivo

```bash
curl -X POST http://localhost:8080/api/archivos \
  -H "Authorization: Bearer TOKEN_JWT" \
  -F "archivo=@documento.pdf"
```

Respuesta esperada:

```json
{
  "nombreArchivo": "uuid.pdf",
  "url": "https://pub-xxxxxxxx.r2.dev/uuid.pdf",
  "tipoContenido": "application/pdf",
  "tamañoBytes": 123456
}
```

Luego se guarda la `url` devuelta en el campo correspondiente del curriculum.

### Descargar hoja de vida en PDF

```bash
curl -X GET http://localhost:8080/api/curriculum/pdf \
  -H "Authorization: Bearer TOKEN_JWT" \
  --output hoja-de-vida.pdf
```

---

## 16. Carga de archivos

El backend permite cargar documentos en:

```txt
POST /api/archivos
```

Formatos permitidos:

```txt
.pdf
.jpg
.jpeg
.png
```

Tamaño máximo por defecto:

```txt
10 MB
```

Los documentos se almacenan en Cloudflare R2.

El flujo recomendado es:

```txt
1. El usuario selecciona un archivo.
2. El frontend sube el archivo a /api/archivos.
3. El backend guarda el archivo en Cloudflare R2.
4. El backend devuelve una URL.
5. El frontend guarda esa URL en el formulario correspondiente.
6. El usuario puede ver el documento usando esa URL.
```

Campos que pueden guardar URLs de documentos:

```txt
documentoIdentificacion
libretaMilitar
archivoTarjetaProfesional
archivoEducacionFormal
diplomaActaCertificadoEstudio
certificado
certificadoLaboral
```

---

## 17. Descarga de hoja de vida en PDF

El sistema genera un PDF consolidado en:

```txt
GET /api/curriculum/pdf
```

El PDF incluye:

- Datos personales.
- Datos demográficos.
- Datos de contacto.
- Formación académica.
- Educación para el trabajo.
- Idiomas.
- Experiencia laboral.
- Experiencia docente.
- Gerencia pública.
- Enlaces a documentos cargados.

Los documentos no deben imprimirse como URLs largas. En el PDF deben mostrarse como enlaces clicables, por ejemplo:

```txt
Ver documento
```

o:

```txt
Documento disponible
```

---

## 18. Formato de fechas

El backend usa `Instant`, por eso las fechas deben enviarse en formato ISO 8601:

```txt
2026-05-20T00:00:00.000Z
```

No enviar fechas como:

```txt
20/05/2026
2026-05-20
```

En el frontend se recomienda convertir las fechas antes de enviarlas:

```ts
new Date(`${date}T00:00:00.000Z`).toISOString()
```

---

## 19. Validaciones importantes del frontend

El frontend debe validar antes de enviar datos al backend.

### Datos personales

- No se debe poder guardar datos demográficos o de contacto si no existen datos básicos.
- Si el usuario no tiene libreta militar, se deben limpiar y deshabilitar:
  - Clase de libreta.
  - Número de libreta.
  - Distrito militar.
  - Archivo de libreta.
  - Verificación de libreta.
- No se debe permitir marcar un documento como verificado si no hay archivo cargado.
- La fecha de nacimiento no debe ser futura.

### Educación

- Si el estado del estudio es `En_proceso`, no se deben permitir:
  - Fecha de terminación de materias.
  - Fecha de grado.
- La fecha de terminación de materias no puede ser superior a la fecha de grado.
- La fecha de grado no puede ser futura.
- La fecha de certificación de idioma no puede ser futura.
- Los registros existentes deben actualizarse con `PUT`.
- Los registros nuevos deben crearse con `POST`.

### Experiencia laboral

- Si el trabajo es actual, no se debe permitir:
  - Fecha de retiro.
  - Motivo de retiro.
- La fecha de retiro no puede ser anterior a la fecha de ingreso.
- La fecha de ingreso no puede ser futura.
- El tiempo de experiencia debe ser mayor o igual a 1.
- Las horas promedio al mes deben estar dentro de un rango válido.
- No se debe permitir marcar un certificado como verificado si no hay certificado cargado.

### Gerencia pública

- Las fechas no deben ser futuras.
- En proyectos, la fecha de terminación no puede ser anterior a la fecha de inicio.
- Los campos de archivo deben validar que el documento exista antes de marcarlo como verificado, cuando aplique.

---

## 20. Reglas importantes para el frontend

### Datos personales

Antes de guardar datos demográficos o de contacto, deben existir datos básicos.

### Educación

Para agregar varios registros:

- Un registro sin `id` se crea con `POST`.
- Un registro con `id` se actualiza con `PUT`.

### Experiencia laboral

La experiencia laboral y la experiencia docente se manejan como listas.

Para actualizar un registro existente, el frontend debe enviar su identificador:

```txt
experienciaLaboralId
experienciaLaboralDocenteId
```

### Gerencia pública

El backend permite crear y consultar registros. Si se necesita edición o eliminación, hay que agregar endpoints `PUT` y `DELETE` en backend.

### Experiencia de usuario

Los mensajes visibles para usuarios finales deben ser claros y no técnicos. Evitar textos como:

```txt
backend
endpoint
POST
PUT
stack trace
```

Usar mensajes como:

```txt
No se pudo guardar la información. Revisa los campos e intenta nuevamente.
```

---

## 21. Enums importantes

Los valores enviados desde el frontend deben coincidir exactamente con los enums del backend.

### Roles

```txt
servidorPublico
jefeDeTalentoHumano
```

### Tipo de identificación

```txt
CedulaDeCiudadania
CedulaDeExtranjeria
Pasaporte
TarjetaDeIdentidad
PermisoDeProteccionTemporal
```

El backend contiene más valores disponibles en:

```txt
backend/src/main/java/com/apirest/backend/models/enums/Usuario/TipoIdentificacionUsuarios.java
```

### Género

```txt
MASCULINO
FEMENINO
```

### Estado civil

```txt
CASADO
DIVORCIADO
SEPARADO
SOLTERO
UNIONLIBRE
VIUDO
```

### Zona

```txt
URBANA
RURAL
```

### Clase libreta militar

```txt
PRIMERA_CLASE
SEGUNDA_CLASE
PROVISIONAL
```

### Estado de estudio

```txt
En_proceso
Finalizado
```

### Nivel de idioma

```txt
BIEN
MUY_BIEN
NINGUNO
REGULAR
```

### Jornada laboral

```txt
MEDIO_TIEMPO
TIEMPO_COMPLETO
TIEMPO_PARCIAL
```

### Tipo de entidad

```txt
PUBLICA
PRIVADA
PRIVADA_CON_FUNCIONES_PUBLICAS
```

---

## 22. CORS

El backend permite llamadas desde orígenes definidos en:

```txt
backend/src/main/java/com/apirest/backend/config/SecurityConfig.java
```

Configuración local esperada:

```java
configuration.setAllowedOrigins(List.of(
    "http://localhost:5173"
));
```

Si el frontend corre en otro puerto o dominio local, agrégalo a esta lista.

---


## 23. Errores comunes

### Error 401 o 403

Causas probables:

- No se envió token.
- El token expiró.
- El usuario no tiene el rol requerido.

Solución:

- Iniciar sesión otra vez.
- Revisar el encabezado `Authorization`.

### Error 409 al guardar contacto, educación o experiencia

Causa probable:

- El usuario todavía no tiene datos básicos guardados.

Solución:

- Guardar primero datos básicos.

### Error 400 al subir archivo

Causas probables:

- Cloudflare R2 no está configurado.
- Falta `CLOUDFLARE_R2_ACCOUNT_ID`.
- Falta bucket.
- El archivo supera el tamaño permitido.
- El tipo de archivo no está permitido.

Solución:

- Revisar `backend/.env`.
- Confirmar que el bucket existe.
- Confirmar que las llaves R2 tienen permisos de lectura y escritura.
- Reiniciar backend.

### Error por formato inválido

Causas probables:

- Enum enviado con valor incorrecto.
- Fecha enviada sin formato `Instant`.
- Campo obligatorio vacío.

Solución:

- Revisar DTOs en backend.
- Revisar enums en backend.
- Confirmar que el frontend envíe valores exactos.

### No se puede ver un archivo

Causas probables:

- La URL pública de R2 no está configurada.
- El objeto no existe en el bucket.
- El bucket no tiene acceso público si se intenta abrir directamente.
- La URL guardada no corresponde al archivo.

Solución:

- Confirmar `CLOUDFLARE_R2_PUBLIC_URL`.
- Confirmar que el archivo exista en el bucket.
- Usar `r2.dev` para pruebas o dominio personalizado para producción.

## 24. Comandos útiles

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Backend con limpieza

```bash
cd backend
./mvnw clean spring-boot:run
```

### Compilar backend

```bash
cd backend
./mvnw clean compile
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Compilar frontend

```bash
cd frontend
npm run build
```

### Revisar frontend

```bash
cd frontend
npm run lint
```

---

## 25. Archivos principales para revisar

### Backend

```txt
backend/pom.xml
backend/.env
backend/.env.example
backend/.gitignore
backend/src/main/resources/application.properties
backend/src/main/resources/META-INF/spring.factories
backend/src/main/java/com/apirest/backend/config/DotenvEnvironmentPostProcessor.java
backend/src/main/java/com/apirest/backend/config/SecurityConfig.java
backend/src/main/java/com/apirest/backend/controllers/AuthController.java
backend/src/main/java/com/apirest/backend/controllers/CurriculumController.java
backend/src/main/java/com/apirest/backend/controllers/CurriculumPdfController.java
backend/src/main/java/com/apirest/backend/controllers/ArchivoController.java
backend/src/main/java/com/apirest/backend/services/AuthServiceImp.java
backend/src/main/java/com/apirest/backend/services/CurriculumServiceImp.java
backend/src/main/java/com/apirest/backend/services/CurriculumPdfService.java
backend/src/main/java/com/apirest/backend/services/FileStorageService.java
backend/src/main/java/com/apirest/backend/jwts/JwtService.java
```

### Frontend

```txt
frontend/src/services/api.ts
frontend/src/types/index.ts
frontend/src/utils/curriculumValidation.ts
frontend/src/context/AuthContext.tsx
frontend/src/hooks/useAuth.ts
frontend/src/components/ProtectedRoute.tsx
frontend/src/components/common/FileUploadField.tsx
frontend/src/pages/dashboard/DashboardPage.tsx
frontend/src/pages/curriculum/DatosPersonalesPage.tsx
frontend/src/pages/curriculum/EducacionPage.tsx
frontend/src/pages/curriculum/ExperienciaPage.tsx
frontend/src/pages/curriculum/GerenciaPublicaPage.tsx
```

---

## 26. Resumen rápido para levantar el proyecto

Terminal 1:

```bash
cd backend
./mvnw spring-boot:run
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Abrir:

```txt
http://localhost:5173
```

API local:

```txt
http://localhost:8080
```

OpenAPI, si se habilita con Springdoc:

```txt
http://localhost:8080/swagger-ui/index.html
```

---

## 27. Checklist de puesta en marcha

Antes de probar el sistema completo:

- [ ] Java 21 instalado.
- [ ] Node.js 20 o superior instalado.
- [ ] MongoDB configurado.
- [ ] `backend/.env` creado.
- [ ] Variables de Cloudflare R2 configuradas.
- [ ] `frontend/.env` creado con `VITE_API_URL`.
- [ ] Backend levantado en `http://localhost:8080`.
- [ ] Frontend levantado en `http://localhost:5173`.
- [ ] CORS permite `http://localhost:5173`.
- [ ] Usuario creado.
- [ ] Login funcionando.
- [ ] Datos básicos guardados.
- [ ] Archivo de prueba subido correctamente.
- [ ] PDF de hoja de vida descargado correctamente.


