---
layout: page
title: Equipo
permalink: /es/equipo/
---
{% assign team = site.data.team %}
<div class="grid">
  {% assign sorted = team | sort: 'name' %}
  {% assign ip = team | where: 'lead', true %}
  {% for m in ip %}
  <div class="card">
    <img src="{{ m.photo | relative_url }}" alt="{{ m.name }}" style="border-radius:12px; width:100%; max-height:220px; object-fit:cover;" />
    <h3>{{ m.name }} · {{ m.role }}</h3>
    <p>{{ m.affiliation }}</p>
    <p>{{ m.bio }}</p>
    {% if m.orcid %}<p>ORCID: <a href="https://orcid.org/{{ m.orcid }}">{{ m.orcid }}</a></p>{% endif %}
  </div>
  {% endfor %}
  {% for m in sorted %}
  {% unless m.lead %}
  <div class="card">
    <img src="{{ m.photo | relative_url }}" alt="{{ m.name }}" style="border-radius:12px; width:100%; max-height:220px; object-fit:cover;" />
    <h3>{{ m.name }} · {{ m.role }}</h3>
    <p>{{ m.affiliation }}</p>
    <p>{{ m.bio }}</p>
  </div>
  {% endunless %}
  {% endfor %}
</div>
