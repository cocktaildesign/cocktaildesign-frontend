import BusinessGuide, { type BusinessGuideContent } from "@/components/seo/BusinessGuide";
import { pageMetadata } from "@/lib/seo/metadata";

const path = "/prof-oborudovanie-dlya-restoranov-i-kafe";
const content: BusinessGuideContent = {
  title: "Барный инвентарь для ресторанов и кафе",
  lead: "Подберите инструменты для коктейльной карты и ежедневной работы за стойкой. Начните с способов приготовления напитков, количества рабочих мест и оборудования, которое уже есть в вашем баре.",
  sections: [
    { heading: "Приготовление коктейлей", text: "Для взбивания понадобятся шейкер и подходящий стрейнер, для перемешивания — смесительный стакан и барная ложка. Джиггер помогает соблюдать пропорции. Проверьте объём, размеры и комплектацию каждого инструмента, прежде чем собирать набор.", links: [
      {href:"/catalog/ms-ef4c3af9",label:"Шейкеры"}, {href:"/catalog/ms-57a775a4",label:"Джиггеры"},
      {href:"/catalog/ms-28953401",label:"Стрейнеры"}, {href:"/catalog/ms-3bd4c321",label:"Барные ложки"},
      {href:"/catalog/ms-4c6a0d07",label:"Смесительные стаканы"},
    ]},
    { heading: "Комплектация и подача", text: "При оснащении нескольких рабочих мест составьте список инструментов на каждое из них. Готовые наборы удобно сравнивать по составу, а посуду для подачи — по объёму и форме. В подборке нашего производства можно посмотреть товары Cocktail Design.", links: [
      {href:"/catalog/ms-3137fc03",label:"Наборы"}, {href:"/catalog/collection/nashe-proizvodstvo",label:"Наше производство"},
      {href:"/posuda-dlya-barov-i-restoranov",label:"Посуда для баров и ресторанов"},
    ]},
  ],
};
export const metadata = pageMetadata({ title: content.title, description: "Инструменты для барной стойки ресторана и кафе: шейкеры, джиггеры, стрейнеры и наборы. Подбор инвентаря, скидки за объём и коммерческое предложение из корзины.", canonical: path });
export default function Page() { return <BusinessGuide content={content} path={path} />; }
