import Link from "next/link";

function CardTeacher({
  teacher,
  nameSubject,
}: {
  teacher: {
    id: number;
    name: string;
    path: string;
  };
  nameSubject: string;
}) {
  return (
    <>
      <li className="py-6 px-8 bg-white dark:bg-neutral-800 shadow-md rounded-md">
        <h3 className="text-xl font-bold uppercase text-neutral-700 dark:text-neutral-50 border-b pb-4">
          {teacher.name}
        </h3>
        <p className="py-2 font-medium text-neutral-600 dark:text-neutral-300">
          N° {teacher.id}
        </p>
        <Link
          className="text-amber-500 underline"
          href={`${nameSubject}/partial/${teacher.path}`}
        >
          Parciales
        </Link>
      </li>
    </>
  );
}

export default CardTeacher;
