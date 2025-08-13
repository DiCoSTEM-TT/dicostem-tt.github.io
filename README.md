
# DiCoSTEM — Estructura bilingüe (ES/EN)

Este repositorio ha sido refactorizado para:
- Home en español por defecto (`/`), con selector de idioma visible.
- Menús separados por idioma en `_data/navigation_es.yml` y `_data/navigation_en.yml`.
- Colecciones **news** y **resources** con plantillas.
- Protección antispam en Contacto (email ofuscado).
- Diseño limpio con **modo oscuro** (toggle + `prefers-color-scheme`).

## Cómo añadir una **noticia**
1. Copia la plantilla correspondiente:
   - Español: `_news/_template.es.md`
   - Inglés: `_news/_template.en.md`
2. Pégala en `_news/` con un nombre como `2025-01-15-mi-noticia.md`.
3. Rellena `title`, `date`, `summary`, `lang` y el contenido.
4. La URL se genera con `permalink`:
   - ES: `/es/noticias/:slug/`
   - EN: `/en/news/:slug/`

Las listas se generan en:
- ES: `es/noticias/index.md`
- EN: `en/news/index.md`

## Cómo añadir un **recurso**
1. Copia la plantilla:
   - Español: `_resources/_template.es.md`
   - Inglés: `_resources/_template.en.md`
2. Guarda el archivo en `_resources/` como `mi-recurso.md`.
3. Rellena `title`, `summary`, `repo_url`, `type`, `tags`, `lang` y el contenido.

Las listas están en:
- ES: `es/recursos/index.md`
- EN: `en/resources/index.md`

## Cambiar el email de contacto
Edita `email` en `_config.yml`. El enlace se ofusca y solo muestra el real al hacer clic.

```yml
email: contacto@tu-dominio.org
```

## Añadir una nueva página en ambos idiomas
1. Crea `es/mi-pagina.md` y `en/my-page.md` con:
```md
---
layout: page
title: ...
lang: es # o en
permalink: /es/mi-pagina/
---
Contenido...
```
2. Añade la entrada de menú en `_data/navigation_es.yml` y/o `_data/navigation_en.yml`.

## Modo oscuro
- Toggle en el header (guarda preferencia en `localStorage`).
- Variables CSS para fondos y textos con buen contraste en ambos modos.

## Construcción local
Necesitas Ruby y Jekyll. Ejecuta:
```bash
bundle install
bundle exec jekyll serve
```

## Notas
- Si existían páginas previas, se respetan; revisa posibles duplicados y borra las que no necesites.
- Asegúrate de que `assets/img/logo_dicostem.svg` existe; si cambias el logo, conserva el nombre de archivo o actualiza `default.html`.
