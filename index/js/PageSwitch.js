
(function () {

    var PageSwitch = function (containerId, sectionClass) {

        //容器ID
        this.containerId = containerId || 'PageWrap';
        this.sectionClass = sectionClass || 'section';

        //容器
        this.$container = $('#' + this.containerId);
        this.$sections = $('#' + this.containerId + ' .' + this.sectionClass);

        //动画结束，可以滑屏切换
        this.canscroll = true;

        //触摸板BUG
        this.touchBoardMoving = false;

        //当前页号
        this.iNow = 0;

        this.changeMouseWheelEvent();   //自定义滚轮事件

        this.listenTransitionEnd();     //监听动画结束事件

        this.initPagination();      //初始化分页图标

        this.touchMobile();     //手机端触屏操作

        this.keyDown();     //PC端键盘按下操作（上下翻页）

    };

    PageSwitch.prototype = {

        //切换到下一页
        nextPage :function () {

            if (this.iNow < (this.$sections.length - 1)) {

                this.canscroll = false;
                // this.$container.css('top', '-' + ++this.iNow * 100 + '%');
                this.$container.css({'transform' : 'translateY(' + '-' + ++this.iNow * 100 + '%' + ')'});

                //改变页号图标状态
                this.$pages.find('li').eq(this.iNow).addClass('active').siblings().removeClass('active');

            }
        },

        //切换到上一页
        lastPage: function () {

            if (this.iNow) {
                this.canscroll = false;
                // this.$container.css('top', '-' + --this.iNow * 100 + '%');
                this.$container.css({'transform' : 'translateY(' + '-' + --this.iNow * 100 + '%' + ')'});

                //改变页号图标状态
                this.$pages.find('li').eq(this.iNow).addClass('active').siblings().removeClass('active');
            }
        },

        //自定义事件，重新定义鼠标滚轮事件
        changeMouseWheelEvent: function () {

            var self = this;
            $(document).on('mousewheel DOMMouseScroll', function (event) {

                event.preventDefault();
                event = event.originalEvent;

                //滚轮向上滑，还是向下滑
                var value = event.wheelDelta || -event.detail;
                if (self.canscroll && !self.touchBoardMoving) {
                    if (value < 0) {
                        self.nextPage();
                    } else {
                        self.lastPage();
                    }
                }

                //判断是否是是通过滚轮滑动的
                value = Math.abs(value);
                if (value % 120 !== 0 && event.type == 'mousewheel' || value % 3 !== 0 && event.type == 'DOMMouseScroll') {
                    self.touchBoardMoving = true;
                }
            });

        },

        //监听TransitionEnd结束事件
        listenTransitionEnd: function () {

            var self = this;
            self.$container.on('webkitTransitionEnd msTransitionend mozTransitionend transitionend', function () {

                self.canscroll = true;

                //触摸板滑屏bug
                if(self.touchBoardMoving){
                    setTimeout(function () {
                        self.touchBoardMoving = false;
                    }, 1500)
                }

            })
        },

        //初始化分页图标
        initPagination: function () {

            var self = this;
            var pageHtml = '<ul id="pages"><li class="active"></li>';

            for (var i = 1; i < self.$sections.length; i++) {
                pageHtml += '<li></li>';
            }

            pageHtml += '</ul>';
            self.$pages = $(pageHtml);
            $('body').append(self.$pages);
        },

        //支持手机端触摸滑屏
        touchMobile: function () {

            var self = this,
                startY = 0,
                startTime = 0;

            $(document).on('touchstart', function (event) {

                if(event.target.tagName !== 'A'){
                    var touch = event.originalEvent.changedTouches[0];
                    event.preventDefault();
                    startY = touch.pageY;
                    startTime = $.now();
                }
            });

            $(document).on('touchend touchcnel', function (event) {

                if (event.target.tagName !== 'A') {
                    event.preventDefault();
                    var touch = event.originalEvent.changedTouches[0],
                        endTime = $.now(),
                        disY = startY - touch.pageY;

                    //触摸点击松开时间在 300ms内，并且state 可以滑屏
                    if ((endTime - startTime) < 300 && self.canscroll) {

                        //向上滑屏，翻页到下一页
                        if (disY > 50) {
                            if (self.iNow !== self.$sections.length - 1) {
                                self.nextPage();
                            }

                            //向下滑屏， 翻页到上一页
                        } else if (disY < -50) {
                            if (self.iNow) {
                                self.lastPage();
                            }
                        }
                    }
                }
            })

        },

        //支持键盘上下按键翻页
        keyDown: function () {

            var self = this;
            $(document).on('keydown', function (event) {

                if (event.keyCode == 40 && self.canscroll && !self.touchBoardMoving) {
                    self.nextPage();
                } else if (event.keyCode == 38 && self.canscroll && !self.touchBoardMoving) {
                    self.lastPage();
                }
            })
        }

    };

    var pageSwitch = new PageSwitch();
})();
