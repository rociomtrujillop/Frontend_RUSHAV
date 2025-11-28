import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Form, Spinner, Alert, Card } from 'react-bootstrap';

const API_URL = 'http://localhost:8080/api/productos';

function formatearPrecio(valor) {
  const num = Number(valor);
  if (isNaN(num) || valor === null) return '$?';
  return num.toLocaleString("es-CL");
}

function agregarAlCarrito(producto, cantidad, imagenPrincipal) {
    if (!producto || typeof producto.id === 'undefined') return;
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const existente = carrito.find(p => p.id === producto.id);
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        const productoParaCarrito = {
            id: producto.id,
            nombre: producto.nombre || 'Producto',
            precio: producto.precio, 
            imagen: imagenPrincipal, 
            cantidad: cantidad
        };
        carrito.push(productoParaCarrito);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event('cartUpdated'));
    alert(`${cantidad} producto(s) añadido(s) al carrito`);
}

function Detalle() {
  const [searchParams] = useSearchParams();
  const productoId = searchParams.get('id');
  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true); 
    setError(null); 
    setCurrentImgIndex(0); 

    const fetchProducto = async () => {
      try {
        const response = await fetch(`${API_URL}/${productoId}`);
        if (!isMounted) return;
        if (!response.ok) throw new Error(`Producto no encontrado`);
        const data = await response.json();
        if (isMounted) setProducto(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (productoId) fetchProducto();
    return () => { isMounted = false; };
  }, [productoId]);

  useEffect(() => {
    if (!producto || !producto.genero) return;
    const fetchRelacionados = async () => {
      try {
        const response = await fetch(`${API_URL}/genero/${producto.genero}`);
        if (!response.ok) return;
        let data = await response.json();
        if (Array.isArray(data)) {
           setRelacionados(data.filter(p => p.id !== producto.id).slice(0, 4));
        }
      } catch (err) { console.error(err); }
    };
    fetchRelacionados();
  }, [producto]);

  // --- LÓGICA DE FLECHAS ---
  const imagenesArray = producto && producto.imagenes ? producto.imagenes.split(',') : [];
  const imagenActual = imagenesArray.length > 0 ? `/${imagenesArray[currentImgIndex].trim()}` : '/img/default.jpg';

  const handleNext = () => {
    setCurrentImgIndex((prev) => (prev + 1) % imagenesArray.length);
  };

  const handlePrev = () => {
    setCurrentImgIndex((prev) => (prev - 1 + imagenesArray.length) % imagenesArray.length);
  };

  if (loading) return <Container className="text-center p-5"><Spinner animation="border" variant="primary" /></Container>;
  if (error || !producto) return <Container className="p-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container id="detalle" className="py-4">
      <Row>
        <Col md={6} className="mb-3 mb-md-0">
          
          <div className="main-image-container mb-3">
            {imagenesArray.length > 1 && (
                <div className="nav-arrow nav-prev" onClick={handlePrev}>&#10094;</div>
            )}
            
            <Image 
              src={imagenActual} 
              alt={producto.nombre} 
              fluid 
              style={{ width: '100%', display: 'block' }}
            />
            
            {imagenesArray.length > 1 && (
                <div className="nav-arrow nav-next" onClick={handleNext}>&#10095;</div>
            )}
          </div>

          <div className="miniaturas d-flex flex-wrap gap-2 justify-content-center">
            {imagenesArray.map((img, index) => (
              <Image 
                key={index}
                src={`/${img.trim()}`} 
                thumbnail 
                onClick={() => setCurrentImgIndex(index)}
                className={index === currentImgIndex ? 'activa' : ''} 
                style={{ width: '80px', height: '80px' }} 
              />
            ))}
          </div>
        </Col>
        
        <Col md={6}>
          <h1>{producto.nombre}</h1>
          <p className="display-5 text-primary fw-bold">
            ${formatearPrecio(producto.precio)}
          </p>
          <p className="fs-5">{producto.descripcion}</p>
          
          <Form.Group as={Row} className="align-items-center my-4">
            <Form.Label column sm="auto">CANTIDAD:</Form.Label>
            <Col sm="3">
              <Form.Control 
                type="number" value={cantidad} min="1"
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </Col>
          </Form.Group>
          
          <Button variant="primary" size="lg" className="w-100" onClick={() => agregarAlCarrito(producto, cantidad, imagenActual)}>
            AÑADIR AL CARRITO
          </Button>
        </Col>
      </Row>

      <div className="mt-5">
        <h3>PRODUCTOS RELACIONADOS</h3>
        <Row className="mt-3">
          {relacionados.map(p => (
              <Col key={p.id} sm={6} md={3} className="mb-4">
                <Card className="h-100 producto-card"> 
                  <Link to={`/detalle?id=${p.id}`}>
                      <Card.Img variant="top" src={`/${p.imagenes ? p.imagenes.split(',')[0].trim() : 'img/default.jpg'}`} />
                  </Link>
                  <Card.Body>
                    <Card.Title><Link to={`/detalle?id=${p.id}`} className="text-dark">{p.nombre}</Link></Card.Title>
                    <Card.Text className="h5 text-primary">${formatearPrecio(p.precio)}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      </div>
    </Container>
  );
}

export default Detalle;