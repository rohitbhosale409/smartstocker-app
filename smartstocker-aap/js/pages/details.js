import { apiGetItemDetails } from "../api/apiGetItemDetails.js";
import { apiDeleteItem } from "../api/apiDeleteItem.js";
import { apiUpdateItem } from "../api/apiUpdateItem.js";

function getHash() {
  return Number(window.location.hash.replace("#", ""));
}

function ErrorBanner(error) {
  return `<hgroup>
    <h2>Error Loading Product</h2>
    <p>${error.message}</p>
  </hgroup>`;
}

const lowStockThreshold = 5;

function getStockStatusClass(quantity) {
  if (quantity === 0) return "out-of-stock";
  if (quantity < lowStockThreshold) return "low-stock";
  return "in-stock";
}

function ItemDetails(item) {
  return `<article>
      <header><h2>${item.name}</h2></header>
      <p>Category: ${item.category}</p>
      <p>Stock: <span class="${getStockStatusClass(
        item.quantity
      )}" id="stock-value">
        ${item.quantity}
      </span></p>
      <footer>
        <button id="restock-item">Restock</button>
        <button id="delete-item" class="secondary outline">Remove</button>
      </footer>
    </article>`;
}

function ItemDeleteSuccess() {
  return `<hgroup>
      <h2>Item Deleted</h2>
      <p>The item has been successfully deleted.</p>
      <a href="/">Back to home</a> 
    </hgroup>`;
}

async function deleteItem() {
  const id = getHash();
  const { error } = await apiDeleteItem(id);

  if (error) {
    document.getElementById("app").innerHTML = ErrorBanner(error);
    return;
  }

  document.getElementById("app").innerHTML = ItemDeleteSuccess();
}

async function restockItem() {
  const id = getHash();
  const { error, data } = await apiGetItemDetails(id);

  if (error) {
    document.getElementById("app").innerHTML = ErrorBanner(error);
    return;
  }

  const newQuantity = data.quantity + 1;
  const { error: updateError, data: updatedItem } = await apiUpdateItem(id, {
    quantity: newQuantity,
  });

  if (updateError) {
    document.getElementById("app").innerHTML = ErrorBanner(updateError);
    return;
  }

  const stockElement = document.getElementById("stock-value");
  stockElement.innerText = updatedItem.quantity;
  stockElement.className = getStockStatusClass(updatedItem.quantity);
}

function attachButtonHandlers() {
  document.getElementById("delete-item").addEventListener("click", deleteItem);
  document
    .getElementById("restock-item")
    .addEventListener("click", restockItem);
}

export default async function render() {
  const id = getHash();
  const { error, data } = await apiGetItemDetails(id);

  if (error) {
    document.getElementById("app").innerHTML = ErrorBanner(error);
    return;
  }

  document.getElementById("app").innerHTML = ItemDetails(data);
  attachButtonHandlers();
}
