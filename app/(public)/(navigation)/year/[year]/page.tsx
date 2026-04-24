import CardSubject from "@/components/CardSubject";
import HeaderCards from "@/components/HeaderCards";
import { SUBJECTS } from "@/consts/SUBJECTS";
import Link from "next/link";

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;

  const yearNumber = Number(year);

  const materiasByYear = SUBJECTS.filter(
    (subject) => subject.year === yearNumber,
  );

  const reWrite: Record<number, string> = {
    1: "primer",
    2: "segundo",
    3: "tercer",
    4: "cuarto",
    5: "quinto",
  };

  return (
    <section className="w-[80dvw] mx-auto max-w-2xl">
      <HeaderCards text1="Materias de" text2={`${reWrite[yearNumber]} año`} />

      <Link href="/" className="text-amber-500 underline inline-block">
        Volver a inicio
      </Link>

      <ul className="space-y-4 pt-5 pb-10">
        {materiasByYear.map((materia) => (
          <CardSubject key={materia.name} subject={materia} />
        ))}
      </ul>
    </section>
  );
}

export function generateStaticParams() {
  return [
    { year: "1" },
    { year: "2" },
    { year: "3" },
    { year: "4" },
    { year: "5" },
  ];
}
