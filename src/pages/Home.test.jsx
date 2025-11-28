import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

describe('Pagina Home', () => {
  it('debe mostrar los botones de categoría por género', () => {
    render(<BrowserRouter><Home /></BrowserRouter>);
    expect(screen.getByText(/Ver Ropa Hombre/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver Ropa Mujer/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver Ropa Unisex/i)).toBeInTheDocument();
  });
});