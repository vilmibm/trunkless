# Trunkless

_being a web-based tool for making cut-up poetry using the entire<sup>1</sup> Project Gutenberg collection of English books._

Trunkless is a spiritual successor to [prosaic](https://github.com/vilmibm/prosaic).

This repository contains code for:

- processing the Gutenberg corpus
- creating and accessing a large `sqlite3` corpus of lines
- hosting a web front-end

The actual Gutenberg collection of books can be found at [The Internet Archive](https://archive.org/details/pg_eng_txt_2024).

## TODO

- [ ] ingest
  - [ ] strip header/footer
  - [ ] emit clean lines of appropriate length
  - [ ] associate lines with book metadata
  - [ ] db schema
- [ ] server
  - [ ] `/`
  - [ ] `/line`
- [ ] front-end
  - [ ] dark/light mode toggle
  - [ ] cookie for dark/light mode
  - [ ] editing interface
  - [ ] save feature (as plaintext, as image)
  - [ ] `htmx` or just raw ajax for accessing `/line`
  - [ ] font and icon styling

_<sup>1</sup> as of January, 2024_
