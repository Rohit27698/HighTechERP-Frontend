import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.products.list().then(data => setProducts(data.data || data || []));
  }, []);

  return (
    <div className="container">
      <h1>Products</h1>
      <div className="products-row">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
