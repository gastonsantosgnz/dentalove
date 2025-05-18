import React from "react";
import Image from "next/image";

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  image: string;
};

export function Testimonials() {
  const testimonials = [
    {
      quote: "Dentalove ha transformado la forma en que administro mi clínica dental. El seguimiento de pacientes es mucho más sencillo ahora.",
      author: "Dra. María Rodríguez",
      role: "Odontóloga General",
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      quote: "Con este sistema, hemos aumentado nuestra retención de pacientes en un 35%. La gestión de planes dentales es muy intuitiva.",
      author: "Dr. Carlos Méndez",
      role: "Director Clínico",
      image: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      quote: "La interfaz es tan fácil de usar que mi equipo pudo adaptarse rápidamente. El soporte técnico es excelente.",
      author: "Dra. Ana Gómez",
      role: "Ortodoncista",
      image: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
      quote: "Desde que implementamos Dentalove, hemos notado una mejora significativa en la organización de nuestra clínica y la satisfacción de nuestros pacientes.",
      author: "Dr. Jorge Pérez",
      role: "Cirujano Maxilofacial",
      image: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      quote: "El sistema de seguimiento de tratamientos me permite tener un control preciso sobre el progreso de cada paciente. Es una herramienta indispensable.",
      author: "Dra. Laura Torres",
      role: "Periodoncista",
      image: "https://randomuser.me/api/portraits/women/3.jpg"
    }
  ];

  return (
    <div
      id="testimonials"
      className="px-4 bg-white py-20 md:py-40 relative group overflow-hidden"
    >
      <div className="max-w-xl md:mx-auto md:text-center xl:max-w-none relative z-10">
        <h2 className="font-display text-3xl tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
          Lo que dicen nuestros usuarios
        </h2>
        <p className="mt-6 text-lg tracking-tight text-zinc-600">
          Profesionales dentales que confían en Dentalove para mejorar su práctica diaria
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
        {testimonials.map((testimonial, idx) => (
          <TestimonialCard 
            key={`testimonial-${idx}`} 
            quote={testimonial.quote}
            author={testimonial.author}
            role={testimonial.role}
            image={testimonial.image}
          />
        ))}
      </div>
    </div>
  );
}

const TestimonialCard = ({
  quote,
  author,
  role,
  image,
}: Testimonial) => {
  return (
    <div className="shadow-lg px-8 py-12 rounded-xl border h-full flex flex-col">
      <p className="text-lg md:text-xl font-normal text-zinc-700 leading-relaxed flex-grow">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex flex-row space-x-3 mt-8 items-center">
        <Image
          src={image}
          alt={author}
          className="h-12 w-12 rounded-full border border-gray-100 object-cover"
          width={48}
          height={48}
        />

        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-800">{author}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
}; 