# Branding page: content and image sources

Checked on 2026-10-31 for `/branding`. The owner requested a local preview only.

## Conditions

Engraving and custom manufacturing: https://cocktail-design.ru/brending

- Engraving: 1–4 units at 400 RUB/unit, 5–19 at 280 RUB/unit, 20+ at 190 RUB/unit. Product cost is separate.
- The source describes black or white engraving on metal. No promise of colour engraving, photo engraving or a numerical lead time was added.
- Custom strainers, juleps, fine strainers and bar spoons share the same indicative matrix: 10+ at 5,900; 30+ at 3,500; 50+ at 3,200; 100+ at 2,800 RUB/unit.
- Final custom pricing depends on complexity and configuration. Projects with full publication, brand-mention and portfolio/social restrictions require an individual quote.
- Other quantities/products and lead times require agreement; the table is not a universal minimum for every possible project.

Stamps: https://cd-stamp.ru/faq and https://cd-stamp.ru/offer

- 2,500 RUB is the starting price for a **3 × 3 cm stamp with a handle**, not every stamp construction.
- From one unit. Technical preparation from an existing logo is free; original logo development or substantial reworking is not promised free.
- Usually 5–7 **working** days after payment and artwork approval. Confirm the order's date separately.
- Urgent work: approximately 1–2 working days, +2,500 RUB, subject to confirmation before payment.
- Delivery is separate. Size, depth, construction and equipment affect the final quote.

## Image provenance

All images are actual source assets, resized/re-encoded to WebP with no new generated artwork. Browser thumbnails crop for layout; the viewer displays the full photo.

Engraving: owner-selected Google Drive folder `1esdeOrXF2FJlzAdwcEFEtT2hfgsDJS6M`.

| Public file | Original Drive file ID |
| --- | --- |
| engraving-jigger.webp | 1ntqe9K_9XiaDzYijVA1Wj3YPMw01iWLt |
| engraving-shakers.webp | 1DOjSyTEXut2FuRtRJcvlqrAIdQXZuT-P |
| engraving-spoons.webp | 1rRzuJUfGwJzc-eHaj-JllpDLPeDo5-fa |
| engraving-detail.webp | 1DVs-EQ1w7xbmcpJqNcyp9fEui_NuKk5y |
| engraving-set.webp | 1hmTIg96HOxLMKbZCD0bmaFXn_mcs4x9F |
| engraving-spoon.webp | 1n6V4pEPR23XZarb7GGGxN3dG7qV2jopN |

Stamps: published CD Stamp case images.

| Public file | Source |
| --- | --- |
| stamp-catch22.webp | https://cd-stamp.ru/images/cases/catch22/stamp-studio-20260914.webp |
| imprint-catch22.webp | https://cd-stamp.ru/images/cases/catch22/imprint-retouched-20260914.webp |
| imprint-leather.webp | https://cd-stamp.ru/images/cases/dark-raccoon/imprint-studio-20260914.webp |
| imprint-bun.webp | https://cd-stamp.ru/images/cases/le-smash/imprint-retouched-20260915.webp |

Le Smash retains the published note «Фото клиента с ретушью». The stamp visualizations of Le Smash/Dark Raccoon and the wax concept were deliberately excluded.

Custom production: gallery `rec575938916`, directly following the custom-manufacturing section of https://cocktail-design.ru/brending. These are different from its engraving gallery `rec575840378`.

| Public file | Original published image |
| --- | --- |
| custom-shape.webp | https://static.tildacdn.com/tild3435-3638-4661-a265-636539326239/Desktop_-_2_-_2023-0.png |
| custom-bix.webp | https://static.tildacdn.com/tild3137-6337-4538-b137-373339326338/Desktop_-_3_85_1_1.png |
| custom-pattern.webp | https://static.tildacdn.com/tild3131-6664-4564-b664-666466393237/Desktop_-_15_19_1_1.png |
| custom-spoons.webp | https://static.tildacdn.com/tild6131-3038-4963-b330-326132626130/Desktop_-_11_10_1_1.png |

The old site served these custom photos at 600 × 600. No upscaling was performed. Originals, download manifests and source evidence are retained outside Git under `audit/branding-20261031/assets-source`.

## Editing / adding a direction

`src/app/branding/branding-data.ts` holds the service definitions, copy, prices and gallery entries. Add an entry with a unique stable `id`, appropriate imagery and verified terms. The menu and content panels use that list. Review mobile navigation when adding further directions.

Direct links: `/branding#engraving`, `/branding#stamps`, `/branding#custom`. The component supports browser Back/Forward, arrow keys, Home/End, native FAQ disclosures and a modal image viewer with Escape, arrows and restored keyboard focus.
