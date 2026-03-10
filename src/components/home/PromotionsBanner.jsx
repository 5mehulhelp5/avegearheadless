import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_PROMOTIONS } from '../../api/products';
import { Tag } from 'lucide-react';

const PromotionsBanner = () => {
    const { loading, error, data } = useQuery(GET_PROMOTIONS);

    if (loading) return null;

    const catalogRules = data?.catalogPriceRules?.items || [];
    const cartRules = data?.cartPriceRules?.items || [];

    const allRules = [...catalogRules, ...cartRules].filter(rule => rule.is_active);

    if (allRules.length === 0) return null;

    return (
        <div style={{
            backgroundColor: '#0a0a0a',
            color: 'white',
            padding: '12px 0',
            borderBottom: '1px solid #333'
        }}>
            <div className="container" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {allRules.map((rule) => (
                    <div key={`${rule.__typename}-${rule.rule_id}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem'
                    }}>
                        <Tag size={16} />
                        <strong>
                            {rule.__typename === 'CartPriceRule' ? 'Cart Deal:' : 'Catalog Deal:'}
                        </strong>
                        <span style={{ fontWeight: 'bold', color: '#ffb800' }}>{rule.name}</span>
                        {rule.description && (
                            <span style={{ color: '#aaa' }}>- {rule.description}</span>
                        )}
                        {rule.coupon_type == 2 && (
                            <span style={{
                                backgroundColor: '#ffb800',
                                color: '#000',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                marginLeft: '8px',
                                fontWeight: 'bold'
                            }}>
                                Requires Coupon
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PromotionsBanner;
