// =======================================================
// DATOS GLOBALES Y CONSTANTES NUTRICIONALES
// =======================================================

// Valores nutricionales por una porción de cada grupo (BASE DE LA TABLA)
// Fuente: Valores típicos de tablas de intercambio.
const grupoNutrientesBase = {
    // Grupo CEREALES Y PAPAS
    cereales: { kcal: 140, prot: 3, cho: 30, lip: 1 },
    // Grupo VERDURAS (Asumiendo Verduras de Consumo General)
    verduras: { kcal: 25, prot: 2, cho: 4, lip: 0 },
    // Grupo FRUTAS
    frutas: { kcal: 65, prot: 1, cho: 15, lip: 0 },
    // Grupo LÁCTEOS (Asumiendo Lácteos Medios en Grasa)
    lacteos: { kcal: 120, prot: 8, cho: 12, lip: 5 },
    // Grupo CARNES (Asumiendo Carnes Bajas en Grasa)
    carnes: { kcal: 75, prot: 7, cho: 0, lip: 5 },
    // Grupo LEGUMINOSAS
    leguminosas: { kcal: 100, prot: 7, cho: 17, lip: 1 },
    // Grupo LÍPIDOS (Frutos secos, etc.)
    lipidos: { kcal: 45, prot: 0, cho: 0, lip: 5 },
    // Grupo ACEITES (Grasas Puras)
    aceites: { kcal: 45, prot: 0, cho: 0, lip: 5 },
    // Grupo AZÚCARES
    azucares: { kcal: 20, prot: 0, cho: 5, lip: 0 },
};

// Requerimientos nutricionales del paciente (Valores iniciales de ejemplo)
let requerimientos = {
    kcal: 2000,
    prot: 80,
    cho: 250,
    lip: 60
};

// Estado donde se guardan las selecciones del usuario (ej: {manzana: 1, arroz: 0.5})
let userSelections = {};

// Almacenará la data de alimentos.json globalmente una vez cargada
let allFoods = {};

// Elementos del DOM
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContent = document.getElementById("tab-content");

// =======================================================
// 1) CARGA DE DATOS
// =======================================================

async function loadFoods() {
    try {
        // La ruta es relativa a index.html. Asumo la ruta 'data/alimentos.json'
        const res = await fetch("./data/alimentos.json");
        return await res.json();
    } catch (error) {
        console.error("❌ Error cargando alimentos.json:", error);
        return {}; // Devuelve objeto vacío para evitar errores de referencia
    }
}

// =======================================================
// 2) SISTEMA DE PESTAÑAS Y EVENTOS
// =======================================================

tabButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
        // Quitar clase "active" de la pestaña anterior
        document.querySelector(".tab-btn.active").classList.remove("active");
        btn.classList.add("active");

        const selectedTab = btn.dataset.tab;

        // Si es la pestaña de resumen -> mostrar calculadora final
        if (selectedTab === "resumen") {
            renderSummary();
            return;
        }

        // Si es cualquier otra pestaña -> mostrar alimentos
        loadFoodFamily(allFoods, selectedTab);
    });
});

// =======================================================
// 3) MOSTRAR LOS ALIMENTOS DE UNA FAMILIA
// =======================================================

function loadFoodFamily(allFoods, familyName) {
    const items = allFoods[familyName];

    if (!items) {
        tabContent.innerHTML = "<p>No hay alimentos disponibles para esta categoría.</p>";
        return;
    }

    // Título
    tabContent.innerHTML = `<h2>${capitalize(familyName)}</h2>`;

    // Renderizar cada alimento
    items.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("food-item");

        // Usamos el id del alimento como clave en userSelections
        const currentValue = userSelections[item.id] !== undefined ? userSelections[item.id] : 0;

        div.innerHTML = `
            <span class="food-name">${item.nombre} — <b>${item.porcion}</b></span>

            <input 
                type="number" 
                min="0" 
                max="100" 
                step="0.5"
                class="portion-input"
                value="${currentValue}"
                data-food-id="${item.id}"
            >
        `;

        // Escuchar los cambios en las porciones
        div.querySelector("input").addEventListener("input", updateSelection);

        tabContent.appendChild(div);
    });
}

// =======================================================
// 4) GUARDAR SELECCIÓN DEL USUARIO
// =======================================================

function updateSelection(e) {
    const id = e.target.dataset.foodId;
    // Aseguramos que el valor sea numérico, 0 si está vacío o no es válido
    const value = parseFloat(e.target.value) || 0; 

    // Guardar la porción seleccionada
    userSelections[id] = value;
}

// =======================================================
// 5) CÁLCULO Y ADECUACIÓN NUTRICIONAL
// =======================================================

/**
 * Recorre las selecciones del usuario y calcula el total de nutrientes por grupo y el total general.
 * @returns {object} {grupos: {grupo: {porciones, ...}}, total: {...}}
 */
function calcularTotalesDieta() {
    const totalesGrupos = {};
    let totalGeneral = { kcal: 0, prot: 0, cho: 0, lip: 0 };

    // 1. Inicializar totales por grupo y mapear porciones
    for (const grupo in grupoNutrientesBase) {
        // Inicializar el objeto para cada grupo
        totalesGrupos[grupo] = { porciones: 0, kcal: 0, prot: 0, cho: 0, lip: 0 };

        // 2. Agrupar las porciones. Iteramos sobre allFoods para encontrar las porciones del grupo
        if (allFoods[grupo]) {
            allFoods[grupo].forEach(item => {
                const porciones = userSelections[item.id] || 0;
                totalesGrupos[grupo].porciones += porciones;
            });
        }
    }
    
    // 3. Calcular nutrientes totales (por grupo y general)
    for (const grupo in totalesGrupos) {
        const porciones = totalesGrupos[grupo].porciones;
        const base = grupoNutrientesBase[grupo];

        if (porciones > 0 && base) {
            const kcal = porciones * base.kcal;
            const prot = porciones * base.prot;
            const cho = porciones * base.cho;
            const lip = porciones * base.lip;

            // Guardar nutrientes calculados por grupo
            totalesGrupos[grupo].kcal = kcal;
            totalesGrupos[grupo].prot = prot;
            totalesGrupos[grupo].cho = cho;
            totalesGrupos[grupo].lip = lip;

            // Sumar al total general
            totalGeneral.kcal += kcal;
            totalGeneral.prot += prot;
            totalGeneral.cho += cho;
            totalGeneral.lip += lip;
        }
    }

    return { grupos: totalesGrupos, total: totalGeneral };
}


/**
 * Calcula la adecuación porcentual.
 * @param {object} total - Totales de la dieta.
 * @param {object} req - Requerimientos del paciente.
 * @returns {object} Adecuación en porcentaje.
 */
function calcularAdecuacion(total, req) {
    const adecuacion = {};

    ['kcal', 'prot', 'cho', 'lip'].forEach(nutriente => {
        // Solo calcular si el requerimiento es positivo para evitar división por cero
        if (req[nutriente] > 0) {
            adecuacion[nutriente] = (total[nutriente] / req[nutriente]) * 100;
        } else {
            // Mostrar "N/D" (No Definido) o 0 si el requerimiento es 0
            adecuacion[nutriente] = 0; 
        }
    });

    return adecuacion;
}

/**
 * Actualiza los requerimientos globales y vuelve a renderizar el resumen.
 * @param {Event} e 
 */
function updateRequerimientosAndSummary(e) {
    const nutriente = e.target.dataset.nutriente;
    // Aseguramos que el valor sea numérico, 0 si está vacío o negativo
    const value = Math.max(0, parseFloat(e.target.value) || 0); 
    e.target.value = value; // Asegura que el input refleje el valor saneado

    requerimientos[nutriente] = value;
    
    // Re-renderizar la tabla para actualizar la adecuación en tiempo real
    renderSummary(); 
}

// =======================================================
// 6) RENDERIZADO DEL RESUMEN FINAL (LA TABLA)
// =======================================================

function renderSummary() {
    // 1. Calcular totales
    const totalesDieta = calcularTotalesDieta();

    // 2. Calcular adecuación
    const adecuacion = calcularAdecuacion(totalesDieta.total, requerimientos);

    // 3. Generar el HTML de la tabla
    let tableHTML = `
        <div class="summary-container">
            <h2>Resumen Nutricional y Adecuación</h2>
            <p>Datos calculados en base a ${totalesDieta.total.kcal.toFixed(0)} Kcal totales aportadas por las porciones seleccionadas.</p>
            <table id="calculadora-table">
                <thead>
                    <tr>
                        <th class="sticky-header">GRUPO DE ALIMENTOS</th>
                        <th class="sticky-header">NÚMERO DE PORCIONES</th>
                        <th class="sticky-header">ENERGÍA (KCAL)</th>
                        <th class="sticky-header">PROTEÍNAS (G)</th>
                        <th class="sticky-header">CHO (G)</th>
                        <th class="sticky-header">LÍPIDOS (G)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // 3.1 Filas de los Grupos de Alimentos
    for (const grupo in totalesDieta.grupos) {
        const data = totalesDieta.grupos[grupo];
        const nombreGrupo = formatGroupName(grupo);

        // Si el grupo tiene porciones seleccionadas, lo mostramos.
        // Opcionalmente, se pueden mostrar todos aunque la porción sea 0. Lo haré mostrando solo si hay porciones > 0 para simplificar la vista, o si la data base está definida.
        if (grupoNutrientesBase[grupo]) {
             tableHTML += `
                <tr>
                    <td><b>${nombreGrupo}</b></td>
                    <td class="center-text">${data.porciones.toFixed(1)}</td>
                    <td class="center-text">${data.kcal.toFixed(0)}</td>
                    <td class="center-text">${data.prot.toFixed(1)}</td>
                    <td class="center-text">${data.cho.toFixed(1)}</td>
                    <td class="center-text">${data.lip.toFixed(1)}</td>
                </tr>
            `;
        }
    }

    // 3.2 Fila TOTAL
    tableHTML += `
            <tr class="total-row">
                <td><b>TOTAL DE DIETA (Porciones)</b></td>
                <td></td>
                <td class="center-text">${totalesDieta.total.kcal.toFixed(0)}</td>
                <td class="center-text">${totalesDieta.total.prot.toFixed(1)}</td>
                <td class="center-text">${totalesDieta.total.cho.toFixed(1)}</td>
                <td class="center-text">${totalesDieta.total.lip.toFixed(1)}</td>
            </tr>
    `;
    
    // 3.3 Fila REQUERIMIENTO (Editable)
    tableHTML += `
            <tr class="requerimiento-row">
                <td><b>REQUERIMIENTO (Paciente)</b></td>
                <td></td>
                <td><input type="number" data-nutriente="kcal" value="${requerimientos.kcal}" min="0"></td>
                <td><input type="number" data-nutriente="prot" value="${requerimientos.prot}" min="0"></td>
                <td><input type="number" data-nutriente="cho" value="${requerimientos.cho}" min="0"></td>
                <td><input type="number" data-nutriente="lip" value="${requerimientos.lip}" min="0"></td>
            </tr>
    `;

    // 3.4 Fila ADECUACIÓN (%)
    tableHTML += `
            <tr class="adecuacion-row">
                <td><b>ADECUACIÓN (%)</b></td>
                <td></td>
                <td class="center-text">${adecuacion.kcal.toFixed(1)}%</td>
                <td class="center-text">${adecuacion.prot.toFixed(1)}%</td>
                <td class="center-text">${adecuacion.cho.toFixed(1)}%</td>
                <td class="center-text">${adecuacion.lip.toFixed(1)}%</td>
            </tr>
        </tbody>
        </table>
        </div>
    `;

    tabContent.innerHTML = tableHTML;
    
    // 4. Añadir listener para actualizar requerimientos
    document.querySelectorAll('.requerimiento-row input').forEach(input => {
        input.addEventListener('input', updateRequerimientosAndSummary);
    });
}


// =======================================================
// 7) UTILIDADES
// =======================================================

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatGroupName(groupKey) {
    // Convierte las claves del JSON a nombres legibles para la tabla
    switch (groupKey) {
        case 'cereales': return 'CEREALES y PAPAS';
        case 'verduras': return 'VERDURAS DE CONSUMO GENERAL';
        case 'frutas': return 'FRUTAS';
        case 'lacteos': return 'LÁCTEOS';
        case 'carnes': return 'CARNES';
        case 'leguminosas': return 'LEGUMINOSAS';
        case 'lipidos': return 'ALIMENTOS RICOS EN LÍPIDOS';
        case 'aceites': return 'ACEITES';
        case 'azucares': return 'AZÚCARES';
        default: return capitalize(groupKey);
    }
}

// =======================================================
// 8) INICIO DE LA APLICACIÓN
// =======================================================

(async function init() {
    allFoods = await loadFoods(); // GUARDAMOS LA DATA GLOBALMENTE

    if (Object.keys(allFoods).length === 0) {
        tabContent.innerHTML = "<p>Error: No se pudo cargar la base de datos de alimentos.</p>";
        return;
    }
    
    // Cargar la pestaña inicial (Cereales)
    loadFoodFamily(allFoods, "cereales");
})();