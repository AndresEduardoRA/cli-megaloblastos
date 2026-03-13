import Link from "next/link";

function CardSubject({
  subject,
}: {
  subject: {
    name: string;
    path: string;
    sigla: string;
    year: number;
    multigrupo: boolean;
    semester: boolean;
  };
}) {
  return (
    <>
      <li className="py-6 px-8 bg-white dark:bg-neutral-800 shadow-md rounded-md">
        <h3 className="text-xl font-bold uppercase text-neutral-700 dark:text-neutral-50 border-b pb-4">
          {subject.name}
        </h3>
        <p className="py-4 font-medium text-neutral-600 dark:text-neutral-300">
          Sigla: <span className="uppercase">{subject.sigla}</span>
        </p>
        <div className="flex justify-between flex-wrap items-center">
          <Link
            className="text-amber-500 underline"
            href={`${subject.multigrupo ? `${subject.year}/partial/${subject.path}` : `${subject.year}/subject/${subject.path}`}`}
          >
            {subject.multigrupo ? `Parciales` : `Docentes`}
          </Link>
          {subject.semester ? (
            <p className="font-medium text-neutral-600 dark:text-neutral-300">
              Materia semestral
            </p>
          ) : (
            <p className="font-medium text-neutral-600 dark:text-neutral-300">
              Materia anual
            </p>
          )}
        </div>
      </li>
    </>
  );
}

export default CardSubject;
