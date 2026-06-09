import os
import re

css_additions = """
/* Carousel Styles */
.carousel-container {
    position: relative;
    width: 100%;
    height: 250px;
    overflow: hidden;
    border-bottom: 1px solid var(--border-color, #334155);
}
.carousel-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
}
.carousel-slide.active {
    opacity: 1;
}
.carousel-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border: none;
}
.carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    font-size: 18px;
    border-radius: 50%;
    z-index: 10;
    transition: background 0.3s;
}
.carousel-btn:hover {
    background: rgba(0, 212, 255, 0.8);
}
.prev-btn {
    left: 10px;
}
.next-btn {
    right: 10px;
}
.carousel-dots {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
}
.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: background 0.3s;
}
.dot.active {
    background: var(--primary, #00d4ff);
}
"""

with open(r"A:\SiteWeb\media\css\main.css", "a", encoding="utf-8") as f:
    f.write(css_additions)

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
                        <button class="carousel-btn prev-btn" aria-label="Image pr&eacute;c&eacute;dente">&#10094;</button>
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
            container.addEventListener('mouseenter', () => clearInterval(slideInterval));
            container.addEventListener('mouseleave', startSlideShow);

            startSlideShow();
        });
    </script>
</body>"""

content = content.replace("</body>", js_script)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Carousel added successfully!")
