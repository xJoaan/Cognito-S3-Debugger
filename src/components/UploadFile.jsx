import React, { useState } from 'react';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from "@aws-sdk/lib-storage";
import useAWSCredentials from '../hooks/useAWSCredentials'; // Importar el hook
import awsConfig from '../aws-config'; // Importar la configuración de AWS

function UploadFile({ userToken }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [error, setError] = useState('');

  const { credentials, loading: credentialsLoading, error: credentialsError } = useAWSCredentials(userToken);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage('');
      setError('');
      setUploadProgress(0);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo primero.');
      return;
    }

    if (!credentials) {
      setError('Credenciales de AWS no disponibles. Por favor, inicia sesión de nuevo o revisa tu configuración.');
      return;
    }

    setUploading(true);
    setUploadMessage('');
    setError('');
    setUploadProgress(0);

    try {
      const s3Client = new S3Client({
        region: awsConfig.s3.Region,
        credentials,
      });

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: awsConfig.s3.BucketName,
          Key: selectedFile.name,
          Body: selectedFile,
          ContentType: selectedFile.type,
        },
      });

      upload.on("httpUploadProgress", (progress) => {
        if (progress.total) {
          const percentage = Math.round((progress.loaded / progress.total) * 100);
          setUploadProgress(percentage);
        }
      });

      await upload.done();

      setUploadMessage(`¡Archivo "${selectedFile.name}" subido con éxito a S3!`);
      setSelectedFile(null); // Limpiar el archivo seleccionado
    } catch (err) {
      console.error("Error al subir archivo a S3:", err);
      setError(err.message || 'Error al subir el archivo a S3.');
    } finally {
      setUploading(false);
    }
  };

  if (credentialsLoading) {
    return <p style={{ marginTop: '30px' }}>Obteniendo credenciales de AWS...</p>;
  }

  if (credentialsError) {
    return <p style={{ color: 'red', marginTop: '30px' }}>Error al cargar credenciales: {credentialsError}</p>;
  }

  return (
    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h3>Subir archivo a S3</h3>
      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        {selectedFile && <p>Archivo seleccionado: <strong>{selectedFile.name}</strong></p>}
      </div>
      {uploading && (
        <div style={{ marginBottom: '15px' }}>
          <p>Subiendo: {uploadProgress}%</p>
          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '20px',
                backgroundColor: '#007bff',
                borderRadius: '4px',
                transition: 'width 0.2s',
              }}
            ></div>
          </div>
        </div>
      )}
      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}
      {uploadMessage && <p style={{ color: 'green', marginBottom: '15px' }}>{uploadMessage}</p>}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading || credentialsLoading || !!credentialsError}
        style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
      >
        {uploading ? 'Subiendo...' : 'Subir a S3'}
      </button>
      <p style={{ marginTop: '20px', fontSize: '0.8em', color: '#888' }}>
        Asegúrate de que tus configuraciones de Cognito Identity Pool y S3 sean correctas en `src/aws-config.js`.
      </p>
    </div>
  );
}

export default UploadFile;
