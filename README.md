# Demo de Frontend con AWS Cognito y S3

Este proyecto es una aplicación de demostración construida con React (usando Vite) que ilustra cómo implementar un flujo de autenticación de usuarios con **Amazon Cognito** y cómo permitir a los usuarios autenticados subir archivos a un bucket de **Amazon S3**.

El objetivo principal es servir como una guía práctica y un recurso de depuración para desarrolladores que integran estos servicios de AWS en una aplicación de frontend.

## Características

- **Autenticación de Usuarios**: Inicio de sesión contra un **Cognito User Pool**.
- **Credenciales Temporales**: Intercambio del token de Cognito por credenciales temporales de AWS a través de un **Cognito Identity Pool**.
- **Subida de Archivos a S3**: Carga de archivos a un bucket de S3 utilizando las credenciales temporales.
- **Progreso de Carga**: Muestra el progreso de la subida del archivo en tiempo real.
- **Manejo de Errores**: Mensajes de error claros para problemas comunes de configuración y de red.

## Cómo empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### 1. Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- Un editor de código (por ejemplo, [Visual Studio Code](https://code.visualstudio.com/))
- Una cuenta de AWS activa.

### 2. Instalación

1.  Clona o descarga este repositorio en tu máquina local.
2.  Abre una terminal en el directorio raíz del proyecto.
3.  Instala las dependencias del proyecto usando npm:

    ```bash
    npm install
    ```

### 3. Configuración de AWS

Antes de poder ejecutar la aplicación, necesitas configurar tus servicios de AWS y actualizar el archivo de configuración del proyecto.

#### a. Archivo de Configuración

El archivo clave para la configuración de AWS es `src/aws-config.js`. Debes reemplazar los valores de ejemplo con los de tu propia configuración de AWS.

```javascript
// src/aws-config.js
const awsConfig = {
  cognitoUserPool: {
    UserPoolId: 'eu-west-1_MlLRSfDwx',
    ClientId: '5o91kbhujvgc27kq69jgr5btp7',
  },
  cognitoIdentityPool: {
    IdentityPoolId: 'eu-west-1:56b06eda-b2c6-4962-86e0-4321acd52d51',
  },
  s3: {
    BucketName: 'msi-twinspulse',
    Region: 'eu-west-1',
  },
};
```

#### b. Origen de la Configuración

-   **`Region`**: La región de AWS donde has creado tus servicios (ej. `us-east-1`, `eu-west-1`). **Debe ser la misma** para el User Pool, Identity Pool y el bucket de S3.
-   **`UserPoolId`**: El ID de tu **Cognito User Pool**. Lo encuentras en la consola de Cognito -> User Pools -> (tu pool) -> Pool details.
-   **`ClientId`**: El ID del **App client** de tu User Pool. Lo encuentras en Cognito -> User Pools -> (tu pool) -> App integration -> App clients. **Importante**: Asegúrate de que el App client esté configurado con el flujo `USER_PASSWORD_AUTH`.
-   **`IdentityPoolId`**: El ID de tu **Cognito Identity Pool** (también conocido como Federated Identities). Lo encuentras en Cognito -> Identity Pools -> (tu pool) -> Edit identity pool.
-   **`BucketName`**: El nombre de tu bucket de S3.

### 4. Ejecutar la Aplicación

Una vez instalado y configurado, puedes iniciar la aplicación en modo de desarrollo:

```bash
npm run dev
```

Esto iniciará un servidor de desarrollo en `http://localhost:3000`.

## Guía de Depuración (Debugging)

Aquí tienes una lista de problemas comunes y cómo solucionarlos.

### Problemas de Login (Cognito User Pool)

| Error en la App                        | Causa Probable                                                                  | Solución                                                                                                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Usuario o contraseña incorrectos.**    | Las credenciales del usuario son inválidas.                                     | Verifica que el nombre de usuario y la contraseña son correctos.                                                                                                                   |
| **El usuario no existe.**                | El usuario no está registrado en el User Pool.                                  | Asegúrate de que el usuario ha sido creado en tu Cognito User Pool.                                                                                                                 |
| **El usuario no ha sido confirmado.**    | El usuario fue creado pero no completó el proceso de verificación (ej. email).  | Confirma el usuario desde la consola de Cognito o a través del flujo de confirmación que hayas configurado.                                                                        |
| **Error de red o `Fetch failed`**        | El frontend no puede conectar con la API de Cognito.                            | Revisa tu conexión a internet. Si usas un firewall o proxy, asegúrate de que no esté bloqueando las peticiones a `cognito-idp.<region>.amazonaws.com`.                             |
| **`InvalidParameterException`**          | Parámetros incorrectos enviados a Cognito (ej. `ClientId`).                     | Confirma que el `ClientId` y `UserPoolId` en `aws-config.js` son correctos y no tienen espacios extra.                                                                             |
| **`NotAuthorizedException`** (consola) | El App Client no está autorizado para usar el flujo `USER_PASSWORD_AUTH`.         | Ve a tu User Pool -> App clients -> (tu cliente) y asegúrate de que **ALLOW_USER_PASSWORD_AUTH** esté habilitado.                                                                    |

### Problemas de Subida de Archivos (S3 y Cognito Identity Pool)

| Error en la App                                    | Causa Probable                                                                                                                                      | Solución                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Error al cargar credenciales...**                | El Identity Pool no pudo intercambiar el token del User Pool por credenciales de AWS.                                                                 | 1. **Verifica el Identity Pool**: En Cognito -> Identity Pools -> (tu pool), ve a `Authentication providers`. Asegúrate de que tu User Pool (`UserPoolId` y `ClientId`) está listado como un proveedor de autenticación. <br> 2. **Región Incorrecta**: La región en `aws-config.js` debe ser la misma para el User Pool y el Identity Pool. |
| **`Access Denied` o `AccessDenied` al subir a S3** | El rol IAM asociado con tu Identity Pool no tiene permisos para escribir (`PutObject`) en el bucket de S3.                                            | 1. **Encuentra el Rol IAM**: Ve a tu Identity Pool -> `Edit identity pool`. Fíjate en el nombre del rol para usuarios autenticados (`Authenticated role`). <br> 2. **Edita los Permisos**: Ve a la consola de IAM -> Roles -> (tu rol). <br> 3. **Añade una Política**: Adjunta una política que permita la acción `s3:PutObject` en tu bucket. Ejemplo: <br> ```json { "Effect": "Allow", "Action": "s3:PutObject", "Resource": "arn:aws:s3:::tu-bucket-name/*" } ``` |
| **Error de red o `Fetch failed` al subir**         | El navegador no puede conectar con S3.                                                                                                              | 1. **CORS en S3**: Ve a tu bucket en S3 -> `Permissions` -> `Cross-origin resource sharing (CORS)`. Añade una regla que permita las peticiones `PUT` o `POST` desde el origen de tu aplicación (`http://localhost:3000` para desarrollo). <br> ```json [ { "AllowedHeaders": ["*"], "AllowedMethods": ["PUT", "POST", "GET"], "AllowedOrigins": ["http://localhost:3000"], "ExposeHeaders": [] } ] ``` |
| **`InvalidIdentityPoolConfigurationException`**    | La configuración del Identity Pool es incorrecta o está incompleta.                                                                                 | Revisa que el `IdentityPoolId` en `aws-config.js` sea correcto. Asegúrate de que el Identity Pool tiene un rol IAM asignado para usuarios autenticados.                                                                                                                                                                                                                    |

## Tecnologías Utilizadas

-   **[React](https://reactjs.org/)**: Biblioteca de frontend para construir la interfaz de usuario.
-   **[Vite](https://vitejs.dev/)**: Herramienta de desarrollo para un inicio rápido y "Hot Module Replacement" (HMR).
-   **[AWS SDK for JavaScript v3](https://aws.amazon.com/sdk-for-javascript/)**:
    -   `@aws-sdk/client-cognito-identity-provider`: Para interactuar con Cognito User Pools.
    -   `@aws-sdk/client-cognito-identity`: Para interactuar con Cognito Identity Pools.
    -   `@aws-sdk/credential-provider-cognito-identity`: Para obtener credenciales de AWS a partir de un token de Cognito.
    -   `@aws-sdk/client-s3`: Cliente de S3.
    -   `@aws-sdk/lib-storage`: Utilidad para gestionar subidas a S3 (incluyendo subidas multiparte).
-   **[ESLint](https://eslint.org/)**: Para el "linting" y la calidad del código.