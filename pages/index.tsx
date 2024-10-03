import React, { useEffect } from 'react';
import { useAuth, AuthProvider } from '../app/context/AuthContext'; 
import { useRouter } from 'next/router';
import GuestPage from '@/app/components/GuestPage';
import SuperTranslator from '@/app/components/SuperTranslator';
import '../app/globals.css';

const HomeContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div>
      {!isAuthenticated ? (
        <GuestPage/>
      ) : (
        <SuperTranslator/>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <AuthProvider>
        <HomeContent />
    </AuthProvider>
  );
};

export default Home;
