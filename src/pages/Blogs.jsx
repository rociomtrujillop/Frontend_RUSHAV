import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';

function Blogs() {
  return (
    <Container className="py-4">
      <h1>Blogs</h1>
      
      {/* Blog 1 */}
      <Card className="blog-card my-4 shadow-sm">
        <Row className="g-0">
          <Col md={8}>
            <Card.Body>
              <Card.Title as="h2">Tendencias de primavera-verano 2025-26 para mujeres</Card.Title>
              <Card.Text>
                Las tendencias de primavera-verano 2025 están a la vuelta de la esquina...
                Las pasarelas apuntan a una variedad constante de propuestas que van desde el retorno a décadas muy concretas...
              </Card.Text>
              <Button as={Link} to="#" variant="primary">Leer más</Button>
            </Card.Body>
          </Col>
          <Col md={4}>
            <Card.Img src="/img/blog1.jfif" alt="Tendencias mujeres" style={{ objectFit: 'cover', height: '100%' }} />
          </Col>
        </Row>
      </Card>
      
      <Card className="blog-card my-4 shadow-sm">
        <Row className="g-0">
          <Col md={4} className="order-md-2">
            <Card.Img src="/img/blog2.jfif" alt="Tendencias hombres" style={{ objectFit: 'cover', height: '100%' }} />
          </Col>
          <Col md={8} className="order-md-1">
            <Card.Body>
              <Card.Title as="h2">Tendencias primavera-verano 2025-26: así vestirán los hombres</Card.Title>
              <Card.Text>
                Si hay un denominador común entre todas las capitales de la moda es que volveremos a la sencillez de los básicos.
                Por un lado, continuaremos explorando el universo Preppy...
              </Card.Text>
              <Button as={Link} to="#" variant="primary">Leer más</Button>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}

export default Blogs;