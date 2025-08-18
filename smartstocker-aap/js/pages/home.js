import { apiGetItems } from "../api/apiGetItems.js";

function ErrorBanner(error) {
  return `<hgroup>
    <h2>Error Loading Product</h2>
    <p>${error.message}</p>
  </hgroup>`;
}

const lowStockThreshold = 5;

function lowStockAnalysis(quantity) {
  if (quantity === 0) return "out-of-stock";
  if (quantity < lowStockThreshold) return "low-stock";
  return "in-stock";
}

function ItemRow(product) {
  return `
    <tr>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td class="${lowStockAnalysis(product.quantity)}">${product.quantity}</td>
      <td><a href="details#${product.id}">View</a></td>
    </tr>
  `;
}

function ItemTable(items) {
  const itemRows = items.map(ItemRow).join("");
  return `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Quantity</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>
  `;
}

export default async function render() {
  const app = document.getElementById("app");

  app.innerHTML = `
<section class="grid">
  <div>
    <label for="filter-quantity">Filter by Quantity:</label>
    <select id="filter-quantity">
      <option value="">All</option>
      <option value="out">Out of Stock</option>
      <option value="low">Low Stock</option>
    </select>
  </div>

  <div>
    <label for="filter-category">Filter by Category:</label>
    <select id="filter-category">
      <option value="">All</option>
      <option value="Grains">Grains</option>
      <option value="Beverages">Beverages</option>
      <option value="Oils">Oils</option>
      <option value="Snacks">Snacks</option>
      <option value="Legumes">Legumes</option>
    </select>
  </div>
  
  <div>
    <label for="sortby-select">Sort By:</label> 
    <select id="sortby-select">
      <option value="">None</option>
      <option value="name">Name</option>
      <option value="quantity">Quantity</option>
    </select>
  </div>

  <div>
    <label for="sortDir-select">Direction:</label> 
    <select id="sortDir-select">
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>
  </div>
</section>

<section id="table-container"></section>
`;

  const tableContainer = document.getElementById("table-container");
  const filterQuantitySelect = document.getElementById("filter-quantity");
  const filterCategorySelect = document.getElementById("filter-category");
  const sortBySelect = document.getElementById("sortby-select");
  const sortDirSelect = document.getElementById("sortDir-select");

  async function loadAndRender() {
    const filterQuantity = filterQuantitySelect.value;
    const filterCategory = filterCategorySelect.value;
    const sortBy = sortBySelect.value;
    const sortDir = sortDirSelect.value;

    // fetch all items first
    const { error, data } = await apiGetItems({ sortBy, sortDir });

    if (error) {
      tableContainer.innerHTML = ErrorBanner(error);
      return;
    }

    let filteredData = data;

    // apply quantity filter
    if (filterQuantity === "out") {
      filteredData = filteredData.filter((item) => item.quantity === 0);
    } else if (filterQuantity === "low") {
      filteredData = filteredData.filter(
        (item) => item.quantity > 0 && item.quantity < lowStockThreshold
      );
    }

    // apply category filter
    if (filterCategory) {
      filteredData = filteredData.filter(
        (item) => item.category === filterCategory
      );
    }

    tableContainer.innerHTML = ItemTable(filteredData);
  }

  // Attach event listeners
  filterQuantitySelect.addEventListener("change", loadAndRender);
  filterCategorySelect.addEventListener("change", loadAndRender);
  sortBySelect.addEventListener("change", loadAndRender);
  sortDirSelect.addEventListener("change", loadAndRender);

  // Initial load
  loadAndRender();
}
