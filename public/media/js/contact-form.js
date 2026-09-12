document.addEventListener('astro:page-load', () => {
        // ── Chips génériques (budget + urgence) ──────────────────────────
        document.querySelectorAll('.chip-group').forEach(group => {
            const hidden = group.querySelector('input[type="hidden"]');
            const chips  = group.querySelectorAll('.chip');
            chips.forEach(chip => {
                chip.addEventListener('click', () => {
                    chips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    if (hidden) hidden.value = chip.dataset.value;
                });
            });
        });

        // ── Compteur de caractères ────────────────────────────────────────
        const textarea  = document.getElementById('message');
        const charCount = document.getElementById('char-count');
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                const len = textarea.value.length;
                charCount.textContent = len;
                charCount.style.color = len > 900 ? '#ff6060' : '';
            });
        }

        // ── Fichier joint — affichage du nom + drag&drop ─────────────────
        const fileInput  = document.getElementById('attachment');
        const fileNameEl = document.getElementById('file-name');
        const fileLabel  = document.querySelector('.file-upload-label');
        if (fileInput && fileNameEl) {
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
            const checkFileSize = (file) => {
                if (file && file.size > MAX_FILE_SIZE) {
                    const sizeMo = (file.size / 1024 / 1024).toFixed(1);
                    alert(window.t ? window.t('Fichier trop lourd (' + sizeMo + ' Mo). Maximum : 10 Mo.') : 'Fichier trop lourd (' + sizeMo + ' Mo). Maximum : 10 Mo.');
                    fileInput.value = '';
                    fileNameEl.textContent = '';
                    return false;
                }
                return true;
            };
            fileInput.addEventListener('change', () => {
                const f = fileInput.files[0];
                if (!checkFileSize(f)) return;
                fileNameEl.textContent = f ? '✓ ' + f.name + ' (' + (f.size / 1024 / 1024).toFixed(2) + ' Mo)' : '';
            });
        }
        if (fileLabel) {
            fileLabel.addEventListener('dragover', e => { e.preventDefault(); fileLabel.classList.add('dragover'); });
            fileLabel.addEventListener('dragleave', () => fileLabel.classList.remove('dragover'));
            fileLabel.addEventListener('drop', e => {
                e.preventDefault();
                fileLabel.classList.remove('dragover');
                if (e.dataTransfer.files.length && fileInput) {
                    const f = e.dataTransfer.files[0];
                    if (f.size > 10 * 1024 * 1024) {
                        alert(window.t ? window.t('Fichier trop lourd (' + (f.size / 1024 / 1024).toFixed(1) + ' Mo). Maximum : 10 Mo.') : 'Fichier trop lourd (' + (f.size / 1024 / 1024).toFixed(1) + ' Mo). Maximum : 10 Mo.');
                        return;
                    }
                    fileInput.files = e.dataTransfer.files;
                    fileNameEl.textContent = '✓ ' + f.name + ' (' + (f.size / 1024 / 1024).toFixed(2) + ' Mo)';
                }
            });
        }

        // ── Soumission du formulaire ──────────────────────────────────────
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const turnstileInput = document.querySelector('[name="cf-turnstile-response"]');
            if (!turnstileInput || !turnstileInput.value) {
                alert(window.t ? window.t('Veuillez valider le captcha avant d\'envoyer.') : 'Veuillez valider le captcha avant d\'envoyer.');
                return;
            }
            const form      = this;
            const submitBtn = form.querySelector('button[type="submit"]');
            const origHTML  = submitBtn.innerHTML;
            submitBtn.innerHTML = '<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> <span>' + (window.t ? window.t('Envoi en cours...') : 'Envoi en cours...') + '</span>';
            submitBtn.disabled  = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';

            const formData = new FormData(form);
            formData.delete('cf-turnstile-response-empty');
            // Note : le token Turnstile EST envoyé au webhook pour vérification
            // serveur future (siteverify) dès que la clé secrète sera configurée dans n8n

            // Supprimer la pièce jointe vide si l'utilisateur n'a rien sélectionné
            const fileInput = document.getElementById('attachment');
            if (fileInput && fileInput.files.length === 0) {
                formData.delete('attachment');
            }

            // On combine prénom + nom
            const prenom = (formData.get('prenom') || '').trim();
            const nom    = (formData.get('nom') || '').trim();
            formData.set('name', [prenom, nom].filter(Boolean).join(' '));
            formData.delete('prenom');
            formData.delete('nom');

            // Note: pour n8n on peut envoyer en FormData (multipart) si on a des fichiers joints !
            // On laisse donc fetch gérer le multipart tout seul.

            fetch('https://n8n.mayoraz-net.ch/webhook/contact-form', {
                method: 'POST',
                body: formData
            }).then(res => {
                if (res.ok) { window.location.href = '/contact/merci/'; }
                else {
                    alert(window.t ? window.t('Erreur lors de l\'envoi via n8n. Veuillez réessayer.') : 'Erreur lors de l\'envoi via n8n. Veuillez réessayer.');
                    submitBtn.innerHTML = origHTML;
                    submitBtn.disabled  = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                }
            }).catch(() => {
                alert(window.t ? window.t('Erreur de réseau. Vérifiez votre connexion.') : 'Erreur de réseau. Vérifiez votre connexion.');
                submitBtn.innerHTML = origHTML;
                submitBtn.disabled  = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            });
        });
    });
