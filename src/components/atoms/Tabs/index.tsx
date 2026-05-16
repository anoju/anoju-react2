export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const Tabs = ({ items, value, onChange, label, className = '' }: TabsProps) => {
  const classNames = ['tabs', className].join(' ').trim();

  return (
    <div className={classNames}>
      <div className="tabs__list" role="tablist" aria-label={label}>
        {items.map((item) => {
          const isSelected = item.value === value;

          return (
            <button
              key={item.value}
              type="button"
              className="tabs__item"
              role="tab"
              aria-selected={isSelected}
              data-selected={isSelected || undefined}
              disabled={item.disabled}
              onClick={() => onChange(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
