<?php
require_once("config/db.php");

$admins = [
    ["nome" => "Admin1", "email" => "admin1@evently.it", "password" => "admin123"],
    ["nome" => "Admin2", "email" => "admin2@evently.it", "password" => "admin456"],
];

foreach ($admins as $admin) {
    $hash = password_hash($admin["password"], PASSWORD_DEFAULT);
    $stm = $pdo->prepare("INSERT INTO Utente (Nome, Email, Password, Tipo) VALUES (:nome, :email, :password, 'admin')");
    $stm->execute([
        ":nome" => $admin["nome"],
        ":email" => $admin["email"],
        ":password" => $hash,
    ]);
    echo "Creato: " . $admin["email"] . "\n";
}