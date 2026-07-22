/* MOTORA — tactical line-icon set (original inline SVG, stroke-based, no emoji). */

const I = ({ children, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

export const IconLogo = (p) => (
  <I {...p}><path d="M3 17 L9 6 L12 12 L15 6 L21 17" /></I>
);
export const IconCar = (p) => (
  <I {...p}><path d="M3 16 L4.5 10.5 Q5 9 7 8.8 L10 6.6 Q13.5 5.4 16.4 6.8 L18.6 9 Q20.8 9.6 21 11.5 L21 16" />
    <circle cx="7.4" cy="16.4" r="1.9" /><circle cx="16.8" cy="16.4" r="1.9" /><path d="M9.4 16.4 h5.2" /></I>
);
export const IconBike = (p) => (
  <I {...p}><circle cx="5.6" cy="16" r="3.4" /><circle cx="18.4" cy="16" r="3.4" />
    <path d="M5.6 16 L10 9.5 L14.5 10 L16.4 6.8 M14.9 6.5 h3 M10 9.5 L12.6 16" /></I>
);
export const IconBolt = (p) => (<I {...p}><path d="M13 2 L5 13 h5 L10.5 22 L19 10 h-5.4 Z" /></I>);
export const IconGauge = (p) => (
  <I {...p}><path d="M4 18 a9 9 0 1 1 16 0" /><path d="M12 13 L16.4 8.6" /><circle cx="12" cy="13" r="1.3" /></I>
);
export const IconShield = (p) => (<I {...p}><path d="M12 3 L20 6 v6 q0 5.5 -8 9 q-8 -3.5 -8 -9 V6 Z" /></I>);
export const IconStar = (p) => (
  <I {...p}><path d="M12 3.5 l2.5 5.3 5.8 .7 -4.3 4 1.1 5.7 -5.1 -2.8 -5.1 2.8 1.1 -5.7 -4.3 -4 5.8 -.7 Z" /></I>
);
export const IconHeart = ({ filled, ...p }) => (
  <I {...p}><path d="M12 20 Q4 14.5 4 9.4 Q4 5.8 7.3 5.2 Q10 4.8 12 7.6 Q14 4.8 16.7 5.2 Q20 5.8 20 9.4 Q20 14.5 12 20 Z"
    fill={filled ? "currentColor" : "none"} /></I>
);
export const IconDuel = (p) => (
  <I {...p}><path d="M8 7 L3 12 L8 17 M16 7 L21 12 L16 17 M10 12 h4" /></I>
);
export const IconSearch = (p) => (<I {...p}><circle cx="10.5" cy="10.5" r="6.2" /><path d="M15.2 15.2 L21 21" /></I>);
export const IconMenu = (p) => (<I {...p}><path d="M4 7 h16 M4 12 h16 M4 17 h16" /></I>);
export const IconX = (p) => (<I {...p}><path d="M6 6 L18 18 M18 6 L6 18" /></I>);
export const IconChevron = (p) => (<I {...p}><path d="M9 5 L16 12 L9 19" /></I>);
export const IconGrid = (p) => (
  <I {...p}><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" />
    <rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></I>
);
export const IconRows = (p) => (
  <I {...p}><rect x="4" y="5" width="16" height="5.4" /><rect x="4" y="13.6" width="16" height="5.4" /></I>
);
export const IconSignal = (p) => (<I {...p}><path d="M4 19 v-4 M9.4 19 v-8 M14.7 19 v-12 M20 19 V3" /></I>);
export const IconFlag = (p) => (<I {...p}><path d="M6 21 V4 M6 4 h11 l-2.5 3.5 L17 11 H6" /></I>);
export const IconWrench = (p) => (
  <I {...p}><path d="M14.5 6.5 a4.5 4.5 0 1 0 3 3 L21 13 l-2.5 2.5 -3.5 -3.5 a4.5 4.5 0 0 1 -4 -4 Z" transform="rotate(90 12 12)" /></I>
);
export const IconFilter = (p) => (<I {...p}><path d="M4 6 h16 M7 12 h10 M10 18 h4" /></I>);
