import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 mt-auto py-4 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_5px_-1px_rgba(255,255,255,0.05)]">
      <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} <span dir="ltr">Otlob - Eltūr</span>. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
};

export default Footer;