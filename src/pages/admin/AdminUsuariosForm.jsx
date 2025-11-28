import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { regiones } from '../../data/regiones.js'; 
import { useAuth } from '../../context/AuthContext';

const API_URL = '/api/usuarios';

function AdminUsuariosForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { fetchProtegido } = useAuth();

  const [usuario, setUsuario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'cliente',
    activo: true,
    region: '', 
    comuna: '' 
  });
  const [comunas, setComunas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      const fetchUsuario = async () => {
        try {
          const data = await fetchProtegido(`${API_URL}/${id}`);
          setUsuario({ 
              ...data, 
              password: '',
              region: data.region || '', 
              comuna: data.comuna || '' 
          }); 
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchUsuario();
    }
  }, [isEditing, id, fetchProtegido]);

  // (useEffect para comunas y handleChange - sin cambios)
  useEffect(() => {
    const regionSeleccionada = usuario.region; 
    const regionEncontrada = regiones.find(r => r.nombre === regionSeleccionada);
    const comunasDeRegion = regionEncontrada ? regionEncontrada.comunas : [];
    setComunas(comunasDeRegion);
    if (regionSeleccionada && !comunasDeRegion.includes(usuario.comuna)) {
      setUsuario(prev => ({ ...prev, comuna: '' }));
    }
  }, [usuario.region]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUsuario(prev => {
        const newState = {
           ...prev,
           [name]: type === 'checkbox' ? checked : value
        };
        if (name === 'region') {
            newState.comuna = ''; 
        }
        return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!usuario.nombre || usuario.nombre.length < 3) {
        setError('El nombre debe tener al menos 3 caracteres.'); setLoading(false); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) {
        setError('El formato del email no es válido.'); setLoading(false); return;
    }
    if (!isEditing && (!usuario.password || usuario.password.length < 6)) {
        setError('La contraseña es obligatoria y debe tener al menos 6 caracteres.'); setLoading(false); return;
    }
    if (isEditing && usuario.password && usuario.password.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres.'); setLoading(false); return;
    }
    if (!usuario.rol) {
        setError('Debes seleccionar un rol.'); setLoading(false); return;
    }

    if (usuario.region && !usuario.comuna) {
        setError('Si seleccionas una región, también debes seleccionar una comuna.');
        setLoading(false);
        return;
    }

    const usuarioParaEnviar = { ...usuario };
    if (isEditing && !usuario.password) {
      delete usuarioParaEnviar.password;
    }
    
    if (usuarioParaEnviar.region === "") {
        usuarioParaEnviar.region = null;
    }
    if (usuarioParaEnviar.comuna === "") {
        usuarioParaEnviar.comuna = null;
    }
    
    if (!usuarioParaEnviar.region || !usuarioParaEnviar.comuna) {
        setError('La región y la comuna son obligatorias.');
        setLoading(false);
        return;
    }
    const url = isEditing ? `${API_URL}/${id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      await fetchProtegido(url, {
        method: method,
        body: JSON.stringify(usuarioParaEnviar)
      });
      
      alert(`Usuario ${isEditing ? 'actualizado' : 'creado'} con éxito`);
      navigate('/admin/usuarios');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <Spinner animation="border" variant="primary" />;
  return (
    <Container>
      <div className="admin-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4">
            <Card.Title as="h2">{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</Card.Title>
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              
              <Form.Group className="mb-3" controlId="nombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" name="nombre" value={usuario.nombre} onChange={handleChange} required />
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={usuario.email} onChange={handleChange} required />
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control 
                  type="password" 
                  name="password" 
                  value={usuario.password} 
                  onChange={handleChange} 
                  placeholder={isEditing ? 'Dejar en blanco para no cambiar' : ''}
                  required={!isEditing} 
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="regionAdmin">
                    <Form.Label>Región</Form.Label>
                    <Form.Select 
                      name="region"
                      value={usuario.region}
                      onChange={handleChange}
                    >
                      <option value="">-- Sin Región --</option>
                      {regiones.map(r => (
                        <option key={r.nombre} value={r.nombre}>{r.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="comunaAdmin">
                    <Form.Label>Comuna</Form.Label>
                    <Form.Select 
                      name="comuna"
                      value={usuario.comuna}
                      onChange={handleChange}
                      disabled={!usuario.region || comunas.length === 0} 
                    >
                      <option value="">-- Sin Comuna --</option>
                      {comunas.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3" controlId="rol">
                <Form.Label>Rol</Form.Label>
                <Form.Select name="rol" value={usuario.rol} onChange={handleChange}>
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="activo">
                <Form.Check type="checkbox" name="activo" label="Activo" checked={usuario.activo} onChange={handleChange} />
              </Form.Group>
              
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? <Spinner as="span" size="sm" /> : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
      </div>
    </Container>
  );
}

export default AdminUsuariosForm;