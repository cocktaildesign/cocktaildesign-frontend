import { permanentRedirect } from "next/navigation";

export default function DiscountsProductPage() {
  permanentRedirect("/catalog/collection/sale");
}
