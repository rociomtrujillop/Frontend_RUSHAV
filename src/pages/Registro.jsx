import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { regiones } from "../data/regiones.js";
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';

const API_URL = 'http://localhost:8080/api/usuarios';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [correo2, setCorreo2] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [comunas, setComunas] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const regionEncontrada = regiones.find(r => r.nombre === region);
    setComunas(regionEncontrada ? regionEncontrada.comunas : []);
    setComuna('');
  }, [region]);

  function correoValido(correo) {
    const regex = /^[\w.-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;
    return regex.test(correo);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (correo.trim().toLowerCase() !== correo2.trim().toLowerCase()) {
      setError("Los correos no coinciden");
      return;
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!correoValido(correo)) {
      setError("Correo no válido (solo duoc.cl, profesor.duoc.cl o gmail.com)");
      return;
    }

    if (!region || !comuna) {
        setError("Debes seleccionar una región y comuna.");
        return;
    }

    const nuevoUsuario = {
      nombre: nombre.trim(),
      email: correo.trim().toLowerCase(),
      password: password,
      rol: "cliente",
      region: region,
      comuna: comuna
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al registrar el usuario.');
      }
      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      navigate("/login"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-md-center">
        <Col md={8} lg={6}>
          <Card className="p-4 shadow-sm">
            <h1 className="text-center mb-4">Registro</h1>
            <Form id="registro-form" onSubmit={handleSubmit}>
              
              <Form.Group className="mb-3" controlId="nombre-completo">
                <Form.Label>Nombre completo *</Form.Label>
                <Form.Control 
                  type="text" 
                  maxLength="100" 
                  required 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="correo">
                    <Form.Label>Correo *</Form.Label>
                    <Form.Control 
                      type="email" 
                      maxLength="100" 
                      required 
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="correo2">
                    <Form.Label>Repetir correo *</Form.Label>
                    <Form.Control 
                      type="email" 
                      maxLength="100" 
                      required 
                      value={correo2}
                      onChange={(e) => setCorreo2(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Contraseña *</Form.Label>
                    <Form.Control
                      type="password"
                      minLength="4"
                      maxLength="10"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="password2">
                    <Form.Label>Repetir contraseña *</Form.Label>
                    <Form.Control 
                      type="password" 
                      minLength="4" 
                      maxLength="10" 
                      required 
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="region">
                    <Form.Label>Región *</Form.Label>
                    <Form.Select 
                      required
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      <option value="">-- Seleccione región --</option>
                      {regiones.map(r => (
                        <option key={r.nombre} value={r.nombre}>{r.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="comuna">
                    <Form.Label>Comuna *</Form.Label>
                    <Form.Select 
                      required
                      value={comuna}
                      onChange={(e) => setComuna(e.target.value)}
                      disabled={comunas.length === 0}
                    >
                      <option value="">-- Seleccione comuna --</option>
                      {comunas.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Button variant="primary" type="submit" className="w-100 mt-3">
                Registrar
              </Button>
              
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Registro;