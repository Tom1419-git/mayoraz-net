import os
import re

css_fix = """/* Modal / Lightbox Styles */
.modal {
    position: fixed; 
    z-index: 1000; 
    left: 0;
    top: 0;
    width: 100vw; 
    height: 100vh; 
    background-color: rgba(0,0,0,0.9); 
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease;
}
.modal.show {
    visibility: visible;
    opacity: 1;
}
.modal-content {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    border-radius: 8px;
    animation: zoomIn 0.3s ease;
}
@keyframes zoomIn {
    from {transform: scale(0.9); opacity: 0;}
    to {transform: scale(1); opacity: 1;}
}
.modal-close {
    position: absolute;
    top: 20px;
    right: 35px;
    color: #f1f1f1;
    font-size: 40px;
    font-weight: bold;
    transition: 0.3s;
    cursor: pointer;
    z-index: 1001;
}
.modal-close:hover,
.modal-close:focus {
    color: var(--primary, #00d4ff);
    text-decoration: none;
    cursor: pointer;
}
/* Make carousel images clickable */
.carousel-slide img {
    cursor: pointer;
}"""

css_path = r"A:\SiteWeb\media\css\main.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

# Replace old modal CSS block
css_content = re.sub(r'/\* Modal / Lightbox Styles \*/.*?\.carousel-slide img \{\s*cursor: pointer;\s*\}', css_fix, css_content, flags=re.DOTALL)

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)

html_path = r"A:\SiteWeb\builds-pc\intro-buildpc.html"
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

clean_script = """    <!-- Carousel Script -->
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
                slideInterval = setInterval(nextSlide, 3500);
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

            const container = document.querySelector('.carousel-container');
            if (container) {
                container.addEventListener('mouseenter', () => clearInterval(slideInterval));
                container.addEventListener('mouseleave', startSlideShow);
            }

            // Modal Logic
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImage");
            const closeBtn = document.getElementById("modalClose");
            const carouselImages = document.querySelectorAll(".carousel-slide img");

            if (modal && modalImg && closeBtn) {
                carouselImages.forEach(img => {
                    img.addEventListener('click', () => {
                        modal.classList.add("show");
                        modalImg.src = img.src;
                    });
                });

                closeBtn.addEventListener('click', () => {
                    modal.classList.remove("show");
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove("show");
                    }
                });
            }

            startSlideShow();
        });
    </script>
</body>"""

# Replace script block
html_content = re.sub(r'<!-- Carousel Script -->.*</body>', clean_script, html_content, flags=re.DOTALL)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("CSS and HTML successfully updated!")
