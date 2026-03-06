import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Send } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#000', color: '#fff', paddingTop: '80px', paddingBottom: '40px', marginTop: '100px' }}>
            <div className="container">
                {/* Logo and About */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '40px', marginBottom: '60px' }}>
                    <div>
                        <Link to="/" style={{ textDecoration: 'none', color: '#fff', fontSize: '1.8rem', fontWeight: '900', display: 'block', marginBottom: '20px' }}>
                            AV<span style={{ color: '#00a651' }}>GEAR</span>
                        </Link>
                        <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px' }}>
                            The trusted name in premium home audio. Experience the best in sound technology.
                        </p>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
                            <Facebook size={20} style={{ color: '#888', cursor: 'pointer' }} />
                            <Twitter size={20} style={{ color: '#888', cursor: 'pointer' }} />
                            <Instagram size={20} style={{ color: '#888', cursor: 'pointer' }} />
                            <Youtube size={20} style={{ color: '#888', cursor: 'pointer' }} />
                        </div>
                    </div>

                    {/* Information Links */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '25px', color: '#fff' }}>Information</h4>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                            {['About Us', 'Customer Service', 'Sitemap'].map(item => (
                                <li key={item} style={{ marginBottom: '12px' }}>
                                    <Link to="#" style={{ color: '#888', textDecoration: 'none' }}>{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories Links */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '25px', color: '#fff' }}>Categories</h4>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                            {['Home Audio & Video', 'Office Products', 'Gaming Products', 'Pro Audio', 'Car & Marine Audio'].map(item => (
                                <li key={item} style={{ marginBottom: '12px' }}>
                                    <Link to="#" style={{ color: '#888', textDecoration: 'none' }}>{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter and Contact */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '25px', color: '#fff' }}>Stay Updated</h4>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>
                            Join our community for the latest news and best deals.
                        </p>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Your email address"
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    borderRadius: '30px',
                                    border: '1px solid #333',
                                    backgroundColor: 'transparent',
                                    color: '#fff',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button style={{
                                position: 'absolute',
                                right: '5px',
                                top: '5px',
                                background: '#00a651',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#fff'
                            }}>
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{ borderTop: '1px solid #222', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#555' }}>
                    <p>© 2026 AV Gear. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Link to="#" style={{ color: '#555', textDecoration: 'none' }}>Privacy Policy</Link>
                        <Link to="#" style={{ color: '#555', textDecoration: 'none' }}>Terms of Service</Link>
                        <Link to="#" style={{ color: '#555', textDecoration: 'none' }}>Orders & Returns</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
