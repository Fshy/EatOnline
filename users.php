<?php

include 'lib.php';

if (isset($_POST['username'])){
  $username = $_POST['username'];
  $password = $_POST['password'];
  if (isset($_POST['name'])){ // Registering a new user
    $name = $_POST['name'];
    $email = $_POST['email'];
    $address = $_POST['address'];
    $tel = $_POST['tel'];
    if ($user = regUser($username, $password, $email, $name, $address, $tel, 'customer')){
      $msg = array("status"=>"success", "message"=>"User successfully registered");
      echo json_encode($msg);
    }else{
      $msg = array("status"=>"error", "message"=>"Unable to register user");
      echo json_encode($smg);
    }
  }else{ // We we are trying to authenticate the user
    $user = checkLogin($username, $password);
    if ($user != NULL){
        $msg = array("status"=>"success", "message"=>"Successfully authenticated as $username");
        echo json_encode($msg);
    }else{
      $msg = array("status"=>"error", "message"=>"Incorrect username or password");
      echo(json_encode($msg));
    }
  }
}

if (isset($_GET['logout'])) {
  if (session_destroy()) {
    $msg = array("status"=>"success", "message"=>"Successfully logged out");
    echo(json_encode($msg));
  }else{
    $msg = array("status"=>"error", "message"=>"Could not log out user");
    echo(json_encode($msg));
  }
}

?>
