import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap'; 

function Contacto() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [feedback, setFeedback] = useState({ tipo: '', mensaje: '' });

  function correoValido(correo) { /* ... */ }

  const handleSubmit = (e) => { /* ... */ };

  return (
    <Container className="py-4">
      <Row className="justify-content-md-center">
        <Col md={8} lg={6}>
          <Card className="p-4 shadow-sm"> 
            <h1 className="text-center mb-4">Contacto</h1>
            <Form id="form-contacto" noValidate onSubmit={handleSubmit}>
              
              <Form.Group className="mb-3" controlId="nombre">
                <Form.Label>Nombre completo *</Form.Label>
                <Form.Control 
                  type="text" 
                  maxLength="100" 
                  required 
                  placeholder="Tu nombre completo"
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="correo">
                <Form.Label>Correo electrónico *</Form.Label>
                <Form.Control 
                  type="email" 
                  maxLength="100" 
                  required 
                  placeholder="usuario@duoc.cl"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="mensaje">
                <Form.Label>Mensaje *</Form.Label>
                <Form.Control 
                  as="textarea"
                  rows="5" 
                  maxLength="500" 
                  required 
                  placeholder="Escribe tu mensaje aquí..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
                <Form.Text className="text-muted text-end d-block">
                  {mensaje.length} / 500
                </Form.Text>
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Enviar Mensaje
              </Button>
              
              {feedback.mensaje && (
                <Alert variant={feedback.tipo === 'success' ? 'success' : 'danger'} className="mt-3">
                  {feedback.mensaje}
                </Alert>
              )}
              
            </Form>
          </Card> 
        </Col>
      </Row>
    </Container>
  );
}

export default Contacto;