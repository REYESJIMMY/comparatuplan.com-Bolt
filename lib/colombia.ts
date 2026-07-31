/**
 * Fuente única de departamentos y municipios.
 * Antes vivía duplicado (o inexistente) en cada componente que
 * necesitaba ubicación — CoberturaForm.tsx, y ahora CiudadSelectorMini.tsx.
 * Cualquier edición a esta lista (agregar un municipio, corregir un nombre)
 * se hace UNA sola vez, aquí.
 */
export const DEPARTAMENTOS: Record<string, string[]> = {
  "Bogotá D.C.":     ["Bogotá"],
  "Antioquia":       ["Medellín","Bello","Itagüí","Envigado","Sabaneta","Rionegro","Copacabana","Apartadó"],
  "Valle del Cauca": ["Cali","Palmira","Buenaventura","Tuluá","Cartago","Buga"],
  "Atlántico":       ["Barranquilla","Soledad","Malambo","Sabanalarga","Galapa"],
  "Santander":       ["Bucaramanga","Floridablanca","Girón","Piedecuesta","Barrancabermeja"],
  "Bolívar":         ["Cartagena","Magangué","Turbaco"],
  "Cundinamarca":    ["Soacha","Chía","Zipaquirá","Fusagasugá","Facatativá","Mosquera","Madrid"],
  "Nariño":          ["Pasto","Tumaco","Ipiales","Túquerres"],
  "Risaralda":       ["Pereira","Dosquebradas","Santa Rosa de Cabal"],
  "Quindío":         ["Armenia","Calarcá","La Tebaida"],
  "Caldas":          ["Manizales","Villamaría","Chinchiná"],
  "Huila":           ["Neiva","Pitalito","Garzón"],
  "Tolima":          ["Ibagué","Espinal","Melgar","Honda"],
  "Córdoba":         ["Montería","Lorica","Sahagún"],
  "Meta":            ["Villavicencio","Acacías","Granada"],
  "Magdalena":       ["Santa Marta","Ciénaga","Fundación"],
  "Cauca":           ["Popayán","Santander de Quilichao","Puerto Tejada"],
  "Norte de Santander": ["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],
  "Boyacá":          ["Tunja","Duitama","Sogamoso","Chiquinquirá"],
  "Cesar":           ["Valledupar","Aguachica","Codazzi"],
  "Sucre":           ["Sincelejo","Sampués","Corozal"],
  "Chocó":           ["Quibdó"],
  "Arauca":          ["Arauca","Saravena"],
  "Casanare":        ["Yopal","Aguazul","Tauramena"],
  "La Guajira":      ["Riohacha","Maicao","Uribia"],
  "Putumayo":        ["Mocoa","Puerto Asís"],
  "Caquetá":         ["Florencia"],
  "Amazonas":        ["Leticia"],
  "Vichada":         ["Puerto Carreño"],
  "Guainía":         ["Inírida"],
  "Guaviare":        ["San José del Guaviare"],
  "Vaupés":          ["Mitú"],
};
