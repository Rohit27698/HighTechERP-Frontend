import React from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ProductCard({product}){
  const img = product.image || (product.images && product.images[0]) || product.thumbnail;
  const src = api.toFullUrl(img);

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img src={src} alt={product.title} />
        <h3>{product.title}</h3>
        <div className="price">{product.price}</div>
      </Link>
    </div>
  )
}
