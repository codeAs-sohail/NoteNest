export default function GlassCard({ as: Element = 'div', className = '', interactive = false, ...props }) {
  return <Element className={`${interactive ? 'glass-card cursor-spotlight' : 'glass'} rounded-2xl ${className}`} {...props} />;
}
