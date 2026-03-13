import Link from "next/link";

interface CardPartialProps {
  item: 1 | 2 | 3;
  teacher: string;
  subject?: string;
  isMultigroup?: boolean;
}

export default function CardPartial({
  item,
  teacher,
  subject,
  isMultigroup = false,
}: CardPartialProps) {
  const reWrite: Record<number, string> = {
    1: "primer",
    2: "segundo",
    3: "tercer",
  };

  const href = isMultigroup
    ? `${subject}/support-material/${item}`
    : `${teacher}/support-material/${item}`;

  return (
    <li className="py-6 px-8 bg-white dark:bg-neutral-800 shadow-md rounded-md">
      <h3 className="text-xl font-bold uppercase text-neutral-700 dark:text-neutral-200 border-b pb-2 mb-2">
        {reWrite[item]} parcial
      </h3>

      <nav className="flex gap-2 flex-wrap justify-between">
        <Link className="text-amber-500 underline" href={href}>
          Ver
        </Link>
      </nav>
    </li>
  );
}
