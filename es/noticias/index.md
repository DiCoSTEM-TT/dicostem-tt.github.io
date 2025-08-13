---
layout: page
title: Noticias
lang: es
permalink: /es/noticias/
---

<ul class="news-list">
{% assign items = site.news | where: "lang","es" | sort: "date" | reverse %}
{% for n in items %}
  <li>
    <a href="{{ n.url | relative_url }}">{{ n.title }}</a>
    <small> · {{ n.date | date: "%-d %b %Y" }}</small>
    <p>{{ n.summary }}</p>
  </li>
{% endfor %}
</ul>