---
layout: page
title: Outputs
permalink: /en/outputs/
---

<p>As of 16 November 2026, the project has published <strong>{{ site.data.results | size }} journal articles</strong>. See also the project’s <a href="{{ '/en/dissemination/' | relative_url }}">conference contributions</a>.</p>

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
