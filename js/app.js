async function loadFoods() {
  const response = await fetch("data/alimentos.json");
  const foods = await response.json();

  const select = document.getElementById("food-select");
  foods.forEach(food => {
    const option = document.createElement("option");
    option.value = food.nombre;
    option.textContent = food.nombre;
    select.appendChild(option);
  });

  return foods;
}

document.addEventListener("DOMContentLoaded", async () => {
  const foods = await loadFoods();

  document.getElementById("calculate-btn").addEventListener("click", () => {
    const selectedFood = document.getElementById("food-select").value;
    const grams = parseFloat(document.getElementById("grams-input").value);

    const foodData = foods.find(f => f.nombre === selectedFood);

    if (!foodData || isNaN(grams)) {
      document.getElementById("result-output").textContent = "Por favor ingresa datos válidos.";
      return;
    }

    // Ejemplo: cálculo de porciones según equivalentes
    const porciones = grams / foodData.porcion_equivalente;

    document.getElementById("result-output").textContent =
      `Equivale a ${porciones.toFixed(2)} porciones de intercambio.`;
  });
});