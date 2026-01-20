import type { ComponentProps } from "react";

type Props = ComponentProps<"svg"> & {
  title?: string;
};

export default function CloseIcon({ title = "Закрыть", ...props }: Props) {
  return (
    <svg
      width="20"
      height="12"
      viewBox="0 0 20 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...props}>
      {!!title && <title>{title}</title>}

      <g clipPath="url(#clip0_774_286)">
        <path
          d="M0.302353 0.302504C0.692878 -0.08802 1.32604 -0.08802 1.71657 0.302504L11.7068 10.2927C12.0973 10.6833 12.0973 11.3164 11.7068 11.707C11.3163 12.0975 10.6831 12.0975 10.2926 11.707L0.302353 1.71672C-0.0881715 1.32619 -0.088171 0.693029 0.302353 0.302504Z"
          fill="currentColor"
        />
        <path
          d="M0.3051 11.7032C-0.0854243 11.3127 -0.0854243 10.6795 0.3051 10.289L10.3012 0.292894C10.6917 -0.0976307 11.3249 -0.097631 11.7154 0.292893C12.1059 0.683418 12.1059 1.31658 11.7154 1.70711L1.71931 11.7032C1.32879 12.0937 0.695624 12.0937 0.3051 11.7032Z"
          fill="currentColor"
        />
      </g>

      <defs>
        <clipPath id="clip0_774_286">
          <rect width="20" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
