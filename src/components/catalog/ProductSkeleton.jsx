import React from 'react';

const ProductSkeleton = () => {
    return (
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid #eee'
        }}>
            {/* Image Skeleton */}
            <div className="skeleton" style={{
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: '12px'
            }}></div>

            {/* Content Skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton" style={{ width: '80%', height: '18px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '40%', height: '24px', borderRadius: '4px' }}></div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <div className="skeleton" style={{ flex: 2, height: '40px', borderRadius: '10px' }}></div>
                    <div className="skeleton" style={{ flex: 1, height: '40px', borderRadius: '10px' }}></div>
                </div>
            </div>
        </div>
    );
};

export default ProductSkeleton;
