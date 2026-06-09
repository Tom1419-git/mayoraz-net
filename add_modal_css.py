import os

css_additions = """
/* Modal / Lightbox Styles */
.modal {
    display: none; 
    position: fixed; 
    z-index: 1000; 
    left: 0;
    top: 0;
    width: 100%; 
    height: 100%; 
    overflow: auto; 
    background-color: rgba(0,0,0,0.9); 
    backdrop-filter: blur(5px);
}
.modal-content {
    margin: auto;
    display: block;
    max-width: 90%;
    max-height: 90%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    border-radius: 8px;
    animation: zoomIn 0.3s ease;
}
@keyframes zoomIn {
    from {transform: translate(-50%, -50%) scale(0.9); opacity: 0;}
    to {transform: translate(-50%, -50%) scale(1); opacity: 1;}
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
}
"""

with open(r"A:\SiteWeb\media\css\main.css", "a", encoding="utf-8") as f:
    f.write(css_additions)
print("Added Modal CSS")
