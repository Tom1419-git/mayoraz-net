import os
import re

css_fix = """/* Make sure inactive slides don't intercept clicks */
.carousel-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease-in-out;
}
.carousel-slide.active {
    opacity: 1;
    pointer-events: auto;
}
.carousel-slide.active img {
    cursor: pointer;
}"""

css_path = r"A:\SiteWeb\media\css\main.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

# Replace the old carousel-slide css
css_content = re.sub(r'\.carousel-slide \{.*?\.carousel-slide\.active \{\s*opacity:\s*1;\s*\}', css_fix, css_content, flags=re.DOTALL)

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)

html_path = r"A:\SiteWeb\builds-pc\intro-buildpc.html"
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Make images use inline onclick
html_content = html_content.replace('<img src="../media/img/builds-pc/pc-setup1.jpg" alt="Mon Setup Actuel - Vue 1" />', '<img src="../media/img/builds-pc/pc-setup1.jpg" alt="Mon Setup Actuel - Vue 1" onclick="openModal(this.src)" />')
html_content = html_content.replace('<img src="../media/img/builds-pc/pc-setup2.jpg" alt="Mon Setup Actuel - Vue 2" />', '<img src="../media/img/builds-pc/pc-setup2.jpg" alt="Mon Setup Actuel - Vue 2" onclick="openModal(this.src)" />')
html_content = html_content.replace('<img src="../media/img/builds-pc/pc-setup3.jpg" alt="Mon Setup Actuel - Vue 3" />', '<img src="../media/img/builds-pc/pc-setup3.jpg" alt="Mon Setup Actuel - Vue 3" onclick="openModal(this.src)" />')

js_fix = """            // Modal Logic
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImage");
            const closeBtn = document.getElementById("modalClose");

            window.openModal = function(src) {
                if (modal && modalImg) {
                    modal.style.display = 'flex'; // Force display flex to override any display:none cached issues
                    modal.classList.add("show");
                    modalImg.src = src;
                }
            };

            if (modal && closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove("show");
                    setTimeout(() => { modal.style.display = ''; }, 300);
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove("show");
                        setTimeout(() => { modal.style.display = ''; }, 300);
                    }
                });
            }"""

html_content = re.sub(r'// Modal Logic.*startSlideShow\(\);', js_fix + "\n\n            startSlideShow();", html_content, flags=re.DOTALL)

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Updated HTML and CSS for foolproof modal!")
