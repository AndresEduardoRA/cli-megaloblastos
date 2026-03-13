import CardPartial from "@/components/CardPartial";
import HeaderCards from "@/components/HeaderCards";

type Props = {
  params: Promise<{
    teacher: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { teacher } = await params;

  return (
    <section className="w-[80dvw] mx-auto max-w-2xl">
      <HeaderCards text1="Parciales del docente" text2={teacher} />

      <ul className="space-y-4 pt-5 pb-10">
        {([1, 2, 3] as const).map((item, index) => (
          <CardPartial key={index} item={item} teacher={teacher} />
        ))}
      </ul>
    </section>
  );
}
