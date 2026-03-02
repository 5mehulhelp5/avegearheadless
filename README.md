# Headless Magento 2 React Frontend

A production-ready headless frontend for Magento 2 built with Vite and React.

## Features
- **Headless Architecture**: Uses Apollo Client to consume Magento GraphQL API.
- **Premium UI**: Clean, modern design with responsive layout.
- **Core Pages**: Homepage, Category (PLP), Product Detail (PDP), Cart.
- **State Management**: React Context for global state (Cart).
- **Environment Aware**: Configurable backend URL.

## Prerequisites
- Node.js (v16+)
- Magento 2 Store (with GraphQL enabled and CORS configured)

## Setup

1. **Install Dependencies**
   ```bash
   cd magento-headless
   npm install
   ```

2. **Configure Environment**
   Update `.env` with your Magento 2 URL:
   ```
   VITE_MAGENTO_URL=https://staging.example.com/graphql
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```
   Access at `http://localhost:5173`.

## Notes
- **CORS**: Ensure your Magento server allows requests from `http://localhost:5173`. If you see Network Errors, this is likely the cause.
- **Images**: If product images are missing, check if the media URL in Magento is accessible.

## Project Structure
- `src/api`: GraphQL queries and client config.
- `src/components`: Reusable UI components.
- `src/contexts`: React Context (Cart).
- `src/pages`: Page views (Home, Category, Product, Cart).
- `src/styles`: Global CSS variables.
