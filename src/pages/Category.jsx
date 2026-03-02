import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CATEGORY_PRODUCTS } from '../api/products';
import ProductCard from '../components/catalog/ProductCard';

const Category = () => {
    const { id } = useParams();
    // Start with just the category filter
    const [activeFilters, setActiveFilters] = useState({});

    // Construct the full filter object for GraphQL
    // It must strictly match ProductAttributeFilterInput structure
    // We default to filtering by the current category ID
    const filterVariables = {
        category_uid: { eq: id || "Mg==" },
        ...activeFilters
    };

    const { loading, error, data } = useQuery(GET_CATEGORY_PRODUCTS, {
        variables: {
            id: id || "Mg==",
            filter: filterVariables
        },
        fetchPolicy: 'network-only' // Ensure we get fresh aggregations on filter change
    });

    // Reset filters when changing category
    useEffect(() => {
        setActiveFilters({});
    }, [id]);

    const handleFilterChange = (attributeCode, value) => {
        setActiveFilters(prev => {
            const newFilters = { ...prev };

            // Special handling for price ranges (usually come as "0_100" or similar)
            if (attributeCode === 'price') {
                const [from, to] = value.split('_');
                const isSelected = newFilters.price?.from === from && newFilters.price?.to === to;

                if (isSelected) {
                    delete newFilters.price;
                } else {
                    newFilters.price = { from, to };
                }
            } else {
                // Standard 'eq' filter for other attributes (brand, color, etc.)
                if (newFilters[attributeCode]?.eq === value) {
                    delete newFilters[attributeCode];
                } else {
                    newFilters[attributeCode] = { eq: value };
                }
            }
            return newFilters;
        });
    };

    if (loading && !data) return (
        <div className="category-page">
            <div className="header" style={{ backgroundColor: '#f5f5f5', padding: '40px 0', marginBottom: 'var(--spacing-lg)' }}>
                <div className="container">
                    <div className="skeleton" style={{ width: '250px', height: '2.5rem' }}></div>
                </div>
            </div>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px' }}>
                    <aside className="filters-sidebar">
                        <div className="skeleton" style={{ width: '100%', height: '30px', marginBottom: '20px' }}></div>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ marginBottom: '30px' }}>
                                <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '15px' }}></div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[1, 2, 3, 4].map(j => <div key={j} className="skeleton" style={{ width: '100%', height: '15px' }}></div>)}
                                </div>
                            </div>
                        ))}
                    </aside>
                    <div className="products-content">
                        <div className="skeleton" style={{ width: '150px', height: '1rem', marginBottom: '20px' }}></div>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                                    <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', marginBottom: '15px', borderRadius: '8px' }}></div>
                                    <div className="skeleton" style={{ width: '100%', height: '1rem', marginBottom: '10px' }}></div>
                                    <div className="skeleton" style={{ width: '60%', height: '1rem', marginBottom: '15px' }}></div>
                                    <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '4px' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    if (error) return <div className="container" style={{ padding: '40px 0' }}>Error: {error.message}</div>;

    const products = data?.products?.items || [];
    const aggregations = data?.products?.aggregations || [];
    const categoryName = data?.categoryList?.[0]?.name || 'Category';

    // We filter out 'category_uid' aggregation usually as it's redundant here, 
    // but useful for subcategories. Let's keep distinct ones.
    const visibleAggregations = aggregations.filter(agg => agg.attribute_code !== 'category_uid' && agg.options?.length > 0);

    return (
        <div className="category-page">
            <div className="header" style={{ backgroundColor: '#f5f5f5', padding: '40px 0', marginBottom: 'var(--spacing-lg)' }}>
                <div className="container">
                    <h1 style={{ margin: 0, fontWeight: 300 }}>{categoryName}</h1>
                </div>
            </div>

            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px' }}>

                    {/* Sidebar Filters */}
                    <aside className="filters-sidebar">
                        <div style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                            <h3 style={{ margin: 0 }}>Filters</h3>
                        </div>

                        {visibleAggregations.map(agg => (
                            <div key={agg.attribute_code} style={{ marginBottom: '30px' }}>
                                <h4 style={{ textTransform: 'capitalize', marginBottom: '15px' }}>{agg.label}</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {agg.options.map(option => {
                                        let isSelected = false;
                                        if (agg.attribute_code === 'price') {
                                            const [f, t] = option.value.split('_');
                                            isSelected = activeFilters.price?.from === f && activeFilters.price?.to === t;
                                        } else {
                                            isSelected = activeFilters[agg.attribute_code]?.eq === option.value;
                                        }

                                        return (
                                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#555' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleFilterChange(agg.attribute_code, option.value)}
                                                    style={{ marginRight: '10px' }}
                                                />
                                                <span>{option.label}</span>
                                                <span style={{ marginLeft: 'auto', color: '#999', fontSize: '0.8rem' }}>({option.count})</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {visibleAggregations.length === 0 && (
                            <p style={{ color: '#999' }}>No filters available.</p>
                        )}
                    </aside>

                    {/* Product Grid */}
                    <div className="products-content">
                        {products.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '8px' }}>
                                <p>No products match your selected filters.</p>
                                <button
                                    onClick={() => setActiveFilters({})}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#666' }}>
                                    {data?.products?.total_count} products found
                                </div>
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                                    {products.map(product => (
                                        <ProductCard key={product.uid} product={product} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Category;
