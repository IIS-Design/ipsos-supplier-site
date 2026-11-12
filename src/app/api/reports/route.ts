import { NextResponse } from "next/server";
import { createReportSchema } from "@/features/reports/report-options";
import { getSupplierPreferences } from "@/services/settings-service";
import { createReport } from "@/services/report-service";
import { getCurrentUser } from "@/lib/auth/session";
import type { ReportScope } from "@/types/scopes";
import type { ReportType } from "@/types/report";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { message: "Sign in to create a report." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid report request." },
      { status: 400 },
    );
  }

  const result = createReportSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        message: "Check the report details and try again.",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const values = result.data;
  const preferences = await getSupplierPreferences(user.supplierId);
  if (values.timeZone !== preferences.organization.timeZone) return NextResponse.json({ message: "Organization time zone changed. Reload the form and try again." }, { status: 400 });
  const scope = values.scope as ReportScope;
  const { type: _type, scope: _scope, ...parameters } = values;
  void _type; void _scope;

  try {
    const report = await createReport({
      supplierId: user.supplierId,
      requestedByUserId: user.id,
      scope,
      type: values.type as ReportType,
      parameters,
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Unable to create report", error);
    return NextResponse.json(
      { message: "The report could not be queued. Please try again." },
      { status: 400 },
    );
  }
}
