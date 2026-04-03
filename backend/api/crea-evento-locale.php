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
$descrizione = $data["Descrizione"] ?? "";
$dataEvento = $data["DataEvento"] ?? "";
$ora = $data["Ora"] ?? "";
$prezzo = $data["Prezzo"] ?? 0;
$maxPartecipanti = $data["MaxPartecipanti"] ?? 0;
$IDLuogo = $data["IDLuogo"] ?? null;
$IDUtente = $data["IDUtente"] ?? null;

if(!$titolo || !$descrizione || !$dataEvento || !$ora || !$IDLuogo || !$IDUtente) {
    echo json_encode(["success" => false, "message" => "Dati mancanti"]);
    exit;
}

try {
    // Troviamo IDLocale
    $stm = $pdo->prepare("SELECT ID FROM Locale WHERE IDUtente = :id");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $locale = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$locale) {
        echo json_encode(["success" => false, "message" => "Locale non trovato"]);
        exit;
    }

    $stm = $pdo->prepare("
        INSERT INTO Evento (Titolo, Descrizione, DataEvento, Ora, Prezzo, MaxPartecipanti, IDLuogo, IDLocale)
        VALUES (:titolo, :desc, :data, :ora, :prezzo, :maxP, :luogo, :locale)
    ");

    $stm->execute([
        ":titolo" => $titolo,
        ":desc" => $descrizione,
        ":data" => $dataEvento,
        ":ora" => $ora,
        ":prezzo" => $prezzo,
        ":maxP" => $maxPartecipanti,
        ":luogo" => $IDLuogo,
        ":locale" => $locale["ID"],
    ]);

    echo json_encode(["success" => true, "message" => "Evento creato!"]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}