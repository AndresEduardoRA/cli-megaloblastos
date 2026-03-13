import Link from "next/link";

import HeaderCards from "@/components/HeaderCards";

export default function Page() {
  return (
    <>
      <HeaderCards text1="Bienvenidos a" text2="Servicios CEM" />

      <section className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
          {/* Card Alquiler Batas */}
          <Link
            href="/cem-services/robe-rental"
            className="fade-up-target flex-auto w-full bg-white dark:bg-neutral-800 rounded-md shadow-lg pb-8 pt-24 px-10 hover:scale-105 transition-transform duration-500 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-[5.7rem] h-[5.7rem] object-cover mx-auto"
              src="/megaloblastos.png"
              alt="Icono alquiler de batas"
              width={300}
              height={300}
            />

            <h3 className="text-neutral-600 dark:text-neutral-300 font-bold text-xl text-nowrap text-center pt-1 text-ellipsis overflow-hidden capitalize">
              Alquiler de batas
            </h3>
          </Link>

          {/* Card Sala Estudio */}
          <Link
            href="/cem-services/study-room"
            className="fade-up-target flex-auto w-full bg-white dark:bg-neutral-800 rounded-md shadow-lg pb-8 pt-24 px-10 hover:scale-105 transition-transform duration-500 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-[5.7rem] h-[5.7rem] object-cover mx-auto"
              src="/megaloblastos.png"
              alt="Icono sala de estudio"
              width={300}
              height={300}
            />

            <h3 className="text-neutral-600 dark:text-neutral-300 font-bold text-xl text-nowrap text-center pt-1 text-ellipsis overflow-hidden capitalize">
              Sala de estudio
            </h3>
          </Link>
        </div>
      </section>
    </>
  );
}
