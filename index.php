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
