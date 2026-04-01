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

$titolo = $data["Titolo"] ?? "";
$dataEvento = $data["DataEvento"] ?? "";
$numPartecipanti = $data["NumeroPartecipanti"] ?? "";
$messaggio = $data["Messaggio"] ?? "";
$IDLuogo = $data["IDLuogo"] ?? null;
$IDUtente = $data["IDUtente"] ?? null;

if(!$titolo || !$dataEvento || !$numPartecipanti || !$IDLuogo || !$IDUtente) {
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

    // Inserimento richiesta
    $stm = $pdo->prepare("
        INSERT INTO RichiestaEvento (Titolo, DataEvento, NumeroPartecipanti, Messaggio, Stato, IDLuogo, IDPrivato)
        VALUES (:titolo, :data, :num, :msg, 'in_attesa', :luogo, :privato)
    ");

    $stm->execute([
        ":titolo" => $titolo,
        ":data" => $dataEvento,
        ":num" => $numPartecipanti,
        ":msg" => $messaggio,
        ":luogo" => $IDLuogo,
        ":privato" => $privato["ID"],
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Richiesta inviata con successo!"
    ]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}