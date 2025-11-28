import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Spinner, Alert, Form, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext'; 

const API_URL = '/api/categorias';

function AdminCategoriasListar() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchProtegido } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProtegido(`${API_URL}/todas`); 
      setCategorias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProtegido]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleEliminar = async (id) => {
    if (window.confirm('¿ELIMINAR PERMANENTEMENTE? Esta acción no se puede deshacer y solo funcionará si NINGÚN producto está usando esta categoría.')) {
      try {
        await fetchProtegido(`${API_URL}/${id}`, { method: 'DELETE' });
        alert('Categoría eliminada permanentemente.');
        fetchCategorias();
      } catch (err) {
        alert(err.message);
      }
    }
  };
  
  const categoriasFiltradas = categorias.filter(cat => {
      if (!searchTerm) return true;
      return cat.nombre && cat.nombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <Container className="text-center p-5"><Spinner animation="border" variant="primary" /></Container>;
  if (error) return <Container className="p-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container>
      <div className="admin-container">
      <h2>Gestión de Categorías</h2>
      
      <Row className="mb-3 gy-2 align-items-center">
        <Col md={8}>
          <Form.Control 
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categoriasFiltradas.map(cat => (
            <tr key={cat.id} className={!cat.activa ? 'text-muted' : ''}>
              <td>{cat.id}</td>
              <td>{cat.nombre}</td>
              <td>{cat.tipo}</td>
              <td>{cat.activa ? 'Activa' : 'Inactiva'}</td>
              <td>
                <Button as={Link} to={`/admin/categorias/editar/${cat.id}`} variant="primary" size="sm" className="me-2">
                  Editar
                </Button>
                <Button 
                  variant="danger"
                  size="sm" 
                  onClick={() => handleEliminar(cat.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
          
          {!loading && categoriasFiltradas.length === 0 && ( 
              <tr>
                  <td colSpan="5" className="text-center"> 
                     No se encontraron categorías con los filtros aplicados.
                  </td>
              </tr>
          )}
          
        </tbody>
      </Table>
      </div>
    </Container>
  );
}

export default AdminCategoriasListar;