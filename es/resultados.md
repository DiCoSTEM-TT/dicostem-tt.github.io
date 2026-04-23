---
layout: page
title: Resultados
permalink: /es/resultados/
---
<p>Hasta la fecha, el proyecto ha generado <strong>2 publicaciones científicas</strong>, <strong>8 manuscritos en evaluación</strong> y <strong>22 comunicaciones científicas</strong>, además del desarrollo progresivo de recursos educativos digitales y materiales de transferencia.</p>

<div class="grid">
  {% assign items = site.data.results | where: 'lang', 'es' %}
  {% for it in items %}
  <div class="card">
    <h3>{{ it.title }}</h3>
    <p><strong>Año:</strong> {{ it.year }} · <strong>Tipo:</strong> {{ it['@type'] }}</p>
    {% if it.doi %}
      <p>DOI: <a href="https://doi.org/{{ it.doi | replace: 'https://doi.org/', '' }}">{{ it.doi }}</a> 
      <span class="altmetric-embed" data-badge-popover="right" data-doi="{{ it.doi }}"></span></p>
    {% endif %}
    {% if it.url %}<p><a href="{{ it.url }}">Acceder</a></p>{% endif %}
    {% if it.citationAPA %}<p><button onclick="navigator.clipboard.writeText('{{ it.citationAPA | escape }}');">Copiar cita APA</button></p>{% endif %}
  </div>
  {% endfor %}
</div>
