<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw_data = file_get_contents('php://input');
if (!$raw_data) {
    http_response_code(400);
    echo json_encode(['error' => 'No data received']);
    exit;
}

$data = json_decode($raw_data, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

$user_id = $data['user_id'] ?? 0;
$amount = $data['amount'] ?? 0;
$category = $data['category'] ?? '';
$description = $data['description'] ?? '';

if (!$user_id || $amount <= 0 || empty($category)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: user ID, amount, and category are required']);
    exit;
}

try {
    // Verify user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // Record the expense
    $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, type, category, description) VALUES (?, ?, 'expense', ?, ?)");
    $stmt->execute([$user_id, $amount, $category, $description]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Expense recorded successfully'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to record expense. Please try again.']);
}
?> 