'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); // Redirigir a la página principal después de cerrar sesión
  };

  return (
    <button 
      onClick={handleSignOut}
      className="text-red-600 hover:text-red-800 font-medium"
    >
      Cerrar sesión
    </button>
  );
} 