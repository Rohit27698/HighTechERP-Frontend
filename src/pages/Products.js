import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.products.list();
        const productsList = data.data || data || [];
        setProducts(Array.isArray(productsList) ? productsList : []);
        setFilteredProducts(Array.isArray(productsList) ? productsList : []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const title = (p.title || p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return title.includes(term) || desc.includes(term);
      });
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => {
        const nameA = (a.title || a.name || '').toLowerCase();
        const nameB = (b.title || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    setFilteredProducts(filtered);
  }, [searchTerm, sortBy, products]);

  return (
    <main className="products-page">
      <div className="container">
        <h1>All Products</h1>
        
        {/* Search and Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                background: '#fff',
                transition: 'all 0.3s ease',
              }}
            >
              <option value="default">Sort by: Default</option>
              <option value="name">Sort by: Name</option>
              <option value="price-low">Sort by: Price (Low to High)</option>
              <option value="price-high">Sort by: Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div style={{
          marginBottom: '1.5rem',
          color: '#718096',
          fontSize: '0.95rem',
        }}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          {searchTerm && ` for "${searchTerm}"`}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-row">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          }}>
            <p style={{ fontSize: '1.2rem', color: '#718096', marginBottom: '0.5rem' }}>
              {searchTerm ? 'No products found matching your search.' : 'No products available.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
