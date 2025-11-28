import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Spinner, Alert, Form, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const API_URL = '/api/usuarios';

function AdminUsuariosListar() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchProtegido } = useAuth();

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProtegido(API_URL);
      if (!Array.isArray(data)) {
          throw new Error("Formato de respuesta inesperado del servidor.");
      }
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProtegido]);

  const handleEliminar = async (id) => {
      if (id === 1) { alert('No puedes eliminar al admin.'); return; }
      if (window.confirm('¿Seguro?')) {
          try {
              await fetchProtegido(`${API_URL}/${id}`, { method: 'DELETE' }); 
              alert('Usuario eliminado');
              fetchUsuarios();
          } catch (err) {
              alert(err.message);
          }
      }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const usuariosFiltrados = usuarios.filter(user => {
       if (!searchTerm) return true;
       const term = searchTerm.toLowerCase();
       return (
          (user.nombre && user.nombre.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term))
       );
  });

  if (loading) {
      return ( <Container className="text-center p-5"><Spinner animation="border" variant="primary" /></Container> );
  }
  if (error) {
      return ( <Container className="p-5"><Alert variant="danger">Error al cargar usuarios: {error}</Alert><Button onClick={fetchUsuarios} variant="warning">Reintentar Carga</Button></Container> );
  }

  return (
    <Container>
      <div className="admin-container">
      <h2>Gestión de Usuarios</h2>
      <Row className="mb-3 gy-2 align-items-center">
        <Col md={4}> 
          <Form.Control 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Región</th><th>Comuna</th><th>Rol</th><th>Activo</th><th>Acciones</th></tr></thead>
        <tbody>
          {usuariosFiltrados.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td><td>{u.nombre || '-'}</td><td>{u.email || '-'}</td><td>{u.region || '-'}</td><td>{u.comuna || '-'}</td><td>{u.rol || '-'}</td><td>{u.activo ? 'Sí' : 'No'}</td><td>

                <Button as={Link} to={`/admin/usuarios/editar/${u.id}`} variant="primary" size="sm" className="me-2">
                  Editar
                </Button>
                
                {u.id !== 1 && ( <Button variant="danger" size="sm" onClick={() => handleEliminar(u.id)}>Eliminar</Button> )}
              </td>
            </tr>
          ))}
          {usuariosFiltrados.length === 0 && ( <tr><td colSpan="8" className="text-center">No se encontraron usuarios.</td></tr> )}
        </tbody>
      </Table>
      </div>
    </Container>
  );
}

export default AdminUsuariosListar;