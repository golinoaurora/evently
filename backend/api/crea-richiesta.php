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
$ora = $data["Ora"] ?? "";
$numPartecipanti = $data["NumeroPartecipanti"] ?? "";
$messaggio = $data["Messaggio"] ?? "";
$IDLuogo = $data["IDLuogo"] ?? null;
$IDUtente = $data["IDUtente"] ?? null;
$categoria = $data["Categoria"] ?? "ALTRO";

if(!$titolo || !$dataEvento || !$ora || !$numPartecipanti || !$IDLuogo || !$IDUtente) {
    echo json_encode(["success" => false, "message" => "Dati mancanti"]);
    exit;
}

try {
    $stm = $pdo->prepare("SELECT ID FROM Privato WHERE IDUtente = :id");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $privato = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$privato) {
        echo json_encode(["success" => false, "message" => "Utente non autorizzato"]);
        exit;
    }

    $stm = $pdo->prepare("
        INSERT INTO RichiestaEvento (Titolo, DataEvento, Ora, NumeroPartecipanti, Messaggio, Stato, IDLuogo, IDPrivato, Categoria)
        VALUES (:titolo, :data, :ora, :num, :msg, 'in_attesa', :luogo, :privato, :categoria)
    ");

    $stm->execute([
        ":titolo" => $titolo,
        ":data" => $dataEvento,
        ":ora" => $ora,
        ":num" => $numPartecipanti,
        ":msg" => $messaggio,
        ":luogo" => $IDLuogo,
        ":privato" => $privato["ID"],
        ":categoria" => $categoria,
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Richiesta inviata con successo!"
    ]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}