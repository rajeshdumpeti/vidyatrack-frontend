type PlatformCreateSchoolSelectionGridProps = {
  options: readonly string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  selectedClassName: string;
  idleClassName: string;
  columnsClassName: string;
  labelTransform?: (value: string) => string;
  inputClassName?: string;
};

export function PlatformCreateSchoolSelectionGrid({
  options,
  selectedValues,
  onToggle,
  selectedClassName,
  idleClassName,
  columnsClassName,
  labelTransform,
  inputClassName = "sr-only",
}: PlatformCreateSchoolSelectionGridProps) {
  return (
    <div className={columnsClassName}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        return (
          <label
            key={option}
            className={[
              "flex cursor-pointer items-center rounded-lg border px-3 py-2 text-sm font-semibold",
              isSelected ? selectedClassName : idleClassName,
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(option)}
              className={inputClassName}
            />
            {labelTransform ? labelTransform(option) : option}
          </label>
        );
      })}
    </div>
  );
}
