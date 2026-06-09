<?php
header('Content-Type: application/json');

// Configuration
$toEmail = 'thomasmayoraz@yahoo.com';

// Sécurité : On récupère la clé secrète depuis un fichier config.php non versionné
$turnstileSecret = 'VOTRE_SECRET_KEY_ICI';
if (file_exists('config.php')) {
    require 'config.php';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée.']);
    exit;
}

// Récupération des données
$prenom = filter_var($_POST['prenom'] ?? '', FILTER_SANITIZE_STRING);
$nom = filter_var($_POST['nom'] ?? '', FILTER_SANITIZE_STRING);
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
$prestation = filter_var($_POST['prestation'] ?? '', FILTER_SANITIZE_STRING);
$budget = filter_var($_POST['budget'] ?? '', FILTER_SANITIZE_STRING);
$message = filter_var($_POST['message'] ?? '', FILTER_SANITIZE_STRING);
$turnstileResponse = $_POST['cf-turnstile-response'] ?? '';

// Validation de base
if (empty($prenom) || empty($nom) || empty($email) || empty($message) || empty($turnstileResponse)) {
    http_response_code(400);
    echo json_encode(['error' => 'Veuillez remplir tous les champs obligatoires et valider le Captcha.']);
    exit;
}

// Vérification de l'email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Adresse email invalide.']);
    exit;
}

// Vérification du Turnstile
$verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
$verifyData = [
    'secret' => $turnstileSecret,
    'response' => $turnstileResponse,
    'remoteip' => $_SERVER['REMOTE_ADDR']
];

$ch = curl_init($verifyUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($verifyData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$responseData = json_decode($response, true);

if (!$responseData['success']) {
    http_response_code(403);
    echo json_encode(['error' => 'Validation anti-spam échouée.']);
    exit;
}

// Préparation de l'email
$subject = "Nouveau message de $prenom $nom depuis le site";
$from = "contact@mayoraz-net.ch";

// Entêtes
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=utf-8\r\n";
$headers .= "From: Portfolio Contact <" . $from . ">\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Corps de l'email (HTML)
$htmlMessage = "
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    .header { background: #0f172a; color: #fff; padding: 10px 20px; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #777; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; }
    th { width: 130px; color: #555; }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h2>Nouveau message - mayoraz-net.ch</h2>
    </div>
    <div class='content'>
      <table>
        <tr><th>Nom :</th><td>" . htmlspecialchars($prenom . ' ' . $nom) . "</td></tr>
        <tr><th>Email :</th><td><a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></td></tr>
        <tr><th>Prestation :</th><td>" . htmlspecialchars($prestation) . "</td></tr>
        <tr><th>Budget :</th><td>" . htmlspecialchars($budget) . "</td></tr>
      </table>
      <h3 style='margin-top: 20px;'>Message :</h3>
      <p style='background: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;'>" . nl2br(htmlspecialchars($message)) . "</p>
    </div>
    <div class='footer'>
      Cet email a été envoyé automatiquement depuis le formulaire de contact de votre portfolio.
    </div>
  </div>
</body>
</html>
";

// Envoi de l'email
if (mail($toEmail, $subject, $htmlMessage, $headers)) {
    http_response_code(200);
    echo json_encode(['success' => 'Message envoyé avec succès.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de l\'envoi de l\'email par le serveur.']);
}
?>
