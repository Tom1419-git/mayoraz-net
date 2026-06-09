import os

path = r"A:\SiteWeb\builds-pc\intro-buildpc.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

modal_html = """
    <!-- Lightbox Modal -->
    <div id="imageModal" class="modal">
        <span class="modal-close" id="modalClose">&times;</span>
        <img class="modal-content" id="modalImage" alt="Image en plein &eacute;cran">
    </div>

    <!-- Carousel Script -->"""

if '<div id="imageModal"' not in content:
    content = content.replace("<!-- Carousel Script -->", modal_html)

modal_js = """
            // Modal Logic
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImage");
            const closeBtn = document.getElementById("modalClose");
            const carouselImages = document.querySelectorAll(".carousel-slide img");

            if (modal && modalImg && closeBtn) {
                carouselImages.forEach(img => {
                    img.addEventListener('click', () => {
                        modal.style.display = "block";
                        modalImg.src = img.src;
                    });
                });

                closeBtn.addEventListener('click', () => {
                    modal.style.display = "none";
                });

                // Close when clicking outside the image
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.display = "none";
                    }
                });
            }

            startSlideShow();"""

content = content.replace("            startSlideShow();", modal_js)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modal HTML and JS added successfully!")
