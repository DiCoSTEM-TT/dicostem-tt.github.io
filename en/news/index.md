---
layout: page
title: News
lang: en
permalink: /en/news/
---

<ul class="news-list">
{% assign items = site.news | where: "lang","en" | sort: "date" | reverse %}
{% for n in items %}
  <li>
    <a href="{{ n.url | relative_url }}">{{ n.title }}</a>
    <small> · {{ n.date | date: "%-d %b %Y" }}</small>
    <p>{{ n.summary }}</p>
  </li>
{% endfor %}
</ul>