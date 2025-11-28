import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function PagoError() {
  const navigate = useNavigate();

  return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ color: 'red' }}>✗ No se pudo realizar el pago</h1>
      <p>Hubo un error al procesar tu pago. Por favor, inténtalo de nuevo.</p>
      
      <button onClick={() => navigate('/checkout')} className="btn-seguir" style={{ marginRight: '1rem' }}>
        VOLVER A REALIZAR EL PAGO
      </button>
      <Link to="/productos" className="btn-seguir" style={{ background: '#777' }}>
        Volver a productos
      </Link>
    </main>
  );
}

export default PagoError;