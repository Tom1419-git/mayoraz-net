import os

path = r"A:\SiteWeb\contact\contact.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace action
content = content.replace('action="https://formspree.io/f/mwpbyprn"', 'action="../api/traitement.php"')

# Remove captcha-container
start_captcha = content.find('<div class="captcha-container">')
end_captcha = content.find('</div>\n                    <input type="hidden" id="captcha-answer"')
if end_captcha == -1:
    end_captcha = content.find('</div>\n\n                    <button type="submit"', start_captcha)
else:
    end_captcha = content.find('</div>', end_captcha + 6) + 6

turnstile_html = """<div class="cf-turnstile" data-sitekey="0x4AAAAAADhc2UTooOzxGXSX" data-theme="dark" style="margin-bottom: 20px; display: flex; justify-content: center;"></div>"""

if start_captcha != -1 and end_captcha != -1:
    # Also remove the hidden inputs for hash/answer if they exist
    end_full = content.find('                    <button type="submit"', start_captcha)
    content = content[:start_captcha] + turnstile_html + "\n" + content[end_full:]

# Remove old JS for captcha
start_js = content.find('const captchaQuestions = [')
end_js = content.find('document.querySelector(\'.contact-form\').addEventListener(\'submit\'')

if start_js != -1 and end_js != -1:
    content = content[:start_js] + content[end_js:]

# Clean up JS validateCaptcha call
js_submit_old = """            const captchaInput = document.getElementById('captcha');
            const userAnswer = captchaInput.value;
            if (!validateCaptcha(userAnswer)) {
                const errorMsg = document.getElementById('captcha-error');
                errorMsg.style.display = 'block';
                attemptCount++;
                if (attemptCount >= 3) {
                    setTimeout(() => {
                        generateCaptcha();
                        attemptCount = 0;
                        errorMsg.textContent = 'Nouvelle question générée après plusieurs tentatives incorrectes.';
                    }, 1500);
                } else {
                    errorMsg.textContent = `Réponse incorrecte. Tentative ${attemptCount}/3.`;
                }
                captchaInput.focus();
                return false;
            }
            document.getElementById('captcha-error').style.display = 'none';"""

content = content.replace(js_submit_old, """            const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]').value;
            if (!turnstileResponse) {
                alert('Veuillez valider le captcha Cloudflare.');
                return false;
            }""")

# Clean up JS generateCaptcha calls
js_gen1 = """        // Génération automatique du captcha au chargement
        document.addEventListener('DOMContentLoaded', function() {
            generateCaptcha();
        });"""
content = content.replace(js_gen1, "")

js_gen2 = """        // Régénération après inactivité
        let inactivityTimer;
        function resetInactivityTimer() {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                generateCaptcha();
            }, 300000); // 5 minutes
        }

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetInactivityTimer, true);
        });

        resetInactivityTimer();"""
content = content.replace(js_gen2, "")

# Add Turnstile script to head
head_end = content.find('</head>')
if '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js"' not in content:
    content = content[:head_end] + '    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>\n' + content[head_end:]

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("contact.html updated successfully!")
