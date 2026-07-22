// Standard page title + subtitle with an optional actions slot on the right.
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="ah-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2 align-items-center">{actions}</div>}
    </div>
  );
}
