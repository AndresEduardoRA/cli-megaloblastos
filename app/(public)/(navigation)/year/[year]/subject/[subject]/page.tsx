import CardTeacher from "@/components/CardTeacher";
import HeaderCards from "@/components/HeaderCards";
import { SUBJECTS } from "@/consts/SUBJECTS";

async function PageSubject({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;

  const subjectFiltered = SUBJECTS.filter((m) => m.path === subject);

  return (
    <>
      <section className="w-[80dvw] mx-auto max-w-2xl">
        <HeaderCards text1="Docentes de" text2={subject} />
        <ul className="space-y-4 pt-5 pb-10">
          {subjectFiltered[0].teachers.map((teacher) => (
            <CardTeacher
              key={teacher.id}
              teacher={teacher}
              nameSubject={subject}
            />
          ))}
        </ul>
      </section>
    </>
  );
}

export default PageSubject;

export function generateStaticParams() {
  return SUBJECTS.map((subject) => ({
    year: subject.year.toString(),
    subject: subject.path,
  }));
}
