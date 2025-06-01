<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Log all requests
error_log("Registration request received: " . $_SERVER['REQUEST_METHOD']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the raw POST data
$raw_data = file_get_contents('php://input');
error_log("Raw registration data: " . $raw_data);

if (!$raw_data) {
    http_response_code(400);
    echo json_encode(['error' => 'No data received']);
    exit;
}

// Decode JSON data
$data = json_decode($raw_data, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON decode error: " . json_last_error_msg());
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Log the decoded data
error_log("Decoded registration data: " . print_r($data, true));

// Validate required fields
$school_id = $data['school_id'] ?? '';
$password = $data['password'] ?? '';

if (empty($school_id) || empty($password)) {
    error_log("Missing required fields - School ID: " . (empty($school_id) ? 'empty' : 'provided') . 
              ", Password: " . (empty($password) ? 'empty' : 'provided'));
    http_response_code(400);
    echo json_encode(['error' => 'School ID and password are required']);
    exit;
}

// Include database connection
require_once 'db.php';

try {
    // Store password as plaintext
    $stmt = $pdo->prepare("INSERT INTO users (school_id, password) VALUES (?, ?)");
    $stmt->execute([$school_id, $password]);
    
    // Log success
    error_log("Registration successful for user: " . $school_id);
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful'
    ]);
} catch (PDOException $e) {
    // Log the error
    error_log("Database error during registration: " . $e->getMessage());
    
    // Check if it's a duplicate entry error
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['error' => 'School ID already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed. Please try again.']);
    }
}
?> 