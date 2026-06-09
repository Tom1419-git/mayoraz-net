import os

css_additions = """
/* Sites Grid */
.sites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    margin-top: 40px;
}
.site-card {
    background: var(--bg-card, #111827);
    border: 1px solid var(--border-color, #334155);
    border-radius: 12px;
    padding: 25px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    text-decoration: none;
}
.site-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 212, 255, 0.1);
    border-color: var(--primary, #00d4ff);
}
.site-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}
.site-icon {
    font-size: 2.5rem;
}
.site-title {
    color: var(--text-main, #f8fafc);
    font-size: 1.4rem;
    margin-bottom: 5px;
}
.site-url {
    color: var(--primary, #00d4ff);
    font-size: 0.9rem;
    text-decoration: underline;
}
.project-date {
    color: var(--text-muted, #94a3b8);
    font-size: 0.8rem;
    margin-top: 3px;
}
.site-description {
    color: var(--text-muted, #94a3b8);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 20px;
    flex-grow: 1;
}
.site-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}
.tech-tag {
    background: rgba(0, 212, 255, 0.1);
    color: var(--primary, #00d4ff);
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
}
.add-site-card {
    background: transparent;
    border: 2px dashed var(--border-color, #334155);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 250px;
    color: var(--text-muted, #94a3b8);
    transition: all 0.3s ease;
}
.add-site-card:hover {
    border-color: var(--primary, #00d4ff);
    color: var(--primary, #00d4ff);
    background: rgba(0, 212, 255, 0.05);
}
.add-icon {
    font-size: 3rem;
    margin-bottom: 10px;
}
"""

with open(r"A:\SiteWeb\media\css\main.css", "a", encoding="utf-8") as f:
    f.write(css_additions)

print("Added sites grid CSS rules")
