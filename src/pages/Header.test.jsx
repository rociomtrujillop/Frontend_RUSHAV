import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from "../components/Header";

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isLoggedIn: false, currentUser: null })
}));

describe('Componente Header', () => {
  it('debe mostrar el logo y links de navegación', () => {
    render(<BrowserRouter><Header /></BrowserRouter>);
    expect(screen.getByText('RUSHAV')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); 
  });
});