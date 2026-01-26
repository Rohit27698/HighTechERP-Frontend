import React, {useEffect, useState} from 'react';
import api from '../services/api';
import Carousel from '../components/Carousel';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

export default function Home(){
  const [settings, setSettings] = useState({});
  const [featured, setFeatured] = useState([]);

  useEffect(()=>{
    api.settings.get().then(d => setSettings(d.data || d || {}));
    api.products.list().then(res => setFeatured((res.data || res) || []));
  },[]);

  return (
    <main>
      <section className="hero">
        <Carousel images={settings.ecom_slider_images ? settings.ecom_slider_images.map(i => api.toFullUrl(i)) : []} />
      </section>

      <section className="featured container">
        <h2>Featured Products</h2>
        <div className="products-row">
          {featured.slice(0,6).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="about container">
        <h2>About Us</h2>
        <p>{settings.footer_text || 'Welcome to our marketplace. Explore hundreds of products from trusted vendors.'}</p>
      </section>

      <Footer />
    </main>
  )
}
