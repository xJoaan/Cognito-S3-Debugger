import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import UploadFile from './components/UploadFile'; // Importar el componente UploadFile

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(null); // Para almacenar el token de Cognito

  const handleLoginSuccess = (token) => {
    setIsLoggedIn(true);
    setUserToken(token);
    console.log('Login exitoso! Token:', token);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserToken(null);
    console.log('Sesión cerrada.');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS Frontend Demo</h1>
      </header>
      <main>
        {!isLoggedIn ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div>
            <h2>¡Bienvenido!</h2>
            <p>Has iniciado sesión correctamente.</p>
            {userToken && <UploadFile userToken={userToken} />} {/* Renderizar UploadFile si hay token */}
            <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>Cerrar Sesión</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
