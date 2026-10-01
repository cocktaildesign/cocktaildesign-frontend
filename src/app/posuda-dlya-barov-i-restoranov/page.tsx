import BusinessGuide, { type BusinessGuideContent } from "@/components/seo/BusinessGuide";
import { pageMetadata } from "@/lib/seo/metadata";

const path = "/posuda-dlya-barov-i-restoranov";
const content: BusinessGuideContent = {
  title: "Посуда для баров и ресторанов",
  lead: "Посуда для приготовления и подачи коктейлей: выбирайте форму и объём под меню вашего заведения. При расчёте количества учитывайте загрузку бара, мойку и запас на замену.",
  sections: [
    { heading: "Бокалы для подачи", text: "Объём бокала должен подходить к порции напитка с учётом льда и украшения. Сравните высоту, диаметр и форму: они влияют на подачу, хранение и удобство работы. Материал и рекомендации по уходу смотрите в описании выбранной модели.", links: [
      {href:"/catalog/ms-ba57d348",label:"Бокалы"}, {href:"/catalog/collection/nashe-proizvodstvo",label:"Товары нашего производства"},
    ]},
    { heading: "Посуда для смешивания", text: "Смесительный стакан нужен для коктейлей, которые перемешивают со льдом. Оставляйте в нём достаточно места для работы ложкой и подбирайте стрейнер по диаметру ёмкости. Для взбивания напитков используйте шейкер.", links: [
      {href:"/catalog/ms-4c6a0d07",label:"Смесительные стаканы"}, {href:"/catalog/ms-ef4c3af9",label:"Шейкеры"},
      {href:"/prof-oborudovanie-dlya-restoranov-i-kafe",label:"Инвентарь для барной стойки"},
    ]},
  ],
};
export const metadata = pageMetadata({ title: content.title, description: "Бокалы и смесительные стаканы для баров и ресторанов. Как подобрать посуду под коктейльную карту, рассчитать количество и подготовить коммерческое предложение.", canonical: path });
export default function Page() { return <BusinessGuide content={content} path={path} />; }
