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
require_once("crea_notifica.php");

$data = json_decode(file_get_contents("php://input"), true);

$titolo = $data["Titolo"] ?? "";
$descrizione = $data["Descrizione"] ?? "";
$dataEvento = $data["DataEvento"] ?? "";
$ora = $data["Ora"] ?? "";
$prezzo = $data["Prezzo"] ?? 0;
$maxPartecipanti = $data["MaxPartecipanti"] ?? 0;
$IDUtente = $data["IDUtente"] ?? null;
$categoria = $data["Categoria"] ?? "ALTRO";
$imageUrl = $data["ImageUrl"] ?? null;

if(!$titolo || !$descrizione || !$dataEvento || !$ora || !$IDUtente) {
    echo json_encode(["success" => false, "message" => "Dati mancanti"]);
    exit;
}

try {
    $stm = $pdo->prepare("
        SELECT loc.ID AS IDLocale, l.ID AS IDLuogo
        FROM Locale loc
        JOIN Luogo l ON l.IDLocale = loc.ID
        WHERE loc.IDUtente = :id
        LIMIT 1
    ");
    $stm->bindValue(":id", $IDUtente);
    $stm->execute();
    $locale = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$locale) {
        echo json_encode(["success" => false, "message" => "Locale o luogo non trovato"]);
        exit;
    }

    $stm = $pdo->prepare("
        INSERT INTO Evento (Titolo, Descrizione, DataEvento, Ora, Prezzo, MaxPartecipanti, IDLuogo, IDLocale, Categoria, ImageUrl)
        VALUES (:titolo, :desc, :data, :ora, :prezzo, :maxP, :luogo, :locale, :categoria, :imageUrl)
    ");
    $stm->execute([
        ":titolo" => $titolo,
        ":desc" => $descrizione,
        ":data" => $dataEvento,
        ":ora" => $ora,
        ":prezzo" => $prezzo,
        ":maxP" => $maxPartecipanti,
        ":luogo" => $locale["IDLuogo"],
        ":locale" => $locale["IDLocale"],
        ":categoria" => $categoria,
        ":imageUrl" => $imageUrl,
    ]);

    $stm = $pdo->prepare("SELECT IDUtente FROM Privato");
    $stm->execute();
    $privati = $stm->fetchAll(PDO::FETCH_ASSOC);

    foreach($privati as $privato) {
        creaNotifica(
            $pdo,
            $privato["IDUtente"],
            "nuovo_evento",
            "Nuovo evento disponibile: \"" . $titolo . "\"! Scoprilo nella home."
        );
    }

    echo json_encode(["success" => true, "message" => "Evento creato!"]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}