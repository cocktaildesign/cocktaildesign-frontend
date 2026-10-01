import BusinessGuide, { type BusinessGuideContent } from "@/components/seo/BusinessGuide";
import { pageMetadata } from "@/lib/seo/metadata";

const path = "/mernye-lozhki";
const content: BusinessGuideContent = {
  title: "Мерные ложки для барных заготовок",
  lead: "Мерная ложка помогает отмерять объём ингредиента по рецептуре. Для смешивания коктейлей используют барную ложку, а для отмеривания жидких компонентов также подойдёт джиггер.",
  sections: [
    { heading: "Набор мерных ложек", text: "В наборе на связке удобно хранить несколько мерок вместе. Проверьте маркировку объёмов в карточке товара и сопоставьте её с рецептурой. Если рецепт задаёт массу в граммах, используйте весы: одинаковый объём разных ингредиентов может весить по-разному.", links: [
      { href: "/catalog/product/ms-11fa7fdc", label: "Ложки мерные на связке" },
      { href: "/catalog/ms-2a16d136", label: "Весы и измерительные приборы" },
    ] },
    { heading: "Другие инструменты для рецептур", text: "Джиггер выбирают по вместимости чаш и внутренней разметке. Барную ложку — по длине, форме и удобству перемешивания. Подбирайте инструмент под операцию, чтобы повторять рецепт с нужными пропорциями.", links: [
      { href: "/catalog/ms-57a775a4", label: "Джиггеры и мерники" },
      { href: "/catalog/ms-3bd4c321", label: "Барные ложки" },
    ] },
  ],
};
export const metadata = pageMetadata({ title: content.title, description: "Мерные ложки на связке для приготовления заготовок. Как выбрать мерку и когда использовать джиггер, барную ложку или весы.", canonical: path });
export default function Page() { return <BusinessGuide content={content} path={path} />; }
