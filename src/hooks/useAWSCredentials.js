// src/hooks/useAWSCredentials.js
import { useState, useEffect } from 'react';
import { CognitoIdentityClient, GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import awsConfig from '../aws-config';

// Hook personalizado para obtener credenciales de AWS desde Cognito Identity Pool
const useAWSCredentials = (idToken) => {
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAWSCredentials = async () => {
      if (!idToken || !awsConfig.cognitoIdentityPool.IdentityPoolId || !awsConfig.s3.Region) {
        setCredentials(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Usa el proveedor de credenciales simplificado
        const provider = fromCognitoIdentityPool({
          client: new CognitoIdentityClient({ region: awsConfig.s3.Region }),
          identityPoolId: awsConfig.cognitoIdentityPool.IdentityPoolId,
          logins: {
            // El dominio de tu User Pool para el IdToken
            [`cognito-idp.${awsConfig.s3.Region}.amazonaws.com/${awsConfig.cognitoUserPool.UserPoolId}`]: idToken,
          },
        });
        
        const creds = await provider();
        setCredentials(creds);

      } catch (err) {
        console.error("Error al obtener credenciales de AWS:", err);
        setError(err.message || "No se pudieron obtener las credenciales de AWS.");
        setCredentials(null);
      } finally {
        setLoading(false);
      }
    };

    getAWSCredentials();
  }, [idToken]); // Re-ejecutar cuando idToken cambie

  return { credentials, loading, error };
};

export default useAWSCredentials;
