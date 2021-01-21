<?php

// Initialize the session
session_start();

// Check if the user is logged in, if not then redirect him to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
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

    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div id="container">
      <!--
        Will need this later...
        <div id="online-count-container">
          <span id="online-indicator">&#8226;  </span><span id="online-count"></span>
        </div>
      -->
      <noscript><div id="noscript">This game uses JavaScript.</div></noscript>
      
      <div id="account-bar">
        <div id="note-box">Welcome to Flags</div>
        <div id="player-name"><?php echo $_SESSION["p_name"]; ?></div>
        <a href="logout.php" id="logout-button">Logout</a>
      </div>
      
      <div id="board-container"></div>

      <div id="status-bar">
          <div id="turn-score-container" class="not-playing">
          <div id="whose-turn">...</div>
          <div class="score-box" id="player-0-score-box">
            <div id="player-0-score">0</div> <span class="remaining">0</span>
          </div><!--
        --><div class="score-box" id="player-1-score-box">
            <div id="player-1-score">0</div> <span class="remaining">0</span>
          </div>
        </div>
        <!--<div id="autoplay-indicator">AUTOPLAY ON</div>-->
      </div>
    </div>

    <script>
      const ACCOUNT_KEY = "<?php echo $_SESSION["p_key"]; ?>";
    </script>

    <script type="text/javascript" src="jquery.js"></script>
    <script type="text/javascript" src="config.js"></script>
    <script type="text/javascript" src="flags-canvas.js"></script>
    <script type="text/javascript" src="flags-events.js"></script>
    <script type="text/javascript" src="page.js"></script>
    
  </body>
</html>