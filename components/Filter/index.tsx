import Dropdown from "@/components/Dropdown";
import styles from "./filter.module.css";

const Filter = <T extends string>({
  current,
  options,
  onChange,
}: {
  current: T;
  options: T[];
  onChange: (name: T) => void;
}) => {
  return (
    <section className={styles.container}>
      <div role="tablist" className={styles.filterButtons}>
        {options.map((name, index) => (
          <button
            key={`filter-${index}-${name}`}
            role="tab"
            aria-label={`Choose filter: ${name}`}
            className={`${styles.filter} ${current === name ? styles.active : ""}`}
            onClick={() => onChange(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className={styles.filterDropdown}>
        <Dropdown current={current} options={options} onChange={onChange} />
      </div>
    </section>
  );
};

export default Filter;
