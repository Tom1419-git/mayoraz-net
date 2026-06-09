import os

css_additions = """
/* Builds Grid */
.builds-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    margin-top: 40px;
}
.build-card {
    background: #111827; /* Fallback */
    background: var(--bg-card, #111827);
    border: 1px solid var(--border-color, #334155);
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.build-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 212, 255, 0.1);
    border-color: var(--primary, #00d4ff);
}
.build-image img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-bottom: 1px solid var(--border-color, #334155);
}
.placeholder-content {
    height: 250px;
    background: #1e293b;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    border-bottom: 1px solid var(--border-color, #334155);
}
.placeholder-icon {
    font-size: 2rem;
    margin-bottom: 10px;
}
.build-content {
    padding: 25px;
}
.build-title {
    color: var(--text-main, #f8fafc);
    font-size: 1.5rem;
    margin-bottom: 5px;
}
.build-subtitle {
    color: var(--primary, #00d4ff);
    font-size: 0.9rem;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.build-status {
    display: inline-block;
    padding: 4px 10px;
    background: rgba(0, 212, 255, 0.1);
    color: var(--primary, #00d4ff);
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    margin-bottom: 15px;
}
.build-description {
    color: var(--text-muted, #94a3b8);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 20px;
}
.build-specs {
    list-style: none;
    padding: 0;
    margin: 0;
}
.build-specs li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color, #334155);
    color: var(--text-main, #f8fafc);
    font-size: 0.9rem;
}
.build-specs li:last-child {
    border-bottom: none;
}
.spec-label {
    color: var(--text-muted, #94a3b8);
    font-weight: 500;
}

/* Download Button for autres-projets */
.download-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--primary, #00d4ff);
    text-decoration: none;
    font-weight: bold;
    padding: 8px 15px;
    border: 1px solid var(--primary, #00d4ff);
    border-radius: 6px;
    margin-top: 15px;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}
.download-btn:hover {
    background: var(--primary, #00d4ff);
    color: #fff;
}
"""

with open(r"A:\SiteWeb\media\css\main.css", "a", encoding="utf-8") as f:
    f.write(css_additions)

print("Added missing CSS rules to main.css")
