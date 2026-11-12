# Product videos

## Product gallery additions, 12 November 2026

`src/lib/catalog/product-videos.json` contains the new media bindings for fourteen
SKUs. Seven bind to an ordinary product and seven to an exact product variant.
Both the parent UUID/SKU and variant UUID/SKU must match; Strapi's numeric variant
ID is resolved from the current API response rather than fixed in the registry.
The supplied clips retain their numeric order and appear after every existing
photo. Selecting a video leaves photo indices and purchase identity unchanged;
changing a variant remounts the gallery and removes its player.

These bindings are independent of the original pilot flag. Keep
`PRODUCT_VIDEO_PILOT_ENABLED=false`: its five products and `/video-pilot` remain
hidden. No CMS/CRM fields or environment changes are required. Ship only the
separate, hash-verified media bundle to `public/product-videos`; the original
Drive files remain outside Git. Roll back with the previous verified frontend
release while retaining the added files until rollback is confirmed.

## Original October pilot (hidden since 26 October)

Five products are bound by exact MoySklad UUID and SKU in
`src/lib/catalog/product-video-pilot.json`. The default is off. Set
`PRODUCT_VIDEO_PILOT_ENABLED=true` only in a reviewed pilot release to enable
these galleries and the noindex `/video-pilot` overview. Sale products, products
with variants and unmatched identifiers receive no videos.

The release must include the separately prepared, hash-checked media bundle in
`public/product-videos`. Original videos and generated binary assets are not in
Git. Each filename contains a content hash; never replace bytes at the same URL.
Serving must support `video/mp4`, byte ranges and the configured immutable cache.

The first photo and existing photo indices are preserved. A player is mounted
only after a video thumbnail click. It has no audio stream, is muted/inline,
pauses offscreen or when the document becomes hidden, and unmounts on photo
selection. Reduced motion disables looping. Variant changes remount the gallery.
Video selection does not change product/variant identity or the basket image.

For rollback, disable the flag and restart the frontend with its reviewed
environment, or restore the previous tested frontend release. CMS/CRM data is
not changed by this pilot. Keep its media until rollback is confirmed.

Prepared against frontend 24c722d / Node20.20.0. Before live deployment, perform
Linux build/preview and rollback checks and verify current backup. This pilot is
not part of the sealed 20 October launch package. If released before migration,
merge it into the launch candidate, retain all migration redirects and regenerate
the package. A permanent Strapi editorial upload workflow is a subsequent step.

Owner research, mapping, compression results and local checks live in the handover
workspace `docs/PRODUCT_VIDEO_PILOT_2026-10-22.md` and
`audit/product-video-20261022/`.
