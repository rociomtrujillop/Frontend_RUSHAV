import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, Row, Col, Spinner, Alert, Image } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const API_URL_PRODUCTOS = '/api/productos';
const API_URL_CATEGORIAS = '/api/categorias/todas';
const API_URL_ARCHIVOS_SUBIR = '/api/archivos/subir';

// URL BASE DEL BACKEND (Asegúrate que coincida con tu puerto Java)
const BASE_URL = 'http://localhost:8080';

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

    // --- Efecto Cargar Categorías ---
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

    // --- Efecto Cargar Producto (Edición) ---
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
                    // Setea categorías seleccionadas
                    if (Array.isArray(data.categorias)) {
                        const catIds = new Set(data.categorias.map(cat => cat.id));
                        setSelectedCategorias(catIds);
                    }
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
            if (newSet.has(categoriaId)) newSet.delete(categoriaId);
            else newSet.add(categoriaId);
            return newSet;
        });
    };

    // --- HANDLE FILE CHANGE (LÓGICA BLINDADA) ---
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append('archivo', file); 

        try {
            // 1. Subimos el archivo y obtenemos la respuesta cruda (texto)
            const responseText = await fetchProtegidoArchivo(API_URL_ARCHIVOS_SUBIR, {
                method: 'POST',
                body: formData,
            });
            
            console.log("Respuesta SUBIDA:", responseText); // Para depuración

            let cleanUrl = "";

            // 2. INTENTAMOS PARSEAR EL JSON
            // Tu backend devuelve: {"nombreArchivo":"...","urlArchivo":"...","mensaje":"..."}
            try {
                const json = JSON.parse(responseText);
                
                // Buscamos la propiedad correcta
                if (json.urlArchivo) cleanUrl = json.urlArchivo;
                else if (json.url) cleanUrl = json.url;

            } catch (e) {
                // Si falla el parseo, asumimos que el backend envió solo texto
                cleanUrl = responseText;
            }

            // 3. VALIDACIÓN DE SEGURIDAD
            // Si la "URL" todavía tiene llaves o comillas, es basura. No la usamos.
            if (cleanUrl.includes("{") || cleanUrl.includes("}") || cleanUrl.includes('"')) {
                console.error("Error: La URL extraída sigue sucia:", cleanUrl);
                throw new Error("El servidor devolvió datos inválidos. Intenta de nuevo.");
            }

            // 4. GUARDAMOS LA URL LIMPIA
            // Si ya hay imágenes, agregamos una coma. Si no, ponemos la nueva.
            const nuevaListaImagenes = producto.imagenes 
                ? `${producto.imagenes},${cleanUrl}` 
                : cleanUrl;

            setProducto(prev => ({
                ...prev,
                imagenes: nuevaListaImagenes
            }));

        } catch (err) {
            console.error(err);
            setUploadError("Error al subir: " + err.message);
        } finally {
            setUploading(false);
            event.target.value = null; // Limpia el input
        }
    };

    const handleRemoveImage = (urlToRemove) => {
        setProducto(prev => ({
            ...prev,
            imagenes: prev.imagenes.split(',').filter(url => url !== urlToRemove).join(',')
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validaciones
        if (!producto.nombre.trim()) { setError("El nombre es obligatorio."); return; }
        if (!producto.stock && producto.stock !== 0) { setError("El stock es obligatorio."); return; }
        if (!producto.precio) { setError("El precio es obligatorio."); return; }
        if (!producto.imagenes) { setError("Debe subir al menos una imagen."); return; }
        if (selectedCategorias.size === 0) { setError("Debe seleccionar al menos una categoría."); return; }
        
        setLoading(true);
        const categoriasParaEnviar = allCategorias.filter(cat => selectedCategorias.has(cat.id));
        const productoParaEnviar = {
            ...producto,
            precio: parseInt(producto.precio, 10),
            stock: parseInt(producto.stock, 10),
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

    const currentImageUrls = producto.imagenes ? producto.imagenes.split(',').filter(url => url && url.trim() !== "") : [];

    if (loadingCats || (isEditing && loading && !producto.nombre)) { return <Spinner animation="border" variant="primary" />; }
    if (errorCats) { return <Alert variant="danger">Error al cargar categorías: {errorCats}</Alert>; }

    return (
        <Container>
          <div className="admin-container">
            <h2 className="mb-4">{isEditing ? 'Editar Producto' : 'Crear Producto'}</h2>
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
                            <Form.Control type="number" name="precio" value={producto.precio} onChange={handleChange} required min="1" /> 
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="stock">
                            <Form.Label>Stock (*)</Form.Label>
                            <Form.Control type="number" name="stock" value={producto.stock} onChange={handleChange} required min="0" />
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
                    <div className="d-flex flex-wrap gap-2 p-2 border rounded" style={{ minHeight: '80px', backgroundColor: '#f9f9f9' }}>
                        {currentImageUrls.length === 0 ? (
                            <small className="text-muted">No hay imágenes subidas.</small>
                        ) : (
                            currentImageUrls.map((url, index) => {
                                // --- VISUALIZACIÓN SEGURA ---
                                // Si la URL es relativa (/api...), le pegamos el dominio
                                const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
                                
                                return (
                                    <div key={index} className="position-relative">
                                        <Image 
                                          src={fullUrl} 
                                          alt="Producto" 
                                          thumbnail 
                                          style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                                          onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Error'; }}
                                        />
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            className="position-absolute top-0 end-0" 
                                            onClick={() => handleRemoveImage(url)}
                                            style={{ lineHeight: '1', padding: '2px 6px' }}
                                        >
                                            &times;
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                    <Form.Label>Categorías (*)</Form.Label>
                    <div className="d-flex flex-wrap gap-3 p-3 border rounded" style={{backgroundColor: '#f9f9f9'}}>
                        {allCategorias.map(cat => (
                            <Form.Check 
                                key={cat.id} type="checkbox" id={`cat-${cat.id}`} label={cat.nombre}
                                checked={selectedCategorias.has(cat.id)}
                                onChange={() => handleCategoriaChange(cat.id)}
                            />
                        ))}
                    </div>
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="activo">
                    <Form.Check type="checkbox" name="activo" label="Producto Activo (Visible en tienda)" checked={producto.activo} onChange={handleChange} />
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={loading || uploading || loadingCats}>
                    {loading ? <Spinner as="span" size="sm" /> : (isEditing ? 'Actualizar Producto' : 'Crear Producto')}
                </Button>
            </Form>
          </div>
        </Container>
    );
}

export default AdminProductosForm;