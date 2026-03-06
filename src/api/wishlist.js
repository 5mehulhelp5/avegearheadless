import { gql } from '@apollo/client';

export const GET_WISHLIST = gql`
  query GetWishlist {
    customer {
      wishlists {
        id
        items_count
        items_v2 {
          items {
            id
            added_at
            description
            product {
              uid
              sku
              name
              small_image {
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
          page_info {
            current_page
            total_pages
          }
        }
      }
    }
  }
`;

export const ADD_TO_WISHLIST = gql`
  mutation AddToWishlist($wishlistId: ID!, $wishlistItems: [WishlistItemInput!]!) {
    addProductsToWishlist(wishlistId: $wishlistId, wishlistItems: $wishlistItems) {
      wishlist {
        id
        items_count
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const REMOVE_FROM_WISHLIST = gql`
  mutation RemoveFromWishlist($wishlistId: ID!, $wishlistItemIds: [ID!]!) {
    removeProductsFromWishlist(wishlistId: $wishlistId, wishlistItemIds: $wishlistItemIds) {
      wishlist {
        id
        items_count
      }
      user_errors {
        code
        message
      }
    }
  }
`;
