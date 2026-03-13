import { getMaterialsAction } from "@/actions/materials";
import MaterialsTable from "@/components/MaterialsTable";

export default async function PrivateMaterialsPage() {
  const { data, count } = await getMaterialsAction({
    page: 1,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <MaterialsTable initialMaterials={data} total={count} />
    </div>
  );
}
