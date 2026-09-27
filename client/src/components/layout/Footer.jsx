import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            M
          </div>
          <span className="font-semibold text-slate-700">MockVue</span>
          <span>— Technical Interview Practice & Viva Evaluation</span>
        </div>

        <div>
          <span>Designed for Computer Science & Engineering Students</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
