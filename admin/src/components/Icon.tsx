import type { SVGProps } from 'react';
import { Ref, forwardRef } from 'react';

const RegionFieldIcon = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={16} height={16} ref={ref} {...props}>
    <rect width={31} height={23} x={0.5} y={4.5} fill="#EAF5FF" stroke="#B8E1FF" rx={2.5} />
    <g fill="none" stroke="#0C75AF" strokeWidth={1.3}>
      <circle cx={16} cy={16} r={5.5} />
      <ellipse cx={16} cy={16} rx={2.2} ry={5.5} />
      <line x1={10.5} y1={16} x2={21.5} y2={16} />
    </g>
  </svg>
);

const ForwardRef = forwardRef(RegionFieldIcon);
export default ForwardRef;
