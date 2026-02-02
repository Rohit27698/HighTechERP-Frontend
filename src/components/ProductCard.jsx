import React from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ProductCard({product}){
  const img = product.image || (product.images && product.images[0]) || product.thumbnail;
  const src = api.toFullUrl(img);
  const price = product.price ? parseFloat(product.price).toLocaleString('en-IN') : '0';
  const stock = typeof product.stock === 'number' ? product.stock : null;

  return (
    <div className="product-card fade-in">
      <Link to={`/products/${product.id}`}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img 
            src={src || 'https://via.placeholder.com/300x220?text=No+Image'} 
            alt={product.title || product.name || 'Product'} 
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x220?text=No+Image';
            }}
          />
          {stock !== null && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: stock > 0 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
              color: '#fff',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '700',
            }}>
              {stock > 0 ? `In stock: ${stock}` : 'Out of stock'}
            </div>
          )}
          {product.vendor && (
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'var(--primary-color)',
              color: '#fff',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}>
              {product.vendor.name || 'Vendor'}
            </div>
          )}
        </div>
        <h3>{product.title || product.name || 'Untitled Product'}</h3>
        <div className="price">
          {price}
        </div>
        {product.description && (
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-color)',
            opacity: 0.7,
            margin: '0 1rem 1rem',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.description}
          </p>
        )}
      </Link>
    </div>
  )
}
