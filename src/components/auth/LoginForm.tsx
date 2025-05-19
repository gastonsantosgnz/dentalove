'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { OTPInputField } from '@/components/ui/otp-input';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const { signInWithOtp, verifyOtp, user } = useAuth();
  const router = useRouter();

  // Función para manejar redirección al dashboard
  const redirectToDashboard = () => {
    console.log('[LoginForm] Forcing redirect to dashboard...');
    document.cookie = "skip_auth=true; path=/; max-age=60";
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
    if (otp.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('[LoginForm] Verifying OTP for:', email);
      const { error } = await verifyOtp(email, otp);
      
      if (error) throw error;
      
      setLoginSuccess(true);
      setMessage('Autenticación exitosa. Redirigiendo...');
      
      setTimeout(() => {
        if (document.location.pathname !== '/dashboard') {
          console.log('[LoginForm] Backup redirect kicking in after 2 seconds');
          redirectToDashboard();
        }
      }, 2000);
      
      setOtp('');
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
    <div className="w-full max-w-md mx-auto">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}
      
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700"
        >
          {message}
        </motion.div>
      )}

      {!showVerification ? (
        <motion.form 
          onSubmit={handleRequestCode}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full rounded-xl border-gray-200 focus:border-[#0c7d74] focus:ring-1 focus:ring-[#0c7d74]"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0c7d74] hover:bg-[#0a6b63] text-white rounded-xl py-6 px-8 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Enviando código...' : 'Enviar código de acceso'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="text-center text-sm text-gray-500">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-[#0c7d74] hover:text-[#0a6b63] font-medium">
              Regístrate
            </Link>
          </div>
        </motion.form>
      ) : (
        <motion.form 
          onSubmit={handleVerifyCode}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <OTPInputField
            value={otp}
            onChange={setOtp}
            label="Código de verificación"
            disabled={loginSuccess}
            error={error || undefined}
          />
          
          <p className="text-sm text-gray-500 text-center">
            Te hemos enviado un código de 6 dígitos a {email}
          </p>

          <Button
            type="submit"
            disabled={loading || loginSuccess || otp.length !== 6}
            className="w-full bg-[#0c7d74] hover:bg-[#0a6b63] text-white rounded-xl py-6 px-8 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Verificando...' : loginSuccess ? 'Redirigiendo...' : 'Verificar código'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          {!loginSuccess && (
            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="w-full bg-gray-100 text-gray-700 py-6 px-8 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
              >
                Volver
              </button>
              
              <button
                type="button"
                onClick={handleRequestCode}
                disabled={loading}
                className="text-sm text-[#0c7d74] hover:text-[#0a6b63]"
              >
                ¿No recibiste el código? Reenviar
              </button>
            </div>
          )}
        </motion.form>
      )}
    </div>
  );
} 