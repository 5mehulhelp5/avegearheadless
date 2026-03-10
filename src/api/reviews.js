import { gql } from '@apollo/client';

export const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($sku: String!, $pageSize: Int = 10, $currentPage: Int = 1) {
    products(filter: { sku: { eq: $sku } }) {
      items {
        sku
        review_count
        rating_summary
        reviews(pageSize: $pageSize, currentPage: $currentPage) {
          items {
            nickname
            summary
            text
            created_at
            average_rating
            ratings_breakdown {
              name
              value
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

export const GET_REVIEW_METADATA = gql`
  query GetReviewMetadata {
    productReviewRatingsMetadata {
      items {
        id
        name
        values {
          value_id
          value
        }
      }
    }
  }
`;

export const CREATE_PRODUCT_REVIEW = gql`
  mutation CreateProductReview($input: CreateProductReviewInput!) {
    createProductReview(input: $input) {
      review {
        nickname
        summary
        text
        average_rating
        ratings_breakdown {
          name
          value
        }
      }
    }
  }
`;
