/**
 * Fetches the actual salable quantity for a product from Magento.
 * Implementation:
 * 1. Tries MSI Salable Quantity endpoint (if MSI is enabled).
 * 2. Falls back to Legacy Stock Item endpoint.
 * 3. Handles server-side 500 errors or authorization issues gracefully.
 * 
 * @param {string} sku - Product SKU
 * @returns {Promise<number|null>} - Returns quantity or null if it cannot be determined.
 */
import { getAdminHeaders } from './client';

export const getSalableQty = async (sku) => {
  if (!sku) return null;
  console.log(`[StockDebug] Fetching stock for: ${sku}`);

  const stockId = 1; // Default MSI Stock ID
  const headers = await getAdminHeaders(); // Get dynamic admin token

  // 1. Try MSI Salable Quantity API
  try {
    const msiUrl = `/magento-api/rest/V1/inventory/get-product-salable-quantity/${encodeURIComponent(sku)}/${stockId}`;
    console.log(`[StockDebug] MSI URL: ${msiUrl}`);
    const msiResponse = await fetch(msiUrl, { headers });

    if (msiResponse.ok) {
      const msiQty = await msiResponse.json();
      console.log(`[StockDebug] ${sku} - RAW MSI Response:`, msiQty);
      if (typeof msiQty === 'number') {
        console.log(`[StockDebug] ${sku} - MSI Salable Qty: ${msiQty}`);
        if (msiQty > 0) return msiQty;
      }
    } else {
      const errorText = await msiResponse.text();
      console.warn(`[StockDebug] ${sku} - MSI Salable API failed with status: ${msiResponse.status}. Body: ${errorText}`);
    }
  } catch (err) {
    console.warn(`[StockDebug] ${sku} - MSI Fetch Error:`, err.message);
  }

  // 2. Fallback to Legacy Stock Item API
  try {
    const legacyUrl = `/magento-api/rest/V1/stockItems/${encodeURIComponent(sku)}`;
    console.log(`[StockDebug] Legacy URL: ${legacyUrl}`);
    const legacyResponse = await fetch(legacyUrl, { headers });

    if (legacyResponse.ok) {
      const data = await legacyResponse.json();
      console.log(`[StockDebug] ${sku} - Legacy Data:`, data);

      if (data.is_in_stock === false) {
        console.log(`[StockDebug] ${sku} - Legacy: Marked Out of Stock`);
        return 0;
      }

      const legacyQty = Number(data.qty);
      if (!Number.isNaN(legacyQty)) {
        console.log(`[StockDebug] ${sku} - Legacy Qty: ${legacyQty}`);
        return legacyQty;
      }
    } else {
      const errorText = await legacyResponse.text();
      console.warn(`[StockDebug] ${sku} - Legacy Stock API failed with status: ${legacyResponse.status}. Body: ${errorText}`);
    }
  } catch (err) {
    console.error(`[StockDebug] ${sku} - Legacy Fetch Error:`, err.message);
  }

  // 3. Last Resort Fallback
  console.warn(`[StockDebug] ${sku} - Could not determine stock from any REST API`);
  return null;
}

