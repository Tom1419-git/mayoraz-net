/**
 * mm-tracker.js : micro-tracker de conversion (site mayoraz-net.ch).
 * - window.mmTrack(event, detail) : log console + Clarity (si chargé).
 * - Cloudflare Web Analytics mesure vues/sources sans cookie (beacon séparé dans Layout).
 * - Les clics CTA (tel, WhatsApp, maquette) et les pages /merci/ appellent mmTrack.
 * Aucun cookie, aucune donnée personnelle : compatible avec le toast de consentement.
 */
(function () {
  'use strict';
  window.mmTrack = function (event, detail) {
    detail = detail || {};
    try {
      if (window.clarity && typeof window.clarity === 'function') {
        window.clarity('event', event);
      }
      // CF Web Analytics ne gère pas les events custom côté beacon gratuit :
      // le log console sert de trace locale et Clarity de mesure comportementale.
      if (window.console && location.hostname !== 'localhost') {
        console.debug('[mm]', event, detail);
      }
    } catch (e) { /* jamais casser la page pour du tracking */ }
  };

  function onReady(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  onReady(function () {
    // 1) Conversions : pages merci (contact + offre PME)
    var isMerci = document.querySelector('.success-container');
    if (isMerci && /\/(contact|offre-pme)\/merci\//.test(location.pathname)) {
      var which = location.pathname.indexOf('/offre-pme/') === 0
        ? 'offre_pme_form_success' : 'contact_form_success';
      window.mmTrack('conversion_' + which, { path: location.pathname });
    }

    // 2) Clics CTA principaux : téléphone, mail direct, WhatsApp, VCard
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest
        ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href.indexOf('tel:') === 0) {
        window.mmTrack('cta_click_tel', { href: href });
      } else if (href.indexOf('mailto:') === 0) {
        window.mmTrack('cta_click_mail', { href: href });
      } else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) {
        window.mmTrack('cta_click_whatsapp', { href: href });
      } else if (href.indexOf('.vcf') !== -1) {
        window.mmTrack('cta_click_vcard', { href: href });
      } else if (/\/(offre-pme|contact)\/?$/.test(href) && a.closest('main, header')) {
        window.mmTrack('cta_click_offer_page', { href: href });
      }
    }, { passive: true });
  });
})();
