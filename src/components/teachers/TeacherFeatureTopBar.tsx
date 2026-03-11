import { useNavigate } from "react-router-dom";

type TeacherFeatureTopBarProps = {
  pageLabel: string;
  backLabel?: string;
  backPath?: string;
  rightSlotClassName?: string;
};

export function TeacherFeatureTopBar({
  pageLabel,
  backLabel = "BACK",
  backPath = "/teacher",
  rightSlotClassName = "hidden w-16 md:block",
}: TeacherFeatureTopBarProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-2 flex items-center justify-between md:mb-6">
      <button
        type="button"
        onClick={() => navigate(backPath)}
        className="flex items-center gap-1 text-sm font-bold text-blue-600"
      >
        <span className="text-lg">←</span> {backLabel}
      </button>
      <div className="text-sm font-bold tracking-tight text-gray-800 md:text-gray-400 md:tracking-widest md:uppercase">
        {pageLabel}
      </div>
      <div className={rightSlotClassName} />
    </div>
  );
}
