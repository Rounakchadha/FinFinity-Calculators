import React from 'react';

const LogoBadge: React.FC = () => (
  <div className="absolute top-6 right-6 hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-foreground border-4 border-foreground shadow-lg z-20">
    <div className="w-full h-full rounded-full bg-calc-accent flex items-center justify-center text-calc-bg font-bold text-sm">
      R
    </div>
  </div>
);

export default LogoBadge;
