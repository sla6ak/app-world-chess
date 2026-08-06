import React from 'react';
import logoImg from '../../images/VY_logo.png';

type PropTypes = {
  size?: number;
  className?: string;
};

/** Общий компонент логотипа. Используется в Sidebar, MobileHeader, GameHeader и др. */
const Logo: React.FC<PropTypes> = ({ size = 20, className }) => {
  return (
    <img
      src={logoImg}
      alt="Chess-World logo"
      className={className}
      style={{ width: size, height: 'auto', display: 'block' }}
    />
  );
};

export default Logo;
