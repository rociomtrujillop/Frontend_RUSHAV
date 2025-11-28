import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Spinner, Alert, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';

const API_URL = '/api/dashboard/estadisticas';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchProtegido } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProtegido(API_URL); 
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProtegido]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!stats) return <Alert variant="warning">No hay estadísticas disponibles.</Alert>;

  return (
    <Container>
    <div className="admin-container">
      <h1>Dashboard</h1>
      <p>Resumen de las actividades de la tienda.</p>
      <Row>
        <Col md={4}>
          <Link to="/admin/usuarios" className="text-decoration-none">
            <Card bg="primary" text="white" className="mb-3">
              <Card.Body>
                <Card.Title>Total Usuarios</Card.Title>
                <Card.Text className="display-4">{stats.totalUsuarios}</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4}>
          <Link to="/admin/productos" className="text-decoration-none">
            <Card bg="success" text="white" className="mb-3">
              <Card.Body>
                <Card.Title>Total Productos</Card.Title>
                <Card.Text className="display-4">{stats.totalProductos}</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4}>
          <Link to="/admin/productos?filtro=stock_bajo" className="text-decoration-none">
            <Card bg="danger" text="white" className="mb-3">
              <Card.Body>
                <Card.Title>Productos con Stock Bajo</Card.Title>
                <Card.Text className="display-4">{stats.productosStockBajo ? stats.productosStockBajo.length : 0}</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
    </Container>
  );
}

export default AdminDashboard;