/* eslint-disable @next/next/no-img-element */
import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";
type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate: number;
  };
  imagePath: string;
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

// export function OverviewCard({ label, data, Icon }: PropsType) {
export function OverviewCard({ label, data, imagePath  }: PropsType) {

  const isDecreasing = data.growthRate < 0;

  return (
    // <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark hover:bg-blue-100 transition-colors duration-200">

      {/* <Icon /> */}
      <img src={imagePath} alt={label} className="h-20 w-20 object-contain" />

      <div className="mt-6 flex items-end justify-between">
        <dl className="flex flex-col items-center text-center">
          <dt className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
            {data.value}
          </dt>

          {/* <dd className="text-sm font-medium text-dark-6">{label}</dd> */}
        </dl>

        <dl
          className={cn(
            "text-sm font-medium",
            isDecreasing ? "text-red" : "text-green",
          )}
        >
          {/* <dt className="flex items-center gap-1.5">
            {data.growthRate}%
            {isDecreasing ? (
              <ArrowDownIcon aria-hidden />
            ) : (
              <ArrowUpIcon aria-hidden />
            )}
          </dt> */}

          <dd className="sr-only">
            {label} {isDecreasing ? "Decreased" : "Increased"} by{" "}
            {data.growthRate}%
          </dd>
        </dl>
      </div>
    </div>
  );
}
