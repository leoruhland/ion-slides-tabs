
(function() {
    'use strict';

    angular
    .module('ionic')

    .directive('ionSlidesTabs', ['$timeout', '$compile', '$interval', '$ionicSlideBoxDelegate', '$ionicScrollDelegate', '$ionicGesture', function($timeout, $compile, $interval, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicGesture) {
        return {
            require: "^ionSlides",
            restrict: 'A',
            link: function(scope, element, attrs, parent) {

                var ionicSlideBoxDelegate;
                var ionicScrollDelegate;
                var ionicScrollDelegateID;
                var slideTabs;
                var indicator;
                var slider;
                var tabsBar;
                var options = {
                    "slideTabsScrollable": true
                }

                var init = function () {
                    if(angular.isDefined( attrs.slideTabsScrollable ) && attrs.slideTabsScrollable === "false" ) {
                        options.slideTabsScrollable = false;
                    }
                    var tabItems = '<li ng-repeat="(key, value) in tabs" ng-click="onTabTabbed($event, {{key}})" class="slider-slide-tab" ng-bind-html="value"></li>';
                    if(options.slideTabsScrollable) {
                        ionicScrollDelegateID = "ion-slide-tabs-handle-" + Math.floor((Math.random() * 10000) + 1);
                        tabsBar = angular.element('<ion-scroll delegate-handle="' + ionicScrollDelegateID + '" class="slidingTabs" direction="x" scrollbar-x="false" overflow-scroll="false" has-bouncing="true"><ul>' + tabItems + '</ul> <div class="tab-indicator-wrapper"><div class="tab-indicator"></div></div> </ion-scroll>');
                    } else {
                        tabsBar = angular.element('<div class="slidingTabs"><ul>' + tabItems + '</ul> <div class="tab-indicator-wrapper"><div class="tab-indicator"></div></div> </div>');
                    }
                    slider = angular.element(element);
                    var compiled = $compile(tabsBar);
                    slider.parent().prepend(tabsBar);
                    compiled(scope);
                    indicator = angular.element(tabsBar[0].querySelector(".tab-indicator"));
                    var slideHandle = slider.attr('delegate-handle');
                    var scrollHandle = tabsBar.attr('delegate-handle');

                    if(options.slideTabsScrollable) {
                        ionicScrollDelegate = $ionicScrollDelegate;
                        if (scrollHandle) {
                            ionicScrollDelegate = ionicScrollDelegate.$getByHandle(scrollHandle);
                        }
                    }
                    addEvents();
                    setTabBarWidth();
                    slideToCurrentPosition();
                };

                var addEvents = function() {
                    scope.$on("$ionicSlides.sliderInitialized", function(event, data){
                        ionicSlideBoxDelegate = data.slider;
                        ionicSlideBoxDelegate.on('sliderMove', scope.onSlideMove);
                        ionicSlideBoxDelegate.on('onSlideChangeStart', scope.onSlideChange);
                        angular.element(window).on('resize', scope.onResize);
                    });
                }

                var setTabBarWidth = function() {
                    if( !angular.isDefined(slideTabs) || slideTabs.length == 0 ) {
                        return false;
                    }
                    var tabsList = tabsBar.find("ul");
                    var tabsWidth = 0;
                    angular.forEach(slideTabs, function (currentElement,index) {
                        var currentLi = angular.element(currentElement);
                        tabsWidth += currentLi[0].offsetWidth;
                    });
                    if(options.slideTabsScrollable) {
                        angular.element(tabsBar[0].querySelector(".scroll")).css("width", tabsWidth + 1 + "px");
                    } else {
                        slideTabs.css("width",tabsList[0].offsetWidth / slideTabs.length + "px");
                    }
                    slideToCurrentPosition();
                };

                var addTabTouchAnimation = function(event,currentElement) {
                    var ink = angular.element(currentElement[0].querySelector(".ink"));
                    if( !angular.isDefined(ink) || ink.length == 0 ) {
                        ink = angular.element("<span class='ink'></span>");
                        currentElement.prepend(ink);
                    }
                    ink.removeClass("animate");
                    if(!ink.offsetHeight && !ink.offsetWidth)
                    {

                        var d = Math.max(currentElement[0].offsetWidth, currentElement[0].offsetHeight);
                        ink.css("height", d + "px");
                        ink.css("width", d + "px");
                    }
                    var x = event.offsetX - ink[0].offsetWidth / 2;
                    var y = event.offsetY - ink[0].offsetHeight / 2;
                    ink.css("top", y +'px');
                    ink.css("left", x +'px');
                    ink.addClass("animate");
                }

                var slideToCurrentPosition = function() {
                    if( !angular.isDefined(slideTabs) || slideTabs.length === 0 ) {
                        return false;
                    }
                    var targetSlideIndex = ionicSlideBoxDelegate.activeIndex;
                    var targetTab = angular.element(slideTabs[targetSlideIndex]);
                    var targetLeftOffset = targetTab.prop("offsetLeft");
                    var targetWidth = targetTab[0].offsetWidth;
                    indicator.css({
                        "-webkit-transition-duration": "300ms",
                        "-webkit-transform":"translate(" + targetLeftOffset + "px,0px)",
                        "width": targetWidth + "px"
                    });
                    if (options.slideTabsScrollable && ionicScrollDelegate) {
                        var scrollOffset = Math.round((targetTab.parent().parent().parent()[0].offsetWidth/2) - (targetWidth/2));
                        ionicScrollDelegate.scrollTo(targetLeftOffset - scrollOffset,0,true);
                    }
                    slideTabs.removeClass("tab-active");
                    targetTab.addClass("tab-active");
                };

                var setIndicatorPosition = function (currentSlideIndex, targetSlideIndex, position, slideDirection) {
                    var targetTab = angular.element(slideTabs[targetSlideIndex]);
                    var currentTab = angular.element(slideTabs[currentSlideIndex]);
                    var targetLeftOffset = targetTab.prop("offsetLeft");
                    var currentLeftOffset = currentTab.prop("offsetLeft");
                    var offsetLeftDiff = Math.abs(targetLeftOffset - currentLeftOffset);
                    var slidesCount = ionicSlideBoxDelegate.slides.length;
                    if( currentSlideIndex == 0 && targetSlideIndex == slidesCount - 1 && slideDirection == "right" ||
                    targetSlideIndex == 0 && currentSlideIndex == slidesCount - 1 && slideDirection == "left" ) {
                        return;
                    }
                    var targetWidth = targetTab[0].offsetWidth;
                    var currentWidth = currentTab[0].offsetWidth;
                    var widthDiff = targetWidth - currentWidth;
                    var indicatorPos = 0;
                    var indicatorWidth = 0;
                    if (currentSlideIndex > targetSlideIndex) {
                        indicatorPos = targetLeftOffset - (offsetLeftDiff * (position - 1));
                        indicatorWidth = targetWidth - ((widthDiff * (1 - position)));
                    } else if (targetSlideIndex > currentSlideIndex) {
                        indicatorPos = targetLeftOffset + (offsetLeftDiff * (position - 1));
                        indicatorWidth = targetWidth + ((widthDiff * (position - 1)));
                    }
                    indicator.css({
                        "-webkit-transition-duration":"0ms",
                        "-webkit-transform":"translate(" + indicatorPos + "px,0px)",
                        "width": indicatorWidth + "px"
                    });
                    if (options.slideTabsScrollable && ionicScrollDelegate) {
                        var scrollOffset = Math.round((targetTab.parent().parent().parent()[0].offsetWidth/2) - (targetWidth/2));
                        ionicScrollDelegate.scrollTo(indicatorPos - scrollOffset,0,false);
                    }
                }

                scope.onTabTabbed = function(event, index) {
                    addTabTouchAnimation(event, angular.element(event.currentTarget) );
                    ionicSlideBoxDelegate.slideTo(index);
                    slideToCurrentPosition();
                }

                scope.tabs = [];

                scope.addTabContent = function ($content) {
                    scope.tabs.push($content);
                    scope.$apply();
                    $timeout(function() {
                        slideTabs = angular.element(tabsBar[0].querySelector("ul").querySelectorAll(".slider-slide-tab"));
                        slideToCurrentPosition();
                        setTabBarWidth()
                    })
                }

                scope.onResize = function(){
                    slideToCurrentPosition();
                }

                scope.onSlideChange = function (slideIndex) {
                    slideToCurrentPosition();
                };

                scope.onSlideMove = function () {
                    var scrollDiv = ionicSlideBoxDelegate.slides;
                    var totalSlides = scrollDiv.length;
                    var currentSlideIndex = ionicSlideBoxDelegate.activeIndex;
                    var currentSlide = angular.element(scrollDiv[currentSlideIndex]);
                    var currentSlideLeftOffset = (((ionicSlideBoxDelegate.progress * (totalSlides-1)) - currentSlideIndex) * ionicSlideBoxDelegate.size * -1);
                    var targetSlideIndex = (currentSlideIndex + 1) % scrollDiv.length;
                    if (currentSlideLeftOffset > slider.prop("offsetLeft")) {
                        targetSlideIndex = currentSlideIndex - 1;
                        if (targetSlideIndex < 0) {
                            targetSlideIndex = scrollDiv.length - 1;
                        }
                    }
                    var targetSlide = angular.element(scrollDiv[targetSlideIndex]);
                    var position = currentSlideLeftOffset / slider[0].offsetWidth;
                    var slideDirection = position > 0 ? "right":"left";
                    position = Math.abs(position);
                    setIndicatorPosition(currentSlideIndex, targetSlideIndex, position, slideDirection);
                };

                init();
            },
            controller: ['$scope',function($scope) {
                this.addTab = function($content) {
                    $timeout(function() {
                        if($scope.addTabContent) {
                            $scope.addTabContent($content);
                        }
                    });
                }
            }]
        };
    }])

    .directive('ionSlideTabLabel', [ function() {
        return {
            require: "^ionSlidesTabs",
            link: function ($scope, $element, $attrs, $parent) {
                $parent.addTab($attrs.ionSlideTabLabel);
            }
        }
    }]);

})();
