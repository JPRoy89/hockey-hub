import { LineBuilderClient } from "@/components/lineup/LineBuilderClient";
import { Layers } from "lucide-react";

export const metadata = {
  title: "Line Builder — HockeyHub",
  description: "Construis l'alignement parfait avec drag & drop et vois l'impact sur la masse salariale.",
};

export default function LineBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-orange-600/20">
          <Layers className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Line Builder</h1>
          <p className="text-sm text-muted-foreground">
            Construis ton alignement idéal · Calcul du cap en temps réel
          </p>
        </div>
      </div>
      <LineBuilderClient />
    </div>
  );
}
