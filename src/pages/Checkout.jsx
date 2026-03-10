import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import {
    User,
    MapPin,
    Truck,
    CreditCard,
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ShieldCheck,
    ShoppingBag,
    Tag,
    X,
    Loader2
} from 'lucide-react';
import { gql, useMutation, useQuery, useApolloClient } from '@apollo/client';

const APPLY_COUPON = gql`
  mutation ApplyCoupon($cartId: String!, $couponCode: String!) {
    applyCouponToCart(input: { cart_id: $cartId, coupon_code: $couponCode }) {
      cart {
        id
        applied_coupons { code }
        prices {
          discounts {
            amount { value }
            label
          }
          grand_total { value }
        }
      }
    }
  }
`;

const REMOVE_COUPON = gql`
  mutation RemoveCoupon($cartId: String!) {
    removeCouponFromCart(input: { cart_id: $cartId }) {
      cart {
        id
        applied_coupons { code }
        prices {
          discounts {
            amount { value }
            label
          }
          grand_total { value }
        }
      }
    }
  }
`;

const GET_CART_TOTALS = gql`
    query GetCartTotals($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            applied_coupons { code }
            prices {
                grand_total { value }
                discounts {
                    amount { value }
                    label
                }
            }
        }
    }
`;

const SET_GUEST_EMAIL_ON_CART = gql`
    mutation SetGuestEmail($cartId: String!, $email: String!) {
        setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
            cart { id }
        }
    }
`;

const SET_SHIPPING_ADDRESSES_ON_CART = gql`
    mutation SetShippingAddresses($cartId: String!, $shippingAddress: ShippingAddressInput!) {
        setShippingAddressesOnCart(input: { cart_id: $cartId, shipping_addresses: [$shippingAddress] }) {
            cart { id }
        }
    }
`;

const SET_BILLING_ADDRESS_ON_CART = gql`
    mutation SetBillingAddress($cartId: String!, $billingAddress: BillingAddressInput!) {
        setBillingAddressOnCart(input: { cart_id: $cartId, billing_address: $billingAddress }) {
            cart { id }
        }
    }
`;

const SET_SHIPPING_METHODS_ON_CART = gql`
    mutation SetShippingMethods($cartId: String!, $shippingMethod: ShippingMethodInput!) {
        setShippingMethodsOnCart(input: { cart_id: $cartId, shipping_methods: [$shippingMethod] }) {
            cart { id }
        }
    }
`;

const SET_PAYMENT_METHOD_ON_CART = gql`
    mutation SetPaymentMethod($cartId: String!, $paymentMethod: PaymentMethodInput!) {
        setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: $paymentMethod }) {
            cart { id }
        }
    }
`;

const PLACE_ORDER = gql`
    mutation PlaceOrder($cartId: String!) {
        placeOrder(input: { cart_id: $cartId }) {
            order { order_number }
        }
    }
`;

const CREATE_PAYPAL_TOKEN = gql`
    mutation CreatePaypalToken($input: PaypalExpressTokenInput!) {
        createPaypalExpressToken(input: $input) {
            token
            paypal_urls {
                start
                edit
            }
        }
    }
`;

const GET_SHIPPING_METHODS = gql`
    query GetShippingMethods($cartId: String!) {
        cart(cart_id: $cartId) {
            shipping_addresses {
                available_shipping_methods {
                    carrier_code
                    method_code
                    carrier_title
                    method_title
                }
            }
        }
    }
`;

const GET_COUNTRIES = gql`
    query GetCountries {
        countries {
            id
            full_name_locale
        }
    }
`;

const GET_PAYMENT_METHODS = gql`
    query GetPaymentMethods($cartId: String!) {
        cart(cart_id: $cartId) {
            available_payment_methods {
                code
                title
            }
        }
    }
`;

const CheckoutSection = ({ title, icon: Icon, children, isCompleted }) => (
    <div className="osc-section" style={{ marginBottom: '30px', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div 
            className="osc-header" 
            style={{ 
                background: '#000080', // Dark Blue from screenshot
                color: '#fff', 
                padding: '12px 15px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px' 
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                {Icon && <Icon size={18} strokeWidth={2.5} />}
                <h2 className="osc-title" style={{ color: '#fff', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>
                    {title}
                </h2>
            </div>
            {isCompleted && <CheckCircle size={16} style={{ color: '#4ade80' }} />}
        </div>
        <div className="section-content" style={{ padding: '20px', background: '#fff' }}>
            {children}
        </div>
    </div>
);

const Checkout = () => {
    const { cartItems, clearCart, cartId } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        shipping: {
            firstName: '', lastName: '', street: '', city: '', region: '', postcode: '', country: 'US', phone: '', company: ''
        },
        billing: {
            firstName: '', lastName: '', street: '', city: '', region: '', postcode: '', country: 'US', phone: '', company: ''
        },
        sameAsShipping: true,
        shippingMethod: '',
        paymentMethod: '',
        comments: ''
    });

    const [availableShippingMethods, setAvailableShippingMethods] = useState([]);
    const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    // Mutations
    const [setGuestEmail] = useMutation(SET_GUEST_EMAIL_ON_CART);
    const [setShippingAddresses] = useMutation(SET_SHIPPING_ADDRESSES_ON_CART);
    const [setBillingAddress] = useMutation(SET_BILLING_ADDRESS_ON_CART);
    const [setShippingMethods] = useMutation(SET_SHIPPING_METHODS_ON_CART);
    const [setPaymentMethod] = useMutation(SET_PAYMENT_METHOD_ON_CART);
    const [placeOrderMutation] = useMutation(PLACE_ORDER);
    const [createPaypalToken] = useMutation(CREATE_PAYPAL_TOKEN);

    const [getShippingMethodsQuery] = useMutation(gql`
        mutation GetMethods($cartId: String!) {
            setShippingMethodsOnCart(input: { cart_id: $cartId, shipping_methods: [] }) {
                cart { id }
            }
        }
    `); // Dummy to trigger or just use useLazyQuery. I'll use useApolloClient for manual fetch.

    const client = useApolloClient();

    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');

    const [applyCoupon, { loading: applyingCoupon }] = useMutation(APPLY_COUPON);
    const [removeCoupon, { loading: removingCoupon }] = useMutation(REMOVE_COUPON);

    const { data: cartData, refetch: refetchCart, error: cartError } = useQuery(GET_CART_TOTALS, {
        variables: { cartId },
        skip: !cartId,
        fetchPolicy: 'cache-and-network',
        onError: (err) => {
            console.error('[Checkout] GET_CART_TOTALS Error:', err);
            const msg = err.message.toLowerCase();
            if (msg.includes('cannot perform operations on cart') || 
                msg.includes('could not find a cart') ||
                msg.includes("isn't active")) {
                console.warn('[Checkout] Stale/Inactive cart detected, recovering...');
                clearCartAndRecover();
            }
        }
    });

    const clearCartAndRecover = () => {
        console.warn('[Checkout] Force clearing cart and reloading...');
        localStorage.removeItem('cart_id');
        localStorage.setItem('cart_id', ''); // Explicitly empty
        window.location.reload();
    };

    const { data: countriesData } = useQuery(GET_COUNTRIES);

    const handleCartError = (err) => {
        const msg = (err?.message || "").toLowerCase();
        if (msg.includes('cannot perform operations on cart') || 
            msg.includes('could not find a cart') ||
            msg.includes("isn't active")) {
            console.warn('[Checkout] Inactive cart detected, reloading for recovery...');
            clearCartAndRecover();
            return true;
        }
        return false;
    };

    // Fetch dynamic payment methods
    const fetchPaymentMethods = async () => {
        if (!cartId) return;
        setLoadingPayment(true);
        try {
            const { data: pData } = await client.query({
                query: GET_PAYMENT_METHODS,
                variables: { cartId },
                fetchPolicy: 'network-only'
            });
            const methods = pData?.cart?.available_payment_methods || [];
            setAvailablePaymentMethods(methods);
            if (methods.length > 0 && !form.paymentMethod) {
                handlePaymentMethodChange(methods[0].code);
            }
        } catch (err) {
            console.error('Error fetching payment methods:', err);
            handleCartError(err);
        } finally {
            setLoadingPayment(false);
        }
    };

    // Helper to fetch shipping methods based on current address
    const fetchShippingMethods = async (currentForm) => {
        const addr = currentForm.shipping;
        if (!cartId || !addr.country || !addr.postcode) return;

        setLoadingShipping(true);
        try {
            await setShippingAddresses({
                variables: {
                    cartId,
                    shippingAddress: {
                        address: {
                            firstname: addr.firstName || 'Guest',
                            lastname: addr.lastName || 'User',
                            street: [addr.street || 'Pending'],
                            city: addr.city || 'Pending',
                            region: addr.region || 'Pending',
                            postcode: addr.postcode,
                            country_code: addr.country,
                            telephone: addr.phone || '0000000000',
                            save_in_address_book: false
                        }
                    }
                }
            });

            const { data: shipData } = await client.query({
                query: GET_SHIPPING_METHODS,
                variables: { cartId },
                fetchPolicy: 'network-only'
            });

            const methods = shipData?.cart?.shipping_addresses?.[0]?.available_shipping_methods || [];
            setAvailableShippingMethods(methods);
            
            if (methods.length > 0 && !currentForm.shippingMethod) {
                const first = methods[0];
                await handleShippingMethodChange(`${first.carrier_code}_${first.method_code}`, first.carrier_code, first.method_code);
            } else {
                fetchPaymentMethods();
            }
        } catch (err) {
            console.error('Error fetching shipping methods:', err);
            handleCartError(err);
        } finally {
            setLoadingShipping(false);
        }
    };

    const handleAddressChange = (type, key, value) => {
        setForm(prev => {
            const newAddr = { ...prev[type], [key]: value };
            const newForm = { ...prev, [type]: newAddr };
            
            if (type === 'shipping' && ['country', 'postcode', 'region'].includes(key)) {
                fetchShippingMethods(newForm);
            }
            return newForm;
        });
    };

    const handleShippingMethodChange = async (fullCode, carrier, method) => {
        setForm(prev => ({ ...prev, shippingMethod: fullCode }));
        try {
            await setShippingMethods({
                variables: {
                    cartId,
                    shippingMethod: { carrier_code: carrier, method_code: method }
                }
            });
            refetchCart();
            fetchPaymentMethods();
        } catch (err) {
            console.error('Error setting shipping method:', err);
            handleCartError(err);
        }
    };

    const handlePaymentMethodChange = async (code) => {
        setForm(prev => ({ ...prev, paymentMethod: code }));
        try {
            await setPaymentMethod({
                variables: {
                    cartId,
                    paymentMethod: { code }
                }
            });
            refetchCart();
        } catch (err) {
            console.error('Error setting payment method:', err);
            handleCartError(err);
        }
    };

    const getPrice = (product) => {
        return product?.price_range?.minimum_price?.final_price?.value || 
               product?.price_range?.minimum_price?.regular_price?.value || 0;
    };

    const subtotal = cartItems.reduce((acc, item) => {
        return acc + (getPrice(item.product) * item.quantity);
    }, 0);

    const appliedCoupons = cartData?.cart?.applied_coupons || [];
    const discounts = cartData?.cart?.prices?.discounts || [];
    const total = cartData?.cart?.prices?.grand_total?.value || subtotal;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError('');
        try {
            await applyCoupon({ variables: { cartId, couponCode } });
            setCouponCode('');
            refetchCart();
        } catch (err) {
            setCouponError(err.message || 'Failed to apply coupon.');
        }
    };

    const handleRemoveCoupon = async () => {
        setCouponError('');
        try {
            await removeCoupon({ variables: { cartId } });
            refetchCart();
        } catch (err) {
            setCouponError(err.message || 'Failed to remove coupon.');
        }
    };

    const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    // Initial load & Return from PayPal
    React.useEffect(() => {
        if (cartId && form.shipping.postcode) {
            fetchShippingMethods(form);
        } else if (cartId) {
            fetchPaymentMethods();
        }

        // Check for PayPal Return Params
        const urlParams = new URLSearchParams(window.location.search);
        const ppToken = urlParams.get('token');
        const ppPayerId = urlParams.get('PayerID');

        if (ppToken && ppPayerId && cartId) {
            finalizePayPalOrder(ppToken, ppPayerId);
        }
    }, [cartId]);

    const finalizePayPalOrder = async (token, payerId) => {
        setPlacing(true);
        setError('');
        try {
            // 1. Set Payment Method with Token & PayerID
            await setPaymentMethod({
                variables: {
                    cartId,
                    paymentMethod: {
                        code: 'paypal_express',
                        paypal_express: {
                            token: token,
                            payer_id: payerId
                        }
                    }
                }
            });

            // 2. Place Order
            const result = await placeOrderMutation({ variables: { cartId } });
            const orderNum = result.data.placeOrder.order.order_number;
            
            setOrderNumber(orderNum);
            clearCart();
            setOrderSuccess(true);
        } catch (err) {
            console.error('PayPal finalize failed:', err);
            handleCartError(err) || setError(err.message || 'Failed to finalize PayPal order.');
        } finally {
            setPlacing(false);
            // Clear URL params to avoid re-triggering
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    const placeOrder = async () => {
        if (!cartId) {
            setError('Cart session expired. Please return to cart.');
            return;
        }

        const s = form.shipping;
        const b = form.sameAsShipping ? s : form.billing;

        // Final Validation
        if (!form.email || !s.firstName || !s.lastName || !s.street || !s.city || !s.postcode || !s.phone) {
            setError('Please fill out all required shipping fields.');
            return;
        }
        if (!form.sameAsShipping && (!b.firstName || !b.lastName || !b.street || !b.city || !b.postcode)) {
            setError('Please fill out all required billing fields.');
            return;
        }
        if (!form.shippingMethod) {
            setError('Please select a shipping method.');
            return;
        }
        if (!form.paymentMethod) {
            setError('Please select a payment method.');
            return;
        }

        setPlacing(true);
        setError('');

        try {
            // 1. Ensure Email is set
            await setGuestEmail({ variables: { cartId, email: form.email } });

            // 2. Shipping Address
            const shippingAddressInput = {
                firstname: s.firstName,
                lastname: s.lastName,
                street: [s.street],
                city: s.city,
                region: s.region,
                postcode: s.postcode,
                country_code: s.country,
                telephone: s.phone,
                save_in_address_book: false
            };
            await setShippingAddresses({ variables: { cartId, shippingAddress: { address: shippingAddressInput } } });

            // 3. Billing Address
            const billingAddressInput = form.sameAsShipping ? shippingAddressInput : {
                firstname: b.firstName,
                lastname: b.lastName,
                street: [b.street],
                city: b.city,
                region: b.region,
                postcode: b.postcode,
                country_code: b.country,
                telephone: b.phone || s.phone,
                save_in_address_book: false
            };
            await setBillingAddress({ variables: { cartId, billingAddress: { address: billingAddressInput, same_as_shipping: form.sameAsShipping } } });

            // 4. Special handling for PayPal
            if (form.paymentMethod === 'paypal_express') {
                const ppRes = await createPaypalToken({
                    variables: {
                        input: {
                            cart_id: cartId,
                            code: 'paypal_express',
                            urls: {
                                return_url: window.location.href,
                                cancel_url: window.location.href
                            }
                        }
                    }
                });
                const redirectUrl = ppRes.data.createPaypalExpressToken.paypal_urls.start;
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                    return; // Stop here, user will be redirected
                }
            }

            // 5. Final Order Placement (for other methods like COD, etc.)
            const result = await placeOrderMutation({ variables: { cartId } });
            const orderNum = result.data.placeOrder.order.order_number;
            
            setOrderNumber(orderNum);
            clearCart();
            setOrderSuccess(true);
        } catch (err) {
            console.error('Checkout failed:', err);
            const msg = err.message.toLowerCase();
            if (msg.includes('cannot perform operations on cart') || 
                msg.includes('could not find a cart') ||
                msg.includes("isn't active")) {
                setError('Your cart session has expired. The page will reload to refresh your cart.');
                setTimeout(() => clearCartAndRecover(), 3000);
            } else {
                setError(err.message || 'An error occurred during checkout.');
            }
        } finally {
            setPlacing(false);
        }
    };
    
    if (cartId && cartItems.length === 0 && !orderSuccess) {
        // Only show empty cart if we actually have a cartId but it's empty
        return (
            <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
                <ShoppingBag size={64} style={{ color: '#ccc', marginBottom: '20px' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Your cart is empty</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>Add some premium gear to your cart to checkout.</p>
                <Link to="/" className="button primary">Start Shopping</Link>
            </div>
        );
    }

    const OrderSummary = () => (
        <div className="checkout-card" style={{ border: '2px solid #000080', borderRadius: '4px' }}>
            <h3 style={{ background: '#000080', color: '#fff', padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '14px', fontWeight: '800', textTransform: 'uppercase' }}>
                <ShoppingBag size={18} /> Order Summary
            </h3>
            <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>{cartItems.length} Item in Cart</div>
                
                <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>
                            <th style={{ textAlign: 'left', paddingBottom: '10px' }}>Product Name</th>
                            <th style={{ textAlign: 'center', paddingBottom: '10px' }}>Qty</th>
                            <th style={{ textAlign: 'right', paddingBottom: '10px' }}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map(it => (
                            <tr key={it.id} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '13px' }}>
                                <td style={{ padding: '15px 0', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ width: '50px', height: '50px', background: '#f5f5f5', flexShrink: 0 }}>
                                            <img src={it.product.thumbnail?.url || it.product.small_image?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div style={{ fontWeight: '600', color: '#333' }}>{it.product.name}</div>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600' }}>{it.quantity}</td>
                                <td style={{ textAlign: 'right', verticalAlign: 'middle', fontWeight: '800' }}>
                                    ${(getPrice(it.product) * it.quantity).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ borderTop: '2px solid #f4f4f4', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '13px', marginBottom: '8px' }}>
                        <span>Cart Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '13px', marginBottom: '8px' }}>
                        <span>Shipping</span>
                        <span>{form.shippingMethod ? 'Included' : 'Not yet calculated'}</span>
                    </div>
                    {discounts.length > 0 && discounts.map((d, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#00a651', fontSize: '13px', marginBottom: '8px' }}>
                            <span>Discount ({d.label})</span>
                            <span>-${(d.amount?.value || 0).toFixed(2)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #eee', fontWeight: '900', fontSize: '1.2rem', color: '#000' }}>
                        <span>Order Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                        onClick={placeOrder} 
                        disabled={placing} 
                        className="button primary" 
                        style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: '800', background: '#000080', border: 'none', borderRadius: '4px' }}
                    >
                        {placing ? 'Processing...' : 'Place Order'}
                    </button>
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#888' }}>Check Out with Multiple Addresses</div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ background: '#fff', minHeight: '100vh', padding: '40px 0' }}>
            <div className="container" style={{ maxWidth: '1400px' }}>
                <style>{`
                    .osc-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 20px;
                        align-items: start;
                    }
                    .form-group label {
                        font-weight: 600;
                        color: #555;
                        font-size: 13px;
                        margin-bottom: 6px;
                        display: block;
                    }
                    .form-group input, .form-group select, .form-group textarea {
                        border: 1px solid #ccc;
                        padding: 10px;
                        border-radius: 2px;
                        width: 100%;
                        font-size: 14px;
                        transition: border-color 0.2s;
                    }
                    .form-group input:focus {
                        border-color: #000080;
                        outline: none;
                    }
                    .osc-header h2 {
                        font-family: 'Open Sans', sans-serif;
                        letter-spacing: 0.5px;
                    }
                    @media (max-width: 1100px) {
                        .osc-grid { grid-template-columns: 1fr 1fr; }
                    }
                    @media (max-width: 768px) {
                        .osc-grid { grid-template-columns: 1fr; }
                    }
                `}</style>

                {!orderSuccess ? (
                    <>
                        <div style={{ marginBottom: '40px' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: '800', textTransform: 'uppercase', color: '#333' }}>One Step Checkout</h1>
                            <p style={{ color: '#888', fontSize: '13px' }}>Please enter your details below to complete your purchase.</p>
                            <p style={{ fontSize: '13px' }}>Already have an account? <Link to="/login" style={{ color: '#E41E26', fontWeight: '600' }}>Click here to login</Link></p>
                        </div>

                        <div className="osc-grid">
                            {/* COLUMN 1: ADDRESSES */}
                            <div className="osc-col">
                                <CheckoutSection title="Shipping Address" icon={MapPin}>
                                    <div className="form-group">
                                        <label>Email Address *</label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="email" value={form.email} onChange={e => setForm(prev => ({...prev, email: e.target.value}))} />
                                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#ccc', cursor: 'help' }}>❓</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="form-group">
                                        <div>
                                            <label>First Name *</label>
                                            <input value={form.shipping.firstName} onChange={e => handleAddressChange('shipping', 'firstName', e.target.value)} />
                                        </div>
                                        <div>
                                            <label>Last Name *</label>
                                            <input value={form.shipping.lastName} onChange={e => handleAddressChange('shipping', 'lastName', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Street Address *</label>
                                        <input value={form.shipping.street} onChange={e => handleAddressChange('shipping', 'street', e.target.value)} />
                                        <input style={{ marginTop: '10px' }} placeholder="" />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="form-group">
                                        <div>
                                            <label>Country *</label>
                                            <select value={form.shipping.country} onChange={e => handleAddressChange('shipping', 'country', e.target.value)}>
                                                {countriesData?.countries?.map(c => (
                                                    <option key={c.id} value={c.id}>{c.full_name_locale}</option>
                                                )) || <option value="US">United States</option>}
                                            </select>
                                        </div>
                                        <div>
                                            <label>City *</label>
                                            <input value={form.shipping.city} onChange={e => handleAddressChange('shipping', 'city', e.target.value)} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="form-group">
                                        <div>
                                            <label>Zip/Postal Code *</label>
                                            <input value={form.shipping.postcode} onChange={e => handleAddressChange('shipping', 'postcode', e.target.value)} />
                                        </div>
                                        <div>
                                            <label>State/Province *</label>
                                            <input value={form.shipping.region} onChange={e => handleAddressChange('shipping', 'region', e.target.value)} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="form-group">
                                        <div>
                                            <label>Company</label>
                                            <input value={form.shipping.company} onChange={e => handleAddressChange('shipping', 'company', e.target.value)} />
                                        </div>
                                        <div>
                                            <label>Phone Number *</label>
                                            <input type="tel" value={form.shipping.phone} onChange={e => handleAddressChange('shipping', 'phone', e.target.value)} />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                            <input type="checkbox" /> Create account
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={form.sameAsShipping} onChange={e => setForm(prev => ({...prev, sameAsShipping: e.target.checked}))} /> 
                                            My billing and shipping address are the same
                                        </label>
                                    </div>
                                </CheckoutSection>

                                {!form.sameAsShipping && (
                                    <div className="animate-in">
                                        <CheckoutSection title="Billing Address" icon={MapPin}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="form-group">
                                                <div>
                                                    <label>First Name *</label>
                                                    <input value={form.billing.firstName} onChange={e => handleAddressChange('billing', 'firstName', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label>Last Name *</label>
                                                    <input value={form.billing.lastName} onChange={e => handleAddressChange('billing', 'lastName', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Street Address *</label>
                                                <input value={form.billing.street} onChange={e => handleAddressChange('billing', 'street', e.target.value)} />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="form-group">
                                                <div>
                                                    <label>Country *</label>
                                                    <select value={form.billing.country} onChange={e => handleAddressChange('billing', 'country', e.target.value)}>
                                                        {countriesData?.countries?.map(c => (
                                                            <option key={c.id} value={c.id}>{c.full_name_locale}</option>
                                                        )) || <option value="CA">Canada</option>}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label>City *</label>
                                                    <input value={form.billing.city} onChange={e => handleAddressChange('billing', 'city', e.target.value)} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="form-group">
                                                <div>
                                                    <label>Zip/Postal Code *</label>
                                                    <input value={form.billing.postcode} onChange={e => handleAddressChange('billing', 'postcode', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label>State/Province *</label>
                                                    <input value={form.billing.region} onChange={e => handleAddressChange('billing', 'region', e.target.value)} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="form-group">
                                                <div>
                                                    <label>Company</label>
                                                    <input value={form.billing.company} onChange={e => handleAddressChange('billing', 'company', e.target.value)} />
                                                </div>
                                                <div>
                                                    <label>Phone Number *</label>
                                                    <input type="tel" value={form.billing.phone} onChange={e => handleAddressChange('billing', 'phone', e.target.value)} />
                                                </div>
                                            </div>
                                        </CheckoutSection>
                                    </div>
                                )}
                            </div>

                            {/* COLUMN 2: SHIPPING METHODS */}
                            <div className="osc-col">
                                <CheckoutSection title="Shipping Methods" icon={Truck}>
                                    {loadingShipping ? (
                                        <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            {availableShippingMethods.length > 0 ? (
                                                availableShippingMethods.map(m => {
                                                    const code = `${m.carrier_code}_${m.method_code}`;
                                                    const isSelected = form.shippingMethod === code;
                                                    return (
                                                        <label key={code} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '13px' }}>
                                                            <input type="radio" checked={isSelected} onChange={() => handleShippingMethodChange(code, m.carrier_code, m.method_code)} />
                                                            <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                                                                <span style={{ fontWeight: '800', minWidth: '70px' }}>${(m.amount?.value || 0).toFixed(2)}</span>
                                                                <span style={{ color: '#666' }}>{m.carrier_title}</span>
                                                                <span style={{ color: '#888', fontStyle: 'italic' }}>({m.method_title})</span>
                                                            </div>
                                                        </label>
                                                    );
                                                })
                                            ) : (
                                                <div style={{ color: '#888', fontSize: '13px', fontStyle: 'italic' }}>Enter a zip code to see methods.</div>
                                            )}
                                        </div>
                                    )}
                                    <div className="form-group" style={{ marginTop: '25px' }}>
                                        <label>Comments</label>
                                        <textarea 
                                            rows="5" 
                                            placeholder="" 
                                            value={form.comments} 
                                            onChange={e => setForm(prev => ({...prev, comments: e.target.value}))}
                                        />
                                    </div>
                                </CheckoutSection>
                            </div>

                            {/* COLUMN 3: PAYMENT & SUMMARY */}
                            <div className="osc-col">
                                <CheckoutSection title="Payment Methods" icon={CreditCard}>
                                    {loadingPayment ? (
                                        <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            {availablePaymentMethods.length > 0 ? (
                                                availablePaymentMethods.map(p => (
                                                    <label key={p.code} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                                                        <input type="radio" checked={form.paymentMethod === p.code} onChange={() => handlePaymentMethodChange(p.code)} />
                                                        <span style={{ fontWeight: '600' }}>{p.title}</span>
                                                    </label>
                                                ))
                                            ) : (
                                                <div style={{ color: '#888', fontSize: '13px', fontStyle: 'italic' }}>Please enter your shipping address and select a method to see payment options.</div>
                                            )}
                                        </div>
                                    )}
                                    <div style={{ marginTop: '20px', fontSize: '13px', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
                                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            Apply Discount Code <ChevronDown size={14} />
                                        </div>
                                    </div>
                                </CheckoutSection>

                                <OrderSummary />
                            </div>
                        </div>
                    </>
                ) : (
                    /* SUCCESS VIEW */
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ width: '100px', height: '100px', background: '#00a651', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                            <CheckCircle size={60} />
                        </div>
                        <h2 style={{ fontSize: '3rem', fontWeight: '900' }}>Order Placed!</h2>
                        <p style={{ fontSize: '1.2rem', color: '#666' }}>Your order <strong>#{orderNumber}</strong> is successful.</p>
                        <button onClick={() => navigate('/')} className="button primary" style={{ marginTop: '40px', padding: '15px 50px' }}>
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
