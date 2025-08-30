import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Actions() {
  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        className="hidden md:inline-flex h-9 md:h-10 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400  hover:text-black"
      >
        <Link to="/admissions">Enroll</Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="h-9 md:h-10 px-3 border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60  hover:text-black"
      >
        <Link to="/events" className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" /> Events
        </Link>
      </Button>
    </div>
  );
}
