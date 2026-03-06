import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';

const Wishlist = () => {
    const { user } = useAuth();
    const { items, loading, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (!user) {
        return (
            <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
                <Heart size={64} style={{ color: '#ddd', marginBottom: '20px' }} />
                <h2>Please login to see your wishlist</h2>
                <Link to="/login" className="primary" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 30px' }}>Login Now</Link>
            </div>
        );
    }

    if (loading && items.length === 0) {
        return (
            <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #eee', borderTopColor: 'var(--primary-color)', borderRadius: '50%', margin: '0 auto' }}></div>
                <p style={{ marginTop: '20px', color: '#666' }}>Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="header" style={{ backgroundColor: '#f5f5f5', padding: '60px 0', marginBottom: '60px' }}>
                <div className="container">
                    <h1 style={{ margin: 0, fontWeight: 300, fontSize: '2.5rem' }}>My Wish List</h1>
                </div>
            </div>

            <div className="container" style={{ marginBottom: '100px' }}>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: '#f9f9f9', borderRadius: '18px' }}>
                        <Heart size={48} style={{ color: '#ccc', marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>You have no items in your wish list.</h3>
                        <p style={{ color: '#666', marginBottom: '30px' }}>Save items you love here to find them later.</p>
                        <Link to="/" className="primary" style={{ padding: '12px 30px' }}>Start Shopping</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                        {items.map(item => (
                            <div key={item.id} className="wishlist-item" style={{
                                background: '#fff',
                                borderRadius: '18px',
                                padding: '20px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                position: 'relative'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        background: '#fff',
                                        border: '1px solid #eee',
                                        borderRadius: '50%',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#ff4d4d',
                                        zIndex: 2,
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}
                                    title="Remove from wishlist"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <Link to={`/product/${item.product.sku}`} style={{ marginBottom: '20px', display: 'block' }}>
                                    <div style={{ aspectRatio: '1/1', background: '#f5f5f5', borderRadius: '12px', overflow: 'hidden' }}>
                                        <img
                                            src={item.product.small_image?.url}
                                            alt={item.product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px' }}
                                        />
                                    </div>
                                </Link>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1rem', margin: '0 0 10px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        <Link to={`/product/${item.product.sku}`} style={{ color: '#333' }}>{item.product.name}</Link>
                                    </h3>

                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '20px' }}>
                                        {item.product.price_range.minimum_price.final_price.currency} {item.product.price_range.minimum_price.final_price.value}
                                    </div>
                                </div>

                                <button
                                    onClick={() => addToCart(item.product.sku)}
                                    className="primary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        width: '100%',
                                        padding: '12px'
                                    }}
                                >
                                    <ShoppingCart size={18} />
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
