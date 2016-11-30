<?php
require 'vendor/autoload.php';
include 'lib.php';

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Slim\Views\Twig as Twig;

$app = new Slim\App();
$container = $app->getContainer();
$container['renderer'] = new Twig("./templates");

// Uses a PHP templating system to display HTML when requested
$app->get('/', function (Request $request, Response $response) {
	return $this->renderer->render($response, "/index.phtml", ['session' => $_SESSION]);
});

$app->post("/api/login", function(Request $request, Response $response){
	$post = $request->getParsedBody();
  $username = $post['username'];
  $password = $post['password'];
  $user = checkLogin($username, $password);
  if ($user != NULL){
    $msg = array("status"=>"success", "message"=>"Successfully authenticated as $username");
		$response = $response->withJson($msg);
		return $response;
  }else{
    $msg = array("status"=>"error", "message"=>"Incorrect username or password");
		$response = $response->withJson($msg);
		return $response;
  }
});

$app->post("/api/register", function(Request $request, Response $response){
	$post = $request->getParsedBody();
	$username = $post['username'];
	$password = $post['password'];
	$name = $post['name'];
  $email = $post['email'];
  $address = $post['address'];
  $tel = $post['tel'];
  if ($user = regUser($username, $password, $email, $name, $address, $tel, 'customer')){
    $msg = array("status"=>"success", "message"=>"User successfully registered");
		$response = $response->withJson($msg);
		return $response;
  }else{
    $msg = array("status"=>"error", "message"=>"Unable to register user");
		$response = $response->withJson($msg);
		return $response;
  }
});

$app->get("/api/placeorder", function(Request $request, Response $response){
	if (isset($_SESSION["userid"])){
    $userid = $_SESSION["userid"];
    $orderid = newOrder($userid);
    $msg = array("status"=>"success", "message"=>"Order Submitted", "id"=>$orderid);
		$response = $response->withJson($msg);
		return $response;
  }else{
    $msg = array("status"=>"error", "message"=>"Please login to place an order");
		$response = $response->withJson($msg);
		return $response;
  }
});

$app->post("/api/placeorder", function(Request $request, Response $response){
	$post = $request->getParsedBody();
  if (isset($_SESSION["userid"])){
    $userid = $_SESSION["userid"];
    $orderid = $post["orderid"];
    // echo json_encode($orderid);
    $foodid = $post["foodid"];
    $quantity = $post["quantity"];
    if ($res = addOrderItem($orderid, $foodid, $quantity)){//success
      $msg = array("status"=>"success", "message"=>"Added to Order");
			$response = $response->withJson($msg);
			return $response;
    }
  }
});

$app->get("/api/logout", function(Request $request, Response $response){
  if (session_destroy()) {
    $msg = array("status"=>"success", "message"=>"Successfully logged out");
		$response = $response->withJson($msg);
		return $response;
  }else{
    $msg = array("status"=>"error", "message"=>"Could not log out user");
		$response = $response->withJson($msg);
		return $response;
  }
});

$app->get("/api/menu", function(Request $request, Response $response){
  $fooditems = getFoodItems();
	$response = $response->withJson($fooditems);
	return $response;
});

$app->get("/api/myorders", function(Request $request, Response $response){
	$userOrders = getOrderDetails($_SESSION["userid"]);
	$response = $response->withJson($userOrders);
	return $response;
});

$app->get("/api/openorders", function(Request $request, Response $response){
	$allOrders = getOpenOrders();
	$response = $response->withJson($allOrders);
	return $response;
});

$app->get("/api/orderstats", function(Request $request, Response $response){
  $stats = getOrdersFrequency();
	$response = $response->withJson($stats);
	return $response;
});

$app->post("/api/deliver/{id}", function(Request $request, Response $response){
	$orderid = $request->getAttribute('id');
	$post = $request->getParsedBody();
  if (isset($_SESSION["role"])){
		if ($_SESSION["role"] == 'employee' || $_SESSION["role"] == 'dev') {
			if ($res = deliverOrder($orderid)){//success
	      $msg = array("status"=>"success", "message"=>"Order #$orderid. marked as delivered");
				$response = $response->withJson($msg);
	    }else {
				$msg = array("status"=>"error", "message"=>"Could not update order");
				$response = $response->withJson($msg);
	    }
		}else{
			$msg = array("status"=>"error", "message"=>"Elevated User Access Required");
			$response = $response->withJson($msg);
		}
  }else {
		$msg = array("status"=>"error", "message"=>"User not logged in");
		$response = $response->withJson($msg);
  }
	return $response;
});

$app->post("/api/cancel/{id}", function(Request $request, Response $response){
	$orderid = $request->getAttribute('id');
	$post = $request->getParsedBody();
  if (isset($_SESSION["role"])){
		if ($_SESSION["role"] == 'employee' || $_SESSION["role"] == 'dev') {
			if ($res = cancelOrder($orderid)){//success
	      $msg = array("status"=>"success", "message"=>"Order #$orderid. has been cancelled");
				$response = $response->withJson($msg);
	    }else {
				$msg = array("status"=>"error", "message"=>"Could not update order");
				$response = $response->withJson($msg);
	    }
		}else{
			$msg = array("status"=>"error", "message"=>"Elevated User Access Required");
			$response = $response->withJson($msg);
		}
  }else {
		$msg = array("status"=>"error", "message"=>"User not logged in");
		$response = $response->withJson($msg);
  }
	return $response;
});

$app->run();
