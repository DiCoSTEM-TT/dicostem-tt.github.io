---
layout: page
title: Equipo
permalink: /es/equipo/
---
{% assign team = site.data.team %}
{% assign lead = team | where: 'lead', true | first %}
{% assign others = team | where_exp: 'm','m.lead != true' | sort: 'sort_key' %}

<div class="team">
  {%- if lead -%}
  <section class="team-lead">
    <article class="card team-card">
      <img src="{{ lead.photo | relative_url }}" alt="{{ lead.name }}" class="team-photo" />
      <h3>{{ lead.name }}</h3>
      <p class="team-role">{{ lead.role }}</p>
      <p class="team-affiliation">{{ lead.affiliation }}</p>
      {%- if lead.bio %}<p>{{ lead.bio }}</p>{% endif %}
      <p class="team-meta">
        {%- if lead.orcid -%}<span><strong>ORCID:</strong> <a href="https://orcid.org/{{ lead.orcid }}">{{ lead.orcid }}</a></span>{%- endif -%}
        {%- if lead.scopus -%}<span><strong>Scopus:</strong> <a href="https://www.scopus.com/authid/detail.uri?authorId={{ lead.scopus }}">{{ lead.scopus }}</a></span>{%- endif -%}
        {%- if lead.email -%}
        {%- assign lead_email_parts = lead.email | split: "@" -%}
        <span><strong>Correo:</strong>
          <button class="reveal-email" type="button" data-user="{{ lead_email_parts[0] }}" data-domain="{{ lead_email_parts[1] }}" data-label-show="Mostrar correo" data-label-hide="Ocultar correo" aria-label="Mostrar correo de {{ lead.name }}">Mostrar correo</button>
        </span>
        {%- endif -%}
      </p>
    </article>
  </section>
  {%- endif -%}

  <section class="team-grid">
    {%- for m in others -%}
    <article class="card team-card">
      <img src="{{ m.photo | relative_url }}" alt="{{ m.name }}" class="team-photo" />
      <h3>{{ m.name }}</h3>
      <p class="team-role">{{ m.role }}</p>
      <p class="team-affiliation">{{ m.affiliation }}</p>
      {%- if m.bio %}<p>{{ m.bio }}</p>{% endif %}
      <p class="team-meta">
        {%- if m.orcid -%}<span><strong>ORCID:</strong> <a href="https://orcid.org/{{ m.orcid }}">{{ m.orcid }}</a></span>{%- endif -%}
        {%- if m.scopus -%}<span><strong>Scopus:</strong> <a href="https://www.scopus.com/authid/detail.uri?authorId={{ m.scopus }}">{{ m.scopus }}</a></span>{%- endif -%}
        {%- if m.email -%}
        {%- assign member_email_parts = m.email | split: "@" -%}
        <span><strong>Correo:</strong>
          <button class="reveal-email" type="button" data-user="{{ member_email_parts[0] }}" data-domain="{{ member_email_parts[1] }}" data-label-show="Mostrar correo" data-label-hide="Ocultar correo" aria-label="Mostrar correo de {{ m.name }}">Mostrar correo</button>
        </span>
        {%- endif -%}
      </p>
    </article>
    {%- endfor -%}
  </section>

</div>
