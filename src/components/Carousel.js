import React, { useEffect, useState } from 'react';

export default function Carousel({images = []}){
  const [index, setIndex] = useState(0);

  useEffect(()=>{
    if (!images || images.length <= 1) return;
    const t = setInterval(()=> setIndex(i => (i+1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="carousel" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem'}}>
        No slider images available
      </div>
    );
  }

  const goToSlide = (i) => {
    setIndex(i);
  };

  const goToPrev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="carousel">
      {images.map((img, i) => (
        <div 
          key={i} 
          className={`carousel-item ${i === index ? 'active' : ''}`}
        >
          <img src={img} alt={`slide-${i + 1}`} />
        </div>
      ))}
      
      {images.length > 1 && (
        <>
          <button 
            className="carousel-nav carousel-nav-prev" 
            onClick={goToPrev}
            aria-label="Previous slide"
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.3)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.5rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.5)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          >
            ‹
          </button>
          
          <button 
            className="carousel-nav carousel-nav-next" 
            onClick={goToNext}
            aria-label="Next slide"
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.3)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.5rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.5)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          >
            ›
          </button>
        </>
      )}
      
      {images.length > 1 && (
        <div className="carousel-controls">
          {images.map((_, i) => (
            <button 
              key={i} 
              className={i===index ? 'dot active' : 'dot'} 
              onClick={() => goToSlide(i)} 
              aria-label={`Go to slide ${i+1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
