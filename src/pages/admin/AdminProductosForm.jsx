import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, Row, Col, Spinner, Alert, Image, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const API_URL_PRODUCTOS = '/api/productos';
const API_URL_CATEGORIAS = '/api/categorias/todas';
const API_URL_ARCHIVOS_SUBIR = '/api/archivos/subir';

function AdminProductosForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const { fetchProtegido, fetchProtegidoArchivo } = useAuth(); 

    const [producto, setProducto] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        genero: 'unisex',
        imagenes: '',
        activo: true,
        categorias: []
    });
    const [allCategorias, setAllCategorias] = useState([]);
    const [selectedCategorias, setSelectedCategorias] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);   
    const [loadingCats, setLoadingCats] = useState(true); 
    const [errorCats, setErrorCats] = useState(null);   
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null); 

    useEffect(() => {
      const loadCategorias = async () => {
        setLoadingCats(true);
        setErrorCats(null);
        try {
          const data = await fetchProtegido(API_URL_CATEGORIAS);
          setAllCategorias(Array.isArray(data) ? data : []);
        } catch (err) {
          setErrorCats(err.message);
        } finally {
          setLoadingCats(false);
        }
      };
      loadCategorias();
    }, [fetchProtegido]);

    useEffect(() => {
        if (isEditing && !loadingCats) {
            setLoading(true);
            const loadProducto = async () => {
                try {
                    const data = await fetchProtegido(`${API_URL_PRODUCTOS}/${id}`);
                    setProducto({
                        ...data,
                        precio: data.precio.toString(),
                        stock: data.stock.toString()
                    });
                    const catIds = new Set(data.categorias.map(cat => cat.id));
                    setSelectedCategorias(catIds);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            loadProducto();
        }
    }, [isEditing, id, loadingCats, fetchProtegido]);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setProducto(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleCategoriaChange = (categoriaId) => {
        setSelectedCategorias(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoriaId)) {
                newSet.delete(categoriaId);
            } else {
                newSet.add(categoriaId);
            }
            return newSet;
        });
    };

    // --- handleFileChange (CORREGIDO) ---
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append('archivo', file); 

        try {
            // 1. fetchProtegidoArchivo ahora devuelve la URL como TEXTO PLANO
            const newImageUrl = await fetchProtegidoArchivo(API_URL_ARCHIVOS_SUBIR, {
                method: 'POST',
                body: formData,
            });
            
            // 2. newImageUrl ES el string de la URL. Ya no usamos ".url"
            
            // 3. Validamos que la URL no esté vacía
            if (!newImageUrl || typeof newImageUrl !== 'string' || newImageUrl.trim() === "") {
                throw new Error("El servidor no devolvió una URL de imagen válida.");
            }

            setProducto(prev => ({
                ...prev,
                // 4. Concatenamos el string de la URL
                imagenes: prev.imagenes ? `${prev.imagenes},${newImageUrl}` : newImageUrl
            }));
        } catch (err) {
            setUploadError("Error al subir imagen: " + err.message);
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    // (handleRemoveImage - sin cambios)
    const handleRemoveImage = (urlToRemove) => {
        setProducto(prev => ({
            ...prev,
            imagenes: prev.imagenes.split(',').filter(url => url !== urlToRemove).join(',')
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!producto.nombre.trim()) { setError("El nombre es obligatorio."); return; }
        if (producto.stock === '' || producto.stock === null) {
            setError("El stock es obligatorio."); return;
        }
        const stockNum = parseInt(producto.stock, 10);
        if (isNaN(stockNum) || stockNum < 0) { 
            setError("El stock debe ser un número igual o mayor a 0."); return;
        }
        if (producto.precio === '' || producto.precio === null) {
            setError("El precio es obligatorio."); return;
        }
        const precioNum = parseInt(producto.precio, 10);
        if (isNaN(precioNum) || precioNum <= 0) { 
            setError("El precio debe ser un número mayor a 0."); return;
        }
        if (!producto.imagenes || producto.imagenes.trim() === "") { 
            setError("Debe subir al menos una imagen."); return; 
        }
        if (selectedCategorias.size === 0) { 
            setError("Debe seleccionar al menos una categoría."); return; 
        }
        
        setLoading(true);
        const categoriasParaEnviar = allCategorias.filter(cat => selectedCategorias.has(cat.id));
        const productoParaEnviar = {
            ...producto,
            precio: precioNum,
            stock: stockNum,
            categorias: categoriasParaEnviar 
        };
        const url = isEditing ? `${API_URL_PRODUCTOS}/${id}` : API_URL_PRODUCTOS;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            await fetchProtegido(url, {
                method: method,
                body: JSON.stringify(productoParaEnviar)
            });
            alert(`Producto ${isEditing ? 'actualizado' : 'creado'} con éxito`);
            navigate('/admin/productos');
        } catch (err) {
             setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // (JSX - sin cambios)
    const currentImageUrls = producto.imagenes ? producto.imagenes.split(',').filter(url => url) : [];
    if (loadingCats || (isEditing && loading && !producto.nombre)) { return <Spinner animation="border" />; }
    if (errorCats) { return <Alert variant="danger">Error al cargar categorías: {errorCats}</Alert>; }

    return (
        <Container>
            <div className="admin-container">
            <Row className="justify-content-center">
                <Col md={10}>
                    <Card className="p-4">
                        <Card.Title as="h2">{isEditing ? 'Editar Producto' : 'Crear Producto'}</Card.Title>
                        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>} 
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3" controlId="nombre">
                                        <Form.Label>Nombre (*)</Form.Label>
                                        <Form.Control type="text" name="nombre" value={producto.nombre} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3" controlId="genero">
                                        <Form.Label>Género</Form.Label>
                                        <Form.Select name="genero" value={producto.genero} onChange={handleChange}>
                                            <option value="unisex">Unisex</option>
                                            <option value="hombre">Hombre</option>
                                            <option value="mujer">Mujer</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3" controlId="descripcion">
                                <Form.Label>Descripción (*)</Form.Label>
                                <Form.Control as="textarea" rows={3} name="descripcion" value={producto.descripcion} onChange={handleChange} required />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="precio">
                                        <Form.Label>Precio (*)</Form.Label>
                                        <Form.Control type="number" name="precio" value={producto.precio} onChange={handleChange} required min="1" placeholder="Ej: 10000" /> 
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="stock">
                                        <Form.Label>Stock (*)</Form.Label>
                                        <Form.Control type="number" name="stock" value={producto.stock} onChange={handleChange} required min="0" placeholder="Ej: 50" />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3" controlId="imagenUpload">
                                <Form.Label>Subir Imágenes (*)</Form.Label>
                                <Form.Control type="file" onChange={handleFileChange} disabled={uploading} accept="image/*" />
                                {uploading && <Spinner animation="border" size="sm" className="mt-2" />}
                                {uploadError && <Alert variant="danger" className="mt-2">{uploadError}</Alert>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Imágenes Actuales</Form.Label>
                                <div className="d-flex flex-wrap gap-2 p-2 border rounded" style={{ minHeight: '80px' }}>
                                    {currentImageUrls.length === 0 ? (
                                        <small className="text-muted">No hay imágenes subidas.</small>
                                    ) : (
                                        currentImageUrls.map(url => (
                                            <div key={url} className="position-relative">
                                                <Image src={url} alt="Imagen producto" thumbnail style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                                <Button 
                                                    variant="danger" size="sm" className="position-absolute top-0 end-0" 
                                                    onClick={() => handleRemoveImage(url)}
                                                    style={{ lineHeight: '0.8', padding: '0.2rem 0.4rem' }}
                                                >
                                                    &times;
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Categorías (*)</Form.Label>
                                <div className="d-flex flex-wrap gap-2 p-2 border rounded">
                                    {allCategorias.map(cat => (
                                        <Form.Check 
                                            key={cat.id} type="checkbox" id={`cat-${cat.id}`} label={cat.nombre}
                                            checked={selectedCategorias.has(cat.id)}
                                            onChange={() => handleCategoriaChange(cat.id)}
                                        />
                                    ))}
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="activo">
                                <Form.Check type="checkbox" name="activo" label="Producto Activo" checked={producto.activo} onChange={handleChange} />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={loading || uploading || loadingCats}>
                                {loading ? <Spinner as="span" size="sm" /> : (isEditing ? 'Actualizar Producto' : 'Crear Producto')}
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
            </div>
        </Container>
    );
}

export default AdminProductosForm;