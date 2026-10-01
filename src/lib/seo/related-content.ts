export type EditorialLink = { href: string; label: string };

// Explicit editorial relationships, not automatic keyword matching.
export const categoryReading: Record<string, EditorialLink[]> = {
  "ms-3bd4c321": [{ href: "/mernye-lozhki", label: "Мерные ложки для заготовок" }],
  "ms-66311a6c": [{ href: "/magazin/molekulyarnaya-kukhnya", label: "Технологии для коктейлей: подобрать по задаче" }],
  "ms-28953401": [{ href: "/knowledge/articles/evolyucziya-strejnerov-1881-vs-2016-g", label: "Эволюция стрейнеров: история и конструкция" }],
  "ms-4477ec06": [{ href: "/knowledge/articles/neobychnye-garnishi-rabota-s-silikonovymi-formami", label: "Необычные гарниши: работа с силиконовыми формами" }],
  "ms-4e72699e": [{ href: "/knowledge/articles/kak-gotovit-kokteyli-s-maslom", label: "Как готовить коктейли с маслом" }],
  "ms-3137fc03": [{ href: "/knowledge/articles/kak-bystro-zapominat-retseptury-kokteyley", label: "Как быстро запоминать рецептуры коктейлей" }],
};

export const knowledgeCatalog: Record<string, EditorialLink[]> = {
  "evolyucziya-strejnerov-1881-vs-2016-g": [{ href: "/catalog/ms-28953401", label: "Стрейнеры для коктейлей" }, { href: "/catalog/ms-4c6a0d07", label: "Смесительные стаканы" }],
  "neobychnye-garnishi-rabota-s-silikonovymi-formami": [{ href: "/catalog/ms-4477ec06", label: "Кондитерские формы" }],
  "chips-soty-i-kak-rabotat-s-garnishami-cherez-moldy": [{ href: "/catalog/ms-4477ec06", label: "Кондитерские формы" }],
  "kak-gotovit-kokteyli-s-maslom": [{ href: "/catalog/ms-4e72699e", label: "Супербэги для фильтрации заготовок" }],
  "alternativa-trubochkam-dlya-kokteyley": [{ href: "/catalog/ms-f06d0579", label: "Трубочки для подачи напитков" }],
  "barnyy-biznes-i-varianty-razvitiya-bartendera": [{ href: "/prof-oborudovanie-dlya-restoranov-i-kafe", label: "Инвентарь для баров и ресторанов" }],
  "kak-bystro-zapominat-retseptury-kokteyley": [{ href: "/catalog/ms-57a775a4", label: "Джиггеры и мерники" }, { href: "/catalog/ms-3137fc03", label: "Наборы для бара" }],
};
