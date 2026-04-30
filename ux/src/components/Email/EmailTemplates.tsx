import React from 'react';
import { EmailBase } from './EmailBase';
import { EmailButton } from './EmailButton';

export const WelcomeEmail: React.FC<{ name: string }> = ({ name }) => (
  <EmailBase previewText="¡Bienvenido a Vimmit Academic!">
    <h1 style={{ color: '#18181b', fontSize: '24px', fontWeight: 700, margin: '0 0 20px' }}>
      ¡Hola, {name}!
    </h1>
    <p style={{ color: '#52525b', fontSize: '16px', lineHeight: '24px', margin: '0 0 20px' }}>
      Estamos muy emocionados de tenerte con nosotros. Vimmit Academic es la plataforma definitiva 
      para gestionar tu experiencia académica de manera sencilla y profesional.
    </p>
    <p style={{ color: '#52525b', fontSize: '16px', lineHeight: '24px', margin: '0 0 20px' }}>
      Ya puedes acceder a tu panel de control para completar tu perfil y explorar tus cursos.
    </p>
    <EmailButton href="https://vimmit.com/dashboard">
      Ir al Dashboard
    </EmailButton>
    <hr style={{ border: '0', borderTop: '1px solid #e4e4e7', margin: '30px 0' }} />
    <p style={{ color: '#71717a', fontSize: '14px', lineHeight: '20px' }}>
      Si tienes alguna duda, simplemente responde a este correo.
    </p>
  </EmailBase>
);

export const GradeNotification: React.FC<{ studentName: string; course: string; grade: string }> = ({ 
  studentName, 
  course, 
  grade 
}) => (
  <EmailBase previewText={`Nueva calificación en ${course}`}>
    <h1 style={{ color: '#18181b', fontSize: '24px', fontWeight: 700, margin: '0 0 20px' }}>
      Nueva calificación
    </h1>
    <p style={{ color: '#52525b', fontSize: '16px', lineHeight: '24px', margin: '0 0 20px' }}>
      Hola {studentName}, se ha publicado una nueva calificación en tu curso.
    </p>
    
    <div style={{ 
      backgroundColor: '#f8fafc', 
      padding: '24px', 
      borderRadius: '2px', 
      borderLeft: '4px solid #4f46e5',
      margin: '20px 0'
    }}>
      <p style={{ margin: '0', color: '#64748b', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>
        Curso
      </p>
      <p style={{ margin: '4px 0 12px', color: '#1e293b', fontSize: '18px', fontWeight: 700 }}>
        {course}
      </p>
      <p style={{ margin: '0', color: '#64748b', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>
        Calificación
      </p>
      <p style={{ margin: '4px 0 0', color: '#4f46e5', fontSize: '32px', fontWeight: 800 }}>
        {grade}
      </p>
    </div>

    <EmailButton href="https://vimmit.com/grades" variant="secondary">
      Ver detalles
    </EmailButton>
  </EmailBase>
);

export const AuthEmail: React.FC<{ code: string }> = ({ code }) => (
  <EmailBase previewText="Tu código de verificación">
    <h1 style={{ color: '#18181b', fontSize: '24px', fontWeight: 700, margin: '0 0 20px' }}>
      Verifica tu cuenta
    </h1>
    <p style={{ color: '#52525b', fontSize: '16px', lineHeight: '24px', margin: '0 0 20px' }}>
      Usa el siguiente código para completar tu inicio de sesión. Este código expirará en 10 minutos.
    </p>
    
    <div style={{ 
      textAlign: 'center' as const,
      margin: '40px 0',
      padding: '20px',
      backgroundColor: '#f1f5f9',
      letterSpacing: '10px',
      fontSize: '36px',
      fontWeight: 800,
      color: '#1e293b',
      borderRadius: '2px'
    }}>
      {code}
    </div>

    <p style={{ color: '#71717a', fontSize: '14px', lineHeight: '20px', textAlign: 'center' }}>
      Si no solicitaste este código, puedes ignorar este mensaje de forma segura.
    </p>
  </EmailBase>
);
