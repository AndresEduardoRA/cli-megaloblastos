import CardResources from "@/components/CardResources";
import { SUBJECTS } from "@/consts/SUBJECTS";
import { getSubjectSupportMaterialsByTeacher } from "@/services/subjects";

type Props = {
  params: Promise<{
    year: string;
    subject: string;
    teacher: string;
    partial: string;
  }>;
};

const reWrite: Record<string, string> = {
  "1": "Nro 1",
  "2": "Nro 2",
  "3": "Nro 3",
};

export default async function Page({ params }: Props) {
  const { year, subject, teacher, partial } = await params;

  const subjectData = SUBJECTS.find((m) => m.path === subject);
  const subjectName = subjectData?.name;
  const teacherName = subjectData?.teachers.find(
    (t) => t.path === teacher,
  )?.name;

  const subjectSupports = await getSubjectSupportMaterialsByTeacher({
    year,
    subject: subjectName ?? "",
    teacher: teacherName ?? "",
    partial,
  });

  return (
    <section className="w-[80dvw] mx-auto max-w-2xl">
      <p className="font-bold text-neutral-600 dark:text-neutral-300 text-center leading-none mt-10">
        Bienvenidos al
      </p>

      <h2 className="text-2xl sm:text-3xl md:text-4xl uppercase font-black text-neutral-800 dark:text-neutral-50 text-center">
        material de apoyo
      </h2>

      <p className="text-center font-bold text-amber-500 mb-5">
        #Megaloblastos
      </p>

      <section className="mb-5 flex flex-col justify-center items-center">
        <p className="font-bold capitalize text-neutral-800 dark:text-neutral-200">
          año: <span className="font-normal capitalize">{year}</span>
        </p>

        <p className="font-bold capitalize text-neutral-800 dark:text-neutral-200">
          materia: <span className="font-normal capitalize">{subjectName}</span>
        </p>

        <p className="font-bold capitalize text-neutral-800 dark:text-neutral-200">
          docente: <span className="font-normal capitalize">{teacherName}</span>
        </p>

        <p className="font-bold capitalize text-neutral-800 dark:text-neutral-200">
          parcial:{" "}
          <span className="font-normal capitalize">{reWrite[partial]}</span>
        </p>
      </section>

      <ul className="space-y-4 pt-5 pb-10">
        {subjectSupports.length === 0 ? (
          <div className="dark:text-neutral-300">
            <p className="block">Sección vacía, pide material de apoyo en el chat global</p>
          </div>
        ) : (
          subjectSupports.map((subject) => (
            <CardResources key={subject.id} subject={subject} />
          ))
        )}
      </ul>
    </section>
  );
}

export const revalidate = 3600;

export function generateStaticParams() {
  const params: { year: string; subject: string; teacher: string; partial: string }[] = [];
  for (const subject of SUBJECTS) {
    for (const teacher of subject.teachers) {
      for (const partial of ["1", "2", "3"]) {
        params.push({
          year: subject.year.toString(),
          subject: subject.path,
          teacher: teacher.path,
          partial,
        });
      }
    }
  }
  return params;
}
