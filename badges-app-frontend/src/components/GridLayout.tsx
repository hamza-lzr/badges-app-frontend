import React from 'react';

interface GridLayoutProps {
  children: React.ReactNode;
}

const GridLayout: React.FC<GridLayoutProps> = ({ children }) => {
  return (
    <div className="grid-layout">
      {children}
    </div>
  );
};

export default GridLayout;