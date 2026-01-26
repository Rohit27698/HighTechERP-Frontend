import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams } from 'react-router-dom';
import Carousel from '../components/Carousel';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (id) api.products.get(id).then(data => setProduct(data.data || data));
  }, [id]);

  const handleAdd = async () => {
    const guest = localStorage.getItem('guest_id') || Date.now();
    localStorage.setItem('guest_id', guest);
    setAdding(true);
    try{
      await api.cart.add({ product_id: id, quantity: qty, guest_id: guest });
      alert('Added to cart');
    }catch(err){
      alert('Failed to add to cart');
    }
    setAdding(false);
  }

  if (!product) return <div>Loading...</div>;

  const images = [product.image].concat(product.images || []).filter(Boolean).map(i => api.toFullUrl(i));

  return (
    <div className="container product-detail">
      <div className="media">
        <Carousel images={images} />
      </div>
      <div className="info">
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <div className="price">{product.price}</div>
        <div className="purchase">
          <label>Quantity</label>
          <input type="number" min="1" value={qty} onChange={e=>setQty(Math.max(1, parseInt(e.target.value||1)))} />
          <button onClick={handleAdd} disabled={adding}>{adding ? 'Adding...' : 'Add to cart'}</button>
        </div>
      </div>
    </div>
  );
}
