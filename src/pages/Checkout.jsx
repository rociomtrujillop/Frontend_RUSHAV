import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { regiones } from '../data/regiones.js'; 
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert } from 'react-bootstrap'; 

function Checkout() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [calle, setCalle] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [region, setRegion] = useState(''); 
  const [comuna, setComuna] = useState(''); 
  const [comunas, setComunas] = useState([]); 

  useEffect(() => {
    try {
        const carritoGuardado = JSON.parse(localStorage.getItem("carrito")) || [];
        setItems(carritoGuardado);
        const totalCalculado = carritoGuardado.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);
        setTotal(totalCalculado);
    } catch (e) { console.error("Error cargando carrito:", e); }

    try {
        const loggedUser = JSON.parse(localStorage.getItem("usuario"));
        
        if (loggedUser && loggedUser.id) { 
            
            if (loggedUser.nombre) { 
                setNombre(loggedUser.nombre.split(' ')[0] || ''); 
                setApellidos(loggedUser.nombre.split(' ').slice(1).join(' ') || ''); 
            }
            setEmail(loggedUser.email || '');
            
            if (loggedUser.region) {
                setRegion(loggedUser.region); 
            }
            if (loggedUser.comuna) {
                setComuna(loggedUser.comuna); 
            }
        }
    } catch (e) { console.error("Error cargando datos de usuario:", e); }
  }, []);

  useEffect(() => {
    const regionEncontrada = region ? regiones.find(r => r.nombre === region) : null;
    const comunasDeRegion = regionEncontrada ? regionEncontrada.comunas : [];
    setComunas(comunasDeRegion); 

    if (region && comunasDeRegion.length > 0) {
        const comunaIsValid = comunasDeRegion.includes(comuna);
        if (!comunaIsValid && comuna !== '') {
            setComuna('');
        }
    } else if (!region && comuna !== '') {
        setComuna(''); 
    }
  }, [region, comuna]); 
  
  const API_URL_PEDIDOS = 'http://localhost:8080/api/pedidos'; 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    
    const pedidoRequest = { 
      cliente: { nombre, apellidos, email },
      direccion: { calle, departamento, region, comuna },
      items: items.map(i => ({ 
          id: i.id, 
          cantidad: i.cantidad, 
          precio: i.precio,
          nombre: i.nombre
      })),
      total: total,
      usuarioId: usuarioGuardado ? usuarioGuardado.id : null // Enviamos ID si existe
    };

    try {
        const response = await fetch(API_URL_PEDIDOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoRequest)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData);
        }

        const pedidoCreado = await response.json(); // Recibimos la boleta real con ID
        
        localStorage.removeItem("carrito");
        // Disparamos evento para actualizar el contador del header a 0
        window.dispatchEvent(new Event('cartUpdated')); 
        
        // Pasamos el pedido real a la página de éxito
        navigate('/pago-exitoso', { state: { pedido: pedidoRequest, idBoleta: pedidoCreado.id } });

    } catch (err) {
        alert("Error al procesar la compra: " + err.message);
        navigate('/pago-error');
    }
  };

  const formatearPrecio = (valor) => valor.toLocaleString("es-CL");

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}> 
          <Card className="shadow-sm">
            <Card.Body className="p-4 p-md-5"> 
              <h1 className="text-center mb-4">Finalizar Compra</h1>
              {items.length === 0 && (
                <Alert variant="warning">
                    Tu carrito está vacío. 
                    <Alert.Link as={Link} to="/productos">Agrega productos</Alert.Link> 
                    para continuar.
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-4 mb-md-0">
                    <Card border="light" className="mb-4">
                       <Card.Header as="h5">Resumen del Carrito</Card.Header>
                       <ListGroup variant="flush">
                        {items.map(item => (
                          <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                            <span>{item.nombre} <span className="text-muted">x {item.cantidad}</span></span>
                            <strong>${formatearPrecio(item.precio * item.cantidad)}</strong>
                          </ListGroup.Item>
                        ))}
                        <ListGroup.Item className="d-flex justify-content-between align-items-center fw-bold h5">
                          <span>Total</span>
                          <span>${formatearPrecio(total)}</span>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card>
                    <h5>Información del cliente (*)</h5>
                    <Form.Group className="mb-3" controlId="nombre">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="apellidos">
                         <Form.Label>Apellidos</Form.Label>
                         <Form.Control type="text" value={apellidos} onChange={e => setApellidos(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="email">
                         <Form.Label>Correo</Form.Label>
                         <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </Form.Group>
                  </Col>
                  {/* Columna Derecha */}
                  <Col md={6}>
                    <h5>Dirección de entrega (*)</h5>
                     <Form.Group className="mb-3" controlId="calle">
                          <Form.Label>Calle y Número</Form.Label>
                          <Form.Control type="text" value={calle} onChange={e => setCalle(e.target.value)} required />
                      </Form.Group>
                     <Form.Group className="mb-3" controlId="departamento">
                          <Form.Label>Departamento (opcional)</Form.Label>
                          <Form.Control type="text" value={departamento} onChange={e => setDepartamento(e.target.value)} />
                      </Form.Group>
                     <Form.Group className="mb-3" controlId="regionCheckout">
                          <Form.Label>Región</Form.Label>
                          <Form.Select value={region} onChange={e => setRegion(e.target.value)} required>
                            <option value="">-- Seleccione región --</option>
                            {regiones.map(r => <option key={r.nombre} value={r.nombre}>{r.nombre}</option>)}
                          </Form.Select>
                      </Form.Group>
                     <Form.Group className="mb-3" controlId="comunaCheckout">
                          <Form.Label>Comuna</Form.Label>
                          <Form.Select value={comuna} onChange={e => setComuna(e.target.value)} required disabled={!region || comunas.length === 0}>
                            <option value="">-- Seleccione comuna --</option>
                            {comunas.map(c => <option key={c} value={c}>{c}</option>)}
                          </Form.Select>
                      </Form.Group>
                  </Col>
                </Row>
                {/* Botón Pagar */}
                {items.length > 0 && ( <Button type="submit" variant="primary" size="lg" className="w-100 mt-4"> Pagar ahora ${formatearPrecio(total)} </Button> )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;