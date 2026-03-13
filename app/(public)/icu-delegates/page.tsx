import { ICUS } from "@/consts/ICUS";

export default function DelegadosICU() {
  return (
    <>
      <p
        data-aos="fade-down"
        data-aos-delay="50"
        className="font-bold text-neutral-600 dark:text-neutral-300 text-center leading-none mt-10"
      >
        Lista de
      </p>
      <h2
        data-aos="fade-up"
        data-aos-delay="50"
        className="text-2xl sm:text-3xl md:text-4xl uppercase font-black text-neutral-800 dark:text-neutral-50 text-center max-w-2xl mx-auto"
      >
        Delegados Ilustre Consejo Universitario
      </h2>
      <p
        data-aos="fade-up"
        data-aos-delay="100"
        className="text-center font-bold text-amber-500 mb-5"
      >
        #M.G.S.-I.C.U.
      </p>

      <section className="w-[80dvw] mx-auto max-w-2xl flex flex-col justify-start gap-16 pb-20">
        {ICUS.map((plancha) => (
          <article
            key={plancha.name}
            className="flex flex-col md:flex-row gap-4 items-center justify-center mx-auto md:ml-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={plancha.image}
              alt={plancha.name}
              width={208}
              height={260}
              loading="lazy"
              className="w-52 h-auto"
            />
            <div className="space-y-4 text-center md:text-left dark:text-neutral-50">
              <h2 className="text-3xl font-bold">{plancha.name}</h2>
              <p className="text-xl font-medium font-kalam">{plancha.cargo}</p>

              <a
                target="_blank"
                href={
                  "https://api.whatsapp.com/send?phone=591" +
                  plancha.number +
                  "&text=Hola%2C%20te%20escribo%20desde%20la%20p%C3%A1gina%20de%20Megaloblastos.%20Necesito%20tu%20ayuda"
                }
                rel="noopener noreferrer"
                className="inline-block py-2 px-8 bg-green-500 text-neutral-50 rounded-lg"
              >
                <p className="leading-none">Contactar</p>
              </a>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
