import { Instagram, Github, Mail, Globe, FacebookIcon, Youtube } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Historia */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-neutral-800 dark:text-white">
          Nuestra Historia
        </h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Megaloblastos nació como una iniciativa de estudiantes de medicina
            para facilitar el acceso a materiales de estudio y servicios
            esenciales dentro de nuestra facultad. Con el tiempo, nos hemos
            convertido en un referente de apoyo académico y servicios
            estudiantiles, siempre con el objetivo de mejorar la calidad de vida
            de nuestros compañeros.
          </p>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Desde el alquiler de batas hasta la gestión de salas de estudio,
            cada servicio ha sido diseñado pensando en las necesidades reales
            del estudiante de medicina. Nuestra misión es seguir creciendo y
            digitalizando procesos para que el estudio sea la única preocupación
            de nuestros miembros.
          </p>
        </div>
      </section>

      {/* Redes Sociales */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
          Síguenos en nuestras redes
        </h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://www.facebook.com/profile.php?id=61564395094002"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FacebookIcon size={20} />
            <span>Facebook</span>
          </a>
          <a
            href="https://www.instagram.com/mega_loblastos"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            <Instagram size={20} />
            <span>Instagram</span>
          </a>
          <a
            href="https://www.youtube.com/@MEGALOBLASTOS"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-sm"
          >
            <Youtube />
            <span>Youtube</span>
          </a>
        </div>
      </section>

      {/* Desarrollador */}
      <section className="p-8 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
            AA
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
              Desarrollado por Andres Alpiri
            </h2>
            <p className="text-amber-700 dark:text-amber-400 font-medium">
              Desarrollador de software
            </p>
          </div>
        </div>

        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Este sistema ha sido diseñado y desarrollado por Andres Alpiri, enfocándose en
          crear una experiencia de usuario fluida y eficiente para la comunidad
          de Megaloblastos.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href="https://me.niuvu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <Globe size={18} />
            <span>Andres Alpiri</span>
          </a>
          <a
            href="https://github.com/AndresEduardoRA"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <Github size={18} />
            <span>@AndresEduardoRA</span>
          </a>
          <a
            href="mailto:andres.ra@niuvu.com"
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <Mail size={18} />
            <span>andres.ra@niuvu.com</span>
          </a>
        </div>
      </section>
    </div>
  );
}
