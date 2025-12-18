// src/aws-config.js

// IMPORTANTE:
// Reemplaza los valores de marcador de posición (PLACEHOLDER_...)
// con la configuración real de tu AWS Cognito y S3.

const awsConfig = {
  // Configuración de Cognito User Pool
  cognitoUserPool: {
    UserPoolId: '', // Ejemplo: 'us-east-1_abcdefgh'
    ClientId: '', // Ejemplo: 'abcdefghijklmnopqrstuvw'
  },
  // Configuración de Cognito Identity Pool (Federated Identities)
  cognitoIdentityPool: {
    IdentityPoolId: '', // Ejemplo: 'us-east-1:12345678-abcd-efgh-ijkl-mnopqrstuvwx'
  },
  // Configuración de S3
  s3: {
    BucketName: '', // Ejemplo: 'my-frontend-upload-bucket'
    Region: '', // Asegúrate de que sea la misma región que tu User Pool y Identity Pool
  },
};

export default awsConfig;
