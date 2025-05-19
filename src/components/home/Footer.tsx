import React from "react";
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const navItems = [
    { name: "Características", link: "#features" },
    { name: "Testimonios", link: "#testimonials" },
    { name: "Precios", link: "#pricing" },
    { name: "Contacto", link: "#contact" },
    { name: "Blog", link: "/blog" },
  ];
  
  const productLinks = [
    { name: "Características", link: "#features" },
    { name: "Precios", link: "#pricing" },
    { name: "Testimonios", link: "#testimonials" },
    { name: "Integraciones", link: "#integrations" },
  ];
  
  const supportLinks = [
    { name: "Documentación", link: "/docs" },
    { name: "Tutoriales", link: "/tutorials" },
    { name: "Comunidad", link: "/community" },
    { name: "Centro de ayuda", link: "/help" },
  ];
  
  const companyLinks = [
    { name: "Acerca de", link: "/about" },
    { name: "Blog", link: "/blog" },
    { name: "Empleo", link: "/careers" },
    { name: "Contacto", link: "/contact" },
  ];
  
  const socials = [
    {
      name: "twitter",
      icon: (
        <svg className="h-5 w-5 hover:text-[#0c7d74] transition duration-150" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
      link: "https://twitter.com/dentalove",
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="h-5 w-5 hover:text-[#0a6b63] transition duration-150" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      link: "https://linkedin.com/in/dentalove",
    },
    {
      name: "Facebook",
      icon: (
        <svg className="h-5 w-5 hover:text-[#0c7d74] transition duration-150" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      ),
      link: "https://facebook.com/dentalove",
    },
  ];

  return (
    <div className="border-t border-slate-200 py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-10">
          <div className="flex flex-col items-start">
            <Link href="/" className="font-bold text-2xl text-slate-900">
              <span className="text-[#0c7d74]">Dental</span>ove
            </Link>
            <p className="text-slate-600 mt-4 text-sm">
              Soluciones innovadoras para la gestión de clínicas dentales.
            </p>
            <div className="flex space-x-4 mt-6">
              {socials.map((socialLink, idx) => (
                <a
                  key={`social-link-${idx}`}
                  href={socialLink.link}
                  className="text-slate-500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {socialLink.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-slate-900 uppercase tracking-wider mb-4">Producto</h3>
            <ul className="space-y-3">
              {productLinks.map((link, idx) => (
                <li key={`product-link-${idx}`}>
                  <Link href={link.link} className="text-slate-600 hover:text-slate-900 text-sm transition duration-150">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-slate-900 uppercase tracking-wider mb-4">Soporte</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, idx) => (
                <li key={`support-link-${idx}`}>
                  <Link href={link.link} className="text-slate-600 hover:text-slate-900 text-sm transition duration-150">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-slate-900 uppercase tracking-wider mb-4">Empresa</h3>
            <ul className="space-y-3">
              {companyLinks.map((link, idx) => (
                <li key={`company-link-${idx}`}>
                  <Link href={link.link} className="text-slate-600 hover:text-slate-900 text-sm transition duration-150">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm">
            © {currentYear} Dentalove. Todos los derechos reservados.
          </p>
          
          <div className="flex space-x-6 mt-4 sm:mt-0">
            {navItems.map((navItem, idx) => (
              <Link
                key={`footer-nav-${idx}`}
                href={navItem.link}
                className="text-slate-500 hover:text-slate-900 text-sm transition duration-150"
              >
                {navItem.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 