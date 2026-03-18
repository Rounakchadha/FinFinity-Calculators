import React from 'react';

const SectionGlowBackground: React.FC = () => (
  <>
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-calc-accent/5 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-calc-accent/5 rounded-full blur-[120px] pointer-events-none" />
  </>
);

export default SectionGlowBackground;
