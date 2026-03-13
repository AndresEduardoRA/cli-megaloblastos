import { ExternalLink, FileText } from "lucide-react";

function CardResources({
  subject,
}: {
  subject: {
    type: string;
    url: string;
  };
}) {
  return (
    <li className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-lg">
          <FileText size={22} />
        </div>

        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 leading-snug line-clamp-2">
          {subject.type}
        </h3>
      </div>

      <a
        href={subject.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center justify-center gap-2 bg-primary bg-orange-500 text-white font-medium px-4 py-2.5 rounded-lg transition-colors duration-200 hover:scale-[1.02]"
      >
        Ver recursos
        <ExternalLink size={16} />
      </a>
    </li>
  );
}

export default CardResources;
