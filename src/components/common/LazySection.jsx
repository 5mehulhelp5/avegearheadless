import React, { useState, useEffect, useRef } from 'react';

/**
 * A wrapper component that only renders its children when it enters the viewport.
 * Useful for components below the fold.
 */
const LazySection = ({ children, height = '300px', offset = '200px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: offset }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [offset]);

  return (
    <div ref={sectionRef} style={{ minHeight: isVisible ? 'auto' : height }}>
      {isVisible ? children : null}
    </div>
  );
};

export default LazySection;
