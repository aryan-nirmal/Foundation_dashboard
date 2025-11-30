"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/lib/data-service";
import { KpiCard } from "../kpi-card";
import { MonthlyDonationsChart } from "../charts/monthly-donations-chart";
import { VisitorTrafficChart } from "../charts/visitor-traffic-chart";
import { StaffDistributionChart } from "../charts/staff-distribution-chart";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { formatDate } from "@/lib/formatters";

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
});

export function DashboardContent() {
  const { data: residentData = [] } = useQuery({
    queryKey: ["residents"],
    queryFn: dataService.residents,
  });
  const { data: staffData = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: dataService.staff,
  });
  const { data: donationData = [] } = useQuery({
    queryKey: ["donations"],
    queryFn: dataService.donations,
  });
  const { data: visitorData = [] } = useQuery({
    queryKey: ["visitors"],
    queryFn: dataService.visitors,
  });

  const today = new Date().toISOString().slice(0, 10);

  const totalDonationsThisMonth = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return donationData
      .filter((donation) => {
        const date = new Date(donation.donation_date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .reduce((sum, donation) => sum + donation.amount, 0);
  }, [donationData]);

  const todaysVisitors = visitorData.filter(
    (visitor) => visitor.visit_date === today,
  ).length;

  const donationChart = useMemo(() => {
    const buckets = new Map<number, number>();
    donationData.forEach((donation) => {
      const date = new Date(donation.donation_date);
      if (Number.isNaN(date.valueOf())) return;
      const key = date.getFullYear() * 100 + (date.getMonth() + 1);
      buckets.set(key, (buckets.get(key) ?? 0) + donation.amount);
    });
    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([key, amount]) => {
        const year = Math.floor(key / 100);
        const month = (key % 100) - 1;
        const label = monthFormatter.format(new Date(year, month, 1));
        return { month: label, amount };
      });
  }, [donationData]);

  const visitorChart = useMemo(() => {
    const byDay = new Map<number, number>();
    visitorData.forEach((visitor) => {
      const date = new Date(visitor.visit_date);
      if (Number.isNaN(date.valueOf())) return;
      const key = date.getTime();
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    });
    return Array.from(byDay.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([timestamp, visitors]) => ({
        day: formatDate(new Date(timestamp).toISOString().slice(0, 10)),
        visitors,
      }));
  }, [visitorData]);

  const staffDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    staffData.forEach((member) => {
      counts.set(member.department, (counts.get(member.department) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([department, value]) => ({
      department,
      value,
    }));
  }, [staffData]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Residents" value={residentData.length} />
        <KpiCard
          label="Active Staff"
          value={staffData.filter((member) => member.status === "Active").length}
        />
        <KpiCard
          label="Donations This Month"
          value={`₹${(totalDonationsThisMonth / 1000).toFixed(1)}k`}
          caption="Online + Offline"
        />
        <KpiCard label="Today's Visitors" value={todaysVisitors} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <MonthlyDonationsChart data={donationChart} />
        <VisitorTrafficChart data={visitorChart} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <StaffDistributionChart data={staffDistribution} />
        <Card>
          <CardHeader>
            <CardTitle>Important Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base text-slate-700">
            <div className="rounded-2xl bg-brand-light px-4 py-3">
              <p className="font-semibold text-brand-dark">
                Medical camp scheduled
              </p>
              <p>Saturday, 30 Nov • 9:00 AM</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <p className="font-semibold text-slate-900">
                Pending admissions review
              </p>
              <p>3 new residents waiting for approval.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

