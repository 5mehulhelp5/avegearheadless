import React, { createContext, useContext, useState, useEffect } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { getSalableQty } from '../api/stock';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Queries/Mutations for Cart
const CREATE_CART = gql`
    mutation CreateCart {
        createEmptyCart
    }
`;

const GET_CUSTOMER_CART = gql`
    query GetCustomerCart {
        customerCart {
            id
        }
    }
`;

const MERGE_CARTS = gql`
    mutation MergeCarts($sourceId: String!, $destId: String!) {
        mergeCarts(source_cart_id: $sourceId, destination_cart_id: $destId) {
            id
        }
    }
`;

const GET_CART = gql`
    query GetCart($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            items {
                uid
                quantity
                product {
                    name
                    sku
                    thumbnail {
                        url
                    }
                    small_image {
                        url
                    }
                    media_gallery {
                        url
                    }
                    price_range {
                        minimum_price {
                            regular_price {
                                value
                                currency
                            }
                            final_price {
                                value
                                currency
                            }
                        }
                    }
                }
            }
        }
    }
`;

const ADD_TO_CART = gql`
    mutation AddToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
        addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
            cart {
                items {
                    uid
                    quantity
                    product {
                        sku
                    }
                }
            }
        }
    }
`;

const REMOVE_FROM_CART = gql`
    mutation RemoveItem($cartId: String!, $itemId: ID!) {
        removeItemFromCart(input: { cart_id: $cartId, cart_item_uid: $itemId }) {
            cart {
                items {
                    uid
                }
            }
        }
    }
`;

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartId, setCartId] = useState(() => {
        const saved = localStorage.getItem('cart_id');
        return (saved && saved !== 'undefined') ? saved : null;
    });
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [createCartMutation] = useMutation(CREATE_CART);
    const [addToCartMutation] = useMutation(ADD_TO_CART);
    const [removeItemMutation] = useMutation(REMOVE_FROM_CART);
    const [mergeCartsMutation] = useMutation(MERGE_CARTS);

    // Fetch customer cart ID if logged in
    const { data: customerCartData } = useQuery(GET_CUSTOMER_CART, {
        skip: !user,
        fetchPolicy: 'network-only'
    });

    // Fetch cart data
    const { data: cartData, refetch: refetchCart } = useQuery(GET_CART, {
        variables: { cartId: (cartId && cartId !== 'undefined') ? cartId : '' },
        skip: !cartId || cartId === 'undefined',
        notifyOnNetworkStatusChange: true,
    });

    // Handle Login: Switch to customer cart and merge if needed
    useEffect(() => {
        const handleLogin = async () => {
            if (user && customerCartData?.customerCart?.id) {
                const customerCartId = customerCartData.customerCart.id;

                // If we have a guest cart with items, merge it
                if (cartId && cartId !== customerCartId && cartItems.length > 0) {
                    try {
                        console.log(`Merging guest cart ${cartId} into customer cart ${customerCartId}`);
                        await mergeCartsMutation({
                            variables: { sourceId: cartId, destId: customerCartId }
                        });
                    } catch (err) {
                        console.error("Failed to merge carts:", err);
                    }
                }

                if (cartId !== customerCartId) {
                    setCartId(customerCartId);
                    localStorage.setItem('cart_id', customerCartId);
                }
            }
        };
        handleLogin();
    }, [user, customerCartData, cartId, cartItems.length, mergeCartsMutation]);

    // Update cartItems whenever cartData changes
    useEffect(() => {
        if (cartData?.cart?.items) {
            console.log('Cart Items Updated from Server:', cartData.cart.items);
            setCartItems(cartData.cart.items.map(item => ({
                id: item.uid,
                product: item.product,
                quantity: item.quantity
            })));
        }
    }, [cartData]);

    // Initial Cart Creation (for guests or if customer cart missing)
    useEffect(() => {
        const initCart = async () => {
            if (!user && (!cartId || cartId === 'undefined')) {
                try {
                    const res = await createCartMutation();
                    const id = res.data.createEmptyCart;
                    console.log('New Guest Cart Created:', id);
                    if (id) {
                        setCartId(id);
                        localStorage.setItem('cart_id', id);
                    }
                } catch (err) {
                    console.error("Failed to create guest cart", err);
                }
            }
        };
        initCart();
    }, [cartId, createCartMutation, user]);

    const addToCart = async (product, quantity = 1, selectedOptions = {}) => {
        console.log('addToCart called with:', { sku: product?.sku, qty: quantity, cartId, selectedOptions });

        if (!cartId || cartId === 'undefined' || !product?.sku) {
            console.error('Missing valid cartId or product SKU', { cartId, sku: product?.sku });
            return;
        }
        setLoading(true);
        try {
            const parentSku = product.sku;

            // Determine SKU for stock validation (variant SKU if options selected)
            let validationSku = parentSku;
            if (Object.keys(selectedOptions).length > 0 && product.variants) {
                const variant = product.variants.find(v =>
                    v.attributes.every(attr => selectedOptions[attr.code] === attr.value_index)
                );
                if (variant) {
                    validationSku = variant.product.sku;
                    console.log(`[CartDebug] Using variant SKU for validation: ${validationSku}`);
                }
            }

            // Check stock first
            const maxQtyFromApi = await getSalableQty(validationSku);
            const maxQty = (maxQtyFromApi === null || maxQtyFromApi === undefined) ? product.only_x_left_in_stock : maxQtyFromApi;

            const existingQty = cartItems
                .filter(item => item.product.sku === validationSku)
                .reduce((acc, item) => acc + item.quantity, 0);

            console.log(`[CartDebug] Adding ${validationSku}: request=${quantity}, current=${existingQty}, limit=${maxQty}`);

            if (maxQty !== null && maxQty !== undefined && (existingQty + quantity) > maxQty) {
                window.alert(`Only ${maxQty} item available in stock`);
                setLoading(false);
                return;
            }

            // Prepare cart item input
            const cartItemInput = {
                sku: parentSku,
                quantity: parseFloat(quantity)
            };

            // Add selected options if configurable
            if (Object.keys(selectedOptions).length > 0 && product.configurable_options) {
                const optionUids = [];
                product.configurable_options.forEach(opt => {
                    const selectedValIndex = selectedOptions[opt.attribute_code];
                    if (selectedValIndex !== undefined) {
                        const val = opt.values.find(v => v.value_index === selectedValIndex);
                        if (val) optionUids.push(val.uid);
                    }
                });
                if (optionUids.length > 0) {
                    cartItemInput.selected_options = optionUids;
                }
            }

            console.log('Sending addProductsToCart mutation with payload:', cartItemInput);
            await addToCartMutation({
                variables: {
                    cartId,
                    cartItems: [cartItemInput]
                }
            });

            await refetchCart();
            setIsCartOpen(true);
        } catch (err) {
            console.error('Error adding to cart:', err);
            let errorMessage = 'Failed to add product to cart. Please try again.';
            if (err.graphQLErrors && err.graphQLErrors.length > 0) {
                errorMessage = err.graphQLErrors[0].message;
            }
            window.alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (itemId) => {
        if (!cartId) return;
        try {
            await removeItemMutation({
                variables: { cartId, itemId }
            });
            await refetchCart();
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const clearCart = () => {
        setCartId(null);
        localStorage.removeItem('cart_id');
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{
            cartId,
            cartItems,
            addToCart,
            removeFromCart,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            loading
        }}>
            {loading && <LoadingOverlay />}
            {children}
        </CartContext.Provider>
    );
};
