// Valores nutricionales por una porción de cada grupo (BASE DE LA TABLA)
const grupoNutrientesBase = {
    // Valores de la imagen de referencia (ajustados a valores comunes en tablas)
    cereales: { kcal: 140, prot: 3, cho: 30, lip: 1 },
    verduras: { kcal: 25, prot: 2, cho: 4, lip: 0 }, // Valores típicos para verduras C/G
    frutas: { kcal: 65, prot: 1, cho: 15, lip: 0 },
    lacteos: { kcal: 120, prot: 8, cho: 12, lip: 5 }, // Lácteos medios en grasa como referencia
    carnes: { kcal: 75, prot: 7, cho: 0, lip: 5 },   // Carnes bajas en grasa como referencia
    leguminosas: { kcal: 100, prot: 7, cho: 17, lip: 1 },
    lipidos: { kcal: 45, prot: 0, cho: 0, lip: 5 },
    aceites: { kcal: 45, prot: 0, cho: 0, lip: 5 },
    azucares: { kcal: 20, prot: 0, cho: 5, lip: 0 },
    // Para simplificar, asumiremos que las "Verduras de libre consumo" no suman porciones en este modelo
};

// Requerimientos nutricionales del paciente (Valores de ejemplo)
// Estos valores deben ser editables por el usuario más adelante en la tabla final.
let requerimientos = {
    kcal: 2000,
    prot: 80,
    cho: 250,
    lip: 60
};