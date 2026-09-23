import { useState, useEffect } from 'react';
import slide1 from '../assets/slides-01.jpg';
import slide2 from '../assets/slides-02.jpg';
import slide3 from '../assets/slides-03.jpg';
import slide4 from '../assets/slides-04.jpg';

const images = [slide1, slide2, slide3, slide4];

export default function Slider({ slideInterval = 9000, isPaused = false }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, slideInterval);

    return () => clearInterval(timer);
  }, [slideInterval, isPaused]);

  return (
    <div className="slider-container">
      {images.map((image, index) => (
        <div
          key={index}
          className={`slide ${index === activeIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      <div className="slider-overlay" />
    </div>
  );
}
