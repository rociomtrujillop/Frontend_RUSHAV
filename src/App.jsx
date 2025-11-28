import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Productos from './pages/Productos';
import Carrito from './pages/Carrito';
import Detalle from './pages/Detalle';
import Blogs from './pages/Blogs';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';
import Ofertas from './pages/Ofertas'; 
import HistorialCompras from './pages/HistorialCompras';

import Checkout from './pages/Checkout';         
import PagoExitoso from './pages/PagoExitoso';   
import PagoError from './pages/PagoError';       

import AdminPedidosListar from './pages/admin/AdminPedidosListar';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsuariosListar from './pages/admin/AdminUsuariosListar';
import AdminUsuariosForm from './pages/admin/AdminUsuariosForm';
import AdminProductosListar from './pages/admin/AdminProductosListar';
import AdminProductosForm from './pages/admin/AdminProductosForm';
import AdminCategoriasListar from './pages/admin/AdminCategoriasListar'; 
import AdminCategoriasForm from './pages/admin/AdminCategoriasForm';

function ClientLayout() {
  return (
    <>
      <Header />
      <main> 
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<ClientLayout />}> 
          <Route index element={<Home />} /> 
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="productos" element={<Productos />} />
          <Route path="carrito" element={<Carrito />} />
          <Route path="detalle" element={<Detalle />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="ofertas" element={<Ofertas />} />
          <Route path="mis-compras" element={<HistorialCompras />} />

          <Route path="checkout" element={<Checkout />} />
          <Route path="pago-exitoso" element={<PagoExitoso />} />
          <Route path="pago-error" element={<PagoError />} />

        </Route> 
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuariosListar />} />
          <Route path="usuarios/crear" element={<AdminUsuariosForm />} />
          <Route path="usuarios/editar/:id" element={<AdminUsuariosForm />} />
          <Route path="productos" element={<AdminProductosListar />} />
          <Route path="productos/crear" element={<AdminProductosForm />} />
          <Route path="productos/editar/:id" element={<AdminProductosForm />} />
          <Route path="categorias" element={<AdminCategoriasListar />} /> 
          <Route path="categorias/crear" element={<AdminCategoriasForm />} />
          <Route path="categorias/editar/:id" element={<AdminCategoriasForm />} />
          <Route path="ventas" element={<AdminPedidosListar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;