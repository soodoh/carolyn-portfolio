const LeftChevron = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <g>
        <polyline
          fill="none"
          points="15.5 5 8.5 12 15.5 19"
          strokeLinecap="square"
          strokeWidth="2"
        />
      </g>
    </g>
  </svg>
);

export default LeftChevron;
