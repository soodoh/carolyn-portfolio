const DropdownIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="800px"
    height="800px"
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="directional" stroke="none" strokeWidth="1">
      <g id="drop-down">
        <polygon id="Shape" points="5 8 12 16 19 8" />
      </g>
    </g>
  </svg>
);

export default DropdownIcon;
