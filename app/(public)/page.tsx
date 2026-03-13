import TypingText from "@/components/TypingText";
import Link from "next/link";

function HomePage() {
  // Si editas esto, tambien debes editar [year].astro const yearMap
  const years = ["primer", "segundo", "tercer", "cuarto", "quinto"];
  return (
    <>
      <section className="flex items-center justify-center pt-20 pb-10 px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-aos="fade-down"
            data-aos-delay="150"
            className="w-56 sm:w-64 h-56 sm:h-64 object-cover md:order-2"
            src="/megaloblastos.png"
            alt="Icono megaloblastos"
            width={300}
            height={300}
          />
          <article>
            <h1
              data-aos="fade-down"
              data-aos-delay="50"
              className="text-3xl font-bold text-neutral-800 dark:text-neutral-50"
            >
              MEDICINA
            </h1>
            <h2
              data-aos="fade-down"
              data-aos-delay="100"
              className="text-3xl font-bold text-amber-500"
            >
              F.C.S.H.
            </h2>
            <TypingText />
            <p
              data-aos="fade-up"
              data-aos-delay="50"
              className="max-w-xs text-neutral-500 dark:text-neutral-400"
            >
              La medicina es una ciencia de incertidumbre y un arte de
              probabilidad.
            </p>
            <p
              data-aos="fade-up"
              data-aos-delay="100"
              className="text-neutral-600 dark:text-neutral-300 font-bold mt-1"
            >
              - William Osler
            </p>
          </article>
        </div>
      </section>

      <h3 className="text-2xl font-bold w-[80dvw] mx-auto max-w-3xl text-neutral-600 dark:text-neutral-300 pb-10 lg:px-10">
        Materias
      </h3>
      <section
        id="section-years"
        className="w-[80dvw] mx-auto max-w-3xl pb-10 place-items-center grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:px-10"
      >
        {years.map((name, index) => (
          <Link
            key={name}
            href={`/year/${index + 1}`}
            className="fade-up-target flex-auto w-full bg-white dark:bg-neutral-800 rounded-md shadow-lg pb-8 pt-24 px-10 hover:scale-105 transition-transform duration-500 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-[5.7rem] h-[5.7rem] object-cover mx-auto"
              src="/megaloblastos.png"
              alt={`Icono ${name} año`}
              width={300}
              height={300}
            />
            <h3 className="text-neutral-600 dark:text-neutral-300 font-bold text-xl text-nowrap text-center pt-1 text-ellipsis overflow-hidden capitalize">
              {name} año
            </h3>
          </Link>
        ))}
      </section>
    </>
  );
}

export default HomePage;
