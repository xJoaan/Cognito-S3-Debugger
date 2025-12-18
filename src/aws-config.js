// src/aws-config.js

// IMPORTANTE:
// Reemplaza los valores de marcador de posición (PLACEHOLDER_...)
// con la configuración real de tu AWS Cognito y S3.

const awsConfig = {
  // Configuración de Cognito User Pool
  cognitoUserPool: {
    UserPoolId: 'eu-west-1_MlLRSfDwx', // Ejemplo: 'us-east-1_abcdefgh'
    ClientId: '5o91kbhujvgc27kq69jgr5btp7', // Ejemplo: 'abcdefghijklmnopqrstuvw'
  },
  // Configuración de Cognito Identity Pool (Federated Identities)
  cognitoIdentityPool: {
    IdentityPoolId: 'eu-west-1:56b06eda-b2c6-4962-86e0-4321acd52d51', // Ejemplo: 'us-east-1:12345678-abcd-efgh-ijkl-mnopqrstuvwx'
  },
  // Configuración de S3
  s3: {
    BucketName: 'msi-twinspulse', // Ejemplo: 'my-frontend-upload-bucket'
    Region: 'eu-west-1', // Asegúrate de que sea la misma región que tu User Pool y Identity Pool
  },
};

export default awsConfig;
