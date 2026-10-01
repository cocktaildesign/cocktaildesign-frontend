export type KnowledgeTool = { href: string; title: string; description: string };
const forms = { href: "/catalog/ms-4477ec06", title: "Силиконовые формы", description: "Для рельефных гарнишей и повторяемой формы каждой заготовки." };
const mat = { href: "/catalog/product/ms-e0bc9fd6", title: "Силиконовый коврик", description: "Для нанесения смеси ровным слоем при подготовке плоских гарнишей." };
const spatulas = { href: "/catalog/ms-e12739df", title: "Лопатки и шпатели", description: "Помогают распределять тесто и гели по коврику или молду и снимать излишки." };
const fine = { href: "/catalog/ms-32909797", title: "Файн-стрейнеры", description: "Для процеживания сока и заготовок от кусочков мякоти, цедры и специй." };
const measures = { href: "/catalog/ms-2a16d136", title: "Весы и измерительные приборы", description: "Для отмеривания ингредиентов и повторения пропорций рецепта." };
const pipette = { href: "/catalog/product/ms-9184e410", title: "Бутылочка с пипеткой", description: "Для добавления небольшого количества жидкости по каплям." };

// Reviewed against the actual material and public catalogue, 02.10.2026.
// No automatic keyword matching or stock/price claims. Absent slug = no sales block.
export const knowledgeTools: Record<string, KnowledgeTool[]> = {
  "osnovnoe-napravlenie-v-dekorirovanii": [forms, mat, spatulas],
  "tresh-tiki-i-unikalnye-garnishi-na-agare": [mat, spatulas, measures],
  "kulinariya-v-kokteylyakh-sekrety-shef-povarov": [mat, measures],
  "beze-dlya-dekora-kokteyley-legkost-i-tekstura": [mat, spatulas],
  "agar-agar-innovatsii-v-kokteylnykh-ukrasheniyakh": [measures, fine, { href: "/catalog/ms-05a71b57", title: "Кондитерские инструменты", description: "Для вырезания и оформления гарнишей из застывшего желе." }],
  "letsitinovaya-vozdushnaya-pena-retsepty-i-tekhnologiya": [
    { href: "/catalog/product/ms-cb2f2b59", title: "Набор для лецитиновой воздушной пены", description: "Система для работы с воздушной пеной — техникой, которой посвящены инструкция и рецепты выше." },
    { ...measures, description: "Для точной дозировки лецитина: при выборе весов проверьте шаг измерения, подходящий для долей грамма." },
    { ...fine, description: "Для процеживания подготовленной смеси от крупных частиц перед аэрированием." },
  ],
  "stabilnyy-trend-v-iskusstve-dekorirovaniya": [forms, spatulas],
  "kak-sdelat-chips-iz-piva-ili-vina": [mat, spatulas, measures],
  "rol-kulinarnogo-dekora-v-kokteylnoy-kulture": [mat, measures],
  "vizualno-sovershennye-garnishi": [mat, spatulas, fine],
  "magiya-agar-agara-v-kokteylyakh-sozdaem-neobychnye-garnishi": [measures, fine],
  "neobychnye-garnishi-rabota-s-silikonovymi-formami": [forms, spatulas, measures],
  "chips-soty-i-kak-rabotat-s-garnishami-cherez-moldy": [forms, spatulas],
  "zabytaya-kokteylnaya-tekhnika-oleo-saccharum": [
    { href: "/catalog/ms-843f6a9b", title: "Пиллеры и ножи", description: "Для снятия цитрусовой цедры перед смешиванием с сахаром." }, fine,
  ],
  "istoriya-poyavleniya-kordialov-i-osobennosti-proizvodstva": [fine, { href: "/catalog/ms-ef4c3af9", title: "Шейкеры", description: "Для приготовления Spring Sour на кордиале из рецепта в статье." }],
  "kak-gotovit-kokteyli-s-maslom": [
    { ...pipette, description: "Для ароматических капель масла на поверхности Basil Martini из первой техники." },
    { href: "/catalog/ms-4c6a0d07", title: "Смесительные стаканы", description: "Для коктейлей, которые готовят методом стир, как Basil Martini в статье." },
    { ...forms, description: "Для порционных заготовок пряного масла в технике Hot Buttered Rum." },
  ],
  "kak-i-zachem-ispolzovat-sol-v-kokteylyakh": [measures, { ...pipette, description: "Для добавления солевого раствора по каплям и контроля его количества в напитке." }],
  "evolyucziya-strejnerov-1881-vs-2016-g": [{ href: "/catalog/ms-28953401", title: "Стрейнеры", description: "Сравните современные хоторн-, джулеп- и файн-стрейнеры после знакомства с историей инструмента." }],
  "alternativa-trubochkam-dlya-kokteyley": [{ href: "/catalog/ms-f06d0579", title: "Трубочки для подачи", description: "Выбирайте материал, длину и диаметр под посуду и подачу напитка." }],
  "kak-bystro-zapominat-retseptury-kokteyley": [
    { href: "/catalog/ms-57a775a4", title: "Джиггеры и мерники", description: "Для практической отработки пропорций коктейлей из изучаемых рецептов." },
    { href: "/catalog/ms-3137fc03", title: "Наборы для бара", description: "Если собираете рабочее место для практики с нуля, можно подобрать комплект основных инструментов." },
  ],
};
