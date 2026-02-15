import { AppStatus } from "@/lib/contracts";

export function StatusBadge({ status }: { status: AppStatus }) {
  const isActive = status === AppStatus.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-green-950 text-green-400 ring-1 ring-green-800"
          : "bg-red-950 text-red-400 ring-1 ring-red-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-green-400" : "bg-red-400"
        }`}
      />
      {isActive ? "Active" : "Suspended"}
    </span>
  );
}
