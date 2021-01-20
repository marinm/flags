<?php
// Initialize the session
session_start();
 
// Check if the user is already logged in, if yes then redirect him to welcome page
if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true){
    header("location: play.php");
    exit;
}

// Include config file
require_once "config.php";

// This error will be displayed to the player
$p_key_err = "";

// Processing form data when form is submitted
if($_SERVER["REQUEST_METHOD"] == "POST") {

    // Remove all single spaces
    $p_key = str_replace(' ', '', $_POST["p_key"]);

    // Check that it looks like an account key
    $p_key_pattern = "/[A-Z0-9]{16}/";
    $match = preg_match($p_key_pattern, $p_key);
    if ($match != 1) {
        $p_key_err = "That's not a valid account key.";
    }

    // Validate credentials
    if (empty($p_key_err)) {
        // Prepare a select statement
        $sql = "SELECT p_id, p_name FROM players WHERE p_key = ?";
        
        if ($stmt = mysqli_prepare($link, $sql)){

            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "s", $param_p_key);
            
            // Set parameters
            $param_p_key = $p_key;
            
            // Attempt to execute the prepared statement
            if (mysqli_stmt_execute($stmt)){
                // Store result
                mysqli_stmt_store_result($stmt);
                
                // Check if username exists, if yes then verify password
                if (mysqli_stmt_num_rows($stmt) == 1) {

                    // Bind result variables
                    mysqli_stmt_bind_result($stmt, $p_id, $p_name);
                    
                    if(mysqli_stmt_fetch($stmt)) {
                        // Key is valid, so start a new session
                        session_start();

                        // Store data in session variables
                        $_SESSION["loggedin"] = true;
                        $_SESSION["p_id"] = $p_id;
                        $_SESSION["p_name"] = $p_name;
                        $_SESSION["p_key"] = $p_key;
                        
                        $note = "Logged in!";

                        // Redirect user to welcome page
                        header("location: play.php");
                    }
                    else {
                        $p_key_err = "Oops! Something went wrong. Please try again later.";
                    }
                } else {
                    // Display an error message if username doesn't exist
                    $p_key_err = "That account key is not valid.";
                }
            } else {
                $p_key_err = "Oops! Something went wrong. Please try again later.";
            }

            // Close statement
            mysqli_stmt_close($stmt);
        }
        else {
            $p_key_err = "Oops! Something went wrong. Please try again later.";
        }
    }

    // Close connection
    mysqli_close($link);
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Flags</title>
        <meta charset="UTF-8">
        <meta name="description" content="Flags">
        <meta name="keywords" content="Flags, Game">
        <meta name="author" content="Marin Mema">
    </head>
    <style type="text/css">
    body {
      background-color: #feecd6;
      font-family: sans-serif;
    }
    #container {
        display: table;
        width: 25em;
        margin: 5em auto 0 auto;
        border: 3px solid #f6d084;
        box-shadow: 0 0 0 3px #964d0c;
        border-radius: 6px;
        background-color: #ffffff;
        padding: 10px;
        font-size: 14pt;
        box-sizing: border-box;
    }
    #account-key {
        display: table-cell;
        width: 69%;
        padding: 0.4em;
        outline: none;
        border-radius: 6px;
        border: 3px solid #d4822b;
        box-sizing: border-box;
        font-size: 14pt;
        margin-right: 1%;
        color: #555555;
    }
    #login-button {
        display: table-cell;
        width: 30%;
        padding: 0.4em;
        outline: none;
        border-radius: 6px;
        border: 3px solid #476b1b;
        background-image: linear-gradient(#96dc42, #8bd839);
        box-sizing: border-box;
        font-size: 14pt;
        font-weight: bold;
        color: #000000;
    }
    #error-note {
        background-color: #fed873;
        width: 20em;
        display: block;
        margin: 1em auto 0 auto;
        border-radius: 8px;
        padding: 0.5em;
        font-size: 12pt;
        text-align: center;
        font-weight: bold;
        color: #8c480e;
    }
    </style>
    <body>
        <div id="container">
            <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" autocomplete="off">
            <input type="text" id="account-key" name="p_key" placeholder="Account Key"></input><!--
            --><input type="submit" id="login-button" value="Login"></input>
            </form>
        </div>
        <?php if (empty($p_key_err)) echo "<!--"; ?>
        <div id="error-note"><?php echo $p_key_err; ?></div>
        <?php if (empty($p_key_err)) echo "-->"; ?>
    </body>
</html>