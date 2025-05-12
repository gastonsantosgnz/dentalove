"use client";
import React from "react";

export const Footer = () => {
  return (
    <footer className="w-full py-4 text-center border-t border-neutral-100 bg-white mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-sm text-neutral-500">
          <span className="font-semibold">{new Date().getFullYear()} </span>
          &#8212; Dentalove. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};
