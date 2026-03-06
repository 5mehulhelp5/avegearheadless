import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_WISHLIST, ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST } from '../api/wishlist';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);

    const { data, refetch } = useQuery(GET_WISHLIST, {
        skip: !user,
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        if (data?.customer?.wishlists?.[0]) {
            setItems(data.customer.wishlists[0].items_v2.items);
        } else {
            setItems([]);
        }
    }, [data]);

    const [addMutation] = useMutation(ADD_TO_WISHLIST);
    const [removeMutation] = useMutation(REMOVE_FROM_WISHLIST);

    const wishlistId = data?.customer?.wishlists?.[0]?.id || "0";

    const addToWishlist = async (sku) => {
        if (!user) return { success: false, error: 'Please login to add to wishlist' };

        try {
            const { data: addData } = await addMutation({
                variables: {
                    wishlistId,
                    wishlistItems: [{ sku, quantity: 1 }]
                }
            });

            if (addData.addProductsToWishlist.user_errors.length > 0) {
                return { success: false, error: addData.addProductsToWishlist.user_errors[0].message };
            }

            await refetch();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const removeFromWishlist = async (itemId) => {
        try {
            const { data: removeData } = await removeMutation({
                variables: {
                    wishlistId,
                    wishlistItemIds: [itemId]
                }
            });

            if (removeData.removeProductsFromWishlist.user_errors.length > 0) {
                return { success: false, error: removeData.removeProductsFromWishlist.user_errors[0].message };
            }

            await refetch();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const isInWishlist = (sku) => {
        return items.some(item => item.product.sku === sku);
    };

    const getWishlistItemId = (sku) => {
        return items.find(item => item.product.sku === sku)?.id;
    };

    return (
        <WishlistContext.Provider value={{
            items,
            loading: !data && !!user,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            getWishlistItemId,
            refetch
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
