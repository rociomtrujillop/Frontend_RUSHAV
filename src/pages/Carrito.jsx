import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Image, Alert, CloseButton } from 'react-bootstrap';

function Carrito() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  function formatearPrecio(valor) {
    return valor.toLocaleString("es-CL");
  }

  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
    setItems(carritoGuardado);
  }, []);

  const actualizarLocalStorage = (newItems) => {
    localStorage.setItem("carrito", JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleChangeCantidad = (index, delta) => {
    const newItems = [...items];
    const itemActual = newItems[index];
    itemActual.cantidad = (itemActual.cantidad || 1) + delta;
    
    if (itemActual.cantidad <= 0) {
      newItems.splice(index, 1);
    }
    
    setItems(newItems);
    actualizarLocalStorage(newItems);
  };

  const handleEliminar = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    actualizarLocalStorage(newItems);
  };

  const handlePagar = () => {
    if (items.length === 0) {
      alert("El carrito está vacío. Agrega productos antes de pagar.");
      return;
    }
    navigate('/checkout');
  };

  const total = items.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);

  return (
    <Container className="py-4">
      <h1>Mi carrito de compras</h1>
      <Row className="mt-4">
        <Col md={8}>
          {items.length === 0 ? (
            <Alert variant="info">
              <Alert.Heading>Tu carrito está vacío :(</Alert.Heading>
              <p>Agrega productos para verlos aquí.</p>
              <hr />
              <Button as={Link} to="/productos" variant="primary">Ver productos</Button>
            </Alert>
          ) : (
            <ListGroup variant="flush">
              {items.map((p, i) => (
                <ListGroup.Item key={p.id || i} className="d-flex align-items-center">
                  <Image src={p.imagen} alt={p.nombre} thumbnail style={{ width: '80px', marginRight: '1rem' }} />
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{p.nombre}</h5>
                    <p className="mb-0 text-primary">${formatearPrecio(p.precio)} c/u</p>
                  </div>
                  <div className="carrito-cantidad mx-3">
                    <Button variant="outline-secondary" size="sm" onClick={() => handleChangeCantidad(i, -1)}>-</Button>
                    <span className="mx-2">{p.cantidad || 1}</span>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleChangeCantidad(i, 1)}>+</Button>
                  </div>
                  <CloseButton onClick={() => handleEliminar(i)} />
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        {/* Columna de Resumen */}
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Resumen</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span>${formatearPrecio(total)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between h4">
                  <strong>TOTAL</strong>
                  <strong>${formatearPrecio(total)}</strong>
                </ListGroup.Item>
              </ListGroup>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 mt-3" 
                onClick={handlePagar}
                disabled={items.length === 0}
              >
                IR A PAGAR
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Carrito;