<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents('php://input'), true);
$school_id = $data['school_id'] ?? '';
$password = $data['password'] ?? '';

require_once 'db.php';

try {
    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE school_id = ?");
    $stmt->execute([$school_id]);
    $user = $stmt->fetch();

    if ($user && $password === $user['password']) {
        echo json_encode([
            'success' => true, 
            'user_id' => $user['id'],
            'message' => 'Login successful'
        ]);
    } else {
        echo json_encode(['error' => 'Invalid credentials']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Login failed']);
}
?> 