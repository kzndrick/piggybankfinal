<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'db.php'; // Include your database connection file

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw_data = file_get_contents('php://input');
if (!$raw_data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No data received']);
    exit;
}

$data = json_decode($raw_data, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
    exit;
}

$user_id = $data['user_id'] ?? 0;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'User ID is required']);
    exit;
}

try {
    // Calculate total savings
    $stmt_savings = $pdo->prepare(
        "SELECT
            SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)
        FROM transactions
        WHERE user_id = ?"
    );
    $stmt_savings->execute([$user_id]);
    $totalSavings = $stmt_savings->fetchColumn() ?? 0;

    // Fetch expense records
    $stmt_expenses = $pdo->prepare(
        "SELECT created_at, category, description, amount
        FROM transactions
        WHERE user_id = ? AND type = 'expense'
        ORDER BY created_at DESC"
    );
    $stmt_expenses->execute([$user_id]);
    $expenses = $stmt_expenses->fetchAll(PDO::FETCH_ASSOC);

    // Format expenses for frontend (matching the structure expected by renderExpenses)
    $formatted_expenses = array_map(function($exp) {
        $datetime = new DateTime($exp['created_at']);
        return [
            'date' => $datetime->format('Y-m-d'),
            'time' => $datetime->format('H:i:s'), // Keep 24-hour format from DB, frontend will format
            'hour' => $datetime->format('H'), // Keep hour for potential future use if needed
            'name' => $exp['category'], // Using category as name as in frontend
            'amount' => (float) $exp['amount']
        ];
    }, $expenses);

    echo json_encode([
        'success' => true,
        'totalSavings' => (float) $totalSavings,
        'expenses' => $formatted_expenses
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}

?> 