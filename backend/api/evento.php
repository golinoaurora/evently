<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once("../config/db.php");

$id = $_GET["id"] ?? null;

if(!$id) {
    echo json_encode(["success" => false, "message" => "ID mancante"]);
    exit;
}

try {
    $stm = $pdo->prepare("
        SELECT e.ID, e.Titolo, e.Descrizione, e.DataEvento,
            e.Ora, e.Prezzo, e.MaxPartecipanti, e.IDPrivato,
            l.Nome AS NomeLuogo, l.Indirizzo,
            COUNT(DISTINCT p.ID) AS Iscritti
        FROM Evento e
        JOIN Luogo l ON l.ID = e.IDLuogo
        LEFT JOIN Partecipare p ON p.IDEvento = e.ID
        WHERE e.ID = :id
        GROUP BY e.ID
    ");

    $stm->bindValue(":id", $id);
    $stm->execute();
    $evento = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$evento) {
        echo json_encode(["success" => false, "message" => "Evento non trovato"]);
        exit;
    }

    echo json_encode(["success" => true, "evento" => $evento]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Errore server"]);
}
?>