import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const guest = localStorage.getItem('guest_id') || Date.now();
    localStorage.setItem('guest_id', guest);
    api.cart.show(guest).then(data => setItems(data || []));
  }, []);

  function handleCheckout() {
    navigate('/checkout');
  }

  return (
    <div className="container">
      <h1>Your Cart</h1>
      {items.length === 0 && <div>Your cart is empty. <Link to="/">Continue shopping</Link></div>}
      {items.length > 0 && (
        <>
          <div className="cart-list">
            {items.map(it => (
              <div key={it.product.id} className="cart-item">
                <img src={api.toFullUrl(it.product.image || (it.product.images && it.product.images[0]))} alt={it.product.title} />
                <div className="meta">
                  <div className="title">{it.product.title}</div>
                  <div className="qty">Qty: {it.quantity}</div>
                </div>
                <div className="actions">
                  <button onClick={async ()=>{
                    const guest = localStorage.getItem('guest_id');
                    await api.cart.remove({ product_id: it.product.id, guest_id: guest });
                    const res = await api.cart.show(guest);
                    setItems(res || []);
                  }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="total">Total: {items.reduce((s,it)=>s + (parseFloat(it.product.price||0) * it.quantity), 0)}</div>
            <button onClick={handleCheckout}>Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}
