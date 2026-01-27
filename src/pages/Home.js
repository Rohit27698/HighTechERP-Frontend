import React, {useEffect, useState} from 'react';
import api from '../services/api';
import Carousel from '../components/Carousel';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function Home(){
  const [settings, setSettings] = useState({});
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const fetchData = async () => {
      try {
        const [settingsData, productsData] = await Promise.all([
          api.settings.get(),
          api.products.list()
        ]);
        
        // Handle settings response - backend returns { success: true, data: {...} }
        if (settingsData.error) {
          console.error('Settings error:', settingsData.message);
          setSettings({});
        } else {
          setSettings(settingsData.data || settingsData || {});
        }
        
        // Handle products response
        if (productsData.error) {
          console.error('Products error:', productsData.message);
          setFeatured([]);
        } else {
          const products = productsData.data || productsData || [];
          setFeatured(Array.isArray(products) ? products : []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setSettings({});
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  },[]);

  if (loading) {
    return (
      <main>
        <div className="loading">Loading...</div>
        <Footer />
      </main>
    );
  }

  const sliderImages = settings.ecom_slider_images 
    ? (Array.isArray(settings.ecom_slider_images) 
        ? settings.ecom_slider_images.map(i => api.toFullUrl(i))
        : [])
    : [];

  const sliderImages2 = settings.ecom_slider_images_2 
    ? (Array.isArray(settings.ecom_slider_images_2) 
        ? settings.ecom_slider_images_2.map(i => api.toFullUrl(i))
        : [])
    : [];

  return (
    <main>
      {/* Hero Carousel Section (Slider 1) */}
      <section className="hero">
        <div className="container">
          <Carousel images={sliderImages} />
        </div>
      </section>

      {/* Secondary Carousel Section (Slider 2) */}
      {sliderImages2.length > 0 && (
        <section className="hero hero-secondary">
          <div className="container">
            <Carousel images={sliderImages2} />
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="featured container">
        <h2>Featured Products</h2>
        {featured.length > 0 ? (
          <div className="products-row">
            {featured.slice(0, 8).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '3rem', color: '#718096'}}>
            <p>No products available at the moment. Check back soon!</p>
          </div>
        )}
      </section>

      {/* About Us Section */}
      <section className="about container">
        <h2>About Us</h2>
        <p>
          {settings.about_us || settings.footer_text || 
           'Welcome to our multi-vendor marketplace! We bring together the best vendors and products to provide you with an exceptional shopping experience. Discover quality products, competitive prices, and reliable service all in one place. Our platform connects you with trusted sellers, ensuring secure transactions and customer satisfaction. Shop with confidence and enjoy the convenience of finding everything you need right here.'}
        </p>
      </section>

      <Footer />
    </main>
  )
}
