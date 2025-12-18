// src/components/Login.jsx
import React, { useState } from 'react';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import awsConfig from '../aws-config'; // Importar la configuración de AWS

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const client = new CognitoIdentityProviderClient({ region: awsConfig.s3.Region });
      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
        ClientId: awsConfig.cognitoUserPool.ClientId,
      });

      const response = await client.send(command);
      
      if (response.AuthenticationResult && response.AuthenticationResult.IdToken) {
        onLoginSuccess(response.AuthenticationResult.IdToken);
      } else {
        throw new Error('No se recibió token de autenticación.');
      }
    } catch (err) {
      console.error("Error durante el inicio de sesión de Cognito:", err);
      // Mapear errores comunes de Cognito a mensajes amigables
      if (err.name === 'NotAuthorizedException') {
        setError('Usuario o contraseña incorrectos.');
      } else if (err.name === 'UserNotFoundException') {
        setError('El usuario no existe.');
      } else if (err.name === 'UserNotConfirmedException') {
        setError('El usuario no ha sido confirmado. Por favor, verifica tu cuenta.');
      } else {
        setError(err.message || 'Error desconocido durante el inicio de sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Usuario:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        Asegúrate de que tus configuraciones de Cognito User Pool (UserPoolId y ClientId) y la Región sean correctas en `src/aws-config.js`.
      </p>
    </div>
  );
}

export default Login;
