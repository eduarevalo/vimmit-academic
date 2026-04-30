import React from 'react';

interface EmailBaseProps {
  children: React.ReactNode;
  previewText?: string;
}

export const EmailBase: React.FC<EmailBaseProps> = ({ children, previewText }) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#f4f4f5',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    padding: '40px 0',
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    border: '1px solid #e4e4e7',
    borderCollapse: 'collapse',
  };

  const bodyStyle: React.CSSProperties = {
    padding: '40px',
  };

  return (
    <div style={containerStyle}>
      {previewText && (
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
          {previewText}
        </div>
      )}
      <table
        align="center"
        role="presentation"
        cellSpacing="0"
        cellPadding="0"
        border={0}
        width="600"
        style={contentStyle}
      >
        {/* Logo Header */}
        <tr>
          <td align="center" style={{ padding: '30px 0 10px' }}>
            <table role="presentation" cellSpacing="0" cellPadding="0" border={0}>
              <tr>
                <td style={{ 
                  backgroundColor: '#2cae65', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '4px' 
                }}></td>
                <td style={{ paddingLeft: '8px' }}>
                  <span style={{ 
                    fontSize: '20px', 
                    fontWeight: 800, 
                    color: '#18181b', 
                    letterSpacing: '-1px' 
                  }}>
                    VIMMIT
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style={bodyStyle}>
            {children}
          </td>
        </tr>
      </table>
      
      <table
        align="center"
        role="presentation"
        cellSpacing="0"
        cellPadding="0"
        border={0}
        width="600"
        style={{ margin: '0 auto' }}
      >
        <tr>
          <td style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#71717a' }}>
            © {new Date().getFullYear()} Vimmit Academic. Todos los derechos reservados.
            <br />
            Has recibido este correo porque estás registrado en nuestra plataforma.
          </td>
        </tr>
      </table>
    </div>
  );
};
