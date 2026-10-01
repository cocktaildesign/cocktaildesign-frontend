import BusinessGuide, { type BusinessGuideContent } from "@/components/seo/BusinessGuide";
import { pageMetadata } from "@/lib/seo/metadata";

const path = "/magazin/molekulyarnaya-kukhnya";
const content: BusinessGuideContent = {
  title: "Молекулярная кухня и технологии для коктейлей",
  lead: "Инструменты и ингредиенты для работы с текстурой, ароматом и подачей напитков. В обновлённом каталоге они разделены по задачам — выберите нужное направление.",
  sections: [
    { heading: "Текстуры и декор", text: "Начните с рецептуры и требований к ингредиентам. Для работы с текстурой важны дозировка и условия приготовления, для гарнишей — размер формы и способ подачи. Назначение и состав проверяйте в карточке выбранной позиции.", links: [
      { href: "/catalog/ms-5cfd4765", label: "Кислоты и текстуры" },
      { href: "/catalog/ms-4477ec06", label: "Кондитерские формы" },
      { href: "/knowledge/articles/neobychnye-garnishi-rabota-s-silikonovymi-formami", label: "Работа с силиконовыми формами" },
    ] },
    { heading: "Газация и фильтрация", text: "Сопоставляйте оборудование с объёмом заготовок и вашей технологией. Для газации проверьте совместимость всех частей и инструкцию производителя. Для фильтрации подберите размер мешка и сетку под исходную жидкость.", links: [
      { href: "/catalog/ms-d186a8c9", label: "Инструменты для газации" },
      { href: "/catalog/ms-4e72699e", label: "Супербэги для фильтрации" },
      { href: "/catalog/ms-2a16d136", label: "Весы и измерительные приборы" },
    ] },
    { heading: "Аромат и впечатление от подачи", text: "В этой группе можно подобрать инструменты для необычной подачи и работы с ароматом. Конструкция, расходные материалы и комплектация различаются — уточняйте их для конкретной модели.", links: [
      { href: "/catalog/ms-66311a6c", label: "Технологии для коктейлей" },
      { href: "/catalog/ms-e25ec4e2", label: "Пенообразователи, парфюмы, красители" },
      { href: "/catalog/ms-6b1e261c", label: "Бутылочки и атомайзеры" },
    ] },
  ],
};
export const metadata = pageMetadata({ title: content.title, description: "Инвентарь для молекулярной кухни и коктейлей: текстуры, формы для гарнишей, газация, фильтрация и ароматика. Подбор по задачам бармена.", canonical: path });
export default function Page() { return <BusinessGuide content={content} path={path} />; }
