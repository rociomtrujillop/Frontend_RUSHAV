import React from 'react';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';

function Nosotros() {
  return (
    <Container className="py-4">
      <h1>Nosotros</h1>
      <Card className="my-4 shadow-sm">
        <Row className="g-0">
          <Col md={4}>
            <Image src="/img/nosotros.png" alt="Imagen de Nosotros" fluid roundedStart style={{ objectFit: 'cover', height: '100%' }} />
          </Col>
          <Col md={8}>
            <Card.Body>
              <Card.Title as="h2">Sobre RUSHAV</Card.Title>
              <Card.Text>
                En RUSHAV, nos dedicamos a ofrecer productos de alta calidad que combinan estilo y funcionalidad. Nuestra misión es proporcionar a nuestros clientes una experiencia de compra excepcional, con un enfoque en la satisfacción del cliente y la innovación constante.
              </Card.Text>
              <Card.Text>
                Fundada en 2020, RUSHAV ha crecido rápidamente gracias a nuestro compromiso con la excelencia y la atención al detalle. Nuestro equipo está compuesto por profesionales apasionados que trabajan arduamente para seleccionar los mejores productos y garantizar que cada cliente encuentre exactamente lo que necesita.
              </Card.Text>
              <Card.Text>
                Nos enorgullece ser una empresa que valora la sostenibilidad y la responsabilidad social. Trabajamos con proveedores que comparten nuestros valores y nos esforzamos por minimizar nuestro impacto ambiental.
              </Card.Text>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}

export default Nosotros;