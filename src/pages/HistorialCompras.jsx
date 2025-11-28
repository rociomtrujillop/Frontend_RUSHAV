// src/pages/HistorialCompras.jsx

import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Badge, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

function HistorialCompras() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Obtenemos el usuario y la función fetch segura
  const { currentUser, fetchProtegido } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.id) {
      const fetchHistorial = async () => {
        try {
          // Llamamos al endpoint que busca por ID de usuario
          const data = await fetchProtegido(`/api/pedidos/usuario/${currentUser.id}`);
          setPedidos(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchHistorial();
    }
  }, [currentUser, fetchProtegido]);

  const formatearPrecio = (val) => val ? val.toLocaleString('es-CL') : '0';
  const formatearFecha = (fechaString) => {
      if(!fechaString) return "-";
      return new Date(fechaString).toLocaleDateString() + ' ' + new Date(fechaString).toLocaleTimeString();
  };

  if (loading) return <Container className="p-5 text-center"><Spinner animation="border" variant="primary" /></Container>;
  
  if (error) return <Container className="p-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-4">
      <h1 className="mb-4">Mis Compras</h1>
      
      {pedidos.length === 0 ? (
        <Alert variant="info">No has realizado ninguna compra todavía.</Alert>
      ) : (
        <div className="d-flex flex-column gap-4">
          {pedidos.map(p => (
            <Card key={p.id} className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <div>
                    <strong>Pedido #{p.id}</strong>
                    <span className="text-muted ms-2">| {formatearFecha(p.fecha)}</span>
                </div>
                <Badge bg="dark" className="fs-6">${formatearPrecio(p.total)}</Badge>
              </Card.Header>
              <Card.Body>
                <Table responsive size="sm" className="mb-0">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Cant.</th>
                            <th className="text-end">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {p.detalles && p.detalles.map((d, index) => (
                            <tr key={index}>
                                <td>{d.producto ? d.producto.nombre : "Producto eliminado"}</td>
                                <td>${formatearPrecio(d.precioUnitario)}</td>
                                <td>{d.cantidad}</td>
                                <td className="text-end">${formatearPrecio(d.precioUnitario * d.cantidad)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}

export default HistorialCompras;