import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const API_URL = "http://localhost:8080";
const AUTH_TOKEN_KEY = "authToken";
const USER_KEY = "usuario";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // (useEffect para cargar desde localStorage)
  useEffect(() => {
    try {
      const storedUserString = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedUserString && storedToken) {
        const storedUserData = JSON.parse(storedUserString);
        if (storedUserData && storedUserData.id && storedToken) {
          setCurrentUser(storedUserData);
          setAuthToken(storedToken);
        } else {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      }
    } catch (error) {
      console.error("Error al leer localStorage:", error);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  // (Función login CORREGIDA)
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.mensaje || "Credenciales incorrectas");
      }
      
      // --- CORRECCIÓN AQUÍ: Usamos 'usuario' (singular) ---
      if (data && data.usuario && data.usuario.id && data.token) {
        
        // Guardamos el token que viene del backend
        const token = "Bearer " + data.token;
        
        localStorage.setItem(USER_KEY, JSON.stringify(data.usuario)); // Singular
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        
        setCurrentUser(data.usuario); // Singular
        setAuthToken(token);
        return data.usuario; // Singular
      } else {
        console.error("Estructura recibida:", data);
        throw new Error("Respuesta de login inválida.");
      }
    } catch (error) {
      logout();
      throw error;
    }
  };

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem("carrito"); 
      window.dispatchEvent(new Event('cartUpdated')); 
      setCurrentUser(null);
      setAuthToken(null);
    } catch (error) {
      console.error("Error al limpiar localStorage:", error);
      setCurrentUser(null);
      setAuthToken(null);
    }
  }, []);

  // --- fetchProtegido (para JSON) ---
  const fetchProtegido = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      logout();
      throw new Error("Usuario no autenticado.");
    }
    const headers = {
      ...options.headers,
      "Authorization": token,
      "Content-Type": "application/json"
    };
    const response = await fetch(`${API_URL}${url}`, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.text(); 
      if (response.status === 401 || response.status === 403) {
          logout();
          throw new Error("Sesión expirada.");
      }
      throw new Error(errorBody || `Error ${response.status}`);
    }
    
    if (response.status === 204) { 
        return { ok: true };
    }
    
    return response.json();
  }, [logout]);

  // --- fetchProtegidoArchivo (para FormData) ---
  const fetchProtegidoArchivo = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      logout();
      throw new Error("Usuario no autenticado.");
    }
    const headers = { ...options.headers, "Authorization": token };
    const response = await fetch(`${API_URL}${url}`, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 401 || response.status === 403) {
          logout();
          throw new Error("Sesión expirada.");
      }
      throw new Error(errorBody || `Error ${response.status}`);
    }
    
    return response.text();
  }, [logout]);


  const value = {
    currentUser,
    isLoggedIn: !!currentUser && !!authToken,
    login,
    logout,
    fetchProtegido,
    fetchProtegidoArchivo,
    loadingAuth
  };

  if (loadingAuth) {
    return <div>Verificando sesión...</div>;
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}