import HeaderCards from "@/components/HeaderCards";
import { IRONS } from "@/consts/IRONS";

// IRONS
export default function PlanchaCEM() {
  return (
    <>
      <HeaderCards
        text1="Lista de integrantes"
        text2="Centro Interno De Medicina"
      />

      <section className="w-[80dvw] mx-auto max-w-2xl flex flex-col justify-start gap-16 pb-20">
        {IRONS.map((iron) => (
          <article
            key={iron.name}
            className="flex flex-col md:flex-row gap-4 items-center justify-center mx-auto md:ml-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iron.image}
              alt={iron.name}
              width={208}
              height={260}
              loading="lazy"
              className="w-52 h-auto"
            />
            <div className="space-y-4 dark:text-neutral-50 text-center md:text-left">
              <h2 className="text-3xl font-bold">{iron.name}</h2>
              <p className="text-xl font-medium font-kalam">{iron.cargo}</p>

              <a
                target="_blank"
                href={
                  "https://api.whatsapp.com/send?phone=591" +
                  iron.number +
                  "&text=Hola%2C%20te%20escribo%20desde%20la%20p%C3%A1gina%20de%20Megaloblastos.%20Necesito%20tu%20ayuda."
                }
                rel="noopener noreferrer"
                className="inline-block py-2 px-8 bg-green-500 text-neutral-50 rounded-lg"
              >
                <p className="leading-none text-center">Contactar</p>
              </a>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
