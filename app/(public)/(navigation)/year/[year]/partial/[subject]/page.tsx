import CardPartial from "@/components/CardPartial";
import HeaderCards from "@/components/HeaderCards";
import { SUBJECTS } from "@/consts/SUBJECTS";
import Link from "next/link";

export default async function PublicPartialMaterialSupportPage({
  params,
}: {
  params: Promise<{
    subject: string;
    teacher: string;
  }>;
}) {
  const { subject, teacher } = await params;

  const subjectFiltered = SUBJECTS.filter((m) => m.path === subject);

  const subjectName = subjectFiltered[0].name;

  return (
    <>
      <section className="w-[80dvw] mx-auto max-w-2xl">
        <HeaderCards text1="Parciales de" text2={subjectName} />

        <ul className="space-y-4 pt-5 pb-10">
          {([1, 2, 3] as const).map((item, index) => (
            <CardPartial
              key={index}
              item={item}
              teacher={teacher}
              isMultigroup={true}
              subject={subject}
            />
          ))}

          {subject === "Cirugía 2" && (
            <li className="py-6 px-8 bg-white dark:bg-neutral-800 shadow-md rounded-md">
              <h3 className="text-xl font-bold uppercase text-neutral-700 dark:text-neutral-50 border-b pb-4">
                Viruez Soleto Erwin
              </h3>

              <p className="py-2 font-medium text-neutral-600 dark:text-neutral-300">
                N° 64
              </p>

              <Link
                className="text-amber-500 underline"
                href={`/years/4/materias/Cirugía 2/parciales/Viruez Soleto Erwin`}
              >
                Parciales
              </Link>
            </li>
          )}

          {subject === "Cirugía 3" && (
            <li className="py-6 px-8 bg-white dark:bg-neutral-800 shadow-md rounded-md">
              <h3 className="text-xl font-bold uppercase text-neutral-700 dark:text-neutral-50 border-b pb-4">
                Jorge Fernando Aparicio
              </h3>

              <p className="py-2 font-medium text-neutral-600 dark:text-neutral-300">
                N° 91
              </p>

              <Link
                className="text-amber-500 underline"
                href={`/years/4/materias/Cirugía 2/parciales/Jorge Fernando Aparicio`}
              >
                Parciales
              </Link>
            </li>
          )}
        </ul>
      </section>
    </>
  );
}
