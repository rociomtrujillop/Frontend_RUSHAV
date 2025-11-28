import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Breadcrumb } from 'react-bootstrap';

const API_URL_PRODUCTOS = 'http://localhost:8080/api/productos';
const PRECIO_MAXIMO_OFERTA = 17000;

function formatearPrecio(valor) {
    const num = Number(valor);
    return isNaN(num) ? '$?' : num.toLocaleString("es-CL");
}
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (!producto || typeof producto.id === 'undefined') return;
    const existente = carrito.find(p => p.id === producto.id);
    if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
        const productoParaCarrito = {
            id: producto.id,
            nombre: producto.nombre || 'Producto',
            precio: producto.precio,
            imagen: `/${producto.imagenes ? producto.imagenes.split(',')[0].trim() : 'img/default.jpg'}`,
            cantidad: 1
        };
        carrito.push(productoParaCarrito);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event('cartUpdated'));
    alert("Producto añadido al carrito");
}

function Ofertas() {
    const [productosEnOferta, setProductosEnOferta] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchProductos = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(API_URL_PRODUCTOS);
                if (!isMounted) return;
                if (!response.ok) throw new Error('Error al cargar productos');
                const data = await response.json();
                if (!isMounted || !Array.isArray(data)) return;

                const ofertas = data.filter(p => p && typeof p.precio === 'number' && p.precio < PRECIO_MAXIMO_OFERTA);
                console.log("Ofertas encontradas:", ofertas); 
                setProductosEnOferta(ofertas);

            } catch (err) {
                console.error("Error en fetchProductos (Ofertas):", err);
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchProductos();
        return () => { isMounted = false; };
    }, []); // Solo al montar

    if (loading) {
        return <Container className="text-center p-5"><Spinner animation="border" variant="primary" /></Container>;
    }
    if (error) {
        return <Container className="p-5"><Alert variant="danger">{error}</Alert></Container>;
    }

    return (
        <Container className="py-4">

            <h1>Productos en Oferta (Menos de ${formatearPrecio(PRECIO_MAXIMO_OFERTA)})</h1>

            <Row className="mt-4">
                {productosEnOferta.length === 0 && (
                    <Col>
                        <Alert variant="info">
                            No hay productos en oferta en este momento. ¡Vuelve pronto!
                        </Alert>
                    </Col>
                )}

                {productosEnOferta.map(p => (
                    <Col key={p.id} sm={6} md={4} lg={3} className="mb-4">
                        <Card className="h-100 producto-card"> 
                            <Link to={`/detalle?id=${p.id}`}>
                                <Card.Img 
                                    variant="top" 
                                    src={`/${p.imagenes ? p.imagenes.split(',')[0].trim() : 'img/default.jpg'}`} 
                                    alt={p.nombre || 'Producto'}
                                    style={{ cursor: 'pointer' }}
                                />
                            </Link>

                            <Card.Body> 
                                <Card.Title>
                                    <Link 
                                        to={`/detalle?id=${p.id}`} 
                                        className="text-decoration-none text-dark" 
                                        title={p.nombre || 'Ver detalle'} 
                                    >
                                        {p.nombre || 'Producto sin nombre'}
                                    </Link>
                                </Card.Title>
                                <Card.Text className="h5 text-primary">          
                                    ${formatearPrecio(p.precio)}
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer>                                     
                                <Button 
                                    variant="primary" 
                                    className="w-100" 
                                    onClick={() => agregarAlCarrito(p)}
                                >
                                    Añadir al carrito
                                </Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default Ofertas;