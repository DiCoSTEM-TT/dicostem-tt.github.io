---
layout: page
title: Recursos
lang: es
permalink: /es/recursos/
---

<ul class="resource-list">
{% assign items = site.resources | where: "lang","es" | sort: "title" %}
{% for r in items %}
  <li>
    <a href="{{ r.url | relative_url }}">{{ r.title }}</a>
    {% if r.type %}<small> · {{ r.type }}</small>{% endif %}
    {% if r.tags %}<small> · {{ r.tags | join: ", " }}</small>{% endif %}
    {% if r.summary %}<p>{{ r.summary }}</p>{% endif %}
    {% if r.repo_url %}<p><a class="btn" href="{{ r.repo_url }}" target="_blank" rel="noopener">Abrir en repositorio</a></p>{% endif %}
  </li>
{% endfor %}
</ul>