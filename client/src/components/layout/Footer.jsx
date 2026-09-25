import React from 'react';
import { Shield, BookOpen, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#141210] mt-auto transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand info */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[6px] bg-[#7A263A] text-white flex items-center justify-center font-serif font-bold text-xs border border-[#C59A5B]/40 shadow-sm">
              M
            </div>
            <div>
              <p className="text-xs font-serif font-semibold text-[#171717] dark:text-[#F7F4EE] flex items-center gap-1.5">
                MockVue <span className="font-mono text-[10px] text-[#68645E] dark:text-[#9E988F] font-normal">INSTITUTIONAL STANDARD v2.4</span>
              </p>
            </div>
          </div>

          {/* Academic Viva Compliance Badge */}
          <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-[11px] text-[#68645E] dark:text-[#9E988F]">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#C59A5B]" />
              Rubric-Calibrated Scoring
            </span>
            <span className="text-[#DED9D0] dark:text-[#332F2A]">•</span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#3F6B52]" />
              Proctored Defense Verification
            </span>
            <span className="text-[#DED9D0] dark:text-[#332F2A]">•</span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#7A263A] dark:text-[#D4AA6A]" />
              B.Tech Viva Dossier
            </span>
          </div>

          {/* Copyright */}
          <div className="font-mono text-[11px] text-[#68645E] dark:text-[#9E988F] text-center md:text-right">
            <span>Credible • Intelligent • Premium • Calm</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
