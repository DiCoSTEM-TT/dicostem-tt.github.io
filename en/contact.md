---
layout: page
title: Contact
lang: en
permalink: /en/contact/
---

<p>To contact the project, use the following link:</p>
<p><a id="mail" href="#" rel="nofollow">Show email</a></p>
<script>
  (function(){
    var e = "{{ site.email | default: 'contact@example.org' }}";
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
