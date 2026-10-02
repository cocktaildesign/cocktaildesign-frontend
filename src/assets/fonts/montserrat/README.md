# Montserrat ruble subset

`Montserrat-Ruble.woff2` contains only U+20BD (₽), including the original variable
weight axis 100–900. The currency font is selected only for that code point in
`src/styles/variables.css`; all other characters keep the normal Next.js Montserrat
font and fallback stack. Without this subset, ₽ downloads the entire Latin
Extended subset (68,224 bytes instead of 1,172 bytes).

Source: the Montserrat variable WOFF2 previously served by this application at
`/_next/static/media/a88409fdd7dc121c-s.62b55a98.woff2`.
Source SHA-256: `920711de9ae96c18970fa4faca73cd302b93ac5ed57ebeb6bfec2ddeff930082`.
Subset SHA-256: `ad20ce00f456f423a52076093f4b33fe0fac6a329bda8c855d533693f376a137`.

Generated with FontTools 4.66.1, selecting U+20BD and retaining name/license
metadata. Original and subset outlines, advance width, units per em and vertical
metrics were compared at weights 100, 200, …, 900 and are identical.

Licensed under SIL Open Font License 1.1; see `OFL.txt`, obtained from
https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/OFL.txt.
When updating Montserrat, regenerate and recheck this subset from the same font
version as the main text face.
