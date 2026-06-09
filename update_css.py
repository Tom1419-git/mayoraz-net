import os

css_additions = """
/* Modal Navigation Buttons */
.modal-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 15px 20px;
    cursor: pointer;
    font-size: 24px;
    border-radius: 50%;
    z-index: 1002;
    transition: background 0.3s, color 0.3s;
}
.modal-nav-btn:hover {
    background: rgba(0, 212, 255, 0.8);
    color: white;
}
#modalPrev {
    left: 20px;
}
#modalNext {
    right: 20px;
}

/* Testimonials Section */
.testimonials-section {
    padding: 80px 20px;
    background: var(--bg-alt, #0f172a);
    text-align: center;
}
.testimonials-section h2 {
    font-size: 2.5rem;
    color: var(--text-main, #f8fafc);
    margin-bottom: 40px;
}
.testimonials-section h2 span {
    color: var(--primary, #00d4ff);
}
.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
}
.testimonial-card {
    background: var(--bg-card, #1e293b);
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
    border: 1px solid var(--border-color, #334155);
    text-align: left;
    transition: transform 0.3s ease;
}
.testimonial-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary, #00d4ff);
}
.quote-icon {
    font-size: 2rem;
    color: var(--primary, #00d4ff);
    opacity: 0.5;
    position: absolute;
    top: 20px;
    right: 20px;
}
.testimonial-text {
    font-style: italic;
    color: var(--text-muted, #94a3b8);
    margin-bottom: 20px;
    line-height: 1.6;
    font-size: 1.05rem;
}
.testimonial-author {
    display: flex;
    align-items: center;
    gap: 15px;
}
.author-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary, #00d4ff);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111827;
    font-weight: bold;
    font-size: 1.2rem;
}
.author-info h4 {
    color: var(--text-main, #f8fafc);
    margin: 0;
    font-size: 1rem;
}
.author-info span {
    color: var(--primary, #00d4ff);
    font-size: 0.8rem;
}
/* Rating Stars */
.rating {
    color: #fbbf24;
    margin-bottom: 10px;
    font-size: 1.1rem;
}
"""

with open(r"A:\SiteWeb\media\css\main.css", "a", encoding="utf-8") as f:
    f.write(css_additions)
print("CSS updated with Modal Nav and Testimonials.")
