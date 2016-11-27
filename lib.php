<?php

session_start();

function getDBConnection(){
	try{
		// $db = new mysqli("localhost","eatonline_user","eE7DHMpuLF5r8J3L","eatonline"); // Dev
		$db = new mysqli("149.56.132.122","fshy","eE7DHMpuLF5r8J3L!","fshy_db", 3306); // Production
		if ($db == null && $db->connect_errno > 0)return null;
		return $db;
	}catch(Exception $e){echo $e;}

}

getDBConnection();

// Generic Function - returns an array of objects from select query
function selectQuery($sql){
  $arr = [];
  $db = getDBConnection();
  if ($db != NULL){ // If we are connected
    $res = $db->query($sql);
    while($row = $res->fetch_assoc()){
      $arr[] = $row;
    }
    $db->close();
  }
  return $arr;
}

// Generic Function - returns id from insertion query or -1 if unsuccessful
function insertQuery($sql){
	$db = getDBConnection();
	$id = -1;
	if ($db != null){ // If we are connected
		$res = $db->query($sql);
		if ($res && $db->insert_id > 0){
			$id = $db->insert_id;
		}
		$db->close();
	}
	return $id;
}

// Return all user records
function getUsers(){
  $sql = "SELECT * FROM users;";
  return selectQuery($sql);
}

// Returns each food item on the menu
function getFoodItems(){
	$sql = "SELECT * FROM food_items;";
	return selectQuery($sql);
}

// Given name of food item return the options for size and price
function getFoodDetails($name){
	$sql = "SELECT `size`, `price` FROM `food_items` WHERE `name`='$name';";
	return selectQuery($sql);
}

// Gets id for a customer's open order
function getOrderId($customerid){
	$sql = "SELECT id FROM orders WHERE customer_id=$customerid AND status='open';";
	return selectQuery($sql);
}

// Gets details for a given order
function getOrderDetails($customerid){
	$res = getOrderId($customerid);
	$orders = [];
	foreach ($res as $orderid) {
		$oID = $orderid["id"];
		$sql = "SELECT i.order_id, f.name, i.quantity, f.size, f.price AS itemprice, f.price*i.quantity as totalprice FROM food_items f, order_items i, orders o WHERE i.order_id='$oID' AND i.order_id=o.id AND i.food_items_id=f.id;";
		$orders[] = selectQuery($sql);
	}
	return $orders;
}

// Gets details for a given order
function getOpenOrders(){
	$sql = "SELECT id FROM orders WHERE status='open';";
	$openOrdersId = selectQuery($sql);
	$orders = [];
	foreach ($openOrdersId as $orderid) {
		$oID = $orderid["id"];
		$sql = "SELECT i.order_id, o.date_created AS time, u.name AS custName, u.address, u.tel, f.name, i.quantity, f.size, f.price AS itemprice, f.price*i.quantity as totalprice FROM food_items f, order_items i, orders o, users u WHERE i.order_id='$oID' AND o.customer_id=u.id AND i.order_id=o.id AND i.food_items_id=f.id;";
		$orders[] = selectQuery($sql);
	}
	return $orders;
}

// Create a new order for a given user
function newOrder($userid){
	$sql = "INSERT INTO `orders` (`customer_id`, `status`) VALUES ('$userid', 'open');";
	return insertQuery($sql);
}

// Add a menu item to a customer's order
function addOrderItem($orderid, $foodid, $quantity){
	$sql = "INSERT INTO `order_items` (`order_id`, `food_items_id`, `quantity`) VALUES ('$orderid', '$foodid', '$quantity');";
	return insertQuery($sql);
}

// Check Login Credentials
function checkLogin($username, $password){
    $password = sha1($password);
    $sql = "SELECT * FROM users where username='$username'";
    $db = getDBConnection();
    if ($db != NULL){
        $res = $db->query($sql);
        if($res && $row = $res->fetch_assoc()) // If the result is value and we retrieved a record
            if ($row['password'] == $password){
							$_SESSION['userid'] = $row['id'];
							$_SESSION['username'] = $row['username'];
							$_SESSION['role'] = $row['role'];
							return $row;
						}
    }
    return NULL;
}

// Register a new user
function regUser($username, $password, $email, $name, $address, $tel, $role){
    $password = sha1($password);
    $sql = "INSERT users(`username`, `password`, `email`, `name`, `address`, `tel`, `role`) VALUES ('$username', '$password', '$email', '$name', '$address', '$tel', '$role')";
    try{
        $db = getDBConnection();
        if ($db != NULL) { // If we are connected
            $db->query($sql);
            $id = $db->insert_id;
            $db->close();
            if ($id > 0){
							$_SESSION['userid'] = $id;
							$_SESSION['username'] = $username;
							$_SESSION['role'] = $role;
							return TRUE;
						}
        }
    }catch (Exception $e) {}
    return FALSE;
}
