<?php

header("Content-Type: application/json");

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
        SELECT ID, PasswordUtente 
        FROM Utente 
        WHERE Email = :email
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
            "IDUtente" => $user["ID"]
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
