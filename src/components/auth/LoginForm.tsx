'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [token, setToken] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const { signInWithOtp, verifyOtp, user } = useAuth();
  const router = useRouter();

  // Función para manejar redirección al dashboard
  const redirectToDashboard = () => {
    console.log('[LoginForm] Forcing redirect to dashboard...');
    // Establecer cookie para evitar problemas con el middleware
    document.cookie = "skip_auth=true; path=/; max-age=60";
    
    // Usar window.location.href para forzar una recarga completa
    window.location.href = '/dashboard';
  };

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      console.log('[LoginForm] User already authenticated:', user.email);
      redirectToDashboard();
    }
  }, [user]);

  // Request OTP code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      console.log('[LoginForm] Requesting OTP for:', email);
      const { error } = await signInWithOtp(email);
      
      if (error) throw error;
      
      setMessage('Se ha enviado un código de acceso a tu correo electrónico.');
      setShowVerification(true);
    } catch (err: any) {
      console.error('[LoginForm] Error requesting OTP:', err);
      setError(err.message || 'Error al enviar el código de acceso');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('[LoginForm] Verifying OTP for:', email);
      const { error } = await verifyOtp(email, token);
      
      if (error) throw error;
      
      setLoginSuccess(true);
      setMessage('Autenticación exitosa. Redirigiendo...');
      console.log('[LoginForm] OTP verification successful, waiting for redirect...');
      
      // Asegurar que la redirección ocurra incluso si hay algún problema con AuthContext
      setTimeout(() => {
        if (document.location.pathname !== '/dashboard') {
          console.log('[LoginForm] Backup redirect kicking in after 2 seconds');
          redirectToDashboard();
        }
      }, 2000);
      
      // The redirect will be handled by AuthContext
      // Disable all inputs while redirecting
      setToken('');
      setEmail('');
    } catch (err: any) {
      console.error('[LoginForm] OTP verification error:', err);
      setError(err.message || 'Código incorrecto. Inténtalo de nuevo.');
      setLoginSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!showVerification ? (
        // Form to request code
        <motion.form 
          onSubmit={handleRequestCode} 
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {message && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {message}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none"
              required
            />
          </div>
          
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? 'Enviando...' : 'Enviar código de acceso'}
          </motion.button>
        </motion.form>
      ) : (
        // Form to verify code
        <motion.form 
          onSubmit={handleVerifyCode} 
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {message && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {message}
            </div>
          )}
          
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-slate-700 mb-1">
              Código de verificación
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none"
              required
              disabled={loginSuccess}
            />
          </div>
          
          <motion.button
            type="submit"
            disabled={loading || loginSuccess}
            className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading ? 'Verificando...' : 
             loginSuccess ? 'Redirigiendo...' : 'Verificar código'}
          </motion.button>
          
          {!loginSuccess && (
            <motion.button
              type="button"
              onClick={() => setShowVerification(false)}
              className="w-full bg-slate-100 text-slate-700 py-2.5 px-4 rounded-md hover:bg-slate-200 transition-colors border border-slate-300"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Volver
            </motion.button>
          )}
        </motion.form>
      )}
    </div>
  );
} 