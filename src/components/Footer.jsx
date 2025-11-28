import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="p-4 mt-auto">
      <Container>
        <Row className="text-center">
          <Col md={6} className="text-md-start">
            <p>© 2025 RUSHAV - Todos los derechos reservados</p>
          </Col>
          <Col md={6} className="text-md-end">
            <Link to="/nosotros" className="me-3">Nosotros</Link>
            <Link to="/contacto">Contacto</Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;