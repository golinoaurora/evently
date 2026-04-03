<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

if(!isset($data["Email"]) || !isset($data["PasswordUtente"])) {
    echo json_encode([
        "success" => false,
        "message" => "Dati mancanti"
    ]);
    exit;
}

$email = $data["Email"];
$password = $data["PasswordUtente"];

try {

    $stm = $pdo->prepare("
        SELECT u.ID, u.PasswordUtente,
            CASE 
                WHEN p.ID IS NOT NULL THEN 'privato'
                WHEN l.ID IS NOT NULL THEN 'locale'
                WHEN a.ID IS NOT NULL THEN 'admin'
            END AS tipo,
            p.ID AS IDPrivato
        FROM Utente u
        LEFT JOIN Privato p ON p.IDUtente = u.ID
        LEFT JOIN Locale l ON l.IDUtente = u.ID
        LEFT JOIN Admin a ON a.IDUtente = u.ID
        WHERE u.Email = :email
    ");

    $stm->bindValue(":email", $email);
    $stm->execute();

    $user = $stm->fetch(PDO::FETCH_ASSOC);

    if(!$user) {
        echo json_encode([
            "success" => false,
            "message" => "Utente non trovato"
        ]);
        exit;
    }

    if(password_verify($password, $user["PasswordUtente"])) {
        echo json_encode([
            "success" => true,
            "message" => "Login riuscito",
            "IDUtente" => $user["ID"],
            "tipo" => $user["tipo"],
            "IDPrivato" => $user["IDPrivato"],
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Password errata"
        ]);
    }

} catch(PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Errore server"
    ]);
}
?>