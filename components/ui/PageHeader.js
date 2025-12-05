'use client';

export default function PageHeader({ 
  title, 
  description, 
  icon: Icon,
  action,
  children 
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-shopify-accent-primary/20 rounded-shopify flex items-center justify-center">
              <Icon className="w-6 h-6 text-shopify-accent-primary" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {description && (
              <p className="text-sm text-shopify-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}