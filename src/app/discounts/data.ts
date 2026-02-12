import type { Discounts } from "./types";

export const discounts: Discounts[] = [
  {
    id: "2",
    title: "Скидка 20% на первый заказ",
    image: "/images/discounts/new-customer-20-off.png",
    startDate: null,
    endDate: null,
    blocks: [
      {
        id: "2-1",
        type: "image",
        src: "/images/discounts/new-customer-20-off.png",
        alt: "Скидка 20% для новых покупателей Cocktail Design",
      },
      {
        id: "2-2",
        type: "heading",
        level: 2,
        content: "Что вы получаете",
      },
      {
        id: "2-3",
        type: "text",
        content: "Для всех, кто делает первый заказ от 10 000 ₽:",
      },
      {
        id: "2-4",
        type: "list",
        items: ["Скидка 20% на весь заказ", "Бесплатная доставка по всей России", "Подарок на выбор"],
      },
      {
        id: "2-5",
        type: "heading",
        level: 2,
        content: "Подарок на выбор",
      },
      {
        id: "2-6",
        type: "list",
        items: [
          "Латунное клише 50×50 мм с логотипом вашего заведения",
          "Гравировка на одном виде инвентаря (например, все шейкеры или все стрейнеры)",
          "Любое изделие Cocktail Design (барная ложка, стрейнер, файн или барблейд)",
          "Скидка 10% на следующий заказ",
        ],
      },
      {
        id: "2-7",
        type: "heading",
        level: 2,
        content: "Как воспользоваться",
      },
      {
        id: "2-8",
        type: "text",
        content: "Укажите промокод STARTCD20 при оформлении заказа — онлайн или по телефону.",
      },
      {
        id: "2-9",
        type: "heading",
        level: 3,
        content: "Обратите внимание",
      },
      {
        id: "2-10",
        type: "textSmall",
        content:
          "Скидка распространяется на все товары, кроме партнёрских позиций и товаров, на которые уже действует другая акция. Подробности уточняйте у менеджера.",
      },
    ],
  },

  {
    id: "delivery-discount",
    title: "Бесплатная доставка по России при заказе от 5 000 ₽.",
    image: "/images/discounts/delivery-discount.png",
    // endDate не указываем — акция постоянная
    blocks: [
      {
        id: "delivery-3",
        type: "heading",
        level: 3,
        content: "Скидка на доставку в отдалённые регионы и страны СНГ",
      },
      {
        id: "delivery-4",
        type: "text",
        content: "Для заказов в следующие регионы:",
      },
      {
        id: "delivery-5",
        type: "list",
        items: ["Отдалённые регионы РФ", "Казахстан", "Республика Беларусь", "Армения"],
      },
      {
        id: "delivery-6",
        type: "text",
        content: "Действует скидка: за каждые 5 000 ₽ в чеке вы получаете 350 ₽ скидки на доставку.",
      },
      {
        id: "delivery-7",
        type: "heading",
        level: 3,
        content: "Как это работает",
      },
      {
        id: "delivery-8",
        type: "text",
        content:
          "После оформления заказа с вами свяжется менеджер для уточнения деталей и рассчитает конечную стоимость с учётом скидки на доставку.",
      },
    ],
  },

  {
    id: "birthday-discount",
    title: "Скидка 10% ко дню рождения",
    image: "/images/discounts/birthday-discount.png",
    startDate: null,
    endDate: null,
    blocks: [
      // 1. Изображение внутри модалки
      {
        id: "birthday-1",
        type: "image",
        src: "/images/discounts/birthday-discount.png",
        alt: "Подарок на день рождения от Cocktail Design",
      },
      // 2. Основной текст акции
      {
        id: "birthday-2",
        type: "heading",
        level: 2,
        content: "Мы ценим наших покупателей",
      },
      {
        id: "birthday-3",
        type: "text",
        content: "Дарим скидку 10% на любую покупку в честь вашего дня рождения.",
      },
      // 3. Срок действия
      {
        id: "birthday-4",
        type: "heading",
        level: 2,
        content: "Срок действия",
      },
      {
        id: "birthday-5",
        type: "text",
        content: "Скидка доступна в течение трёх дней до и трёх дней после вашей даты рождения.",
      },
      // 4. Как воспользоваться
      {
        id: "birthday-6",
        type: "heading",
        level: 2,
        content: "Как воспользоваться",
      },
      {
        id: "birthday-7",
        type: "list",
        items: [
          "Добавьте товары в корзину на сайте.",
          "Введите кодовое слово DRCD при оформлении заказа.",
          "Подтвердите дату рождения — отправьте менеджеру фото или скан документа (паспорт, водительские права и т. п.).",
          "После проверки скидка будет активирована, и вы сможете завершить заказ по сниженной цене.",
        ],
        ordered: true, // Нумерованный список, так как это последовательность шагов
      },
      // 5. Примечание
      {
        id: "birthday-8",
        type: "heading",
        level: 3,
        content: "Обратите внимание",
      },
      {
        id: "birthday-9",
        type: "textSmall",
        content:
          "Скидка распространяется на все товары, кроме партнёрских позиций и тех, на которые уже действует акция (уточняйте у менеджера).",
      },
    ],
  },

  {
    id: "volume-discount",
    title: "Скидка от объёма заказа",
    image: "/images/discounts/volume-discount.png",
    startDate: null,
    endDate: null,
    blocks: [
      {
        id: "volume-1",
        type: "image",
        src: "/images/discounts/volume-discount.png",
        alt: "Система скидок от объёма заказа Cocktail Design",
      },
      {
        id: "volume-2",
        type: "text",
        content:
          "Мы заинтересованы в долгосрочной работе и предусмотрели систему скидок в зависимости от объёма заказов. Скидка вступает в силу, когда стоимость товаров в корзине превышает 10 000 ₽.",
      },
      {
        id: "volume-3",
        type: "heading",
        level: 2,
        content: "Размер скидки",
      },
      {
        id: "volume-4",
        type: "list",
        items: [
          "5% — от 10 000 ₽",
          "7% — от 20 000 ₽",
          "10% — от 30 000 ₽",
          "12% — от 50 000 ₽",
          "14% — от 100 000 ₽",
          "16% — от 130 000 ₽",
          "18% — от 160 000 ₽",
          "20% — от 200 000 ₽",
        ],
      },
      {
        id: "volume-5",
        type: "heading",
        level: 3,
        content: "Обратите внимание",
      },
      {
        id: "volume-6",
        type: "textSmall",
        content:
          "На часть позиций дополнительные скидки не распространяются. Полный перечень можете уточнить у менеджера. Скидки не суммируются с другими акциями.",
      },
    ],
  },
];
