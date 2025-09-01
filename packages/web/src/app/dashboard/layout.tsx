import { ReactNode } from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <header className="border-b px-4 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="font-semibold">
          RollCall
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="hover:underline">
            Availability
          </Link>
          <Link href="/dashboard/drills" className="hover:underline">
            Drills
          </Link>
          <Link href="/dashboard/reports" className="hover:underline">
            Reports
          </Link>
        </nav>
        <div className="ml-auto">
          <form action="/signout" method="post">
            <button className="text-sm underline">Sign out</button>
          </form>
        </div>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}

