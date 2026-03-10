import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCT_REVIEWS, GET_REVIEW_METADATA, CREATE_PRODUCT_REVIEW } from '../../api/reviews';
import { Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ProductReviews = ({ sku }) => {
    // Queries
    const { data: revData, loading: revLoading, refetch: refetchReviews } = useQuery(GET_PRODUCT_REVIEWS, {
        variables: { sku, pageSize: 10, currentPage: 1 },
        fetchPolicy: 'cache-and-network'
    });

    const { data: metaData } = useQuery(GET_REVIEW_METADATA);

    // Mutation
    const [createReview, { loading: submitting }] = useMutation(CREATE_PRODUCT_REVIEW);

    // Form State
    const [nickname, setNickname] = useState('');
    const [summary, setSummary] = useState('');
    const [text, setText] = useState('');
    const [ratings, setRatings] = useState({}); // { "Mw==": "MTE=" } -> { metadata_id : value_id }
    
    // Status State
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const productInfo = revData?.products?.items?.[0];
    const reviews = productInfo?.reviews?.items || [];
    const ratingCategories = metaData?.productReviewRatingsMetadata?.items || [];

    const handleRatingSelect = (categoryId, valueId) => {
        setRatings(prev => ({
            ...prev,
            [categoryId]: valueId
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!nickname || !summary || !text) {
            setError('Please fill out all text fields.');
            return;
        }

        if (ratingCategories.length > 0 && Object.keys(ratings).length !== ratingCategories.length) {
            setError('Please provide a star rating for all categories.');
            return;
        }

        // Format ratings for GraphQL Input: [{ id: "Mw==", value_id: "MTE=" }, ...]
        const formattedRatings = Object.keys(ratings).map(catId => ({
            id: catId,
            value_id: ratings[catId]
        }));

        try {
            await createReview({
                variables: {
                    input: {
                        sku,
                        nickname,
                        summary,
                        text,
                        ratings: formattedRatings
                    }
                }
            });

            setSuccess('Your review has been submitted and is pending approval.');
            // Reset form
            setNickname('');
            setSummary('');
            setText('');
            setRatings({});
            
            // Optionally refetch reviews if Magento auto-approves, usually it's pending though
            refetchReviews();

        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.message || 'An error occurred while submitting your review.');
        }
    };

    // Helper to render stars
    const renderStars = (ratingValue, max = 100) => {
        // Handle Magento's 0-100 rating vs 1-5 rating systems
        const normalizedRating = ratingValue > 5 ? (ratingValue / 20) : ratingValue;
        
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star} 
                        size={14} 
                        fill={star <= normalizedRating ? '#f39c12' : '#eee'} 
                        color={star <= normalizedRating ? '#f39c12' : '#ccc'} 
                    />
                ))}
            </div>
        );
    };

    if (revLoading && !revData) {
        return <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="product-reviews-section">
            <style>{`
                .product-reviews-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 60px;
                }
                .review-item {
                    border-bottom: 1px solid #eee;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .review-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .review-title {
                    font-weight: 700;
                    margin: 0 0 5px 0;
                    font-size: 1.1rem;
                }
                .review-meta {
                    font-size: 0.85rem;
                    color: #888;
                }
                .review-body {
                    color: #555;
                    line-height: 1.6;
                    font-size: 0.95rem;
                }
                .review-form-container {
                    background: #fcfcfc;
                    padding: 30px;
                    border-radius: 12px;
                    border: 1px solid #eee;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #555;
                    margin-bottom: 8px;
                }
                .form-group input, 
                .form-group textarea {
                    width: 100%;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-family: inherit;
                    font-size: 0.95rem;
                }
                .form-group input:focus, 
                .form-group textarea:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }
                
                @media (max-width: 768px) {
                    .product-reviews-section {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                }
            `}</style>

            {/* Left Column: Review List */}
            <div>
                <h3 style={{ marginTop: 0, marginBottom: '25px', fontSize: '1.4rem' }}>
                    Customer Reviews
                </h3>

                {reviews.length === 0 ? (
                    <div style={{ color: '#666', fontStyle: 'italic', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                        No reviews yet. Be the first to review this product!
                    </div>
                ) : (
                    <div>
                        {reviews.map((review, idx) => (
                            <div key={idx} className="review-item">
                                <div className="review-header">
                                    <div>
                                        {renderStars(review.average_rating)}
                                        <h4 className="review-title">{review.summary}</h4>
                                    </div>
                                    <div className="review-meta text-right">
                                        <div>{new Date(review.created_at).toLocaleDateString()}</div>
                                        <div>by <strong style={{ color: '#333' }}>{review.nickname}</strong></div>
                                    </div>
                                </div>
                                <div className="review-body">
                                    {review.text}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Review Form */}
            <div>
                <div className="review-form-container">
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.3rem' }}>Write a Review</h3>
                    
                    {error && (
                        <div style={{ background: '#fff5f5', color: '#e53e3e', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'flex-start', border: '1px solid #feb2b2' }}>
                            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div style={{ background: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'flex-start', border: '1px solid #bbf7d0' }}>
                            <CheckCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Dynamic Rating Categories */}
                        {ratingCategories.length > 0 && (
                            <div style={{ marginBottom: '25px', padding: '15px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '15px', color: '#333' }}>Your Rating *</div>
                                {ratingCategories.map(cat => (
                                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#666', width: '80px' }}>{cat.name}</span>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {/* Values are usually 1-5, we'll sort them to ensure order */}
                                            {[...cat.values].sort((a,b) => parseInt(a.value) - parseInt(b.value)).map((val, idx) => {
                                                const selectedValueId = ratings[cat.id];
                                                const selectedValObj = cat.values.find(v => v.value_id === selectedValueId);
                                                const selectedValue = selectedValObj ? parseInt(selectedValObj.value) : 0;
                                                const currentStarValue = parseInt(val.value);
                                                
                                                const isHighlighted = currentStarValue <= selectedValue;

                                                return (
                                                    <div 
                                                        key={val.value_id}
                                                        onClick={() => handleRatingSelect(cat.id, val.value_id)}
                                                        style={{ cursor: 'pointer', padding: '2px' }}
                                                    >
                                                        <Star 
                                                            size={20} 
                                                            fill={isHighlighted ? '#f39c12' : 'none'} 
                                                            color={isHighlighted ? '#f39c12' : '#ccc'} 
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="form-group">
                            <label>Nickname *</label>
                            <input 
                                type="text" 
                                value={nickname} 
                                onChange={(e) => setNickname(e.target.value)} 
                                required 
                                disabled={submitting}
                            />
                        </div>

                        <div className="form-group">
                            <label>Summary *</label>
                            <input 
                                type="text" 
                                value={summary} 
                                onChange={(e) => setSummary(e.target.value)} 
                                placeholder="E.g. Great product!"
                                required 
                                disabled={submitting}
                            />
                        </div>

                        <div className="form-group">
                            <label>Review *</label>
                            <textarea 
                                rows="5"
                                value={text} 
                                onChange={(e) => setText(e.target.value)} 
                                placeholder="What do you think about this item?"
                                required 
                                disabled={submitting}
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            className="primary" 
                            style={{ width: '100%', padding: '14px', borderRadius: '8px', fontWeight: 'bold' }}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Loader2 size={18} className="animate-spin" /> Submitting...
                                </span>
                            ) : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
