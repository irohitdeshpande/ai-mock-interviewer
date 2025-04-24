import { Zap } from "lucide-react";
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 px-6 bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and tagline */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-5 w-5 text-indigo-400" />
              <span className="font-bold text-lg text-white">IntervAI</span>
            </div>
            <p className="text-sm text-slate-400 text-center md:text-left">
              AI-powered interview preparation
            </p>
          </div>

          {/* Quick links */}
          <div className="flex gap-6 md:gap-12">
            <a href="/#features" className="text-sm hover:text-indigo-400 transition-colors">Features</a>
            <a href="/#how-it-works" className="text-sm hover:text-indigo-400 transition-colors">How it Works?</a>
            <a href="/#testimonials" className="text-sm hover:text-indigo-400 transition-colors">Testimonials</a>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-sm text-slate-500 text-center">
          © {new Date().getFullYear()} IntervAI. Made by Rohit Deshpande. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;