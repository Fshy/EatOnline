"use strict";
console.log("[1] Attempting to load main.js");

var base_url = "index.php/api";

$(document).ready(function(){
  console.log("[3] Document loaded successfully");
});

// Angular App
var app = angular.module("eatonline", ['ngRoute', 'ngMaterial', 'ngAnimate', 'ui.unique']);

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

app.controller('homeController', function($scope){
  // Stuff Maybe
});

app.controller("menuController", function($scope, $window){
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
        inputPlaceholder: "Quantity",
        allowOutsideClick: true
      },
      function(inputValue){
        if (inputValue === false) return false;
        if (inputValue === "" || inputValue === "0" || $.isNumeric(inputValue)===false) {
          swal.showInputError("Not a valid number for quantity!");
          return false
        }
        $scope.newOrder.push(new orderItem(id, name, size, inputValue, price*inputValue));
        $scope.$apply();
        swal({title:"Success!", text:"Added "+inputValue+" "+name+" ("+size+") to Order: $"+price*inputValue, type:"success", confirmButtonColor: "#95AAB5", allowOutsideClick: true});
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
            swal({title:"", text:res.message, type:res.status, confirmButtonColor: "#95AAB5", allowOutsideClick: true});
          }
          swal({title:"", text:res.message, type:res.status, confirmButtonColor: "#95AAB5", allowOutsideClick: true},
           function(){
             $window.location.href = '#orders';
           });
        },"json");
      }
    };

    $scope.delete = function(index, o, parent) {
      $scope.newOrder.splice(index, 1);
      parent.total -= o.price;
    };
});

app.controller('orderController', function($scope){
    var orderDetails = []; // Holds array of items for each orderid
    var orderIds = [];
    $scope.orderDetails = orderDetails;
    $scope.orderIds = orderIds;

    $scope.$on('$routeChangeSuccess', function () {
      $.get(base_url+"/myorders", function(res){
        $scope.orderDetails = res;
        $scope.$apply();
        for (var i = 0; i < $scope.orderDetails.length; i++) {
          $scope.orderIds.push($scope.orderDetails[i][0].order_id);
        }
      }, "json");
    });

});

app.controller('panelController', function($route, $scope, $mdDialog){
    var orderDetails = []; // Holds array of items for each orderid
    var orderIds = [];
    $scope.orderDetails = orderDetails;
    $scope.orderIds = orderIds;

    $scope.$on('$routeChangeSuccess', function () {
      $.get(base_url+"/openorders", function(res){
        $scope.orderDetails = res;
        $scope.$apply();
        for (var i = 0; i < $scope.orderDetails.length; i++) {
          $scope.orderIds.push($scope.orderDetails[i][0].order_id);
        }
      }, "json");
    });

    // Handles Dropdown Menus
    var originatorEv;

    $scope.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.orderDeliver = function(order_id){
      swal({
        type: "warning",
        title: "Are you sure?",
        text: "Mark Order #"+order_id+" as delivered?",
        showCancelButton: true,
        closeOnConfirm: false,
        confirmButtonColor: "#95AAB5",
        allowOutsideClick: true
      },
      function(){
        $.post(base_url+"/deliver/"+order_id, function(res){
          swal({title:"", text:res.message, type:res.status, confirmButtonColor: "#95AAB5", allowOutsideClick: true}, function(){
            $route.reload();
          });
        });
      });
      originatorEv = null;
    };

    $scope.orderCancel = function(order_id){
      swal({
        type: "warning",
        title: "Are you sure?",
        text: "Cancel Order #"+order_id+"?",
        showCancelButton: true,
        closeOnConfirm: false,
        confirmButtonColor: "#95AAB5",
        allowOutsideClick: true
      },
      function(){
        $.post(base_url+"/cancel/"+order_id, function(res){
          swal({title:"", text:res.message, type:res.status, confirmButtonColor: "#95AAB5", allowOutsideClick: true}, function(){
            $route.reload();
          });
        });
      });
      originatorEv = null;
    };
});

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
    closeOnConfirm: false,
    allowOutsideClick: true },
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

console.log("[2] main.js loaded successfully");
