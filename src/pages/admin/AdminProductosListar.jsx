import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Table, Button, Spinner, Alert, Form, Row, Col, Container } from 'react-bootstrap'; 
import { useAuth } from '../../context/AuthContext';

const API_URL_PRODUCTOS = '/api/productos';
const API_URL_CATEGORIAS = '/api/categorias/todas'; 

function AdminProductosListar() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); 
  const { fetchProtegido } = useAuth();
  
  const [searchParams] = useSearchParams();
  const filtroParam = searchParams.get('filtro');

  const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const [prodsData, catsData] = await Promise.all([
          fetchProtegido(API_URL_PRODUCTOS),
          fetchProtegido(API_URL_CATEGORIAS)
        ]);
        if (Array.isArray(prodsData)) setProductos(prodsData); else setProductos([]);
        if (Array.isArray(catsData)) setCategorias(catsData); else setCategorias([]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, [fetchProtegido]);

  useEffect(() => {
    fetchData(); 
  }, [fetchData]);

  const handleEliminar = async (id) => {
      if (!id) return;
      if (window.confirm(`¿Seguro de eliminar producto ID ${id}?`)) {
          try {
              await fetchProtegido(`${API_URL_PRODUCTOS}/${id}`, { method: 'DELETE' });
              alert('Producto eliminado');
              setProductos(prev => prev.filter(p => p.id !== id));
          } catch (err) {
              alert(`Error: ${err.message}`);
          }
      } 
  };

  const productosFiltrados = productos.filter(prod => {
      if (!prod) return false; 
      
      const matchesSearch = searchTerm 
          ? (prod.nombre && prod.nombre.toLowerCase().includes(searchTerm.toLowerCase())) 
          : true; 
          
      const matchesCategory = selectedCategoryId
          ? (Array.isArray(prod.categorias) && prod.categorias.some(cat => cat && cat.id?.toString() === selectedCategoryId)) 
          : true; 
      
      const matchesStockBajo = filtroParam === 'stock_bajo'
          ? (prod.stock < 5) 
          : true;

      return matchesSearch && matchesCategory && matchesStockBajo;
  });

  if (loading) { return ( <Container className="text-center p-5"><Spinner animation="border" variant="primary" /></Container> ); }
  if (error) { return ( <Container className="p-5"><Alert variant="danger">{error}</Alert></Container> ); }

  return (
    <Container>
      <div className="admin-container">
      <h2>Gestión de Productos</h2>
      {filtroParam === 'stock_bajo' && (
        <Alert variant="danger">Mostrando solo productos con stock bajo (menos de 5)</Alert>
      )}

      <Row className="mb-3 gy-2 align-items-center">
          <Col md={4}>
               <Form.Control 
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </Col>
          <Col md={4}>
              <Form.Select
                  aria-label="Filtrar por categoría"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                  <option value="">-- Todas las Categorías --</option>
                  {Array.isArray(categorias) && categorias.map(cat => ( 
                      <option key={cat.id} value={cat.id.toString()}>
                          {cat.nombre}
                      </option>
                  ))}
              </Form.Select>
          </Col>
      </Row>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Género</th><th>Activo</th><th>Acciones</th> 
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre || '-'}</td>
              <td>${p.precio?.toLocaleString('es-CL') || '0'}</td>
              <td style={p.stock < 5 ? { background: '#ffcccc' } : {}}>{p.stock ?? '-'}</td>
              <td>{p.genero || '-'}</td>
              <td>{p.activo ? 'Sí' : 'No'}</td>
              <td>
                 <Button as={Link} to={`/admin/productos/editar/${p.id}`} variant="primary" size="sm" className="me-2">Editar</Button>
                 <Button variant="danger" size="sm" onClick={() => handleEliminar(p.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
          {!loading && productosFiltrados.length === 0 && ( 
              <tr>
                  <td colSpan="7" className="text-center"> 
                     No se encontraron productos con los filtros aplicados.
                  </td>
              </tr>
          )}
        </tbody>
      </Table>
      </div>
    </Container>
  );
}

export default AdminProductosListar;