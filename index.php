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
  $username = $_POST['username'];
  $password = $_POST['password'];
  $user = checkLogin($username, $password);
  if ($user != NULL){
      $msg = array("status"=>"success", "message"=>"Successfully authenticated as $username");
      echo json_encode($msg);
  }else{
    $msg = array("status"=>"error", "message"=>"Incorrect username or password");
    echo(json_encode($msg));
  }
});

$app->post("/api/register", function(Request $request, Response $response){
	$username = $_POST['username'];
	$password = $_POST['password'];
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
});

$app->get("/api/placeorder", function(Request $request, Response $response){
	if (isset($_SESSION["userid"])){
    $userid = $_SESSION["userid"];
    $orderid = newOrder($userid);
    $msg = array("status"=>"success", "message"=>"Order Submitted", "id"=>$orderid);
    echo json_encode($msg);
  }else{
    $msg = array("status"=>"error", "message"=>"Please login to place an order");
    echo json_encode($msg);
  }
});

$app->post("/api/placeorder", function(Request $request, Response $response){
  if (isset($_SESSION["userid"])){
    $userid = $_SESSION["userid"];
    $orderid = $_POST["orderid"];
    echo json_encode($orderid);
    $foodid = $_POST["foodid"];
    $quantity = $_POST["quantity"];
    if ($res = addOrderItem($orderid, $foodid, $quantity)){//success
      $msg = array("status"=>"success", "message"=>"Added to Order");
      echo json_encode($msg);
    }
  }
});

$app->get("/api/logout", function(Request $request, Response $response){
  if (session_destroy()) {
    $msg = array("status"=>"success", "message"=>"Successfully logged out");
    echo(json_encode($msg));
  }else{
    $msg = array("status"=>"error", "message"=>"Could not log out user");
    echo(json_encode($msg));
  }
});

$app->get("/api/menu", function(Request $request, Response $response){
  echo(json_encode(getFoodItems()));
});

$app->get("/api/order", function(Request $request, Response $response){
  echo(json_encode(getOrderDetails($_SESSION["userid"])));
});

// $app->get("/api/order/{id}", function(Request $request, Response $response){
// 	$orderid = $request->getAttribute('id');
//   echo(json_encode(getOrderDetails($orderid)));
// });

$app->get("/api/countries", function(Request $request, Response $response){
	$countries = getAllCountries();

	$response = $response->withJson($countries);
	return $response;
});

$app->get("/api/products", function(Request $request, Response $response){
	$products = getAllProducts();

	$response = $response->withJson($products);
	return $response;
});


$app->get("/api/products/{id}", function(Request $request, Response $response){
	$val = $request->getAttribute('id');
	// Get Record for Specific Country
	$rec = getProduct($val);
	if ($rec != null)
		$response = $response->withJson($rec);
	else
		$response = $response->withStatus(404);
	return $response;
});



$app->post("/api/products", function(Request $request, Response $response){
	$post = $request->getParsedBody();
	$name = $post['name'];
	$price = $post['price'];
	$countryId = $post['country'];
	// print "Name: $name, Price:$price, Country: $countryId";
	$res = saveProduct($name, $price, $countryId);
	// print ($res);
	if ($res > 0){
		$response = $response->withStatus(201);
		$response = $response->withJson(array( "id" => $res));
	} else {
		$response = $response->withStatus(400);
	}
	return $response;
});

$app->run();
