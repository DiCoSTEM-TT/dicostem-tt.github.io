---
layout: page
title: Resultados
permalink: /pt/resultados/
---

<p><span data-current-date="Até {date}, o" data-date-locale="pt-PT">O</span> projeto publicou <strong>{{ site.data.results | size }} artigos em revistas científicas</strong>. Consulte também as <a href="{{ '/pt/divulgacao/' | relative_url }}">comunicações em congressos</a>.</p>

{% assign years = site.data.results | sort: 'published' | reverse | group_by: 'year' %}
{% for year in years %}
<details class="year-group"{% if forloop.first %} open{% endif %}>
  <summary><h2>{{ year.name }}</h2></summary>
<div class="grid">
  {% for item in year.items %}
  <article class="card">
    <h3>{{ item.title | escape }}</h3>
    <p>{{ item.authors | escape }} ({{ item.year }}). <cite>{{ item.journal | escape }}</cite>{{ item.details | escape }}.</p>
    {% include publication-links.html item=item %}
  </article>
  {% endfor %}
</div>
</details>

{% endfor %}

{% include doctoral-theses.html %}

<script src="{{ '/assets/js/current-date.js' | relative_url }}" defer></script>
