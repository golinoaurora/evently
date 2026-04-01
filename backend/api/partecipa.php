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

$IDEvento = $data["IDEvento"] ?? null;
$IDUtente = $data["IDUtente"] ?? null;

if(!$IDEvento || !$IDUtente) {
    echo json_encode(["success" => false, "message" => "Dati mancanti"]);
    exit;
}

try {
    // Troviamo l'ID privato dall'IDUtente
    $stm = $pdo->prepare("SELECT ID FROM Privato WHERE IDUtente = :id");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $privato = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$privato) {
        echo json_encode(["success" => false, "message" => "Utente non autorizzato"]);
        exit;
    }

    // Controlliamo se è già iscritto
    $stm = $pdo->prepare("
        SELECT ID FROM Partecipare 
        WHERE IDEvento = :idEvento AND IDPrivato = :idPrivato
    ");
    $stm->bindValue(":idEvento", $IDEvento);
    $stm->bindValue(":idPrivato", $privato["ID"]);
    $stm->execute();

    if($stm->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Sei già iscritto a questo evento"]);
        exit;
    }

    // Iscrizione
    $stm = $pdo->prepare("
        INSERT INTO Partecipare (DataIscrizione, IDEvento, IDPrivato)
        VALUES (CURDATE(), :idEvento, :idPrivato)
    ");
    $stm->bindValue(":idEvento", $IDEvento);
    $stm->bindValue(":idPrivato", $privato["ID"]);
    $stm->execute();

    echo json_encode(["success" => true, "message" => "Iscrizione completata!"]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}
?>