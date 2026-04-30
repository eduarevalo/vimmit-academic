import React from 'react';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  align?: 'left' | 'center' | 'right';
}

export const EmailButton: React.FC<EmailButtonProps> = ({ 
  href, 
  children, 
  variant = 'primary',
  align = 'center'
}) => {
  const colors = {
    primary: '#2cae65', // Brand Green
    secondary: '#4f46e5', // Royal Blue
  };

  const backgroundColor = colors[variant];

  return (
    <table
      role="presentation"
      cellSpacing="0"
      cellPadding="0"
      border={0}
      width="100%"
      style={{ margin: '20px 0' }}
    >
      <tr>
        <td align={align}>
          <a
            href={href}
            style={{
              backgroundColor: backgroundColor,
              border: `1px solid ${backgroundColor}`,
              borderRadius: '2px', // Square-ish (radius-xs)
              color: '#ffffff',
              display: 'inline-block',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '50px',
              textAlign: 'center',
              textDecoration: 'none',
              width: '200px',
              WebkitTextSizeAdjust: 'none',
              msoHide: 'all',
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </table>
  );
};
