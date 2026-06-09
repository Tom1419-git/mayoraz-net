import os
import re

path = r"A:\SiteWeb\builds-pc\intro-buildpc.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

carousel_html = """                    <div class="build-image carousel-container">
                        <div class="carousel-slide active">
                            <img src="../media/img/builds-pc/pc-setup1.jpg" alt="Mon Setup Actuel - Vue 1" />
                        </div>
                        <div class="carousel-slide">
                            <img src="../media/img/builds-pc/pc-setup2.jpg" alt="Mon Setup Actuel - Vue 2" />
                        </div>
                        <div class="carousel-slide">
                            <img src="../media/img/builds-pc/pc-setup3.jpg" alt="Mon Setup Actuel - Vue 3" />
                        </div>
                        <button class="carousel-btn prev-btn" aria-label="Image précédente">&#10094;</button>
                        <button class="carousel-btn next-btn" aria-label="Image suivante">&#10095;</button>
                        <div class="carousel-dots">
                            <span class="dot active" data-slide="0"></span>
                            <span class="dot" data-slide="1"></span>
                            <span class="dot" data-slide="2"></span>
                        </div>
                    </div>"""

# Replace the single image with the carousel
content = re.sub(
    r'<div class="build-image">\s*<img src="../media/img/builds-pc/pc-setup1\.jpg" alt="Mon Setup Actuel" />\s*</div>',
    carousel_html,
    content
)

js_script = """
    <!-- Carousel Script -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const slides = document.querySelectorAll('.carousel-slide');
            const dots = document.querySelectorAll('.dot');
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            let currentSlide = 0;
            let slideInterval;

            function showSlide(index) {
                slides.forEach(slide => slide.classList.remove('active'));
                dots.forEach(dot => dot.classList.remove('active'));
                
                if (index >= slides.length) currentSlide = 0;
                else if (index < 0) currentSlide = slides.length - 1;
                else currentSlide = index;

                slides[currentSlide].classList.add('active');
                dots[currentSlide].classList.add('active');
            }

            function nextSlide() {
                showSlide(currentSlide + 1);
            }

            function prevSlide() {
                showSlide(currentSlide - 1);
            }

            function startSlideShow() {
                slideInterval = setInterval(nextSlide, 3500); // Change image every 3.5 seconds
            }

            function resetInterval() {
                clearInterval(slideInterval);
                startSlideShow();
            }

            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetInterval();
            });

            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetInterval();
            });

            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showSlide(index);
                    resetInterval();
                });
            });

            // Pause on hover
            const container = document.querySelector('.carousel-container');
            if (container) {
                container.addEventListener('mouseenter', () => clearInterval(slideInterval));
                container.addEventListener('mouseleave', startSlideShow);
            }

            startSlideShow();
        });
    </script>
</body>"""

if "<!-- Carousel Script -->" not in content:
    content = content.replace("</body>", js_script)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Carousel re-applied successfully!")
