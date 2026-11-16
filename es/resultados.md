---
layout: page
title: Resultados
permalink: /es/resultados/
---

<p>A 16 de noviembre de 2026, el proyecto ha publicado <strong>{{ site.data.results | size }} artículos en revistas científicas</strong>. Consulta también las <a href="{{ '/es/difusion/' | relative_url }}">contribuciones a congresos</a>.</p>

{% assign years = site.data.results | group_by: 'year' %}
{% for year in years %}
<details class="year-group"{% if forloop.first %} open{% endif %}>
  <summary>{{ year.name }}</summary>
<div class="grid">
  {% for item in year.items %}
  <article class="card">
    <h3>{{ item.title | escape }}</h3>
    <p>{{ item.authors | escape }} ({{ item.year }}). <cite>{{ item.journal | escape }}</cite>{{ item.details | escape }}.</p>
    <p><a href="https://doi.org/{{ item.doi | escape }}">DOI {{ item.doi | escape }}</a></p>
  </article>
  {% endfor %}
</div>
</details>

{% endfor %}
