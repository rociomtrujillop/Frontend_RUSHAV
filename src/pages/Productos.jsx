import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';

const API_URL_PRODUCTOS = 'http://localhost:8080/api/productos';
const API_URL_CATEGORIAS = 'http://localhost:8080/api/categorias';
const BASE_URL = 'http://localhost:8080';

function formatearPrecio(valor) {
    const num = Number(valor);
    return isNaN(num) ? '$?' : num.toLocaleString("es-CL");
}

function getImageUrl(imgString) {
    if (!imgString) return '/img/default.jpg';
    const firstImg = imgString.split(',')[0].trim();
    if (firstImg.startsWith('/api')) return `${BASE_URL}${firstImg}`;
    return firstImg.startsWith('/') ? firstImg : `/${firstImg}`;
}

function agregarAlCarrito(producto) {
    if (!producto || typeof producto.id === 'undefined') return;
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const existente = carrito.find(p => p.id === producto.id);
    
    const imagenCorrecta = getImageUrl(producto.imagenes);

    if (existente) {
        existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
        const productoParaCarrito = {
            id: producto.id,
            nombre: producto.nombre || 'Producto',
            precio: producto.precio,
            imagen: imagenCorrecta, 
            cantidad: 1
        };
        carrito.push(productoParaCarrito);
    }
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event('cartUpdated'));
    alert("Producto añadido al carrito");
}

function Productos() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const categoriaIdParam = searchParams.get('categoriaId');
    const searchTermParam = searchParams.get('buscar');
    const generoParam = searchParams.get('genero');
    
    const [searchTermInput, setSearchTermInput] = useState(searchTermParam || '');

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [prodResponse, catResponse] = await Promise.all([
                    fetch(API_URL_PRODUCTOS),
                    fetch(API_URL_CATEGORIAS) 
                ]);
                if (!isMounted) return;
                if (!prodResponse.ok || !catResponse.ok) throw new Error('Error al cargar datos');

                const prodsData = await prodResponse.json();
                const catsData = await catResponse.json();
                
                if (isMounted) {
                    setProductos(Array.isArray(prodsData) ? prodsData : []);
                    setCategorias(Array.isArray(catsData) ? catsData : []);
                }
            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        setSearchTermInput(searchTermParam || '');
        return () => { isMounted = false; };
    }, [searchTermParam, categoriaIdParam, generoParam]); 

    const handleSelectCategoria = (categoria) => {
        const currentParams = Object.fromEntries(searchParams.entries());
        setSearchParams({ ...currentParams, categoriaId: categoria.id.toString() }, { replace: true });
    };
    
    const handleVerTodasCategorias = () => {
        const currentParams = Object.fromEntries(searchParams.entries());
        delete currentParams.categoriaId;
        setSearchParams(currentParams, { replace: true });
    };

    // --- HANDLER GÉNERO ---
    const handleSelectGenero = (genero) => {
        const currentParams = Object.fromEntries(searchParams.entries());
        if (genero) {
            setSearchParams({ ...currentParams, genero }, { replace: true });
        } else {
            delete currentParams.genero;
            setSearchParams(currentParams, { replace: true });
        }
    };

    const handleSearchChange = (event) => {
        const newSearchTerm = event.target.value;
        setSearchTermInput(newSearchTerm);
        const currentParams = Object.fromEntries(searchParams.entries());
        if (newSearchTerm) {
            setSearchParams({ ...currentParams, buscar: newSearchTerm }, { replace: true });
        } else {
            delete currentParams.buscar;
            setSearchParams(currentParams, { replace: true });
        }
    };
    
    const categoriaSeleccionadaObj = categoriaIdParam && !loading
        ? categorias.find(cat => cat.id.toString() === categoriaIdParam) : null;
        
    const productosFiltrados = productos.filter(p => {
        if (!p || typeof p !== 'object') return false;
        const matchesCategory = categoriaIdParam ? (Array.isArray(p.categorias) && p.categorias.some(cat => cat && cat.id?.toString() === categoriaIdParam)) : true;
        const matchesSearch = searchTermParam ? (p.nombre && p.nombre.toLowerCase().includes(searchTermParam.toLowerCase())) : true;
        const matchesGenero = generoParam ? (p.genero && p.genero.toLowerCase() === generoParam.toLowerCase()) : true;
        return matchesCategory && matchesSearch && matchesGenero;
    });

    if (loading && productos.length === 0) return <Container className="text-center p-5"><Spinner animation="border" variant="primary" /></Container>;
    if (error && productos.length === 0) return <Container className="p-5"><Alert variant="danger">{error}</Alert></Container>;

    let titulo = "Catálogo Completo";
    if (generoParam) titulo = `Colección ${generoParam.toUpperCase()}`;
    if (categoriaSeleccionadaObj) titulo += ` / ${categoriaSeleccionadaObj.nombre.toUpperCase()}`;

    return (
        <Container className="py-4">
            <h1 className="mb-4 text-center" style={{fontSize: '3rem'}}>{titulo}</h1>

            <Row className="mb-5 gy-4">
                <Col md={12} className="text-center">
                    <span className="me-3 fw-bold text-muted">CATEGORÍA:</span>
                    <div className="d-inline-flex flex-wrap gap-2 justify-content-center">
                        <Button variant={!categoriaIdParam ? "primary" : "outline-secondary"} size="sm" onClick={handleVerTodasCategorias}>TODAS</Button>
                        {categorias.map(cat => (
                            <Button
                                key={cat.id}
                                variant={categoriaIdParam === cat.id.toString() ? "primary" : "outline-secondary"}
                                size="sm"
                                onClick={() => handleSelectCategoria(cat)}
                            >
                                {cat.nombre}
                            </Button>
                        ))}
                    </div>
                </Col>
                <Col md={12} className="text-center">
                    <span className="me-3 fw-bold text-muted">GÉNERO:</span>
                    <div className="d-inline-flex gap-2">
                        <Button 
                            variant={!generoParam ? "primary" : "outline-secondary"} 
                            onClick={() => handleSelectGenero(null)}
                            size="sm"
                        >TODOS</Button>
                        {['hombre', 'mujer', 'unisex'].map(g => (
                            <Button 
                                key={g}
                                variant={generoParam === g ? "primary" : "outline-secondary"}
                                onClick={() => handleSelectGenero(g)}
                                size="sm"
                            >
                                {g.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                </Col>
                <Col md={12}>
                    <Form.Control 
                        type="text"
                        placeholder="BUSCAR PRODUCTO..."
                        value={searchTermInput} 
                        onChange={handleSearchChange}
                        className="form-control-lg text-center"
                        style={{border: '2px solid #000', textTransform: 'uppercase', fontWeight: 'bold'}}
                    />
                </Col>
            </Row>

            <Row className="mt-4">
                {!loading && productosFiltrados.length === 0 && (
                    <Col><Alert variant="info">No se encontraron productos.</Alert></Col>
                )}
                {productosFiltrados.map(p => (
                    <Col key={p.id} sm={6} md={4} lg={3} className="mb-4">
                        <Card className="h-100 producto-card"> 
                            <Link to={`/detalle?id=${p.id}`}>
                                <Card.Img variant="top" 
                                    src={getImageUrl(p.imagenes)}
                                    alt={p.nombre} 
                                    style={{cursor: 'pointer'}} 
                                    onError={(e) => { e.target.src = '/img/default.jpg'; }}
                                />
                            </Link>
                            <Card.Body> 
                                <Card.Title>
                                    <Link to={`/detalle?id=${p.id}`} className="text-decoration-none text-dark" title={p.nombre}>
                                        {p.nombre || 'Producto sin nombre'}
                                    </Link>
                                </Card.Title>
                                <Card.Text className="h5 text-primary">${formatearPrecio(p.precio)}</Card.Text>
                            </Card.Body>
                            <Card.Footer>                                     
                                <Button variant="primary" className="w-100" onClick={() => agregarAlCarrito(p)}>
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

export default Productos;