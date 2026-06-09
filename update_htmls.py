import os
import re

html_path = r"A:\SiteWeb\builds-pc\intro-buildpc.html"
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Replace Lightbox Modal HTML
new_modal_html = """    <!-- Lightbox Modal -->
    <div id="imageModal" class="modal">
        <span class="modal-close" id="modalClose">&times;</span>
        <button id="modalPrev" class="modal-nav-btn">&#10094;</button>
        <img class="modal-content" id="modalImage" alt="Image en plein &eacute;cran">
        <button id="modalNext" class="modal-nav-btn">&#10095;</button>
    </div>"""
html_content = re.sub(r'<!-- Lightbox Modal -->.*?</script>\s*</body>', new_modal_html + "\n\n        <!-- Carousel Script -->\n    <script>\n        document.addEventListener('DOMContentLoaded', () => {\n            const slides = document.querySelectorAll('.carousel-slide');\n            const dots = document.querySelectorAll('.dot');\n            const prevBtn = document.querySelector('.prev-btn');\n            const nextBtn = document.querySelector('.next-btn');\n            let currentSlide = 0;\n            let slideInterval;\n\n            function showSlide(index) {\n                slides.forEach(slide => slide.classList.remove('active'));\n                dots.forEach(dot => dot.classList.remove('active'));\n                if (index >= slides.length) currentSlide = 0;\n                else if (index < 0) currentSlide = slides.length - 1;\n                else currentSlide = index;\n                slides[currentSlide].classList.add('active');\n                dots[currentSlide].classList.add('active');\n            }\n            function nextSlide() { showSlide(currentSlide + 1); }\n            function prevSlide() { showSlide(currentSlide - 1); }\n            function startSlideShow() { slideInterval = setInterval(nextSlide, 3500); }\n            function resetInterval() { clearInterval(slideInterval); startSlideShow(); }\n\n            nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });\n            prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });\n            dots.forEach((dot, index) => { dot.addEventListener('click', () => { showSlide(index); resetInterval(); }); });\n\n            const container = document.querySelector('.carousel-container');\n            if (container) {\n                container.addEventListener('mouseenter', () => clearInterval(slideInterval));\n                container.addEventListener('mouseleave', startSlideShow);\n            }\n\n            // Modal Gallery Logic\n            const modal = document.getElementById(\"imageModal\");\n            const modalImg = document.getElementById(\"modalImage\");\n            const closeBtn = document.getElementById(\"modalClose\");\n            const mPrevBtn = document.getElementById(\"modalPrev\");\n            const mNextBtn = document.getElementById(\"modalNext\");\n            const images = Array.from(document.querySelectorAll(\".carousel-slide img\")).map(img => img.src);\n            let currentModalIndex = 0;\n\n            window.openModal = function(src) {\n                if (modal && modalImg) {\n                    currentModalIndex = images.indexOf(src);\n                    if(currentModalIndex === -1) currentModalIndex = 0;\n                    modal.style.display = 'flex';\n                    modal.classList.add(\"show\");\n                    modalImg.src = images[currentModalIndex];\n                }\n            };\n\n            function changeModalImage(step) {\n                currentModalIndex += step;\n                if(currentModalIndex >= images.length) currentModalIndex = 0;\n                if(currentModalIndex < 0) currentModalIndex = images.length - 1;\n                modalImg.src = images[currentModalIndex];\n            }\n\n            if (modal && closeBtn) {\n                closeBtn.addEventListener('click', () => { modal.classList.remove(\"show\"); setTimeout(() => { modal.style.display = ''; }, 300); });\n                modal.addEventListener('click', (e) => {\n                    if (e.target === modal) { modal.classList.remove(\"show\"); setTimeout(() => { modal.style.display = ''; }, 300); }\n                });\n                mPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); changeModalImage(-1); });\n                mNextBtn.addEventListener('click', (e) => { e.stopPropagation(); changeModalImage(1); });\n                \n                document.addEventListener('keydown', (e) => {\n                    if(modal.classList.contains('show')) {\n                        if(e.key === 'ArrowRight') changeModalImage(1);\n                        if(e.key === 'ArrowLeft') changeModalImage(-1);\n                        if(e.key === 'Escape') closeBtn.click();\n                    }\n                });\n            }\n\n            startSlideShow();\n        });\n    </script>\n</body>", html_content, flags=re.DOTALL)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Updated intro-buildpc.html with Modal Gallery!")

# Add testimonials to index.html
index_path = r"A:\SiteWeb\index.html"
with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

testimonials_html = """
      <!-- Section Avis Clients -->
      <section class="testimonials-section">
        <h2><span>💬</span> Ce que disent mes clients</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="quote-icon">❝</div>
            <div class="rating">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p class="testimonial-text">"Travail tr&egrave;s professionnel ! Thomas a mont&eacute; mon PC gaming avec un c&acirc;blage impeccable. Tout tourne &agrave; merveille, je recommande vivement."</p>
            <div class="testimonial-author">
              <div class="author-avatar">M</div>
              <div class="author-info">
                <h4>Maxime D.</h4>
                <span>Client Montage PC</span>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card">
            <div class="quote-icon">❝</div>
            <div class="rating">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p class="testimonial-text">"Intervention rapide pour un d&eacute;pannage sur mon ordinateur de travail qui refusait de d&eacute;marrer. R&eacute;paration efficace et super conseils."</p>
            <div class="testimonial-author">
              <div class="author-avatar">S</div>
              <div class="author-info">
                <h4>Sophie L.</h4>
                <span>Client D&eacute;pannage</span>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="quote-icon">❝</div>
            <div class="rating">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p class="testimonial-text">"Un d&eacute;veloppeur &agrave; l'&eacute;coute qui a su r&eacute;aliser mon site web exactement comme je l'imaginais. Design moderne et communication au top."</p>
            <div class="testimonial-author">
              <div class="author-avatar">A</div>
              <div class="author-info">
                <h4>Alexandre V.</h4>
                <span>Client Site Web</span>
              </div>
            </div>
          </div>
        </div>
      </section>
"""

if 'class="testimonials-section"' not in index_content:
    index_content = index_content.replace('</main>', testimonials_html + '\n    </main>')

with open(index_path, "w", encoding="utf-8") as f:
    f.write(index_content)

print("Updated index.html with Testimonials!")
