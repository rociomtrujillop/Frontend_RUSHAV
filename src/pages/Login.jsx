import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext'; 

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!correo || !password) {
      setError('Por favor, ingresa correo y contraseña.');
      return;
    }

    try {
      const loggedUser = await login(correo, password);
      
      alert(`¡Bienvenido, ${loggedUser.nombre}!`);
      
      if (loggedUser.rol === 'admin' || loggedUser.rol === 'super-admin') { 
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-md-center">
        <Col md={8} lg={5}>
          <Card className="p-4 shadow-sm">
            <h1 className="text-center mb-4">Iniciar Sesión</h1>
            <Form id="form-login" noValidate onSubmit={handleSubmit}>
              
              <Form.Group className="mb-3" controlId="correo">
                <Form.Label>Correo electrónico *</Form.Label>
                <Form.Control
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="email" 
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Contraseña *</Form.Label>
                <Form.Control
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password" 
                />
              </Form.Group>
              
              <Button variant="primary" type="submit" className="w-100">
                Ingresar
              </Button>
              
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;