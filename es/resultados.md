---
layout: page
title: Resultados
permalink: /es/resultados/
---

<p><span data-current-date="A {date}, el" data-date-locale="es-ES">El</span> proyecto ha publicado <strong>{{ site.data.results | size }} artículos en revistas científicas</strong>. Consulta también las <a href="{{ '/es/difusion/' | relative_url }}">contribuciones a congresos</a>.</p>

{% assign years = site.data.results | sort: 'published' | reverse | group_by: 'year' %}
{% for year in years %}
<details class="year-group"{% if forloop.first %} open{% endif %}>
  <summary><h2>{{ year.name }}</h2></summary>
<div class="grid">
  {% for item in year.items %}
  <article class="card">
    <h3>{{ item.title | escape }}</h3>
    <p>{{ item.authors | escape }} ({{ item.year }}). <cite>{{ item.journal | escape }}</cite>{{ item.details | escape }}.</p>
    <p><a href="https://doi.org/{{ item.doi | escape }}">DOI {{ item.doi | escape }}</a></p>
    {% if item.dehesa or item.zenodo %}
    <ul class="article-repositories">
      {% if item.dehesa %}<li><a href="https://hdl.handle.net/{{ item.dehesa | escape }}">DEHESA · {{ item.dehesa | escape }}</a></li>{% endif %}
      {% if item.zenodo %}<li><a href="{{ item.zenodo | escape }}">Depósito en Zenodo</a></li>{% endif %}
    </ul>
    {% endif %}
  </article>
  {% endfor %}
</div>
</details>

{% endfor %}

<script src="{{ '/assets/js/current-date.js' | relative_url }}" defer></script>
