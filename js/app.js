// =======================================================
// 1) Cargar archivo JSON con todas las familias de alimentos
// =======================================================

async function loadFoods() {
  try {
    const res = await fetch("./data/alimentos.json"); // ruta correcta
    return await res.json();
  } catch (error) {
    console.error("❌ Error cargando alimentos.json:", error);
  }
}

// Estado donde se guardan las selecciones del usuario
let userSelections = {};

// Elementos del DOM
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContent = document.getElementById("tab-content");

// =======================================================
// 2) Sistema de pestañas
// =======================================================

tabButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    // Quitar clase "active" de la pestaña anterior
    document.querySelector(".tab-btn.active").classList.remove("active");
    btn.classList.add("active");

    // obtener nombre de pestaña
    const selectedTab = btn.dataset.tab;

    // cargar alimentos
    const foods = await loadFoods();

    // Si es la pestaña de resumen → mostrar calculadora final
    if (selectedTab === "resumen") {
      renderSummary();
      return;
    }

    // Si es cualquier otra pestaña → mostrar alimentos
    loadFoodFamily(foods, selectedTab);
  });
});

// =======================================================
// 3) Mostrar los alimentos de una familia
// =======================================================

function loadFoodFamily(allFoods, familyName) {
  const items = allFoods[familyName];

  if (!items) {
    tabContent.innerHTML = "<p>No hay alimentos disponibles.</p>";
    return;
  }

  // Título
  tabContent.innerHTML = `<h2>${capitalize(familyName)}</h2>`;

  // Renderizar cada alimento
  items.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("food-item");

    div.innerHTML = `
      <span>${item.nombre} — <b>${item.porcion}</b></span>

      <input 
        type="number" 
        min="0" 
        max="100" 
        value="${userSelections[item.id] || 0}"
        data-food="${item.id}"
      >
    `;

    // Escuchar los cambios en las porciones
    div.querySelector("input").addEventListener("input", updateSelection);

    tabContent.appendChild(div);
  });
}

// =======================================================
// 4) Guardar selección del usuario
// =======================================================

function updateSelection(e) {
  const id = e.target.dataset.food;
  const value = parseFloat(e.target.value) || 0;

  userSelections[id] = value;
}

// =======================================================
// 5) Mostrar resumen final
// =======================================================

function renderSummary() {
  let total = 0;

  for (let val of Object.values(userSelections)) {
    total += val;
  }

  tabContent.innerHTML = `
    <h2>Resumen de porciones</h2>
    <p><b>Total de porciones consumidas:</b> ${total}</p>
  `;
}

// =======================================================
// 6) Función para poner mayúscula al inicio
// =======================================================

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// =======================================================
// 7) Cargar la primera pestaña automáticamente
// =======================================================

(async function init() {
  const foods = await loadFoods();

  if (!foods) {
    tabContent.innerHTML = "<p>Error cargando alimentos.</p>";
    return;
  }

  loadFoodFamily(foods, "cereales"); // pestaña inicial
})();
