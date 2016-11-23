"use strict";
console.log("hello I'm connected to the world");

var base_url = "index.php/api";

$(document).ready(function(){
    console.log("All Elements in the Page was successfully loaded, we can begin our application logic");
    retrieveCountries();
    retrieveProducts();
});

function retrieveCountries(){
    console.log("Attempting to retrieve all countries from the database via AJAX");
    $.get(base_url+ "/countries", processAllCountries, "json"); // When AJAX request is completed successfully, the proccessAllCountries function will be executed with the data as a parameter
}

function processAllCountries(records){
    if ($("#country").length > 0){ // the country select is available so we can display all countries
        records.forEach(function(country){
            var htmlStr = "<option value='"+country.id+"'>"+country.name+"</option>";
            $("#country").append(htmlStr);
        })
    }
}

function retrieveProducts(){
    $.get(base_url + "/products", processAllProducts, "json");
}

function processAllProducts(records){
    console.log(records);
    createTable(records)
}

function createTable(records){
    var key;
    var sec_id = "#table_sec";
    var htmlStr = $("#table_heading").html(); //Includes all the table, thead and tbody declarations

    records.forEach(function(el){
        htmlStr += "<tr>";
        htmlStr += "<td>" + el['name'] + "</td>";
        htmlStr += "<td>" + el['price'] + "</td>";
        htmlStr += "<td>"+ el['country'] +"</td>";
        htmlStr += "<td><button class='btn btn-primary' onclick=\"display("+el.id+")\"><i class='fa fa-eye' aria-hidden='true'></i></button> ";
        htmlStr += "<button class='btn btn-success' onclick=\"addCart("+el.id+")\"><i class='fa fa-cart-plus' aria-hidden='true'></i></button> ";
        htmlStr += "<button class='btn btn-danger' onclick=\"display("+el.id+")\"><i class='fa fa-trash' aria-hidden='true'></i></button></td>";
        htmlStr +=" </tr>" ;
    });

    htmlStr += "</tbody></table>";
    $(sec_id).html(htmlStr);
}

function display(el){
    $.get(base_url + "/products/"+el, displayInfo, "json");
}

function displayInfo(rec){
     swal(rec.name);
}

function displayError(rec){
  swal("My Products", "Error Occurrec", "error");
}

function saveProduct(){
    // #name is the element with id='name'
    var name = $("#name").val(); // .val() will retrieve information stored in the input
    var country = $("#country").val();
    var price = $("#price").val();
    var data = {
        'name' : name,
        'country': country,
        'price' : price
    };
    $.post(base_url + "/products",data, function(res){
        console.log(res);
        if (res.id && res.id > 0)swal("Record", "Record Saved", "success");
        else swal("Record", "Unable to save record", "error");
        retrieveProducts();// Display results
        clearFields(); // Reset Form
    }, "json");
    return false;
}

function clearFields(){
    $("#name").val("");
    $("#country").val(0);
    $("#price").val("");
}

function addCart(productId){
    $("#cart_form").show("slow");
    $.get(base_url + "/products/"+productId, function(product){
        $("#productId").val(product.id);
        $("#productPrice").val(product.price);
        $("#productName").val(product.name);
    }, "json");
}

function saveCartItem(){
    var data = {};
    // data.id = $("#productId").val();
    data.quantity = $("#quantity").val();
    if (data.quantity > 0){
        return true;
    }else{
        swal("Cart", "Must select Value greater than 0", "error");
        return false;
    }
}


// Angular App
var app = angular.module("eatonline", ['ngRoute', 'ngMaterial']);

app.config(["$routeProvider",function($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl : "views/home.html",
      controller: "mainController"
    })
    .when("/menu", {
      templateUrl : "views/menu.html",
      controller: "menuController"
    })
    .when("/orders", {
      templateUrl : "views/orders.html",
      controller: "orderController"
    })
    .when("/panel", {
      templateUrl : "views/panel.html",
      controller: "panelController"
    });
}]);

app.controller('mainController', ['$scope', function($scope){
    console.log("Main Controller Executed");
}]);

app.controller("menuController", ["$scope", function($scope){
    console.log("Menu Controller Executed");
    $.get("menu.php?menu", function(res){
        $scope.menu = res;
        $scope.$apply();
    }, "json");
}]);

app.controller("countryController", ["$scope", function($scope){
    var countryList = [];
    countryList.push({
        "name": "Grenada",
        "population": 109590
    });
    countryList.push({
        "name": "St. Vincent and the Grenadines",
        "population": 109991
    });
    countryList.push({
        "name": "Trinidad and Tobago",
        "population": 1328019
    });

    $scope.list = countryList;

    $scope.save = function(ctry) {
        console.log(ctry);
        $scope.list.push({
            name: ctry.name,
            population: ctry.population
        });
        swal("Save Country", "", "success");
    }
}]);

app.controller('dialogController', function ($scope, $mdDialog) {
  $scope.login = function(event) {
    $mdDialog.show({
      clickOutsideToClose: true,
      scope: $scope,
      preserveScope: true,
      templateUrl: 'views/login.html',
      controller: function DialogController($scope, $mdDialog) {
         $scope.closeDialog = function() {
            $mdDialog.hide();
         }
         $scope.submit = function() {
           $mdDialog.hide();
         }
      }
    });

  };
  $scope.register = function(event) {
    $mdDialog.show({
      clickOutsideToClose: true,
      scope: $scope,
      preserveScope: true,
      templateUrl: 'views/register.html',
      controller: function DialogController($scope, $mdDialog) {
         $scope.closeDialog = function() {
            $mdDialog.hide();
         }
         $scope.submit = function() {
            $mdDialog.hide();
         }
      }
    });
  };
});

function checkLogin(){
    $.post("users.php", $("#loginForm").serialize(), function(res){
        swal({title:"", text: res.message, type: res.status, confirmButtonColor: "#37474f", timer: 1200, showConfirmButton: false},
         function(){
           location.reload();
         }
        );
    }, "json");
    return false;
}

function registerUser(){
    $.post("users.php", $("#registerForm").serialize(), function(res){
        swal({title:"", text: res.message, type: res.status, confirmButtonColor: "#37474f", timer: 1200, showConfirmButton: false},
         function(){
           location.reload();
         }
        );
    }, "json");
    return false;
}

function logout(){
  swal({  title: "",
          text: "Are you sure you want to log out?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#37474f",
          confirmButtonText: "Log Out",
          closeOnConfirm: false },
          function(){
            $.get("users.php?logout", function(res){
                swal({title:"", text: res.message, type: res.status, timer: 1200, showConfirmButton: false},
                 function(){
                   location.reload();
                 }
                );
            }, "json");
            return false;
          });
}

console.log("JavaScript file was successfully loaded in the page");
