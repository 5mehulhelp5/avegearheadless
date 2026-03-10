import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($search: String, $pageSize: Int = 8) {
    products(search: $search, pageSize: $pageSize) {
      items {
        uid
        sku
        name
        stock_status
        only_x_left_in_stock
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
        small_image {
          url
        }
      }
    }
  }
`;

export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($sku: String!) {
    products(filter: { sku: { eq: $sku } }) {
      items {
        uid
        sku
        name
        stock_status
        only_x_left_in_stock
        review_count
        rating_summary
        description {
          html
        }
        categories {
          uid
          name
          url_key
          breadcrumbs {
            category_uid
            category_name
          }
        }
        ... on ConfigurableProduct {
          configurable_options {
            id
            attribute_code
            label
            values {
              value_index
              label
              uid
            }
          }
          variants {
            attributes {
              code
              value_index
            }
            product {
              sku
              stock_status
              only_x_left_in_stock
            }
          }
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
        media_gallery {
          url
          label
        }
      }
    }
  }
`;

export const GET_CATEGORY_PRODUCTS = gql`
  query GetCategoryProducts($pageSize: Int = 12, $currentPage: Int = 1, $filter: ProductAttributeFilterInput, $sort: ProductAttributeSortInput) {
    products(filter: $filter, pageSize: $pageSize, currentPage: $currentPage, sort: $sort) {
      items {
        uid
        sku
        name
        stock_status
        only_x_left_in_stock
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
        small_image {
          url
        }
        short_description {
          html
        }
      }
      aggregations {
        attribute_code
        label
        count
        options {
          label
          value
          count
        }
      }
      total_count
      page_info {
        current_page
        total_pages
      }
    }
  }
`;

export const GET_CATEGORY_INFO = gql`
  query GetCategoryInfo($id: String, $urlKey: String) {
    categoryList(filters: { category_uid: { eq: $id }, url_key: { eq: $urlKey } }) {
        uid
        name
        url_key
        url_path
        description
        meta_title
        meta_description
        breadcrumbs {
            category_uid
            category_name
            category_level
        }
        children {
            uid
            name
            url_key
            children {
                uid
                name
                url_key
                children {
                    uid
                }
            }
        }
    }
  }
`;

export const GET_CATEGORY_TREE = gql`
  query GetCategoryTree {
    categoryList(filters: { ids: { eq: "2" } }) {
      children {
        uid
        name
        include_in_menu
        url_key
        url_path
        children {
          uid
          name
          url_key
          url_path
          include_in_menu
        }
      }
    }
  }
`;

export const GET_STORE_CONFIG = gql`
  query GetStoreConfig {
    storeConfig {
      header_logo_src
      secure_base_media_url
      logo_alt
    }
  }
`;

export const GET_CMS_PAGE = gql`
  query GetCmsPage($identifier: String!) {
    cmsPage(identifier: $identifier) {
      identifier
      title
      content
      content_heading
      meta_title
      meta_description
    }
  }
`;

export const GET_CMS_BLOCKS = gql`
  query GetCmsBlocks($identifiers: [String]!) {
    cmsBlocks(identifiers: $identifiers) {
      items {
        identifier
        title
        content
      }
    }
  }
`;

export const GET_CATALOG_PRICE_RULES = gql`
  query GetCatalogPriceRules {
    catalogPriceRules {
      items {
        rule_id
        name
        description
        is_active
        discount_amount
        simple_action
      }
    }
  }
`;

export const GET_CART_PRICE_RULES = gql`
  query GetCartPriceRules {
    cartPriceRules {
      items {
        rule_id
        name
        description
        is_active
        discount_amount
        simple_action
        coupon_type
        stop_rules_processing
      }
    }
  }
`;

export const GET_PROMOTIONS = gql`
  query GetPromotions {
    catalogPriceRules {
      items {
        rule_id
        name
        description
        is_active
        discount_amount
        simple_action
      }
    }
    cartPriceRules {
      items {
        rule_id
        name
        description
        is_active
        discount_amount
        simple_action
        coupon_type
        stop_rules_processing
      }
    }
  }
`;

// Consolidated query for initial store data and category tree
export const GET_INITIAL_DATA = gql`
  query GetInitialData {
    storeConfig {
      header_logo_src
      secure_base_media_url
      logo_alt
    }
    categoryList(filters: { ids: { eq: "2" } }) {
      children {
        uid
        name
        include_in_menu
        url_key
        url_path
        children {
          uid
          name
          url_key
          url_path
          include_in_menu
        }
      }
    }
  }
`;

// Consolidated query for Home page products (Featured and Trending)
export const GET_HOME_DATA = gql`
  query GetHomeData($featuredSize: Int = 4, $trendingSize: Int = 4, $trendingSearch: String = "audio") {
    featuredProducts: products(search: "", pageSize: $featuredSize) {
      items {
        uid
        sku
        name
        stock_status
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
        small_image {
          url
        }
      }
    }
    trendingProducts: products(search: $trendingSearch, pageSize: $trendingSize) {
      items {
        uid
        sku
        name
        stock_status
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
        small_image {
          url
        }
      }
    }
  }
`;
