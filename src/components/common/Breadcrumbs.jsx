import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';

const Breadcrumbs = () => {
    const location = useLocation();
    const { breadcrumbs: customBreadcrumbs } = useBreadcrumbs();

    // Don't show on home page
    if (location.pathname === '/') return null;

    const pathnames = location.pathname.split('/').filter(x => x);

    // If custom breadcrumbs are provided, use them. 
    // Otherwise fallback to simple path-based breadcrumbs
    const items = customBreadcrumbs.length > 0
        ? customBreadcrumbs
        : pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            return {
                label: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
                path: routeTo
            };
        });

    return (
        <nav className="breadcrumbs" style={{
            padding: '20px 0',
            borderBottom: '1px solid #eee',
            marginBottom: '30px',
            backgroundColor: '#ffffff'
        }}>
            <div className="container">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#666',
                    fontSize: '0.9rem',
                    flexWrap: 'wrap'
                }}>
                    <Link to="/" style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--primary-color)',
                        textDecoration: 'none'
                    }}>
                        <Home size={16} />
                    </Link>

                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        return (
                            <React.Fragment key={index}>
                                <ChevronRight size={14} style={{ opacity: 0.5 }} />
                                {isLast ? (
                                    <span style={{ fontWeight: 600, color: '#333' }}>
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link
                                        to={item.path}
                                        style={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Breadcrumbs;
