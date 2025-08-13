---
layout: page
title: Resources
lang: en
permalink: /en/resources/
---

<ul class="resource-list">
{% assign items = site.resources | where: "lang","en" | sort: "title" %}
{% for r in items %}
  <li>
    <a href="{{ r.url | relative_url }}">{{ r.title }}</a>
    {% if r.type %}<small> · {{ r.type }}</small>{% endif %}
    {% if r.tags %}<small> · {{ r.tags | join: ", " }}</small>{% endif %}
    {% if r.summary %}<p>{{ r.summary }}</p>{% endif %}
    {% if r.repo_url %}<p><a class="btn" href="{{ r.repo_url }}" target="_blank" rel="noopener">Open in repository</a></p>{% endif %}
  </li>
{% endfor %}
</ul>