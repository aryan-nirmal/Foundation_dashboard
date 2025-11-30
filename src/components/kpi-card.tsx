import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type KpiCardProps = {
  label: string;
  value: string | number;
  caption?: string;
};

export function KpiCard({ label, value, caption }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-4xl font-bold text-slate-900">{value}</p>
        {caption && <p className="text-base text-muted">{caption}</p>}
      </CardContent>
    </Card>
  );
}

