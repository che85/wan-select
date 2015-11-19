// original sourcecode: https://github.com/feichao/wan-select licensed under MIT

(function() {
  'use strict';

  var app = angular
    .module('fc.wanSelect', [])
    .directive('wanSelect', WanSelect);

  var contains = function(container, contained) {
    var node;
    node = contained.parentNode;
    while (node !== null && node !== container) {
      node = node.parentNode;
    }
    return node !== null;
  };

  app.directive("outsideClick", [
    '$document', '$parse',
    function($document, $parse) {
      return {
        link: function($scope, $element, $attributes) {
          var onDocumentClick, scopeExpression;
          scopeExpression = $attributes.outsideClick;
          onDocumentClick = function(event) {
            if (!contains($element[0], event.target)) {
              $scope.$apply(scopeExpression);
            }
          };
          $document.on("click", onDocumentClick);
          $element.on("$destroy", function() {
            $document.off("click", onDocumentClick);
          });
        }
      };
    }
  ]);

  /**
   * @ngInject
   */
  function WanSelect() {

    var template = [
      '<div class="wan-select" outside-click="vm.hideSelect()">',
      '  <label class="md-static">{{placeholder}}</label>',
      '  <div layout="row" layout-wrap>',
      '    <div flex="50" ng-click="vm.showSelect()">',
      '      <input ng-readonly="true" value="{{vm.result}}" >',
      '    </div>',
      '    <div flex="5" class="showHand" ng-click="vm.showSelect()">',
      '      <ng-md-icon aria-label="Search DICOM Standard" icon="arrow_drop_down" size="32"></ng-md-icon>',
      '    </div>',
      '  </div>',
      '  <div class="ws-content" ng-class="{true: \'ws-content-show\', false: \'ws-content-hide\'}[vm.show]">',
      '    <div class="ws-select-shortcut">',
      '     <div layout="row" layout-wrap>',
      '       <div flex="100">',
      '         <md-button class="md-raised ws-select-button" ng-click="vm.selectAll()">select all</md-button>',
      '         <md-button class="md-raised ws-select-button" ng-click="vm.selectNone()">select none</md-button>',
      '       </div>',
      '     </div>',
      '    </div>',
      '    <hr>',
      '    <div layout="row" class="ws-unselected" layout-wrap>',
      '      <md-checkbox ng-checked="vm.isSelected(item)" ng-click="vm.toggle($event, item)" ng-repeat="item in vm.sourceData">',
      '        {{item.part}}:{{item.name}}',
      '      </md-checkbox>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    return {
      restrict: 'EA',
      scope: {
        sourceData: '=',
        selectedData: '=',
        placeholder: '@'
      },
      template: template,
      controller: Controller,
      controllerAs: 'vm'
    };

    /**
     * @ngInject
     */
    function Controller($scope) {
      var vm = this;

      vm.result = '请选择';

      vm.sourceData = $scope.sourceData
      //vm.searchStr = '';

      //$scope.$watch('vm.searchStr', function(newVal, oldVal) {
      //  search(newVal || '');
      //});

      $scope.$watchCollection('selectedData', function(newVal, oldVal) {
        vm.setSearchResult();
      });

      function search(val) {
        val = val.toUpperCase();
        var tempSelected = $scope.selectedData.map(function(dt) {
          return dt.toUpperCase();
        });
      }

      vm.hideSelect = function() {
        vm.show = false;
      };

      vm.showSelect = function() {
        if(vm.show) {
          vm.show = false;
          return;
        }
        vm.show = true;
        //vm.animate({scrollTop: 0}, "slow");
        //vm.searchStr = '';
      };

      vm.toggle = function(event, item) {
        event.stopPropagation();
        var idx = $scope.selectedData.indexOf(item);
        if (idx == -1) {
          console.log("adding part")
          $scope.selectedData.push(item);
        } else {
          console.log("removing part")
          $scope.selectedData.splice(idx, 1);
        }
        vm.setSearchResult();
      };

      vm.isSelected = function(item) {
        return $scope.selectedData.indexOf(item) != -1;
      };

      vm.setSearchResult = function() {
        var length = $scope.selectedData.length;
        if (length === 0) {
          vm.result = 'None';
        } else if (length === $scope.sourceData.length) {
          vm.result = 'All Parts';
        } else if (length > 3) {
          vm.result = length.toString() + " Parts selected" ;
        } else {
          vm.result = "";
          angular.forEach($scope.selectedData, function(value, key){
            vm.result += value.part + " ";
          });
        }
      };

      vm.selectAll = function() {
        vm.result = 'All Parts';
        $scope.selectedData = [].concat($scope.sourceData);
        //vm.dataUnselected = [];
      };

      vm.selectNone = function() {
        vm.result = 'None';
        $scope.selectedData = [];
      };
    }
  }

})();
