export function Card({ className = "", ...props }) {
  return (
    <div className={`rounded-2xl border border-slate-800/60 bg-slate-900/40 text-inherit ${className}`} {...props} />
  );
}
export function CardContent({ className = "", ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}
