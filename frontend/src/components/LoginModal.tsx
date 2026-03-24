import { Modal } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from './LoginForm';

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();

  return (
    <Modal 
      opened={isLoginModalOpen} 
      onClose={closeLoginModal} 
      size="sm" 
      radius="md"
      title="Iniciar Sesión"
      centered
    >
      <LoginForm 
        onSuccess={closeLoginModal} 
        title="Bienvenido de nuevo" 
        subtitle="Ingresa tus credenciales para acceder" 
      />
    </Modal>
  );
}
