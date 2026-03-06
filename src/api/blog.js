import { gql } from '@apollo/client';

export const GET_BLOG_POSTS = gql`
  query GetBlogPosts($pageSize: Int = 10, $currentPage: Int = 1, $filter: BlogPostsFilterInput) {
    blogPosts(filter: $filter, pageSize: $pageSize, currentPage: $currentPage) {
      items {
        post_id
        title
        identifier
        short_filtered_content
        filtered_content
        featured_image
        featured_list_image
        publish_time
        author {
          name
        }
      }
      total_count
    }
  }
`;

export const GET_BLOG_POST_DETAIL = gql`
  query GetBlogPostDetail($urlKey: String!) {
    blogPost(id: $urlKey) {
      post_id
      title
      filtered_content
      featured_image
      publish_time
      author {
        name
      }
      meta_title
      meta_description
      meta_keywords
    }
  }
`;
