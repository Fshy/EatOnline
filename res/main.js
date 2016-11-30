"use strict";
console.log("[1] Attempting to load main.js");

var base_url = "index.php/api";

$(document).ready(function(){
  console.log("[3] Document loaded successfully");
});

// Angular App
var app = angular.module("eatonline", ['ngRoute', 'ngMaterial', 'ngAnimate', 'ui.unique', 'angular-loading-bar', 'cgBusy']);

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
    })
    .when("/stats", {
      templateUrl : "views/stats.html",
      controller: "statsController"
    });
}]);

app.controller('homeController', function($scope){
  // Stuff Maybe
});

app.controller("menuController", function($scope, $window, $http){
    function orderItem (id, name, size, quantity, price) {
      this.id = id;
      this.name = name;
      this.size = size;
      this.quantity = quantity;
      this.price = price;
    }

    var newOrder = [];
    $scope.newOrder = newOrder;

    $scope.load = $http.get(base_url+"/menu")
      .success(function(res){
        $scope.menu = res;
      });

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

app.controller('orderController', function($scope, $http){
    var orderDetails = []; // Holds array of items for each orderid
    var orderIds = [];
    $scope.orderDetails = orderDetails;
    $scope.orderIds = orderIds;

    $scope.load = $http.get(base_url+"/myorders")
                    .success(function(res){
                      $scope.orderDetails = res;
                      for (var i = 0; i < $scope.orderDetails.length; i++) {
                        $scope.orderIds.push($scope.orderDetails[i][0].order_id);
                      }
                    });

});

app.controller('panelController', function($route, $scope, $http, $mdDialog){
    var orderDetails = []; // Holds array of items for each orderid
    var orderIds = [];
    $scope.orderDetails = orderDetails;
    $scope.orderIds = orderIds;

    $scope.load = $http.get(base_url+"/openorders")
                    .success(function(res){
                      $scope.orderDetails = res;
                      for (var i = 0; i < $scope.orderDetails.length; i++) {
                        $scope.orderIds.push($scope.orderDetails[i][0].order_id);
                      }
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
        $http.post(base_url+"/deliver/"+order_id)
          .success(function(res){
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
        $http.post(base_url+"/cancel/"+order_id)
          .success(function(res){
            swal({title:"", text:res.message, type:res.status, confirmButtonColor: "#95AAB5", allowOutsideClick: true}, function(){
              $route.reload();
            });
          });
      });
      originatorEv = null;
    };
});

app.controller('statsController', function($scope, $http){

  var ctx = $('#popChart');
  var orderStats = []; // Holds array of items for each orderid
  var osName = [];
  var osData = [];
  var osColor = [];

  $scope.load = $http.get(base_url+"/orderstats")
                  .then(function(res){
                    orderStats = res;
                  }).then(function(){
                    for (var i = 0; i < orderStats.data.length; i++) {
                      osName.push(orderStats.data[i].name);
                      osData.push(orderStats.data[i].qtyOrdered);
                      osColor.push('#37474f');
                    }

                    var myChart = new Chart(ctx, {
                      type: 'bar',
                      data: {
                        labels: osName,
                        datasets:[{
                          label: "Popularity  of Food Items",
                          backgroundColor: osColor,
                          borderColor: osColor,
                          borderWidth: 1,
                          data: osData
                      }]
                      },
                      options: {
                        scales: {
                          xAxes: [{
                            barThickness: 75
                          }]
                        }
                      }
                    });
                  });

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
