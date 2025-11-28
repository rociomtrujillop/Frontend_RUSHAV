import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Button } from 'react-bootstrap'; 

function PagoExitoso() {
  const location = useLocation();
  const { pedido, idBoleta } = location.state || {};

  if (!pedido) {
    return (
      <Container className="text-center py-5">
        <h1>Pago realizado</h1>
        <p>Tu compra ha sido procesada.</p>
        <Button as={Link} to="/" variant="primary">Volver al inicio</Button>
      </Container>
    );
  }

  const formatearPrecio = (valor) => valor.toLocaleString("es-CL");

  return (
    <Container className="py-5" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-4">
        <h1 className="text-success">Pago Exitoso</h1>
        <p className="lead">¡Gracias por tu compra, {pedido.cliente.nombre}!</p>
        <p><strong>Nro. de Pedido: #{idBoleta}</strong></p>
      </div>
      
      <Card className="shadow-sm">
        <Card.Header as="h4">Resumen de la Compra</Card.Header>
        <Card.Body>
            <ListGroup variant="flush">
                {pedido.items.map((item, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                        <span className="fw-bold">{item.nombre}</span>
                        <span className="text-muted ms-2">x {item.cantidad}</span>
                    </div>
                    <strong>${formatearPrecio(item.precio * item.cantidad)}</strong>
                </ListGroup.Item>
                ))}
            </ListGroup>
            
            <hr />
            <hr />
            
            <div className="text-end mb-4">
                <div className="d-flex justify-content-between">
                    <span>Monto Neto:</span>
                    <span>${formatearPrecio(pedido.neto || Math.round(pedido.total / 1.19))}</span>
                </div>
                <div className="d-flex justify-content-between">
                    <span>IVA (19%):</span>
                    <span>${formatearPrecio(pedido.iva || (pedido.total - Math.round(pedido.total / 1.19)))}</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                    <h4>Total a Pagar:</h4>
                    <h4 className="text-primary">${formatearPrecio(pedido.total)}</h4>
                </div>
            </div>
                        
            <h5>Dirección de Envío:</h5>
            <p className="text-muted">
            {pedido.direccion.calle}, {pedido.direccion.departamento && `Dpto. ${pedido.direccion.departamento}, `}
            {pedido.direccion.comuna}, {pedido.direccion.region}
            </p>
        </Card.Body>
        <Card.Footer className="text-center">
            <Button as={Link} to="/productos" variant="primary" size="lg">
                Seguir comprando
            </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default PagoExitoso;