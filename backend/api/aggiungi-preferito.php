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
    // Troviamo IDPrivato
    $stm = $pdo->prepare("SELECT ID FROM Privato WHERE IDUtente = :id");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $privato = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$privato) {
        echo json_encode(["success" => false, "message" => "Utente non autorizzato"]);
        exit;
    }

    // Controlliamo se esiste già
    $stm = $pdo->prepare("SELECT ID FROM Preferiti WHERE IDEvento = :e AND IDPrivato = :p");
    $stm->execute([":e" => $IDEvento, ":p" => $privato["ID"]]);

    if($stm->rowCount() > 0) {
        // Rimuovi preferito (toggle)
        $stm = $pdo->prepare("DELETE FROM Preferiti WHERE IDEvento = :e AND IDPrivato = :p");
        $stm->execute([":e" => $IDEvento, ":p" => $privato["ID"]]);
        echo json_encode(["success" => true, "preferito" => false]);
    } else {
        // Aggiungi preferito
        $stm = $pdo->prepare("INSERT INTO Preferiti (IDEvento, IDPrivato) VALUES (:e, :p)");
        $stm->execute([":e" => $IDEvento, ":p" => $privato["ID"]]);
        echo json_encode(["success" => true, "preferito" => true]);
    }

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}