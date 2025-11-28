import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom'; 
import { Button, Nav } from 'react-bootstrap'; 
import { useAuth } from '../../context/AuthContext'; 

function AdminLayout() {
  const navigate = useNavigate(); 
  const { logout } = useAuth(); 

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  return (
    <div className="admin-layout"> 
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>ADMIN PANEL</h2>
        </div>
        
        <Nav className="flex-column sidebar-nav">
          <NavLink to="/admin" end className="nav-link-admin">Inicio</NavLink>
          
          <h3 className="sidebar-section-title">USUARIOS</h3>
          <NavLink to="/admin/usuarios" className="nav-link-admin">Ver Usuarios</NavLink>
          <NavLink to="/admin/usuarios/crear" className="nav-link-admin">Crear Usuario</NavLink>
          
          <h3 className="sidebar-section-title">PRODUCTOS</h3>
          <NavLink to="/admin/productos" className="nav-link-admin">Ver Productos</NavLink>
          <NavLink to="/admin/productos/crear" className="nav-link-admin">Crear Producto</NavLink>
          
          <h3 className="sidebar-section-title">CATEGORÍAS</h3>
          <NavLink to="/admin/categorias" className="nav-link-admin">Ver Categorías</NavLink>
          <NavLink to="/admin/categorias/crear" className="nav-link-admin">Crear Categoría</NavLink>

          <h3 className="sidebar-section-title">VENTAS</h3>
          <NavLink to="/admin/ventas" className="nav-link-admin">Ver Historial</NavLink>
        </Nav>

        <div className="sidebar-footer">
          <Button 
            variant="danger" 
            className="w-100 btn-flat" 
            onClick={handleLogout} 
          >
            CERRAR SESIÓN
          </Button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="admin-container">
            <Outlet /> 
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;