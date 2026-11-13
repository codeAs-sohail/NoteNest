export default function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`shimmer-track rounded-xl ${className}`} />;
}
