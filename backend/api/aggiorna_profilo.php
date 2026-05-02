<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$IDUtente     = $data["IDUtente"] ?? null;
$avatar_config = $data["avatar_config"] ?? null;
$bio          = $data["bio"] ?? null;

if (!$IDUtente) {
    echo json_encode(["success" => false, "message" => "IDUtente mancante"]);
    exit;
}

// Varianti consentite (solo quelle della libreria)
$variantiConsentite = ["beam", "marble", "pixel", "sunset", "ring", "bauhaus"];
if ($avatar_config && !in_array($avatar_config, $variantiConsentite)) {
    echo json_encode(["success" => false, "message" => "Variante non valida"]);
    exit;
}

if ($bio && mb_strlen($bio) > 200) {
    echo json_encode(["success" => false, "message" => "Bio troppo lunga"]);
    exit;
}

try {
    $stm = $pdo->prepare("
        UPDATE Utente
        SET avatar_config = :avatar_config,
            bio = :bio
        WHERE ID = :id
    ");
    $stm->bindValue(":avatar_config", $avatar_config);
    $stm->bindValue(":bio", $bio);
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();

    // Ritorna i dati aggiornati (stesso formato di profilo.php)
    $stm2 = $pdo->prepare("SELECT ID, Nome, Email, avatar_config, bio FROM Utente WHERE ID = :id");
    $stm2->bindValue(":id", $IDUtente);
    $stm2->execute();
    $utente = $stm2->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "utente" => $utente]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}