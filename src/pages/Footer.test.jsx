import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from "../components/Footer";

describe('Componente Footer', () => {
  it('debe renderizar el copyright y links', () => {
    render(<BrowserRouter><Footer /></BrowserRouter>);
    expect(screen.getByText(/© 2025 RUSHAV/i)).toBeInTheDocument();
    expect(screen.getByText('Nosotros')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });
});