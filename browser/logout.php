<?php
// Initialize the session
session_start();

// Delete the PHPSESSID from shared memory
$cache = new Memcached();
$cache->addServer("localhost", 11211);
$cache->delete("p_phpsessid-" . session_id());
 
// Unset all of the session variables
$_SESSION = array();

// Destroy the session.
session_unset();
session_destroy();

// Redirect to login page
header("location: login.php");
exit;
?>