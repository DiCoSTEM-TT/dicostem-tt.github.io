
(function(){
  const hdr=document.querySelector('.site-header');
  if(!hdr) return;
  function onScroll(){ if(window.scrollY>10) hdr.classList.add('shrink'); else hdr.classList.remove('shrink'); }
  onScroll();
  document.addEventListener('scroll',onScroll,{passive:true});
})();
