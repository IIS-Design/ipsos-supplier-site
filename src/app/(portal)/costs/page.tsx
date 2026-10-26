import { notFound } from "next/navigation";
import { CostsWorkspace } from "@/features/costs/components/costs-workspace";
import { getCurrentUser } from "@/lib/auth/session";
import { getCosts } from "@/services/cost-service";
import { getProjects } from "@/services/project-service";
import { getSubsamples } from "@/services/subsample-service";
import { getSupplier } from "@/services/supplier-service";
import { getUsers } from "@/services/user-service";

export default async function CostsRoute() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const [costs, projects, subsamples, supplier, users] = await Promise.all([
    getCosts(user.supplierId),
    getProjects(user.supplierId),
    getSubsamples(user.supplierId),
    getSupplier(user.supplierId),
    getUsers(user.supplierId),
  ]);
  if (!supplier) notFound();

  return (
    <CostsWorkspace
      costs={costs}
      projects={projects}
      subsamples={subsamples}
      supplierName={supplier.name}
      users={users}
      userRole={user.role}
    />
  );
}
