---
layout: page
title: Outputs
permalink: /en/outputs/
---
<p>To date, the project has produced <strong>2 scientific publications</strong>, <strong>8 manuscripts under review</strong> and <strong>22 scientific presentations</strong>, together with the progressive development of digital educational resources and transfer materials.</p>

<div class="grid">
  {% assign items = site.data.results | where: 'lang', 'en' %}
  {% for it in items %}
  <div class="card">
    <h3>{{ it.title }}</h3>
    <p><strong>Year:</strong> {{ it.year }} · <strong>Type:</strong> {{ it['@type'] }}</p>
    {% if it.doi %}
      <p>DOI: <a href="https://doi.org/{{ it.doi | replace: 'https://doi.org/', '' }}">{{ it.doi }}</a> 
      <span class="altmetric-embed" data-badge-popover="right" data-doi="{{ it.doi }}"></span></p>
    {% endif %}
    {% if it.url %}<p><a href="{{ it.url }}">Access</a></p>{% endif %}
    {% if it.citationAPA %}<p><button onclick="navigator.clipboard.writeText('{{ it.citationAPA | escape }}');">Copy APA citation</button></p>{% endif %}
  </div>
  {% endfor %}
</div>
