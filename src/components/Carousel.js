import React, { useEffect, useState } from 'react';

export default function Carousel({images = []}){
  const [index, setIndex] = useState(0);

  useEffect(()=>{
    if (!images || images.length <= 1) return;
    const t = setInterval(()=> setIndex(i => (i+1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="carousel">
      <div className="carousel-item active">
        <img src={images[index]} alt={`slide-${index}`} />
      </div>
      <div className="carousel-controls">
        {images.map((_, i) => (
          <button key={i} className={i===index? 'dot active':'dot'} onClick={()=>setIndex(i)} aria-label={`Go to slide ${i+1}`} />
        ))}
      </div>
    </div>
  )
}
