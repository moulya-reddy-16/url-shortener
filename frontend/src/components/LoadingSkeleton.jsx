export function CardSkeleton() {
  return (
    <div className="glass rounded-3xl p-6 border border-glass-border relative overflow-hidden animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-text-muted/15 rounded-lg"></div>
        <div className="h-8 w-8 bg-text-muted/15 rounded-lg"></div>
      </div>
      <div className="h-8 w-16 bg-text-muted/20 rounded-lg mb-2"></div>
      <div className="h-3.5 w-32 bg-text-muted/10 rounded-lg"></div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 border border-glass-border relative overflow-hidden animate-pulse flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-1/2">
        <div className="h-10 w-10 bg-text-muted/15 rounded-xl shrink-0"></div>
        <div className="space-y-2 w-full">
          <div className="h-4 w-1/3 bg-text-muted/20 rounded-lg"></div>
          <div className="h-3 w-2/3 bg-text-muted/10 rounded-lg"></div>
        </div>
      </div>
      <div className="h-8 w-24 bg-text-muted/15 rounded-xl"></div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-3xl p-6 border border-glass-border relative overflow-hidden animate-pulse h-[300px] flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-5 w-36 bg-text-muted/20 rounded-lg"></div>
        <div className="h-3.5 w-48 bg-text-muted/10 rounded-lg"></div>
      </div>
      <div className="flex-1 flex items-end gap-3 px-4 py-8">
        <div className="w-full h-[30%] bg-text-muted/10 rounded-t-lg"></div>
        <div className="w-full h-[60%] bg-text-muted/10 rounded-t-lg"></div>
        <div className="w-full h-[45%] bg-text-muted/10 rounded-t-lg"></div>
        <div className="w-full h-[75%] bg-text-muted/10 rounded-t-lg"></div>
        <div className="w-full h-[90%] bg-text-muted/10 rounded-t-lg"></div>
        <div className="w-full h-[55%] bg-text-muted/10 rounded-t-lg"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-3 w-12 bg-text-muted/10 rounded-lg"></div>
        <div className="h-3 w-12 bg-text-muted/10 rounded-lg"></div>
        <div className="h-3 w-12 bg-text-muted/10 rounded-lg"></div>
        <div className="h-3 w-12 bg-text-muted/10 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = "card" }) {
  if (type === "row") return <RowSkeleton />;
  if (type === "chart") return <ChartSkeleton />;
  return <CardSkeleton />;
}
