<?php

include 'lib.php';

if (isset($_GET['menu'])) {
  echo(json_encode(getFoodItems()));
}

?>
