import type { SVGProps } from "react";
import { useId } from "react";

export default function MaxBrandIcon(props: SVGProps<SVGSVGElement>) {
  const id = useId();
  const gradId = `max_grad_${id}`;

  return (
    <svg viewBox="0 0 1055 1055" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <linearGradient id={gradId} x1="150.5" y1="199" x2="1055" y2="527.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A50FE" />
          <stop offset="1" stopColor="#A251DE" />
        </linearGradient>
      </defs>

      <circle cx="527.5" cy="527.5" r="527.5" fill={`url(#${gradId})`} />

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M534.541 865.059C465.649 865.059 433.634 855.274 377.984 816.138C342.783 860.168 231.315 894.576 226.454 835.707C226.454 791.513 216.397 754.168 204.999 713.4C191.421 663.174 176 607.24 176 526.192C176 332.624 339.263 187 532.699 187C726.3 187 877.998 339.8 877.998 527.986C878.647 713.262 724.983 864.071 534.541 865.059ZM537.392 354.313C443.188 349.584 369.77 413.019 353.511 512.494C340.101 594.847 363.904 695.136 384.186 700.355C393.907 702.637 418.379 683.395 433.634 668.557C458.857 685.508 488.228 695.688 518.785 698.073C616.394 702.639 699.798 630.345 706.355 535.487C710.169 440.429 635.014 359.916 537.392 354.476V354.313Z"
        fill="#fff"
      />
    </svg>
  );
}
