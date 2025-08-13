---
layout: page
title: Contacto
lang: es
permalink: /es/contacto/
---

<p>Para contactar con el proyecto, utiliza el siguiente enlace:</p>
<p><a id="mail" href="#" rel="nofollow">Mostrar email</a></p>
<script>
  // Ofuscación básica: lee site.email y la escribe al hacer clic (no aparece en plano).
  // Si no hay site.email en _config.yml, edítalo.
  (function(){
    var e = "{{ site.email | default: 'contacto@ejemplo.org' }}";
    var safe = e.replace("@"," [at] ");
    var a = document.getElementById('mail');
    a.textContent = safe;
    a.addEventListener('click', function(ev){
      ev.preventDefault();
      a.textContent = e;
      a.href = "mailto:"+e;
    });
  })();
</script>
