---
layout: page
title: Team
permalink: /en/team/
---
{% assign team = site.data.team %}
{% assign lead = team | where: 'lead', true | first %}
{% assign others = team | where_exp: 'm','m.lead != true' | sort: 'name' %}

<div class="team">

  {%- if lead -%}
  <!-- PI on its own row, centered -->
  <section class="team-lead">
    <div class="card">
      <img src="{{ lead.photo | relative_url }}" alt="{{ lead.name }}"
           style="border-radius:12px; width:100%; max-height:220px; object-fit:cover;" />
      <h3>{{ lead.name }} · {{ lead.role }}</h3>
      <p>{{ lead.affiliation }}</p>
      {%- if lead.bio %}<p>{{ lead.bio }}</p>{% endif %}
      {%- if lead.orcid %}<p>ORCID: <a href="https://orcid.org/{{ lead.orcid }}">{{ lead.orcid }}</a></p>{% endif %}
    </div>
  </section>
  {%- endif -%}

  <!-- Rest of the team in 3-column grid -->
  <section class="team-grid">
    {%- for m in others -%}
    <div class="card">
      <img src="{{ m.photo | relative_url }}" alt="{{ m.name }}"
           style="border-radius:12px; width:100%; max-height:220px; object-fit:cover;" />
      <h3>{{ m.name }} · {{ m.role }}</h3>
      <p>{{ m.affiliation }}</p>
      {%- if m.bio %}<p>{{ m.bio }}</p>{% endif %}
      {%- if m.orcid %}<p>ORCID: <a href="https://orcid.org/{{ m.orcid }}">{{ m.orcid }}</a></p>{% endif %}
    </div>
    {%- endfor -%}
  </section>

</div>
