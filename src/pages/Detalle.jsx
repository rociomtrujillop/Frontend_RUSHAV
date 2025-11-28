import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Form, Spinner, Alert, Card } from 'react-bootstrap';

const API_URL = 'http://localhost:8080/api/productos';
const BASE_URL = 'http://localhost:8080';

function getImageUrl(imgString) {
    if (!imgString) return '/img/default.jpg';
    const firstImg = imgString.split(',')[0].trim();
    if (firstImg.startsWith('/api')) return `${BASE_URL}${firstImg}`;
    return firstImg.startsWith('/') ? firstImg : `/${firstImg}`;
}
function getImageUrlByIndex(imgString, index) {
    if (!imgString) return '/img/default.jpg';
    const images = imgString.split(',');
    const targetImg = images[index] ? images[index].trim() : images[0].trim();
    
    if (targetImg.startsWith('/api')) return `${BASE_URL}${targetImg}`;
    return targetImg.startsWith('/') ? targetImg : `/${targetImg}`;
}

function formatearPrecio(valor) {
  const num = Number(valor);
  return isNaN(num) ? '$?' : num.toLocaleString("es-CL");
}

function agregarAlCarrito(producto, cantidad, imagenPrincipal) {
    if (!producto) return;
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const existente = carrito.find(p => p.id === producto.id);
    
    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: imagenPrincipal, 
            cantidad: cantidad
        });
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event('cartUpdated'));
    alert("Producto añadido al carrito");
}

function Detalle() {
  const [searchParams] = useSearchParams();
  const productoId = searchParams.get('id');
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [relacionados, setRelacionados] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/${productoId}`)
      .then(res => {
        if (!res.ok) throw new Error("Producto no encontrado");
        return res.json();
      })
      .then(data => {
        setProducto(data);
        setCurrentImgIndex(0); 
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [productoId]);

  useEffect(() => {
      if (!producto || !producto.genero) return;
      fetch(`${API_URL}/genero/${producto.genero}`)
          .then(res => res.ok ? res.json() : [])
          .then(data => {
              if (Array.isArray(data)) setRelacionados(data.filter(p => p.id !== producto.id).slice(0,4));
          });
  }, [producto]);

  if (loading) return <Container className="p-5 text-center"><Spinner animation="border" /></Container>;
  if (error || !producto) return <Container className="p-5"><Alert variant="danger">{error}</Alert></Container>;

  const imagenesArray = producto.imagenes ? producto.imagenes.split(',') : [];
  const imagenActual = getImageUrlByIndex(producto.imagenes, currentImgIndex);

  return (
    <Container id="detalle" className="py-4">
      <Row>
        <Col md={6} className="mb-3">
          <div className="main-image-container mb-3">
            {imagenesArray.length > 1 && (
                <div className="nav-arrow nav-prev" onClick={() => setCurrentImgIndex((prev) => (prev - 1 + imagenesArray.length) % imagenesArray.length)}>&#10094;</div>
            )}
            
            <Image 
                src={imagenActual} 
                alt={producto.nombre} 
                fluid 
                style={{width:'100%', maxHeight:'500px', objectFit:'contain'}} 
                onError={(e) => { e.target.src = '/img/default.jpg'; }}
            />
            
            {imagenesArray.length > 1 && (
                <div className="nav-arrow nav-next" onClick={() => setCurrentImgIndex((prev) => (prev + 1) % imagenesArray.length)}>&#10095;</div>
            )}
          </div>

          <div className="miniaturas d-flex flex-wrap gap-2 justify-content-center">
            {imagenesArray.map((img, index) => {
              const thumbUrl = img.trim().startsWith('/api') ? `${BASE_URL}${img.trim()}` : (img.trim().startsWith('/') ? img.trim() : `/${img.trim()}`);
              
              return (
                <Image 
                    key={index}
                    src={thumbUrl} 
                    thumbnail 
                    onClick={() => setCurrentImgIndex(index)}
                    className={index === currentImgIndex ? 'activa' : ''} 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }} 
                />
              );
            })}
          </div>
        </Col>
        
        <Col md={6}>
          <h1>{producto.nombre}</h1>
          <p className="display-5 text-primary fw-bold">${formatearPrecio(producto.precio)}</p>
          <p className="fs-5">{producto.descripcion}</p>
          
          <Form.Group as={Row} className="align-items-center my-4">
            <Form.Label column sm="auto">CANTIDAD:</Form.Label>
            <Col sm="3">
              <Form.Control type="number" value={cantidad} min="1" onChange={(e) => setCantidad(Number(e.target.value))} />
            </Col>
          </Form.Group>
          
          <Button variant="primary" size="lg" className="w-100" onClick={() => agregarAlCarrito(producto, cantidad, imagenActual)}>
            AÑADIR AL CARRITO
          </Button>
        </Col>
      </Row>
      
      {relacionados.length > 0 && (
          <div className="mt-5">
              <h3>También te podría gustar</h3>
              <Row>
                  {relacionados.map(p => (
                      <Col key={p.id} sm={6} md={3} className="mb-4">
                          <Card className="h-100 producto-card">
                              <Link to={`/detalle?id=${p.id}`}>
                                  <Card.Img variant="top" src={getImageUrl(p.imagenes)} />
                              </Link>
                              <Card.Body>
                                  <Card.Title>{p.nombre}</Card.Title>
                                  <Card.Text className="text-primary fw-bold">${formatearPrecio(p.precio)}</Card.Text>
                              </Card.Body>
                          </Card>
                      </Col>
                  ))}
              </Row>
          </div>
      )}
    </Container>
  );
}

export default Detalle;