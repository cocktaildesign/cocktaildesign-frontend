const paths = {
  shaker: "M9 2h6v3H9V2Zm-1 4h8l2 4-2 11H8L6 10l2-4Zm1 1-1 2h8l-1-2H9Z",
  serving: "M11 3h2v2a8 8 0 0 1 7 8v3H4v-3a8 8 0 0 1 7-8V3ZM2 18h20v3H2v-3Z",
  pastry: "M17.2 2.2c2.3-1 4.6.5 4.6 2.8 0 4.4-5.6 9.4-10.3 11.2l-6 6a2 2 0 0 1-2.8-2.8l6-6c1.6-4.4 4.3-9.7 8.5-11.2Zm1.9 1.7c-1.1-.5-3.2 2.1-6 7.5 4.4-3.6 6.5-6.5 6-7.5ZM11 12c2-4.5 3.9-7.3 5.8-8.6-2.7 1.2-5.2 4.7-6.8 9.5l1-1Zm1.8 1.3c4.1-2.2 7-5.4 7.2-7.7-1.4 2.2-3.8 4.7-7.2 7.7Z",
  coffee: "M5 4h11v2h3a3 3 0 0 1 3 3v4a4 4 0 0 1-4 4h-2l-1 4H6L4 7 2 4h3Zm12 4v7h1a2 2 0 0 0 2-2V9a1 1 0 0 0-1-1h-2Z",
  wine: "M10 2h4v6l3 5v8H7v-8l3-5V2Z",
  accessories: "M9 2h6v5l4 3v12H5V10l4-3V2Zm2 2v4h2V4h-2Z",
  ingredients: "M7 2h10v3H7V2ZM5 7h14v14H5V7Zm3 4v2h8v-2H8Z",
  storage: "M3 7h18v14H3V7Zm1-5h16l2 3H2l2-3Zm5 8v2h6v-2H9Z",
  glass: "M2 3h20l-9 10v6h5v2H6v-2h5v-6L2 3Z",
  bitters: "M11 1h2v4h2v3l3 4v10H6V12l3-4V5h2V1Z",
  ice: "m12 1 10 5v12l-10 5-10-5V6l10-5Zm0 2.3L4.5 7 12 10.7 19.5 7 12 3.3ZM4 9v7.8l7 3.5v-7.8L4 9Zm9 3.5v7.8l7-3.5V9l-7 3.5Z",
  equipment: "M5 2h12v3h3v8h-4l-1 3 3 6H4l3-6-2-14Zm12 5v4h1V7h-1ZM8 18l-1 2h8l-1-2H8Z",
  kits: "M8 2h8a2 2 0 0 1 2 2v2h3a1 1 0 0 1 1 1v5H2V7a1 1 0 0 1 1-1h3V4a2 2 0 0 1 2-2Zm0 2v2h8V4H8ZM2 14h8v2h4v-2h8v7H2v-7Z",
  gift: "M6 2a4 4 0 0 1 6 2 4 4 0 0 1 6-2c3 2 1 6-2 6h6v5h-9V8h-2v5H2V8h6C5 8 3 4 6 2Zm1 2c-1 1 0 2 3 2-1-2-2-3-3-2Zm10 0c-1-1-2 0-3 2 3 0 4-1 3-2ZM3 15h8v7H3v-7Zm10 0h8v7h-8v-7Z",
  technology: "M8 2h8v2h-1v5l6 10a2 2 0 0 1-2 3H5a2 2 0 0 1-2-3L9 9V4H8V2Zm3 2v6l-3 5h8l-3-5V4h-2Zm-2 13v2h2v-2H9Zm5 2v1h2v-1h-2Z",
  tools: "M4 2h16v4h-6v3l3 3-4 3 3 3-5 5-2-2 3-3-3-3 4-3-3-2V6H4V2Z",
  book: "M3 2h15a2 2 0 0 1 2 2v13H6a2 2 0 0 0 0 4h14v2H6a4 4 0 0 1-4-4V3a1 1 0 0 1 1-1Zm3 2v11h1V4H6Zm4 3v2h7V7h-7Zm0 4v2h5v-2h-5Z",
  jewellery: "M6 1a4 4 0 0 1 1 7.9V11l4 5-5 7-5-7 4-5V6h1a2 2 0 1 0-2-2H2a4 4 0 0 1 4-3Zm12 0a4 4 0 0 1 1 7.9V11l4 5-5 7-5-7 4-5V6h1a2 2 0 1 0-2-2h-2a4 4 0 0 1 4-3Z",
  new: "m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z",
  sale: "M2 3h10l10 10-9 9L2 11V3Zm5 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  production: "M2 22V8l7 4V8l7 4 1-10h4l1 20H2Zm3-6v3h3v-3H5Zm6 0v3h3v-3h-3Zm6 0v3h3v-3h-3Z",
  category: "M3 4h7l2 3h9v14H3V4Z",
};

function iconFor(name: string): keyof typeof paths {
  const text = name.toLowerCase();
  if (/инвентарь/.test(text)) return "shaker";
  if (/подачи/.test(text)) return "serving";
  if (/кондитер/.test(text)) return "pastry";
  if (/бариста/.test(text)) return "coffee";
  if (/вина/.test(text)) return "wine";
  if (/аксессуар/.test(text)) return "accessories";
  if (/ингредиент|добавк/.test(text)) return "ingredients";
  if (/хранени|организац/.test(text)) return "storage";
  if (/бокал/.test(text)) return "glass";
  if (/биттер/.test(text)) return "bitters";
  if (/льда/.test(text)) return "ice";
  if (/оборудован/.test(text)) return "equipment";
  if (/набор|готовые решения/.test(text)) return "kits";
  if (/сертификат|подарк/.test(text)) return "gift";
  if (/технолог/.test(text)) return "technology";
  if (/мелочи/.test(text)) return "tools";
  if (/литератур/.test(text)) return "book";
  if (/серьги|подвески/.test(text)) return "jewellery";
  if (/новин/.test(text)) return "new";
  if (/скидк|уценк/.test(text)) return "sale";
  if (/производств/.test(text)) return "production";
  return "category";
}

export default function CategoryIcon({ name }: { name: string }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d={paths[iconFor(name)]} /></svg>;
}
