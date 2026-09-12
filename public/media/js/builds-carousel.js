// Carousel idempotent pour Astro ClientRouter (View Transitions) :
        // le wiring global n'est fait qu'une fois, et chaque instance est
        // entièrement démontée (AbortController + clearInterval) avant re-init.
        (function () {
            if (window.__buildsPcWired) return;
            window.__buildsPcWired = true;

            var AUTOPLAY_MS = 3500;
            var SWIPE_THRESHOLD = 40;

            function teardown() {
                if (window.__buildsPcCtl) { try { window.__buildsPcCtl.abort(); } catch (e) {} window.__buildsPcCtl = null; }
                if (window.__buildsPcInterval) { clearInterval(window.__buildsPcInterval); window.__buildsPcInterval = null; }
            }
            document.addEventListener('astro:before-swap', teardown);

            function initCarousel() {
                teardown();
                var container = document.querySelector('.carousel-container');
                var modal = document.getElementById('imageModal');
                if (!container || !modal) return;

                var ctl = new AbortController();
                window.__buildsPcCtl = ctl;
                var opts = { signal: ctl.signal };

                var slides = Array.prototype.slice.call(container.querySelectorAll('.carousel-slide'));
                var dots = Array.prototype.slice.call(container.querySelectorAll('.dot'));
                var prevBtn = container.querySelector('.prev-btn');
                var nextBtn = container.querySelector('.next-btn');
                var current = Math.max(0, slides.findIndex(function (s) { return s.classList.contains('active'); }));

                function show(i) {
                    current = (i + slides.length) % slides.length;
                    slides.forEach(function (s, k) { s.classList.toggle('active', k === current); });
                    dots.forEach(function (d, k) { d.classList.toggle('active', k === current); });
                }
                function next() { show(current + 1); }
                function prev() { show(current - 1); }

                function startAuto() {
                    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                    if (document.hidden) return;
                    if (window.__buildsPcInterval) return;
                    window.__buildsPcInterval = setInterval(next, AUTOPLAY_MS);
                }
                function stopAuto() {
                    if (window.__buildsPcInterval) { clearInterval(window.__buildsPcInterval); window.__buildsPcInterval = null; }
                }
                function restartAuto() { stopAuto(); startAuto(); }

                // --- Contrôles ---
                nextBtn.addEventListener('click', function () { next(); restartAuto(); }, opts);
                prevBtn.addEventListener('click', function () { prev(); restartAuto(); }, opts);
                dots.forEach(function (dot, k) {
                    var go = function () { show(k); restartAuto(); };
                    dot.addEventListener('click', go, opts);
                    dot.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }, opts);
                });

                // Pause au survol (desktop) + pause quand l'onglet est caché
                container.addEventListener('mouseenter', stopAuto, opts);
                container.addEventListener('mouseleave', startAuto, opts);
                document.addEventListener('visibilitychange', function () { document.hidden ? stopAuto() : startAuto(); }, opts);

                // --- Swipe tactile (et souris) ---
                var startX = 0, startY = 0, tracking = false, justSwiped = false;
                container.addEventListener('pointerdown', function (e) {
                    if (e.pointerType === 'mouse' && e.button !== 0) return;
                    startX = e.clientX; startY = e.clientY; tracking = true;
                }, opts);
                container.addEventListener('pointerup', function (e) {
                    if (!tracking) return;
                    tracking = false;
                    var dx = e.clientX - startX, dy = e.clientY - startY;
                    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
                        if (dx < 0) next(); else prev();
                        restartAuto();
                        justSwiped = true;
                        setTimeout(function () { justSwiped = false; }, 350);
                    }
                }, opts);
                container.addEventListener('pointercancel', function () { tracking = false; }, opts);

                // --- Ouverture modal (délégation, plus de onclick inline) ---
                var modalImg = document.getElementById('modalImage');
                var closeBtn = document.getElementById('modalClose');
                var mPrevBtn = document.getElementById('modalPrev');
                var mNextBtn = document.getElementById('modalNext');
                var modalIndex = 0;

                container.addEventListener('click', function (e) {
                    if (justSwiped) { e.preventDefault(); e.stopPropagation(); return; }
                    var slide = e.target.closest && e.target.closest('.carousel-slide');
                    if (slide && slide.classList.contains('active')) {
                        showModal(slides.indexOf(slide));
                    }
                }, opts);

                function showModal(i) {
                    modalIndex = (i + slides.length) % slides.length;
                    var img = slides[modalIndex].querySelector('img');
                    if (img) {
                        modalImg.src = img.currentSrc || img.src;
                        modalImg.alt = img.alt;
                    }
                    modal.style.display = 'flex';
                    // petit délai pour que la transition d'opacité joue après le display
                    requestAnimationFrame(function () { modal.classList.add('show'); });
                }
                function changeModal(step) { showModal(modalIndex + step); }
                function closeModal() {
                    modal.classList.remove('show');
                    setTimeout(function () { if (!modal.classList.contains('show')) modal.style.display = ''; }, 300);
                }
                window.openModal = function () { showModal(current); }; // rétro-compat

                closeBtn.addEventListener('click', closeModal, opts);
                modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); }, opts);
                mPrevBtn.addEventListener('click', function (e) { e.stopPropagation(); changeModal(-1); }, opts);
                mNextBtn.addEventListener('click', function (e) { e.stopPropagation(); changeModal(1); }, opts);

                document.addEventListener('keydown', function (e) {
                    if (!modal.classList.contains('show')) return;
                    if (e.key === 'ArrowRight') changeModal(1);
                    else if (e.key === 'ArrowLeft') changeModal(-1);
                    else if (e.key === 'Escape') closeModal();
                }, opts);

                // Swipe dans la modal
                var mx = 0, my = 0, mTracking = false;
                modal.addEventListener('pointerdown', function (e) {
                    if (e.target === modalImg) { mx = e.clientX; my = e.clientY; mTracking = true; }
                }, opts);
                modal.addEventListener('pointerup', function (e) {
                    if (!mTracking) return;
                    mTracking = false;
                    var dx = e.clientX - mx, dy = e.clientY - my;
                    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
                        changeModal(dx < 0 ? 1 : -1);
                    }
                }, opts);
                modal.addEventListener('pointercancel', function () { mTracking = false; }, opts);

                show(current);
                startAuto();
            }

            document.addEventListener('astro:page-load', function () {
                try { initCarousel(); } catch (e) { console.error('builds-pc carousel init:', e); }
            });
        })();
