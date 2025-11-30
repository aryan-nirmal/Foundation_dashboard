import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">
          Welcome back
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">
          Foundation Management Dashboard
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Quick overview of residents, staff, donations, and visitors. All data
          is synced online, so the entire team works off the latest information.
        </p>
      </div>
      <DashboardContent />
    </section>
  );
}
