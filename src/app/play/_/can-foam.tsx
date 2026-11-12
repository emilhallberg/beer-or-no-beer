import type { CSSProperties } from "react";

export default function CanFoam() {
  return (
    <div className="can-foam" aria-hidden="true">
      <span className="foam-jet" />
      <span className="foam-crown" />
      {Array.from({ length: 16 }, (_, index) => (
        <span
          key={index}
          className="foam-droplet"
          style={
            {
              "--foam-x": `${(index % 2 ? 1 : -1) * (20 + index * 7)}px`,
              "--foam-rise": `${-50 - (index % 5) * 19}px`,
              "--foam-size": `${5 + (index % 4) * 3}px`,
              "--foam-delay": `${90 + (index % 4) * 28}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
