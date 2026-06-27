import { TradeBuilderClient } from "@/components/trade/TradeBuilderClient";
import { ArrowLeftRight } from "lucide-react";

export const metadata = {
  title: "Mock Trade Builder — HockeyHub",
  description: "Simule des trades NHL, vérifie la légalité du cap et analyse l'impact sur chaque équipe.",
};

export default function TradeBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-600/20">
          <ArrowLeftRight className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mock Trade Builder</h1>
          <p className="text-sm text-muted-foreground">
            Simule des trades entre équipes NHL · Validation cap automatique
          </p>
        </div>
      </div>
      <TradeBuilderClient />
    </div>
  );
}
