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
var app = angular.module("eatonline", ['ngRoute', 'ngMaterial', 'ngAnimate']);

app.config(["$routeProvider",function($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl : "views/home.html",
      controller: "homeController"
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

app.controller('homeController', ['$scope', function($scope){
    console.log("Home Controller Executed");
}]);

app.controller("menuController", ["$scope", function($scope){
    console.log("Menu Controller Executed");

    function orderItem (id, name, size, quantity, price) {
      this.id = id;
      this.name = name;
      this.size = size;
      this.quantity = quantity;
      this.price = price;
    }

    var newOrder = [];
    $scope.newOrder = newOrder;

    $.get(base_url+"/menu", function(res){
        $scope.menu = res;
        $scope.$apply();
    }, "json");

    $scope.addToOrder = function(id, name, size, price) {
      swal({
        title: "Add To Order",
        text: "How many of this item would you like?",
        type: "input",
        input: "number",
        showCancelButton: true,
        closeOnConfirm: false,
        confirmButtonColor: "#95AAB5",
        inputPlaceholder: "Quantity"
      },
      function(inputValue){
        if (inputValue === false) return false;
        if (inputValue === "" || inputValue === "0" || $.isNumeric(inputValue)===false) {
          swal.showInputError("Not a valid number for quantity!");
          return false
        }
        $scope.newOrder.push(new orderItem(id, name, size, inputValue, price*inputValue));
        $scope.$apply();
        swal({title:"Success!", text:"Added "+inputValue+" "+name+" ("+size+") to Order: $"+price*inputValue, type:"success", confirmButtonColor: "#95AAB5"});
      });
    };

    $scope.submitOrder = function(order){
      var orderId;
      if (order){
        $.get(base_url+"/placeorder", function(res, orderId){
          if (res.id){
            orderId = res.id;
            for (var i = 0; i < order.length; i++) {
              $.post(base_url+"/placeorder", {orderid:orderId, foodid:order[i].id, quantity:order[i].quantity});
            }
            swal({title:"", text:res.message, type:res.status, confirmButtonColor: "#95AAB5"});
          }
          swal({title:"", text:res.message, type:res.status, confirmButtonColor: "#95AAB5"});
        },"json");
      }
    };

    $scope.delete = function(index, o, parent) {
      $scope.newOrder.splice(index, 1);
      parent.total -= o.price;
    };
}]);

app.controller('orderController', ['$scope', function($scope){
    console.log("Order Controller Executed");

    var orderids = [];
    var singleOrder = [];
    var allOrders = [];
    // $scope.singleOrder = singleOrder;
    $scope.allOrders = allOrders;

    function orderItem (id, name, size, quantity, price) {
      this.id = id;
      this.name = name;
      this.size = size;
      this.quantity = quantity;
      this.price = price;
    }

    function singleOrder (orderid, arrayOfItems) {
      this.id = orderid;
      this.items = arrayOfItems;
    }

    $.get(base_url+"/order", function(res){
      for (var i = 0; i < res.length; i++) {
        orderids.push(res[i].id);
      }
      console.log("orderids: "+orderids);
      orderids.forEach(function(){
        $.get(base_url+"/order/"+orderids, function(res){
          console.log(res);
        }, "json");
      });
    }, "json");
}]);

app.controller('panelController', ['$scope', function($scope){
    console.log("Panel Controller Executed");
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
    $.post(base_url+"/login", $("#loginForm").serialize(), function(res){
        swal({title:"", text: res.message, type: res.status, confirmButtonColor: "#95AAB5", timer: 1200, showConfirmButton: false},
         function(){
           location.reload();
         }
        );
    }, "json");
    return false;
}

function registerUser(){
    $.post(base_url+"/register", $("#registerForm").serialize(), function(res){
        swal({title:"", text: res.message, type: res.status, confirmButtonColor: "#95AAB5", timer: 1200, showConfirmButton: false},
         function(){
           location.reload();
         }
        );
    }, "json");
    return false;
}

function logout(){
  swal({
    title: "",
    text: "Are you sure you want to log out?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#95AAB5",
    confirmButtonText: "Log Out",
    closeOnConfirm: false },
    function(){
      $.get(base_url+"/logout", function(res){
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
