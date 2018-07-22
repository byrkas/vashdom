/*! jQuery UI - v1.12.1 - 2016-09-14
 * http://jqueryui.com
 * Includes: widget.js, position.js, data.js, disable-selection.js, effect.js, effects/effect-blind.js, effects/effect-bounce.js, effects/effect-clip.js, effects/effect-drop.js, effects/effect-explode.js, effects/effect-fade.js, effects/effect-fold.js, effects/effect-highlight.js, effects/effect-puff.js, effects/effect-pulsate.js, effects/effect-scale.js, effects/effect-shake.js, effects/effect-size.js, effects/effect-slide.js, effects/effect-transfer.js, focusable.js, form-reset-mixin.js, jquery-1-7.js, keycode.js, labels.js, scroll-parent.js, tabbable.js, unique-id.js, widgets/accordion.js, widgets/autocomplete.js, widgets/button.js, widgets/checkboxradio.js, widgets/controlgroup.js, widgets/datepicker.js, widgets/dialog.js, widgets/draggable.js, widgets/droppable.js, widgets/menu.js, widgets/mouse.js, widgets/progressbar.js, widgets/resizable.js, widgets/selectable.js, widgets/selectmenu.js, widgets/slider.js, widgets/sortable.js, widgets/spinner.js, widgets/tabs.js, widgets/tooltip.js
 * Copyright jQuery Foundation and other contributors; Licensed MIT */
(function(factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    $.ui = $.ui || {};
    var version = $.ui.version = "1.12.1";
    /*!
     * jQuery UI Widget 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var widgetUuid = 0;
    var widgetSlice = Array.prototype.slice;
    $.cleanData = (function(orig) {
        return function(elems) {
            var events, elem, i;
            for (i = 0;
                (elem = elems[i]) != null; i++) {
                try {
                    events = $._data(elem, "events");
                    if (events && events.remove) {
                        $(elem).triggerHandler("remove");
                    }
                } catch (e) {}
            }
            orig(elems);
        };
    })($.cleanData);
    $.widget = function(name, base, prototype) {
        var existingConstructor, constructor, basePrototype;
        var proxiedPrototype = {};
        var namespace = name.split(".")[0];
        name = name.split(".")[1];
        var fullName = namespace + "-" + name;
        if (!prototype) {
            prototype = base;
            base = $.Widget;
        }
        if ($.isArray(prototype)) {
            prototype = $.extend.apply(null, [{}].concat(prototype));
        }
        $.expr[":"][fullName.toLowerCase()] = function(elem) {
            return !!$.data(elem, fullName);
        };
        $[namespace] = $[namespace] || {};
        existingConstructor = $[namespace][name];
        constructor = $[namespace][name] = function(options, element) {
            if (!this._createWidget) {
                return new constructor(options, element);
            }
            if (arguments.length) {
                this._createWidget(options, element);
            }
        };
        $.extend(constructor, existingConstructor, {
            version: prototype.version,
            _proto: $.extend({}, prototype),
            _childConstructors: []
        });
        basePrototype = new base();
        basePrototype.options = $.widget.extend({}, basePrototype.options);
        $.each(prototype, function(prop, value) {
            if (!$.isFunction(value)) {
                proxiedPrototype[prop] = value;
                return;
            }
            proxiedPrototype[prop] = (function() {
                function _super() {
                    return base.prototype[prop].apply(this, arguments);
                }

                function _superApply(args) {
                    return base.prototype[prop].apply(this, args);
                }
                return function() {
                    var __super = this._super;
                    var __superApply = this._superApply;
                    var returnValue;
                    this._super = _super;
                    this._superApply = _superApply;
                    returnValue = value.apply(this, arguments);
                    this._super = __super;
                    this._superApply = __superApply;
                    return returnValue;
                };
            })();
        });
        constructor.prototype = $.widget.extend(basePrototype, {
            widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
        }, proxiedPrototype, {
            constructor: constructor,
            namespace: namespace,
            widgetName: name,
            widgetFullName: fullName
        });
        if (existingConstructor) {
            $.each(existingConstructor._childConstructors, function(i, child) {
                var childPrototype = child.prototype;
                $.widget(childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto);
            });
            delete existingConstructor._childConstructors;
        } else {
            base._childConstructors.push(constructor);
        }
        $.widget.bridge(name, constructor);
        return constructor;
    };
    $.widget.extend = function(target) {
        var input = widgetSlice.call(arguments, 1);
        var inputIndex = 0;
        var inputLength = input.length;
        var key;
        var value;
        for (; inputIndex < inputLength; inputIndex++) {
            for (key in input[inputIndex]) {
                value = input[inputIndex][key];
                if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
                    if ($.isPlainObject(value)) {
                        target[key] = $.isPlainObject(target[key]) ? $.widget.extend({}, target[key], value) : $.widget.extend({}, value);
                    } else {
                        target[key] = value;
                    }
                }
            }
        }
        return target;
    };
    $.widget.bridge = function(name, object) {
        var fullName = object.prototype.widgetFullName || name;
        $.fn[name] = function(options) {
            var isMethodCall = typeof options === "string";
            var args = widgetSlice.call(arguments, 1);
            var returnValue = this;
            if (isMethodCall) {
                if (!this.length && options === "instance") {
                    returnValue = undefined;
                } else {
                    this.each(function() {
                        var methodValue;
                        var instance = $.data(this, fullName);
                        if (options === "instance") {
                            returnValue = instance;
                            return false;
                        }
                        if (!instance) {
                            return $.error("cannot call methods on " + name + " prior to initialization; " + "attempted to call method '" + options + "'");
                        }
                        if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                            return $.error("no such method '" + options + "' for " + name + " widget instance");
                        }
                        methodValue = instance[options].apply(instance, args);
                        if (methodValue !== instance && methodValue !== undefined) {
                            returnValue = methodValue && methodValue.jquery ? returnValue.pushStack(methodValue.get()) : methodValue;
                            return false;
                        }
                    });
                }
            } else {
                if (args.length) {
                    options = $.widget.extend.apply(null, [options].concat(args));
                }
                this.each(function() {
                    var instance = $.data(this, fullName);
                    if (instance) {
                        instance.option(options || {});
                        if (instance._init) {
                            instance._init();
                        }
                    } else {
                        $.data(this, fullName, new object(options, this));
                    }
                });
            }
            return returnValue;
        };
    };
    $.Widget = function() {};
    $.Widget._childConstructors = [];
    $.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        defaultElement: "<div>",
        options: {
            classes: {},
            disabled: false,
            create: null
        },
        _createWidget: function(options, element) {
            element = $(element || this.defaultElement || this)[0];
            this.element = $(element);
            this.uuid = widgetUuid++;
            this.eventNamespace = "." + this.widgetName + this.uuid;
            this.bindings = $();
            this.hoverable = $();
            this.focusable = $();
            this.classesElementLookup = {};
            if (element !== this) {
                $.data(element, this.widgetFullName, this);
                this._on(true, this.element, {
                    remove: function(event) {
                        if (event.target === element) {
                            this.destroy();
                        }
                    }
                });
                this.document = $(element.style ? element.ownerDocument : element.document || element);
                this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
            }
            this.options = $.widget.extend({}, this.options, this._getCreateOptions(), options);
            this._create();
            if (this.options.disabled) {
                this._setOptionDisabled(this.options.disabled);
            }
            this._trigger("create", null, this._getCreateEventData());
            this._init();
        },
        _getCreateOptions: function() {
            return {};
        },
        _getCreateEventData: $.noop,
        _create: $.noop,
        _init: $.noop,
        destroy: function() {
            var that = this;
            this._destroy();
            $.each(this.classesElementLookup, function(key, value) {
                that._removeClass(value, key);
            });
            this.element.off(this.eventNamespace).removeData(this.widgetFullName);
            this.widget().off(this.eventNamespace).removeAttr("aria-disabled");
            this.bindings.off(this.eventNamespace);
        },
        _destroy: $.noop,
        widget: function() {
            return this.element;
        },
        option: function(key, value) {
            var options = key;
            var parts;
            var curOption;
            var i;
            if (arguments.length === 0) {
                return $.widget.extend({}, this.options);
            }
            if (typeof key === "string") {
                options = {};
                parts = key.split(".");
                key = parts.shift();
                if (parts.length) {
                    curOption = options[key] = $.widget.extend({}, this.options[key]);
                    for (i = 0; i < parts.length - 1; i++) {
                        curOption[parts[i]] = curOption[parts[i]] || {};
                        curOption = curOption[parts[i]];
                    }
                    key = parts.pop();
                    if (arguments.length === 1) {
                        return curOption[key] === undefined ? null : curOption[key];
                    }
                    curOption[key] = value;
                } else {
                    if (arguments.length === 1) {
                        return this.options[key] === undefined ? null : this.options[key];
                    }
                    options[key] = value;
                }
            }
            this._setOptions(options);
            return this;
        },
        _setOptions: function(options) {
            var key;
            for (key in options) {
                this._setOption(key, options[key]);
            }
            return this;
        },
        _setOption: function(key, value) {
            if (key === "classes") {
                this._setOptionClasses(value);
            }
            this.options[key] = value;
            if (key === "disabled") {
                this._setOptionDisabled(value);
            }
            return this;
        },
        _setOptionClasses: function(value) {
            var classKey, elements, currentElements;
            for (classKey in value) {
                currentElements = this.classesElementLookup[classKey];
                if (value[classKey] === this.options.classes[classKey] || !currentElements || !currentElements.length) {
                    continue;
                }
                elements = $(currentElements.get());
                this._removeClass(currentElements, classKey);
                elements.addClass(this._classes({
                    element: elements,
                    keys: classKey,
                    classes: value,
                    add: true
                }));
            }
        },
        _setOptionDisabled: function(value) {
            this._toggleClass(this.widget(), this.widgetFullName + "-disabled", null, !!value);
            if (value) {
                this._removeClass(this.hoverable, null, "ui-state-hover");
                this._removeClass(this.focusable, null, "ui-state-focus");
            }
        },
        enable: function() {
            return this._setOptions({
                disabled: false
            });
        },
        disable: function() {
            return this._setOptions({
                disabled: true
            });
        },
        _classes: function(options) {
            var full = [];
            var that = this;
            options = $.extend({
                element: this.element,
                classes: this.options.classes || {}
            }, options);

            function processClassString(classes, checkOption) {
                var current, i;
                for (i = 0; i < classes.length; i++) {
                    current = that.classesElementLookup[classes[i]] || $();
                    if (options.add) {
                        current = $($.unique(current.get().concat(options.element.get())));
                    } else {
                        current = $(current.not(options.element).get());
                    }
                    that.classesElementLookup[classes[i]] = current;
                    full.push(classes[i]);
                    if (checkOption && options.classes[classes[i]]) {
                        full.push(options.classes[classes[i]]);
                    }
                }
            }
            this._on(options.element, {
                "remove": "_untrackClassesElement"
            });
            if (options.keys) {
                processClassString(options.keys.match(/\S+/g) || [], true);
            }
            if (options.extra) {
                processClassString(options.extra.match(/\S+/g) || []);
            }
            return full.join(" ");
        },
        _untrackClassesElement: function(event) {
            var that = this;
            $.each(that.classesElementLookup, function(key, value) {
                if ($.inArray(event.target, value) !== -1) {
                    that.classesElementLookup[key] = $(value.not(event.target).get());
                }
            });
        },
        _removeClass: function(element, keys, extra) {
            return this._toggleClass(element, keys, extra, false);
        },
        _addClass: function(element, keys, extra) {
            return this._toggleClass(element, keys, extra, true);
        },
        _toggleClass: function(element, keys, extra, add) {
            add = (typeof add === "boolean") ? add : extra;
            var shift = (typeof element === "string" || element === null),
                options = {
                    extra: shift ? keys : extra,
                    keys: shift ? element : keys,
                    element: shift ? this.element : element,
                    add: add
                };
            options.element.toggleClass(this._classes(options), add);
            return this;
        },
        _on: function(suppressDisabledCheck, element, handlers) {
            var delegateElement;
            var instance = this;
            if (typeof suppressDisabledCheck !== "boolean") {
                handlers = element;
                element = suppressDisabledCheck;
                suppressDisabledCheck = false;
            }
            if (!handlers) {
                handlers = element;
                element = this.element;
                delegateElement = this.widget();
            } else {
                element = delegateElement = $(element);
                this.bindings = this.bindings.add(element);
            }
            $.each(handlers, function(event, handler) {
                function handlerProxy() {
                    if (!suppressDisabledCheck && (instance.options.disabled === true || $(this).hasClass("ui-state-disabled"))) {
                        return;
                    }
                    return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);
                }
                if (typeof handler !== "string") {
                    handlerProxy.guid = handler.guid = handler.guid || handlerProxy.guid || $.guid++;
                }
                var match = event.match(/^([\w:-]*)\s*(.*)$/);
                var eventName = match[1] + instance.eventNamespace;
                var selector = match[2];
                if (selector) {
                    delegateElement.on(eventName, selector, handlerProxy);
                } else {
                    element.on(eventName, handlerProxy);
                }
            });
        },
        _off: function(element, eventName) {
            eventName = (eventName || "").split(" ").join(this.eventNamespace + " ") +
                this.eventNamespace;
            element.off(eventName).off(eventName);
            this.bindings = $(this.bindings.not(element).get());
            this.focusable = $(this.focusable.not(element).get());
            this.hoverable = $(this.hoverable.not(element).get());
        },
        _delay: function(handler, delay) {
            function handlerProxy() {
                return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);
            }
            var instance = this;
            return setTimeout(handlerProxy, delay || 0);
        },
        _hoverable: function(element) {
            this.hoverable = this.hoverable.add(element);
            this._on(element, {
                mouseenter: function(event) {
                    this._addClass($(event.currentTarget), null, "ui-state-hover");
                },
                mouseleave: function(event) {
                    this._removeClass($(event.currentTarget), null, "ui-state-hover");
                }
            });
        },
        _focusable: function(element) {
            this.focusable = this.focusable.add(element);
            this._on(element, {
                focusin: function(event) {
                    this._addClass($(event.currentTarget), null, "ui-state-focus");
                },
                focusout: function(event) {
                    this._removeClass($(event.currentTarget), null, "ui-state-focus");
                }
            });
        },
        _trigger: function(type, event, data) {
            var prop, orig;
            var callback = this.options[type];
            data = data || {};
            event = $.Event(event);
            event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase();
            event.target = this.element[0];
            orig = event.originalEvent;
            if (orig) {
                for (prop in orig) {
                    if (!(prop in event)) {
                        event[prop] = orig[prop];
                    }
                }
            }
            this.element.trigger(event, data);
            return !($.isFunction(callback) && callback.apply(this.element[0], [event].concat(data)) === false || event.isDefaultPrevented());
        }
    };
    $.each({
        show: "fadeIn",
        hide: "fadeOut"
    }, function(method, defaultEffect) {
        $.Widget.prototype["_" + method] = function(element, options, callback) {
            if (typeof options === "string") {
                options = {
                    effect: options
                };
            }
            var hasOptions;
            var effectName = !options ? method : options === true || typeof options === "number" ? defaultEffect : options.effect || defaultEffect;
            options = options || {};
            if (typeof options === "number") {
                options = {
                    duration: options
                };
            }
            hasOptions = !$.isEmptyObject(options);
            options.complete = callback;
            if (options.delay) {
                element.delay(options.delay);
            }
            if (hasOptions && $.effects && $.effects.effect[effectName]) {
                element[method](options);
            } else if (effectName !== method && element[effectName]) {
                element[effectName](options.duration, options.easing, callback);
            } else {
                element.queue(function(next) {
                    $(this)[method]();
                    if (callback) {
                        callback.call(element[0]);
                    }
                    next();
                });
            }
        };
    });
    var widget = $.widget;
    /*!
     * jQuery UI Position 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * http://api.jqueryui.com/position/
     */
    (function() {
        var cachedScrollbarWidth, max = Math.max,
            abs = Math.abs,
            rhorizontal = /left|center|right/,
            rvertical = /top|center|bottom/,
            roffset = /[\+\-]\d+(\.[\d]+)?%?/,
            rposition = /^\w+/,
            rpercent = /%$/,
            _position = $.fn.position;

        function getOffsets(offsets, width, height) {
            return [parseFloat(offsets[0]) * (rpercent.test(offsets[0]) ? width / 100 : 1), parseFloat(offsets[1]) * (rpercent.test(offsets[1]) ? height / 100 : 1)];
        }

        function parseCss(element, property) {
            return parseInt($.css(element, property), 10) || 0;
        }

        function getDimensions(elem) {
            var raw = elem[0];
            if (raw.nodeType === 9) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: {
                        top: 0,
                        left: 0
                    }
                };
            }
            if ($.isWindow(raw)) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: {
                        top: elem.scrollTop(),
                        left: elem.scrollLeft()
                    }
                };
            }
            if (raw.preventDefault) {
                return {
                    width: 0,
                    height: 0,
                    offset: {
                        top: raw.pageY,
                        left: raw.pageX
                    }
                };
            }
            return {
                width: elem.outerWidth(),
                height: elem.outerHeight(),
                offset: elem.offset()
            };
        }
        $.position = {
            scrollbarWidth: function() {
                if (cachedScrollbarWidth !== undefined) {
                    return cachedScrollbarWidth;
                }
                var w1, w2, div = $("<div " + "style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" + "<div style='height:100px;width:auto;'></div></div>"),
                    innerDiv = div.children()[0];
                $("body").append(div);
                w1 = innerDiv.offsetWidth;
                div.css("overflow", "scroll");
                w2 = innerDiv.offsetWidth;
                if (w1 === w2) {
                    w2 = div[0].clientWidth;
                }
                div.remove();
                return (cachedScrollbarWidth = w1 - w2);
            },
            getScrollInfo: function(within) {
                var overflowX = within.isWindow || within.isDocument ? "" : within.element.css("overflow-x"),
                    overflowY = within.isWindow || within.isDocument ? "" : within.element.css("overflow-y"),
                    hasOverflowX = overflowX === "scroll" || (overflowX === "auto" && within.width < within.element[0].scrollWidth),
                    hasOverflowY = overflowY === "scroll" || (overflowY === "auto" && within.height < within.element[0].scrollHeight);
                return {
                    width: hasOverflowY ? $.position.scrollbarWidth() : 0,
                    height: hasOverflowX ? $.position.scrollbarWidth() : 0
                };
            },
            getWithinInfo: function(element) {
                var withinElement = $(element || window),
                    isWindow = $.isWindow(withinElement[0]),
                    isDocument = !!withinElement[0] && withinElement[0].nodeType === 9,
                    hasOffset = !isWindow && !isDocument;
                return {
                    element: withinElement,
                    isWindow: isWindow,
                    isDocument: isDocument,
                    offset: hasOffset ? $(element).offset() : {
                        left: 0,
                        top: 0
                    },
                    scrollLeft: withinElement.scrollLeft(),
                    scrollTop: withinElement.scrollTop(),
                    width: withinElement.outerWidth(),
                    height: withinElement.outerHeight()
                };
            }
        };
        $.fn.position = function(options) {
            if (!options || !options.of) {
                return _position.apply(this, arguments);
            }
            options = $.extend({}, options);
            var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions, target = $(options.of),
                within = $.position.getWithinInfo(options.within),
                scrollInfo = $.position.getScrollInfo(within),
                collision = (options.collision || "flip").split(" "),
                offsets = {};
            dimensions = getDimensions(target);
            if (target[0].preventDefault) {
                options.at = "left top";
            }
            targetWidth = dimensions.width;
            targetHeight = dimensions.height;
            targetOffset = dimensions.offset;
            basePosition = $.extend({}, targetOffset);
            $.each(["my", "at"], function() {
                var pos = (options[this] || "").split(" "),
                    horizontalOffset, verticalOffset;
                if (pos.length === 1) {
                    pos = rhorizontal.test(pos[0]) ? pos.concat(["center"]) : rvertical.test(pos[0]) ? ["center"].concat(pos) : ["center", "center"];
                }
                pos[0] = rhorizontal.test(pos[0]) ? pos[0] : "center";
                pos[1] = rvertical.test(pos[1]) ? pos[1] : "center";
                horizontalOffset = roffset.exec(pos[0]);
                verticalOffset = roffset.exec(pos[1]);
                offsets[this] = [horizontalOffset ? horizontalOffset[0] : 0, verticalOffset ? verticalOffset[0] : 0];
                options[this] = [rposition.exec(pos[0])[0], rposition.exec(pos[1])[0]];
            });
            if (collision.length === 1) {
                collision[1] = collision[0];
            }
            if (options.at[0] === "right") {
                basePosition.left += targetWidth;
            } else if (options.at[0] === "center") {
                basePosition.left += targetWidth / 2;
            }
            if (options.at[1] === "bottom") {
                basePosition.top += targetHeight;
            } else if (options.at[1] === "center") {
                basePosition.top += targetHeight / 2;
            }
            atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
            basePosition.left += atOffset[0];
            basePosition.top += atOffset[1];
            return this.each(function() {
                var collisionPosition, using, elem = $(this),
                    elemWidth = elem.outerWidth(),
                    elemHeight = elem.outerHeight(),
                    marginLeft = parseCss(this, "marginLeft"),
                    marginTop = parseCss(this, "marginTop"),
                    collisionWidth = elemWidth + marginLeft + parseCss(this, "marginRight") +
                    scrollInfo.width,
                    collisionHeight = elemHeight + marginTop + parseCss(this, "marginBottom") +
                    scrollInfo.height,
                    position = $.extend({}, basePosition),
                    myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());
                if (options.my[0] === "right") {
                    position.left -= elemWidth;
                } else if (options.my[0] === "center") {
                    position.left -= elemWidth / 2;
                }
                if (options.my[1] === "bottom") {
                    position.top -= elemHeight;
                } else if (options.my[1] === "center") {
                    position.top -= elemHeight / 2;
                }
                position.left += myOffset[0];
                position.top += myOffset[1];
                collisionPosition = {
                    marginLeft: marginLeft,
                    marginTop: marginTop
                };
                $.each(["left", "top"], function(i, dir) {
                    if ($.ui.position[collision[i]]) {
                        $.ui.position[collision[i]][dir](position, {
                            targetWidth: targetWidth,
                            targetHeight: targetHeight,
                            elemWidth: elemWidth,
                            elemHeight: elemHeight,
                            collisionPosition: collisionPosition,
                            collisionWidth: collisionWidth,
                            collisionHeight: collisionHeight,
                            offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
                            my: options.my,
                            at: options.at,
                            within: within,
                            elem: elem
                        });
                    }
                });
                if (options.using) {
                    using = function(props) {
                        var left = targetOffset.left - position.left,
                            right = left + targetWidth - elemWidth,
                            top = targetOffset.top - position.top,
                            bottom = top + targetHeight - elemHeight,
                            feedback = {
                                target: {
                                    element: target,
                                    left: targetOffset.left,
                                    top: targetOffset.top,
                                    width: targetWidth,
                                    height: targetHeight
                                },
                                element: {
                                    element: elem,
                                    left: position.left,
                                    top: position.top,
                                    width: elemWidth,
                                    height: elemHeight
                                },
                                horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
                                vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
                            };
                        if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
                            feedback.horizontal = "center";
                        }
                        if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
                            feedback.vertical = "middle";
                        }
                        if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
                            feedback.important = "horizontal";
                        } else {
                            feedback.important = "vertical";
                        }
                        options.using.call(this, props, feedback);
                    };
                }
                elem.offset($.extend(position, {
                    using: using
                }));
            });
        };
        $.ui.position = {
            fit: {
                left: function(position, data) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
                        outerWidth = within.width,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = withinOffset - collisionPosLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
                        newOverRight;
                    if (data.collisionWidth > outerWidth) {
                        if (overLeft > 0 && overRight <= 0) {
                            newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
                                withinOffset;
                            position.left += overLeft - newOverRight;
                        } else if (overRight > 0 && overLeft <= 0) {
                            position.left = withinOffset;
                        } else {
                            if (overLeft > overRight) {
                                position.left = withinOffset + outerWidth - data.collisionWidth;
                            } else {
                                position.left = withinOffset;
                            }
                        }
                    } else if (overLeft > 0) {
                        position.left += overLeft;
                    } else if (overRight > 0) {
                        position.left -= overRight;
                    } else {
                        position.left = max(position.left - collisionPosLeft, position.left);
                    }
                },
                top: function(position, data) {
                    var within = data.within,
                        withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
                        outerHeight = data.within.height,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = withinOffset - collisionPosTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
                        newOverBottom;
                    if (data.collisionHeight > outerHeight) {
                        if (overTop > 0 && overBottom <= 0) {
                            newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
                                withinOffset;
                            position.top += overTop - newOverBottom;
                        } else if (overBottom > 0 && overTop <= 0) {
                            position.top = withinOffset;
                        } else {
                            if (overTop > overBottom) {
                                position.top = withinOffset + outerHeight - data.collisionHeight;
                            } else {
                                position.top = withinOffset;
                            }
                        }
                    } else if (overTop > 0) {
                        position.top += overTop;
                    } else if (overBottom > 0) {
                        position.top -= overBottom;
                    } else {
                        position.top = max(position.top - collisionPosTop, position.top);
                    }
                }
            },
            flip: {
                left: function(position, data) {
                    var within = data.within,
                        withinOffset = within.offset.left + within.scrollLeft,
                        outerWidth = within.width,
                        offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
                        collisionPosLeft = position.left - data.collisionPosition.marginLeft,
                        overLeft = collisionPosLeft - offsetLeft,
                        overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
                        myOffset = data.my[0] === "left" ? -data.elemWidth : data.my[0] === "right" ? data.elemWidth : 0,
                        atOffset = data.at[0] === "left" ? data.targetWidth : data.at[0] === "right" ? -data.targetWidth : 0,
                        offset = -2 * data.offset[0],
                        newOverRight, newOverLeft;
                    if (overLeft < 0) {
                        newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
                            outerWidth - withinOffset;
                        if (newOverRight < 0 || newOverRight < abs(overLeft)) {
                            position.left += myOffset + atOffset + offset;
                        }
                    } else if (overRight > 0) {
                        newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
                            atOffset + offset - offsetLeft;
                        if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
                            position.left += myOffset + atOffset + offset;
                        }
                    }
                },
                top: function(position, data) {
                    var within = data.within,
                        withinOffset = within.offset.top + within.scrollTop,
                        outerHeight = within.height,
                        offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
                        collisionPosTop = position.top - data.collisionPosition.marginTop,
                        overTop = collisionPosTop - offsetTop,
                        overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
                        top = data.my[1] === "top",
                        myOffset = top ? -data.elemHeight : data.my[1] === "bottom" ? data.elemHeight : 0,
                        atOffset = data.at[1] === "top" ? data.targetHeight : data.at[1] === "bottom" ? -data.targetHeight : 0,
                        offset = -2 * data.offset[1],
                        newOverTop, newOverBottom;
                    if (overTop < 0) {
                        newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
                            outerHeight - withinOffset;
                        if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
                            position.top += myOffset + atOffset + offset;
                        }
                    } else if (overBottom > 0) {
                        newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
                            offset - offsetTop;
                        if (newOverTop > 0 || abs(newOverTop) < overBottom) {
                            position.top += myOffset + atOffset + offset;
                        }
                    }
                }
            },
            flipfit: {
                left: function() {
                    $.ui.position.flip.left.apply(this, arguments);
                    $.ui.position.fit.left.apply(this, arguments);
                },
                top: function() {
                    $.ui.position.flip.top.apply(this, arguments);
                    $.ui.position.fit.top.apply(this, arguments);
                }
            }
        };
    })();
    var position = $.ui.position;
    /*!
     * jQuery UI :data 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var data = $.extend($.expr[":"], {
        data: $.expr.createPseudo ? $.expr.createPseudo(function(dataName) {
            return function(elem) {
                return !!$.data(elem, dataName);
            };
        }) : function(elem, i, match) {
            return !!$.data(elem, match[3]);
        }
    });
    /*!
     * jQuery UI Disable Selection 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var disableSelection = $.fn.extend({
        disableSelection: (function() {
            var eventType = "onselectstart" in document.createElement("div") ? "selectstart" : "mousedown";
            return function() {
                return this.on(eventType + ".ui-disableSelection", function(event) {
                    event.preventDefault();
                });
            };
        })(),
        enableSelection: function() {
            return this.off(".ui-disableSelection");
        }
    });
    /*!
     * jQuery UI Effects 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var dataSpace = "ui-effects-",
        dataSpaceStyle = "ui-effects-style",
        dataSpaceAnimated = "ui-effects-animated",
        jQuery = $;
    $.effects = {
        effect: {}
    };
    /*!
     * jQuery Color Animations v2.1.2
     * https://github.com/jquery/jquery-color
     *
     * Copyright 2014 jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     * Date: Wed Jan 16 08:47:09 2013 -0600
     */
    (function(jQuery, undefined) {
        var stepHooks = "backgroundColor borderBottomColor borderLeftColor borderRightColor " + "borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",
            rplusequals = /^([\-+])=\s*(\d+\.?\d*)/,
            stringParsers = [{
                re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
                parse: function(execResult) {
                    return [execResult[1], execResult[2], execResult[3], execResult[4]];
                }
            }, {
                re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
                parse: function(execResult) {
                    return [execResult[1] * 2.55, execResult[2] * 2.55, execResult[3] * 2.55, execResult[4]];
                }
            }, {
                re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
                parse: function(execResult) {
                    return [parseInt(execResult[1], 16), parseInt(execResult[2], 16), parseInt(execResult[3], 16)];
                }
            }, {
                re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
                parse: function(execResult) {
                    return [parseInt(execResult[1] + execResult[1], 16), parseInt(execResult[2] + execResult[2], 16), parseInt(execResult[3] + execResult[3], 16)];
                }
            }, {
                re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
                space: "hsla",
                parse: function(execResult) {
                    return [execResult[1], execResult[2] / 100, execResult[3] / 100, execResult[4]];
                }
            }],
            color = jQuery.Color = function(color, green, blue, alpha) {
                return new jQuery.Color.fn.parse(color, green, blue, alpha);
            },
            spaces = {
                rgba: {
                    props: {
                        red: {
                            idx: 0,
                            type: "byte"
                        },
                        green: {
                            idx: 1,
                            type: "byte"
                        },
                        blue: {
                            idx: 2,
                            type: "byte"
                        }
                    }
                },
                hsla: {
                    props: {
                        hue: {
                            idx: 0,
                            type: "degrees"
                        },
                        saturation: {
                            idx: 1,
                            type: "percent"
                        },
                        lightness: {
                            idx: 2,
                            type: "percent"
                        }
                    }
                }
            },
            propTypes = {
                "byte": {
                    floor: true,
                    max: 255
                },
                "percent": {
                    max: 1
                },
                "degrees": {
                    mod: 360,
                    floor: true
                }
            },
            support = color.support = {},
            supportElem = jQuery("<p>")[0],
            colors, each = jQuery.each;
        supportElem.style.cssText = "background-color:rgba(1,1,1,.5)";
        support.rgba = supportElem.style.backgroundColor.indexOf("rgba") > -1;
        each(spaces, function(spaceName, space) {
            space.cache = "_" + spaceName;
            space.props.alpha = {
                idx: 3,
                type: "percent",
                def: 1
            };
        });

        function clamp(value, prop, allowEmpty) {
            var type = propTypes[prop.type] || {};
            if (value == null) {
                return (allowEmpty || !prop.def) ? null : prop.def;
            }
            value = type.floor ? ~~value : parseFloat(value);
            if (isNaN(value)) {
                return prop.def;
            }
            if (type.mod) {
                return (value + type.mod) % type.mod;
            }
            return 0 > value ? 0 : type.max < value ? type.max : value;
        }

        function stringParse(string) {
            var inst = color(),
                rgba = inst._rgba = [];
            string = string.toLowerCase();
            each(stringParsers, function(i, parser) {
                var parsed, match = parser.re.exec(string),
                    values = match && parser.parse(match),
                    spaceName = parser.space || "rgba";
                if (values) {
                    parsed = inst[spaceName](values);
                    inst[spaces[spaceName].cache] = parsed[spaces[spaceName].cache];
                    rgba = inst._rgba = parsed._rgba;
                    return false;
                }
            });
            if (rgba.length) {
                if (rgba.join() === "0,0,0,0") {
                    jQuery.extend(rgba, colors.transparent);
                }
                return inst;
            }
            return colors[string];
        }
        color.fn = jQuery.extend(color.prototype, {
            parse: function(red, green, blue, alpha) {
                if (red === undefined) {
                    this._rgba = [null, null, null, null];
                    return this;
                }
                if (red.jquery || red.nodeType) {
                    red = jQuery(red).css(green);
                    green = undefined;
                }
                var inst = this,
                    type = jQuery.type(red),
                    rgba = this._rgba = [];
                if (green !== undefined) {
                    red = [red, green, blue, alpha];
                    type = "array";
                }
                if (type === "string") {
                    return this.parse(stringParse(red) || colors._default);
                }
                if (type === "array") {
                    each(spaces.rgba.props, function(key, prop) {
                        rgba[prop.idx] = clamp(red[prop.idx], prop);
                    });
                    return this;
                }
                if (type === "object") {
                    if (red instanceof color) {
                        each(spaces, function(spaceName, space) {
                            if (red[space.cache]) {
                                inst[space.cache] = red[space.cache].slice();
                            }
                        });
                    } else {
                        each(spaces, function(spaceName, space) {
                            var cache = space.cache;
                            each(space.props, function(key, prop) {
                                if (!inst[cache] && space.to) {
                                    if (key === "alpha" || red[key] == null) {
                                        return;
                                    }
                                    inst[cache] = space.to(inst._rgba);
                                }
                                inst[cache][prop.idx] = clamp(red[key], prop, true);
                            });
                            if (inst[cache] && jQuery.inArray(null, inst[cache].slice(0, 3)) < 0) {
                                inst[cache][3] = 1;
                                if (space.from) {
                                    inst._rgba = space.from(inst[cache]);
                                }
                            }
                        });
                    }
                    return this;
                }
            },
            is: function(compare) {
                var is = color(compare),
                    same = true,
                    inst = this;
                each(spaces, function(_, space) {
                    var localCache, isCache = is[space.cache];
                    if (isCache) {
                        localCache = inst[space.cache] || space.to && space.to(inst._rgba) || [];
                        each(space.props, function(_, prop) {
                            if (isCache[prop.idx] != null) {
                                same = (isCache[prop.idx] === localCache[prop.idx]);
                                return same;
                            }
                        });
                    }
                    return same;
                });
                return same;
            },
            _space: function() {
                var used = [],
                    inst = this;
                each(spaces, function(spaceName, space) {
                    if (inst[space.cache]) {
                        used.push(spaceName);
                    }
                });
                return used.pop();
            },
            transition: function(other, distance) {
                var end = color(other),
                    spaceName = end._space(),
                    space = spaces[spaceName],
                    startColor = this.alpha() === 0 ? color("transparent") : this,
                    start = startColor[space.cache] || space.to(startColor._rgba),
                    result = start.slice();
                end = end[space.cache];
                each(space.props, function(key, prop) {
                    var index = prop.idx,
                        startValue = start[index],
                        endValue = end[index],
                        type = propTypes[prop.type] || {};
                    if (endValue === null) {
                        return;
                    }
                    if (startValue === null) {
                        result[index] = endValue;
                    } else {
                        if (type.mod) {
                            if (endValue - startValue > type.mod / 2) {
                                startValue += type.mod;
                            } else if (startValue - endValue > type.mod / 2) {
                                startValue -= type.mod;
                            }
                        }
                        result[index] = clamp((endValue - startValue) * distance + startValue, prop);
                    }
                });
                return this[spaceName](result);
            },
            blend: function(opaque) {
                if (this._rgba[3] === 1) {
                    return this;
                }
                var rgb = this._rgba.slice(),
                    a = rgb.pop(),
                    blend = color(opaque)._rgba;
                return color(jQuery.map(rgb, function(v, i) {
                    return (1 - a) * blend[i] + a * v;
                }));
            },
            toRgbaString: function() {
                var prefix = "rgba(",
                    rgba = jQuery.map(this._rgba, function(v, i) {
                        return v == null ? (i > 2 ? 1 : 0) : v;
                    });
                if (rgba[3] === 1) {
                    rgba.pop();
                    prefix = "rgb(";
                }
                return prefix + rgba.join() + ")";
            },
            toHslaString: function() {
                var prefix = "hsla(",
                    hsla = jQuery.map(this.hsla(), function(v, i) {
                        if (v == null) {
                            v = i > 2 ? 1 : 0;
                        }
                        if (i && i < 3) {
                            v = Math.round(v * 100) + "%";
                        }
                        return v;
                    });
                if (hsla[3] === 1) {
                    hsla.pop();
                    prefix = "hsl(";
                }
                return prefix + hsla.join() + ")";
            },
            toHexString: function(includeAlpha) {
                var rgba = this._rgba.slice(),
                    alpha = rgba.pop();
                if (includeAlpha) {
                    rgba.push(~~(alpha * 255));
                }
                return "#" + jQuery.map(rgba, function(v) {
                    v = (v || 0).toString(16);
                    return v.length === 1 ? "0" + v : v;
                }).join("");
            },
            toString: function() {
                return this._rgba[3] === 0 ? "transparent" : this.toRgbaString();
            }
        });
        color.fn.parse.prototype = color.fn;

        function hue2rgb(p, q, h) {
            h = (h + 1) % 1;
            if (h * 6 < 1) {
                return p + (q - p) * h * 6;
            }
            if (h * 2 < 1) {
                return q;
            }
            if (h * 3 < 2) {
                return p + (q - p) * ((2 / 3) - h) * 6;
            }
            return p;
        }
        spaces.hsla.to = function(rgba) {
            if (rgba[0] == null || rgba[1] == null || rgba[2] == null) {
                return [null, null, null, rgba[3]];
            }
            var r = rgba[0] / 255,
                g = rgba[1] / 255,
                b = rgba[2] / 255,
                a = rgba[3],
                max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                diff = max - min,
                add = max + min,
                l = add * 0.5,
                h, s;
            if (min === max) {
                h = 0;
            } else if (r === max) {
                h = (60 * (g - b) / diff) + 360;
            } else if (g === max) {
                h = (60 * (b - r) / diff) + 120;
            } else {
                h = (60 * (r - g) / diff) + 240;
            }
            if (diff === 0) {
                s = 0;
            } else if (l <= 0.5) {
                s = diff / add;
            } else {
                s = diff / (2 - add);
            }
            return [Math.round(h) % 360, s, l, a == null ? 1 : a];
        };
        spaces.hsla.from = function(hsla) {
            if (hsla[0] == null || hsla[1] == null || hsla[2] == null) {
                return [null, null, null, hsla[3]];
            }
            var h = hsla[0] / 360,
                s = hsla[1],
                l = hsla[2],
                a = hsla[3],
                q = l <= 0.5 ? l * (1 + s) : l + s - l * s,
                p = 2 * l - q;
            return [Math.round(hue2rgb(p, q, h + (1 / 3)) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - (1 / 3)) * 255), a];
        };
        each(spaces, function(spaceName, space) {
            var props = space.props,
                cache = space.cache,
                to = space.to,
                from = space.from;
            color.fn[spaceName] = function(value) {
                if (to && !this[cache]) {
                    this[cache] = to(this._rgba);
                }
                if (value === undefined) {
                    return this[cache].slice();
                }
                var ret, type = jQuery.type(value),
                    arr = (type === "array" || type === "object") ? value : arguments,
                    local = this[cache].slice();
                each(props, function(key, prop) {
                    var val = arr[type === "object" ? key : prop.idx];
                    if (val == null) {
                        val = local[prop.idx];
                    }
                    local[prop.idx] = clamp(val, prop);
                });
                if (from) {
                    ret = color(from(local));
                    ret[cache] = local;
                    return ret;
                } else {
                    return color(local);
                }
            };
            each(props, function(key, prop) {
                if (color.fn[key]) {
                    return;
                }
                color.fn[key] = function(value) {
                    var vtype = jQuery.type(value),
                        fn = (key === "alpha" ? (this._hsla ? "hsla" : "rgba") : spaceName),
                        local = this[fn](),
                        cur = local[prop.idx],
                        match;
                    if (vtype === "undefined") {
                        return cur;
                    }
                    if (vtype === "function") {
                        value = value.call(this, cur);
                        vtype = jQuery.type(value);
                    }
                    if (value == null && prop.empty) {
                        return this;
                    }
                    if (vtype === "string") {
                        match = rplusequals.exec(value);
                        if (match) {
                            value = cur + parseFloat(match[2]) * (match[1] === "+" ? 1 : -1);
                        }
                    }
                    local[prop.idx] = value;
                    return this[fn](local);
                };
            });
        });
        color.hook = function(hook) {
            var hooks = hook.split(" ");
            each(hooks, function(i, hook) {
                jQuery.cssHooks[hook] = {
                    set: function(elem, value) {
                        var parsed, curElem, backgroundColor = "";
                        if (value !== "transparent" && (jQuery.type(value) !== "string" || (parsed = stringParse(value)))) {
                            value = color(parsed || value);
                            if (!support.rgba && value._rgba[3] !== 1) {
                                curElem = hook === "backgroundColor" ? elem.parentNode : elem;
                                while ((backgroundColor === "" || backgroundColor === "transparent") && curElem && curElem.style) {
                                    try {
                                        backgroundColor = jQuery.css(curElem, "backgroundColor");
                                        curElem = curElem.parentNode;
                                    } catch (e) {}
                                }
                                value = value.blend(backgroundColor && backgroundColor !== "transparent" ? backgroundColor : "_default");
                            }
                            value = value.toRgbaString();
                        }
                        try {
                            elem.style[hook] = value;
                        } catch (e) {}
                    }
                };
                jQuery.fx.step[hook] = function(fx) {
                    if (!fx.colorInit) {
                        fx.start = color(fx.elem, hook);
                        fx.end = color(fx.end);
                        fx.colorInit = true;
                    }
                    jQuery.cssHooks[hook].set(fx.elem, fx.start.transition(fx.end, fx.pos));
                };
            });
        };
        color.hook(stepHooks);
        jQuery.cssHooks.borderColor = {
            expand: function(value) {
                var expanded = {};
                each(["Top", "Right", "Bottom", "Left"], function(i, part) {
                    expanded["border" + part + "Color"] = value;
                });
                return expanded;
            }
        };
        colors = jQuery.Color.names = {
            aqua: "#00ffff",
            black: "#000000",
            blue: "#0000ff",
            fuchsia: "#ff00ff",
            gray: "#808080",
            green: "#008000",
            lime: "#00ff00",
            maroon: "#800000",
            navy: "#000080",
            olive: "#808000",
            purple: "#800080",
            red: "#ff0000",
            silver: "#c0c0c0",
            teal: "#008080",
            white: "#ffffff",
            yellow: "#ffff00",
            transparent: [null, null, null, 0],
            _default: "#ffffff"
        };
    })(jQuery);
    (function() {
        var classAnimationActions = ["add", "remove", "toggle"],
            shorthandStyles = {
                border: 1,
                borderBottom: 1,
                borderColor: 1,
                borderLeft: 1,
                borderRight: 1,
                borderTop: 1,
                borderWidth: 1,
                margin: 1,
                padding: 1
            };
        $.each(["borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle"], function(_, prop) {
            $.fx.step[prop] = function(fx) {
                if (fx.end !== "none" && !fx.setAttr || fx.pos === 1 && !fx.setAttr) {
                    jQuery.style(fx.elem, prop, fx.end);
                    fx.setAttr = true;
                }
            };
        });

        function getElementStyles(elem) {
            var key, len, style = elem.ownerDocument.defaultView ? elem.ownerDocument.defaultView.getComputedStyle(elem, null) : elem.currentStyle,
                styles = {};
            if (style && style.length && style[0] && style[style[0]]) {
                len = style.length;
                while (len--) {
                    key = style[len];
                    if (typeof style[key] === "string") {
                        styles[$.camelCase(key)] = style[key];
                    }
                }
            } else {
                for (key in style) {
                    if (typeof style[key] === "string") {
                        styles[key] = style[key];
                    }
                }
            }
            return styles;
        }

        function styleDifference(oldStyle, newStyle) {
            var diff = {},
                name, value;
            for (name in newStyle) {
                value = newStyle[name];
                if (oldStyle[name] !== value) {
                    if (!shorthandStyles[name]) {
                        if ($.fx.step[name] || !isNaN(parseFloat(value))) {
                            diff[name] = value;
                        }
                    }
                }
            }
            return diff;
        }
        if (!$.fn.addBack) {
            $.fn.addBack = function(selector) {
                return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
            };
        }
        $.effects.animateClass = function(value, duration, easing, callback) {
            var o = $.speed(duration, easing, callback);
            return this.queue(function() {
                var animated = $(this),
                    baseClass = animated.attr("class") || "",
                    applyClassChange, allAnimations = o.children ? animated.find("*").addBack() : animated;
                allAnimations = allAnimations.map(function() {
                    var el = $(this);
                    return {
                        el: el,
                        start: getElementStyles(this)
                    };
                });
                applyClassChange = function() {
                    $.each(classAnimationActions, function(i, action) {
                        if (value[action]) {
                            animated[action + "Class"](value[action]);
                        }
                    });
                };
                applyClassChange();
                allAnimations = allAnimations.map(function() {
                    this.end = getElementStyles(this.el[0]);
                    this.diff = styleDifference(this.start, this.end);
                    return this;
                });
                animated.attr("class", baseClass);
                allAnimations = allAnimations.map(function() {
                    var styleInfo = this,
                        dfd = $.Deferred(),
                        opts = $.extend({}, o, {
                            queue: false,
                            complete: function() {
                                dfd.resolve(styleInfo);
                            }
                        });
                    this.el.animate(this.diff, opts);
                    return dfd.promise();
                });
                $.when.apply($, allAnimations.get()).done(function() {
                    applyClassChange();
                    $.each(arguments, function() {
                        var el = this.el;
                        $.each(this.diff, function(key) {
                            el.css(key, "");
                        });
                    });
                    o.complete.call(animated[0]);
                });
            });
        };
        $.fn.extend({
            addClass: (function(orig) {
                return function(classNames, speed, easing, callback) {
                    return speed ? $.effects.animateClass.call(this, {
                        add: classNames
                    }, speed, easing, callback) : orig.apply(this, arguments);
                };
            })($.fn.addClass),
            removeClass: (function(orig) {
                return function(classNames, speed, easing, callback) {
                    return arguments.length > 1 ? $.effects.animateClass.call(this, {
                        remove: classNames
                    }, speed, easing, callback) : orig.apply(this, arguments);
                };
            })($.fn.removeClass),
            toggleClass: (function(orig) {
                return function(classNames, force, speed, easing, callback) {
                    if (typeof force === "boolean" || force === undefined) {
                        if (!speed) {
                            return orig.apply(this, arguments);
                        } else {
                            return $.effects.animateClass.call(this, (force ? {
                                add: classNames
                            } : {
                                remove: classNames
                            }), speed, easing, callback);
                        }
                    } else {
                        return $.effects.animateClass.call(this, {
                            toggle: classNames
                        }, force, speed, easing);
                    }
                };
            })($.fn.toggleClass),
            switchClass: function(remove, add, speed, easing, callback) {
                return $.effects.animateClass.call(this, {
                    add: add,
                    remove: remove
                }, speed, easing, callback);
            }
        });
    })();
    (function() {
        if ($.expr && $.expr.filters && $.expr.filters.animated) {
            $.expr.filters.animated = (function(orig) {
                return function(elem) {
                    return !!$(elem).data(dataSpaceAnimated) || orig(elem);
                };
            })($.expr.filters.animated);
        }
        if ($.uiBackCompat !== false) {
            $.extend($.effects, {
                save: function(element, set) {
                    var i = 0,
                        length = set.length;
                    for (; i < length; i++) {
                        if (set[i] !== null) {
                            element.data(dataSpace + set[i], element[0].style[set[i]]);
                        }
                    }
                },
                restore: function(element, set) {
                    var val, i = 0,
                        length = set.length;
                    for (; i < length; i++) {
                        if (set[i] !== null) {
                            val = element.data(dataSpace + set[i]);
                            element.css(set[i], val);
                        }
                    }
                },
                setMode: function(el, mode) {
                    if (mode === "toggle") {
                        mode = el.is(":hidden") ? "show" : "hide";
                    }
                    return mode;
                },
                createWrapper: function(element) {
                    if (element.parent().is(".ui-effects-wrapper")) {
                        return element.parent();
                    }
                    var props = {
                            width: element.outerWidth(true),
                            height: element.outerHeight(true),
                            "float": element.css("float")
                        },
                        wrapper = $("<div></div>").addClass("ui-effects-wrapper").css({
                            fontSize: "100%",
                            background: "transparent",
                            border: "none",
                            margin: 0,
                            padding: 0
                        }),
                        size = {
                            width: element.width(),
                            height: element.height()
                        },
                        active = document.activeElement;
                    try {
                        active.id;
                    } catch (e) {
                        active = document.body;
                    }
                    element.wrap(wrapper);
                    if (element[0] === active || $.contains(element[0], active)) {
                        $(active).trigger("focus");
                    }
                    wrapper = element.parent();
                    if (element.css("position") === "static") {
                        wrapper.css({
                            position: "relative"
                        });
                        element.css({
                            position: "relative"
                        });
                    } else {
                        $.extend(props, {
                            position: element.css("position"),
                            zIndex: element.css("z-index")
                        });
                        $.each(["top", "left", "bottom", "right"], function(i, pos) {
                            props[pos] = element.css(pos);
                            if (isNaN(parseInt(props[pos], 10))) {
                                props[pos] = "auto";
                            }
                        });
                        element.css({
                            position: "relative",
                            top: 0,
                            left: 0,
                            right: "auto",
                            bottom: "auto"
                        });
                    }
                    element.css(size);
                    return wrapper.css(props).show();
                },
                removeWrapper: function(element) {
                    var active = document.activeElement;
                    if (element.parent().is(".ui-effects-wrapper")) {
                        element.parent().replaceWith(element);
                        if (element[0] === active || $.contains(element[0], active)) {
                            $(active).trigger("focus");
                        }
                    }
                    return element;
                }
            });
        }
        $.extend($.effects, {
            version: "1.12.1",
            define: function(name, mode, effect) {
                if (!effect) {
                    effect = mode;
                    mode = "effect";
                }
                $.effects.effect[name] = effect;
                $.effects.effect[name].mode = mode;
                return effect;
            },
            scaledDimensions: function(element, percent, direction) {
                if (percent === 0) {
                    return {
                        height: 0,
                        width: 0,
                        outerHeight: 0,
                        outerWidth: 0
                    };
                }
                var x = direction !== "horizontal" ? ((percent || 100) / 100) : 1,
                    y = direction !== "vertical" ? ((percent || 100) / 100) : 1;
                return {
                    height: element.height() * y,
                    width: element.width() * x,
                    outerHeight: element.outerHeight() * y,
                    outerWidth: element.outerWidth() * x
                };
            },
            clipToBox: function(animation) {
                return {
                    width: animation.clip.right - animation.clip.left,
                    height: animation.clip.bottom - animation.clip.top,
                    left: animation.clip.left,
                    top: animation.clip.top
                };
            },
            unshift: function(element, queueLength, count) {
                var queue = element.queue();
                if (queueLength > 1) {
                    queue.splice.apply(queue, [1, 0].concat(queue.splice(queueLength, count)));
                }
                element.dequeue();
            },
            saveStyle: function(element) {
                element.data(dataSpaceStyle, element[0].style.cssText);
            },
            restoreStyle: function(element) {
                element[0].style.cssText = element.data(dataSpaceStyle) || "";
                element.removeData(dataSpaceStyle);
            },
            mode: function(element, mode) {
                var hidden = element.is(":hidden");
                if (mode === "toggle") {
                    mode = hidden ? "show" : "hide";
                }
                if (hidden ? mode === "hide" : mode === "show") {
                    mode = "none";
                }
                return mode;
            },
            getBaseline: function(origin, original) {
                var y, x;
                switch (origin[0]) {
                    case "top":
                        y = 0;
                        break;
                    case "middle":
                        y = 0.5;
                        break;
                    case "bottom":
                        y = 1;
                        break;
                    default:
                        y = origin[0] / original.height;
                }
                switch (origin[1]) {
                    case "left":
                        x = 0;
                        break;
                    case "center":
                        x = 0.5;
                        break;
                    case "right":
                        x = 1;
                        break;
                    default:
                        x = origin[1] / original.width;
                }
                return {
                    x: x,
                    y: y
                };
            },
            createPlaceholder: function(element) {
                var placeholder, cssPosition = element.css("position"),
                    position = element.position();
                element.css({
                    marginTop: element.css("marginTop"),
                    marginBottom: element.css("marginBottom"),
                    marginLeft: element.css("marginLeft"),
                    marginRight: element.css("marginRight")
                }).outerWidth(element.outerWidth()).outerHeight(element.outerHeight());
                if (/^(static|relative)/.test(cssPosition)) {
                    cssPosition = "absolute";
                    placeholder = $("<" + element[0].nodeName + ">").insertAfter(element).css({
                        display: /^(inline|ruby)/.test(element.css("display")) ? "inline-block" : "block",
                        visibility: "hidden",
                        marginTop: element.css("marginTop"),
                        marginBottom: element.css("marginBottom"),
                        marginLeft: element.css("marginLeft"),
                        marginRight: element.css("marginRight"),
                        "float": element.css("float")
                    }).outerWidth(element.outerWidth()).outerHeight(element.outerHeight()).addClass("ui-effects-placeholder");
                    element.data(dataSpace + "placeholder", placeholder);
                }
                element.css({
                    position: cssPosition,
                    left: position.left,
                    top: position.top
                });
                return placeholder;
            },
            removePlaceholder: function(element) {
                var dataKey = dataSpace + "placeholder",
                    placeholder = element.data(dataKey);
                if (placeholder) {
                    placeholder.remove();
                    element.removeData(dataKey);
                }
            },
            cleanUp: function(element) {
                $.effects.restoreStyle(element);
                $.effects.removePlaceholder(element);
            },
            setTransition: function(element, list, factor, value) {
                value = value || {};
                $.each(list, function(i, x) {
                    var unit = element.cssUnit(x);
                    if (unit[0] > 0) {
                        value[x] = unit[0] * factor + unit[1];
                    }
                });
                return value;
            }
        });

        function _normalizeArguments(effect, options, speed, callback) {
            if ($.isPlainObject(effect)) {
                options = effect;
                effect = effect.effect;
            }
            effect = {
                effect: effect
            };
            if (options == null) {
                options = {};
            }
            if ($.isFunction(options)) {
                callback = options;
                speed = null;
                options = {};
            }
            if (typeof options === "number" || $.fx.speeds[options]) {
                callback = speed;
                speed = options;
                options = {};
            }
            if ($.isFunction(speed)) {
                callback = speed;
                speed = null;
            }
            if (options) {
                $.extend(effect, options);
            }
            speed = speed || options.duration;
            effect.duration = $.fx.off ? 0 : typeof speed === "number" ? speed : speed in $.fx.speeds ? $.fx.speeds[speed] : $.fx.speeds._default;
            effect.complete = callback || options.complete;
            return effect;
        }

        function standardAnimationOption(option) {
            if (!option || typeof option === "number" || $.fx.speeds[option]) {
                return true;
            }
            if (typeof option === "string" && !$.effects.effect[option]) {
                return true;
            }
            if ($.isFunction(option)) {
                return true;
            }
            if (typeof option === "object" && !option.effect) {
                return true;
            }
            return false;
        }
        $.fn.extend({
            effect: function() {
                var args = _normalizeArguments.apply(this, arguments),
                    effectMethod = $.effects.effect[args.effect],
                    defaultMode = effectMethod.mode,
                    queue = args.queue,
                    queueName = queue || "fx",
                    complete = args.complete,
                    mode = args.mode,
                    modes = [],
                    prefilter = function(next) {
                        var el = $(this),
                            normalizedMode = $.effects.mode(el, mode) || defaultMode;
                        el.data(dataSpaceAnimated, true);
                        modes.push(normalizedMode);
                        if (defaultMode && (normalizedMode === "show" || (normalizedMode === defaultMode && normalizedMode === "hide"))) {
                            el.show();
                        }
                        if (!defaultMode || normalizedMode !== "none") {
                            $.effects.saveStyle(el);
                        }
                        if ($.isFunction(next)) {
                            next();
                        }
                    };
                if ($.fx.off || !effectMethod) {
                    if (mode) {
                        return this[mode](args.duration, complete);
                    } else {
                        return this.each(function() {
                            if (complete) {
                                complete.call(this);
                            }
                        });
                    }
                }

                function run(next) {
                    var elem = $(this);

                    function cleanup() {
                        elem.removeData(dataSpaceAnimated);
                        $.effects.cleanUp(elem);
                        if (args.mode === "hide") {
                            elem.hide();
                        }
                        done();
                    }

                    function done() {
                        if ($.isFunction(complete)) {
                            complete.call(elem[0]);
                        }
                        if ($.isFunction(next)) {
                            next();
                        }
                    }
                    args.mode = modes.shift();
                    if ($.uiBackCompat !== false && !defaultMode) {
                        if (elem.is(":hidden") ? mode === "hide" : mode === "show") {
                            elem[mode]();
                            done();
                        } else {
                            effectMethod.call(elem[0], args, done);
                        }
                    } else {
                        if (args.mode === "none") {
                            elem[mode]();
                            done();
                        } else {
                            effectMethod.call(elem[0], args, cleanup);
                        }
                    }
                }
                return queue === false ? this.each(prefilter).each(run) : this.queue(queueName, prefilter).queue(queueName, run);
            },
            show: (function(orig) {
                return function(option) {
                    if (standardAnimationOption(option)) {
                        return orig.apply(this, arguments);
                    } else {
                        var args = _normalizeArguments.apply(this, arguments);
                        args.mode = "show";
                        return this.effect.call(this, args);
                    }
                };
            })($.fn.show),
            hide: (function(orig) {
                return function(option) {
                    if (standardAnimationOption(option)) {
                        return orig.apply(this, arguments);
                    } else {
                        var args = _normalizeArguments.apply(this, arguments);
                        args.mode = "hide";
                        return this.effect.call(this, args);
                    }
                };
            })($.fn.hide),
            toggle: (function(orig) {
                return function(option) {
                    if (standardAnimationOption(option) || typeof option === "boolean") {
                        return orig.apply(this, arguments);
                    } else {
                        var args = _normalizeArguments.apply(this, arguments);
                        args.mode = "toggle";
                        return this.effect.call(this, args);
                    }
                };
            })($.fn.toggle),
            cssUnit: function(key) {
                var style = this.css(key),
                    val = [];
                $.each(["em", "px", "%", "pt"], function(i, unit) {
                    if (style.indexOf(unit) > 0) {
                        val = [parseFloat(style), unit];
                    }
                });
                return val;
            },
            cssClip: function(clipObj) {
                if (clipObj) {
                    return this.css("clip", "rect(" + clipObj.top + "px " + clipObj.right + "px " +
                        clipObj.bottom + "px " + clipObj.left + "px)");
                }
                return parseClip(this.css("clip"), this);
            },
            transfer: function(options, done) {
                var element = $(this),
                    target = $(options.to),
                    targetFixed = target.css("position") === "fixed",
                    body = $("body"),
                    fixTop = targetFixed ? body.scrollTop() : 0,
                    fixLeft = targetFixed ? body.scrollLeft() : 0,
                    endPosition = target.offset(),
                    animation = {
                        top: endPosition.top - fixTop,
                        left: endPosition.left - fixLeft,
                        height: target.innerHeight(),
                        width: target.innerWidth()
                    },
                    startPosition = element.offset(),
                    transfer = $("<div class='ui-effects-transfer'></div>").appendTo("body").addClass(options.className).css({
                        top: startPosition.top - fixTop,
                        left: startPosition.left - fixLeft,
                        height: element.innerHeight(),
                        width: element.innerWidth(),
                        position: targetFixed ? "fixed" : "absolute"
                    }).animate(animation, options.duration, options.easing, function() {
                        transfer.remove();
                        if ($.isFunction(done)) {
                            done();
                        }
                    });
            }
        });

        function parseClip(str, element) {
            var outerWidth = element.outerWidth(),
                outerHeight = element.outerHeight(),
                clipRegex = /^rect\((-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto)\)$/,
                values = clipRegex.exec(str) || ["", 0, outerWidth, outerHeight, 0];
            return {
                top: parseFloat(values[1]) || 0,
                right: values[2] === "auto" ? outerWidth : parseFloat(values[2]),
                bottom: values[3] === "auto" ? outerHeight : parseFloat(values[3]),
                left: parseFloat(values[4]) || 0
            };
        }
        $.fx.step.clip = function(fx) {
            if (!fx.clipInit) {
                fx.start = $(fx.elem).cssClip();
                if (typeof fx.end === "string") {
                    fx.end = parseClip(fx.end, fx.elem);
                }
                fx.clipInit = true;
            }
            $(fx.elem).cssClip({
                top: fx.pos * (fx.end.top - fx.start.top) + fx.start.top,
                right: fx.pos * (fx.end.right - fx.start.right) + fx.start.right,
                bottom: fx.pos * (fx.end.bottom - fx.start.bottom) + fx.start.bottom,
                left: fx.pos * (fx.end.left - fx.start.left) + fx.start.left
            });
        };
    })();
    (function() {
        var baseEasings = {};
        $.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function(i, name) {
            baseEasings[name] = function(p) {
                return Math.pow(p, i + 2);
            };
        });
        $.extend(baseEasings, {
            Sine: function(p) {
                return 1 - Math.cos(p * Math.PI / 2);
            },
            Circ: function(p) {
                return 1 - Math.sqrt(1 - p * p);
            },
            Elastic: function(p) {
                return p === 0 || p === 1 ? p : -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
            },
            Back: function(p) {
                return p * p * (3 * p - 2);
            },
            Bounce: function(p) {
                var pow2, bounce = 4;
                while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
                return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
            }
        });
        $.each(baseEasings, function(name, easeIn) {
            $.easing["easeIn" + name] = easeIn;
            $.easing["easeOut" + name] = function(p) {
                return 1 - easeIn(1 - p);
            };
            $.easing["easeInOut" + name] = function(p) {
                return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn(p * -2 + 2) / 2;
            };
        });
    })();
    var effect = $.effects;
    /*!
     * jQuery UI Effects Blind 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectBlind = $.effects.define("blind", "hide", function(options, done) {
        var map = {
                up: ["bottom", "top"],
                vertical: ["bottom", "top"],
                down: ["top", "bottom"],
                left: ["right", "left"],
                horizontal: ["right", "left"],
                right: ["left", "right"]
            },
            element = $(this),
            direction = options.direction || "up",
            start = element.cssClip(),
            animate = {
                clip: $.extend({}, start)
            },
            placeholder = $.effects.createPlaceholder(element);
        animate.clip[map[direction][0]] = animate.clip[map[direction][1]];
        if (options.mode === "show") {
            element.cssClip(animate.clip);
            if (placeholder) {
                placeholder.css($.effects.clipToBox(animate));
            }
            animate.clip = start;
        }
        if (placeholder) {
            placeholder.animate($.effects.clipToBox(animate), options.duration, options.easing);
        }
        element.animate(animate, {
            queue: false,
            duration: options.duration,
            easing: options.easing,
            complete: done
        });
    });
    /*!
     * jQuery UI Effects Bounce 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectBounce = $.effects.define("bounce", function(options, done) {
        var upAnim, downAnim, refValue, element = $(this),
            mode = options.mode,
            hide = mode === "hide",
            show = mode === "show",
            direction = options.direction || "up",
            distance = options.distance,
            times = options.times || 5,
            anims = times * 2 + (show || hide ? 1 : 0),
            speed = options.duration / anims,
            easing = options.easing,
            ref = (direction === "up" || direction === "down") ? "top" : "left",
            motion = (direction === "up" || direction === "left"),
            i = 0,
            queuelen = element.queue().length;
        $.effects.createPlaceholder(element);
        refValue = element.css(ref);
        if (!distance) {
            distance = element[ref === "top" ? "outerHeight" : "outerWidth"]() / 3;
        }
        if (show) {
            downAnim = {
                opacity: 1
            };
            downAnim[ref] = refValue;
            element.css("opacity", 0).css(ref, motion ? -distance * 2 : distance * 2).animate(downAnim, speed, easing);
        }
        if (hide) {
            distance = distance / Math.pow(2, times - 1);
        }
        downAnim = {};
        downAnim[ref] = refValue;
        for (; i < times; i++) {
            upAnim = {};
            upAnim[ref] = (motion ? "-=" : "+=") + distance;
            element.animate(upAnim, speed, easing).animate(downAnim, speed, easing);
            distance = hide ? distance * 2 : distance / 2;
        }
        if (hide) {
            upAnim = {
                opacity: 0
            };
            upAnim[ref] = (motion ? "-=" : "+=") + distance;
            element.animate(upAnim, speed, easing);
        }
        element.queue(done);
        $.effects.unshift(element, queuelen, anims + 1);
    });
    /*!
     * jQuery UI Effects Clip 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectClip = $.effects.define("clip", "hide", function(options, done) {
        var start, animate = {},
            element = $(this),
            direction = options.direction || "vertical",
            both = direction === "both",
            horizontal = both || direction === "horizontal",
            vertical = both || direction === "vertical";
        start = element.cssClip();
        animate.clip = {
            top: vertical ? (start.bottom - start.top) / 2 : start.top,
            right: horizontal ? (start.right - start.left) / 2 : start.right,
            bottom: vertical ? (start.bottom - start.top) / 2 : start.bottom,
            left: horizontal ? (start.right - start.left) / 2 : start.left
        };
        $.effects.createPlaceholder(element);
        if (options.mode === "show") {
            element.cssClip(animate.clip);
            animate.clip = start;
        }
        element.animate(animate, {
            queue: false,
            duration: options.duration,
            easing: options.easing,
            complete: done
        });
    });
    /*!
     * jQuery UI Effects Drop 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectDrop = $.effects.define("drop", "hide", function(options, done) {
        var distance, element = $(this),
            mode = options.mode,
            show = mode === "show",
            direction = options.direction || "left",
            ref = (direction === "up" || direction === "down") ? "top" : "left",
            motion = (direction === "up" || direction === "left") ? "-=" : "+=",
            oppositeMotion = (motion === "+=") ? "-=" : "+=",
            animation = {
                opacity: 0
            };
        $.effects.createPlaceholder(element);
        distance = options.distance || element[ref === "top" ? "outerHeight" : "outerWidth"](true) / 2;
        animation[ref] = motion + distance;
        if (show) {
            element.css(animation);
            animation[ref] = oppositeMotion + distance;
            animation.opacity = 1;
        }
        element.animate(animation, {
            queue: false,
            duration: options.duration,
            easing: options.easing,
            complete: done
        });
    });
    /*!
     * jQuery UI Effects Explode 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectExplode = $.effects.define("explode", "hide", function(options, done) {
        var i, j, left, top, mx, my, rows = options.pieces ? Math.round(Math.sqrt(options.pieces)) : 3,
            cells = rows,
            element = $(this),
            mode = options.mode,
            show = mode === "show",
            offset = element.show().css("visibility", "hidden").offset(),
            width = Math.ceil(element.outerWidth() / cells),
            height = Math.ceil(element.outerHeight() / rows),
            pieces = [];

        function childComplete() {
            pieces.push(this);
            if (pieces.length === rows * cells) {
                animComplete();
            }
        }
        for (i = 0; i < rows; i++) {
            top = offset.top + i * height;
            my = i - (rows - 1) / 2;
            for (j = 0; j < cells; j++) {
                left = offset.left + j * width;
                mx = j - (cells - 1) / 2;
                element.clone().appendTo("body").wrap("<div></div>").css({
                    position: "absolute",
                    visibility: "visible",
                    left: -j * width,
                    top: -i * height
                }).parent().addClass("ui-effects-explode").css({
                    position: "absolute",
                    overflow: "hidden",
                    width: width,
                    height: height,
                    left: left + (show ? mx * width : 0),
                    top: top + (show ? my * height : 0),
                    opacity: show ? 0 : 1
                }).animate({
                    left: left + (show ? 0 : mx * width),
                    top: top + (show ? 0 : my * height),
                    opacity: show ? 1 : 0
                }, options.duration || 500, options.easing, childComplete);
            }
        }

        function animComplete() {
            element.css({
                visibility: "visible"
            });
            $(pieces).remove();
            done();
        }
    });
    /*!
     * jQuery UI Effects Fade 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectFade = $.effects.define("fade", "toggle", function(options, done) {
        var show = options.mode === "show";
        $(this).css("opacity", show ? 0 : 1).animate({
            opacity: show ? 1 : 0
        }, {
            queue: false,
            duration: options.duration,
            easing: options.easing,
            complete: done
        });
    });
    /*!
     * jQuery UI Effects Fold 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectFold = $.effects.define("fold", "hide", function(options, done) {
        var element = $(this),
            mode = options.mode,
            show = mode === "show",
            hide = mode === "hide",
            size = options.size || 15,
            percent = /([0-9]+)%/.exec(size),
            horizFirst = !!options.horizFirst,
            ref = horizFirst ? ["right", "bottom"] : ["bottom", "right"],
            duration = options.duration / 2,
            placeholder = $.effects.createPlaceholder(element),
            start = element.cssClip(),
            animation1 = {
                clip: $.extend({}, start)
            },
            animation2 = {
                clip: $.extend({}, start)
            },
            distance = [start[ref[0]], start[ref[1]]],
            queuelen = element.queue().length;
        if (percent) {
            size = parseInt(percent[1], 10) / 100 * distance[hide ? 0 : 1];
        }
        animation1.clip[ref[0]] = size;
        animation2.clip[ref[0]] = size;
        animation2.clip[ref[1]] = 0;
        if (show) {
            element.cssClip(animation2.clip);
            if (placeholder) {
                placeholder.css($.effects.clipToBox(animation2));
            }
            animation2.clip = start;
        }
        element.queue(function(next) {
            if (placeholder) {
                placeholder.animate($.effects.clipToBox(animation1), duration, options.easing).animate($.effects.clipToBox(animation2), duration, options.easing);
            }
            next();
        }).animate(animation1, duration, options.easing).animate(animation2, duration, options.easing).queue(done);
        $.effects.unshift(element, queuelen, 4);
    });
    /*!
     * jQuery UI Effects Highlight 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectHighlight = $.effects.define("highlight", "show", function(options, done) {
        var element = $(this),
            animation = {
                backgroundColor: element.css("backgroundColor")
            };
        if (options.mode === "hide") {
            animation.opacity = 0;
        }
        $.effects.saveStyle(element);
        element.css({
            backgroundImage: "none",
            backgroundColor: options.color || "#ffff99"
        }).animate(animation, {
            queue: false,
            duration: options.duration,
            easing: options.easing,
            complete: done
        });
    });
    /*!
     * jQuery UI Effects Size 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectSize = $.effects.define("size", function(options, done) {
        var baseline, factor, temp, element = $(this),
            cProps = ["fontSize"],
            vProps = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"],
            hProps = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"],
            mode = options.mode,
            restore = mode !== "effect",
            scale = options.scale || "both",
            origin = options.origin || ["middle", "center"],
            position = element.css("position"),
            pos = element.position(),
            original = $.effects.scaledDimensions(element),
            from = options.from || original,
            to = options.to || $.effects.scaledDimensions(element, 0);
        $.effects.createPlaceholder(element);
        if (mode === "show") {
            temp = from;
            from = to;
            to = temp;
        }
        factor = {
            from: {
                y: from.height / original.height,
                x: from.width / original.width
            },
            to: {
                y: to.height / original.height,
                x: to.width / original.width
            }
        };
        if (scale === "box" || scale === "both") {
            if (factor.from.y !== factor.to.y) {
                from = $.effects.setTransition(element, vProps, factor.from.y, from);
                to = $.effects.setTransition(element, vProps, factor.to.y, to);
            }
            if (factor.from.x !== factor.to.x) {
                from = $.effects.setTransition(element, hProps, factor.from.x, from);
                to = $.effects.setTransition(element, hProps, factor.to.x, to);
            }
        }
        if (scale === "content" || scale === "both") {
            if (factor.from.y !== factor.to.y) {
                from = $.effects.setTransition(element, cProps, factor.from.y, from);
                to = $.effects.setTransition(element, cProps, factor.to.y, to);
            }
        }
        if (origin) {
            baseline = $.effects.getBaseline(origin, original);
            from.top = (original.outerHeight - from.outerHeight) * baseline.y + pos.top;
            from.left = (original.outerWidth - from.outerWidth) * baseline.x + pos.left;
            to.top = (original.outerHeight - to.outerHeight) * baseline.y + pos.top;
            to.left = (original.outerWidth - to.outerWidth) * baseline.x + pos.left;
        }
        element.css(from);
        if (scale === "content" || scale === "both") {
            vProps = vProps.concat(["marginTop", "marginBottom"]).concat(cProps);
            hProps = hProps.concat(["marginLeft", "marginRight"]);
            element.find("*[width]").each(function() {
                var child = $(this),
                    childOriginal = $.effects.scaledDimensions(child),
                    childFrom = {
                        height: childOriginal.height * factor.from.y,
                        width: childOriginal.width * factor.from.x,
                        outerHeight: childOriginal.outerHeight * factor.from.y,
                        outerWidth: childOriginal.outerWidth * factor.from.x
                    },
                    childTo = {
                        height: childOriginal.height * factor.to.y,
                        width: childOriginal.width * factor.to.x,
                        outerHeight: childOriginal.height * factor.to.y,
                        outerWidth: childOriginal.width * factor.to.x
                    };
                if (factor.from.y !== factor.to.y) {
                    childFrom = $.effects.setTransition(child, vProps, factor.from.y, childFrom);
                    childTo = $.effects.setTransition(child, vProps, factor.to.y, childTo);
                }
                if (factor.from.x !== factor.to.x) {
                    childFrom = $.effects.setTransition(child, hProps, factor.from.x, childFrom);
                    childTo = $.effects.setTransition(child, hProps, factor.to.x, childTo);
                }
                if (restore) {
                    $.effects.saveStyle(child);
                }
                child.css(childFrom);
                child.animate(childTo, options.duration, options.easing, function() {
                    if (restore) {
                        $.effects.restoreStyle(child);
                    }
                });
            });
        }
        element.animate(to, {
            queue: false,
            duration: options.duration,
            easing: options.easing,
            complete: function() {
                var offset = element.offset();
                if (to.opacity === 0) {
                    element.css("opacity", from.opacity);
                }
                if (!restore) {
                    element.css("position", position === "static" ? "relative" : position).offset(offset);
                    $.effects.saveStyle(element);
                }
                done();
            }
        });
    });
    /*!
     * jQuery UI Effects Scale 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectScale = $.effects.define("scale", function(options, done) {
        var el = $(this),
            mode = options.mode,
            percent = parseInt(options.percent, 10) || (parseInt(options.percent, 10) === 0 ? 0 : (mode !== "effect" ? 0 : 100)),
            newOptions = $.extend(true, {
                from: $.effects.scaledDimensions(el),
                to: $.effects.scaledDimensions(el, percent, options.direction || "both"),
                origin: options.origin || ["middle", "center"]
            }, options);
        if (options.fade) {
            newOptions.from.opacity = 1;
            newOptions.to.opacity = 0;
        }
        $.effects.effect.size.call(this, newOptions, done);
    });
    /*!
     * jQuery UI Effects Puff 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectPuff = $.effects.define("puff", "hide", function(options, done) {
        var newOptions = $.extend(true, {}, options, {
            fade: true,
            percent: parseInt(options.percent, 10) || 150
        });
        $.effects.effect.scale.call(this, newOptions, done);
    });
    /*!
     * jQuery UI Effects Pulsate 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectPulsate = $.effects.define("pulsate", "show", function(options, done) {
        var element = $(this),
            mode = options.mode,
            show = mode === "show",
            hide = mode === "hide",
            showhide = show || hide,
            anims = ((options.times || 5) * 2) + (showhide ? 1 : 0),
            duration = options.duration / anims,
            animateTo = 0,
            i = 1,
            queuelen = element.queue().length;
        if (show || !element.is(":visible")) {
            element.css("opacity", 0).show();
            animateTo = 1;
        }
        for (; i < anims; i++) {
            element.animate({
                opacity: animateTo
            }, duration, options.easing);
            animateTo = 1 - animateTo;
        }
        element.animate({
            opacity: animateTo
        }, duration, options.easing);
        element.queue(done);
        $.effects.unshift(element, queuelen, anims + 1);
    });
    /*!
     * jQuery UI Effects Shake 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectShake = $.effects.define("shake", function(options, done) {
        var i = 1,
            element = $(this),
            direction = options.direction || "left",
            distance = options.distance || 20,
            times = options.times || 3,
            anims = times * 2 + 1,
            speed = Math.round(options.duration / anims),
            ref = (direction === "up" || direction === "down") ? "top" : "left",
            positiveMotion = (direction === "up" || direction === "left"),
            animation = {},
            animation1 = {},
            animation2 = {},
            queuelen = element.queue().length;
        $.effects.createPlaceholder(element);
        animation[ref] = (positiveMotion ? "-=" : "+=") + distance;
        animation1[ref] = (positiveMotion ? "+=" : "-=") + distance * 2;
        animation2[ref] = (positiveMotion ? "-=" : "+=") + distance * 2;
        element.animate(animation, speed, options.easing);
        for (; i < times; i++) {
            element.animate(animation1, speed, options.easing).animate(animation2, speed, options.easing);
        }
        element.animate(animation1, speed, options.easing).animate(animation, speed / 2, options.easing).queue(done);
        $.effects.unshift(element, queuelen, anims + 1);
    });
    /*!
     * jQuery UI Effects Slide 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effectsEffectSlide = $.effects.define("slide", "show", function(options, done) {
        var startClip, startRef, element = $(this),
            map = {
                up: ["bottom", "top"],
                down: ["top", "bottom"],
                left: ["right", "left"],
                right: ["left", "right"]
            },
            mode = options.mode,
            direction = options.direction || "left",
            ref = (direction === "up" || direction === "down") ? "top" : "left",
            positiveMotion = (direction === "up" || direction === "left"),
            distance = options.distance || element[ref === "top" ? "outerHeight" : "outerWidth"](true),
            animation = {};
        $.effects.createPlaceholder(element);
        startClip = element.cssClip();
        startRef = element.position()[ref];
        animation[ref] = (positiveMotion ? -1 : 1) * distance + startRef;
        animation.clip = element.cssClip();
        animation.clip[map[direction][1]] = animation.clip[map[direction][0]];
        if (mode === "show") {
            element.cssClip(animation.clip);
            element.css(ref, animation[ref]);
            animation.clip = startClip;
            animation[ref] = startRef;
        }
        element.animate(animation, {
            queue: false,
            duration: options.duration,
            easing: options.easing,
            complete: done
        });
    });
    /*!
     * jQuery UI Effects Transfer 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var effect;
    if ($.uiBackCompat !== false) {
        effect = $.effects.define("transfer", function(options, done) {
            $(this).transfer(options, done);
        });
    }
    var effectsEffectTransfer = effect;
    /*!
     * jQuery UI Focusable 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.ui.focusable = function(element, hasTabindex) {
        var map, mapName, img, focusableIfVisible, fieldset, nodeName = element.nodeName.toLowerCase();
        if ("area" === nodeName) {
            map = element.parentNode;
            mapName = map.name;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                return false;
            }
            img = $("img[usemap='#" + mapName + "']");
            return img.length > 0 && img.is(":visible");
        }
        if (/^(input|select|textarea|button|object)$/.test(nodeName)) {
            focusableIfVisible = !element.disabled;
            if (focusableIfVisible) {
                fieldset = $(element).closest("fieldset")[0];
                if (fieldset) {
                    focusableIfVisible = !fieldset.disabled;
                }
            }
        } else if ("a" === nodeName) {
            focusableIfVisible = element.href || hasTabindex;
        } else {
            focusableIfVisible = hasTabindex;
        }
        return focusableIfVisible && $(element).is(":visible") && visible($(element));
    };

    function visible(element) {
        var visibility = element.css("visibility");
        while (visibility === "inherit") {
            element = element.parent();
            visibility = element.css("visibility");
        }
        return visibility !== "hidden";
    }
    $.extend($.expr[":"], {
        focusable: function(element) {
            return $.ui.focusable(element, $.attr(element, "tabindex") != null);
        }
    });
    var focusable = $.ui.focusable;
    var form = $.fn.form = function() {
        return typeof this[0].form === "string" ? this.closest("form") : $(this[0].form);
    };
    /*!
     * jQuery UI Form Reset Mixin 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var formResetMixin = $.ui.formResetMixin = {
        _formResetHandler: function() {
            var form = $(this);
            setTimeout(function() {
                var instances = form.data("ui-form-reset-instances");
                $.each(instances, function() {
                    this.refresh();
                });
            });
        },
        _bindFormResetHandler: function() {
            this.form = this.element.form();
            if (!this.form.length) {
                return;
            }
            var instances = this.form.data("ui-form-reset-instances") || [];
            if (!instances.length) {
                this.form.on("reset.ui-form-reset", this._formResetHandler);
            }
            instances.push(this);
            this.form.data("ui-form-reset-instances", instances);
        },
        _unbindFormResetHandler: function() {
            if (!this.form.length) {
                return;
            }
            var instances = this.form.data("ui-form-reset-instances");
            instances.splice($.inArray(this, instances), 1);
            if (instances.length) {
                this.form.data("ui-form-reset-instances", instances);
            } else {
                this.form.removeData("ui-form-reset-instances").off("reset.ui-form-reset");
            }
        }
    };
    /*!
     * jQuery UI Support for jQuery core 1.7.x 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     *
     */
    if ($.fn.jquery.substring(0, 3) === "1.7") {
        $.each(["Width", "Height"], function(i, name) {
            var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
                type = name.toLowerCase(),
                orig = {
                    innerWidth: $.fn.innerWidth,
                    innerHeight: $.fn.innerHeight,
                    outerWidth: $.fn.outerWidth,
                    outerHeight: $.fn.outerHeight
                };

            function reduce(elem, size, border, margin) {
                $.each(side, function() {
                    size -= parseFloat($.css(elem, "padding" + this)) || 0;
                    if (border) {
                        size -= parseFloat($.css(elem, "border" + this + "Width")) || 0;
                    }
                    if (margin) {
                        size -= parseFloat($.css(elem, "margin" + this)) || 0;
                    }
                });
                return size;
            }
            $.fn["inner" + name] = function(size) {
                if (size === undefined) {
                    return orig["inner" + name].call(this);
                }
                return this.each(function() {
                    $(this).css(type, reduce(this, size) + "px");
                });
            };
            $.fn["outer" + name] = function(size, margin) {
                if (typeof size !== "number") {
                    return orig["outer" + name].call(this, size);
                }
                return this.each(function() {
                    $(this).css(type, reduce(this, size, true, margin) + "px");
                });
            };
        });
        $.fn.addBack = function(selector) {
            return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
        };
    };
    /*!
     * jQuery UI Keycode 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var keycode = $.ui.keyCode = {
        BACKSPACE: 8,
        COMMA: 188,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        LEFT: 37,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SPACE: 32,
        TAB: 9,
        UP: 38
    };
    var escapeSelector = $.ui.escapeSelector = (function() {
        var selectorEscape = /([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;
        return function(selector) {
            return selector.replace(selectorEscape, "\\$1");
        };
    })();
    /*!
     * jQuery UI Labels 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var labels = $.fn.labels = function() {
        var ancestor, selector, id, labels, ancestors;
        if (this[0].labels && this[0].labels.length) {
            return this.pushStack(this[0].labels);
        }
        labels = this.eq(0).parents("label");
        id = this.attr("id");
        if (id) {
            ancestor = this.eq(0).parents().last();
            ancestors = ancestor.add(ancestor.length ? ancestor.siblings() : this.siblings());
            selector = "label[for='" + $.ui.escapeSelector(id) + "']";
            labels = labels.add(ancestors.find(selector).addBack(selector));
        }
        return this.pushStack(labels);
    };
    /*!
     * jQuery UI Scroll Parent 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var scrollParent = $.fn.scrollParent = function(includeHidden) {
        var position = this.css("position"),
            excludeStaticParent = position === "absolute",
            overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
            scrollParent = this.parents().filter(function() {
                var parent = $(this);
                if (excludeStaticParent && parent.css("position") === "static") {
                    return false;
                }
                return overflowRegex.test(parent.css("overflow") + parent.css("overflow-y") +
                    parent.css("overflow-x"));
            }).eq(0);
        return position === "fixed" || !scrollParent.length ? $(this[0].ownerDocument || document) : scrollParent;
    };
    /*!
     * jQuery UI Tabbable 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var tabbable = $.extend($.expr[":"], {
        tabbable: function(element) {
            var tabIndex = $.attr(element, "tabindex"),
                hasTabindex = tabIndex != null;
            return (!hasTabindex || tabIndex >= 0) && $.ui.focusable(element, hasTabindex);
        }
    });
    /*!
     * jQuery UI Unique ID 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var uniqueId = $.fn.extend({
        uniqueId: (function() {
            var uuid = 0;
            return function() {
                return this.each(function() {
                    if (!this.id) {
                        this.id = "ui-id-" + (++uuid);
                    }
                });
            };
        })(),
        removeUniqueId: function() {
            return this.each(function() {
                if (/^ui-id-\d+$/.test(this.id)) {
                    $(this).removeAttr("id");
                }
            });
        }
    });
    /*!
     * jQuery UI Accordion 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var widgetsAccordion = $.widget("ui.accordion", {
        version: "1.12.1",
        options: {
            active: 0,
            animate: {},
            classes: {
                "ui-accordion-header": "ui-corner-top",
                "ui-accordion-header-collapsed": "ui-corner-all",
                "ui-accordion-content": "ui-corner-bottom"
            },
            collapsible: false,
            event: "click",
            header: "> li > :first-child, > :not(li):even",
            heightStyle: "auto",
            icons: {
                activeHeader: "ui-icon-triangle-1-s",
                header: "ui-icon-triangle-1-e"
            },
            activate: null,
            beforeActivate: null
        },
        hideProps: {
            borderTopWidth: "hide",
            borderBottomWidth: "hide",
            paddingTop: "hide",
            paddingBottom: "hide",
            height: "hide"
        },
        showProps: {
            borderTopWidth: "show",
            borderBottomWidth: "show",
            paddingTop: "show",
            paddingBottom: "show",
            height: "show"
        },
        _create: function() {
            var options = this.options;
            this.prevShow = this.prevHide = $();
            this._addClass("ui-accordion", "ui-widget ui-helper-reset");
            this.element.attr("role", "tablist");
            if (!options.collapsible && (options.active === false || options.active == null)) {
                options.active = 0;
            }
            this._processPanels();
            if (options.active < 0) {
                options.active += this.headers.length;
            }
            this._refresh();
        },
        _getCreateEventData: function() {
            return {
                header: this.active,
                panel: !this.active.length ? $() : this.active.next()
            };
        },
        _createIcons: function() {
            var icon, children, icons = this.options.icons;
            if (icons) {
                icon = $("<span>");
                this._addClass(icon, "ui-accordion-header-icon", "ui-icon " + icons.header);
                icon.prependTo(this.headers);
                children = this.active.children(".ui-accordion-header-icon");
                this._removeClass(children, icons.header)._addClass(children, null, icons.activeHeader)._addClass(this.headers, "ui-accordion-icons");
            }
        },
        _destroyIcons: function() {
            this._removeClass(this.headers, "ui-accordion-icons");
            this.headers.children(".ui-accordion-header-icon").remove();
        },
        _destroy: function() {
            var contents;
            this.element.removeAttr("role");
            this.headers.removeAttr("role aria-expanded aria-selected aria-controls tabIndex").removeUniqueId();
            this._destroyIcons();
            contents = this.headers.next().css("display", "").removeAttr("role aria-hidden aria-labelledby").removeUniqueId();
            if (this.options.heightStyle !== "content") {
                contents.css("height", "");
            }
        },
        _setOption: function(key, value) {
            if (key === "active") {
                this._activate(value);
                return;
            }
            if (key === "event") {
                if (this.options.event) {
                    this._off(this.headers, this.options.event);
                }
                this._setupEvents(value);
            }
            this._super(key, value);
            if (key === "collapsible" && !value && this.options.active === false) {
                this._activate(0);
            }
            if (key === "icons") {
                this._destroyIcons();
                if (value) {
                    this._createIcons();
                }
            }
        },
        _setOptionDisabled: function(value) {
            this._super(value);
            this.element.attr("aria-disabled", value);
            this._toggleClass(null, "ui-state-disabled", !!value);
            this._toggleClass(this.headers.add(this.headers.next()), null, "ui-state-disabled", !!value);
        },
        _keydown: function(event) {
            if (event.altKey || event.ctrlKey) {
                return;
            }
            var keyCode = $.ui.keyCode,
                length = this.headers.length,
                currentIndex = this.headers.index(event.target),
                toFocus = false;
            switch (event.keyCode) {
                case keyCode.RIGHT:
                case keyCode.DOWN:
                    toFocus = this.headers[(currentIndex + 1) % length];
                    break;
                case keyCode.LEFT:
                case keyCode.UP:
                    toFocus = this.headers[(currentIndex - 1 + length) % length];
                    break;
                case keyCode.SPACE:
                case keyCode.ENTER:
                    this._eventHandler(event);
                    break;
                case keyCode.HOME:
                    toFocus = this.headers[0];
                    break;
                case keyCode.END:
                    toFocus = this.headers[length - 1];
                    break;
            }
            if (toFocus) {
                $(event.target).attr("tabIndex", -1);
                $(toFocus).attr("tabIndex", 0);
                $(toFocus).trigger("focus");
                event.preventDefault();
            }
        },
        _panelKeyDown: function(event) {
            if (event.keyCode === $.ui.keyCode.UP && event.ctrlKey) {
                $(event.currentTarget).prev().trigger("focus");
            }
        },
        refresh: function() {
            var options = this.options;
            this._processPanels();
            if ((options.active === false && options.collapsible === true) || !this.headers.length) {
                options.active = false;
                this.active = $();
            } else if (options.active === false) {
                this._activate(0);
            } else if (this.active.length && !$.contains(this.element[0], this.active[0])) {
                if (this.headers.length === this.headers.find(".ui-state-disabled").length) {
                    options.active = false;
                    this.active = $();
                } else {
                    this._activate(Math.max(0, options.active - 1));
                }
            } else {
                options.active = this.headers.index(this.active);
            }
            this._destroyIcons();
            this._refresh();
        },
        _processPanels: function() {
            var prevHeaders = this.headers,
                prevPanels = this.panels;
            this.headers = this.element.find(this.options.header);
            this._addClass(this.headers, "ui-accordion-header ui-accordion-header-collapsed", "ui-state-default");
            this.panels = this.headers.next().filter(":not(.ui-accordion-content-active)").hide();
            this._addClass(this.panels, "ui-accordion-content", "ui-helper-reset ui-widget-content");
            if (prevPanels) {
                this._off(prevHeaders.not(this.headers));
                this._off(prevPanels.not(this.panels));
            }
        },
        _refresh: function() {
            var maxHeight, options = this.options,
                heightStyle = options.heightStyle,
                parent = this.element.parent();
            this.active = this._findActive(options.active);
            this._addClass(this.active, "ui-accordion-header-active", "ui-state-active")._removeClass(this.active, "ui-accordion-header-collapsed");
            this._addClass(this.active.next(), "ui-accordion-content-active");
            this.active.next().show();
            this.headers.attr("role", "tab").each(function() {
                var header = $(this),
                    headerId = header.uniqueId().attr("id"),
                    panel = header.next(),
                    panelId = panel.uniqueId().attr("id");
                header.attr("aria-controls", panelId);
                panel.attr("aria-labelledby", headerId);
            }).next().attr("role", "tabpanel");
            this.headers.not(this.active).attr({
                "aria-selected": "false",
                "aria-expanded": "false",
                tabIndex: -1
            }).next().attr({
                "aria-hidden": "true"
            }).hide();
            if (!this.active.length) {
                this.headers.eq(0).attr("tabIndex", 0);
            } else {
                this.active.attr({
                    "aria-selected": "true",
                    "aria-expanded": "true",
                    tabIndex: 0
                }).next().attr({
                    "aria-hidden": "false"
                });
            }
            this._createIcons();
            this._setupEvents(options.event);
            if (heightStyle === "fill") {
                maxHeight = parent.height();
                this.element.siblings(":visible").each(function() {
                    var elem = $(this),
                        position = elem.css("position");
                    if (position === "absolute" || position === "fixed") {
                        return;
                    }
                    maxHeight -= elem.outerHeight(true);
                });
                this.headers.each(function() {
                    maxHeight -= $(this).outerHeight(true);
                });
                this.headers.next().each(function() {
                    $(this).height(Math.max(0, maxHeight -
                        $(this).innerHeight() + $(this).height()));
                }).css("overflow", "auto");
            } else if (heightStyle === "auto") {
                maxHeight = 0;
                this.headers.next().each(function() {
                    var isVisible = $(this).is(":visible");
                    if (!isVisible) {
                        $(this).show();
                    }
                    maxHeight = Math.max(maxHeight, $(this).css("height", "").height());
                    if (!isVisible) {
                        $(this).hide();
                    }
                }).height(maxHeight);
            }
        },
        _activate: function(index) {
            var active = this._findActive(index)[0];
            if (active === this.active[0]) {
                return;
            }
            active = active || this.active[0];
            this._eventHandler({
                target: active,
                currentTarget: active,
                preventDefault: $.noop
            });
        },
        _findActive: function(selector) {
            return typeof selector === "number" ? this.headers.eq(selector) : $();
        },
        _setupEvents: function(event) {
            var events = {
                keydown: "_keydown"
            };
            if (event) {
                $.each(event.split(" "), function(index, eventName) {
                    events[eventName] = "_eventHandler";
                });
            }
            this._off(this.headers.add(this.headers.next()));
            this._on(this.headers, events);
            this._on(this.headers.next(), {
                keydown: "_panelKeyDown"
            });
            this._hoverable(this.headers);
            this._focusable(this.headers);
        },
        _eventHandler: function(event) {
            var activeChildren, clickedChildren, options = this.options,
                active = this.active,
                clicked = $(event.currentTarget),
                clickedIsActive = clicked[0] === active[0],
                collapsing = clickedIsActive && options.collapsible,
                toShow = collapsing ? $() : clicked.next(),
                toHide = active.next(),
                eventData = {
                    oldHeader: active,
                    oldPanel: toHide,
                    newHeader: collapsing ? $() : clicked,
                    newPanel: toShow
                };
            event.preventDefault();
            if ((clickedIsActive && !options.collapsible) || (this._trigger("beforeActivate", event, eventData) === false)) {
                return;
            }
            options.active = collapsing ? false : this.headers.index(clicked);
            this.active = clickedIsActive ? $() : clicked;
            this._toggle(eventData);
            this._removeClass(active, "ui-accordion-header-active", "ui-state-active");
            if (options.icons) {
                activeChildren = active.children(".ui-accordion-header-icon");
                this._removeClass(activeChildren, null, options.icons.activeHeader)._addClass(activeChildren, null, options.icons.header);
            }
            if (!clickedIsActive) {
                this._removeClass(clicked, "ui-accordion-header-collapsed")._addClass(clicked, "ui-accordion-header-active", "ui-state-active");
                if (options.icons) {
                    clickedChildren = clicked.children(".ui-accordion-header-icon");
                    this._removeClass(clickedChildren, null, options.icons.header)._addClass(clickedChildren, null, options.icons.activeHeader);
                }
                this._addClass(clicked.next(), "ui-accordion-content-active");
            }
        },
        _toggle: function(data) {
            var toShow = data.newPanel,
                toHide = this.prevShow.length ? this.prevShow : data.oldPanel;
            this.prevShow.add(this.prevHide).stop(true, true);
            this.prevShow = toShow;
            this.prevHide = toHide;
            if (this.options.animate) {
                this._animate(toShow, toHide, data);
            } else {
                toHide.hide();
                toShow.show();
                this._toggleComplete(data);
            }
            toHide.attr({
                "aria-hidden": "true"
            });
            toHide.prev().attr({
                "aria-selected": "false",
                "aria-expanded": "false"
            });
            if (toShow.length && toHide.length) {
                toHide.prev().attr({
                    "tabIndex": -1,
                    "aria-expanded": "false"
                });
            } else if (toShow.length) {
                this.headers.filter(function() {
                    return parseInt($(this).attr("tabIndex"), 10) === 0;
                }).attr("tabIndex", -1);
            }
            toShow.attr("aria-hidden", "false").prev().attr({
                "aria-selected": "true",
                "aria-expanded": "true",
                tabIndex: 0
            });
        },
        _animate: function(toShow, toHide, data) {
            var total, easing, duration, that = this,
                adjust = 0,
                boxSizing = toShow.css("box-sizing"),
                down = toShow.length && (!toHide.length || (toShow.index() < toHide.index())),
                animate = this.options.animate || {},
                options = down && animate.down || animate,
                complete = function() {
                    that._toggleComplete(data);
                };
            if (typeof options === "number") {
                duration = options;
            }
            if (typeof options === "string") {
                easing = options;
            }
            easing = easing || options.easing || animate.easing;
            duration = duration || options.duration || animate.duration;
            if (!toHide.length) {
                return toShow.animate(this.showProps, duration, easing, complete);
            }
            if (!toShow.length) {
                return toHide.animate(this.hideProps, duration, easing, complete);
            }
            total = toShow.show().outerHeight();
            toHide.animate(this.hideProps, {
                duration: duration,
                easing: easing,
                step: function(now, fx) {
                    fx.now = Math.round(now);
                }
            });
            toShow.hide().animate(this.showProps, {
                duration: duration,
                easing: easing,
                complete: complete,
                step: function(now, fx) {
                    fx.now = Math.round(now);
                    if (fx.prop !== "height") {
                        if (boxSizing === "content-box") {
                            adjust += fx.now;
                        }
                    } else if (that.options.heightStyle !== "content") {
                        fx.now = Math.round(total - toHide.outerHeight() - adjust);
                        adjust = 0;
                    }
                }
            });
        },
        _toggleComplete: function(data) {
            var toHide = data.oldPanel,
                prev = toHide.prev();
            this._removeClass(toHide, "ui-accordion-content-active");
            this._removeClass(prev, "ui-accordion-header-active")._addClass(prev, "ui-accordion-header-collapsed");
            if (toHide.length) {
                toHide.parent()[0].className = toHide.parent()[0].className;
            }
            this._trigger("activate", null, data);
        }
    });
    var safeActiveElement = $.ui.safeActiveElement = function(document) {
        var activeElement;
        try {
            activeElement = document.activeElement;
        } catch (error) {
            activeElement = document.body;
        }
        if (!activeElement) {
            activeElement = document.body;
        }
        if (!activeElement.nodeName) {
            activeElement = document.body;
        }
        return activeElement;
    };
    /*!
     * jQuery UI Menu 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var widgetsMenu = $.widget("ui.menu", {
        version: "1.12.1",
        defaultElement: "<ul>",
        delay: 300,
        options: {
            icons: {
                submenu: "ui-icon-caret-1-e"
            },
            items: "> *",
            menus: "ul",
            position: {
                my: "left top",
                at: "right top"
            },
            role: "menu",
            blur: null,
            focus: null,
            select: null
        },
        _create: function() {
            this.activeMenu = this.element;
            this.mouseHandled = false;
            this.element.uniqueId().attr({
                role: this.options.role,
                tabIndex: 0
            });
            this._addClass("ui-menu", "ui-widget ui-widget-content");
            this._on({
                "mousedown .ui-menu-item": function(event) {
                    event.preventDefault();
                },
                "click .ui-menu-item": function(event) {
                    var target = $(event.target);
                    var active = $($.ui.safeActiveElement(this.document[0]));
                    if (!this.mouseHandled && target.not(".ui-state-disabled").length) {
                        this.select(event);
                        if (!event.isPropagationStopped()) {
                            this.mouseHandled = true;
                        }
                        if (target.has(".ui-menu").length) {
                            this.expand(event);
                        } else if (!this.element.is(":focus") && active.closest(".ui-menu").length) {
                            this.element.trigger("focus", [true]);
                            if (this.active && this.active.parents(".ui-menu").length === 1) {
                                clearTimeout(this.timer);
                            }
                        }
                    }
                },
                "mouseenter .ui-menu-item": function(event) {
                    if (this.previousFilter) {
                        return;
                    }
                    var actualTarget = $(event.target).closest(".ui-menu-item"),
                        target = $(event.currentTarget);
                    if (actualTarget[0] !== target[0]) {
                        return;
                    }
                    this._removeClass(target.siblings().children(".ui-state-active"), null, "ui-state-active");
                    this.focus(event, target);
                },
                mouseleave: "collapseAll",
                "mouseleave .ui-menu": "collapseAll",
                focus: function(event, keepActiveItem) {
                    var item = this.active || this.element.find(this.options.items).eq(0);
                    if (!keepActiveItem) {
                        this.focus(event, item);
                    }
                },
                blur: function(event) {
                    this._delay(function() {
                        var notContained = !$.contains(this.element[0], $.ui.safeActiveElement(this.document[0]));
                        if (notContained) {
                            this.collapseAll(event);
                        }
                    });
                },
                keydown: "_keydown"
            });
            this.refresh();
            this._on(this.document, {
                click: function(event) {
                    if (this._closeOnDocumentClick(event)) {
                        this.collapseAll(event);
                    }
                    this.mouseHandled = false;
                }
            });
        },
        _destroy: function() {
            var items = this.element.find(".ui-menu-item").removeAttr("role aria-disabled"),
                submenus = items.children(".ui-menu-item-wrapper").removeUniqueId().removeAttr("tabIndex role aria-haspopup");
            this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeAttr("role aria-labelledby aria-expanded aria-hidden aria-disabled " + "tabIndex").removeUniqueId().show();
            submenus.children().each(function() {
                var elem = $(this);
                if (elem.data("ui-menu-submenu-caret")) {
                    elem.remove();
                }
            });
        },
        _keydown: function(event) {
            var match, prev, character, skip, preventDefault = true;
            switch (event.keyCode) {
                case $.ui.keyCode.PAGE_UP:
                    this.previousPage(event);
                    break;
                case $.ui.keyCode.PAGE_DOWN:
                    this.nextPage(event);
                    break;
                case $.ui.keyCode.HOME:
                    this._move("first", "first", event);
                    break;
                case $.ui.keyCode.END:
                    this._move("last", "last", event);
                    break;
                case $.ui.keyCode.UP:
                    this.previous(event);
                    break;
                case $.ui.keyCode.DOWN:
                    this.next(event);
                    break;
                case $.ui.keyCode.LEFT:
                    this.collapse(event);
                    break;
                case $.ui.keyCode.RIGHT:
                    if (this.active && !this.active.is(".ui-state-disabled")) {
                        this.expand(event);
                    }
                    break;
                case $.ui.keyCode.ENTER:
                case $.ui.keyCode.SPACE:
                    this._activate(event);
                    break;
                case $.ui.keyCode.ESCAPE:
                    this.collapse(event);
                    break;
                default:
                    preventDefault = false;
                    prev = this.previousFilter || "";
                    skip = false;
                    character = event.keyCode >= 96 && event.keyCode <= 105 ? (event.keyCode - 96).toString() : String.fromCharCode(event.keyCode);
                    clearTimeout(this.filterTimer);
                    if (character === prev) {
                        skip = true;
                    } else {
                        character = prev + character;
                    }
                    match = this._filterMenuItems(character);
                    match = skip && match.index(this.active.next()) !== -1 ? this.active.nextAll(".ui-menu-item") : match;
                    if (!match.length) {
                        character = String.fromCharCode(event.keyCode);
                        match = this._filterMenuItems(character);
                    }
                    if (match.length) {
                        this.focus(event, match);
                        this.previousFilter = character;
                        this.filterTimer = this._delay(function() {
                            delete this.previousFilter;
                        }, 1000);
                    } else {
                        delete this.previousFilter;
                    }
            }
            if (preventDefault) {
                event.preventDefault();
            }
        },
        _activate: function(event) {
            if (this.active && !this.active.is(".ui-state-disabled")) {
                if (this.active.children("[aria-haspopup='true']").length) {
                    this.expand(event);
                } else {
                    this.select(event);
                }
            }
        },
        refresh: function() {
            var menus, items, newSubmenus, newItems, newWrappers, that = this,
                icon = this.options.icons.submenu,
                submenus = this.element.find(this.options.menus);
            this._toggleClass("ui-menu-icons", null, !!this.element.find(".ui-icon").length);
            newSubmenus = submenus.filter(":not(.ui-menu)").hide().attr({
                role: this.options.role,
                "aria-hidden": "true",
                "aria-expanded": "false"
            }).each(function() {
                var menu = $(this),
                    item = menu.prev(),
                    submenuCaret = $("<span>").data("ui-menu-submenu-caret", true);
                that._addClass(submenuCaret, "ui-menu-icon", "ui-icon " + icon);
                item.attr("aria-haspopup", "true").prepend(submenuCaret);
                menu.attr("aria-labelledby", item.attr("id"));
            });
            this._addClass(newSubmenus, "ui-menu", "ui-widget ui-widget-content ui-front");
            menus = submenus.add(this.element);
            items = menus.find(this.options.items);
            items.not(".ui-menu-item").each(function() {
                var item = $(this);
                if (that._isDivider(item)) {
                    that._addClass(item, "ui-menu-divider", "ui-widget-content");
                }
            });
            newItems = items.not(".ui-menu-item, .ui-menu-divider");
            newWrappers = newItems.children().not(".ui-menu").uniqueId().attr({
                tabIndex: -1,
                role: this._itemRole()
            });
            this._addClass(newItems, "ui-menu-item")._addClass(newWrappers, "ui-menu-item-wrapper");
            items.filter(".ui-state-disabled").attr("aria-disabled", "true");
            if (this.active && !$.contains(this.element[0], this.active[0])) {
                this.blur();
            }
        },
        _itemRole: function() {
            return {
                menu: "menuitem",
                listbox: "option"
            }[this.options.role];
        },
        _setOption: function(key, value) {
            if (key === "icons") {
                var icons = this.element.find(".ui-menu-icon");
                this._removeClass(icons, null, this.options.icons.submenu)._addClass(icons, null, value.submenu);
            }
            this._super(key, value);
        },
        _setOptionDisabled: function(value) {
            this._super(value);
            this.element.attr("aria-disabled", String(value));
            this._toggleClass(null, "ui-state-disabled", !!value);
        },
        focus: function(event, item) {
            var nested, focused, activeParent;
            this.blur(event, event && event.type === "focus");
            this._scrollIntoView(item);
            this.active = item.first();
            focused = this.active.children(".ui-menu-item-wrapper");
            this._addClass(focused, null, "ui-state-active");
            if (this.options.role) {
                this.element.attr("aria-activedescendant", focused.attr("id"));
            }
            activeParent = this.active.parent().closest(".ui-menu-item").children(".ui-menu-item-wrapper");
            this._addClass(activeParent, null, "ui-state-active");
            if (event && event.type === "keydown") {
                this._close();
            } else {
                this.timer = this._delay(function() {
                    this._close();
                }, this.delay);
            }
            nested = item.children(".ui-menu");
            if (nested.length && event && (/^mouse/.test(event.type))) {
                this._startOpening(nested);
            }
            this.activeMenu = item.parent();
            this._trigger("focus", event, {
                item: item
            });
        },
        _scrollIntoView: function(item) {
            var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
            if (this._hasScroll()) {
                borderTop = parseFloat($.css(this.activeMenu[0], "borderTopWidth")) || 0;
                paddingTop = parseFloat($.css(this.activeMenu[0], "paddingTop")) || 0;
                offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
                scroll = this.activeMenu.scrollTop();
                elementHeight = this.activeMenu.height();
                itemHeight = item.outerHeight();
                if (offset < 0) {
                    this.activeMenu.scrollTop(scroll + offset);
                } else if (offset + itemHeight > elementHeight) {
                    this.activeMenu.scrollTop(scroll + offset - elementHeight + itemHeight);
                }
            }
        },
        blur: function(event, fromFocus) {
            if (!fromFocus) {
                clearTimeout(this.timer);
            }
            if (!this.active) {
                return;
            }
            this._removeClass(this.active.children(".ui-menu-item-wrapper"), null, "ui-state-active");
            this._trigger("blur", event, {
                item: this.active
            });
            this.active = null;
        },
        _startOpening: function(submenu) {
            clearTimeout(this.timer);
            if (submenu.attr("aria-hidden") !== "true") {
                return;
            }
            this.timer = this._delay(function() {
                this._close();
                this._open(submenu);
            }, this.delay);
        },
        _open: function(submenu) {
            var position = $.extend({ of: this.active
            }, this.options.position);
            clearTimeout(this.timer);
            this.element.find(".ui-menu").not(submenu.parents(".ui-menu")).hide().attr("aria-hidden", "true");
            submenu.show().removeAttr("aria-hidden").attr("aria-expanded", "true").position(position);
        },
        collapseAll: function(event, all) {
            clearTimeout(this.timer);
            this.timer = this._delay(function() {
                var currentMenu = all ? this.element : $(event && event.target).closest(this.element.find(".ui-menu"));
                if (!currentMenu.length) {
                    currentMenu = this.element;
                }
                this._close(currentMenu);
                this.blur(event);
                this._removeClass(currentMenu.find(".ui-state-active"), null, "ui-state-active");
                this.activeMenu = currentMenu;
            }, this.delay);
        },
        _close: function(startMenu) {
            if (!startMenu) {
                startMenu = this.active ? this.active.parent() : this.element;
            }
            startMenu.find(".ui-menu").hide().attr("aria-hidden", "true").attr("aria-expanded", "false");
        },
        _closeOnDocumentClick: function(event) {
            return !$(event.target).closest(".ui-menu").length;
        },
        _isDivider: function(item) {
            return !/[^\-\u2014\u2013\s]/.test(item.text());
        },
        collapse: function(event) {
            var newItem = this.active && this.active.parent().closest(".ui-menu-item", this.element);
            if (newItem && newItem.length) {
                this._close();
                this.focus(event, newItem);
            }
        },
        expand: function(event) {
            var newItem = this.active && this.active.children(".ui-menu ").find(this.options.items).first();
            if (newItem && newItem.length) {
                this._open(newItem.parent());
                this._delay(function() {
                    this.focus(event, newItem);
                });
            }
        },
        next: function(event) {
            this._move("next", "first", event);
        },
        previous: function(event) {
            this._move("prev", "last", event);
        },
        isFirstItem: function() {
            return this.active && !this.active.prevAll(".ui-menu-item").length;
        },
        isLastItem: function() {
            return this.active && !this.active.nextAll(".ui-menu-item").length;
        },
        _move: function(direction, filter, event) {
            var next;
            if (this.active) {
                if (direction === "first" || direction === "last") {
                    next = this.active[direction === "first" ? "prevAll" : "nextAll"](".ui-menu-item").eq(-1);
                } else {
                    next = this.active[direction + "All"](".ui-menu-item").eq(0);
                }
            }
            if (!next || !next.length || !this.active) {
                next = this.activeMenu.find(this.options.items)[filter]();
            }
            this.focus(event, next);
        },
        nextPage: function(event) {
            var item, base, height;
            if (!this.active) {
                this.next(event);
                return;
            }
            if (this.isLastItem()) {
                return;
            }
            if (this._hasScroll()) {
                base = this.active.offset().top;
                height = this.element.height();
                this.active.nextAll(".ui-menu-item").each(function() {
                    item = $(this);
                    return item.offset().top - base - height < 0;
                });
                this.focus(event, item);
            } else {
                this.focus(event, this.activeMenu.find(this.options.items)[!this.active ? "first" : "last"]());
            }
        },
        previousPage: function(event) {
            var item, base, height;
            if (!this.active) {
                this.next(event);
                return;
            }
            if (this.isFirstItem()) {
                return;
            }
            if (this._hasScroll()) {
                base = this.active.offset().top;
                height = this.element.height();
                this.active.prevAll(".ui-menu-item").each(function() {
                    item = $(this);
                    return item.offset().top - base + height > 0;
                });
                this.focus(event, item);
            } else {
                this.focus(event, this.activeMenu.find(this.options.items).first());
            }
        },
        _hasScroll: function() {
            return this.element.outerHeight() < this.element.prop("scrollHeight");
        },
        select: function(event) {
            this.active = this.active || $(event.target).closest(".ui-menu-item");
            var ui = {
                item: this.active
            };
            if (!this.active.has(".ui-menu").length) {
                this.collapseAll(event, true);
            }
            this._trigger("select", event, ui);
        },
        _filterMenuItems: function(character) {
            var escapedCharacter = character.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"),
                regex = new RegExp("^" + escapedCharacter, "i");
            return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function() {
                return regex.test($.trim($(this).children(".ui-menu-item-wrapper").text()));
            });
        }
    });
    /*!
     * jQuery UI Autocomplete 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.widget("ui.autocomplete", {
        version: "1.12.1",
        defaultElement: "<input>",
        options: {
            appendTo: null,
            autoFocus: false,
            delay: 300,
            minLength: 1,
            position: {
                my: "left top",
                at: "left bottom",
                collision: "none"
            },
            source: null,
            change: null,
            close: null,
            focus: null,
            open: null,
            response: null,
            search: null,
            select: null
        },
        requestIndex: 0,
        pending: 0,
        _create: function() {
            var suppressKeyPress, suppressKeyPressRepeat, suppressInput, nodeName = this.element[0].nodeName.toLowerCase(),
                isTextarea = nodeName === "textarea",
                isInput = nodeName === "input";
            this.isMultiLine = isTextarea || !isInput && this._isContentEditable(this.element);
            this.valueMethod = this.element[isTextarea || isInput ? "val" : "text"];
            this.isNewMenu = true;
            this._addClass("ui-autocomplete-input");
            this.element.attr("autocomplete", "off");
            this._on(this.element, {
                keydown: function(event) {
                    if (this.element.prop("readOnly")) {
                        suppressKeyPress = true;
                        suppressInput = true;
                        suppressKeyPressRepeat = true;
                        return;
                    }
                    suppressKeyPress = false;
                    suppressInput = false;
                    suppressKeyPressRepeat = false;
                    var keyCode = $.ui.keyCode;
                    switch (event.keyCode) {
                        case keyCode.PAGE_UP:
                            suppressKeyPress = true;
                            this._move("previousPage", event);
                            break;
                        case keyCode.PAGE_DOWN:
                            suppressKeyPress = true;
                            this._move("nextPage", event);
                            break;
                        case keyCode.UP:
                            suppressKeyPress = true;
                            this._keyEvent("previous", event);
                            break;
                        case keyCode.DOWN:
                            suppressKeyPress = true;
                            this._keyEvent("next", event);
                            break;
                        case keyCode.ENTER:
                            if (this.menu.active) {
                                suppressKeyPress = true;
                                event.preventDefault();
                                this.menu.select(event);
                            }
                            break;
                        case keyCode.TAB:
                            if (this.menu.active) {
                                this.menu.select(event);
                            }
                            break;
                        case keyCode.ESCAPE:
                            if (this.menu.element.is(":visible")) {
                                if (!this.isMultiLine) {
                                    this._value(this.term);
                                }
                                this.close(event);
                                event.preventDefault();
                            }
                            break;
                        default:
                            suppressKeyPressRepeat = true;
                            this._searchTimeout(event);
                            break;
                    }
                },
                keypress: function(event) {
                    if (suppressKeyPress) {
                        suppressKeyPress = false;
                        if (!this.isMultiLine || this.menu.element.is(":visible")) {
                            event.preventDefault();
                        }
                        return;
                    }
                    if (suppressKeyPressRepeat) {
                        return;
                    }
                    var keyCode = $.ui.keyCode;
                    switch (event.keyCode) {
                        case keyCode.PAGE_UP:
                            this._move("previousPage", event);
                            break;
                        case keyCode.PAGE_DOWN:
                            this._move("nextPage", event);
                            break;
                        case keyCode.UP:
                            this._keyEvent("previous", event);
                            break;
                        case keyCode.DOWN:
                            this._keyEvent("next", event);
                            break;
                    }
                },
                input: function(event) {
                    if (suppressInput) {
                        suppressInput = false;
                        event.preventDefault();
                        return;
                    }
                    this._searchTimeout(event);
                },
                focus: function() {
                    this.selectedItem = null;
                    this.previous = this._value();
                },
                blur: function(event) {
                    if (this.cancelBlur) {
                        delete this.cancelBlur;
                        return;
                    }
                    clearTimeout(this.searching);
                    this.close(event);
                    this._change(event);
                }
            });
            this._initSource();
            this.menu = $("<ul>").appendTo(this._appendTo()).menu({
                role: null
            }).hide().menu("instance");
            this._addClass(this.menu.element, "ui-autocomplete", "ui-front");
            this._on(this.menu.element, {
                mousedown: function(event) {
                    event.preventDefault();
                    this.cancelBlur = true;
                    this._delay(function() {
                        delete this.cancelBlur;
                        if (this.element[0] !== $.ui.safeActiveElement(this.document[0])) {
                            this.element.trigger("focus");
                        }
                    });
                },
                menufocus: function(event, ui) {
                    var label, item;
                    if (this.isNewMenu) {
                        this.isNewMenu = false;
                        if (event.originalEvent && /^mouse/.test(event.originalEvent.type)) {
                            this.menu.blur();
                            this.document.one("mousemove", function() {
                                $(event.target).trigger(event.originalEvent);
                            });
                            return;
                        }
                    }
                    item = ui.item.data("ui-autocomplete-item");
                    if (false !== this._trigger("focus", event, {
                            item: item
                        })) {
                        if (event.originalEvent && /^key/.test(event.originalEvent.type)) {
                            this._value(item.value);
                        }
                    }
                    label = ui.item.attr("aria-label") || item.value;
                    if (label && $.trim(label).length) {
                        this.liveRegion.children().hide();
                        $("<div>").text(label).appendTo(this.liveRegion);
                    }
                },
                menuselect: function(event, ui) {
                    var item = ui.item.data("ui-autocomplete-item"),
                        previous = this.previous;
                    if (this.element[0] !== $.ui.safeActiveElement(this.document[0])) {
                        this.element.trigger("focus");
                        this.previous = previous;
                        this._delay(function() {
                            this.previous = previous;
                            this.selectedItem = item;
                        });
                    }
                    if (false !== this._trigger("select", event, {
                            item: item
                        })) {
                        this._value(item.value);
                    }
                    this.term = this._value();
                    this.close(event);
                    this.selectedItem = item;
                }
            });
            this.liveRegion = $("<div>", {
                role: "status",
                "aria-live": "assertive",
                "aria-relevant": "additions"
            }).appendTo(this.document[0].body);
            this._addClass(this.liveRegion, null, "ui-helper-hidden-accessible");
            this._on(this.window, {
                beforeunload: function() {
                    this.element.removeAttr("autocomplete");
                }
            });
        },
        _destroy: function() {
            clearTimeout(this.searching);
            this.element.removeAttr("autocomplete");
            this.menu.element.remove();
            this.liveRegion.remove();
        },
        _setOption: function(key, value) {
            this._super(key, value);
            if (key === "source") {
                this._initSource();
            }
            if (key === "appendTo") {
                this.menu.element.appendTo(this._appendTo());
            }
            if (key === "disabled" && value && this.xhr) {
                this.xhr.abort();
            }
        },
        _isEventTargetInWidget: function(event) {
            var menuElement = this.menu.element[0];
            return event.target === this.element[0] || event.target === menuElement || $.contains(menuElement, event.target);
        },
        _closeOnClickOutside: function(event) {
            if (!this._isEventTargetInWidget(event)) {
                this.close();
            }
        },
        _appendTo: function() {
            var element = this.options.appendTo;
            if (element) {
                element = element.jquery || element.nodeType ? $(element) : this.document.find(element).eq(0);
            }
            if (!element || !element[0]) {
                element = this.element.closest(".ui-front, dialog");
            }
            if (!element.length) {
                element = this.document[0].body;
            }
            return element;
        },
        _initSource: function() {
            var array, url, that = this;
            if ($.isArray(this.options.source)) {
                array = this.options.source;
                this.source = function(request, response) {
                    response($.ui.autocomplete.filter(array, request.term));
                };
            } else if (typeof this.options.source === "string") {
                url = this.options.source;
                this.source = function(request, response) {
                    if (that.xhr) {
                        that.xhr.abort();
                    }
                    that.xhr = $.ajax({
                        url: url,
                        data: request,
                        dataType: "json",
                        success: function(data) {
                            response(data);
                        },
                        error: function() {
                            response([]);
                        }
                    });
                };
            } else {
                this.source = this.options.source;
            }
        },
        _searchTimeout: function(event) {
            clearTimeout(this.searching);
            this.searching = this._delay(function() {
                var equalValues = this.term === this._value(),
                    menuVisible = this.menu.element.is(":visible"),
                    modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
                if (!equalValues || (equalValues && !menuVisible && !modifierKey)) {
                    this.selectedItem = null;
                    this.search(null, event);
                }
            }, this.options.delay);
        },
        search: function(value, event) {
            value = value != null ? value : this._value();
            this.term = this._value();
            if (value.length < this.options.minLength) {
                return this.close(event);
            }
            if (this._trigger("search", event) === false) {
                return;
            }
            return this._search(value);
        },
        _search: function(value) {
            this.pending++;
            this._addClass("ui-autocomplete-loading");
            this.cancelSearch = false;
            this.source({
                term: value
            }, this._response());
        },
        _response: function() {
            var index = ++this.requestIndex;
            return $.proxy(function(content) {
                if (index === this.requestIndex) {
                    this.__response(content);
                }
                this.pending--;
                if (!this.pending) {
                    this._removeClass("ui-autocomplete-loading");
                }
            }, this);
        },
        __response: function(content) {
            if (content) {
                content = this._normalize(content);
            }
            this._trigger("response", null, {
                content: content
            });
            if (!this.options.disabled && content && content.length && !this.cancelSearch) {
                this._suggest(content);
                this._trigger("open");
            } else {
                this._close();
            }
        },
        close: function(event) {
            this.cancelSearch = true;
            this._close(event);
        },
        _close: function(event) {
            this._off(this.document, "mousedown");
            if (this.menu.element.is(":visible")) {
                this.menu.element.hide();
                this.menu.blur();
                this.isNewMenu = true;
                this._trigger("close", event);
            }
        },
        _change: function(event) {
            if (this.previous !== this._value()) {
                this._trigger("change", event, {
                    item: this.selectedItem
                });
            }
        },
        _normalize: function(items) {
            if (items.length && items[0].label && items[0].value) {
                return items;
            }
            return $.map(items, function(item) {
                if (typeof item === "string") {
                    return {
                        label: item,
                        value: item
                    };
                }
                return $.extend({}, item, {
                    label: item.label || item.value,
                    value: item.value || item.label
                });
            });
        },
        _suggest: function(items) {
            var ul = this.menu.element.empty();
            this._renderMenu(ul, items);
            this.isNewMenu = true;
            this.menu.refresh();
            ul.show();
            this._resizeMenu();
            ul.position($.extend({ of: this.element
            }, this.options.position));
            if (this.options.autoFocus) {
                this.menu.next();
            }
            this._on(this.document, {
                mousedown: "_closeOnClickOutside"
            });
        },
        _resizeMenu: function() {
            var ul = this.menu.element;
            ul.outerWidth(Math.max(ul.width("").outerWidth() + 1, this.element.outerWidth()));
        },
        _renderMenu: function(ul, items) {
            var that = this;
            $.each(items, function(index, item) {
                that._renderItemData(ul, item);
            });
        },
        _renderItemData: function(ul, item) {
            return this._renderItem(ul, item).data("ui-autocomplete-item", item);
        },
        _renderItem: function(ul, item) {
            return $("<li>").append($("<div>").text(item.label)).appendTo(ul);
        },
        _move: function(direction, event) {
            if (!this.menu.element.is(":visible")) {
                this.search(null, event);
                return;
            }
            if (this.menu.isFirstItem() && /^previous/.test(direction) || this.menu.isLastItem() && /^next/.test(direction)) {
                if (!this.isMultiLine) {
                    this._value(this.term);
                }
                this.menu.blur();
                return;
            }
            this.menu[direction](event);
        },
        widget: function() {
            return this.menu.element;
        },
        _value: function() {
            return this.valueMethod.apply(this.element, arguments);
        },
        _keyEvent: function(keyEvent, event) {
            if (!this.isMultiLine || this.menu.element.is(":visible")) {
                this._move(keyEvent, event);
                event.preventDefault();
            }
        },
        _isContentEditable: function(element) {
            if (!element.length) {
                return false;
            }
            var editable = element.prop("contentEditable");
            if (editable === "inherit") {
                return this._isContentEditable(element.parent());
            }
            return editable === "true";
        }
    });
    $.extend($.ui.autocomplete, {
        escapeRegex: function(value) {
            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
        },
        filter: function(array, term) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
            return $.grep(array, function(value) {
                return matcher.test(value.label || value.value || value);
            });
        }
    });
    $.widget("ui.autocomplete", $.ui.autocomplete, {
        options: {
            messages: {
                noResults: "No search results.",
                results: function(amount) {
                    return amount + (amount > 1 ? " results are" : " result is") + " available, use up and down arrow keys to navigate.";
                }
            }
        },
        __response: function(content) {
            var message;
            this._superApply(arguments);
            if (this.options.disabled || this.cancelSearch) {
                return;
            }
            if (content && content.length) {
                message = this.options.messages.results(content.length);
            } else {
                message = this.options.messages.noResults;
            }
            this.liveRegion.children().hide();
            $("<div>").text(message).appendTo(this.liveRegion);
        }
    });
    var widgetsAutocomplete = $.ui.autocomplete;
    /*!
     * jQuery UI Controlgroup 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var controlgroupCornerRegex = /ui-corner-([a-z]){2,6}/g;
    var widgetsControlgroup = $.widget("ui.controlgroup", {
        version: "1.12.1",
        defaultElement: "<div>",
        options: {
            direction: "horizontal",
            disabled: null,
            onlyVisible: true,
            items: {
                "button": "input[type=button], input[type=submit], input[type=reset], button, a",
                "controlgroupLabel": ".ui-controlgroup-label",
                "checkboxradio": "input[type='checkbox'], input[type='radio']",
                "selectmenu": "select",
                "spinner": ".ui-spinner-input"
            }
        },
        _create: function() {
            this._enhance();
        },
        _enhance: function() {
            this.element.attr("role", "toolbar");
            this.refresh();
        },
        _destroy: function() {
            this._callChildMethod("destroy");
            this.childWidgets.removeData("ui-controlgroup-data");
            this.element.removeAttr("role");
            if (this.options.items.controlgroupLabel) {
                this.element.find(this.options.items.controlgroupLabel).find(".ui-controlgroup-label-contents").contents().unwrap();
            }
        },
        _initWidgets: function() {
            var that = this,
                childWidgets = [];
            $.each(this.options.items, function(widget, selector) {
                var labels;
                var options = {};
                if (!selector) {
                    return;
                }
                if (widget === "controlgroupLabel") {
                    labels = that.element.find(selector);
                    labels.each(function() {
                        var element = $(this);
                        if (element.children(".ui-controlgroup-label-contents").length) {
                            return;
                        }
                        element.contents().wrapAll("<span class='ui-controlgroup-label-contents'></span>");
                    });
                    that._addClass(labels, null, "ui-widget ui-widget-content ui-state-default");
                    childWidgets = childWidgets.concat(labels.get());
                    return;
                }
                if (!$.fn[widget]) {
                    return;
                }
                if (that["_" + widget + "Options"]) {
                    options = that["_" + widget + "Options"]("middle");
                } else {
                    options = {
                        classes: {}
                    };
                }
                that.element.find(selector).each(function() {
                    var element = $(this);
                    var instance = element[widget]("instance");
                    var instanceOptions = $.widget.extend({}, options);
                    if (widget === "button" && element.parent(".ui-spinner").length) {
                        return;
                    }
                    if (!instance) {
                        instance = element[widget]()[widget]("instance");
                    }
                    if (instance) {
                        instanceOptions.classes = that._resolveClassesValues(instanceOptions.classes, instance);
                    }
                    element[widget](instanceOptions);
                    var widgetElement = element[widget]("widget");
                    $.data(widgetElement[0], "ui-controlgroup-data", instance ? instance : element[widget]("instance"));
                    childWidgets.push(widgetElement[0]);
                });
            });
            this.childWidgets = $($.unique(childWidgets));
            this._addClass(this.childWidgets, "ui-controlgroup-item");
        },
        _callChildMethod: function(method) {
            this.childWidgets.each(function() {
                var element = $(this),
                    data = element.data("ui-controlgroup-data");
                if (data && data[method]) {
                    data[method]();
                }
            });
        },
        _updateCornerClass: function(element, position) {
            var remove = "ui-corner-top ui-corner-bottom ui-corner-left ui-corner-right ui-corner-all";
            var add = this._buildSimpleOptions(position, "label").classes.label;
            this._removeClass(element, null, remove);
            this._addClass(element, null, add);
        },
        _buildSimpleOptions: function(position, key) {
            var direction = this.options.direction === "vertical";
            var result = {
                classes: {}
            };
            result.classes[key] = {
                "middle": "",
                "first": "ui-corner-" + (direction ? "top" : "left"),
                "last": "ui-corner-" + (direction ? "bottom" : "right"),
                "only": "ui-corner-all"
            }[position];
            return result;
        },
        _spinnerOptions: function(position) {
            var options = this._buildSimpleOptions(position, "ui-spinner");
            options.classes["ui-spinner-up"] = "";
            options.classes["ui-spinner-down"] = "";
            return options;
        },
        _buttonOptions: function(position) {
            return this._buildSimpleOptions(position, "ui-button");
        },
        _checkboxradioOptions: function(position) {
            return this._buildSimpleOptions(position, "ui-checkboxradio-label");
        },
        _selectmenuOptions: function(position) {
            var direction = this.options.direction === "vertical";
            return {
                width: direction ? "auto" : false,
                classes: {
                    middle: {
                        "ui-selectmenu-button-open": "",
                        "ui-selectmenu-button-closed": ""
                    },
                    first: {
                        "ui-selectmenu-button-open": "ui-corner-" + (direction ? "top" : "tl"),
                        "ui-selectmenu-button-closed": "ui-corner-" + (direction ? "top" : "left")
                    },
                    last: {
                        "ui-selectmenu-button-open": direction ? "" : "ui-corner-tr",
                        "ui-selectmenu-button-closed": "ui-corner-" + (direction ? "bottom" : "right")
                    },
                    only: {
                        "ui-selectmenu-button-open": "ui-corner-top",
                        "ui-selectmenu-button-closed": "ui-corner-all"
                    }
                }[position]
            };
        },
        _resolveClassesValues: function(classes, instance) {
            var result = {};
            $.each(classes, function(key) {
                var current = instance.options.classes[key] || "";
                current = $.trim(current.replace(controlgroupCornerRegex, ""));
                result[key] = (current + " " + classes[key]).replace(/\s+/g, " ");
            });
            return result;
        },
        _setOption: function(key, value) {
            if (key === "direction") {
                this._removeClass("ui-controlgroup-" + this.options.direction);
            }
            this._super(key, value);
            if (key === "disabled") {
                this._callChildMethod(value ? "disable" : "enable");
                return;
            }
            this.refresh();
        },
        refresh: function() {
            var children, that = this;
            this._addClass("ui-controlgroup ui-controlgroup-" + this.options.direction);
            if (this.options.direction === "horizontal") {
                this._addClass(null, "ui-helper-clearfix");
            }
            this._initWidgets();
            children = this.childWidgets;
            if (this.options.onlyVisible) {
                children = children.filter(":visible");
            }
            if (children.length) {
                $.each(["first", "last"], function(index, value) {
                    var instance = children[value]().data("ui-controlgroup-data");
                    if (instance && that["_" + instance.widgetName + "Options"]) {
                        var options = that["_" + instance.widgetName + "Options"](children.length === 1 ? "only" : value);
                        options.classes = that._resolveClassesValues(options.classes, instance);
                        instance.element[instance.widgetName](options);
                    } else {
                        that._updateCornerClass(children[value](), value);
                    }
                });
                this._callChildMethod("refresh");
            }
        }
    });
    /*!
     * jQuery UI Checkboxradio 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.widget("ui.checkboxradio", [$.ui.formResetMixin, {
        version: "1.12.1",
        options: {
            disabled: null,
            label: null,
            icon: true,
            classes: {
                "ui-checkboxradio-label": "ui-corner-all",
                "ui-checkboxradio-icon": "ui-corner-all"
            }
        },
        _getCreateOptions: function() {
            var disabled, labels;
            var that = this;
            var options = this._super() || {};
            this._readType();
            labels = this.element.labels();
            this.label = $(labels[labels.length - 1]);
            if (!this.label.length) {
                $.error("No label found for checkboxradio widget");
            }
            this.originalLabel = "";
            this.label.contents().not(this.element[0]).each(function() {
                that.originalLabel += this.nodeType === 3 ? $(this).text() : this.outerHTML;
            });
            if (this.originalLabel) {
                options.label = this.originalLabel;
            }
            disabled = this.element[0].disabled;
            if (disabled != null) {
                options.disabled = disabled;
            }
            return options;
        },
        _create: function() {
            var checked = this.element[0].checked;
            this._bindFormResetHandler();
            if (this.options.disabled == null) {
                this.options.disabled = this.element[0].disabled;
            }
            this._setOption("disabled", this.options.disabled);
            this._addClass("ui-checkboxradio", "ui-helper-hidden-accessible");
            this._addClass(this.label, "ui-checkboxradio-label", "ui-button ui-widget");
            if (this.type === "radio") {
                this._addClass(this.label, "ui-checkboxradio-radio-label");
            }
            if (this.options.label && this.options.label !== this.originalLabel) {
                this._updateLabel();
            } else if (this.originalLabel) {
                this.options.label = this.originalLabel;
            }
            this._enhance();
            if (checked) {
                this._addClass(this.label, "ui-checkboxradio-checked", "ui-state-active");
                if (this.icon) {
                    this._addClass(this.icon, null, "ui-state-hover");
                }
            }
            this._on({
                change: "_toggleClasses",
                focus: function() {
                    this._addClass(this.label, null, "ui-state-focus ui-visual-focus");
                },
                blur: function() {
                    this._removeClass(this.label, null, "ui-state-focus ui-visual-focus");
                }
            });
        },
        _readType: function() {
            var nodeName = this.element[0].nodeName.toLowerCase();
            this.type = this.element[0].type;
            if (nodeName !== "input" || !/radio|checkbox/.test(this.type)) {
                $.error("Can't create checkboxradio on element.nodeName=" + nodeName + " and element.type=" + this.type);
            }
        },
        _enhance: function() {
            this._updateIcon(this.element[0].checked);
        },
        widget: function() {
            return this.label;
        },
        _getRadioGroup: function() {
            var group;
            var name = this.element[0].name;
            var nameSelector = "input[name='" + $.ui.escapeSelector(name) + "']";
            if (!name) {
                return $([]);
            }
            if (this.form.length) {
                group = $(this.form[0].elements).filter(nameSelector);
            } else {
                group = $(nameSelector).filter(function() {
                    return $(this).form().length === 0;
                });
            }
            return group.not(this.element);
        },
        _toggleClasses: function() {
            var checked = this.element[0].checked;
            this._toggleClass(this.label, "ui-checkboxradio-checked", "ui-state-active", checked);
            if (this.options.icon && this.type === "checkbox") {
                this._toggleClass(this.icon, null, "ui-icon-check ui-state-checked", checked)._toggleClass(this.icon, null, "ui-icon-blank", !checked);
            }
            if (this.type === "radio") {
                this._getRadioGroup().each(function() {
                    var instance = $(this).checkboxradio("instance");
                    if (instance) {
                        instance._removeClass(instance.label, "ui-checkboxradio-checked", "ui-state-active");
                    }
                });
            }
        },
        _destroy: function() {
            this._unbindFormResetHandler();
            if (this.icon) {
                this.icon.remove();
                this.iconSpace.remove();
            }
        },
        _setOption: function(key, value) {
            if (key === "label" && !value) {
                return;
            }
            this._super(key, value);
            if (key === "disabled") {
                this._toggleClass(this.label, null, "ui-state-disabled", value);
                this.element[0].disabled = value;
                return;
            }
            this.refresh();
        },
        _updateIcon: function(checked) {
            var toAdd = "ui-icon ui-icon-background ";
            if (this.options.icon) {
                if (!this.icon) {
                    this.icon = $("<span>");
                    this.iconSpace = $("<span> </span>");
                    this._addClass(this.iconSpace, "ui-checkboxradio-icon-space");
                }
                if (this.type === "checkbox") {
                    toAdd += checked ? "ui-icon-check ui-state-checked" : "ui-icon-blank";
                    this._removeClass(this.icon, null, checked ? "ui-icon-blank" : "ui-icon-check");
                } else {
                    toAdd += "ui-icon-blank";
                }
                this._addClass(this.icon, "ui-checkboxradio-icon", toAdd);
                if (!checked) {
                    this._removeClass(this.icon, null, "ui-icon-check ui-state-checked");
                }
                this.icon.prependTo(this.label).after(this.iconSpace);
            } else if (this.icon !== undefined) {
                this.icon.remove();
                this.iconSpace.remove();
                delete this.icon;
            }
        },
        _updateLabel: function() {
            var contents = this.label.contents().not(this.element[0]);
            if (this.icon) {
                contents = contents.not(this.icon[0]);
            }
            if (this.iconSpace) {
                contents = contents.not(this.iconSpace[0]);
            }
            contents.remove();
            this.label.append(this.options.label);
        },
        refresh: function() {
            var checked = this.element[0].checked,
                isDisabled = this.element[0].disabled;
            this._updateIcon(checked);
            this._toggleClass(this.label, "ui-checkboxradio-checked", "ui-state-active", checked);
            if (this.options.label !== null) {
                this._updateLabel();
            }
            if (isDisabled !== this.options.disabled) {
                this._setOptions({
                    "disabled": isDisabled
                });
            }
        }
    }]);
    var widgetsCheckboxradio = $.ui.checkboxradio;
    /*!
     * jQuery UI Button 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.widget("ui.button", {
        version: "1.12.1",
        defaultElement: "<button>",
        options: {
            classes: {
                "ui-button": "ui-corner-all"
            },
            disabled: null,
            icon: null,
            iconPosition: "beginning",
            label: null,
            showLabel: true
        },
        _getCreateOptions: function() {
            var disabled, options = this._super() || {};
            this.isInput = this.element.is("input");
            disabled = this.element[0].disabled;
            if (disabled != null) {
                options.disabled = disabled;
            }
            this.originalLabel = this.isInput ? this.element.val() : this.element.html();
            if (this.originalLabel) {
                options.label = this.originalLabel;
            }
            return options;
        },
        _create: function() {
            if (!this.option.showLabel & !this.options.icon) {
                this.options.showLabel = true;
            }
            if (this.options.disabled == null) {
                this.options.disabled = this.element[0].disabled || false;
            }
            this.hasTitle = !!this.element.attr("title");
            if (this.options.label && this.options.label !== this.originalLabel) {
                if (this.isInput) {
                    this.element.val(this.options.label);
                } else {
                    this.element.html(this.options.label);
                }
            }
            this._addClass("ui-button", "ui-widget");
            this._setOption("disabled", this.options.disabled);
            this._enhance();
            if (this.element.is("a")) {
                this._on({
                    "keyup": function(event) {
                        if (event.keyCode === $.ui.keyCode.SPACE) {
                            event.preventDefault();
                            if (this.element[0].click) {
                                this.element[0].click();
                            } else {
                                this.element.trigger("click");
                            }
                        }
                    }
                });
            }
        },
        _enhance: function() {
            if (!this.element.is("button")) {
                this.element.attr("role", "button");
            }
            if (this.options.icon) {
                this._updateIcon("icon", this.options.icon);
                this._updateTooltip();
            }
        },
        _updateTooltip: function() {
            this.title = this.element.attr("title");
            if (!this.options.showLabel && !this.title) {
                this.element.attr("title", this.options.label);
            }
        },
        _updateIcon: function(option, value) {
            var icon = option !== "iconPosition",
                position = icon ? this.options.iconPosition : value,
                displayBlock = position === "top" || position === "bottom";
            if (!this.icon) {
                this.icon = $("<span>");
                this._addClass(this.icon, "ui-button-icon", "ui-icon");
                if (!this.options.showLabel) {
                    this._addClass("ui-button-icon-only");
                }
            } else if (icon) {
                this._removeClass(this.icon, null, this.options.icon);
            }
            if (icon) {
                this._addClass(this.icon, null, value);
            }
            this._attachIcon(position);
            if (displayBlock) {
                this._addClass(this.icon, null, "ui-widget-icon-block");
                if (this.iconSpace) {
                    this.iconSpace.remove();
                }
            } else {
                if (!this.iconSpace) {
                    this.iconSpace = $("<span> </span>");
                    this._addClass(this.iconSpace, "ui-button-icon-space");
                }
                this._removeClass(this.icon, null, "ui-wiget-icon-block");
                this._attachIconSpace(position);
            }
        },
        _destroy: function() {
            this.element.removeAttr("role");
            if (this.icon) {
                this.icon.remove();
            }
            if (this.iconSpace) {
                this.iconSpace.remove();
            }
            if (!this.hasTitle) {
                this.element.removeAttr("title");
            }
        },
        _attachIconSpace: function(iconPosition) {
            this.icon[/^(?:end|bottom)/.test(iconPosition) ? "before" : "after"](this.iconSpace);
        },
        _attachIcon: function(iconPosition) {
            this.element[/^(?:end|bottom)/.test(iconPosition) ? "append" : "prepend"](this.icon);
        },
        _setOptions: function(options) {
            var newShowLabel = options.showLabel === undefined ? this.options.showLabel : options.showLabel,
                newIcon = options.icon === undefined ? this.options.icon : options.icon;
            if (!newShowLabel && !newIcon) {
                options.showLabel = true;
            }
            this._super(options);
        },
        _setOption: function(key, value) {
            if (key === "icon") {
                if (value) {
                    this._updateIcon(key, value);
                } else if (this.icon) {
                    this.icon.remove();
                    if (this.iconSpace) {
                        this.iconSpace.remove();
                    }
                }
            }
            if (key === "iconPosition") {
                this._updateIcon(key, value);
            }
            if (key === "showLabel") {
                this._toggleClass("ui-button-icon-only", null, !value);
                this._updateTooltip();
            }
            if (key === "label") {
                if (this.isInput) {
                    this.element.val(value);
                } else {
                    this.element.html(value);
                    if (this.icon) {
                        this._attachIcon(this.options.iconPosition);
                        this._attachIconSpace(this.options.iconPosition);
                    }
                }
            }
            this._super(key, value);
            if (key === "disabled") {
                this._toggleClass(null, "ui-state-disabled", value);
                this.element[0].disabled = value;
                if (value) {
                    this.element.blur();
                }
            }
        },
        refresh: function() {
            var isDisabled = this.element.is("input, button") ? this.element[0].disabled : this.element.hasClass("ui-button-disabled");
            if (isDisabled !== this.options.disabled) {
                this._setOptions({
                    disabled: isDisabled
                });
            }
            this._updateTooltip();
        }
    });
    if ($.uiBackCompat !== false) {
        $.widget("ui.button", $.ui.button, {
            options: {
                text: true,
                icons: {
                    primary: null,
                    secondary: null
                }
            },
            _create: function() {
                if (this.options.showLabel && !this.options.text) {
                    this.options.showLabel = this.options.text;
                }
                if (!this.options.showLabel && this.options.text) {
                    this.options.text = this.options.showLabel;
                }
                if (!this.options.icon && (this.options.icons.primary || this.options.icons.secondary)) {
                    if (this.options.icons.primary) {
                        this.options.icon = this.options.icons.primary;
                    } else {
                        this.options.icon = this.options.icons.secondary;
                        this.options.iconPosition = "end";
                    }
                } else if (this.options.icon) {
                    this.options.icons.primary = this.options.icon;
                }
                this._super();
            },
            _setOption: function(key, value) {
                if (key === "text") {
                    this._super("showLabel", value);
                    return;
                }
                if (key === "showLabel") {
                    this.options.text = value;
                }
                if (key === "icon") {
                    this.options.icons.primary = value;
                }
                if (key === "icons") {
                    if (value.primary) {
                        this._super("icon", value.primary);
                        this._super("iconPosition", "beginning");
                    } else if (value.secondary) {
                        this._super("icon", value.secondary);
                        this._super("iconPosition", "end");
                    }
                }
                this._superApply(arguments);
            }
        });
        $.fn.button = (function(orig) {
            return function() {
                if (!this.length || (this.length && this[0].tagName !== "INPUT") || (this.length && this[0].tagName === "INPUT" && (this.attr("type") !== "checkbox" && this.attr("type") !== "radio"))) {
                    return orig.apply(this, arguments);
                }
                if (!$.ui.checkboxradio) {
                    $.error("Checkboxradio widget missing");
                }
                if (arguments.length === 0) {
                    return this.checkboxradio({
                        "icon": false
                    });
                }
                return this.checkboxradio.apply(this, arguments);
            };
        })($.fn.button);
        $.fn.buttonset = function() {
            if (!$.ui.controlgroup) {
                $.error("Controlgroup widget missing");
            }
            if (arguments[0] === "option" && arguments[1] === "items" && arguments[2]) {
                return this.controlgroup.apply(this, [arguments[0], "items.button", arguments[2]]);
            }
            if (arguments[0] === "option" && arguments[1] === "items") {
                return this.controlgroup.apply(this, [arguments[0], "items.button"]);
            }
            if (typeof arguments[0] === "object" && arguments[0].items) {
                arguments[0].items = {
                    button: arguments[0].items
                };
            }
            return this.controlgroup.apply(this, arguments);
        };
    }
    var widgetsButton = $.ui.button;
    /*!
     * jQuery UI Datepicker 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.extend($.ui, {
        datepicker: {
            version: "1.12.1"
        }
    });
    var datepicker_instActive;

    function datepicker_getZindex(elem) {
        var position, value;
        while (elem.length && elem[0] !== document) {
            position = elem.css("position");
            if (position === "absolute" || position === "relative" || position === "fixed") {
                value = parseInt(elem.css("zIndex"), 10);
                if (!isNaN(value) && value !== 0) {
                    return value;
                }
            }
            elem = elem.parent();
        }
        return 0;
    }

    function Datepicker() {
        this._curInst = null;
        this._keyEvent = false;
        this._disabledInputs = [];
        this._datepickerShowing = false;
        this._inDialog = false;
        this._mainDivId = "ui-datepicker-div";
        this._inlineClass = "ui-datepicker-inline";
        this._appendClass = "ui-datepicker-append";
        this._triggerClass = "ui-datepicker-trigger";
        this._dialogClass = "ui-datepicker-dialog";
        this._disableClass = "ui-datepicker-disabled";
        this._unselectableClass = "ui-datepicker-unselectable";
        this._currentClass = "ui-datepicker-current-day";
        this._dayOverClass = "ui-datepicker-days-cell-over";
        this.regional = [];
        this.regional[""] = {
            closeText: "Done",
            prevText: "Prev",
            nextText: "Next",
            currentText: "Today",
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            weekHeader: "Wk",
            dateFormat: "mm/dd/yy",
            firstDay: 0,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ""
        };
        this._defaults = {
            showOn: "focus",
            showAnim: "fadeIn",
            showOptions: {},
            defaultDate: null,
            appendText: "",
            buttonText: "...",
            buttonImage: "",
            buttonImageOnly: false,
            hideIfNoPrevNext: false,
            navigationAsDateFormat: false,
            gotoCurrent: false,
            changeMonth: false,
            changeYear: false,
            yearRange: "c-10:c+10",
            showOtherMonths: false,
            selectOtherMonths: false,
            showWeek: false,
            calculateWeek: this.iso8601Week,
            shortYearCutoff: "+10",
            minDate: null,
            maxDate: null,
            duration: "fast",
            beforeShowDay: null,
            beforeShow: null,
            onSelect: null,
            onChangeMonthYear: null,
            onClose: null,
            numberOfMonths: 1,
            showCurrentAtPos: 0,
            stepMonths: 1,
            stepBigMonths: 12,
            altField: "",
            altFormat: "",
            constrainInput: true,
            showButtonPanel: false,
            autoSize: false,
            disabled: false
        };
        $.extend(this._defaults, this.regional[""]);
        this.regional.en = $.extend(true, {}, this.regional[""]);
        this.regional["en-US"] = $.extend(true, {}, this.regional.en);
        this.dpDiv = datepicker_bindHover($("<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"));
    }
    $.extend(Datepicker.prototype, {
        markerClassName: "hasDatepicker",
        maxRows: 4,
        _widgetDatepicker: function() {
            return this.dpDiv;
        },
        setDefaults: function(settings) {
            datepicker_extendRemove(this._defaults, settings || {});
            return this;
        },
        _attachDatepicker: function(target, settings) {
            var nodeName, inline, inst;
            nodeName = target.nodeName.toLowerCase();
            inline = (nodeName === "div" || nodeName === "span");
            if (!target.id) {
                this.uuid += 1;
                target.id = "dp" + this.uuid;
            }
            inst = this._newInst($(target), inline);
            inst.settings = $.extend({}, settings || {});
            if (nodeName === "input") {
                this._connectDatepicker(target, inst);
            } else if (inline) {
                this._inlineDatepicker(target, inst);
            }
        },
        _newInst: function(target, inline) {
            var id = target[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1");
            return {
                id: id,
                input: target,
                selectedDay: 0,
                selectedMonth: 0,
                selectedYear: 0,
                drawMonth: 0,
                drawYear: 0,
                inline: inline,
                dpDiv: (!inline ? this.dpDiv : datepicker_bindHover($("<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")))
            };
        },
        _connectDatepicker: function(target, inst) {
            var input = $(target);
            inst.append = $([]);
            inst.trigger = $([]);
            if (input.hasClass(this.markerClassName)) {
                return;
            }
            this._attachments(input, inst);
            input.addClass(this.markerClassName).on("keydown", this._doKeyDown).on("keypress", this._doKeyPress).on("keyup", this._doKeyUp);
            this._autoSize(inst);
            $.data(target, "datepicker", inst);
            if (inst.settings.disabled) {
                this._disableDatepicker(target);
            }
        },
        _attachments: function(input, inst) {
            var showOn, buttonText, buttonImage, appendText = this._get(inst, "appendText"),
                isRTL = this._get(inst, "isRTL");
            if (inst.append) {
                inst.append.remove();
            }
            if (appendText) {
                inst.append = $("<span class='" + this._appendClass + "'>" + appendText + "</span>");
                input[isRTL ? "before" : "after"](inst.append);
            }
            input.off("focus", this._showDatepicker);
            if (inst.trigger) {
                inst.trigger.remove();
            }
            showOn = this._get(inst, "showOn");
            if (showOn === "focus" || showOn === "both") {
                input.on("focus", this._showDatepicker);
            }
            if (showOn === "button" || showOn === "both") {
                buttonText = this._get(inst, "buttonText");
                buttonImage = this._get(inst, "buttonImage");
                inst.trigger = $(this._get(inst, "buttonImageOnly") ? $("<img/>").addClass(this._triggerClass).attr({
                    src: buttonImage,
                    alt: buttonText,
                    title: buttonText
                }) : $("<button type='button'></button>").addClass(this._triggerClass).html(!buttonImage ? buttonText : $("<img/>").attr({
                    src: buttonImage,
                    alt: buttonText,
                    title: buttonText
                })));
                input[isRTL ? "before" : "after"](inst.trigger);
                inst.trigger.on("click", function() {
                    if ($.datepicker._datepickerShowing && $.datepicker._lastInput === input[0]) {
                        $.datepicker._hideDatepicker();
                    } else if ($.datepicker._datepickerShowing && $.datepicker._lastInput !== input[0]) {
                        $.datepicker._hideDatepicker();
                        $.datepicker._showDatepicker(input[0]);
                    } else {
                        $.datepicker._showDatepicker(input[0]);
                    }
                    return false;
                });
            }
        },
        _autoSize: function(inst) {
            if (this._get(inst, "autoSize") && !inst.inline) {
                var findMax, max, maxI, i, date = new Date(2009, 12 - 1, 20),
                    dateFormat = this._get(inst, "dateFormat");
                if (dateFormat.match(/[DM]/)) {
                    findMax = function(names) {
                        max = 0;
                        maxI = 0;
                        for (i = 0; i < names.length; i++) {
                            if (names[i].length > max) {
                                max = names[i].length;
                                maxI = i;
                            }
                        }
                        return maxI;
                    };
                    date.setMonth(findMax(this._get(inst, (dateFormat.match(/MM/) ? "monthNames" : "monthNamesShort"))));
                    date.setDate(findMax(this._get(inst, (dateFormat.match(/DD/) ? "dayNames" : "dayNamesShort"))) + 20 - date.getDay());
                }
                inst.input.attr("size", this._formatDate(inst, date).length);
            }
        },
        _inlineDatepicker: function(target, inst) {
            var divSpan = $(target);
            if (divSpan.hasClass(this.markerClassName)) {
                return;
            }
            divSpan.addClass(this.markerClassName).append(inst.dpDiv);
            $.data(target, "datepicker", inst);
            this._setDate(inst, this._getDefaultDate(inst), true);
            this._updateDatepicker(inst);
            this._updateAlternate(inst);
            if (inst.settings.disabled) {
                this._disableDatepicker(target);
            }
            inst.dpDiv.css("display", "block");
        },
        _dialogDatepicker: function(input, date, onSelect, settings, pos) {
            var id, browserWidth, browserHeight, scrollX, scrollY, inst = this._dialogInst;
            if (!inst) {
                this.uuid += 1;
                id = "dp" + this.uuid;
                this._dialogInput = $("<input type='text' id='" + id + "' style='position: absolute; top: -100px; width: 0px;'/>");
                this._dialogInput.on("keydown", this._doKeyDown);
                $("body").append(this._dialogInput);
                inst = this._dialogInst = this._newInst(this._dialogInput, false);
                inst.settings = {};
                $.data(this._dialogInput[0], "datepicker", inst);
            }
            datepicker_extendRemove(inst.settings, settings || {});
            date = (date && date.constructor === Date ? this._formatDate(inst, date) : date);
            this._dialogInput.val(date);
            this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
            if (!this._pos) {
                browserWidth = document.documentElement.clientWidth;
                browserHeight = document.documentElement.clientHeight;
                scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                this._pos = [(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
            }
            this._dialogInput.css("left", (this._pos[0] + 20) + "px").css("top", this._pos[1] + "px");
            inst.settings.onSelect = onSelect;
            this._inDialog = true;
            this.dpDiv.addClass(this._dialogClass);
            this._showDatepicker(this._dialogInput[0]);
            if ($.blockUI) {
                $.blockUI(this.dpDiv);
            }
            $.data(this._dialogInput[0], "datepicker", inst);
            return this;
        },
        _destroyDatepicker: function(target) {
            var nodeName, $target = $(target),
                inst = $.data(target, "datepicker");
            if (!$target.hasClass(this.markerClassName)) {
                return;
            }
            nodeName = target.nodeName.toLowerCase();
            $.removeData(target, "datepicker");
            if (nodeName === "input") {
                inst.append.remove();
                inst.trigger.remove();
                $target.removeClass(this.markerClassName).off("focus", this._showDatepicker).off("keydown", this._doKeyDown).off("keypress", this._doKeyPress).off("keyup", this._doKeyUp);
            } else if (nodeName === "div" || nodeName === "span") {
                $target.removeClass(this.markerClassName).empty();
            }
            if (datepicker_instActive === inst) {
                datepicker_instActive = null;
            }
        },
        _enableDatepicker: function(target) {
            var nodeName, inline, $target = $(target),
                inst = $.data(target, "datepicker");
            if (!$target.hasClass(this.markerClassName)) {
                return;
            }
            nodeName = target.nodeName.toLowerCase();
            if (nodeName === "input") {
                target.disabled = false;
                inst.trigger.filter("button").each(function() {
                    this.disabled = false;
                }).end().filter("img").css({
                    opacity: "1.0",
                    cursor: ""
                });
            } else if (nodeName === "div" || nodeName === "span") {
                inline = $target.children("." + this._inlineClass);
                inline.children().removeClass("ui-state-disabled");
                inline.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", false);
            }
            this._disabledInputs = $.map(this._disabledInputs, function(value) {
                return (value === target ? null : value);
            });
        },
        _disableDatepicker: function(target) {
            var nodeName, inline, $target = $(target),
                inst = $.data(target, "datepicker");
            if (!$target.hasClass(this.markerClassName)) {
                return;
            }
            nodeName = target.nodeName.toLowerCase();
            if (nodeName === "input") {
                target.disabled = true;
                inst.trigger.filter("button").each(function() {
                    this.disabled = true;
                }).end().filter("img").css({
                    opacity: "0.5",
                    cursor: "default"
                });
            } else if (nodeName === "div" || nodeName === "span") {
                inline = $target.children("." + this._inlineClass);
                inline.children().addClass("ui-state-disabled");
                inline.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", true);
            }
            this._disabledInputs = $.map(this._disabledInputs, function(value) {
                return (value === target ? null : value);
            });
            this._disabledInputs[this._disabledInputs.length] = target;
        },
        _isDisabledDatepicker: function(target) {
            if (!target) {
                return false;
            }
            for (var i = 0; i < this._disabledInputs.length; i++) {
                if (this._disabledInputs[i] === target) {
                    return true;
                }
            }
            return false;
        },
        _getInst: function(target) {
            try {
                return $.data(target, "datepicker");
            } catch (err) {
                throw "Missing instance data for this datepicker";
            }
        },
        _optionDatepicker: function(target, name, value) {
            var settings, date, minDate, maxDate, inst = this._getInst(target);
            if (arguments.length === 2 && typeof name === "string") {
                return (name === "defaults" ? $.extend({}, $.datepicker._defaults) : (inst ? (name === "all" ? $.extend({}, inst.settings) : this._get(inst, name)) : null));
            }
            settings = name || {};
            if (typeof name === "string") {
                settings = {};
                settings[name] = value;
            }
            if (inst) {
                if (this._curInst === inst) {
                    this._hideDatepicker();
                }
                date = this._getDateDatepicker(target, true);
                minDate = this._getMinMaxDate(inst, "min");
                maxDate = this._getMinMaxDate(inst, "max");
                datepicker_extendRemove(inst.settings, settings);
                if (minDate !== null && settings.dateFormat !== undefined && settings.minDate === undefined) {
                    inst.settings.minDate = this._formatDate(inst, minDate);
                }
                if (maxDate !== null && settings.dateFormat !== undefined && settings.maxDate === undefined) {
                    inst.settings.maxDate = this._formatDate(inst, maxDate);
                }
                if ("disabled" in settings) {
                    if (settings.disabled) {
                        this._disableDatepicker(target);
                    } else {
                        this._enableDatepicker(target);
                    }
                }
                this._attachments($(target), inst);
                this._autoSize(inst);
                this._setDate(inst, date);
                this._updateAlternate(inst);
                this._updateDatepicker(inst);
            }
        },
        _changeDatepicker: function(target, name, value) {
            this._optionDatepicker(target, name, value);
        },
        _refreshDatepicker: function(target) {
            var inst = this._getInst(target);
            if (inst) {
                this._updateDatepicker(inst);
            }
        },
        _setDateDatepicker: function(target, date) {
            var inst = this._getInst(target);
            if (inst) {
                this._setDate(inst, date);
                this._updateDatepicker(inst);
                this._updateAlternate(inst);
            }
        },
        _getDateDatepicker: function(target, noDefault) {
            var inst = this._getInst(target);
            if (inst && !inst.inline) {
                this._setDateFromField(inst, noDefault);
            }
            return (inst ? this._getDate(inst) : null);
        },
        _doKeyDown: function(event) {
            var onSelect, dateStr, sel, inst = $.datepicker._getInst(event.target),
                handled = true,
                isRTL = inst.dpDiv.is(".ui-datepicker-rtl");
            inst._keyEvent = true;
            if ($.datepicker._datepickerShowing) {
                switch (event.keyCode) {
                    case 9:
                        $.datepicker._hideDatepicker();
                        handled = false;
                        break;
                    case 13:
                        sel = $("td." + $.datepicker._dayOverClass + ":not(." +
                            $.datepicker._currentClass + ")", inst.dpDiv);
                        if (sel[0]) {
                            $.datepicker._selectDay(event.target, inst.selectedMonth, inst.selectedYear, sel[0]);
                        }
                        onSelect = $.datepicker._get(inst, "onSelect");
                        if (onSelect) {
                            dateStr = $.datepicker._formatDate(inst);
                            onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);
                        } else {
                            $.datepicker._hideDatepicker();
                        }
                        return false;
                    case 27:
                        $.datepicker._hideDatepicker();
                        break;
                    case 33:
                        $.datepicker._adjustDate(event.target, (event.ctrlKey ? -$.datepicker._get(inst, "stepBigMonths") : -$.datepicker._get(inst, "stepMonths")), "M");
                        break;
                    case 34:
                        $.datepicker._adjustDate(event.target, (event.ctrlKey ? +$.datepicker._get(inst, "stepBigMonths") : +$.datepicker._get(inst, "stepMonths")), "M");
                        break;
                    case 35:
                        if (event.ctrlKey || event.metaKey) {
                            $.datepicker._clearDate(event.target);
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break;
                    case 36:
                        if (event.ctrlKey || event.metaKey) {
                            $.datepicker._gotoToday(event.target);
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break;
                    case 37:
                        if (event.ctrlKey || event.metaKey) {
                            $.datepicker._adjustDate(event.target, (isRTL ? +1 : -1), "D");
                        }
                        handled = event.ctrlKey || event.metaKey;
                        if (event.originalEvent.altKey) {
                            $.datepicker._adjustDate(event.target, (event.ctrlKey ? -$.datepicker._get(inst, "stepBigMonths") : -$.datepicker._get(inst, "stepMonths")), "M");
                        }
                        break;
                    case 38:
                        if (event.ctrlKey || event.metaKey) {
                            $.datepicker._adjustDate(event.target, -7, "D");
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break;
                    case 39:
                        if (event.ctrlKey || event.metaKey) {
                            $.datepicker._adjustDate(event.target, (isRTL ? -1 : +1), "D");
                        }
                        handled = event.ctrlKey || event.metaKey;
                        if (event.originalEvent.altKey) {
                            $.datepicker._adjustDate(event.target, (event.ctrlKey ? +$.datepicker._get(inst, "stepBigMonths") : +$.datepicker._get(inst, "stepMonths")), "M");
                        }
                        break;
                    case 40:
                        if (event.ctrlKey || event.metaKey) {
                            $.datepicker._adjustDate(event.target, +7, "D");
                        }
                        handled = event.ctrlKey || event.metaKey;
                        break;
                    default:
                        handled = false;
                }
            } else if (event.keyCode === 36 && event.ctrlKey) {
                $.datepicker._showDatepicker(this);
            } else {
                handled = false;
            }
            if (handled) {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        _doKeyPress: function(event) {
            var chars, chr, inst = $.datepicker._getInst(event.target);
            if ($.datepicker._get(inst, "constrainInput")) {
                chars = $.datepicker._possibleChars($.datepicker._get(inst, "dateFormat"));
                chr = String.fromCharCode(event.charCode == null ? event.keyCode : event.charCode);
                return event.ctrlKey || event.metaKey || (chr < " " || !chars || chars.indexOf(chr) > -1);
            }
        },
        _doKeyUp: function(event) {
            var date, inst = $.datepicker._getInst(event.target);
            if (inst.input.val() !== inst.lastVal) {
                try {
                    date = $.datepicker.parseDate($.datepicker._get(inst, "dateFormat"), (inst.input ? inst.input.val() : null), $.datepicker._getFormatConfig(inst));
                    if (date) {
                        $.datepicker._setDateFromField(inst);
                        $.datepicker._updateAlternate(inst);
                        $.datepicker._updateDatepicker(inst);
                    }
                } catch (err) {}
            }
            return true;
        },
        _showDatepicker: function(input) {
            input = input.target || input;
            if (input.nodeName.toLowerCase() !== "input") {
                input = $("input", input.parentNode)[0];
            }
            if ($.datepicker._isDisabledDatepicker(input) || $.datepicker._lastInput === input) {
                return;
            }
            var inst, beforeShow, beforeShowSettings, isFixed, offset, showAnim, duration;
            inst = $.datepicker._getInst(input);
            if ($.datepicker._curInst && $.datepicker._curInst !== inst) {
                $.datepicker._curInst.dpDiv.stop(true, true);
                if (inst && $.datepicker._datepickerShowing) {
                    $.datepicker._hideDatepicker($.datepicker._curInst.input[0]);
                }
            }
            beforeShow = $.datepicker._get(inst, "beforeShow");
            beforeShowSettings = beforeShow ? beforeShow.apply(input, [input, inst]) : {};
            if (beforeShowSettings === false) {
                return;
            }
            datepicker_extendRemove(inst.settings, beforeShowSettings);
            inst.lastVal = null;
            $.datepicker._lastInput = input;
            $.datepicker._setDateFromField(inst);
            if ($.datepicker._inDialog) {
                input.value = "";
            }
            if (!$.datepicker._pos) {
                $.datepicker._pos = $.datepicker._findPos(input);
                $.datepicker._pos[1] += input.offsetHeight;
            }
            isFixed = false;
            $(input).parents().each(function() {
                isFixed |= $(this).css("position") === "fixed";
                return !isFixed;
            });
            offset = {
                left: $.datepicker._pos[0],
                top: $.datepicker._pos[1]
            };
            $.datepicker._pos = null;
            inst.dpDiv.empty();
            inst.dpDiv.css({
                position: "absolute",
                display: "block",
                top: "-1000px"
            });
            $.datepicker._updateDatepicker(inst);
            offset = $.datepicker._checkOffset(inst, offset, isFixed);
            inst.dpDiv.css({
                position: ($.datepicker._inDialog && $.blockUI ? "static" : (isFixed ? "fixed" : "absolute")),
                display: "none",
                left: offset.left + "px",
                top: offset.top + "px"
            });
            if (!inst.inline) {
                showAnim = $.datepicker._get(inst, "showAnim");
                duration = $.datepicker._get(inst, "duration");
                inst.dpDiv.css("z-index", datepicker_getZindex($(input)) + 1);
                $.datepicker._datepickerShowing = true;
                if ($.effects && $.effects.effect[showAnim]) {
                    inst.dpDiv.show(showAnim, $.datepicker._get(inst, "showOptions"), duration);
                } else {
                    inst.dpDiv[showAnim || "show"](showAnim ? duration : null);
                }
                if ($.datepicker._shouldFocusInput(inst)) {
                    inst.input.trigger("focus");
                }
                $.datepicker._curInst = inst;
            }
        },
        _updateDatepicker: function(inst) {
            this.maxRows = 4;
            datepicker_instActive = inst;
            inst.dpDiv.empty().append(this._generateHTML(inst));
            this._attachHandlers(inst);
            var origyearshtml, numMonths = this._getNumberOfMonths(inst),
                cols = numMonths[1],
                width = 17,
                activeCell = inst.dpDiv.find("." + this._dayOverClass + " a");
            if (activeCell.length > 0) {
                datepicker_handleMouseover.apply(activeCell.get(0));
            }
            inst.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");
            if (cols > 1) {
                inst.dpDiv.addClass("ui-datepicker-multi-" + cols).css("width", (width * cols) + "em");
            }
            inst.dpDiv[(numMonths[0] !== 1 || numMonths[1] !== 1 ? "add" : "remove") + "Class"]("ui-datepicker-multi");
            inst.dpDiv[(this._get(inst, "isRTL") ? "add" : "remove") + "Class"]("ui-datepicker-rtl");
            if (inst === $.datepicker._curInst && $.datepicker._datepickerShowing && $.datepicker._shouldFocusInput(inst)) {
                inst.input.trigger("focus");
            }
            if (inst.yearshtml) {
                origyearshtml = inst.yearshtml;
                setTimeout(function() {
                    if (origyearshtml === inst.yearshtml && inst.yearshtml) {
                        inst.dpDiv.find("select.ui-datepicker-year:first").replaceWith(inst.yearshtml);
                    }
                    origyearshtml = inst.yearshtml = null;
                }, 0);
            }
        },
        _shouldFocusInput: function(inst) {
            return inst.input && inst.input.is(":visible") && !inst.input.is(":disabled") && !inst.input.is(":focus");
        },
        _checkOffset: function(inst, offset, isFixed) {
            var dpWidth = inst.dpDiv.outerWidth(),
                dpHeight = inst.dpDiv.outerHeight(),
                inputWidth = inst.input ? inst.input.outerWidth() : 0,
                inputHeight = inst.input ? inst.input.outerHeight() : 0,
                viewWidth = document.documentElement.clientWidth + (isFixed ? 0 : $(document).scrollLeft()),
                viewHeight = document.documentElement.clientHeight + (isFixed ? 0 : $(document).scrollTop());
            offset.left -= (this._get(inst, "isRTL") ? (dpWidth - inputWidth) : 0);
            offset.left -= (isFixed && offset.left === inst.input.offset().left) ? $(document).scrollLeft() : 0;
            offset.top -= (isFixed && offset.top === (inst.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;
            offset.left -= Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ? Math.abs(offset.left + dpWidth - viewWidth) : 0);
            offset.top -= Math.min(offset.top, (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ? Math.abs(dpHeight + inputHeight) : 0);
            return offset;
        },
        _findPos: function(obj) {
            var position, inst = this._getInst(obj),
                isRTL = this._get(inst, "isRTL");
            while (obj && (obj.type === "hidden" || obj.nodeType !== 1 || $.expr.filters.hidden(obj))) {
                obj = obj[isRTL ? "previousSibling" : "nextSibling"];
            }
            position = $(obj).offset();
            return [position.left, position.top];
        },
        _hideDatepicker: function(input) {
            var showAnim, duration, postProcess, onClose, inst = this._curInst;
            if (!inst || (input && inst !== $.data(input, "datepicker"))) {
                return;
            }
            if (this._datepickerShowing) {
                showAnim = this._get(inst, "showAnim");
                duration = this._get(inst, "duration");
                postProcess = function() {
                    $.datepicker._tidyDialog(inst);
                };
                if ($.effects && ($.effects.effect[showAnim] || $.effects[showAnim])) {
                    inst.dpDiv.hide(showAnim, $.datepicker._get(inst, "showOptions"), duration, postProcess);
                } else {
                    inst.dpDiv[(showAnim === "slideDown" ? "slideUp" : (showAnim === "fadeIn" ? "fadeOut" : "hide"))]((showAnim ? duration : null), postProcess);
                }
                if (!showAnim) {
                    postProcess();
                }
                this._datepickerShowing = false;
                onClose = this._get(inst, "onClose");
                if (onClose) {
                    onClose.apply((inst.input ? inst.input[0] : null), [(inst.input ? inst.input.val() : ""), inst]);
                }
                this._lastInput = null;
                if (this._inDialog) {
                    this._dialogInput.css({
                        position: "absolute",
                        left: "0",
                        top: "-100px"
                    });
                    if ($.blockUI) {
                        $.unblockUI();
                        $("body").append(this.dpDiv);
                    }
                }
                this._inDialog = false;
            }
        },
        _tidyDialog: function(inst) {
            inst.dpDiv.removeClass(this._dialogClass).off(".ui-datepicker-calendar");
        },
        _checkExternalClick: function(event) {
            if (!$.datepicker._curInst) {
                return;
            }
            var $target = $(event.target),
                inst = $.datepicker._getInst($target[0]);
            if ((($target[0].id !== $.datepicker._mainDivId && $target.parents("#" + $.datepicker._mainDivId).length === 0 && !$target.hasClass($.datepicker.markerClassName) && !$target.closest("." + $.datepicker._triggerClass).length && $.datepicker._datepickerShowing && !($.datepicker._inDialog && $.blockUI))) || ($target.hasClass($.datepicker.markerClassName) && $.datepicker._curInst !== inst)) {
                $.datepicker._hideDatepicker();
            }
        },
        _adjustDate: function(id, offset, period) {
            var target = $(id),
                inst = this._getInst(target[0]);
            if (this._isDisabledDatepicker(target[0])) {
                return;
            }
            this._adjustInstDate(inst, offset +
                (period === "M" ? this._get(inst, "showCurrentAtPos") : 0), period);
            this._updateDatepicker(inst);
        },
        _gotoToday: function(id) {
            var date, target = $(id),
                inst = this._getInst(target[0]);
            if (this._get(inst, "gotoCurrent") && inst.currentDay) {
                inst.selectedDay = inst.currentDay;
                inst.drawMonth = inst.selectedMonth = inst.currentMonth;
                inst.drawYear = inst.selectedYear = inst.currentYear;
            } else {
                date = new Date();
                inst.selectedDay = date.getDate();
                inst.drawMonth = inst.selectedMonth = date.getMonth();
                inst.drawYear = inst.selectedYear = date.getFullYear();
            }
            this._notifyChange(inst);
            this._adjustDate(target);
        },
        _selectMonthYear: function(id, select, period) {
            var target = $(id),
                inst = this._getInst(target[0]);
            inst["selected" + (period === "M" ? "Month" : "Year")] = inst["draw" + (period === "M" ? "Month" : "Year")] = parseInt(select.options[select.selectedIndex].value, 10);
            this._notifyChange(inst);
            this._adjustDate(target);
        },
        _selectDay: function(id, month, year, td) {
            var inst, target = $(id);
            if ($(td).hasClass(this._unselectableClass) || this._isDisabledDatepicker(target[0])) {
                return;
            }
            inst = this._getInst(target[0]);
            inst.selectedDay = inst.currentDay = $("a", td).html();
            inst.selectedMonth = inst.currentMonth = month;
            inst.selectedYear = inst.currentYear = year;
            this._selectDate(id, this._formatDate(inst, inst.currentDay, inst.currentMonth, inst.currentYear));
        },
        _clearDate: function(id) {
            var target = $(id);
            this._selectDate(target, "");
        },
        _selectDate: function(id, dateStr) {
            var onSelect, target = $(id),
                inst = this._getInst(target[0]);
            dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
            if (inst.input) {
                inst.input.val(dateStr);
            }
            this._updateAlternate(inst);
            onSelect = this._get(inst, "onSelect");
            if (onSelect) {
                onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);
            } else if (inst.input) {
                inst.input.trigger("change");
            }
            if (inst.inline) {
                this._updateDatepicker(inst);
            } else {
                this._hideDatepicker();
                this._lastInput = inst.input[0];
                if (typeof(inst.input[0]) !== "object") {
                    inst.input.trigger("focus");
                }
                this._lastInput = null;
            }
        },
        _updateAlternate: function(inst) {
            var altFormat, date, dateStr, altField = this._get(inst, "altField");
            if (altField) {
                altFormat = this._get(inst, "altFormat") || this._get(inst, "dateFormat");
                date = this._getDate(inst);
                dateStr = this.formatDate(altFormat, date, this._getFormatConfig(inst));
                $(altField).val(dateStr);
            }
        },
        noWeekends: function(date) {
            var day = date.getDay();
            return [(day > 0 && day < 6), ""];
        },
        iso8601Week: function(date) {
            var time, checkDate = new Date(date.getTime());
            checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
            time = checkDate.getTime();
            checkDate.setMonth(0);
            checkDate.setDate(1);
            return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
        },
        parseDate: function(format, value, settings) {
            if (format == null || value == null) {
                throw "Invalid arguments";
            }
            value = (typeof value === "object" ? value.toString() : value + "");
            if (value === "") {
                return null;
            }
            var iFormat, dim, extra, iValue = 0,
                shortYearCutoffTemp = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff,
                shortYearCutoff = (typeof shortYearCutoffTemp !== "string" ? shortYearCutoffTemp : new Date().getFullYear() % 100 + parseInt(shortYearCutoffTemp, 10)),
                dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
                dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
                monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
                monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
                year = -1,
                month = -1,
                day = -1,
                doy = -1,
                literal = false,
                date, lookAhead = function(match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                },
                getNumber = function(match) {
                    var isDoubled = lookAhead(match),
                        size = (match === "@" ? 14 : (match === "!" ? 20 : (match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
                        minSize = (match === "y" ? size : 1),
                        digits = new RegExp("^\\d{" + minSize + "," + size + "}"),
                        num = value.substring(iValue).match(digits);
                    if (!num) {
                        throw "Missing number at position " + iValue;
                    }
                    iValue += num[0].length;
                    return parseInt(num[0], 10);
                },
                getName = function(match, shortNames, longNames) {
                    var index = -1,
                        names = $.map(lookAhead(match) ? longNames : shortNames, function(v, k) {
                            return [
                                [k, v]
                            ];
                        }).sort(function(a, b) {
                            return -(a[1].length - b[1].length);
                        });
                    $.each(names, function(i, pair) {
                        var name = pair[1];
                        if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                            index = pair[0];
                            iValue += name.length;
                            return false;
                        }
                    });
                    if (index !== -1) {
                        return index + 1;
                    } else {
                        throw "Unknown name at position " + iValue;
                    }
                },
                checkLiteral = function() {
                    if (value.charAt(iValue) !== format.charAt(iFormat)) {
                        throw "Unexpected literal at position " + iValue;
                    }
                    iValue++;
                };
            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                        literal = false;
                    } else {
                        checkLiteral();
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case "d":
                            day = getNumber("d");
                            break;
                        case "D":
                            getName("D", dayNamesShort, dayNames);
                            break;
                        case "o":
                            doy = getNumber("o");
                            break;
                        case "m":
                            month = getNumber("m");
                            break;
                        case "M":
                            month = getName("M", monthNamesShort, monthNames);
                            break;
                        case "y":
                            year = getNumber("y");
                            break;
                        case "@":
                            date = new Date(getNumber("@"));
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "!":
                            date = new Date((getNumber("!") - this._ticksTo1970) / 10000);
                            year = date.getFullYear();
                            month = date.getMonth() + 1;
                            day = date.getDate();
                            break;
                        case "'":
                            if (lookAhead("'")) {
                                checkLiteral();
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            checkLiteral();
                    }
                }
            }
            if (iValue < value.length) {
                extra = value.substr(iValue);
                if (!/^\s+/.test(extra)) {
                    throw "Extra/unparsed characters found in date: " + extra;
                }
            }
            if (year === -1) {
                year = new Date().getFullYear();
            } else if (year < 100) {
                year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                    (year <= shortYearCutoff ? 0 : -100);
            }
            if (doy > -1) {
                month = 1;
                day = doy;
                do {
                    dim = this._getDaysInMonth(year, month - 1);
                    if (day <= dim) {
                        break;
                    }
                    month++;
                    day -= dim;
                } while (true);
            }
            date = this._daylightSavingAdjust(new Date(year, month - 1, day));
            if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                throw "Invalid date";
            }
            return date;
        },
        ATOM: "yy-mm-dd",
        COOKIE: "D, dd M yy",
        ISO_8601: "yy-mm-dd",
        RFC_822: "D, d M y",
        RFC_850: "DD, dd-M-y",
        RFC_1036: "D, d M y",
        RFC_1123: "D, d M yy",
        RFC_2822: "D, d M yy",
        RSS: "D, d M y",
        TICKS: "!",
        TIMESTAMP: "@",
        W3C: "yy-mm-dd",
        _ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
            Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),
        formatDate: function(format, date, settings) {
            if (!date) {
                return "";
            }
            var iFormat, dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort,
                dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames,
                monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort,
                monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames,
                lookAhead = function(match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                },
                formatNumber = function(match, value, len) {
                    var num = "" + value;
                    if (lookAhead(match)) {
                        while (num.length < len) {
                            num = "0" + num;
                        }
                    }
                    return num;
                },
                formatName = function(match, value, shortNames, longNames) {
                    return (lookAhead(match) ? longNames[value] : shortNames[value]);
                },
                output = "",
                literal = false;
            if (date) {
                for (iFormat = 0; iFormat < format.length; iFormat++) {
                    if (literal) {
                        if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                            literal = false;
                        } else {
                            output += format.charAt(iFormat);
                        }
                    } else {
                        switch (format.charAt(iFormat)) {
                            case "d":
                                output += formatNumber("d", date.getDate(), 2);
                                break;
                            case "D":
                                output += formatName("D", date.getDay(), dayNamesShort, dayNames);
                                break;
                            case "o":
                                output += formatNumber("o", Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                                break;
                            case "m":
                                output += formatNumber("m", date.getMonth() + 1, 2);
                                break;
                            case "M":
                                output += formatName("M", date.getMonth(), monthNamesShort, monthNames);
                                break;
                            case "y":
                                output += (lookAhead("y") ? date.getFullYear() : (date.getFullYear() % 100 < 10 ? "0" : "") + date.getFullYear() % 100);
                                break;
                            case "@":
                                output += date.getTime();
                                break;
                            case "!":
                                output += date.getTime() * 10000 + this._ticksTo1970;
                                break;
                            case "'":
                                if (lookAhead("'")) {
                                    output += "'";
                                } else {
                                    literal = true;
                                }
                                break;
                            default:
                                output += format.charAt(iFormat);
                        }
                    }
                }
            }
            return output;
        },
        _possibleChars: function(format) {
            var iFormat, chars = "",
                literal = false,
                lookAhead = function(match) {
                    var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
                    if (matches) {
                        iFormat++;
                    }
                    return matches;
                };
            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                        literal = false;
                    } else {
                        chars += format.charAt(iFormat);
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case "d":
                        case "m":
                        case "y":
                        case "@":
                            chars += "0123456789";
                            break;
                        case "D":
                        case "M":
                            return null;
                        case "'":
                            if (lookAhead("'")) {
                                chars += "'";
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            chars += format.charAt(iFormat);
                    }
                }
            }
            return chars;
        },
        _get: function(inst, name) {
            return inst.settings[name] !== undefined ? inst.settings[name] : this._defaults[name];
        },
        _setDateFromField: function(inst, noDefault) {
            if (inst.input.val() === inst.lastVal) {
                return;
            }
            var dateFormat = this._get(inst, "dateFormat"),
                dates = inst.lastVal = inst.input ? inst.input.val() : null,
                defaultDate = this._getDefaultDate(inst),
                date = defaultDate,
                settings = this._getFormatConfig(inst);
            try {
                date = this.parseDate(dateFormat, dates, settings) || defaultDate;
            } catch (event) {
                dates = (noDefault ? "" : dates);
            }
            inst.selectedDay = date.getDate();
            inst.drawMonth = inst.selectedMonth = date.getMonth();
            inst.drawYear = inst.selectedYear = date.getFullYear();
            inst.currentDay = (dates ? date.getDate() : 0);
            inst.currentMonth = (dates ? date.getMonth() : 0);
            inst.currentYear = (dates ? date.getFullYear() : 0);
            this._adjustInstDate(inst);
        },
        _getDefaultDate: function(inst) {
            return this._restrictMinMax(inst, this._determineDate(inst, this._get(inst, "defaultDate"), new Date()));
        },
        _determineDate: function(inst, date, defaultDate) {
            var offsetNumeric = function(offset) {
                    var date = new Date();
                    date.setDate(date.getDate() + offset);
                    return date;
                },
                offsetString = function(offset) {
                    try {
                        return $.datepicker.parseDate($.datepicker._get(inst, "dateFormat"), offset, $.datepicker._getFormatConfig(inst));
                    } catch (e) {}
                    var date = (offset.toLowerCase().match(/^c/) ? $.datepicker._getDate(inst) : null) || new Date(),
                        year = date.getFullYear(),
                        month = date.getMonth(),
                        day = date.getDate(),
                        pattern = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
                        matches = pattern.exec(offset);
                    while (matches) {
                        switch (matches[2] || "d") {
                            case "d":
                            case "D":
                                day += parseInt(matches[1], 10);
                                break;
                            case "w":
                            case "W":
                                day += parseInt(matches[1], 10) * 7;
                                break;
                            case "m":
                            case "M":
                                month += parseInt(matches[1], 10);
                                day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
                                break;
                            case "y":
                            case "Y":
                                year += parseInt(matches[1], 10);
                                day = Math.min(day, $.datepicker._getDaysInMonth(year, month));
                                break;
                        }
                        matches = pattern.exec(offset);
                    }
                    return new Date(year, month, day);
                },
                newDate = (date == null || date === "" ? defaultDate : (typeof date === "string" ? offsetString(date) : (typeof date === "number" ? (isNaN(date) ? defaultDate : offsetNumeric(date)) : new Date(date.getTime()))));
            newDate = (newDate && newDate.toString() === "Invalid Date" ? defaultDate : newDate);
            if (newDate) {
                newDate.setHours(0);
                newDate.setMinutes(0);
                newDate.setSeconds(0);
                newDate.setMilliseconds(0);
            }
            return this._daylightSavingAdjust(newDate);
        },
        _daylightSavingAdjust: function(date) {
            if (!date) {
                return null;
            }
            date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
            return date;
        },
        _setDate: function(inst, date, noChange) {
            var clear = !date,
                origMonth = inst.selectedMonth,
                origYear = inst.selectedYear,
                newDate = this._restrictMinMax(inst, this._determineDate(inst, date, new Date()));
            inst.selectedDay = inst.currentDay = newDate.getDate();
            inst.drawMonth = inst.selectedMonth = inst.currentMonth = newDate.getMonth();
            inst.drawYear = inst.selectedYear = inst.currentYear = newDate.getFullYear();
            if ((origMonth !== inst.selectedMonth || origYear !== inst.selectedYear) && !noChange) {
                this._notifyChange(inst);
            }
            this._adjustInstDate(inst);
            if (inst.input) {
                inst.input.val(clear ? "" : this._formatDate(inst));
            }
        },
        _getDate: function(inst) {
            var startDate = (!inst.currentYear || (inst.input && inst.input.val() === "") ? null : this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
            return startDate;
        },
        _attachHandlers: function(inst) {
            var stepMonths = this._get(inst, "stepMonths"),
                id = "#" + inst.id.replace(/\\\\/g, "\\");
            inst.dpDiv.find("[data-handler]").map(function() {
                var handler = {
                    prev: function() {
                        $.datepicker._adjustDate(id, -stepMonths, "M");
                    },
                    next: function() {
                        $.datepicker._adjustDate(id, +stepMonths, "M");
                    },
                    hide: function() {
                        $.datepicker._hideDatepicker();
                    },
                    today: function() {
                        $.datepicker._gotoToday(id);
                    },
                    selectDay: function() {
                        $.datepicker._selectDay(id, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this);
                        return false;
                    },
                    selectMonth: function() {
                        $.datepicker._selectMonthYear(id, this, "M");
                        return false;
                    },
                    selectYear: function() {
                        $.datepicker._selectMonthYear(id, this, "Y");
                        return false;
                    }
                };
                $(this).on(this.getAttribute("data-event"), handler[this.getAttribute("data-handler")]);
            });
        },
        _generateHTML: function(inst) {
            var maxDraw, prevText, prev, nextText, next, currentText, gotoDate, controls, buttonPanel, firstDay, showWeek, dayNames, dayNamesMin, monthNames, monthNamesShort, beforeShowDay, showOtherMonths, selectOtherMonths, defaultDate, html, dow, row, group, col, selectedDate, cornerClass, calender, thead, day, daysInMonth, leadDays, curRows, numRows, printDate, dRow, tbody, daySettings, otherMonth, unselectable, tempDate = new Date(),
                today = this._daylightSavingAdjust(new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate())),
                isRTL = this._get(inst, "isRTL"),
                showButtonPanel = this._get(inst, "showButtonPanel"),
                hideIfNoPrevNext = this._get(inst, "hideIfNoPrevNext"),
                navigationAsDateFormat = this._get(inst, "navigationAsDateFormat"),
                numMonths = this._getNumberOfMonths(inst),
                showCurrentAtPos = this._get(inst, "showCurrentAtPos"),
                stepMonths = this._get(inst, "stepMonths"),
                isMultiMonth = (numMonths[0] !== 1 || numMonths[1] !== 1),
                currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) : new Date(inst.currentYear, inst.currentMonth, inst.currentDay))),
                minDate = this._getMinMaxDate(inst, "min"),
                maxDate = this._getMinMaxDate(inst, "max"),
                drawMonth = inst.drawMonth - showCurrentAtPos,
                drawYear = inst.drawYear;
            if (drawMonth < 0) {
                drawMonth += 12;
                drawYear--;
            }
            if (maxDate) {
                maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(), maxDate.getMonth() - (numMonths[0] * numMonths[1]) + 1, maxDate.getDate()));
                maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
                while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
                    drawMonth--;
                    if (drawMonth < 0) {
                        drawMonth = 11;
                        drawYear--;
                    }
                }
            }
            inst.drawMonth = drawMonth;
            inst.drawYear = drawYear;
            prevText = this._get(inst, "prevText");
            prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText, this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)), this._getFormatConfig(inst)));
            prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ? "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'" + " title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + (isRTL ? "e" : "w") + "'>" + prevText + "</span></a>" : (hideIfNoPrevNext ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + (isRTL ? "e" : "w") + "'>" + prevText + "</span></a>"));
            nextText = this._get(inst, "nextText");
            nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText, this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)), this._getFormatConfig(inst)));
            next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ? "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'" + " title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + (isRTL ? "w" : "e") + "'>" + nextText + "</span></a>" : (hideIfNoPrevNext ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + (isRTL ? "w" : "e") + "'>" + nextText + "</span></a>"));
            currentText = this._get(inst, "currentText");
            gotoDate = (this._get(inst, "gotoCurrent") && inst.currentDay ? currentDate : today);
            currentText = (!navigationAsDateFormat ? currentText : this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));
            controls = (!inst.inline ? "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
                this._get(inst, "closeText") + "</button>" : "");
            buttonPanel = (showButtonPanel) ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (isRTL ? controls : "") +
                (this._isInRange(inst, gotoDate) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'" + ">" + currentText + "</button>" : "") + (isRTL ? "" : controls) + "</div>" : "";
            firstDay = parseInt(this._get(inst, "firstDay"), 10);
            firstDay = (isNaN(firstDay) ? 0 : firstDay);
            showWeek = this._get(inst, "showWeek");
            dayNames = this._get(inst, "dayNames");
            dayNamesMin = this._get(inst, "dayNamesMin");
            monthNames = this._get(inst, "monthNames");
            monthNamesShort = this._get(inst, "monthNamesShort");
            beforeShowDay = this._get(inst, "beforeShowDay");
            showOtherMonths = this._get(inst, "showOtherMonths");
            selectOtherMonths = this._get(inst, "selectOtherMonths");
            defaultDate = this._getDefaultDate(inst);
            html = "";
            for (row = 0; row < numMonths[0]; row++) {
                group = "";
                this.maxRows = 4;
                for (col = 0; col < numMonths[1]; col++) {
                    selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
                    cornerClass = " ui-corner-all";
                    calender = "";
                    if (isMultiMonth) {
                        calender += "<div class='ui-datepicker-group";
                        if (numMonths[1] > 1) {
                            switch (col) {
                                case 0:
                                    calender += " ui-datepicker-group-first";
                                    cornerClass = " ui-corner-" + (isRTL ? "right" : "left");
                                    break;
                                case numMonths[1] - 1:
                                    calender += " ui-datepicker-group-last";
                                    cornerClass = " ui-corner-" + (isRTL ? "left" : "right");
                                    break;
                                default:
                                    calender += " ui-datepicker-group-middle";
                                    cornerClass = "";
                                    break;
                            }
                        }
                        calender += "'>";
                    }
                    calender += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + cornerClass + "'>" +
                        (/all|left/.test(cornerClass) && row === 0 ? (isRTL ? next : prev) : "") +
                        (/all|right/.test(cornerClass) && row === 0 ? (isRTL ? prev : next) : "") +
                        this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate, row > 0 || col > 0, monthNames, monthNamesShort) + "</div><table class='ui-datepicker-calendar'><thead>" + "<tr>";
                    thead = (showWeek ? "<th class='ui-datepicker-week-col'>" + this._get(inst, "weekHeader") + "</th>" : "");
                    for (dow = 0; dow < 7; dow++) {
                        day = (dow + firstDay) % 7;
                        thead += "<th scope='col'" + ((dow + firstDay + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + ">" + "<span title='" + dayNames[day] + "'>" + dayNamesMin[day] + "</span></th>";
                    }
                    calender += thead + "</tr></thead><tbody>";
                    daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
                    if (drawYear === inst.selectedYear && drawMonth === inst.selectedMonth) {
                        inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
                    }
                    leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
                    curRows = Math.ceil((leadDays + daysInMonth) / 7);
                    numRows = (isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows);
                    this.maxRows = numRows;
                    printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
                    for (dRow = 0; dRow < numRows; dRow++) {
                        calender += "<tr>";
                        tbody = (!showWeek ? "" : "<td class='ui-datepicker-week-col'>" +
                            this._get(inst, "calculateWeek")(printDate) + "</td>");
                        for (dow = 0; dow < 7; dow++) {
                            daySettings = (beforeShowDay ? beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, ""]);
                            otherMonth = (printDate.getMonth() !== drawMonth);
                            unselectable = (otherMonth && !selectOtherMonths) || !daySettings[0] || (minDate && printDate < minDate) || (maxDate && printDate > maxDate);
                            tbody += "<td class='" +
                                ((dow + firstDay + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") +
                                (otherMonth ? " ui-datepicker-other-month" : "") +
                                ((printDate.getTime() === selectedDate.getTime() && drawMonth === inst.selectedMonth && inst._keyEvent) || (defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime()) ? " " + this._dayOverClass : "") +
                                (unselectable ? " " + this._unselectableClass + " ui-state-disabled" : "") +
                                (otherMonth && !showOtherMonths ? "" : " " + daySettings[1] +
                                    (printDate.getTime() === currentDate.getTime() ? " " + this._currentClass : "") +
                                    (printDate.getTime() === today.getTime() ? " ui-datepicker-today" : "")) + "'" +
                                ((!otherMonth || showOtherMonths) && daySettings[2] ? " title='" + daySettings[2].replace(/'/g, "&#39;") + "'" : "") +
                                (unselectable ? "" : " data-handler='selectDay' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" +
                                (otherMonth && !showOtherMonths ? "&#xa0;" : (unselectable ? "<span class='ui-state-default'>" + printDate.getDate() + "</span>" : "<a class='ui-state-default" +
                                    (printDate.getTime() === today.getTime() ? " ui-state-highlight" : "") +
                                    (printDate.getTime() === currentDate.getTime() ? " ui-state-active" : "") +
                                    (otherMonth ? " ui-priority-secondary" : "") + "' href='#'>" + printDate.getDate() + "</a>")) + "</td>";
                            printDate.setDate(printDate.getDate() + 1);
                            printDate = this._daylightSavingAdjust(printDate);
                        }
                        calender += tbody + "</tr>";
                    }
                    drawMonth++;
                    if (drawMonth > 11) {
                        drawMonth = 0;
                        drawYear++;
                    }
                    calender += "</tbody></table>" + (isMultiMonth ? "</div>" +
                        ((numMonths[0] > 0 && col === numMonths[1] - 1) ? "<div class='ui-datepicker-row-break'></div>" : "") : "");
                    group += calender;
                }
                html += group;
            }
            html += buttonPanel;
            inst._keyEvent = false;
            return html;
        },
        _generateMonthYearHeader: function(inst, drawMonth, drawYear, minDate, maxDate, secondary, monthNames, monthNamesShort) {
            var inMinYear, inMaxYear, month, years, thisYear, determineYear, year, endYear, changeMonth = this._get(inst, "changeMonth"),
                changeYear = this._get(inst, "changeYear"),
                showMonthAfterYear = this._get(inst, "showMonthAfterYear"),
                html = "<div class='ui-datepicker-title'>",
                monthHtml = "";
            if (secondary || !changeMonth) {
                monthHtml += "<span class='ui-datepicker-month'>" + monthNames[drawMonth] + "</span>";
            } else {
                inMinYear = (minDate && minDate.getFullYear() === drawYear);
                inMaxYear = (maxDate && maxDate.getFullYear() === drawYear);
                monthHtml += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>";
                for (month = 0; month < 12; month++) {
                    if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())) {
                        monthHtml += "<option value='" + month + "'" +
                            (month === drawMonth ? " selected='selected'" : "") + ">" + monthNamesShort[month] + "</option>";
                    }
                }
                monthHtml += "</select>";
            }
            if (!showMonthAfterYear) {
                html += monthHtml + (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "");
            }
            if (!inst.yearshtml) {
                inst.yearshtml = "";
                if (secondary || !changeYear) {
                    html += "<span class='ui-datepicker-year'>" + drawYear + "</span>";
                } else {
                    years = this._get(inst, "yearRange").split(":");
                    thisYear = new Date().getFullYear();
                    determineYear = function(value) {
                        var year = (value.match(/c[+\-].*/) ? drawYear + parseInt(value.substring(1), 10) : (value.match(/[+\-].*/) ? thisYear + parseInt(value, 10) : parseInt(value, 10)));
                        return (isNaN(year) ? thisYear : year);
                    };
                    year = determineYear(years[0]);
                    endYear = Math.max(year, determineYear(years[1] || ""));
                    year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
                    endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
                    inst.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";
                    for (; year <= endYear; year++) {
                        inst.yearshtml += "<option value='" + year + "'" +
                            (year === drawYear ? " selected='selected'" : "") + ">" + year + "</option>";
                    }
                    inst.yearshtml += "</select>";
                    html += inst.yearshtml;
                    inst.yearshtml = null;
                }
            }
            html += this._get(inst, "yearSuffix");
            if (showMonthAfterYear) {
                html += (secondary || !(changeMonth && changeYear) ? "&#xa0;" : "") + monthHtml;
            }
            html += "</div>";
            return html;
        },
        _adjustInstDate: function(inst, offset, period) {
            var year = inst.selectedYear + (period === "Y" ? offset : 0),
                month = inst.selectedMonth + (period === "M" ? offset : 0),
                day = Math.min(inst.selectedDay, this._getDaysInMonth(year, month)) + (period === "D" ? offset : 0),
                date = this._restrictMinMax(inst, this._daylightSavingAdjust(new Date(year, month, day)));
            inst.selectedDay = date.getDate();
            inst.drawMonth = inst.selectedMonth = date.getMonth();
            inst.drawYear = inst.selectedYear = date.getFullYear();
            if (period === "M" || period === "Y") {
                this._notifyChange(inst);
            }
        },
        _restrictMinMax: function(inst, date) {
            var minDate = this._getMinMaxDate(inst, "min"),
                maxDate = this._getMinMaxDate(inst, "max"),
                newDate = (minDate && date < minDate ? minDate : date);
            return (maxDate && newDate > maxDate ? maxDate : newDate);
        },
        _notifyChange: function(inst) {
            var onChange = this._get(inst, "onChangeMonthYear");
            if (onChange) {
                onChange.apply((inst.input ? inst.input[0] : null), [inst.selectedYear, inst.selectedMonth + 1, inst]);
            }
        },
        _getNumberOfMonths: function(inst) {
            var numMonths = this._get(inst, "numberOfMonths");
            return (numMonths == null ? [1, 1] : (typeof numMonths === "number" ? [1, numMonths] : numMonths));
        },
        _getMinMaxDate: function(inst, minMax) {
            return this._determineDate(inst, this._get(inst, minMax + "Date"), null);
        },
        _getDaysInMonth: function(year, month) {
            return 32 - this._daylightSavingAdjust(new Date(year, month, 32)).getDate();
        },
        _getFirstDayOfMonth: function(year, month) {
            return new Date(year, month, 1).getDay();
        },
        _canAdjustMonth: function(inst, offset, curYear, curMonth) {
            var numMonths = this._getNumberOfMonths(inst),
                date = this._daylightSavingAdjust(new Date(curYear, curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]), 1));
            if (offset < 0) {
                date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
            }
            return this._isInRange(inst, date);
        },
        _isInRange: function(inst, date) {
            var yearSplit, currentYear, minDate = this._getMinMaxDate(inst, "min"),
                maxDate = this._getMinMaxDate(inst, "max"),
                minYear = null,
                maxYear = null,
                years = this._get(inst, "yearRange");
            if (years) {
                yearSplit = years.split(":");
                currentYear = new Date().getFullYear();
                minYear = parseInt(yearSplit[0], 10);
                maxYear = parseInt(yearSplit[1], 10);
                if (yearSplit[0].match(/[+\-].*/)) {
                    minYear += currentYear;
                }
                if (yearSplit[1].match(/[+\-].*/)) {
                    maxYear += currentYear;
                }
            }
            return ((!minDate || date.getTime() >= minDate.getTime()) && (!maxDate || date.getTime() <= maxDate.getTime()) && (!minYear || date.getFullYear() >= minYear) && (!maxYear || date.getFullYear() <= maxYear));
        },
        _getFormatConfig: function(inst) {
            var shortYearCutoff = this._get(inst, "shortYearCutoff");
            shortYearCutoff = (typeof shortYearCutoff !== "string" ? shortYearCutoff : new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
            return {
                shortYearCutoff: shortYearCutoff,
                dayNamesShort: this._get(inst, "dayNamesShort"),
                dayNames: this._get(inst, "dayNames"),
                monthNamesShort: this._get(inst, "monthNamesShort"),
                monthNames: this._get(inst, "monthNames")
            };
        },
        _formatDate: function(inst, day, month, year) {
            if (!day) {
                inst.currentDay = inst.selectedDay;
                inst.currentMonth = inst.selectedMonth;
                inst.currentYear = inst.selectedYear;
            }
            var date = (day ? (typeof day === "object" ? day : this._daylightSavingAdjust(new Date(year, month, day))) : this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
            return this.formatDate(this._get(inst, "dateFormat"), date, this._getFormatConfig(inst));
        }
    });

    function datepicker_bindHover(dpDiv) {
        var selector = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";
        return dpDiv.on("mouseout", selector, function() {
            $(this).removeClass("ui-state-hover");
            if (this.className.indexOf("ui-datepicker-prev") !== -1) {
                $(this).removeClass("ui-datepicker-prev-hover");
            }
            if (this.className.indexOf("ui-datepicker-next") !== -1) {
                $(this).removeClass("ui-datepicker-next-hover");
            }
        }).on("mouseover", selector, datepicker_handleMouseover);
    }

    function datepicker_handleMouseover() {
        if (!$.datepicker._isDisabledDatepicker(datepicker_instActive.inline ? datepicker_instActive.dpDiv.parent()[0] : datepicker_instActive.input[0])) {
            $(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");
            $(this).addClass("ui-state-hover");
            if (this.className.indexOf("ui-datepicker-prev") !== -1) {
                $(this).addClass("ui-datepicker-prev-hover");
            }
            if (this.className.indexOf("ui-datepicker-next") !== -1) {
                $(this).addClass("ui-datepicker-next-hover");
            }
        }
    }

    function datepicker_extendRemove(target, props) {
        $.extend(target, props);
        for (var name in props) {
            if (props[name] == null) {
                target[name] = props[name];
            }
        }
        return target;
    }
    $.fn.datepicker = function(options) {
        if (!this.length) {
            return this;
        }
        if (!$.datepicker.initialized) {
            $(document).on("mousedown", $.datepicker._checkExternalClick);
            $.datepicker.initialized = true;
        }
        if ($("#" + $.datepicker._mainDivId).length === 0) {
            $("body").append($.datepicker.dpDiv);
        }
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options === "string" && (options === "isDisabled" || options === "getDate" || options === "widget")) {
            return $.datepicker["_" + options + "Datepicker"].apply($.datepicker, [this[0]].concat(otherArgs));
        }
        if (options === "option" && arguments.length === 2 && typeof arguments[1] === "string") {
            return $.datepicker["_" + options + "Datepicker"].apply($.datepicker, [this[0]].concat(otherArgs));
        }
        return this.each(function() {
            typeof options === "string" ? $.datepicker["_" + options + "Datepicker"].apply($.datepicker, [this].concat(otherArgs)) : $.datepicker._attachDatepicker(this, options);
        });
    };
    $.datepicker = new Datepicker();
    $.datepicker.initialized = false;
    $.datepicker.uuid = new Date().getTime();
    $.datepicker.version = "1.12.1";
    var widgetsDatepicker = $.datepicker;
    var ie = $.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());
    /*!
     * jQuery UI Mouse 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var mouseHandled = false;
    $(document).on("mouseup", function() {
        mouseHandled = false;
    });
    var widgetsMouse = $.widget("ui.mouse", {
        version: "1.12.1",
        options: {
            cancel: "input, textarea, button, select, option",
            distance: 1,
            delay: 0
        },
        _mouseInit: function() {
            var that = this;
            this.element.on("mousedown." + this.widgetName, function(event) {
                return that._mouseDown(event);
            }).on("click." + this.widgetName, function(event) {
                if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
                    $.removeData(event.target, that.widgetName + ".preventClickEvent");
                    event.stopImmediatePropagation();
                    return false;
                }
            });
            this.started = false;
        },
        _mouseDestroy: function() {
            this.element.off("." + this.widgetName);
            if (this._mouseMoveDelegate) {
                this.document.off("mousemove." + this.widgetName, this._mouseMoveDelegate).off("mouseup." + this.widgetName, this._mouseUpDelegate);
            }
        },
        _mouseDown: function(event) {
            if (mouseHandled) {
                return;
            }
            this._mouseMoved = false;
            (this._mouseStarted && this._mouseUp(event));
            this._mouseDownEvent = event;
            var that = this,
                btnIsLeft = (event.which === 1),
                elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
            if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
                return true;
            }
            this.mouseDelayMet = !this.options.delay;
            if (!this.mouseDelayMet) {
                this._mouseDelayTimer = setTimeout(function() {
                    that.mouseDelayMet = true;
                }, this.options.delay);
            }
            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(event) !== false);
                if (!this._mouseStarted) {
                    event.preventDefault();
                    return true;
                }
            }
            if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
                $.removeData(event.target, this.widgetName + ".preventClickEvent");
            }
            this._mouseMoveDelegate = function(event) {
                return that._mouseMove(event);
            };
            this._mouseUpDelegate = function(event) {
                return that._mouseUp(event);
            };
            this.document.on("mousemove." + this.widgetName, this._mouseMoveDelegate).on("mouseup." + this.widgetName, this._mouseUpDelegate);
            event.preventDefault();
            mouseHandled = true;
            return true;
        },
        _mouseMove: function(event) {
            if (this._mouseMoved) {
                if ($.ui.ie && (!document.documentMode || document.documentMode < 9) && !event.button) {
                    return this._mouseUp(event);
                } else if (!event.which) {
                    if (event.originalEvent.altKey || event.originalEvent.ctrlKey || event.originalEvent.metaKey || event.originalEvent.shiftKey) {
                        this.ignoreMissingWhich = true;
                    } else if (!this.ignoreMissingWhich) {
                        return this._mouseUp(event);
                    }
                }
            }
            if (event.which || event.button) {
                this._mouseMoved = true;
            }
            if (this._mouseStarted) {
                this._mouseDrag(event);
                return event.preventDefault();
            }
            if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
                this._mouseStarted = (this._mouseStart(this._mouseDownEvent, event) !== false);
                (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
            }
            return !this._mouseStarted;
        },
        _mouseUp: function(event) {
            this.document.off("mousemove." + this.widgetName, this._mouseMoveDelegate).off("mouseup." + this.widgetName, this._mouseUpDelegate);
            if (this._mouseStarted) {
                this._mouseStarted = false;
                if (event.target === this._mouseDownEvent.target) {
                    $.data(event.target, this.widgetName + ".preventClickEvent", true);
                }
                this._mouseStop(event);
            }
            if (this._mouseDelayTimer) {
                clearTimeout(this._mouseDelayTimer);
                delete this._mouseDelayTimer;
            }
            this.ignoreMissingWhich = false;
            mouseHandled = false;
            event.preventDefault();
        },
        _mouseDistanceMet: function(event) {
            return (Math.max(Math.abs(this._mouseDownEvent.pageX - event.pageX), Math.abs(this._mouseDownEvent.pageY - event.pageY)) >= this.options.distance);
        },
        _mouseDelayMet: function() {
            return this.mouseDelayMet;
        },
        _mouseStart: function() {},
        _mouseDrag: function() {},
        _mouseStop: function() {},
        _mouseCapture: function() {
            return true;
        }
    });
    var plugin = $.ui.plugin = {
        add: function(module, option, set) {
            var i, proto = $.ui[module].prototype;
            for (i in set) {
                proto.plugins[i] = proto.plugins[i] || [];
                proto.plugins[i].push([option, set[i]]);
            }
        },
        call: function(instance, name, args, allowDisconnected) {
            var i, set = instance.plugins[name];
            if (!set) {
                return;
            }
            if (!allowDisconnected && (!instance.element[0].parentNode || instance.element[0].parentNode.nodeType === 11)) {
                return;
            }
            for (i = 0; i < set.length; i++) {
                if (instance.options[set[i][0]]) {
                    set[i][1].apply(instance.element, args);
                }
            }
        }
    };
    var safeBlur = $.ui.safeBlur = function(element) {
        if (element && element.nodeName.toLowerCase() !== "body") {
            $(element).trigger("blur");
        }
    };
    /*!
     * jQuery UI Draggable 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.widget("ui.draggable", $.ui.mouse, {
        version: "1.12.1",
        widgetEventPrefix: "drag",
        options: {
            addClasses: true,
            appendTo: "parent",
            axis: false,
            connectToSortable: false,
            containment: false,
            cursor: "auto",
            cursorAt: false,
            grid: false,
            handle: false,
            helper: "original",
            iframeFix: false,
            opacity: false,
            refreshPositions: false,
            revert: false,
            revertDuration: 500,
            scope: "default",
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            snap: false,
            snapMode: "both",
            snapTolerance: 20,
            stack: false,
            zIndex: false,
            drag: null,
            start: null,
            stop: null
        },
        _create: function() {
            if (this.options.helper === "original") {
                this._setPositionRelative();
            }
            if (this.options.addClasses) {
                this._addClass("ui-draggable");
            }
            this._setHandleClassName();
            this._mouseInit();
        },
        _setOption: function(key, value) {
            this._super(key, value);
            if (key === "handle") {
                this._removeHandleClassName();
                this._setHandleClassName();
            }
        },
        _destroy: function() {
            if ((this.helper || this.element).is(".ui-draggable-dragging")) {
                this.destroyOnClear = true;
                return;
            }
            this._removeHandleClassName();
            this._mouseDestroy();
        },
        _mouseCapture: function(event) {
            var o = this.options;
            if (this.helper || o.disabled || $(event.target).closest(".ui-resizable-handle").length > 0) {
                return false;
            }
            this.handle = this._getHandle(event);
            if (!this.handle) {
                return false;
            }
            this._blurActiveElement(event);
            this._blockFrames(o.iframeFix === true ? "iframe" : o.iframeFix);
            return true;
        },
        _blockFrames: function(selector) {
            this.iframeBlocks = this.document.find(selector).map(function() {
                var iframe = $(this);
                return $("<div>").css("position", "absolute").appendTo(iframe.parent()).outerWidth(iframe.outerWidth()).outerHeight(iframe.outerHeight()).offset(iframe.offset())[0];
            });
        },
        _unblockFrames: function() {
            if (this.iframeBlocks) {
                this.iframeBlocks.remove();
                delete this.iframeBlocks;
            }
        },
        _blurActiveElement: function(event) {
            var activeElement = $.ui.safeActiveElement(this.document[0]),
                target = $(event.target);
            if (target.closest(activeElement).length) {
                return;
            }
            $.ui.safeBlur(activeElement);
        },
        _mouseStart: function(event) {
            var o = this.options;
            this.helper = this._createHelper(event);
            this._addClass(this.helper, "ui-draggable-dragging");
            this._cacheHelperProportions();
            if ($.ui.ddmanager) {
                $.ui.ddmanager.current = this;
            }
            this._cacheMargins();
            this.cssPosition = this.helper.css("position");
            this.scrollParent = this.helper.scrollParent(true);
            this.offsetParent = this.helper.offsetParent();
            this.hasFixedAncestor = this.helper.parents().filter(function() {
                return $(this).css("position") === "fixed";
            }).length > 0;
            this.positionAbs = this.element.offset();
            this._refreshOffsets(event);
            this.originalPosition = this.position = this._generatePosition(event, false);
            this.originalPageX = event.pageX;
            this.originalPageY = event.pageY;
            (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));
            this._setContainment();
            if (this._trigger("start", event) === false) {
                this._clear();
                return false;
            }
            this._cacheHelperProportions();
            if ($.ui.ddmanager && !o.dropBehaviour) {
                $.ui.ddmanager.prepareOffsets(this, event);
            }
            this._mouseDrag(event, true);
            if ($.ui.ddmanager) {
                $.ui.ddmanager.dragStart(this, event);
            }
            return true;
        },
        _refreshOffsets: function(event) {
            this.offset = {
                top: this.positionAbs.top - this.margins.top,
                left: this.positionAbs.left - this.margins.left,
                scroll: false,
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset()
            };
            this.offset.click = {
                left: event.pageX - this.offset.left,
                top: event.pageY - this.offset.top
            };
        },
        _mouseDrag: function(event, noPropagation) {
            if (this.hasFixedAncestor) {
                this.offset.parent = this._getParentOffset();
            }
            this.position = this._generatePosition(event, true);
            this.positionAbs = this._convertPositionTo("absolute");
            if (!noPropagation) {
                var ui = this._uiHash();
                if (this._trigger("drag", event, ui) === false) {
                    this._mouseUp(new $.Event("mouseup", event));
                    return false;
                }
                this.position = ui.position;
            }
            this.helper[0].style.left = this.position.left + "px";
            this.helper[0].style.top = this.position.top + "px";
            if ($.ui.ddmanager) {
                $.ui.ddmanager.drag(this, event);
            }
            return false;
        },
        _mouseStop: function(event) {
            var that = this,
                dropped = false;
            if ($.ui.ddmanager && !this.options.dropBehaviour) {
                dropped = $.ui.ddmanager.drop(this, event);
            }
            if (this.dropped) {
                dropped = this.dropped;
                this.dropped = false;
            }
            if ((this.options.revert === "invalid" && !dropped) || (this.options.revert === "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
                $(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
                    if (that._trigger("stop", event) !== false) {
                        that._clear();
                    }
                });
            } else {
                if (this._trigger("stop", event) !== false) {
                    this._clear();
                }
            }
            return false;
        },
        _mouseUp: function(event) {
            this._unblockFrames();
            if ($.ui.ddmanager) {
                $.ui.ddmanager.dragStop(this, event);
            }
            if (this.handleElement.is(event.target)) {
                this.element.trigger("focus");
            }
            return $.ui.mouse.prototype._mouseUp.call(this, event);
        },
        cancel: function() {
            if (this.helper.is(".ui-draggable-dragging")) {
                this._mouseUp(new $.Event("mouseup", {
                    target: this.element[0]
                }));
            } else {
                this._clear();
            }
            return this;
        },
        _getHandle: function(event) {
            return this.options.handle ? !!$(event.target).closest(this.element.find(this.options.handle)).length : true;
        },
        _setHandleClassName: function() {
            this.handleElement = this.options.handle ? this.element.find(this.options.handle) : this.element;
            this._addClass(this.handleElement, "ui-draggable-handle");
        },
        _removeHandleClassName: function() {
            this._removeClass(this.handleElement, "ui-draggable-handle");
        },
        _createHelper: function(event) {
            var o = this.options,
                helperIsFunction = $.isFunction(o.helper),
                helper = helperIsFunction ? $(o.helper.apply(this.element[0], [event])) : (o.helper === "clone" ? this.element.clone().removeAttr("id") : this.element);
            if (!helper.parents("body").length) {
                helper.appendTo((o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo));
            }
            if (helperIsFunction && helper[0] === this.element[0]) {
                this._setPositionRelative();
            }
            if (helper[0] !== this.element[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
                helper.css("position", "absolute");
            }
            return helper;
        },
        _setPositionRelative: function() {
            if (!(/^(?:r|a|f)/).test(this.element.css("position"))) {
                this.element[0].style.position = "relative";
            }
        },
        _adjustOffsetFromHelper: function(obj) {
            if (typeof obj === "string") {
                obj = obj.split(" ");
            }
            if ($.isArray(obj)) {
                obj = {
                    left: +obj[0],
                    top: +obj[1] || 0
                };
            }
            if ("left" in obj) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ("right" in obj) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ("top" in obj) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ("bottom" in obj) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },
        _isRootNode: function(element) {
            return (/(html|body)/i).test(element.tagName) || element === this.document[0];
        },
        _getParentOffset: function() {
            var po = this.offsetParent.offset(),
                document = this.document[0];
            if (this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }
            if (this._isRootNode(this.offsetParent[0])) {
                po = {
                    top: 0,
                    left: 0
                };
            }
            return {
                top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
                left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
            };
        },
        _getRelativeOffset: function() {
            if (this.cssPosition !== "relative") {
                return {
                    top: 0,
                    left: 0
                };
            }
            var p = this.element.position(),
                scrollIsRootNode = this._isRootNode(this.scrollParent[0]);
            return {
                top: p.top - (parseInt(this.helper.css("top"), 10) || 0) +
                    (!scrollIsRootNode ? this.scrollParent.scrollTop() : 0),
                left: p.left - (parseInt(this.helper.css("left"), 10) || 0) +
                    (!scrollIsRootNode ? this.scrollParent.scrollLeft() : 0)
            };
        },
        _cacheMargins: function() {
            this.margins = {
                left: (parseInt(this.element.css("marginLeft"), 10) || 0),
                top: (parseInt(this.element.css("marginTop"), 10) || 0),
                right: (parseInt(this.element.css("marginRight"), 10) || 0),
                bottom: (parseInt(this.element.css("marginBottom"), 10) || 0)
            };
        },
        _cacheHelperProportions: function() {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },
        _setContainment: function() {
            var isUserScrollable, c, ce, o = this.options,
                document = this.document[0];
            this.relativeContainer = null;
            if (!o.containment) {
                this.containment = null;
                return;
            }
            if (o.containment === "window") {
                this.containment = [$(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left, $(window).scrollTop() - this.offset.relative.top - this.offset.parent.top, $(window).scrollLeft() + $(window).width() -
                    this.helperProportions.width - this.margins.left, $(window).scrollTop() +
                    ($(window).height() || document.body.parentNode.scrollHeight) -
                    this.helperProportions.height - this.margins.top
                ];
                return;
            }
            if (o.containment === "document") {
                this.containment = [0, 0, $(document).width() - this.helperProportions.width - this.margins.left, ($(document).height() || document.body.parentNode.scrollHeight) -
                    this.helperProportions.height - this.margins.top
                ];
                return;
            }
            if (o.containment.constructor === Array) {
                this.containment = o.containment;
                return;
            }
            if (o.containment === "parent") {
                o.containment = this.helper[0].parentNode;
            }
            c = $(o.containment);
            ce = c[0];
            if (!ce) {
                return;
            }
            isUserScrollable = /(scroll|auto)/.test(c.css("overflow"));
            this.containment = [(parseInt(c.css("borderLeftWidth"), 10) || 0) +
                (parseInt(c.css("paddingLeft"), 10) || 0), (parseInt(c.css("borderTopWidth"), 10) || 0) +
                (parseInt(c.css("paddingTop"), 10) || 0), (isUserScrollable ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) -
                (parseInt(c.css("borderRightWidth"), 10) || 0) -
                (parseInt(c.css("paddingRight"), 10) || 0) -
                this.helperProportions.width -
                this.margins.left -
                this.margins.right, (isUserScrollable ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight) -
                (parseInt(c.css("borderBottomWidth"), 10) || 0) -
                (parseInt(c.css("paddingBottom"), 10) || 0) -
                this.helperProportions.height -
                this.margins.top -
                this.margins.bottom
            ];
            this.relativeContainer = c;
        },
        _convertPositionTo: function(d, pos) {
            if (!pos) {
                pos = this.position;
            }
            var mod = d === "absolute" ? 1 : -1,
                scrollIsRootNode = this._isRootNode(this.scrollParent[0]);
            return {
                top: (pos.top +
                    this.offset.relative.top * mod +
                    this.offset.parent.top * mod -
                    ((this.cssPosition === "fixed" ? -this.offset.scroll.top : (scrollIsRootNode ? 0 : this.offset.scroll.top)) * mod)),
                left: (pos.left +
                    this.offset.relative.left * mod +
                    this.offset.parent.left * mod -
                    ((this.cssPosition === "fixed" ? -this.offset.scroll.left : (scrollIsRootNode ? 0 : this.offset.scroll.left)) * mod))
            };
        },
        _generatePosition: function(event, constrainPosition) {
            var containment, co, top, left, o = this.options,
                scrollIsRootNode = this._isRootNode(this.scrollParent[0]),
                pageX = event.pageX,
                pageY = event.pageY;
            if (!scrollIsRootNode || !this.offset.scroll) {
                this.offset.scroll = {
                    top: this.scrollParent.scrollTop(),
                    left: this.scrollParent.scrollLeft()
                };
            }
            if (constrainPosition) {
                if (this.containment) {
                    if (this.relativeContainer) {
                        co = this.relativeContainer.offset();
                        containment = [this.containment[0] + co.left, this.containment[1] + co.top, this.containment[2] + co.left, this.containment[3] + co.top];
                    } else {
                        containment = this.containment;
                    }
                    if (event.pageX - this.offset.click.left < containment[0]) {
                        pageX = containment[0] + this.offset.click.left;
                    }
                    if (event.pageY - this.offset.click.top < containment[1]) {
                        pageY = containment[1] + this.offset.click.top;
                    }
                    if (event.pageX - this.offset.click.left > containment[2]) {
                        pageX = containment[2] + this.offset.click.left;
                    }
                    if (event.pageY - this.offset.click.top > containment[3]) {
                        pageY = containment[3] + this.offset.click.top;
                    }
                }
                if (o.grid) {
                    top = o.grid[1] ? this.originalPageY + Math.round((pageY -
                        this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
                    pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
                    left = o.grid[0] ? this.originalPageX +
                        Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
                    pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
                }
                if (o.axis === "y") {
                    pageX = this.originalPageX;
                }
                if (o.axis === "x") {
                    pageY = this.originalPageY;
                }
            }
            return {
                top: (pageY -
                    this.offset.click.top -
                    this.offset.relative.top -
                    this.offset.parent.top +
                    (this.cssPosition === "fixed" ? -this.offset.scroll.top : (scrollIsRootNode ? 0 : this.offset.scroll.top))),
                left: (pageX -
                    this.offset.click.left -
                    this.offset.relative.left -
                    this.offset.parent.left +
                    (this.cssPosition === "fixed" ? -this.offset.scroll.left : (scrollIsRootNode ? 0 : this.offset.scroll.left)))
            };
        },
        _clear: function() {
            this._removeClass(this.helper, "ui-draggable-dragging");
            if (this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
                this.helper.remove();
            }
            this.helper = null;
            this.cancelHelperRemoval = false;
            if (this.destroyOnClear) {
                this.destroy();
            }
        },
        _trigger: function(type, event, ui) {
            ui = ui || this._uiHash();
            $.ui.plugin.call(this, type, [event, ui, this], true);
            if (/^(drag|start|stop)/.test(type)) {
                this.positionAbs = this._convertPositionTo("absolute");
                ui.offset = this.positionAbs;
            }
            return $.Widget.prototype._trigger.call(this, type, event, ui);
        },
        plugins: {},
        _uiHash: function() {
            return {
                helper: this.helper,
                position: this.position,
                originalPosition: this.originalPosition,
                offset: this.positionAbs
            };
        }
    });
    $.ui.plugin.add("draggable", "connectToSortable", {
        start: function(event, ui, draggable) {
            var uiSortable = $.extend({}, ui, {
                item: draggable.element
            });
            draggable.sortables = [];
            $(draggable.options.connectToSortable).each(function() {
                var sortable = $(this).sortable("instance");
                if (sortable && !sortable.options.disabled) {
                    draggable.sortables.push(sortable);
                    sortable.refreshPositions();
                    sortable._trigger("activate", event, uiSortable);
                }
            });
        },
        stop: function(event, ui, draggable) {
            var uiSortable = $.extend({}, ui, {
                item: draggable.element
            });
            draggable.cancelHelperRemoval = false;
            $.each(draggable.sortables, function() {
                var sortable = this;
                if (sortable.isOver) {
                    sortable.isOver = 0;
                    draggable.cancelHelperRemoval = true;
                    sortable.cancelHelperRemoval = false;
                    sortable._storedCSS = {
                        position: sortable.placeholder.css("position"),
                        top: sortable.placeholder.css("top"),
                        left: sortable.placeholder.css("left")
                    };
                    sortable._mouseStop(event);
                    sortable.options.helper = sortable.options._helper;
                } else {
                    sortable.cancelHelperRemoval = true;
                    sortable._trigger("deactivate", event, uiSortable);
                }
            });
        },
        drag: function(event, ui, draggable) {
            $.each(draggable.sortables, function() {
                var innermostIntersecting = false,
                    sortable = this;
                sortable.positionAbs = draggable.positionAbs;
                sortable.helperProportions = draggable.helperProportions;
                sortable.offset.click = draggable.offset.click;
                if (sortable._intersectsWith(sortable.containerCache)) {
                    innermostIntersecting = true;
                    $.each(draggable.sortables, function() {
                        this.positionAbs = draggable.positionAbs;
                        this.helperProportions = draggable.helperProportions;
                        this.offset.click = draggable.offset.click;
                        if (this !== sortable && this._intersectsWith(this.containerCache) && $.contains(sortable.element[0], this.element[0])) {
                            innermostIntersecting = false;
                        }
                        return innermostIntersecting;
                    });
                }
                if (innermostIntersecting) {
                    if (!sortable.isOver) {
                        sortable.isOver = 1;
                        draggable._parent = ui.helper.parent();
                        sortable.currentItem = ui.helper.appendTo(sortable.element).data("ui-sortable-item", true);
                        sortable.options._helper = sortable.options.helper;
                        sortable.options.helper = function() {
                            return ui.helper[0];
                        };
                        event.target = sortable.currentItem[0];
                        sortable._mouseCapture(event, true);
                        sortable._mouseStart(event, true, true);
                        sortable.offset.click.top = draggable.offset.click.top;
                        sortable.offset.click.left = draggable.offset.click.left;
                        sortable.offset.parent.left -= draggable.offset.parent.left -
                            sortable.offset.parent.left;
                        sortable.offset.parent.top -= draggable.offset.parent.top -
                            sortable.offset.parent.top;
                        draggable._trigger("toSortable", event);
                        draggable.dropped = sortable.element;
                        $.each(draggable.sortables, function() {
                            this.refreshPositions();
                        });
                        draggable.currentItem = draggable.element;
                        sortable.fromOutside = draggable;
                    }
                    if (sortable.currentItem) {
                        sortable._mouseDrag(event);
                        ui.position = sortable.position;
                    }
                } else {
                    if (sortable.isOver) {
                        sortable.isOver = 0;
                        sortable.cancelHelperRemoval = true;
                        sortable.options._revert = sortable.options.revert;
                        sortable.options.revert = false;
                        sortable._trigger("out", event, sortable._uiHash(sortable));
                        sortable._mouseStop(event, true);
                        sortable.options.revert = sortable.options._revert;
                        sortable.options.helper = sortable.options._helper;
                        if (sortable.placeholder) {
                            sortable.placeholder.remove();
                        }
                        ui.helper.appendTo(draggable._parent);
                        draggable._refreshOffsets(event);
                        ui.position = draggable._generatePosition(event, true);
                        draggable._trigger("fromSortable", event);
                        draggable.dropped = false;
                        $.each(draggable.sortables, function() {
                            this.refreshPositions();
                        });
                    }
                }
            });
        }
    });
    $.ui.plugin.add("draggable", "cursor", {
        start: function(event, ui, instance) {
            var t = $("body"),
                o = instance.options;
            if (t.css("cursor")) {
                o._cursor = t.css("cursor");
            }
            t.css("cursor", o.cursor);
        },
        stop: function(event, ui, instance) {
            var o = instance.options;
            if (o._cursor) {
                $("body").css("cursor", o._cursor);
            }
        }
    });
    $.ui.plugin.add("draggable", "opacity", {
        start: function(event, ui, instance) {
            var t = $(ui.helper),
                o = instance.options;
            if (t.css("opacity")) {
                o._opacity = t.css("opacity");
            }
            t.css("opacity", o.opacity);
        },
        stop: function(event, ui, instance) {
            var o = instance.options;
            if (o._opacity) {
                $(ui.helper).css("opacity", o._opacity);
            }
        }
    });
    $.ui.plugin.add("draggable", "scroll", {
        start: function(event, ui, i) {
            if (!i.scrollParentNotHidden) {
                i.scrollParentNotHidden = i.helper.scrollParent(false);
            }
            if (i.scrollParentNotHidden[0] !== i.document[0] && i.scrollParentNotHidden[0].tagName !== "HTML") {
                i.overflowOffset = i.scrollParentNotHidden.offset();
            }
        },
        drag: function(event, ui, i) {
            var o = i.options,
                scrolled = false,
                scrollParent = i.scrollParentNotHidden[0],
                document = i.document[0];
            if (scrollParent !== document && scrollParent.tagName !== "HTML") {
                if (!o.axis || o.axis !== "x") {
                    if ((i.overflowOffset.top + scrollParent.offsetHeight) - event.pageY < o.scrollSensitivity) {
                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop + o.scrollSpeed;
                    } else if (event.pageY - i.overflowOffset.top < o.scrollSensitivity) {
                        scrollParent.scrollTop = scrolled = scrollParent.scrollTop - o.scrollSpeed;
                    }
                }
                if (!o.axis || o.axis !== "y") {
                    if ((i.overflowOffset.left + scrollParent.offsetWidth) - event.pageX < o.scrollSensitivity) {
                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + o.scrollSpeed;
                    } else if (event.pageX - i.overflowOffset.left < o.scrollSensitivity) {
                        scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - o.scrollSpeed;
                    }
                }
            } else {
                if (!o.axis || o.axis !== "x") {
                    if (event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
                        scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
                    } else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
                        scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
                    }
                }
                if (!o.axis || o.axis !== "y") {
                    if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
                        scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
                    } else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
                        scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
                    }
                }
            }
            if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
                $.ui.ddmanager.prepareOffsets(i, event);
            }
        }
    });
    $.ui.plugin.add("draggable", "snap", {
        start: function(event, ui, i) {
            var o = i.options;
            i.snapElements = [];
            $(o.snap.constructor !== String ? (o.snap.items || ":data(ui-draggable)") : o.snap).each(function() {
                var $t = $(this),
                    $o = $t.offset();
                if (this !== i.element[0]) {
                    i.snapElements.push({
                        item: this,
                        width: $t.outerWidth(),
                        height: $t.outerHeight(),
                        top: $o.top,
                        left: $o.left
                    });
                }
            });
        },
        drag: function(event, ui, inst) {
            var ts, bs, ls, rs, l, r, t, b, i, first, o = inst.options,
                d = o.snapTolerance,
                x1 = ui.offset.left,
                x2 = x1 + inst.helperProportions.width,
                y1 = ui.offset.top,
                y2 = y1 + inst.helperProportions.height;
            for (i = inst.snapElements.length - 1; i >= 0; i--) {
                l = inst.snapElements[i].left - inst.margins.left;
                r = l + inst.snapElements[i].width;
                t = inst.snapElements[i].top - inst.margins.top;
                b = t + inst.snapElements[i].height;
                if (x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d || !$.contains(inst.snapElements[i].item.ownerDocument, inst.snapElements[i].item)) {
                    if (inst.snapElements[i].snapping) {
                        (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), {
                            snapItem: inst.snapElements[i].item
                        })));
                    }
                    inst.snapElements[i].snapping = false;
                    continue;
                }
                if (o.snapMode !== "inner") {
                    ts = Math.abs(t - y2) <= d;
                    bs = Math.abs(b - y1) <= d;
                    ls = Math.abs(l - x2) <= d;
                    rs = Math.abs(r - x1) <= d;
                    if (ts) {
                        ui.position.top = inst._convertPositionTo("relative", {
                            top: t - inst.helperProportions.height,
                            left: 0
                        }).top;
                    }
                    if (bs) {
                        ui.position.top = inst._convertPositionTo("relative", {
                            top: b,
                            left: 0
                        }).top;
                    }
                    if (ls) {
                        ui.position.left = inst._convertPositionTo("relative", {
                            top: 0,
                            left: l - inst.helperProportions.width
                        }).left;
                    }
                    if (rs) {
                        ui.position.left = inst._convertPositionTo("relative", {
                            top: 0,
                            left: r
                        }).left;
                    }
                }
                first = (ts || bs || ls || rs);
                if (o.snapMode !== "outer") {
                    ts = Math.abs(t - y1) <= d;
                    bs = Math.abs(b - y2) <= d;
                    ls = Math.abs(l - x1) <= d;
                    rs = Math.abs(r - x2) <= d;
                    if (ts) {
                        ui.position.top = inst._convertPositionTo("relative", {
                            top: t,
                            left: 0
                        }).top;
                    }
                    if (bs) {
                        ui.position.top = inst._convertPositionTo("relative", {
                            top: b - inst.helperProportions.height,
                            left: 0
                        }).top;
                    }
                    if (ls) {
                        ui.position.left = inst._convertPositionTo("relative", {
                            top: 0,
                            left: l
                        }).left;
                    }
                    if (rs) {
                        ui.position.left = inst._convertPositionTo("relative", {
                            top: 0,
                            left: r - inst.helperProportions.width
                        }).left;
                    }
                }
                if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
                    (inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), {
                        snapItem: inst.snapElements[i].item
                    })));
                }
                inst.snapElements[i].snapping = (ts || bs || ls || rs || first);
            }
        }
    });
    $.ui.plugin.add("draggable", "stack", {
        start: function(event, ui, instance) {
            var min, o = instance.options,
                group = $.makeArray($(o.stack)).sort(function(a, b) {
                    return (parseInt($(a).css("zIndex"), 10) || 0) -
                        (parseInt($(b).css("zIndex"), 10) || 0);
                });
            if (!group.length) {
                return;
            }
            min = parseInt($(group[0]).css("zIndex"), 10) || 0;
            $(group).each(function(i) {
                $(this).css("zIndex", min + i);
            });
            this.css("zIndex", (min + group.length));
        }
    });
    $.ui.plugin.add("draggable", "zIndex", {
        start: function(event, ui, instance) {
            var t = $(ui.helper),
                o = instance.options;
            if (t.css("zIndex")) {
                o._zIndex = t.css("zIndex");
            }
            t.css("zIndex", o.zIndex);
        },
        stop: function(event, ui, instance) {
            var o = instance.options;
            if (o._zIndex) {
                $(ui.helper).css("zIndex", o._zIndex);
            }
        }
    });
    var widgetsDraggable = $.ui.draggable;
    /*!
     * jQuery UI Resizable 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.widget("ui.resizable", $.ui.mouse, {
        version: "1.12.1",
        widgetEventPrefix: "resize",
        options: {
            alsoResize: false,
            animate: false,
            animateDuration: "slow",
            animateEasing: "swing",
            aspectRatio: false,
            autoHide: false,
            classes: {
                "ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se"
            },
            containment: false,
            ghost: false,
            grid: false,
            handles: "e,s,se",
            helper: false,
            maxHeight: null,
            maxWidth: null,
            minHeight: 10,
            minWidth: 10,
            zIndex: 90,
            resize: null,
            start: null,
            stop: null
        },
        _num: function(value) {
            return parseFloat(value) || 0;
        },
        _isNumber: function(value) {
            return !isNaN(parseFloat(value));
        },
        _hasScroll: function(el, a) {
            if ($(el).css("overflow") === "hidden") {
                return false;
            }
            var scroll = (a && a === "left") ? "scrollLeft" : "scrollTop",
                has = false;
            if (el[scroll] > 0) {
                return true;
            }
            el[scroll] = 1;
            has = (el[scroll] > 0);
            el[scroll] = 0;
            return has;
        },
        _create: function() {
            var margins, o = this.options,
                that = this;
            this._addClass("ui-resizable");
            $.extend(this, {
                _aspectRatio: !!(o.aspectRatio),
                aspectRatio: o.aspectRatio,
                originalElement: this.element,
                _proportionallyResizeElements: [],
                _helper: o.helper || o.ghost || o.animate ? o.helper || "ui-resizable-helper" : null
            });
            if (this.element[0].nodeName.match(/^(canvas|textarea|input|select|button|img)$/i)) {
                this.element.wrap($("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({
                    position: this.element.css("position"),
                    width: this.element.outerWidth(),
                    height: this.element.outerHeight(),
                    top: this.element.css("top"),
                    left: this.element.css("left")
                }));
                this.element = this.element.parent().data("ui-resizable", this.element.resizable("instance"));
                this.elementIsWrapper = true;
                margins = {
                    marginTop: this.originalElement.css("marginTop"),
                    marginRight: this.originalElement.css("marginRight"),
                    marginBottom: this.originalElement.css("marginBottom"),
                    marginLeft: this.originalElement.css("marginLeft")
                };
                this.element.css(margins);
                this.originalElement.css("margin", 0);
                this.originalResizeStyle = this.originalElement.css("resize");
                this.originalElement.css("resize", "none");
                this._proportionallyResizeElements.push(this.originalElement.css({
                    position: "static",
                    zoom: 1,
                    display: "block"
                }));
                this.originalElement.css(margins);
                this._proportionallyResize();
            }
            this._setupHandles();
            if (o.autoHide) {
                $(this.element).on("mouseenter", function() {
                    if (o.disabled) {
                        return;
                    }
                    that._removeClass("ui-resizable-autohide");
                    that._handles.show();
                }).on("mouseleave", function() {
                    if (o.disabled) {
                        return;
                    }
                    if (!that.resizing) {
                        that._addClass("ui-resizable-autohide");
                        that._handles.hide();
                    }
                });
            }
            this._mouseInit();
        },
        _destroy: function() {
            this._mouseDestroy();
            var wrapper, _destroy = function(exp) {
                $(exp).removeData("resizable").removeData("ui-resizable").off(".resizable").find(".ui-resizable-handle").remove();
            };
            if (this.elementIsWrapper) {
                _destroy(this.element);
                wrapper = this.element;
                this.originalElement.css({
                    position: wrapper.css("position"),
                    width: wrapper.outerWidth(),
                    height: wrapper.outerHeight(),
                    top: wrapper.css("top"),
                    left: wrapper.css("left")
                }).insertAfter(wrapper);
                wrapper.remove();
            }
            this.originalElement.css("resize", this.originalResizeStyle);
            _destroy(this.originalElement);
            return this;
        },
        _setOption: function(key, value) {
            this._super(key, value);
            switch (key) {
                case "handles":
                    this._removeHandles();
                    this._setupHandles();
                    break;
                default:
                    break;
            }
        },
        _setupHandles: function() {
            var o = this.options,
                handle, i, n, hname, axis, that = this;
            this.handles = o.handles || (!$(".ui-resizable-handle", this.element).length ? "e,s,se" : {
                n: ".ui-resizable-n",
                e: ".ui-resizable-e",
                s: ".ui-resizable-s",
                w: ".ui-resizable-w",
                se: ".ui-resizable-se",
                sw: ".ui-resizable-sw",
                ne: ".ui-resizable-ne",
                nw: ".ui-resizable-nw"
            });
            this._handles = $();
            if (this.handles.constructor === String) {
                if (this.handles === "all") {
                    this.handles = "n,e,s,w,se,sw,ne,nw";
                }
                n = this.handles.split(",");
                this.handles = {};
                for (i = 0; i < n.length; i++) {
                    handle = $.trim(n[i]);
                    hname = "ui-resizable-" + handle;
                    axis = $("<div>");
                    this._addClass(axis, "ui-resizable-handle " + hname);
                    axis.css({
                        zIndex: o.zIndex
                    });
                    this.handles[handle] = ".ui-resizable-" + handle;
                    this.element.append(axis);
                }
            }
            this._renderAxis = function(target) {
                var i, axis, padPos, padWrapper;
                target = target || this.element;
                for (i in this.handles) {
                    if (this.handles[i].constructor === String) {
                        this.handles[i] = this.element.children(this.handles[i]).first().show();
                    } else if (this.handles[i].jquery || this.handles[i].nodeType) {
                        this.handles[i] = $(this.handles[i]);
                        this._on(this.handles[i], {
                            "mousedown": that._mouseDown
                        });
                    }
                    if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/^(textarea|input|select|button)$/i)) {
                        axis = $(this.handles[i], this.element);
                        padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();
                        padPos = ["padding", /ne|nw|n/.test(i) ? "Top" : /se|sw|s/.test(i) ? "Bottom" : /^e$/.test(i) ? "Right" : "Left"].join("");
                        target.css(padPos, padWrapper);
                        this._proportionallyResize();
                    }
                    this._handles = this._handles.add(this.handles[i]);
                }
            };
            this._renderAxis(this.element);
            this._handles = this._handles.add(this.element.find(".ui-resizable-handle"));
            this._handles.disableSelection();
            this._handles.on("mouseover", function() {
                if (!that.resizing) {
                    if (this.className) {
                        axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
                    }
                    that.axis = axis && axis[1] ? axis[1] : "se";
                }
            });
            if (o.autoHide) {
                this._handles.hide();
                this._addClass("ui-resizable-autohide");
            }
        },
        _removeHandles: function() {
            this._handles.remove();
        },
        _mouseCapture: function(event) {
            var i, handle, capture = false;
            for (i in this.handles) {
                handle = $(this.handles[i])[0];
                if (handle === event.target || $.contains(handle, event.target)) {
                    capture = true;
                }
            }
            return !this.options.disabled && capture;
        },
        _mouseStart: function(event) {
            var curleft, curtop, cursor, o = this.options,
                el = this.element;
            this.resizing = true;
            this._renderProxy();
            curleft = this._num(this.helper.css("left"));
            curtop = this._num(this.helper.css("top"));
            if (o.containment) {
                curleft += $(o.containment).scrollLeft() || 0;
                curtop += $(o.containment).scrollTop() || 0;
            }
            this.offset = this.helper.offset();
            this.position = {
                left: curleft,
                top: curtop
            };
            this.size = this._helper ? {
                width: this.helper.width(),
                height: this.helper.height()
            } : {
                width: el.width(),
                height: el.height()
            };
            this.originalSize = this._helper ? {
                width: el.outerWidth(),
                height: el.outerHeight()
            } : {
                width: el.width(),
                height: el.height()
            };
            this.sizeDiff = {
                width: el.outerWidth() - el.width(),
                height: el.outerHeight() - el.height()
            };
            this.originalPosition = {
                left: curleft,
                top: curtop
            };
            this.originalMousePosition = {
                left: event.pageX,
                top: event.pageY
            };
            this.aspectRatio = (typeof o.aspectRatio === "number") ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);
            cursor = $(".ui-resizable-" + this.axis).css("cursor");
            $("body").css("cursor", cursor === "auto" ? this.axis + "-resize" : cursor);
            this._addClass("ui-resizable-resizing");
            this._propagate("start", event);
            return true;
        },
        _mouseDrag: function(event) {
            var data, props, smp = this.originalMousePosition,
                a = this.axis,
                dx = (event.pageX - smp.left) || 0,
                dy = (event.pageY - smp.top) || 0,
                trigger = this._change[a];
            this._updatePrevProperties();
            if (!trigger) {
                return false;
            }
            data = trigger.apply(this, [event, dx, dy]);
            this._updateVirtualBoundaries(event.shiftKey);
            if (this._aspectRatio || event.shiftKey) {
                data = this._updateRatio(data, event);
            }
            data = this._respectSize(data, event);
            this._updateCache(data);
            this._propagate("resize", event);
            props = this._applyChanges();
            if (!this._helper && this._proportionallyResizeElements.length) {
                this._proportionallyResize();
            }
            if (!$.isEmptyObject(props)) {
                this._updatePrevProperties();
                this._trigger("resize", event, this.ui());
                this._applyChanges();
            }
            return false;
        },
        _mouseStop: function(event) {
            this.resizing = false;
            var pr, ista, soffseth, soffsetw, s, left, top, o = this.options,
                that = this;
            if (this._helper) {
                pr = this._proportionallyResizeElements;
                ista = pr.length && (/textarea/i).test(pr[0].nodeName);
                soffseth = ista && this._hasScroll(pr[0], "left") ? 0 : that.sizeDiff.height;
                soffsetw = ista ? 0 : that.sizeDiff.width;
                s = {
                    width: (that.helper.width() - soffsetw),
                    height: (that.helper.height() - soffseth)
                };
                left = (parseFloat(that.element.css("left")) +
                    (that.position.left - that.originalPosition.left)) || null;
                top = (parseFloat(that.element.css("top")) +
                    (that.position.top - that.originalPosition.top)) || null;
                if (!o.animate) {
                    this.element.css($.extend(s, {
                        top: top,
                        left: left
                    }));
                }
                that.helper.height(that.size.height);
                that.helper.width(that.size.width);
                if (this._helper && !o.animate) {
                    this._proportionallyResize();
                }
            }
            $("body").css("cursor", "auto");
            this._removeClass("ui-resizable-resizing");
            this._propagate("stop", event);
            if (this._helper) {
                this.helper.remove();
            }
            return false;
        },
        _updatePrevProperties: function() {
            this.prevPosition = {
                top: this.position.top,
                left: this.position.left
            };
            this.prevSize = {
                width: this.size.width,
                height: this.size.height
            };
        },
        _applyChanges: function() {
            var props = {};
            if (this.position.top !== this.prevPosition.top) {
                props.top = this.position.top + "px";
            }
            if (this.position.left !== this.prevPosition.left) {
                props.left = this.position.left + "px";
            }
            if (this.size.width !== this.prevSize.width) {
                props.width = this.size.width + "px";
            }
            if (this.size.height !== this.prevSize.height) {
                props.height = this.size.height + "px";
            }
            this.helper.css(props);
            return props;
        },
        _updateVirtualBoundaries: function(forceAspectRatio) {
            var pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b, o = this.options;
            b = {
                minWidth: this._isNumber(o.minWidth) ? o.minWidth : 0,
                maxWidth: this._isNumber(o.maxWidth) ? o.maxWidth : Infinity,
                minHeight: this._isNumber(o.minHeight) ? o.minHeight : 0,
                maxHeight: this._isNumber(o.maxHeight) ? o.maxHeight : Infinity
            };
            if (this._aspectRatio || forceAspectRatio) {
                pMinWidth = b.minHeight * this.aspectRatio;
                pMinHeight = b.minWidth / this.aspectRatio;
                pMaxWidth = b.maxHeight * this.aspectRatio;
                pMaxHeight = b.maxWidth / this.aspectRatio;
                if (pMinWidth > b.minWidth) {
                    b.minWidth = pMinWidth;
                }
                if (pMinHeight > b.minHeight) {
                    b.minHeight = pMinHeight;
                }
                if (pMaxWidth < b.maxWidth) {
                    b.maxWidth = pMaxWidth;
                }
                if (pMaxHeight < b.maxHeight) {
                    b.maxHeight = pMaxHeight;
                }
            }
            this._vBoundaries = b;
        },
        _updateCache: function(data) {
            this.offset = this.helper.offset();
            if (this._isNumber(data.left)) {
                this.position.left = data.left;
            }
            if (this._isNumber(data.top)) {
                this.position.top = data.top;
            }
            if (this._isNumber(data.height)) {
                this.size.height = data.height;
            }
            if (this._isNumber(data.width)) {
                this.size.width = data.width;
            }
        },
        _updateRatio: function(data) {
            var cpos = this.position,
                csize = this.size,
                a = this.axis;
            if (this._isNumber(data.height)) {
                data.width = (data.height * this.aspectRatio);
            } else if (this._isNumber(data.width)) {
                data.height = (data.width / this.aspectRatio);
            }
            if (a === "sw") {
                data.left = cpos.left + (csize.width - data.width);
                data.top = null;
            }
            if (a === "nw") {
                data.top = cpos.top + (csize.height - data.height);
                data.left = cpos.left + (csize.width - data.width);
            }
            return data;
        },
        _respectSize: function(data) {
            var o = this._vBoundaries,
                a = this.axis,
                ismaxw = this._isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width),
                ismaxh = this._isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
                isminw = this._isNumber(data.width) && o.minWidth && (o.minWidth > data.width),
                isminh = this._isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
                dw = this.originalPosition.left + this.originalSize.width,
                dh = this.originalPosition.top + this.originalSize.height,
                cw = /sw|nw|w/.test(a),
                ch = /nw|ne|n/.test(a);
            if (isminw) {
                data.width = o.minWidth;
            }
            if (isminh) {
                data.height = o.minHeight;
            }
            if (ismaxw) {
                data.width = o.maxWidth;
            }
            if (ismaxh) {
                data.height = o.maxHeight;
            }
            if (isminw && cw) {
                data.left = dw - o.minWidth;
            }
            if (ismaxw && cw) {
                data.left = dw - o.maxWidth;
            }
            if (isminh && ch) {
                data.top = dh - o.minHeight;
            }
            if (ismaxh && ch) {
                data.top = dh - o.maxHeight;
            }
            if (!data.width && !data.height && !data.left && data.top) {
                data.top = null;
            } else if (!data.width && !data.height && !data.top && data.left) {
                data.left = null;
            }
            return data;
        },
        _getPaddingPlusBorderDimensions: function(element) {
            var i = 0,
                widths = [],
                borders = [element.css("borderTopWidth"), element.css("borderRightWidth"), element.css("borderBottomWidth"), element.css("borderLeftWidth")],
                paddings = [element.css("paddingTop"), element.css("paddingRight"), element.css("paddingBottom"), element.css("paddingLeft")];
            for (; i < 4; i++) {
                widths[i] = (parseFloat(borders[i]) || 0);
                widths[i] += (parseFloat(paddings[i]) || 0);
            }
            return {
                height: widths[0] + widths[2],
                width: widths[1] + widths[3]
            };
        },
        _proportionallyResize: function() {
            if (!this._proportionallyResizeElements.length) {
                return;
            }
            var prel, i = 0,
                element = this.helper || this.element;
            for (; i < this._proportionallyResizeElements.length; i++) {
                prel = this._proportionallyResizeElements[i];
                if (!this.outerDimensions) {
                    this.outerDimensions = this._getPaddingPlusBorderDimensions(prel);
                }
                prel.css({
                    height: (element.height() - this.outerDimensions.height) || 0,
                    width: (element.width() - this.outerDimensions.width) || 0
                });
            }
        },
        _renderProxy: function() {
            var el = this.element,
                o = this.options;
            this.elementOffset = el.offset();
            if (this._helper) {
                this.helper = this.helper || $("<div style='overflow:hidden;'></div>");
                this._addClass(this.helper, this._helper);
                this.helper.css({
                    width: this.element.outerWidth(),
                    height: this.element.outerHeight(),
                    position: "absolute",
                    left: this.elementOffset.left + "px",
                    top: this.elementOffset.top + "px",
                    zIndex: ++o.zIndex
                });
                this.helper.appendTo("body").disableSelection();
            } else {
                this.helper = this.element;
            }
        },
        _change: {
            e: function(event, dx) {
                return {
                    width: this.originalSize.width + dx
                };
            },
            w: function(event, dx) {
                var cs = this.originalSize,
                    sp = this.originalPosition;
                return {
                    left: sp.left + dx,
                    width: cs.width - dx
                };
            },
            n: function(event, dx, dy) {
                var cs = this.originalSize,
                    sp = this.originalPosition;
                return {
                    top: sp.top + dy,
                    height: cs.height - dy
                };
            },
            s: function(event, dx, dy) {
                return {
                    height: this.originalSize.height + dy
                };
            },
            se: function(event, dx, dy) {
                return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
            },
            sw: function(event, dx, dy) {
                return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
            },
            ne: function(event, dx, dy) {
                return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
            },
            nw: function(event, dx, dy) {
                return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
            }
        },
        _propagate: function(n, event) {
            $.ui.plugin.call(this, n, [event, this.ui()]);
            (n !== "resize" && this._trigger(n, event, this.ui()));
        },
        plugins: {},
        ui: function() {
            return {
                originalElement: this.originalElement,
                element: this.element,
                helper: this.helper,
                position: this.position,
                size: this.size,
                originalSize: this.originalSize,
                originalPosition: this.originalPosition
            };
        }
    });
    $.ui.plugin.add("resizable", "animate", {
        stop: function(event) {
            var that = $(this).resizable("instance"),
                o = that.options,
                pr = that._proportionallyResizeElements,
                ista = pr.length && (/textarea/i).test(pr[0].nodeName),
                soffseth = ista && that._hasScroll(pr[0], "left") ? 0 : that.sizeDiff.height,
                soffsetw = ista ? 0 : that.sizeDiff.width,
                style = {
                    width: (that.size.width - soffsetw),
                    height: (that.size.height - soffseth)
                },
                left = (parseFloat(that.element.css("left")) +
                    (that.position.left - that.originalPosition.left)) || null,
                top = (parseFloat(that.element.css("top")) +
                    (that.position.top - that.originalPosition.top)) || null;
            that.element.animate($.extend(style, top && left ? {
                top: top,
                left: left
            } : {}), {
                duration: o.animateDuration,
                easing: o.animateEasing,
                step: function() {
                    var data = {
                        width: parseFloat(that.element.css("width")),
                        height: parseFloat(that.element.css("height")),
                        top: parseFloat(that.element.css("top")),
                        left: parseFloat(that.element.css("left"))
                    };
                    if (pr && pr.length) {
                        $(pr[0]).css({
                            width: data.width,
                            height: data.height
                        });
                    }
                    that._updateCache(data);
                    that._propagate("resize", event);
                }
            });
        }
    });
    $.ui.plugin.add("resizable", "containment", {
        start: function() {
            var element, p, co, ch, cw, width, height, that = $(this).resizable("instance"),
                o = that.options,
                el = that.element,
                oc = o.containment,
                ce = (oc instanceof $) ? oc.get(0) : (/parent/.test(oc)) ? el.parent().get(0) : oc;
            if (!ce) {
                return;
            }
            that.containerElement = $(ce);
            if (/document/.test(oc) || oc === document) {
                that.containerOffset = {
                    left: 0,
                    top: 0
                };
                that.containerPosition = {
                    left: 0,
                    top: 0
                };
                that.parentData = {
                    element: $(document),
                    left: 0,
                    top: 0,
                    width: $(document).width(),
                    height: $(document).height() || document.body.parentNode.scrollHeight
                };
            } else {
                element = $(ce);
                p = [];
                $(["Top", "Right", "Left", "Bottom"]).each(function(i, name) {
                    p[i] = that._num(element.css("padding" + name));
                });
                that.containerOffset = element.offset();
                that.containerPosition = element.position();
                that.containerSize = {
                    height: (element.innerHeight() - p[3]),
                    width: (element.innerWidth() - p[1])
                };
                co = that.containerOffset;
                ch = that.containerSize.height;
                cw = that.containerSize.width;
                width = (that._hasScroll(ce, "left") ? ce.scrollWidth : cw);
                height = (that._hasScroll(ce) ? ce.scrollHeight : ch);
                that.parentData = {
                    element: ce,
                    left: co.left,
                    top: co.top,
                    width: width,
                    height: height
                };
            }
        },
        resize: function(event) {
            var woset, hoset, isParent, isOffsetRelative, that = $(this).resizable("instance"),
                o = that.options,
                co = that.containerOffset,
                cp = that.position,
                pRatio = that._aspectRatio || event.shiftKey,
                cop = {
                    top: 0,
                    left: 0
                },
                ce = that.containerElement,
                continueResize = true;
            if (ce[0] !== document && (/static/).test(ce.css("position"))) {
                cop = co;
            }
            if (cp.left < (that._helper ? co.left : 0)) {
                that.size.width = that.size.width +
                    (that._helper ? (that.position.left - co.left) : (that.position.left - cop.left));
                if (pRatio) {
                    that.size.height = that.size.width / that.aspectRatio;
                    continueResize = false;
                }
                that.position.left = o.helper ? co.left : 0;
            }
            if (cp.top < (that._helper ? co.top : 0)) {
                that.size.height = that.size.height +
                    (that._helper ? (that.position.top - co.top) : that.position.top);
                if (pRatio) {
                    that.size.width = that.size.height * that.aspectRatio;
                    continueResize = false;
                }
                that.position.top = that._helper ? co.top : 0;
            }
            isParent = that.containerElement.get(0) === that.element.parent().get(0);
            isOffsetRelative = /relative|absolute/.test(that.containerElement.css("position"));
            if (isParent && isOffsetRelative) {
                that.offset.left = that.parentData.left + that.position.left;
                that.offset.top = that.parentData.top + that.position.top;
            } else {
                that.offset.left = that.element.offset().left;
                that.offset.top = that.element.offset().top;
            }
            woset = Math.abs(that.sizeDiff.width +
                (that._helper ? that.offset.left - cop.left : (that.offset.left - co.left)));
            hoset = Math.abs(that.sizeDiff.height +
                (that._helper ? that.offset.top - cop.top : (that.offset.top - co.top)));
            if (woset + that.size.width >= that.parentData.width) {
                that.size.width = that.parentData.width - woset;
                if (pRatio) {
                    that.size.height = that.size.width / that.aspectRatio;
                    continueResize = false;
                }
            }
            if (hoset + that.size.height >= that.parentData.height) {
                that.size.height = that.parentData.height - hoset;
                if (pRatio) {
                    that.size.width = that.size.height * that.aspectRatio;
                    continueResize = false;
                }
            }
            if (!continueResize) {
                that.position.left = that.prevPosition.left;
                that.position.top = that.prevPosition.top;
                that.size.width = that.prevSize.width;
                that.size.height = that.prevSize.height;
            }
        },
        stop: function() {
            var that = $(this).resizable("instance"),
                o = that.options,
                co = that.containerOffset,
                cop = that.containerPosition,
                ce = that.containerElement,
                helper = $(that.helper),
                ho = helper.offset(),
                w = helper.outerWidth() - that.sizeDiff.width,
                h = helper.outerHeight() - that.sizeDiff.height;
            if (that._helper && !o.animate && (/relative/).test(ce.css("position"))) {
                $(this).css({
                    left: ho.left - cop.left - co.left,
                    width: w,
                    height: h
                });
            }
            if (that._helper && !o.animate && (/static/).test(ce.css("position"))) {
                $(this).css({
                    left: ho.left - cop.left - co.left,
                    width: w,
                    height: h
                });
            }
        }
    });
    $.ui.plugin.add("resizable", "alsoResize", {
        start: function() {
            var that = $(this).resizable("instance"),
                o = that.options;
            $(o.alsoResize).each(function() {
                var el = $(this);
                el.data("ui-resizable-alsoresize", {
                    width: parseFloat(el.width()),
                    height: parseFloat(el.height()),
                    left: parseFloat(el.css("left")),
                    top: parseFloat(el.css("top"))
                });
            });
        },
        resize: function(event, ui) {
            var that = $(this).resizable("instance"),
                o = that.options,
                os = that.originalSize,
                op = that.originalPosition,
                delta = {
                    height: (that.size.height - os.height) || 0,
                    width: (that.size.width - os.width) || 0,
                    top: (that.position.top - op.top) || 0,
                    left: (that.position.left - op.left) || 0
                };
            $(o.alsoResize).each(function() {
                var el = $(this),
                    start = $(this).data("ui-resizable-alsoresize"),
                    style = {},
                    css = el.parents(ui.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"];
                $.each(css, function(i, prop) {
                    var sum = (start[prop] || 0) + (delta[prop] || 0);
                    if (sum && sum >= 0) {
                        style[prop] = sum || null;
                    }
                });
                el.css(style);
            });
        },
        stop: function() {
            $(this).removeData("ui-resizable-alsoresize");
        }
    });
    $.ui.plugin.add("resizable", "ghost", {
        start: function() {
            var that = $(this).resizable("instance"),
                cs = that.size;
            that.ghost = that.originalElement.clone();
            that.ghost.css({
                opacity: 0.25,
                display: "block",
                position: "relative",
                height: cs.height,
                width: cs.width,
                margin: 0,
                left: 0,
                top: 0
            });
            that._addClass(that.ghost, "ui-resizable-ghost");
            if ($.uiBackCompat !== false && typeof that.options.ghost === "string") {
                that.ghost.addClass(this.options.ghost);
            }
            that.ghost.appendTo(that.helper);
        },
        resize: function() {
            var that = $(this).resizable("instance");
            if (that.ghost) {
                that.ghost.css({
                    position: "relative",
                    height: that.size.height,
                    width: that.size.width
                });
            }
        },
        stop: function() {
            var that = $(this).resizable("instance");
            if (that.ghost && that.helper) {
                that.helper.get(0).removeChild(that.ghost.get(0));
            }
        }
    });
    $.ui.plugin.add("resizable", "grid", {
        resize: function() {
            var outerDimensions, that = $(this).resizable("instance"),
                o = that.options,
                cs = that.size,
                os = that.originalSize,
                op = that.originalPosition,
                a = that.axis,
                grid = typeof o.grid === "number" ? [o.grid, o.grid] : o.grid,
                gridX = (grid[0] || 1),
                gridY = (grid[1] || 1),
                ox = Math.round((cs.width - os.width) / gridX) * gridX,
                oy = Math.round((cs.height - os.height) / gridY) * gridY,
                newWidth = os.width + ox,
                newHeight = os.height + oy,
                isMaxWidth = o.maxWidth && (o.maxWidth < newWidth),
                isMaxHeight = o.maxHeight && (o.maxHeight < newHeight),
                isMinWidth = o.minWidth && (o.minWidth > newWidth),
                isMinHeight = o.minHeight && (o.minHeight > newHeight);
            o.grid = grid;
            if (isMinWidth) {
                newWidth += gridX;
            }
            if (isMinHeight) {
                newHeight += gridY;
            }
            if (isMaxWidth) {
                newWidth -= gridX;
            }
            if (isMaxHeight) {
                newHeight -= gridY;
            }
            if (/^(se|s|e)$/.test(a)) {
                that.size.width = newWidth;
                that.size.height = newHeight;
            } else if (/^(ne)$/.test(a)) {
                that.size.width = newWidth;
                that.size.height = newHeight;
                that.position.top = op.top - oy;
            } else if (/^(sw)$/.test(a)) {
                that.size.width = newWidth;
                that.size.height = newHeight;
                that.position.left = op.left - ox;
            } else {
                if (newHeight - gridY <= 0 || newWidth - gridX <= 0) {
                    outerDimensions = that._getPaddingPlusBorderDimensions(this);
                }
                if (newHeight - gridY > 0) {
                    that.size.height = newHeight;
                    that.position.top = op.top - oy;
                } else {
                    newHeight = gridY - outerDimensions.height;
                    that.size.height = newHeight;
                    that.position.top = op.top + os.height - newHeight;
                }
                if (newWidth - gridX > 0) {
                    that.size.width = newWidth;
                    that.position.left = op.left - ox;
                } else {
                    newWidth = gridX - outerDimensions.width;
                    that.size.width = newWidth;
                    that.position.left = op.left + os.width - newWidth;
                }
            }
        }
    });
    var widgetsResizable = $.ui.resizable;
    /*!
     * jQuery UI Dialog 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.widget("ui.dialog", {
        version: "1.12.1",
        options: {
            appendTo: "body",
            autoOpen: true,
            buttons: [],
            classes: {
                "ui-dialog": "ui-corner-all",
                "ui-dialog-titlebar": "ui-corner-all"
            },
            closeOnEscape: true,
            closeText: "Close",
            draggable: true,
            hide: null,
            height: "auto",
            maxHeight: null,
            maxWidth: null,
            minHeight: 150,
            minWidth: 150,
            modal: false,
            position: {
                my: "center",
                at: "center",
                of: window,
                collision: "fit",
                using: function(pos) {
                    var topOffset = $(this).css(pos).offset().top;
                    if (topOffset < 0) {
                        $(this).css("top", pos.top - topOffset);
                    }
                }
            },
            resizable: true,
            show: null,
            title: null,
            width: 300,
            beforeClose: null,
            close: null,
            drag: null,
            dragStart: null,
            dragStop: null,
            focus: null,
            open: null,
            resize: null,
            resizeStart: null,
            resizeStop: null
        },
        sizeRelatedOptions: {
            buttons: true,
            height: true,
            maxHeight: true,
            maxWidth: true,
            minHeight: true,
            minWidth: true,
            width: true
        },
        resizableRelatedOptions: {
            maxHeight: true,
            maxWidth: true,
            minHeight: true,
            minWidth: true
        },
        _create: function() {
            this.originalCss = {
                display: this.element[0].style.display,
                width: this.element[0].style.width,
                minHeight: this.element[0].style.minHeight,
                maxHeight: this.element[0].style.maxHeight,
                height: this.element[0].style.height
            };
            this.originalPosition = {
                parent: this.element.parent(),
                index: this.element.parent().children().index(this.element)
            };
            this.originalTitle = this.element.attr("title");
            if (this.options.title == null && this.originalTitle != null) {
                this.options.title = this.originalTitle;
            }
            if (this.options.disabled) {
                this.options.disabled = false;
            }
            this._createWrapper();
            this.element.show().removeAttr("title").appendTo(this.uiDialog);
            this._addClass("ui-dialog-content", "ui-widget-content");
            this._createTitlebar();
            this._createButtonPane();
            if (this.options.draggable && $.fn.draggable) {
                this._makeDraggable();
            }
            if (this.options.resizable && $.fn.resizable) {
                this._makeResizable();
            }
            this._isOpen = false;
            this._trackFocus();
        },
        _init: function() {
            if (this.options.autoOpen) {
                this.open();
            }
        },
        _appendTo: function() {
            var element = this.options.appendTo;
            if (element && (element.jquery || element.nodeType)) {
                return $(element);
            }
            return this.document.find(element || "body").eq(0);
        },
        _destroy: function() {
            var next, originalPosition = this.originalPosition;
            this._untrackInstance();
            this._destroyOverlay();
            this.element.removeUniqueId().css(this.originalCss).detach();
            this.uiDialog.remove();
            if (this.originalTitle) {
                this.element.attr("title", this.originalTitle);
            }
            next = originalPosition.parent.children().eq(originalPosition.index);
            if (next.length && next[0] !== this.element[0]) {
                next.before(this.element);
            } else {
                originalPosition.parent.append(this.element);
            }
        },
        widget: function() {
            return this.uiDialog;
        },
        disable: $.noop,
        enable: $.noop,
        close: function(event) {
            var that = this;
            if (!this._isOpen || this._trigger("beforeClose", event) === false) {
                return;
            }
            this._isOpen = false;
            this._focusedElement = null;
            this._destroyOverlay();
            this._untrackInstance();
            if (!this.opener.filter(":focusable").trigger("focus").length) {
                $.ui.safeBlur($.ui.safeActiveElement(this.document[0]));
            }
            this._hide(this.uiDialog, this.options.hide, function() {
                that._trigger("close", event);
            });
        },
        isOpen: function() {
            return this._isOpen;
        },
        moveToTop: function() {
            this._moveToTop();
        },
        _moveToTop: function(event, silent) {
            var moved = false,
                zIndices = this.uiDialog.siblings(".ui-front:visible").map(function() {
                    return +$(this).css("z-index");
                }).get(),
                zIndexMax = Math.max.apply(null, zIndices);
            if (zIndexMax >= +this.uiDialog.css("z-index")) {
                this.uiDialog.css("z-index", zIndexMax + 1);
                moved = true;
            }
            if (moved && !silent) {
                this._trigger("focus", event);
            }
            return moved;
        },
        open: function() {
            var that = this;
            if (this._isOpen) {
                if (this._moveToTop()) {
                    this._focusTabbable();
                }
                return;
            }
            this._isOpen = true;
            this.opener = $($.ui.safeActiveElement(this.document[0]));
            this._size();
            this._position();
            this._createOverlay();
            this._moveToTop(null, true);
            if (this.overlay) {
                this.overlay.css("z-index", this.uiDialog.css("z-index") - 1);
            }
            this._show(this.uiDialog, this.options.show, function() {
                that._focusTabbable();
                that._trigger("focus");
            });
            this._makeFocusTarget();
            this._trigger("open");
        },
        _focusTabbable: function() {
            var hasFocus = this._focusedElement;
            if (!hasFocus) {
                hasFocus = this.element.find("[autofocus]");
            }
            if (!hasFocus.length) {
                hasFocus = this.element.find(":tabbable");
            }
            if (!hasFocus.length) {
                hasFocus = this.uiDialogButtonPane.find(":tabbable");
            }
            if (!hasFocus.length) {
                hasFocus = this.uiDialogTitlebarClose.filter(":tabbable");
            }
            if (!hasFocus.length) {
                hasFocus = this.uiDialog;
            }
            hasFocus.eq(0).trigger("focus");
        },
        _keepFocus: function(event) {
            function checkFocus() {
                var activeElement = $.ui.safeActiveElement(this.document[0]),
                    isActive = this.uiDialog[0] === activeElement || $.contains(this.uiDialog[0], activeElement);
                if (!isActive) {
                    this._focusTabbable();
                }
            }
            event.preventDefault();
            checkFocus.call(this);
            this._delay(checkFocus);
        },
        _createWrapper: function() {
            this.uiDialog = $("<div>").hide().attr({
                tabIndex: -1,
                role: "dialog"
            }).appendTo(this._appendTo());
            this._addClass(this.uiDialog, "ui-dialog", "ui-widget ui-widget-content ui-front");
            this._on(this.uiDialog, {
                keydown: function(event) {
                    if (this.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode && event.keyCode === $.ui.keyCode.ESCAPE) {
                        event.preventDefault();
                        this.close(event);
                        return;
                    }
                    if (event.keyCode !== $.ui.keyCode.TAB || event.isDefaultPrevented()) {
                        return;
                    }
                    var tabbables = this.uiDialog.find(":tabbable"),
                        first = tabbables.filter(":first"),
                        last = tabbables.filter(":last");
                    if ((event.target === last[0] || event.target === this.uiDialog[0]) && !event.shiftKey) {
                        this._delay(function() {
                            first.trigger("focus");
                        });
                        event.preventDefault();
                    } else if ((event.target === first[0] || event.target === this.uiDialog[0]) && event.shiftKey) {
                        this._delay(function() {
                            last.trigger("focus");
                        });
                        event.preventDefault();
                    }
                },
                mousedown: function(event) {
                    if (this._moveToTop(event)) {
                        this._focusTabbable();
                    }
                }
            });
            if (!this.element.find("[aria-describedby]").length) {
                this.uiDialog.attr({
                    "aria-describedby": this.element.uniqueId().attr("id")
                });
            }
        },
        _createTitlebar: function() {
            var uiDialogTitle;
            this.uiDialogTitlebar = $("<div>");
            this._addClass(this.uiDialogTitlebar, "ui-dialog-titlebar", "ui-widget-header ui-helper-clearfix");
            this._on(this.uiDialogTitlebar, {
                mousedown: function(event) {
                    if (!$(event.target).closest(".ui-dialog-titlebar-close")) {
                        this.uiDialog.trigger("focus");
                    }
                }
            });
            this.uiDialogTitlebarClose = $("<button type='button'></button>").button({
                label: $("<a>").text(this.options.closeText).html(),
                icon: "ui-icon-closethick",
                showLabel: false
            }).appendTo(this.uiDialogTitlebar);
            this._addClass(this.uiDialogTitlebarClose, "ui-dialog-titlebar-close");
            this._on(this.uiDialogTitlebarClose, {
                click: function(event) {
                    event.preventDefault();
                    this.close(event);
                }
            });
            uiDialogTitle = $("<span>").uniqueId().prependTo(this.uiDialogTitlebar);
            this._addClass(uiDialogTitle, "ui-dialog-title");
            this._title(uiDialogTitle);
            this.uiDialogTitlebar.prependTo(this.uiDialog);
            this.uiDialog.attr({
                "aria-labelledby": uiDialogTitle.attr("id")
            });
        },
        _title: function(title) {
            if (this.options.title) {
                title.text(this.options.title);
            } else {
                title.html("&#160;");
            }
        },
        _createButtonPane: function() {
            this.uiDialogButtonPane = $("<div>");
            this._addClass(this.uiDialogButtonPane, "ui-dialog-buttonpane", "ui-widget-content ui-helper-clearfix");
            this.uiButtonSet = $("<div>").appendTo(this.uiDialogButtonPane);
            this._addClass(this.uiButtonSet, "ui-dialog-buttonset");
            this._createButtons();
        },
        _createButtons: function() {
            var that = this,
                buttons = this.options.buttons;
            this.uiDialogButtonPane.remove();
            this.uiButtonSet.empty();
            if ($.isEmptyObject(buttons) || ($.isArray(buttons) && !buttons.length)) {
                this._removeClass(this.uiDialog, "ui-dialog-buttons");
                return;
            }
            $.each(buttons, function(name, props) {
                var click, buttonOptions;
                props = $.isFunction(props) ? {
                    click: props,
                    text: name
                } : props;
                props = $.extend({
                    type: "button"
                }, props);
                click = props.click;
                buttonOptions = {
                    icon: props.icon,
                    iconPosition: props.iconPosition,
                    showLabel: props.showLabel,
                    icons: props.icons,
                    text: props.text
                };
                delete props.click;
                delete props.icon;
                delete props.iconPosition;
                delete props.showLabel;
                delete props.icons;
                if (typeof props.text === "boolean") {
                    delete props.text;
                }
                $("<button></button>", props).button(buttonOptions).appendTo(that.uiButtonSet).on("click", function() {
                    click.apply(that.element[0], arguments);
                });
            });
            this._addClass(this.uiDialog, "ui-dialog-buttons");
            this.uiDialogButtonPane.appendTo(this.uiDialog);
        },
        _makeDraggable: function() {
            var that = this,
                options = this.options;

            function filteredUi(ui) {
                return {
                    position: ui.position,
                    offset: ui.offset
                };
            }
            this.uiDialog.draggable({
                cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
                handle: ".ui-dialog-titlebar",
                containment: "document",
                start: function(event, ui) {
                    that._addClass($(this), "ui-dialog-dragging");
                    that._blockFrames();
                    that._trigger("dragStart", event, filteredUi(ui));
                },
                drag: function(event, ui) {
                    that._trigger("drag", event, filteredUi(ui));
                },
                stop: function(event, ui) {
                    var left = ui.offset.left - that.document.scrollLeft(),
                        top = ui.offset.top - that.document.scrollTop();
                    options.position = {
                        my: "left top",
                        at: "left" + (left >= 0 ? "+" : "") + left + " " + "top" + (top >= 0 ? "+" : "") + top,
                        of: that.window
                    };
                    that._removeClass($(this), "ui-dialog-dragging");
                    that._unblockFrames();
                    that._trigger("dragStop", event, filteredUi(ui));
                }
            });
        },
        _makeResizable: function() {
            var that = this,
                options = this.options,
                handles = options.resizable,
                position = this.uiDialog.css("position"),
                resizeHandles = typeof handles === "string" ? handles : "n,e,s,w,se,sw,ne,nw";

            function filteredUi(ui) {
                return {
                    originalPosition: ui.originalPosition,
                    originalSize: ui.originalSize,
                    position: ui.position,
                    size: ui.size
                };
            }
            this.uiDialog.resizable({
                cancel: ".ui-dialog-content",
                containment: "document",
                alsoResize: this.element,
                maxWidth: options.maxWidth,
                maxHeight: options.maxHeight,
                minWidth: options.minWidth,
                minHeight: this._minHeight(),
                handles: resizeHandles,
                start: function(event, ui) {
                    that._addClass($(this), "ui-dialog-resizing");
                    that._blockFrames();
                    that._trigger("resizeStart", event, filteredUi(ui));
                },
                resize: function(event, ui) {
                    that._trigger("resize", event, filteredUi(ui));
                },
                stop: function(event, ui) {
                    var offset = that.uiDialog.offset(),
                        left = offset.left - that.document.scrollLeft(),
                        top = offset.top - that.document.scrollTop();
                    options.height = that.uiDialog.height();
                    options.width = that.uiDialog.width();
                    options.position = {
                        my: "left top",
                        at: "left" + (left >= 0 ? "+" : "") + left + " " + "top" + (top >= 0 ? "+" : "") + top,
                        of: that.window
                    };
                    that._removeClass($(this), "ui-dialog-resizing");
                    that._unblockFrames();
                    that._trigger("resizeStop", event, filteredUi(ui));
                }
            }).css("position", position);
        },
        _trackFocus: function() {
            this._on(this.widget(), {
                focusin: function(event) {
                    this._makeFocusTarget();
                    this._focusedElement = $(event.target);
                }
            });
        },
        _makeFocusTarget: function() {
            this._untrackInstance();
            this._trackingInstances().unshift(this);
        },
        _untrackInstance: function() {
            var instances = this._trackingInstances(),
                exists = $.inArray(this, instances);
            if (exists !== -1) {
                instances.splice(exists, 1);
            }
        },
        _trackingInstances: function() {
            var instances = this.document.data("ui-dialog-instances");
            if (!instances) {
                instances = [];
                this.document.data("ui-dialog-instances", instances);
            }
            return instances;
        },
        _minHeight: function() {
            var options = this.options;
            return options.height === "auto" ? options.minHeight : Math.min(options.minHeight, options.height);
        },
        _position: function() {
            var isVisible = this.uiDialog.is(":visible");
            if (!isVisible) {
                this.uiDialog.show();
            }
            this.uiDialog.position(this.options.position);
            if (!isVisible) {
                this.uiDialog.hide();
            }
        },
        _setOptions: function(options) {
            var that = this,
                resize = false,
                resizableOptions = {};
            $.each(options, function(key, value) {
                that._setOption(key, value);
                if (key in that.sizeRelatedOptions) {
                    resize = true;
                }
                if (key in that.resizableRelatedOptions) {
                    resizableOptions[key] = value;
                }
            });
            if (resize) {
                this._size();
                this._position();
            }
            if (this.uiDialog.is(":data(ui-resizable)")) {
                this.uiDialog.resizable("option", resizableOptions);
            }
        },
        _setOption: function(key, value) {
            var isDraggable, isResizable, uiDialog = this.uiDialog;
            if (key === "disabled") {
                return;
            }
            this._super(key, value);
            if (key === "appendTo") {
                this.uiDialog.appendTo(this._appendTo());
            }
            if (key === "buttons") {
                this._createButtons();
            }
            if (key === "closeText") {
                this.uiDialogTitlebarClose.button({
                    label: $("<a>").text("" + this.options.closeText).html()
                });
            }
            if (key === "draggable") {
                isDraggable = uiDialog.is(":data(ui-draggable)");
                if (isDraggable && !value) {
                    uiDialog.draggable("destroy");
                }
                if (!isDraggable && value) {
                    this._makeDraggable();
                }
            }
            if (key === "position") {
                this._position();
            }
            if (key === "resizable") {
                isResizable = uiDialog.is(":data(ui-resizable)");
                if (isResizable && !value) {
                    uiDialog.resizable("destroy");
                }
                if (isResizable && typeof value === "string") {
                    uiDialog.resizable("option", "handles", value);
                }
                if (!isResizable && value !== false) {
                    this._makeResizable();
                }
            }
            if (key === "title") {
                this._title(this.uiDialogTitlebar.find(".ui-dialog-title"));
            }
        },
        _size: function() {
            var nonContentHeight, minContentHeight, maxContentHeight, options = this.options;
            this.element.show().css({
                width: "auto",
                minHeight: 0,
                maxHeight: "none",
                height: 0
            });
            if (options.minWidth > options.width) {
                options.width = options.minWidth;
            }
            nonContentHeight = this.uiDialog.css({
                height: "auto",
                width: options.width
            }).outerHeight();
            minContentHeight = Math.max(0, options.minHeight - nonContentHeight);
            maxContentHeight = typeof options.maxHeight === "number" ? Math.max(0, options.maxHeight - nonContentHeight) : "none";
            if (options.height === "auto") {
                this.element.css({
                    minHeight: minContentHeight,
                    maxHeight: maxContentHeight,
                    height: "auto"
                });
            } else {
                this.element.height(Math.max(0, options.height - nonContentHeight));
            }
            if (this.uiDialog.is(":data(ui-resizable)")) {
                this.uiDialog.resizable("option", "minHeight", this._minHeight());
            }
        },
        _blockFrames: function() {
            this.iframeBlocks = this.document.find("iframe").map(function() {
                var iframe = $(this);
                return $("<div>").css({
                    position: "absolute",
                    width: iframe.outerWidth(),
                    height: iframe.outerHeight()
                }).appendTo(iframe.parent()).offset(iframe.offset())[0];
            });
        },
        _unblockFrames: function() {
            if (this.iframeBlocks) {
                this.iframeBlocks.remove();
                delete this.iframeBlocks;
            }
        },
        _allowInteraction: function(event) {
            if ($(event.target).closest(".ui-dialog").length) {
                return true;
            }
            return !!$(event.target).closest(".ui-datepicker").length;
        },
        _createOverlay: function() {
            if (!this.options.modal) {
                return;
            }
            var isOpening = true;
            this._delay(function() {
                isOpening = false;
            });
            if (!this.document.data("ui-dialog-overlays")) {
                this._on(this.document, {
                    focusin: function(event) {
                        if (isOpening) {
                            return;
                        }
                        if (!this._allowInteraction(event)) {
                            event.preventDefault();
                            this._trackingInstances()[0]._focusTabbable();
                        }
                    }
                });
            }
            this.overlay = $("<div>").appendTo(this._appendTo());
            this._addClass(this.overlay, null, "ui-widget-overlay ui-front");
            this._on(this.overlay, {
                mousedown: "_keepFocus"
            });
            this.document.data("ui-dialog-overlays", (this.document.data("ui-dialog-overlays") || 0) + 1);
        },
        _destroyOverlay: function() {
            if (!this.options.modal) {
                return;
            }
            if (this.overlay) {
                var overlays = this.document.data("ui-dialog-overlays") - 1;
                if (!overlays) {
                    this._off(this.document, "focusin");
                    this.document.removeData("ui-dialog-overlays");
                } else {
                    this.document.data("ui-dialog-overlays", overlays);
                }
                this.overlay.remove();
                this.overlay = null;
            }
        }
    });
    if ($.uiBackCompat !== false) {
        $.widget("ui.dialog", $.ui.dialog, {
            options: {
                dialogClass: ""
            },
            _createWrapper: function() {
                this._super();
                this.uiDialog.addClass(this.options.dialogClass);
            },
            _setOption: function(key, value) {
                if (key === "dialogClass") {
                    this.uiDialog.removeClass(this.options.dialogClass).addClass(value);
                }
                this._superApply(arguments);
            }
        });
    }
    var widgetsDialog = $.ui.dialog;
    /*!
     * jQuery UI Droppable 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.widget("ui.droppable", {
        version: "1.12.1",
        widgetEventPrefix: "drop",
        options: {
            accept: "*",
            addClasses: true,
            greedy: false,
            scope: "default",
            tolerance: "intersect",
            activate: null,
            deactivate: null,
            drop: null,
            out: null,
            over: null
        },
        _create: function() {
            var proportions, o = this.options,
                accept = o.accept;
            this.isover = false;
            this.isout = true;
            this.accept = $.isFunction(accept) ? accept : function(d) {
                return d.is(accept);
            };
            this.proportions = function() {
                if (arguments.length) {
                    proportions = arguments[0];
                } else {
                    return proportions ? proportions : proportions = {
                        width: this.element[0].offsetWidth,
                        height: this.element[0].offsetHeight
                    };
                }
            };
            this._addToManager(o.scope);
            o.addClasses && this._addClass("ui-droppable");
        },
        _addToManager: function(scope) {
            $.ui.ddmanager.droppables[scope] = $.ui.ddmanager.droppables[scope] || [];
            $.ui.ddmanager.droppables[scope].push(this);
        },
        _splice: function(drop) {
            var i = 0;
            for (; i < drop.length; i++) {
                if (drop[i] === this) {
                    drop.splice(i, 1);
                }
            }
        },
        _destroy: function() {
            var drop = $.ui.ddmanager.droppables[this.options.scope];
            this._splice(drop);
        },
        _setOption: function(key, value) {
            if (key === "accept") {
                this.accept = $.isFunction(value) ? value : function(d) {
                    return d.is(value);
                };
            } else if (key === "scope") {
                var drop = $.ui.ddmanager.droppables[this.options.scope];
                this._splice(drop);
                this._addToManager(value);
            }
            this._super(key, value);
        },
        _activate: function(event) {
            var draggable = $.ui.ddmanager.current;
            this._addActiveClass();
            if (draggable) {
                this._trigger("activate", event, this.ui(draggable));
            }
        },
        _deactivate: function(event) {
            var draggable = $.ui.ddmanager.current;
            this._removeActiveClass();
            if (draggable) {
                this._trigger("deactivate", event, this.ui(draggable));
            }
        },
        _over: function(event) {
            var draggable = $.ui.ddmanager.current;
            if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
                return;
            }
            if (this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                this._addHoverClass();
                this._trigger("over", event, this.ui(draggable));
            }
        },
        _out: function(event) {
            var draggable = $.ui.ddmanager.current;
            if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
                return;
            }
            if (this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                this._removeHoverClass();
                this._trigger("out", event, this.ui(draggable));
            }
        },
        _drop: function(event, custom) {
            var draggable = custom || $.ui.ddmanager.current,
                childrenIntersection = false;
            if (!draggable || (draggable.currentItem || draggable.element)[0] === this.element[0]) {
                return false;
            }
            this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function() {
                var inst = $(this).droppable("instance");
                if (inst.options.greedy && !inst.options.disabled && inst.options.scope === draggable.options.scope && inst.accept.call(inst.element[0], (draggable.currentItem || draggable.element)) && intersect(draggable, $.extend(inst, {
                        offset: inst.element.offset()
                    }), inst.options.tolerance, event)) {
                    childrenIntersection = true;
                    return false;
                }
            });
            if (childrenIntersection) {
                return false;
            }
            if (this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                this._removeActiveClass();
                this._removeHoverClass();
                this._trigger("drop", event, this.ui(draggable));
                return this.element;
            }
            return false;
        },
        ui: function(c) {
            return {
                draggable: (c.currentItem || c.element),
                helper: c.helper,
                position: c.position,
                offset: c.positionAbs
            };
        },
        _addHoverClass: function() {
            this._addClass("ui-droppable-hover");
        },
        _removeHoverClass: function() {
            this._removeClass("ui-droppable-hover");
        },
        _addActiveClass: function() {
            this._addClass("ui-droppable-active");
        },
        _removeActiveClass: function() {
            this._removeClass("ui-droppable-active");
        }
    });
    var intersect = $.ui.intersect = (function() {
        function isOverAxis(x, reference, size) {
            return (x >= reference) && (x < (reference + size));
        }
        return function(draggable, droppable, toleranceMode, event) {
            if (!droppable.offset) {
                return false;
            }
            var x1 = (draggable.positionAbs || draggable.position.absolute).left + draggable.margins.left,
                y1 = (draggable.positionAbs || draggable.position.absolute).top + draggable.margins.top,
                x2 = x1 + draggable.helperProportions.width,
                y2 = y1 + draggable.helperProportions.height,
                l = droppable.offset.left,
                t = droppable.offset.top,
                r = l + droppable.proportions().width,
                b = t + droppable.proportions().height;
            switch (toleranceMode) {
                case "fit":
                    return (l <= x1 && x2 <= r && t <= y1 && y2 <= b);
                case "intersect":
                    return (l < x1 + (draggable.helperProportions.width / 2) && x2 - (draggable.helperProportions.width / 2) < r && t < y1 + (draggable.helperProportions.height / 2) && y2 - (draggable.helperProportions.height / 2) < b);
                case "pointer":
                    return isOverAxis(event.pageY, t, droppable.proportions().height) && isOverAxis(event.pageX, l, droppable.proportions().width);
                case "touch":
                    return ((y1 >= t && y1 <= b) || (y2 >= t && y2 <= b) || (y1 < t && y2 > b)) && ((x1 >= l && x1 <= r) || (x2 >= l && x2 <= r) || (x1 < l && x2 > r));
                default:
                    return false;
            }
        };
    })();
    $.ui.ddmanager = {
        current: null,
        droppables: {
            "default": []
        },
        prepareOffsets: function(t, event) {
            var i, j, m = $.ui.ddmanager.droppables[t.options.scope] || [],
                type = event ? event.type : null,
                list = (t.currentItem || t.element).find(":data(ui-droppable)").addBack();
            droppablesLoop: for (i = 0; i < m.length; i++) {
                if (m[i].options.disabled || (t && !m[i].accept.call(m[i].element[0], (t.currentItem || t.element)))) {
                    continue;
                }
                for (j = 0; j < list.length; j++) {
                    if (list[j] === m[i].element[0]) {
                        m[i].proportions().height = 0;
                        continue droppablesLoop;
                    }
                }
                m[i].visible = m[i].element.css("display") !== "none";
                if (!m[i].visible) {
                    continue;
                }
                if (type === "mousedown") {
                    m[i]._activate.call(m[i], event);
                }
                m[i].offset = m[i].element.offset();
                m[i].proportions({
                    width: m[i].element[0].offsetWidth,
                    height: m[i].element[0].offsetHeight
                });
            }
        },
        drop: function(draggable, event) {
            var dropped = false;
            $.each(($.ui.ddmanager.droppables[draggable.options.scope] || []).slice(), function() {
                if (!this.options) {
                    return;
                }
                if (!this.options.disabled && this.visible && intersect(draggable, this, this.options.tolerance, event)) {
                    dropped = this._drop.call(this, event) || dropped;
                }
                if (!this.options.disabled && this.visible && this.accept.call(this.element[0], (draggable.currentItem || draggable.element))) {
                    this.isout = true;
                    this.isover = false;
                    this._deactivate.call(this, event);
                }
            });
            return dropped;
        },
        dragStart: function(draggable, event) {
            draggable.element.parentsUntil("body").on("scroll.droppable", function() {
                if (!draggable.options.refreshPositions) {
                    $.ui.ddmanager.prepareOffsets(draggable, event);
                }
            });
        },
        drag: function(draggable, event) {
            if (draggable.options.refreshPositions) {
                $.ui.ddmanager.prepareOffsets(draggable, event);
            }
            $.each($.ui.ddmanager.droppables[draggable.options.scope] || [], function() {
                if (this.options.disabled || this.greedyChild || !this.visible) {
                    return;
                }
                var parentInstance, scope, parent, intersects = intersect(draggable, this, this.options.tolerance, event),
                    c = !intersects && this.isover ? "isout" : (intersects && !this.isover ? "isover" : null);
                if (!c) {
                    return;
                }
                if (this.options.greedy) {
                    scope = this.options.scope;
                    parent = this.element.parents(":data(ui-droppable)").filter(function() {
                        return $(this).droppable("instance").options.scope === scope;
                    });
                    if (parent.length) {
                        parentInstance = $(parent[0]).droppable("instance");
                        parentInstance.greedyChild = (c === "isover");
                    }
                }
                if (parentInstance && c === "isover") {
                    parentInstance.isover = false;
                    parentInstance.isout = true;
                    parentInstance._out.call(parentInstance, event);
                }
                this[c] = true;
                this[c === "isout" ? "isover" : "isout"] = false;
                this[c === "isover" ? "_over" : "_out"].call(this, event);
                if (parentInstance && c === "isout") {
                    parentInstance.isout = false;
                    parentInstance.isover = true;
                    parentInstance._over.call(parentInstance, event);
                }
            });
        },
        dragStop: function(draggable, event) {
            draggable.element.parentsUntil("body").off("scroll.droppable");
            if (!draggable.options.refreshPositions) {
                $.ui.ddmanager.prepareOffsets(draggable, event);
            }
        }
    };
    if ($.uiBackCompat !== false) {
        $.widget("ui.droppable", $.ui.droppable, {
            options: {
                hoverClass: false,
                activeClass: false
            },
            _addActiveClass: function() {
                this._super();
                if (this.options.activeClass) {
                    this.element.addClass(this.options.activeClass);
                }
            },
            _removeActiveClass: function() {
                this._super();
                if (this.options.activeClass) {
                    this.element.removeClass(this.options.activeClass);
                }
            },
            _addHoverClass: function() {
                this._super();
                if (this.options.hoverClass) {
                    this.element.addClass(this.options.hoverClass);
                }
            },
            _removeHoverClass: function() {
                this._super();
                if (this.options.hoverClass) {
                    this.element.removeClass(this.options.hoverClass);
                }
            }
        });
    }
    var widgetsDroppable = $.ui.droppable;
    /*!
     * jQuery UI Progressbar 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var widgetsProgressbar = $.widget("ui.progressbar", {
        version: "1.12.1",
        options: {
            classes: {
                "ui-progressbar": "ui-corner-all",
                "ui-progressbar-value": "ui-corner-left",
                "ui-progressbar-complete": "ui-corner-right"
            },
            max: 100,
            value: 0,
            change: null,
            complete: null
        },
        min: 0,
        _create: function() {
            this.oldValue = this.options.value = this._constrainedValue();
            this.element.attr({
                role: "progressbar",
                "aria-valuemin": this.min
            });
            this._addClass("ui-progressbar", "ui-widget ui-widget-content");
            this.valueDiv = $("<div>").appendTo(this.element);
            this._addClass(this.valueDiv, "ui-progressbar-value", "ui-widget-header");
            this._refreshValue();
        },
        _destroy: function() {
            this.element.removeAttr("role aria-valuemin aria-valuemax aria-valuenow");
            this.valueDiv.remove();
        },
        value: function(newValue) {
            if (newValue === undefined) {
                return this.options.value;
            }
            this.options.value = this._constrainedValue(newValue);
            this._refreshValue();
        },
        _constrainedValue: function(newValue) {
            if (newValue === undefined) {
                newValue = this.options.value;
            }
            this.indeterminate = newValue === false;
            if (typeof newValue !== "number") {
                newValue = 0;
            }
            return this.indeterminate ? false : Math.min(this.options.max, Math.max(this.min, newValue));
        },
        _setOptions: function(options) {
            var value = options.value;
            delete options.value;
            this._super(options);
            this.options.value = this._constrainedValue(value);
            this._refreshValue();
        },
        _setOption: function(key, value) {
            if (key === "max") {
                value = Math.max(this.min, value);
            }
            this._super(key, value);
        },
        _setOptionDisabled: function(value) {
            this._super(value);
            this.element.attr("aria-disabled", value);
            this._toggleClass(null, "ui-state-disabled", !!value);
        },
        _percentage: function() {
            return this.indeterminate ? 100 : 100 * (this.options.value - this.min) / (this.options.max - this.min);
        },
        _refreshValue: function() {
            var value = this.options.value,
                percentage = this._percentage();
            this.valueDiv.toggle(this.indeterminate || value > this.min).width(percentage.toFixed(0) + "%");
            this._toggleClass(this.valueDiv, "ui-progressbar-complete", null, value === this.options.max)._toggleClass("ui-progressbar-indeterminate", null, this.indeterminate);
            if (this.indeterminate) {
                this.element.removeAttr("aria-valuenow");
                if (!this.overlayDiv) {
                    this.overlayDiv = $("<div>").appendTo(this.valueDiv);
                    this._addClass(this.overlayDiv, "ui-progressbar-overlay");
                }
            } else {
                this.element.attr({
                    "aria-valuemax": this.options.max,
                    "aria-valuenow": value
                });
                if (this.overlayDiv) {
                    this.overlayDiv.remove();
                    this.overlayDiv = null;
                }
            }
            if (this.oldValue !== value) {
                this.oldValue = value;
                this._trigger("change");
            }
            if (value === this.options.max) {
                this._trigger("complete");
            }
        }
    });
    /*!
     * jQuery UI Selectable 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var widgetsSelectable = $.widget("ui.selectable", $.ui.mouse, {
        version: "1.12.1",
        options: {
            appendTo: "body",
            autoRefresh: true,
            distance: 0,
            filter: "*",
            tolerance: "touch",
            selected: null,
            selecting: null,
            start: null,
            stop: null,
            unselected: null,
            unselecting: null
        },
        _create: function() {
            var that = this;
            this._addClass("ui-selectable");
            this.dragged = false;
            this.refresh = function() {
                that.elementPos = $(that.element[0]).offset();
                that.selectees = $(that.options.filter, that.element[0]);
                that._addClass(that.selectees, "ui-selectee");
                that.selectees.each(function() {
                    var $this = $(this),
                        selecteeOffset = $this.offset(),
                        pos = {
                            left: selecteeOffset.left - that.elementPos.left,
                            top: selecteeOffset.top - that.elementPos.top
                        };
                    $.data(this, "selectable-item", {
                        element: this,
                        $element: $this,
                        left: pos.left,
                        top: pos.top,
                        right: pos.left + $this.outerWidth(),
                        bottom: pos.top + $this.outerHeight(),
                        startselected: false,
                        selected: $this.hasClass("ui-selected"),
                        selecting: $this.hasClass("ui-selecting"),
                        unselecting: $this.hasClass("ui-unselecting")
                    });
                });
            };
            this.refresh();
            this._mouseInit();
            this.helper = $("<div>");
            this._addClass(this.helper, "ui-selectable-helper");
        },
        _destroy: function() {
            this.selectees.removeData("selectable-item");
            this._mouseDestroy();
        },
        _mouseStart: function(event) {
            var that = this,
                options = this.options;
            this.opos = [event.pageX, event.pageY];
            this.elementPos = $(this.element[0]).offset();
            if (this.options.disabled) {
                return;
            }
            this.selectees = $(options.filter, this.element[0]);
            this._trigger("start", event);
            $(options.appendTo).append(this.helper);
            this.helper.css({
                "left": event.pageX,
                "top": event.pageY,
                "width": 0,
                "height": 0
            });
            if (options.autoRefresh) {
                this.refresh();
            }
            this.selectees.filter(".ui-selected").each(function() {
                var selectee = $.data(this, "selectable-item");
                selectee.startselected = true;
                if (!event.metaKey && !event.ctrlKey) {
                    that._removeClass(selectee.$element, "ui-selected");
                    selectee.selected = false;
                    that._addClass(selectee.$element, "ui-unselecting");
                    selectee.unselecting = true;
                    that._trigger("unselecting", event, {
                        unselecting: selectee.element
                    });
                }
            });
            $(event.target).parents().addBack().each(function() {
                var doSelect, selectee = $.data(this, "selectable-item");
                if (selectee) {
                    doSelect = (!event.metaKey && !event.ctrlKey) || !selectee.$element.hasClass("ui-selected");
                    that._removeClass(selectee.$element, doSelect ? "ui-unselecting" : "ui-selected")._addClass(selectee.$element, doSelect ? "ui-selecting" : "ui-unselecting");
                    selectee.unselecting = !doSelect;
                    selectee.selecting = doSelect;
                    selectee.selected = doSelect;
                    if (doSelect) {
                        that._trigger("selecting", event, {
                            selecting: selectee.element
                        });
                    } else {
                        that._trigger("unselecting", event, {
                            unselecting: selectee.element
                        });
                    }
                    return false;
                }
            });
        },
        _mouseDrag: function(event) {
            this.dragged = true;
            if (this.options.disabled) {
                return;
            }
            var tmp, that = this,
                options = this.options,
                x1 = this.opos[0],
                y1 = this.opos[1],
                x2 = event.pageX,
                y2 = event.pageY;
            if (x1 > x2) {
                tmp = x2;
                x2 = x1;
                x1 = tmp;
            }
            if (y1 > y2) {
                tmp = y2;
                y2 = y1;
                y1 = tmp;
            }
            this.helper.css({
                left: x1,
                top: y1,
                width: x2 - x1,
                height: y2 - y1
            });
            this.selectees.each(function() {
                var selectee = $.data(this, "selectable-item"),
                    hit = false,
                    offset = {};
                if (!selectee || selectee.element === that.element[0]) {
                    return;
                }
                offset.left = selectee.left + that.elementPos.left;
                offset.right = selectee.right + that.elementPos.left;
                offset.top = selectee.top + that.elementPos.top;
                offset.bottom = selectee.bottom + that.elementPos.top;
                if (options.tolerance === "touch") {
                    hit = (!(offset.left > x2 || offset.right < x1 || offset.top > y2 || offset.bottom < y1));
                } else if (options.tolerance === "fit") {
                    hit = (offset.left > x1 && offset.right < x2 && offset.top > y1 && offset.bottom < y2);
                }
                if (hit) {
                    if (selectee.selected) {
                        that._removeClass(selectee.$element, "ui-selected");
                        selectee.selected = false;
                    }
                    if (selectee.unselecting) {
                        that._removeClass(selectee.$element, "ui-unselecting");
                        selectee.unselecting = false;
                    }
                    if (!selectee.selecting) {
                        that._addClass(selectee.$element, "ui-selecting");
                        selectee.selecting = true;
                        that._trigger("selecting", event, {
                            selecting: selectee.element
                        });
                    }
                } else {
                    if (selectee.selecting) {
                        if ((event.metaKey || event.ctrlKey) && selectee.startselected) {
                            that._removeClass(selectee.$element, "ui-selecting");
                            selectee.selecting = false;
                            that._addClass(selectee.$element, "ui-selected");
                            selectee.selected = true;
                        } else {
                            that._removeClass(selectee.$element, "ui-selecting");
                            selectee.selecting = false;
                            if (selectee.startselected) {
                                that._addClass(selectee.$element, "ui-unselecting");
                                selectee.unselecting = true;
                            }
                            that._trigger("unselecting", event, {
                                unselecting: selectee.element
                            });
                        }
                    }
                    if (selectee.selected) {
                        if (!event.metaKey && !event.ctrlKey && !selectee.startselected) {
                            that._removeClass(selectee.$element, "ui-selected");
                            selectee.selected = false;
                            that._addClass(selectee.$element, "ui-unselecting");
                            selectee.unselecting = true;
                            that._trigger("unselecting", event, {
                                unselecting: selectee.element
                            });
                        }
                    }
                }
            });
            return false;
        },
        _mouseStop: function(event) {
            var that = this;
            this.dragged = false;
            $(".ui-unselecting", this.element[0]).each(function() {
                var selectee = $.data(this, "selectable-item");
                that._removeClass(selectee.$element, "ui-unselecting");
                selectee.unselecting = false;
                selectee.startselected = false;
                that._trigger("unselected", event, {
                    unselected: selectee.element
                });
            });
            $(".ui-selecting", this.element[0]).each(function() {
                var selectee = $.data(this, "selectable-item");
                that._removeClass(selectee.$element, "ui-selecting")._addClass(selectee.$element, "ui-selected");
                selectee.selecting = false;
                selectee.selected = true;
                selectee.startselected = true;
                that._trigger("selected", event, {
                    selected: selectee.element
                });
            });
            this._trigger("stop", event);
            this.helper.remove();
            return false;
        }
    });
    /*!
     * jQuery UI Selectmenu 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var widgetsSelectmenu = $.widget("ui.selectmenu", [$.ui.formResetMixin, {
        version: "1.12.1",
        defaultElement: "<select>",
        options: {
            appendTo: null,
            classes: {
                "ui-selectmenu-button-open": "ui-corner-top",
                "ui-selectmenu-button-closed": "ui-corner-all"
            },
            disabled: null,
            icons: {
                button: "ui-icon-triangle-1-s"
            },
            position: {
                my: "left top",
                at: "left bottom",
                collision: "none"
            },
            width: false,
            change: null,
            close: null,
            focus: null,
            open: null,
            select: null
        },
        _create: function() {
            var selectmenuId = this.element.uniqueId().attr("id");
            this.ids = {
                element: selectmenuId,
                button: selectmenuId + "-button",
                menu: selectmenuId + "-menu"
            };
            this._drawButton();
            this._drawMenu();
            this._bindFormResetHandler();
            this._rendered = false;
            this.menuItems = $();
        },
        _drawButton: function() {
            var icon, that = this,
                item = this._parseOption(this.element.find("option:selected"), this.element[0].selectedIndex);
            this.labels = this.element.labels().attr("for", this.ids.button);
            this._on(this.labels, {
                click: function(event) {
                    this.button.focus();
                    event.preventDefault();
                }
            });
            this.element.hide();
            this.button = $("<span>", {
                tabindex: this.options.disabled ? -1 : 0,
                id: this.ids.button,
                role: "combobox",
                "aria-expanded": "false",
                "aria-autocomplete": "list",
                "aria-owns": this.ids.menu,
                "aria-haspopup": "true",
                title: this.element.attr("title")
            }).insertAfter(this.element);
            this._addClass(this.button, "ui-selectmenu-button ui-selectmenu-button-closed", "ui-button ui-widget");
            icon = $("<span>").appendTo(this.button);
            this._addClass(icon, "ui-selectmenu-icon", "ui-icon " + this.options.icons.button);
            this.buttonItem = this._renderButtonItem(item).appendTo(this.button);
            if (this.options.width !== false) {
                this._resizeButton();
            }
            this._on(this.button, this._buttonEvents);
            this.button.one("focusin", function() {
                if (!that._rendered) {
                    that._refreshMenu();
                }
            });
        },
        _drawMenu: function() {
            var that = this;
            this.menu = $("<ul>", {
                "aria-hidden": "true",
                "aria-labelledby": this.ids.button,
                id: this.ids.menu
            });
            this.menuWrap = $("<div>").append(this.menu);
            this._addClass(this.menuWrap, "ui-selectmenu-menu", "ui-front");
            this.menuWrap.appendTo(this._appendTo());
            this.menuInstance = this.menu.menu({
                classes: {
                    "ui-menu": "ui-corner-bottom"
                },
                role: "listbox",
                select: function(event, ui) {
                    event.preventDefault();
                    that._setSelection();
                    that._select(ui.item.data("ui-selectmenu-item"), event);
                },
                focus: function(event, ui) {
                    var item = ui.item.data("ui-selectmenu-item");
                    if (that.focusIndex != null && item.index !== that.focusIndex) {
                        that._trigger("focus", event, {
                            item: item
                        });
                        if (!that.isOpen) {
                            that._select(item, event);
                        }
                    }
                    that.focusIndex = item.index;
                    that.button.attr("aria-activedescendant", that.menuItems.eq(item.index).attr("id"));
                }
            }).menu("instance");
            this.menuInstance._off(this.menu, "mouseleave");
            this.menuInstance._closeOnDocumentClick = function() {
                return false;
            };
            this.menuInstance._isDivider = function() {
                return false;
            };
        },
        refresh: function() {
            this._refreshMenu();
            this.buttonItem.replaceWith(this.buttonItem = this._renderButtonItem(this._getSelectedItem().data("ui-selectmenu-item") || {}));
            if (this.options.width === null) {
                this._resizeButton();
            }
        },
        _refreshMenu: function() {
            var item, options = this.element.find("option");
            this.menu.empty();
            this._parseOptions(options);
            this._renderMenu(this.menu, this.items);
            this.menuInstance.refresh();
            this.menuItems = this.menu.find("li").not(".ui-selectmenu-optgroup").find(".ui-menu-item-wrapper");
            this._rendered = true;
            if (!options.length) {
                return;
            }
            item = this._getSelectedItem();
            this.menuInstance.focus(null, item);
            this._setAria(item.data("ui-selectmenu-item"));
            this._setOption("disabled", this.element.prop("disabled"));
        },
        open: function(event) {
            if (this.options.disabled) {
                return;
            }
            if (!this._rendered) {
                this._refreshMenu();
            } else {
                this._removeClass(this.menu.find(".ui-state-active"), null, "ui-state-active");
                this.menuInstance.focus(null, this._getSelectedItem());
            }
            if (!this.menuItems.length) {
                return;
            }
            this.isOpen = true;
            this._toggleAttr();
            this._resizeMenu();
            this._position();
            this._on(this.document, this._documentClick);
            this._trigger("open", event);
        },
        _position: function() {
            this.menuWrap.position($.extend({ of: this.button
            }, this.options.position));
        },
        close: function(event) {
            if (!this.isOpen) {
                return;
            }
            this.isOpen = false;
            this._toggleAttr();
            this.range = null;
            this._off(this.document);
            this._trigger("close", event);
        },
        widget: function() {
            return this.button;
        },
        menuWidget: function() {
            return this.menu;
        },
        _renderButtonItem: function(item) {
            var buttonItem = $("<span>");
            this._setText(buttonItem, item.label);
            this._addClass(buttonItem, "ui-selectmenu-text");
            return buttonItem;
        },
        _renderMenu: function(ul, items) {
            var that = this,
                currentOptgroup = "";
            $.each(items, function(index, item) {
                var li;
                if (item.optgroup !== currentOptgroup) {
                    li = $("<li>", {
                        text: item.optgroup
                    });
                    that._addClass(li, "ui-selectmenu-optgroup", "ui-menu-divider" +
                        (item.element.parent("optgroup").prop("disabled") ? " ui-state-disabled" : ""));
                    li.appendTo(ul);
                    currentOptgroup = item.optgroup;
                }
                that._renderItemData(ul, item);
            });
        },
        _renderItemData: function(ul, item) {
            return this._renderItem(ul, item).data("ui-selectmenu-item", item);
        },
        _renderItem: function(ul, item) {
            var li = $("<li>"),
                wrapper = $("<div>", {
                    title: item.element.attr("title")
                });
            if (item.disabled) {
                this._addClass(li, null, "ui-state-disabled");
            }
            this._setText(wrapper, item.label);
            return li.append(wrapper).appendTo(ul);
        },
        _setText: function(element, value) {
            if (value) {
                element.text(value);
            } else {
                element.html("&#160;");
            }
        },
        _move: function(direction, event) {
            var item, next, filter = ".ui-menu-item";
            if (this.isOpen) {
                item = this.menuItems.eq(this.focusIndex).parent("li");
            } else {
                item = this.menuItems.eq(this.element[0].selectedIndex).parent("li");
                filter += ":not(.ui-state-disabled)";
            }
            if (direction === "first" || direction === "last") {
                next = item[direction === "first" ? "prevAll" : "nextAll"](filter).eq(-1);
            } else {
                next = item[direction + "All"](filter).eq(0);
            }
            if (next.length) {
                this.menuInstance.focus(event, next);
            }
        },
        _getSelectedItem: function() {
            return this.menuItems.eq(this.element[0].selectedIndex).parent("li");
        },
        _toggle: function(event) {
            this[this.isOpen ? "close" : "open"](event);
        },
        _setSelection: function() {
            var selection;
            if (!this.range) {
                return;
            }
            if (window.getSelection) {
                selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(this.range);
            } else {
                this.range.select();
            }
            this.button.focus();
        },
        _documentClick: {
            mousedown: function(event) {
                if (!this.isOpen) {
                    return;
                }
                if (!$(event.target).closest(".ui-selectmenu-menu, #" +
                        $.ui.escapeSelector(this.ids.button)).length) {
                    this.close(event);
                }
            }
        },
        _buttonEvents: {
            mousedown: function() {
                var selection;
                if (window.getSelection) {
                    selection = window.getSelection();
                    if (selection.rangeCount) {
                        this.range = selection.getRangeAt(0);
                    }
                } else {
                    this.range = document.selection.createRange();
                }
            },
            click: function(event) {
                this._setSelection();
                this._toggle(event);
            },
            keydown: function(event) {
                var preventDefault = true;
                switch (event.keyCode) {
                    case $.ui.keyCode.TAB:
                    case $.ui.keyCode.ESCAPE:
                        this.close(event);
                        preventDefault = false;
                        break;
                    case $.ui.keyCode.ENTER:
                        if (this.isOpen) {
                            this._selectFocusedItem(event);
                        }
                        break;
                    case $.ui.keyCode.UP:
                        if (event.altKey) {
                            this._toggle(event);
                        } else {
                            this._move("prev", event);
                        }
                        break;
                    case $.ui.keyCode.DOWN:
                        if (event.altKey) {
                            this._toggle(event);
                        } else {
                            this._move("next", event);
                        }
                        break;
                    case $.ui.keyCode.SPACE:
                        if (this.isOpen) {
                            this._selectFocusedItem(event);
                        } else {
                            this._toggle(event);
                        }
                        break;
                    case $.ui.keyCode.LEFT:
                        this._move("prev", event);
                        break;
                    case $.ui.keyCode.RIGHT:
                        this._move("next", event);
                        break;
                    case $.ui.keyCode.HOME:
                    case $.ui.keyCode.PAGE_UP:
                        this._move("first", event);
                        break;
                    case $.ui.keyCode.END:
                    case $.ui.keyCode.PAGE_DOWN:
                        this._move("last", event);
                        break;
                    default:
                        this.menu.trigger(event);
                        preventDefault = false;
                }
                if (preventDefault) {
                    event.preventDefault();
                }
            }
        },
        _selectFocusedItem: function(event) {
            var item = this.menuItems.eq(this.focusIndex).parent("li");
            if (!item.hasClass("ui-state-disabled")) {
                this._select(item.data("ui-selectmenu-item"), event);
            }
        },
        _select: function(item, event) {
            var oldIndex = this.element[0].selectedIndex;
            this.element[0].selectedIndex = item.index;
            this.buttonItem.replaceWith(this.buttonItem = this._renderButtonItem(item));
            this._setAria(item);
            this._trigger("select", event, {
                item: item
            });
            if (item.index !== oldIndex) {
                this._trigger("change", event, {
                    item: item
                });
            }
            this.close(event);
        },
        _setAria: function(item) {
            var id = this.menuItems.eq(item.index).attr("id");
            this.button.attr({
                "aria-labelledby": id,
                "aria-activedescendant": id
            });
            this.menu.attr("aria-activedescendant", id);
        },
        _setOption: function(key, value) {
            if (key === "icons") {
                var icon = this.button.find("span.ui-icon");
                this._removeClass(icon, null, this.options.icons.button)._addClass(icon, null, value.button);
            }
            this._super(key, value);
            if (key === "appendTo") {
                this.menuWrap.appendTo(this._appendTo());
            }
            if (key === "width") {
                this._resizeButton();
            }
        },
        _setOptionDisabled: function(value) {
            this._super(value);
            this.menuInstance.option("disabled", value);
            this.button.attr("aria-disabled", value);
            this._toggleClass(this.button, null, "ui-state-disabled", value);
            this.element.prop("disabled", value);
            if (value) {
                this.button.attr("tabindex", -1);
                this.close();
            } else {
                this.button.attr("tabindex", 0);
            }
        },
        _appendTo: function() {
            var element = this.options.appendTo;
            if (element) {
                element = element.jquery || element.nodeType ? $(element) : this.document.find(element).eq(0);
            }
            if (!element || !element[0]) {
                element = this.element.closest(".ui-front, dialog");
            }
            if (!element.length) {
                element = this.document[0].body;
            }
            return element;
        },
        _toggleAttr: function() {
            this.button.attr("aria-expanded", this.isOpen);
            this._removeClass(this.button, "ui-selectmenu-button-" +
                (this.isOpen ? "closed" : "open"))._addClass(this.button, "ui-selectmenu-button-" +
                (this.isOpen ? "open" : "closed"))._toggleClass(this.menuWrap, "ui-selectmenu-open", null, this.isOpen);
            this.menu.attr("aria-hidden", !this.isOpen);
        },
        _resizeButton: function() {
            var width = this.options.width;
            if (width === false) {
                this.button.css("width", "");
                return;
            }
            if (width === null) {
                width = this.element.show().outerWidth();
                this.element.hide();
            }
            this.button.outerWidth(width);
        },
        _resizeMenu: function() {
            this.menu.outerWidth(Math.max(this.button.outerWidth(), this.menu.width("").outerWidth() + 1));
        },
        _getCreateOptions: function() {
            var options = this._super();
            options.disabled = this.element.prop("disabled");
            return options;
        },
        _parseOptions: function(options) {
            var that = this,
                data = [];
            options.each(function(index, item) {
                data.push(that._parseOption($(item), index));
            });
            this.items = data;
        },
        _parseOption: function(option, index) {
            var optgroup = option.parent("optgroup");
            return {
                element: option,
                index: index,
                value: option.val(),
                label: option.text(),
                optgroup: optgroup.attr("label") || "",
                disabled: optgroup.prop("disabled") || option.prop("disabled")
            };
        },
        _destroy: function() {
            this._unbindFormResetHandler();
            this.menuWrap.remove();
            this.button.remove();
            this.element.show();
            this.element.removeUniqueId();
            this.labels.attr("for", this.ids.element);
        }
    }]);
    /*!
     * jQuery UI Slider 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var widgetsSlider = $.widget("ui.slider", $.ui.mouse, {
        version: "1.12.1",
        widgetEventPrefix: "slide",
        options: {
            animate: false,
            classes: {
                "ui-slider": "ui-corner-all",
                "ui-slider-handle": "ui-corner-all",
                "ui-slider-range": "ui-corner-all ui-widget-header"
            },
            distance: 0,
            max: 100,
            min: 0,
            orientation: "horizontal",
            range: false,
            step: 1,
            value: 0,
            values: null,
            change: null,
            slide: null,
            start: null,
            stop: null
        },
        numPages: 5,
        _create: function() {
            this._keySliding = false;
            this._mouseSliding = false;
            this._animateOff = true;
            this._handleIndex = null;
            this._detectOrientation();
            this._mouseInit();
            this._calculateNewMax();
            this._addClass("ui-slider ui-slider-" + this.orientation, "ui-widget ui-widget-content");
            this._refresh();
            this._animateOff = false;
        },
        _refresh: function() {
            this._createRange();
            this._createHandles();
            this._setupEvents();
            this._refreshValue();
        },
        _createHandles: function() {
            var i, handleCount, options = this.options,
                existingHandles = this.element.find(".ui-slider-handle"),
                handle = "<span tabindex='0'></span>",
                handles = [];
            handleCount = (options.values && options.values.length) || 1;
            if (existingHandles.length > handleCount) {
                existingHandles.slice(handleCount).remove();
                existingHandles = existingHandles.slice(0, handleCount);
            }
            for (i = existingHandles.length; i < handleCount; i++) {
                handles.push(handle);
            }
            this.handles = existingHandles.add($(handles.join("")).appendTo(this.element));
            this._addClass(this.handles, "ui-slider-handle", "ui-state-default");
            this.handle = this.handles.eq(0);
            this.handles.each(function(i) {
                $(this).data("ui-slider-handle-index", i).attr("tabIndex", 0);
            });
        },
        _createRange: function() {
            var options = this.options;
            if (options.range) {
                if (options.range === true) {
                    if (!options.values) {
                        options.values = [this._valueMin(), this._valueMin()];
                    } else if (options.values.length && options.values.length !== 2) {
                        options.values = [options.values[0], options.values[0]];
                    } else if ($.isArray(options.values)) {
                        options.values = options.values.slice(0);
                    }
                }
                if (!this.range || !this.range.length) {
                    this.range = $("<div>").appendTo(this.element);
                    this._addClass(this.range, "ui-slider-range");
                } else {
                    this._removeClass(this.range, "ui-slider-range-min ui-slider-range-max");
                    this.range.css({
                        "left": "",
                        "bottom": ""
                    });
                }
                if (options.range === "min" || options.range === "max") {
                    this._addClass(this.range, "ui-slider-range-" + options.range);
                }
            } else {
                if (this.range) {
                    this.range.remove();
                }
                this.range = null;
            }
        },
        _setupEvents: function() {
            this._off(this.handles);
            this._on(this.handles, this._handleEvents);
            this._hoverable(this.handles);
            this._focusable(this.handles);
        },
        _destroy: function() {
            this.handles.remove();
            if (this.range) {
                this.range.remove();
            }
            this._mouseDestroy();
        },
        _mouseCapture: function(event) {
            var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle, that = this,
                o = this.options;
            if (o.disabled) {
                return false;
            }
            this.elementSize = {
                width: this.element.outerWidth(),
                height: this.element.outerHeight()
            };
            this.elementOffset = this.element.offset();
            position = {
                x: event.pageX,
                y: event.pageY
            };
            normValue = this._normValueFromMouse(position);
            distance = this._valueMax() - this._valueMin() + 1;
            this.handles.each(function(i) {
                var thisDistance = Math.abs(normValue - that.values(i));
                if ((distance > thisDistance) || (distance === thisDistance && (i === that._lastChangedValue || that.values(i) === o.min))) {
                    distance = thisDistance;
                    closestHandle = $(this);
                    index = i;
                }
            });
            allowed = this._start(event, index);
            if (allowed === false) {
                return false;
            }
            this._mouseSliding = true;
            this._handleIndex = index;
            this._addClass(closestHandle, null, "ui-state-active");
            closestHandle.trigger("focus");
            offset = closestHandle.offset();
            mouseOverHandle = !$(event.target).parents().addBack().is(".ui-slider-handle");
            this._clickOffset = mouseOverHandle ? {
                left: 0,
                top: 0
            } : {
                left: event.pageX - offset.left - (closestHandle.width() / 2),
                top: event.pageY - offset.top -
                    (closestHandle.height() / 2) -
                    (parseInt(closestHandle.css("borderTopWidth"), 10) || 0) -
                    (parseInt(closestHandle.css("borderBottomWidth"), 10) || 0) +
                    (parseInt(closestHandle.css("marginTop"), 10) || 0)
            };
            if (!this.handles.hasClass("ui-state-hover")) {
                this._slide(event, index, normValue);
            }
            this._animateOff = true;
            return true;
        },
        _mouseStart: function() {
            return true;
        },
        _mouseDrag: function(event) {
            var position = {
                    x: event.pageX,
                    y: event.pageY
                },
                normValue = this._normValueFromMouse(position);
            this._slide(event, this._handleIndex, normValue);
            return false;
        },
        _mouseStop: function(event) {
            this._removeClass(this.handles, null, "ui-state-active");
            this._mouseSliding = false;
            this._stop(event, this._handleIndex);
            this._change(event, this._handleIndex);
            this._handleIndex = null;
            this._clickOffset = null;
            this._animateOff = false;
            return false;
        },
        _detectOrientation: function() {
            this.orientation = (this.options.orientation === "vertical") ? "vertical" : "horizontal";
        },
        _normValueFromMouse: function(position) {
            var pixelTotal, pixelMouse, percentMouse, valueTotal, valueMouse;
            if (this.orientation === "horizontal") {
                pixelTotal = this.elementSize.width;
                pixelMouse = position.x - this.elementOffset.left -
                    (this._clickOffset ? this._clickOffset.left : 0);
            } else {
                pixelTotal = this.elementSize.height;
                pixelMouse = position.y - this.elementOffset.top -
                    (this._clickOffset ? this._clickOffset.top : 0);
            }
            percentMouse = (pixelMouse / pixelTotal);
            if (percentMouse > 1) {
                percentMouse = 1;
            }
            if (percentMouse < 0) {
                percentMouse = 0;
            }
            if (this.orientation === "vertical") {
                percentMouse = 1 - percentMouse;
            }
            valueTotal = this._valueMax() - this._valueMin();
            valueMouse = this._valueMin() + percentMouse * valueTotal;
            return this._trimAlignValue(valueMouse);
        },
        _uiHash: function(index, value, values) {
            var uiHash = {
                handle: this.handles[index],
                handleIndex: index,
                value: value !== undefined ? value : this.value()
            };
            if (this._hasMultipleValues()) {
                uiHash.value = value !== undefined ? value : this.values(index);
                uiHash.values = values || this.values();
            }
            return uiHash;
        },
        _hasMultipleValues: function() {
            return this.options.values && this.options.values.length;
        },
        _start: function(event, index) {
            return this._trigger("start", event, this._uiHash(index));
        },
        _slide: function(event, index, newVal) {
            var allowed, otherVal, currentValue = this.value(),
                newValues = this.values();
            if (this._hasMultipleValues()) {
                otherVal = this.values(index ? 0 : 1);
                currentValue = this.values(index);
                if (this.options.values.length === 2 && this.options.range === true) {
                    newVal = index === 0 ? Math.min(otherVal, newVal) : Math.max(otherVal, newVal);
                }
                newValues[index] = newVal;
            }
            if (newVal === currentValue) {
                return;
            }
            allowed = this._trigger("slide", event, this._uiHash(index, newVal, newValues));
            if (allowed === false) {
                return;
            }
            if (this._hasMultipleValues()) {
                this.values(index, newVal);
            } else {
                this.value(newVal);
            }
        },
        _stop: function(event, index) {
            this._trigger("stop", event, this._uiHash(index));
        },
        _change: function(event, index) {
            if (!this._keySliding && !this._mouseSliding) {
                this._lastChangedValue = index;
                this._trigger("change", event, this._uiHash(index));
            }
        },
        value: function(newValue) {
            if (arguments.length) {
                this.options.value = this._trimAlignValue(newValue);
                this._refreshValue();
                this._change(null, 0);
                return;
            }
            return this._value();
        },
        values: function(index, newValue) {
            var vals, newValues, i;
            if (arguments.length > 1) {
                this.options.values[index] = this._trimAlignValue(newValue);
                this._refreshValue();
                this._change(null, index);
                return;
            }
            if (arguments.length) {
                if ($.isArray(arguments[0])) {
                    vals = this.options.values;
                    newValues = arguments[0];
                    for (i = 0; i < vals.length; i += 1) {
                        vals[i] = this._trimAlignValue(newValues[i]);
                        this._change(null, i);
                    }
                    this._refreshValue();
                } else {
                    if (this._hasMultipleValues()) {
                        return this._values(index);
                    } else {
                        return this.value();
                    }
                }
            } else {
                return this._values();
            }
        },
        _setOption: function(key, value) {
            var i, valsLength = 0;
            if (key === "range" && this.options.range === true) {
                if (value === "min") {
                    this.options.value = this._values(0);
                    this.options.values = null;
                } else if (value === "max") {
                    this.options.value = this._values(this.options.values.length - 1);
                    this.options.values = null;
                }
            }
            if ($.isArray(this.options.values)) {
                valsLength = this.options.values.length;
            }
            this._super(key, value);
            switch (key) {
                case "orientation":
                    this._detectOrientation();
                    this._removeClass("ui-slider-horizontal ui-slider-vertical")._addClass("ui-slider-" + this.orientation);
                    this._refreshValue();
                    if (this.options.range) {
                        this._refreshRange(value);
                    }
                    this.handles.css(value === "horizontal" ? "bottom" : "left", "");
                    break;
                case "value":
                    this._animateOff = true;
                    this._refreshValue();
                    this._change(null, 0);
                    this._animateOff = false;
                    break;
                case "values":
                    this._animateOff = true;
                    this._refreshValue();
                    for (i = valsLength - 1; i >= 0; i--) {
                        this._change(null, i);
                    }
                    this._animateOff = false;
                    break;
                case "step":
                case "min":
                case "max":
                    this._animateOff = true;
                    this._calculateNewMax();
                    this._refreshValue();
                    this._animateOff = false;
                    break;
                case "range":
                    this._animateOff = true;
                    this._refresh();
                    this._animateOff = false;
                    break;
            }
        },
        _setOptionDisabled: function(value) {
            this._super(value);
            this._toggleClass(null, "ui-state-disabled", !!value);
        },
        _value: function() {
            var val = this.options.value;
            val = this._trimAlignValue(val);
            return val;
        },
        _values: function(index) {
            var val, vals, i;
            if (arguments.length) {
                val = this.options.values[index];
                val = this._trimAlignValue(val);
                return val;
            } else if (this._hasMultipleValues()) {
                vals = this.options.values.slice();
                for (i = 0; i < vals.length; i += 1) {
                    vals[i] = this._trimAlignValue(vals[i]);
                }
                return vals;
            } else {
                return [];
            }
        },
        _trimAlignValue: function(val) {
            if (val <= this._valueMin()) {
                return this._valueMin();
            }
            if (val >= this._valueMax()) {
                return this._valueMax();
            }
            var step = (this.options.step > 0) ? this.options.step : 1,
                valModStep = (val - this._valueMin()) % step,
                alignValue = val - valModStep;
            if (Math.abs(valModStep) * 2 >= step) {
                alignValue += (valModStep > 0) ? step : (-step);
            }
            return parseFloat(alignValue.toFixed(5));
        },
        _calculateNewMax: function() {
            var max = this.options.max,
                min = this._valueMin(),
                step = this.options.step,
                aboveMin = Math.round((max - min) / step) * step;
            max = aboveMin + min;
            if (max > this.options.max) {
                max -= step;
            }
            this.max = parseFloat(max.toFixed(this._precision()));
        },
        _precision: function() {
            var precision = this._precisionOf(this.options.step);
            if (this.options.min !== null) {
                precision = Math.max(precision, this._precisionOf(this.options.min));
            }
            return precision;
        },
        _precisionOf: function(num) {
            var str = num.toString(),
                decimal = str.indexOf(".");
            return decimal === -1 ? 0 : str.length - decimal - 1;
        },
        _valueMin: function() {
            return this.options.min;
        },
        _valueMax: function() {
            return this.max;
        },
        _refreshRange: function(orientation) {
            if (orientation === "vertical") {
                this.range.css({
                    "width": "",
                    "left": ""
                });
            }
            if (orientation === "horizontal") {
                this.range.css({
                    "height": "",
                    "bottom": ""
                });
            }
        },
        _refreshValue: function() {
            var lastValPercent, valPercent, value, valueMin, valueMax, oRange = this.options.range,
                o = this.options,
                that = this,
                animate = (!this._animateOff) ? o.animate : false,
                _set = {};
            if (this._hasMultipleValues()) {
                this.handles.each(function(i) {
                    valPercent = (that.values(i) - that._valueMin()) / (that._valueMax() -
                        that._valueMin()) * 100;
                    _set[that.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
                    $(this).stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);
                    if (that.options.range === true) {
                        if (that.orientation === "horizontal") {
                            if (i === 0) {
                                that.range.stop(1, 1)[animate ? "animate" : "css"]({
                                    left: valPercent + "%"
                                }, o.animate);
                            }
                            if (i === 1) {
                                that.range[animate ? "animate" : "css"]({
                                    width: (valPercent - lastValPercent) + "%"
                                }, {
                                    queue: false,
                                    duration: o.animate
                                });
                            }
                        } else {
                            if (i === 0) {
                                that.range.stop(1, 1)[animate ? "animate" : "css"]({
                                    bottom: (valPercent) + "%"
                                }, o.animate);
                            }
                            if (i === 1) {
                                that.range[animate ? "animate" : "css"]({
                                    height: (valPercent - lastValPercent) + "%"
                                }, {
                                    queue: false,
                                    duration: o.animate
                                });
                            }
                        }
                    }
                    lastValPercent = valPercent;
                });
            } else {
                value = this.value();
                valueMin = this._valueMin();
                valueMax = this._valueMax();
                valPercent = (valueMax !== valueMin) ? (value - valueMin) / (valueMax - valueMin) * 100 : 0;
                _set[this.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
                this.handle.stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);
                if (oRange === "min" && this.orientation === "horizontal") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({
                        width: valPercent + "%"
                    }, o.animate);
                }
                if (oRange === "max" && this.orientation === "horizontal") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({
                        width: (100 - valPercent) + "%"
                    }, o.animate);
                }
                if (oRange === "min" && this.orientation === "vertical") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({
                        height: valPercent + "%"
                    }, o.animate);
                }
                if (oRange === "max" && this.orientation === "vertical") {
                    this.range.stop(1, 1)[animate ? "animate" : "css"]({
                        height: (100 - valPercent) + "%"
                    }, o.animate);
                }
            }
        },
        _handleEvents: {
            keydown: function(event) {
                var allowed, curVal, newVal, step, index = $(event.target).data("ui-slider-handle-index");
                switch (event.keyCode) {
                    case $.ui.keyCode.HOME:
                    case $.ui.keyCode.END:
                    case $.ui.keyCode.PAGE_UP:
                    case $.ui.keyCode.PAGE_DOWN:
                    case $.ui.keyCode.UP:
                    case $.ui.keyCode.RIGHT:
                    case $.ui.keyCode.DOWN:
                    case $.ui.keyCode.LEFT:
                        event.preventDefault();
                        if (!this._keySliding) {
                            this._keySliding = true;
                            this._addClass($(event.target), null, "ui-state-active");
                            allowed = this._start(event, index);
                            if (allowed === false) {
                                return;
                            }
                        }
                        break;
                }
                step = this.options.step;
                if (this._hasMultipleValues()) {
                    curVal = newVal = this.values(index);
                } else {
                    curVal = newVal = this.value();
                }
                switch (event.keyCode) {
                    case $.ui.keyCode.HOME:
                        newVal = this._valueMin();
                        break;
                    case $.ui.keyCode.END:
                        newVal = this._valueMax();
                        break;
                    case $.ui.keyCode.PAGE_UP:
                        newVal = this._trimAlignValue(curVal + ((this._valueMax() - this._valueMin()) / this.numPages));
                        break;
                    case $.ui.keyCode.PAGE_DOWN:
                        newVal = this._trimAlignValue(curVal - ((this._valueMax() - this._valueMin()) / this.numPages));
                        break;
                    case $.ui.keyCode.UP:
                    case $.ui.keyCode.RIGHT:
                        if (curVal === this._valueMax()) {
                            return;
                        }
                        newVal = this._trimAlignValue(curVal + step);
                        break;
                    case $.ui.keyCode.DOWN:
                    case $.ui.keyCode.LEFT:
                        if (curVal === this._valueMin()) {
                            return;
                        }
                        newVal = this._trimAlignValue(curVal - step);
                        break;
                }
                this._slide(event, index, newVal);
            },
            keyup: function(event) {
                var index = $(event.target).data("ui-slider-handle-index");
                if (this._keySliding) {
                    this._keySliding = false;
                    this._stop(event, index);
                    this._change(event, index);
                    this._removeClass($(event.target), null, "ui-state-active");
                }
            }
        }
    });
    /*!
     * jQuery UI Sortable 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    var widgetsSortable = $.widget("ui.sortable", $.ui.mouse, {
        version: "1.12.1",
        widgetEventPrefix: "sort",
        ready: false,
        options: {
            appendTo: "parent",
            axis: false,
            connectWith: false,
            containment: false,
            cursor: "auto",
            cursorAt: false,
            dropOnEmpty: true,
            forcePlaceholderSize: false,
            forceHelperSize: false,
            grid: false,
            handle: false,
            helper: "original",
            items: "> *",
            opacity: false,
            placeholder: false,
            revert: false,
            scroll: true,
            scrollSensitivity: 20,
            scrollSpeed: 20,
            scope: "default",
            tolerance: "intersect",
            zIndex: 1000,
            activate: null,
            beforeStop: null,
            change: null,
            deactivate: null,
            out: null,
            over: null,
            receive: null,
            remove: null,
            sort: null,
            start: null,
            stop: null,
            update: null
        },
        _isOverAxis: function(x, reference, size) {
            return (x >= reference) && (x < (reference + size));
        },
        _isFloating: function(item) {
            return (/left|right/).test(item.css("float")) || (/inline|table-cell/).test(item.css("display"));
        },
        _create: function() {
            this.containerCache = {};
            this._addClass("ui-sortable");
            this.refresh();
            this.offset = this.element.offset();
            this._mouseInit();
            this._setHandleClassName();
            this.ready = true;
        },
        _setOption: function(key, value) {
            this._super(key, value);
            if (key === "handle") {
                this._setHandleClassName();
            }
        },
        _setHandleClassName: function() {
            var that = this;
            this._removeClass(this.element.find(".ui-sortable-handle"), "ui-sortable-handle");
            $.each(this.items, function() {
                that._addClass(this.instance.options.handle ? this.item.find(this.instance.options.handle) : this.item, "ui-sortable-handle");
            });
        },
        _destroy: function() {
            this._mouseDestroy();
            for (var i = this.items.length - 1; i >= 0; i--) {
                this.items[i].item.removeData(this.widgetName + "-item");
            }
            return this;
        },
        _mouseCapture: function(event, overrideHandle) {
            var currentItem = null,
                validHandle = false,
                that = this;
            if (this.reverting) {
                return false;
            }
            if (this.options.disabled || this.options.type === "static") {
                return false;
            }
            this._refreshItems(event);
            $(event.target).parents().each(function() {
                if ($.data(this, that.widgetName + "-item") === that) {
                    currentItem = $(this);
                    return false;
                }
            });
            if ($.data(event.target, that.widgetName + "-item") === that) {
                currentItem = $(event.target);
            }
            if (!currentItem) {
                return false;
            }
            if (this.options.handle && !overrideHandle) {
                $(this.options.handle, currentItem).find("*").addBack().each(function() {
                    if (this === event.target) {
                        validHandle = true;
                    }
                });
                if (!validHandle) {
                    return false;
                }
            }
            this.currentItem = currentItem;
            this._removeCurrentsFromItems();
            return true;
        },
        _mouseStart: function(event, overrideHandle, noActivation) {
            var i, body, o = this.options;
            this.currentContainer = this;
            this.refreshPositions();
            this.helper = this._createHelper(event);
            this._cacheHelperProportions();
            this._cacheMargins();
            this.scrollParent = this.helper.scrollParent();
            this.offset = this.currentItem.offset();
            this.offset = {
                top: this.offset.top - this.margins.top,
                left: this.offset.left - this.margins.left
            };
            $.extend(this.offset, {
                click: {
                    left: event.pageX - this.offset.left,
                    top: event.pageY - this.offset.top
                },
                parent: this._getParentOffset(),
                relative: this._getRelativeOffset()
            });
            this.helper.css("position", "absolute");
            this.cssPosition = this.helper.css("position");
            this.originalPosition = this._generatePosition(event);
            this.originalPageX = event.pageX;
            this.originalPageY = event.pageY;
            (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));
            this.domPosition = {
                prev: this.currentItem.prev()[0],
                parent: this.currentItem.parent()[0]
            };
            if (this.helper[0] !== this.currentItem[0]) {
                this.currentItem.hide();
            }
            this._createPlaceholder();
            if (o.containment) {
                this._setContainment();
            }
            if (o.cursor && o.cursor !== "auto") {
                body = this.document.find("body");
                this.storedCursor = body.css("cursor");
                body.css("cursor", o.cursor);
                this.storedStylesheet = $("<style>*{ cursor: " + o.cursor + " !important; }</style>").appendTo(body);
            }
            if (o.opacity) {
                if (this.helper.css("opacity")) {
                    this._storedOpacity = this.helper.css("opacity");
                }
                this.helper.css("opacity", o.opacity);
            }
            if (o.zIndex) {
                if (this.helper.css("zIndex")) {
                    this._storedZIndex = this.helper.css("zIndex");
                }
                this.helper.css("zIndex", o.zIndex);
            }
            if (this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {
                this.overflowOffset = this.scrollParent.offset();
            }
            this._trigger("start", event, this._uiHash());
            if (!this._preserveHelperProportions) {
                this._cacheHelperProportions();
            }
            if (!noActivation) {
                for (i = this.containers.length - 1; i >= 0; i--) {
                    this.containers[i]._trigger("activate", event, this._uiHash(this));
                }
            }
            if ($.ui.ddmanager) {
                $.ui.ddmanager.current = this;
            }
            if ($.ui.ddmanager && !o.dropBehaviour) {
                $.ui.ddmanager.prepareOffsets(this, event);
            }
            this.dragging = true;
            this._addClass(this.helper, "ui-sortable-helper");
            this._mouseDrag(event);
            return true;
        },
        _mouseDrag: function(event) {
            var i, item, itemElement, intersection, o = this.options,
                scrolled = false;
            this.position = this._generatePosition(event);
            this.positionAbs = this._convertPositionTo("absolute");
            if (!this.lastPositionAbs) {
                this.lastPositionAbs = this.positionAbs;
            }
            if (this.options.scroll) {
                if (this.scrollParent[0] !== this.document[0] && this.scrollParent[0].tagName !== "HTML") {
                    if ((this.overflowOffset.top + this.scrollParent[0].offsetHeight) -
                        event.pageY < o.scrollSensitivity) {
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
                    } else if (event.pageY - this.overflowOffset.top < o.scrollSensitivity) {
                        this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;
                    }
                    if ((this.overflowOffset.left + this.scrollParent[0].offsetWidth) -
                        event.pageX < o.scrollSensitivity) {
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
                    } else if (event.pageX - this.overflowOffset.left < o.scrollSensitivity) {
                        this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;
                    }
                } else {
                    if (event.pageY - this.document.scrollTop() < o.scrollSensitivity) {
                        scrolled = this.document.scrollTop(this.document.scrollTop() - o.scrollSpeed);
                    } else if (this.window.height() - (event.pageY - this.document.scrollTop()) < o.scrollSensitivity) {
                        scrolled = this.document.scrollTop(this.document.scrollTop() + o.scrollSpeed);
                    }
                    if (event.pageX - this.document.scrollLeft() < o.scrollSensitivity) {
                        scrolled = this.document.scrollLeft(this.document.scrollLeft() - o.scrollSpeed);
                    } else if (this.window.width() - (event.pageX - this.document.scrollLeft()) < o.scrollSensitivity) {
                        scrolled = this.document.scrollLeft(this.document.scrollLeft() + o.scrollSpeed);
                    }
                }
                if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
                    $.ui.ddmanager.prepareOffsets(this, event);
                }
            }
            this.positionAbs = this._convertPositionTo("absolute");
            if (!this.options.axis || this.options.axis !== "y") {
                this.helper[0].style.left = this.position.left + "px";
            }
            if (!this.options.axis || this.options.axis !== "x") {
                this.helper[0].style.top = this.position.top + "px";
            }
            for (i = this.items.length - 1; i >= 0; i--) {
                item = this.items[i];
                itemElement = item.item[0];
                intersection = this._intersectsWithPointer(item);
                if (!intersection) {
                    continue;
                }
                if (item.instance !== this.currentContainer) {
                    continue;
                }
                if (itemElement !== this.currentItem[0] && this.placeholder[intersection === 1 ? "next" : "prev"]()[0] !== itemElement && !$.contains(this.placeholder[0], itemElement) && (this.options.type === "semi-dynamic" ? !$.contains(this.element[0], itemElement) : true)) {
                    this.direction = intersection === 1 ? "down" : "up";
                    if (this.options.tolerance === "pointer" || this._intersectsWithSides(item)) {
                        this._rearrange(event, item);
                    } else {
                        break;
                    }
                    this._trigger("change", event, this._uiHash());
                    break;
                }
            }
            this._contactContainers(event);
            if ($.ui.ddmanager) {
                $.ui.ddmanager.drag(this, event);
            }
            this._trigger("sort", event, this._uiHash());
            this.lastPositionAbs = this.positionAbs;
            return false;
        },
        _mouseStop: function(event, noPropagation) {
            if (!event) {
                return;
            }
            if ($.ui.ddmanager && !this.options.dropBehaviour) {
                $.ui.ddmanager.drop(this, event);
            }
            if (this.options.revert) {
                var that = this,
                    cur = this.placeholder.offset(),
                    axis = this.options.axis,
                    animation = {};
                if (!axis || axis === "x") {
                    animation.left = cur.left - this.offset.parent.left - this.margins.left +
                        (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollLeft);
                }
                if (!axis || axis === "y") {
                    animation.top = cur.top - this.offset.parent.top - this.margins.top +
                        (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollTop);
                }
                this.reverting = true;
                $(this.helper).animate(animation, parseInt(this.options.revert, 10) || 500, function() {
                    that._clear(event);
                });
            } else {
                this._clear(event, noPropagation);
            }
            return false;
        },
        cancel: function() {
            if (this.dragging) {
                this._mouseUp(new $.Event("mouseup", {
                    target: null
                }));
                if (this.options.helper === "original") {
                    this.currentItem.css(this._storedCSS);
                    this._removeClass(this.currentItem, "ui-sortable-helper");
                } else {
                    this.currentItem.show();
                }
                for (var i = this.containers.length - 1; i >= 0; i--) {
                    this.containers[i]._trigger("deactivate", null, this._uiHash(this));
                    if (this.containers[i].containerCache.over) {
                        this.containers[i]._trigger("out", null, this._uiHash(this));
                        this.containers[i].containerCache.over = 0;
                    }
                }
            }
            if (this.placeholder) {
                if (this.placeholder[0].parentNode) {
                    this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
                }
                if (this.options.helper !== "original" && this.helper && this.helper[0].parentNode) {
                    this.helper.remove();
                }
                $.extend(this, {
                    helper: null,
                    dragging: false,
                    reverting: false,
                    _noFinalSort: null
                });
                if (this.domPosition.prev) {
                    $(this.domPosition.prev).after(this.currentItem);
                } else {
                    $(this.domPosition.parent).prepend(this.currentItem);
                }
            }
            return this;
        },
        serialize: function(o) {
            var items = this._getItemsAsjQuery(o && o.connected),
                str = [];
            o = o || {};
            $(items).each(function() {
                var res = ($(o.item || this).attr(o.attribute || "id") || "").match(o.expression || (/(.+)[\-=_](.+)/));
                if (res) {
                    str.push((o.key || res[1] + "[]") + "=" + (o.key && o.expression ? res[1] : res[2]));
                }
            });
            if (!str.length && o.key) {
                str.push(o.key + "=");
            }
            return str.join("&");
        },
        toArray: function(o) {
            var items = this._getItemsAsjQuery(o && o.connected),
                ret = [];
            o = o || {};
            items.each(function() {
                ret.push($(o.item || this).attr(o.attribute || "id") || "");
            });
            return ret;
        },
        _intersectsWith: function(item) {
            var x1 = this.positionAbs.left,
                x2 = x1 + this.helperProportions.width,
                y1 = this.positionAbs.top,
                y2 = y1 + this.helperProportions.height,
                l = item.left,
                r = l + item.width,
                t = item.top,
                b = t + item.height,
                dyClick = this.offset.click.top,
                dxClick = this.offset.click.left,
                isOverElementHeight = (this.options.axis === "x") || ((y1 + dyClick) > t && (y1 + dyClick) < b),
                isOverElementWidth = (this.options.axis === "y") || ((x1 + dxClick) > l && (x1 + dxClick) < r),
                isOverElement = isOverElementHeight && isOverElementWidth;
            if (this.options.tolerance === "pointer" || this.options.forcePointerForContainers || (this.options.tolerance !== "pointer" && this.helperProportions[this.floating ? "width" : "height"] > item[this.floating ? "width" : "height"])) {
                return isOverElement;
            } else {
                return (l < x1 + (this.helperProportions.width / 2) && x2 - (this.helperProportions.width / 2) < r && t < y1 + (this.helperProportions.height / 2) && y2 - (this.helperProportions.height / 2) < b);
            }
        },
        _intersectsWithPointer: function(item) {
            var verticalDirection, horizontalDirection, isOverElementHeight = (this.options.axis === "x") || this._isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
                isOverElementWidth = (this.options.axis === "y") || this._isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
                isOverElement = isOverElementHeight && isOverElementWidth;
            if (!isOverElement) {
                return false;
            }
            verticalDirection = this._getDragVerticalDirection();
            horizontalDirection = this._getDragHorizontalDirection();
            return this.floating ? ((horizontalDirection === "right" || verticalDirection === "down") ? 2 : 1) : (verticalDirection && (verticalDirection === "down" ? 2 : 1));
        },
        _intersectsWithSides: function(item) {
            var isOverBottomHalf = this._isOverAxis(this.positionAbs.top +
                    this.offset.click.top, item.top + (item.height / 2), item.height),
                isOverRightHalf = this._isOverAxis(this.positionAbs.left +
                    this.offset.click.left, item.left + (item.width / 2), item.width),
                verticalDirection = this._getDragVerticalDirection(),
                horizontalDirection = this._getDragHorizontalDirection();
            if (this.floating && horizontalDirection) {
                return ((horizontalDirection === "right" && isOverRightHalf) || (horizontalDirection === "left" && !isOverRightHalf));
            } else {
                return verticalDirection && ((verticalDirection === "down" && isOverBottomHalf) || (verticalDirection === "up" && !isOverBottomHalf));
            }
        },
        _getDragVerticalDirection: function() {
            var delta = this.positionAbs.top - this.lastPositionAbs.top;
            return delta !== 0 && (delta > 0 ? "down" : "up");
        },
        _getDragHorizontalDirection: function() {
            var delta = this.positionAbs.left - this.lastPositionAbs.left;
            return delta !== 0 && (delta > 0 ? "right" : "left");
        },
        refresh: function(event) {
            this._refreshItems(event);
            this._setHandleClassName();
            this.refreshPositions();
            return this;
        },
        _connectWith: function() {
            var options = this.options;
            return options.connectWith.constructor === String ? [options.connectWith] : options.connectWith;
        },
        _getItemsAsjQuery: function(connected) {
            var i, j, cur, inst, items = [],
                queries = [],
                connectWith = this._connectWith();
            if (connectWith && connected) {
                for (i = connectWith.length - 1; i >= 0; i--) {
                    cur = $(connectWith[i], this.document[0]);
                    for (j = cur.length - 1; j >= 0; j--) {
                        inst = $.data(cur[j], this.widgetFullName);
                        if (inst && inst !== this && !inst.options.disabled) {
                            queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), inst]);
                        }
                    }
                }
            }
            queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, {
                options: this.options,
                item: this.currentItem
            }) : $(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]);

            function addItems() {
                items.push(this);
            }
            for (i = queries.length - 1; i >= 0; i--) {
                queries[i][0].each(addItems);
            }
            return $(items);
        },
        _removeCurrentsFromItems: function() {
            var list = this.currentItem.find(":data(" + this.widgetName + "-item)");
            this.items = $.grep(this.items, function(item) {
                for (var j = 0; j < list.length; j++) {
                    if (list[j] === item.item[0]) {
                        return false;
                    }
                }
                return true;
            });
        },
        _refreshItems: function(event) {
            this.items = [];
            this.containers = [this];
            var i, j, cur, inst, targetData, _queries, item, queriesLength, items = this.items,
                queries = [
                    [$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, {
                        item: this.currentItem
                    }) : $(this.options.items, this.element), this]
                ],
                connectWith = this._connectWith();
            if (connectWith && this.ready) {
                for (i = connectWith.length - 1; i >= 0; i--) {
                    cur = $(connectWith[i], this.document[0]);
                    for (j = cur.length - 1; j >= 0; j--) {
                        inst = $.data(cur[j], this.widgetFullName);
                        if (inst && inst !== this && !inst.options.disabled) {
                            queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, {
                                item: this.currentItem
                            }) : $(inst.options.items, inst.element), inst]);
                            this.containers.push(inst);
                        }
                    }
                }
            }
            for (i = queries.length - 1; i >= 0; i--) {
                targetData = queries[i][1];
                _queries = queries[i][0];
                for (j = 0, queriesLength = _queries.length; j < queriesLength; j++) {
                    item = $(_queries[j]);
                    item.data(this.widgetName + "-item", targetData);
                    items.push({
                        item: item,
                        instance: targetData,
                        width: 0,
                        height: 0,
                        left: 0,
                        top: 0
                    });
                }
            }
        },
        refreshPositions: function(fast) {
            this.floating = this.items.length ? this.options.axis === "x" || this._isFloating(this.items[0].item) : false;
            if (this.offsetParent && this.helper) {
                this.offset.parent = this._getParentOffset();
            }
            var i, item, t, p;
            for (i = this.items.length - 1; i >= 0; i--) {
                item = this.items[i];
                if (item.instance !== this.currentContainer && this.currentContainer && item.item[0] !== this.currentItem[0]) {
                    continue;
                }
                t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;
                if (!fast) {
                    item.width = t.outerWidth();
                    item.height = t.outerHeight();
                }
                p = t.offset();
                item.left = p.left;
                item.top = p.top;
            }
            if (this.options.custom && this.options.custom.refreshContainers) {
                this.options.custom.refreshContainers.call(this);
            } else {
                for (i = this.containers.length - 1; i >= 0; i--) {
                    p = this.containers[i].element.offset();
                    this.containers[i].containerCache.left = p.left;
                    this.containers[i].containerCache.top = p.top;
                    this.containers[i].containerCache.width = this.containers[i].element.outerWidth();
                    this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
                }
            }
            return this;
        },
        _createPlaceholder: function(that) {
            that = that || this;
            var className, o = that.options;
            if (!o.placeholder || o.placeholder.constructor === String) {
                className = o.placeholder;
                o.placeholder = {
                    element: function() {
                        var nodeName = that.currentItem[0].nodeName.toLowerCase(),
                            element = $("<" + nodeName + ">", that.document[0]);
                        that._addClass(element, "ui-sortable-placeholder", className || that.currentItem[0].className)._removeClass(element, "ui-sortable-helper");
                        if (nodeName === "tbody") {
                            that._createTrPlaceholder(that.currentItem.find("tr").eq(0), $("<tr>", that.document[0]).appendTo(element));
                        } else if (nodeName === "tr") {
                            that._createTrPlaceholder(that.currentItem, element);
                        } else if (nodeName === "img") {
                            element.attr("src", that.currentItem.attr("src"));
                        }
                        if (!className) {
                            element.css("visibility", "hidden");
                        }
                        return element;
                    },
                    update: function(container, p) {
                        if (className && !o.forcePlaceholderSize) {
                            return;
                        }
                        if (!p.height()) {
                            p.height(that.currentItem.innerHeight() -
                                parseInt(that.currentItem.css("paddingTop") || 0, 10) -
                                parseInt(that.currentItem.css("paddingBottom") || 0, 10));
                        }
                        if (!p.width()) {
                            p.width(that.currentItem.innerWidth() -
                                parseInt(that.currentItem.css("paddingLeft") || 0, 10) -
                                parseInt(that.currentItem.css("paddingRight") || 0, 10));
                        }
                    }
                };
            }
            that.placeholder = $(o.placeholder.element.call(that.element, that.currentItem));
            that.currentItem.after(that.placeholder);
            o.placeholder.update(that, that.placeholder);
        },
        _createTrPlaceholder: function(sourceTr, targetTr) {
            var that = this;
            sourceTr.children().each(function() {
                $("<td>&#160;</td>", that.document[0]).attr("colspan", $(this).attr("colspan") || 1).appendTo(targetTr);
            });
        },
        _contactContainers: function(event) {
            var i, j, dist, itemWithLeastDistance, posProperty, sizeProperty, cur, nearBottom, floating, axis, innermostContainer = null,
                innermostIndex = null;
            for (i = this.containers.length - 1; i >= 0; i--) {
                if ($.contains(this.currentItem[0], this.containers[i].element[0])) {
                    continue;
                }
                if (this._intersectsWith(this.containers[i].containerCache)) {
                    if (innermostContainer && $.contains(this.containers[i].element[0], innermostContainer.element[0])) {
                        continue;
                    }
                    innermostContainer = this.containers[i];
                    innermostIndex = i;
                } else {
                    if (this.containers[i].containerCache.over) {
                        this.containers[i]._trigger("out", event, this._uiHash(this));
                        this.containers[i].containerCache.over = 0;
                    }
                }
            }
            if (!innermostContainer) {
                return;
            }
            if (this.containers.length === 1) {
                if (!this.containers[innermostIndex].containerCache.over) {
                    this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
                    this.containers[innermostIndex].containerCache.over = 1;
                }
            } else {
                dist = 10000;
                itemWithLeastDistance = null;
                floating = innermostContainer.floating || this._isFloating(this.currentItem);
                posProperty = floating ? "left" : "top";
                sizeProperty = floating ? "width" : "height";
                axis = floating ? "pageX" : "pageY";
                for (j = this.items.length - 1; j >= 0; j--) {
                    if (!$.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) {
                        continue;
                    }
                    if (this.items[j].item[0] === this.currentItem[0]) {
                        continue;
                    }
                    cur = this.items[j].item.offset()[posProperty];
                    nearBottom = false;
                    if (event[axis] - cur > this.items[j][sizeProperty] / 2) {
                        nearBottom = true;
                    }
                    if (Math.abs(event[axis] - cur) < dist) {
                        dist = Math.abs(event[axis] - cur);
                        itemWithLeastDistance = this.items[j];
                        this.direction = nearBottom ? "up" : "down";
                    }
                }
                if (!itemWithLeastDistance && !this.options.dropOnEmpty) {
                    return;
                }
                if (this.currentContainer === this.containers[innermostIndex]) {
                    if (!this.currentContainer.containerCache.over) {
                        this.containers[innermostIndex]._trigger("over", event, this._uiHash());
                        this.currentContainer.containerCache.over = 1;
                    }
                    return;
                }
                itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
                this._trigger("change", event, this._uiHash());
                this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));
                this.currentContainer = this.containers[innermostIndex];
                this.options.placeholder.update(this.currentContainer, this.placeholder);
                this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
                this.containers[innermostIndex].containerCache.over = 1;
            }
        },
        _createHelper: function(event) {
            var o = this.options,
                helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper === "clone" ? this.currentItem.clone() : this.currentItem);
            if (!helper.parents("body").length) {
                $(o.appendTo !== "parent" ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);
            }
            if (helper[0] === this.currentItem[0]) {
                this._storedCSS = {
                    width: this.currentItem[0].style.width,
                    height: this.currentItem[0].style.height,
                    position: this.currentItem.css("position"),
                    top: this.currentItem.css("top"),
                    left: this.currentItem.css("left")
                };
            }
            if (!helper[0].style.width || o.forceHelperSize) {
                helper.width(this.currentItem.width());
            }
            if (!helper[0].style.height || o.forceHelperSize) {
                helper.height(this.currentItem.height());
            }
            return helper;
        },
        _adjustOffsetFromHelper: function(obj) {
            if (typeof obj === "string") {
                obj = obj.split(" ");
            }
            if ($.isArray(obj)) {
                obj = {
                    left: +obj[0],
                    top: +obj[1] || 0
                };
            }
            if ("left" in obj) {
                this.offset.click.left = obj.left + this.margins.left;
            }
            if ("right" in obj) {
                this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
            }
            if ("top" in obj) {
                this.offset.click.top = obj.top + this.margins.top;
            }
            if ("bottom" in obj) {
                this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
            }
        },
        _getParentOffset: function() {
            this.offsetParent = this.helper.offsetParent();
            var po = this.offsetParent.offset();
            if (this.cssPosition === "absolute" && this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) {
                po.left += this.scrollParent.scrollLeft();
                po.top += this.scrollParent.scrollTop();
            }
            if (this.offsetParent[0] === this.document[0].body || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() === "html" && $.ui.ie)) {
                po = {
                    top: 0,
                    left: 0
                };
            }
            return {
                top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
                left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
            };
        },
        _getRelativeOffset: function() {
            if (this.cssPosition === "relative") {
                var p = this.currentItem.position();
                return {
                    top: p.top - (parseInt(this.helper.css("top"), 10) || 0) +
                        this.scrollParent.scrollTop(),
                    left: p.left - (parseInt(this.helper.css("left"), 10) || 0) +
                        this.scrollParent.scrollLeft()
                };
            } else {
                return {
                    top: 0,
                    left: 0
                };
            }
        },
        _cacheMargins: function() {
            this.margins = {
                left: (parseInt(this.currentItem.css("marginLeft"), 10) || 0),
                top: (parseInt(this.currentItem.css("marginTop"), 10) || 0)
            };
        },
        _cacheHelperProportions: function() {
            this.helperProportions = {
                width: this.helper.outerWidth(),
                height: this.helper.outerHeight()
            };
        },
        _setContainment: function() {
            var ce, co, over, o = this.options;
            if (o.containment === "parent") {
                o.containment = this.helper[0].parentNode;
            }
            if (o.containment === "document" || o.containment === "window") {
                this.containment = [0 - this.offset.relative.left - this.offset.parent.left, 0 - this.offset.relative.top - this.offset.parent.top, o.containment === "document" ? this.document.width() : this.window.width() - this.helperProportions.width - this.margins.left, (o.containment === "document" ? (this.document.height() || document.body.parentNode.scrollHeight) : this.window.height() || this.document[0].body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top];
            }
            if (!(/^(document|window|parent)$/).test(o.containment)) {
                ce = $(o.containment)[0];
                co = $(o.containment).offset();
                over = ($(ce).css("overflow") !== "hidden");
                this.containment = [co.left + (parseInt($(ce).css("borderLeftWidth"), 10) || 0) +
                    (parseInt($(ce).css("paddingLeft"), 10) || 0) - this.margins.left, co.top + (parseInt($(ce).css("borderTopWidth"), 10) || 0) +
                    (parseInt($(ce).css("paddingTop"), 10) || 0) - this.margins.top, co.left + (over ? Math.max(ce.scrollWidth, ce.offsetWidth) : ce.offsetWidth) -
                    (parseInt($(ce).css("borderLeftWidth"), 10) || 0) -
                    (parseInt($(ce).css("paddingRight"), 10) || 0) -
                    this.helperProportions.width - this.margins.left, co.top + (over ? Math.max(ce.scrollHeight, ce.offsetHeight) : ce.offsetHeight) -
                    (parseInt($(ce).css("borderTopWidth"), 10) || 0) -
                    (parseInt($(ce).css("paddingBottom"), 10) || 0) -
                    this.helperProportions.height - this.margins.top
                ];
            }
        },
        _convertPositionTo: function(d, pos) {
            if (!pos) {
                pos = this.position;
            }
            var mod = d === "absolute" ? 1 : -1,
                scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
            return {
                top: (pos.top +
                    this.offset.relative.top * mod +
                    this.offset.parent.top * mod -
                    ((this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())) * mod)),
                left: (pos.left +
                    this.offset.relative.left * mod +
                    this.offset.parent.left * mod -
                    ((this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft()) * mod))
            };
        },
        _generatePosition: function(event) {
            var top, left, o = this.options,
                pageX = event.pageX,
                pageY = event.pageY,
                scroll = this.cssPosition === "absolute" && !(this.scrollParent[0] !== this.document[0] && $.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent,
                scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
            if (this.cssPosition === "relative" && !(this.scrollParent[0] !== this.document[0] && this.scrollParent[0] !== this.offsetParent[0])) {
                this.offset.relative = this._getRelativeOffset();
            }
            if (this.originalPosition) {
                if (this.containment) {
                    if (event.pageX - this.offset.click.left < this.containment[0]) {
                        pageX = this.containment[0] + this.offset.click.left;
                    }
                    if (event.pageY - this.offset.click.top < this.containment[1]) {
                        pageY = this.containment[1] + this.offset.click.top;
                    }
                    if (event.pageX - this.offset.click.left > this.containment[2]) {
                        pageX = this.containment[2] + this.offset.click.left;
                    }
                    if (event.pageY - this.offset.click.top > this.containment[3]) {
                        pageY = this.containment[3] + this.offset.click.top;
                    }
                }
                if (o.grid) {
                    top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
                    pageY = this.containment ? ((top - this.offset.click.top >= this.containment[1] && top - this.offset.click.top <= this.containment[3]) ? top : ((top - this.offset.click.top >= this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;
                    left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
                    pageX = this.containment ? ((left - this.offset.click.left >= this.containment[0] && left - this.offset.click.left <= this.containment[2]) ? left : ((left - this.offset.click.left >= this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
                }
            }
            return {
                top: (pageY -
                    this.offset.click.top -
                    this.offset.relative.top -
                    this.offset.parent.top +
                    ((this.cssPosition === "fixed" ? -this.scrollParent.scrollTop() : (scrollIsRootNode ? 0 : scroll.scrollTop())))),
                left: (pageX -
                    this.offset.click.left -
                    this.offset.relative.left -
                    this.offset.parent.left +
                    ((this.cssPosition === "fixed" ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft())))
            };
        },
        _rearrange: function(event, i, a, hardRefresh) {
            a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction === "down" ? i.item[0] : i.item[0].nextSibling));
            this.counter = this.counter ? ++this.counter : 1;
            var counter = this.counter;
            this._delay(function() {
                if (counter === this.counter) {
                    this.refreshPositions(!hardRefresh);
                }
            });
        },
        _clear: function(event, noPropagation) {
            this.reverting = false;
            var i, delayedTriggers = [];
            if (!this._noFinalSort && this.currentItem.parent().length) {
                this.placeholder.before(this.currentItem);
            }
            this._noFinalSort = null;
            if (this.helper[0] === this.currentItem[0]) {
                for (i in this._storedCSS) {
                    if (this._storedCSS[i] === "auto" || this._storedCSS[i] === "static") {
                        this._storedCSS[i] = "";
                    }
                }
                this.currentItem.css(this._storedCSS);
                this._removeClass(this.currentItem, "ui-sortable-helper");
            } else {
                this.currentItem.show();
            }
            if (this.fromOutside && !noPropagation) {
                delayedTriggers.push(function(event) {
                    this._trigger("receive", event, this._uiHash(this.fromOutside));
                });
            }
            if ((this.fromOutside || this.domPosition.prev !== this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent !== this.currentItem.parent()[0]) && !noPropagation) {
                delayedTriggers.push(function(event) {
                    this._trigger("update", event, this._uiHash());
                });
            }
            if (this !== this.currentContainer) {
                if (!noPropagation) {
                    delayedTriggers.push(function(event) {
                        this._trigger("remove", event, this._uiHash());
                    });
                    delayedTriggers.push((function(c) {
                        return function(event) {
                            c._trigger("receive", event, this._uiHash(this));
                        };
                    }).call(this, this.currentContainer));
                    delayedTriggers.push((function(c) {
                        return function(event) {
                            c._trigger("update", event, this._uiHash(this));
                        };
                    }).call(this, this.currentContainer));
                }
            }

            function delayEvent(type, instance, container) {
                return function(event) {
                    container._trigger(type, event, instance._uiHash(instance));
                };
            }
            for (i = this.containers.length - 1; i >= 0; i--) {
                if (!noPropagation) {
                    delayedTriggers.push(delayEvent("deactivate", this, this.containers[i]));
                }
                if (this.containers[i].containerCache.over) {
                    delayedTriggers.push(delayEvent("out", this, this.containers[i]));
                    this.containers[i].containerCache.over = 0;
                }
            }
            if (this.storedCursor) {
                this.document.find("body").css("cursor", this.storedCursor);
                this.storedStylesheet.remove();
            }
            if (this._storedOpacity) {
                this.helper.css("opacity", this._storedOpacity);
            }
            if (this._storedZIndex) {
                this.helper.css("zIndex", this._storedZIndex === "auto" ? "" : this._storedZIndex);
            }
            this.dragging = false;
            if (!noPropagation) {
                this._trigger("beforeStop", event, this._uiHash());
            }
            this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
            if (!this.cancelHelperRemoval) {
                if (this.helper[0] !== this.currentItem[0]) {
                    this.helper.remove();
                }
                this.helper = null;
            }
            if (!noPropagation) {
                for (i = 0; i < delayedTriggers.length; i++) {
                    delayedTriggers[i].call(this, event);
                }
                this._trigger("stop", event, this._uiHash());
            }
            this.fromOutside = false;
            return !this.cancelHelperRemoval;
        },
        _trigger: function() {
            if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
                this.cancel();
            }
        },
        _uiHash: function(_inst) {
            var inst = _inst || this;
            return {
                helper: inst.helper,
                placeholder: inst.placeholder || $([]),
                position: inst.position,
                originalPosition: inst.originalPosition,
                offset: inst.positionAbs,
                item: inst.currentItem,
                sender: _inst ? _inst.element : null
            };
        }
    });
    /*!
     * jQuery UI Spinner 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    function spinnerModifer(fn) {
        return function() {
            var previous = this.element.val();
            fn.apply(this, arguments);
            this._refresh();
            if (previous !== this.element.val()) {
                this._trigger("change");
            }
        };
    }
    $.widget("ui.spinner", {
        version: "1.12.1",
        defaultElement: "<input>",
        widgetEventPrefix: "spin",
        options: {
            classes: {
                "ui-spinner": "ui-corner-all",
                "ui-spinner-down": "ui-corner-br",
                "ui-spinner-up": "ui-corner-tr"
            },
            culture: null,
            icons: {
                down: "ui-icon-triangle-1-s",
                up: "ui-icon-triangle-1-n"
            },
            incremental: true,
            max: null,
            min: null,
            numberFormat: null,
            page: 10,
            step: 1,
            change: null,
            spin: null,
            start: null,
            stop: null
        },
        _create: function() {
            this._setOption("max", this.options.max);
            this._setOption("min", this.options.min);
            this._setOption("step", this.options.step);
            if (this.value() !== "") {
                this._value(this.element.val(), true);
            }
            this._draw();
            this._on(this._events);
            this._refresh();
            this._on(this.window, {
                beforeunload: function() {
                    this.element.removeAttr("autocomplete");
                }
            });
        },
        _getCreateOptions: function() {
            var options = this._super();
            var element = this.element;
            $.each(["min", "max", "step"], function(i, option) {
                var value = element.attr(option);
                if (value != null && value.length) {
                    options[option] = value;
                }
            });
            return options;
        },
        _events: {
            keydown: function(event) {
                if (this._start(event) && this._keydown(event)) {
                    event.preventDefault();
                }
            },
            keyup: "_stop",
            focus: function() {
                this.previous = this.element.val();
            },
            blur: function(event) {
                if (this.cancelBlur) {
                    delete this.cancelBlur;
                    return;
                }
                this._stop();
                this._refresh();
                if (this.previous !== this.element.val()) {
                    this._trigger("change", event);
                }
            },
            mousewheel: function(event, delta) {
                if (!delta) {
                    return;
                }
                if (!this.spinning && !this._start(event)) {
                    return false;
                }
                this._spin((delta > 0 ? 1 : -1) * this.options.step, event);
                clearTimeout(this.mousewheelTimer);
                this.mousewheelTimer = this._delay(function() {
                    if (this.spinning) {
                        this._stop(event);
                    }
                }, 100);
                event.preventDefault();
            },
            "mousedown .ui-spinner-button": function(event) {
                var previous;
                previous = this.element[0] === $.ui.safeActiveElement(this.document[0]) ? this.previous : this.element.val();

                function checkFocus() {
                    var isActive = this.element[0] === $.ui.safeActiveElement(this.document[0]);
                    if (!isActive) {
                        this.element.trigger("focus");
                        this.previous = previous;
                        this._delay(function() {
                            this.previous = previous;
                        });
                    }
                }
                event.preventDefault();
                checkFocus.call(this);
                this.cancelBlur = true;
                this._delay(function() {
                    delete this.cancelBlur;
                    checkFocus.call(this);
                });
                if (this._start(event) === false) {
                    return;
                }
                this._repeat(null, $(event.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, event);
            },
            "mouseup .ui-spinner-button": "_stop",
            "mouseenter .ui-spinner-button": function(event) {
                if (!$(event.currentTarget).hasClass("ui-state-active")) {
                    return;
                }
                if (this._start(event) === false) {
                    return false;
                }
                this._repeat(null, $(event.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, event);
            },
            "mouseleave .ui-spinner-button": "_stop"
        },
        _enhance: function() {
            this.uiSpinner = this.element.attr("autocomplete", "off").wrap("<span>").parent().append("<a></a><a></a>");
        },
        _draw: function() {
            this._enhance();
            this._addClass(this.uiSpinner, "ui-spinner", "ui-widget ui-widget-content");
            this._addClass("ui-spinner-input");
            this.element.attr("role", "spinbutton");
            this.buttons = this.uiSpinner.children("a").attr("tabIndex", -1).attr("aria-hidden", true).button({
                classes: {
                    "ui-button": ""
                }
            });
            this._removeClass(this.buttons, "ui-corner-all");
            this._addClass(this.buttons.first(), "ui-spinner-button ui-spinner-up");
            this._addClass(this.buttons.last(), "ui-spinner-button ui-spinner-down");
            this.buttons.first().button({
                "icon": this.options.icons.up,
                "showLabel": false
            });
            this.buttons.last().button({
                "icon": this.options.icons.down,
                "showLabel": false
            });
            if (this.buttons.height() > Math.ceil(this.uiSpinner.height() * 0.5) && this.uiSpinner.height() > 0) {
                this.uiSpinner.height(this.uiSpinner.height());
            }
        },
        _keydown: function(event) {
            var options = this.options,
                keyCode = $.ui.keyCode;
            switch (event.keyCode) {
                case keyCode.UP:
                    this._repeat(null, 1, event);
                    return true;
                case keyCode.DOWN:
                    this._repeat(null, -1, event);
                    return true;
                case keyCode.PAGE_UP:
                    this._repeat(null, options.page, event);
                    return true;
                case keyCode.PAGE_DOWN:
                    this._repeat(null, -options.page, event);
                    return true;
            }
            return false;
        },
        _start: function(event) {
            if (!this.spinning && this._trigger("start", event) === false) {
                return false;
            }
            if (!this.counter) {
                this.counter = 1;
            }
            this.spinning = true;
            return true;
        },
        _repeat: function(i, steps, event) {
            i = i || 500;
            clearTimeout(this.timer);
            this.timer = this._delay(function() {
                this._repeat(40, steps, event);
            }, i);
            this._spin(steps * this.options.step, event);
        },
        _spin: function(step, event) {
            var value = this.value() || 0;
            if (!this.counter) {
                this.counter = 1;
            }
            value = this._adjustValue(value + step * this._increment(this.counter));
            if (!this.spinning || this._trigger("spin", event, {
                    value: value
                }) !== false) {
                this._value(value);
                this.counter++;
            }
        },
        _increment: function(i) {
            var incremental = this.options.incremental;
            if (incremental) {
                return $.isFunction(incremental) ? incremental(i) : Math.floor(i * i * i / 50000 - i * i / 500 + 17 * i / 200 + 1);
            }
            return 1;
        },
        _precision: function() {
            var precision = this._precisionOf(this.options.step);
            if (this.options.min !== null) {
                precision = Math.max(precision, this._precisionOf(this.options.min));
            }
            return precision;
        },
        _precisionOf: function(num) {
            var str = num.toString(),
                decimal = str.indexOf(".");
            return decimal === -1 ? 0 : str.length - decimal - 1;
        },
        _adjustValue: function(value) {
            var base, aboveMin, options = this.options;
            base = options.min !== null ? options.min : 0;
            aboveMin = value - base;
            aboveMin = Math.round(aboveMin / options.step) * options.step;
            value = base + aboveMin;
            value = parseFloat(value.toFixed(this._precision()));
            if (options.max !== null && value > options.max) {
                return options.max;
            }
            if (options.min !== null && value < options.min) {
                return options.min;
            }
            return value;
        },
        _stop: function(event) {
            if (!this.spinning) {
                return;
            }
            clearTimeout(this.timer);
            clearTimeout(this.mousewheelTimer);
            this.counter = 0;
            this.spinning = false;
            this._trigger("stop", event);
        },
        _setOption: function(key, value) {
            var prevValue, first, last;
            if (key === "culture" || key === "numberFormat") {
                prevValue = this._parse(this.element.val());
                this.options[key] = value;
                this.element.val(this._format(prevValue));
                return;
            }
            if (key === "max" || key === "min" || key === "step") {
                if (typeof value === "string") {
                    value = this._parse(value);
                }
            }
            if (key === "icons") {
                first = this.buttons.first().find(".ui-icon");
                this._removeClass(first, null, this.options.icons.up);
                this._addClass(first, null, value.up);
                last = this.buttons.last().find(".ui-icon");
                this._removeClass(last, null, this.options.icons.down);
                this._addClass(last, null, value.down);
            }
            this._super(key, value);
        },
        _setOptionDisabled: function(value) {
            this._super(value);
            this._toggleClass(this.uiSpinner, null, "ui-state-disabled", !!value);
            this.element.prop("disabled", !!value);
            this.buttons.button(value ? "disable" : "enable");
        },
        _setOptions: spinnerModifer(function(options) {
            this._super(options);
        }),
        _parse: function(val) {
            if (typeof val === "string" && val !== "") {
                val = window.Globalize && this.options.numberFormat ? Globalize.parseFloat(val, 10, this.options.culture) : +val;
            }
            return val === "" || isNaN(val) ? null : val;
        },
        _format: function(value) {
            if (value === "") {
                return "";
            }
            return window.Globalize && this.options.numberFormat ? Globalize.format(value, this.options.numberFormat, this.options.culture) : value;
        },
        _refresh: function() {
            this.element.attr({
                "aria-valuemin": this.options.min,
                "aria-valuemax": this.options.max,
                "aria-valuenow": this._parse(this.element.val())
            });
        },
        isValid: function() {
            var value = this.value();
            if (value === null) {
                return false;
            }
            return value === this._adjustValue(value);
        },
        _value: function(value, allowAny) {
            var parsed;
            if (value !== "") {
                parsed = this._parse(value);
                if (parsed !== null) {
                    if (!allowAny) {
                        parsed = this._adjustValue(parsed);
                    }
                    value = this._format(parsed);
                }
            }
            this.element.val(value);
            this._refresh();
        },
        _destroy: function() {
            this.element.prop("disabled", false).removeAttr("autocomplete role aria-valuemin aria-valuemax aria-valuenow");
            this.uiSpinner.replaceWith(this.element);
        },
        stepUp: spinnerModifer(function(steps) {
            this._stepUp(steps);
        }),
        _stepUp: function(steps) {
            if (this._start()) {
                this._spin((steps || 1) * this.options.step);
                this._stop();
            }
        },
        stepDown: spinnerModifer(function(steps) {
            this._stepDown(steps);
        }),
        _stepDown: function(steps) {
            if (this._start()) {
                this._spin((steps || 1) * -this.options.step);
                this._stop();
            }
        },
        pageUp: spinnerModifer(function(pages) {
            this._stepUp((pages || 1) * this.options.page);
        }),
        pageDown: spinnerModifer(function(pages) {
            this._stepDown((pages || 1) * this.options.page);
        }),
        value: function(newVal) {
            if (!arguments.length) {
                return this._parse(this.element.val());
            }
            spinnerModifer(this._value).call(this, newVal);
        },
        widget: function() {
            return this.uiSpinner;
        }
    });
    if ($.uiBackCompat !== false) {
        $.widget("ui.spinner", $.ui.spinner, {
            _enhance: function() {
                this.uiSpinner = this.element.attr("autocomplete", "off").wrap(this._uiSpinnerHtml()).parent().append(this._buttonHtml());
            },
            _uiSpinnerHtml: function() {
                return "<span>";
            },
            _buttonHtml: function() {
                return "<a></a><a></a>";
            }
        });
    }
    var widgetsSpinner = $.ui.spinner;
    /*!
     * jQuery UI Tabs 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.widget("ui.tabs", {
        version: "1.12.1",
        delay: 300,
        options: {
            active: null,
            classes: {
                "ui-tabs": "ui-corner-all",
                "ui-tabs-nav": "ui-corner-all",
                "ui-tabs-panel": "ui-corner-bottom",
                "ui-tabs-tab": "ui-corner-top"
            },
            collapsible: false,
            event: "click",
            heightStyle: "content",
            hide: null,
            show: null,
            activate: null,
            beforeActivate: null,
            beforeLoad: null,
            load: null
        },
        _isLocal: (function() {
            var rhash = /#.*$/;
            return function(anchor) {
                var anchorUrl, locationUrl;
                anchorUrl = anchor.href.replace(rhash, "");
                locationUrl = location.href.replace(rhash, "");
                try {
                    anchorUrl = decodeURIComponent(anchorUrl);
                } catch (error) {}
                try {
                    locationUrl = decodeURIComponent(locationUrl);
                } catch (error) {}
                return anchor.hash.length > 1 && anchorUrl === locationUrl;
            };
        })(),
        _create: function() {
            var that = this,
                options = this.options;
            this.running = false;
            this._addClass("ui-tabs", "ui-widget ui-widget-content");
            this._toggleClass("ui-tabs-collapsible", null, options.collapsible);
            this._processTabs();
            options.active = this._initialActive();
            if ($.isArray(options.disabled)) {
                options.disabled = $.unique(options.disabled.concat($.map(this.tabs.filter(".ui-state-disabled"), function(li) {
                    return that.tabs.index(li);
                }))).sort();
            }
            if (this.options.active !== false && this.anchors.length) {
                this.active = this._findActive(options.active);
            } else {
                this.active = $();
            }
            this._refresh();
            if (this.active.length) {
                this.load(options.active);
            }
        },
        _initialActive: function() {
            var active = this.options.active,
                collapsible = this.options.collapsible,
                locationHash = location.hash.substring(1);
            if (active === null) {
                if (locationHash) {
                    this.tabs.each(function(i, tab) {
                        if ($(tab).attr("aria-controls") === locationHash) {
                            active = i;
                            return false;
                        }
                    });
                }
                if (active === null) {
                    active = this.tabs.index(this.tabs.filter(".ui-tabs-active"));
                }
                if (active === null || active === -1) {
                    active = this.tabs.length ? 0 : false;
                }
            }
            if (active !== false) {
                active = this.tabs.index(this.tabs.eq(active));
                if (active === -1) {
                    active = collapsible ? false : 0;
                }
            }
            if (!collapsible && active === false && this.anchors.length) {
                active = 0;
            }
            return active;
        },
        _getCreateEventData: function() {
            return {
                tab: this.active,
                panel: !this.active.length ? $() : this._getPanelForTab(this.active)
            };
        },
        _tabKeydown: function(event) {
            var focusedTab = $($.ui.safeActiveElement(this.document[0])).closest("li"),
                selectedIndex = this.tabs.index(focusedTab),
                goingForward = true;
            if (this._handlePageNav(event)) {
                return;
            }
            switch (event.keyCode) {
                case $.ui.keyCode.RIGHT:
                case $.ui.keyCode.DOWN:
                    selectedIndex++;
                    break;
                case $.ui.keyCode.UP:
                case $.ui.keyCode.LEFT:
                    goingForward = false;
                    selectedIndex--;
                    break;
                case $.ui.keyCode.END:
                    selectedIndex = this.anchors.length - 1;
                    break;
                case $.ui.keyCode.HOME:
                    selectedIndex = 0;
                    break;
                case $.ui.keyCode.SPACE:
                    event.preventDefault();
                    clearTimeout(this.activating);
                    this._activate(selectedIndex);
                    return;
                case $.ui.keyCode.ENTER:
                    event.preventDefault();
                    clearTimeout(this.activating);
                    this._activate(selectedIndex === this.options.active ? false : selectedIndex);
                    return;
                default:
                    return;
            }
            event.preventDefault();
            clearTimeout(this.activating);
            selectedIndex = this._focusNextTab(selectedIndex, goingForward);
            if (!event.ctrlKey && !event.metaKey) {
                focusedTab.attr("aria-selected", "false");
                this.tabs.eq(selectedIndex).attr("aria-selected", "true");
                this.activating = this._delay(function() {
                    this.option("active", selectedIndex);
                }, this.delay);
            }
        },
        _panelKeydown: function(event) {
            if (this._handlePageNav(event)) {
                return;
            }
            if (event.ctrlKey && event.keyCode === $.ui.keyCode.UP) {
                event.preventDefault();
                this.active.trigger("focus");
            }
        },
        _handlePageNav: function(event) {
            if (event.altKey && event.keyCode === $.ui.keyCode.PAGE_UP) {
                this._activate(this._focusNextTab(this.options.active - 1, false));
                return true;
            }
            if (event.altKey && event.keyCode === $.ui.keyCode.PAGE_DOWN) {
                this._activate(this._focusNextTab(this.options.active + 1, true));
                return true;
            }
        },
        _findNextTab: function(index, goingForward) {
            var lastTabIndex = this.tabs.length - 1;

            function constrain() {
                if (index > lastTabIndex) {
                    index = 0;
                }
                if (index < 0) {
                    index = lastTabIndex;
                }
                return index;
            }
            while ($.inArray(constrain(), this.options.disabled) !== -1) {
                index = goingForward ? index + 1 : index - 1;
            }
            return index;
        },
        _focusNextTab: function(index, goingForward) {
            index = this._findNextTab(index, goingForward);
            this.tabs.eq(index).trigger("focus");
            return index;
        },
        _setOption: function(key, value) {
            if (key === "active") {
                this._activate(value);
                return;
            }
            this._super(key, value);
            if (key === "collapsible") {
                this._toggleClass("ui-tabs-collapsible", null, value);
                if (!value && this.options.active === false) {
                    this._activate(0);
                }
            }
            if (key === "event") {
                this._setupEvents(value);
            }
            if (key === "heightStyle") {
                this._setupHeightStyle(value);
            }
        },
        _sanitizeSelector: function(hash) {
            return hash ? hash.replace(/[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&") : "";
        },
        refresh: function() {
            var options = this.options,
                lis = this.tablist.children(":has(a[href])");
            options.disabled = $.map(lis.filter(".ui-state-disabled"), function(tab) {
                return lis.index(tab);
            });
            this._processTabs();
            if (options.active === false || !this.anchors.length) {
                options.active = false;
                this.active = $();
            } else if (this.active.length && !$.contains(this.tablist[0], this.active[0])) {
                if (this.tabs.length === options.disabled.length) {
                    options.active = false;
                    this.active = $();
                } else {
                    this._activate(this._findNextTab(Math.max(0, options.active - 1), false));
                }
            } else {
                options.active = this.tabs.index(this.active);
            }
            this._refresh();
        },
        _refresh: function() {
            this._setOptionDisabled(this.options.disabled);
            this._setupEvents(this.options.event);
            this._setupHeightStyle(this.options.heightStyle);
            this.tabs.not(this.active).attr({
                "aria-selected": "false",
                "aria-expanded": "false",
                tabIndex: -1
            });
            this.panels.not(this._getPanelForTab(this.active)).hide().attr({
                "aria-hidden": "true"
            });
            if (!this.active.length) {
                this.tabs.eq(0).attr("tabIndex", 0);
            } else {
                this.active.attr({
                    "aria-selected": "true",
                    "aria-expanded": "true",
                    tabIndex: 0
                });
                this._addClass(this.active, "ui-tabs-active", "ui-state-active");
                this._getPanelForTab(this.active).show().attr({
                    "aria-hidden": "false"
                });
            }
        },
        _processTabs: function() {
            var that = this,
                prevTabs = this.tabs,
                prevAnchors = this.anchors,
                prevPanels = this.panels;
            this.tablist = this._getList().attr("role", "tablist");
            this._addClass(this.tablist, "ui-tabs-nav", "ui-helper-reset ui-helper-clearfix ui-widget-header");
            this.tablist.on("mousedown" + this.eventNamespace, "> li", function(event) {
                if ($(this).is(".ui-state-disabled")) {
                    event.preventDefault();
                }
            }).on("focus" + this.eventNamespace, ".ui-tabs-anchor", function() {
                if ($(this).closest("li").is(".ui-state-disabled")) {
                    this.blur();
                }
            });
            this.tabs = this.tablist.find("> li:has(a[href])").attr({
                role: "tab",
                tabIndex: -1
            });
            this._addClass(this.tabs, "ui-tabs-tab", "ui-state-default");
            this.anchors = this.tabs.map(function() {
                return $("a", this)[0];
            }).attr({
                role: "presentation",
                tabIndex: -1
            });
            this._addClass(this.anchors, "ui-tabs-anchor");
            this.panels = $();
            this.anchors.each(function(i, anchor) {
                var selector, panel, panelId, anchorId = $(anchor).uniqueId().attr("id"),
                    tab = $(anchor).closest("li"),
                    originalAriaControls = tab.attr("aria-controls");
                if (that._isLocal(anchor)) {
                    selector = anchor.hash;
                    panelId = selector.substring(1);
                    panel = that.element.find(that._sanitizeSelector(selector));
                } else {
                    panelId = tab.attr("aria-controls") || $({}).uniqueId()[0].id;
                    selector = "#" + panelId;
                    panel = that.element.find(selector);
                    if (!panel.length) {
                        panel = that._createPanel(panelId);
                        panel.insertAfter(that.panels[i - 1] || that.tablist);
                    }
                    panel.attr("aria-live", "polite");
                }
                if (panel.length) {
                    that.panels = that.panels.add(panel);
                }
                if (originalAriaControls) {
                    tab.data("ui-tabs-aria-controls", originalAriaControls);
                }
                tab.attr({
                    "aria-controls": panelId,
                    "aria-labelledby": anchorId
                });
                panel.attr("aria-labelledby", anchorId);
            });
            this.panels.attr("role", "tabpanel");
            this._addClass(this.panels, "ui-tabs-panel", "ui-widget-content");
            if (prevTabs) {
                this._off(prevTabs.not(this.tabs));
                this._off(prevAnchors.not(this.anchors));
                this._off(prevPanels.not(this.panels));
            }
        },
        _getList: function() {
            return this.tablist || this.element.find("ol, ul").eq(0);
        },
        _createPanel: function(id) {
            return $("<div>").attr("id", id).data("ui-tabs-destroy", true);
        },
        _setOptionDisabled: function(disabled) {
            var currentItem, li, i;
            if ($.isArray(disabled)) {
                if (!disabled.length) {
                    disabled = false;
                } else if (disabled.length === this.anchors.length) {
                    disabled = true;
                }
            }
            for (i = 0;
                (li = this.tabs[i]); i++) {
                currentItem = $(li);
                if (disabled === true || $.inArray(i, disabled) !== -1) {
                    currentItem.attr("aria-disabled", "true");
                    this._addClass(currentItem, null, "ui-state-disabled");
                } else {
                    currentItem.removeAttr("aria-disabled");
                    this._removeClass(currentItem, null, "ui-state-disabled");
                }
            }
            this.options.disabled = disabled;
            this._toggleClass(this.widget(), this.widgetFullName + "-disabled", null, disabled === true);
        },
        _setupEvents: function(event) {
            var events = {};
            if (event) {
                $.each(event.split(" "), function(index, eventName) {
                    events[eventName] = "_eventHandler";
                });
            }
            this._off(this.anchors.add(this.tabs).add(this.panels));
            this._on(true, this.anchors, {
                click: function(event) {
                    event.preventDefault();
                }
            });
            this._on(this.anchors, events);
            this._on(this.tabs, {
                keydown: "_tabKeydown"
            });
            this._on(this.panels, {
                keydown: "_panelKeydown"
            });
            this._focusable(this.tabs);
            this._hoverable(this.tabs);
        },
        _setupHeightStyle: function(heightStyle) {
            var maxHeight, parent = this.element.parent();
            if (heightStyle === "fill") {
                maxHeight = parent.height();
                maxHeight -= this.element.outerHeight() - this.element.height();
                this.element.siblings(":visible").each(function() {
                    var elem = $(this),
                        position = elem.css("position");
                    if (position === "absolute" || position === "fixed") {
                        return;
                    }
                    maxHeight -= elem.outerHeight(true);
                });
                this.element.children().not(this.panels).each(function() {
                    maxHeight -= $(this).outerHeight(true);
                });
                this.panels.each(function() {
                    $(this).height(Math.max(0, maxHeight -
                        $(this).innerHeight() + $(this).height()));
                }).css("overflow", "auto");
            } else if (heightStyle === "auto") {
                maxHeight = 0;
                this.panels.each(function() {
                    maxHeight = Math.max(maxHeight, $(this).height("").height());
                }).height(maxHeight);
            }
        },
        _eventHandler: function(event) {
            var options = this.options,
                active = this.active,
                anchor = $(event.currentTarget),
                tab = anchor.closest("li"),
                clickedIsActive = tab[0] === active[0],
                collapsing = clickedIsActive && options.collapsible,
                toShow = collapsing ? $() : this._getPanelForTab(tab),
                toHide = !active.length ? $() : this._getPanelForTab(active),
                eventData = {
                    oldTab: active,
                    oldPanel: toHide,
                    newTab: collapsing ? $() : tab,
                    newPanel: toShow
                };
            event.preventDefault();
            if (tab.hasClass("ui-state-disabled") || tab.hasClass("ui-tabs-loading") || this.running || (clickedIsActive && !options.collapsible) || (this._trigger("beforeActivate", event, eventData) === false)) {
                return;
            }
            options.active = collapsing ? false : this.tabs.index(tab);
            this.active = clickedIsActive ? $() : tab;
            if (this.xhr) {
                this.xhr.abort();
            }
            if (!toHide.length && !toShow.length) {
                $.error("jQuery UI Tabs: Mismatching fragment identifier.");
            }
            if (toShow.length) {
                this.load(this.tabs.index(tab), event);
            }
            this._toggle(event, eventData);
        },
        _toggle: function(event, eventData) {
            var that = this,
                toShow = eventData.newPanel,
                toHide = eventData.oldPanel;
            this.running = true;

            function complete() {
                that.running = false;
                that._trigger("activate", event, eventData);
            }

            function show() {
                that._addClass(eventData.newTab.closest("li"), "ui-tabs-active", "ui-state-active");
                if (toShow.length && that.options.show) {
                    that._show(toShow, that.options.show, complete);
                } else {
                    toShow.show();
                    complete();
                }
            }
            if (toHide.length && this.options.hide) {
                this._hide(toHide, this.options.hide, function() {
                    that._removeClass(eventData.oldTab.closest("li"), "ui-tabs-active", "ui-state-active");
                    show();
                });
            } else {
                this._removeClass(eventData.oldTab.closest("li"), "ui-tabs-active", "ui-state-active");
                toHide.hide();
                show();
            }
            toHide.attr("aria-hidden", "true");
            eventData.oldTab.attr({
                "aria-selected": "false",
                "aria-expanded": "false"
            });
            if (toShow.length && toHide.length) {
                eventData.oldTab.attr("tabIndex", -1);
            } else if (toShow.length) {
                this.tabs.filter(function() {
                    return $(this).attr("tabIndex") === 0;
                }).attr("tabIndex", -1);
            }
            toShow.attr("aria-hidden", "false");
            eventData.newTab.attr({
                "aria-selected": "true",
                "aria-expanded": "true",
                tabIndex: 0
            });
        },
        _activate: function(index) {
            var anchor, active = this._findActive(index);
            if (active[0] === this.active[0]) {
                return;
            }
            if (!active.length) {
                active = this.active;
            }
            anchor = active.find(".ui-tabs-anchor")[0];
            this._eventHandler({
                target: anchor,
                currentTarget: anchor,
                preventDefault: $.noop
            });
        },
        _findActive: function(index) {
            return index === false ? $() : this.tabs.eq(index);
        },
        _getIndex: function(index) {
            if (typeof index === "string") {
                index = this.anchors.index(this.anchors.filter("[href$='" +
                    $.ui.escapeSelector(index) + "']"));
            }
            return index;
        },
        _destroy: function() {
            if (this.xhr) {
                this.xhr.abort();
            }
            this.tablist.removeAttr("role").off(this.eventNamespace);
            this.anchors.removeAttr("role tabIndex").removeUniqueId();
            this.tabs.add(this.panels).each(function() {
                if ($.data(this, "ui-tabs-destroy")) {
                    $(this).remove();
                } else {
                    $(this).removeAttr("role tabIndex " + "aria-live aria-busy aria-selected aria-labelledby aria-hidden aria-expanded");
                }
            });
            this.tabs.each(function() {
                var li = $(this),
                    prev = li.data("ui-tabs-aria-controls");
                if (prev) {
                    li.attr("aria-controls", prev).removeData("ui-tabs-aria-controls");
                } else {
                    li.removeAttr("aria-controls");
                }
            });
            this.panels.show();
            if (this.options.heightStyle !== "content") {
                this.panels.css("height", "");
            }
        },
        enable: function(index) {
            var disabled = this.options.disabled;
            if (disabled === false) {
                return;
            }
            if (index === undefined) {
                disabled = false;
            } else {
                index = this._getIndex(index);
                if ($.isArray(disabled)) {
                    disabled = $.map(disabled, function(num) {
                        return num !== index ? num : null;
                    });
                } else {
                    disabled = $.map(this.tabs, function(li, num) {
                        return num !== index ? num : null;
                    });
                }
            }
            this._setOptionDisabled(disabled);
        },
        disable: function(index) {
            var disabled = this.options.disabled;
            if (disabled === true) {
                return;
            }
            if (index === undefined) {
                disabled = true;
            } else {
                index = this._getIndex(index);
                if ($.inArray(index, disabled) !== -1) {
                    return;
                }
                if ($.isArray(disabled)) {
                    disabled = $.merge([index], disabled).sort();
                } else {
                    disabled = [index];
                }
            }
            this._setOptionDisabled(disabled);
        },
        load: function(index, event) {
            index = this._getIndex(index);
            var that = this,
                tab = this.tabs.eq(index),
                anchor = tab.find(".ui-tabs-anchor"),
                panel = this._getPanelForTab(tab),
                eventData = {
                    tab: tab,
                    panel: panel
                },
                complete = function(jqXHR, status) {
                    if (status === "abort") {
                        that.panels.stop(false, true);
                    }
                    that._removeClass(tab, "ui-tabs-loading");
                    panel.removeAttr("aria-busy");
                    if (jqXHR === that.xhr) {
                        delete that.xhr;
                    }
                };
            if (this._isLocal(anchor[0])) {
                return;
            }
            this.xhr = $.ajax(this._ajaxSettings(anchor, event, eventData));
            if (this.xhr && this.xhr.statusText !== "canceled") {
                this._addClass(tab, "ui-tabs-loading");
                panel.attr("aria-busy", "true");
                this.xhr.done(function(response, status, jqXHR) {
                    setTimeout(function() {
                        panel.html(response);
                        that._trigger("load", event, eventData);
                        complete(jqXHR, status);
                    }, 1);
                }).fail(function(jqXHR, status) {
                    setTimeout(function() {
                        complete(jqXHR, status);
                    }, 1);
                });
            }
        },
        _ajaxSettings: function(anchor, event, eventData) {
            var that = this;
            return {
                url: anchor.attr("href").replace(/#.*$/, ""),
                beforeSend: function(jqXHR, settings) {
                    return that._trigger("beforeLoad", event, $.extend({
                        jqXHR: jqXHR,
                        ajaxSettings: settings
                    }, eventData));
                }
            };
        },
        _getPanelForTab: function(tab) {
            var id = $(tab).attr("aria-controls");
            return this.element.find(this._sanitizeSelector("#" + id));
        }
    });
    if ($.uiBackCompat !== false) {
        $.widget("ui.tabs", $.ui.tabs, {
            _processTabs: function() {
                this._superApply(arguments);
                this._addClass(this.tabs, "ui-tab");
            }
        });
    }
    var widgetsTabs = $.ui.tabs;
    /*!
     * jQuery UI Tooltip 1.12.1
     * http://jqueryui.com
     *
     * Copyright jQuery Foundation and other contributors
     * Released under the MIT license.
     * http://jquery.org/license
     */
    $.widget("ui.tooltip", {
        version: "1.12.1",
        options: {
            classes: {
                "ui-tooltip": "ui-corner-all ui-widget-shadow"
            },
            content: function() {
                var title = $(this).attr("title") || "";
                return $("<a>").text(title).html();
            },
            hide: true,
            items: "[title]:not([disabled])",
            position: {
                my: "left top+15",
                at: "left bottom",
                collision: "flipfit flip"
            },
            show: true,
            track: false,
            close: null,
            open: null
        },
        _addDescribedBy: function(elem, id) {
            var describedby = (elem.attr("aria-describedby") || "").split(/\s+/);
            describedby.push(id);
            elem.data("ui-tooltip-id", id).attr("aria-describedby", $.trim(describedby.join(" ")));
        },
        _removeDescribedBy: function(elem) {
            var id = elem.data("ui-tooltip-id"),
                describedby = (elem.attr("aria-describedby") || "").split(/\s+/),
                index = $.inArray(id, describedby);
            if (index !== -1) {
                describedby.splice(index, 1);
            }
            elem.removeData("ui-tooltip-id");
            describedby = $.trim(describedby.join(" "));
            if (describedby) {
                elem.attr("aria-describedby", describedby);
            } else {
                elem.removeAttr("aria-describedby");
            }
        },
        _create: function() {
            this._on({
                mouseover: "open",
                focusin: "open"
            });
            this.tooltips = {};
            this.parents = {};
            this.liveRegion = $("<div>").attr({
                role: "log",
                "aria-live": "assertive",
                "aria-relevant": "additions"
            }).appendTo(this.document[0].body);
            this._addClass(this.liveRegion, null, "ui-helper-hidden-accessible");
            this.disabledTitles = $([]);
        },
        _setOption: function(key, value) {
            var that = this;
            this._super(key, value);
            if (key === "content") {
                $.each(this.tooltips, function(id, tooltipData) {
                    that._updateContent(tooltipData.element);
                });
            }
        },
        _setOptionDisabled: function(value) {
            this[value ? "_disable" : "_enable"]();
        },
        _disable: function() {
            var that = this;
            $.each(this.tooltips, function(id, tooltipData) {
                var event = $.Event("blur");
                event.target = event.currentTarget = tooltipData.element[0];
                that.close(event, true);
            });
            this.disabledTitles = this.disabledTitles.add(this.element.find(this.options.items).addBack().filter(function() {
                var element = $(this);
                if (element.is("[title]")) {
                    return element.data("ui-tooltip-title", element.attr("title")).removeAttr("title");
                }
            }));
        },
        _enable: function() {
            this.disabledTitles.each(function() {
                var element = $(this);
                if (element.data("ui-tooltip-title")) {
                    element.attr("title", element.data("ui-tooltip-title"));
                }
            });
            this.disabledTitles = $([]);
        },
        open: function(event) {
            var that = this,
                target = $(event ? event.target : this.element).closest(this.options.items);
            if (!target.length || target.data("ui-tooltip-id")) {
                return;
            }
            if (target.attr("title")) {
                target.data("ui-tooltip-title", target.attr("title"));
            }
            target.data("ui-tooltip-open", true);
            if (event && event.type === "mouseover") {
                target.parents().each(function() {
                    var parent = $(this),
                        blurEvent;
                    if (parent.data("ui-tooltip-open")) {
                        blurEvent = $.Event("blur");
                        blurEvent.target = blurEvent.currentTarget = this;
                        that.close(blurEvent, true);
                    }
                    if (parent.attr("title")) {
                        parent.uniqueId();
                        that.parents[this.id] = {
                            element: this,
                            title: parent.attr("title")
                        };
                        parent.attr("title", "");
                    }
                });
            }
            this._registerCloseHandlers(event, target);
            this._updateContent(target, event);
        },
        _updateContent: function(target, event) {
            var content, contentOption = this.options.content,
                that = this,
                eventType = event ? event.type : null;
            if (typeof contentOption === "string" || contentOption.nodeType || contentOption.jquery) {
                return this._open(event, target, contentOption);
            }
            content = contentOption.call(target[0], function(response) {
                that._delay(function() {
                    if (!target.data("ui-tooltip-open")) {
                        return;
                    }
                    if (event) {
                        event.type = eventType;
                    }
                    this._open(event, target, response);
                });
            });
            if (content) {
                this._open(event, target, content);
            }
        },
        _open: function(event, target, content) {
            var tooltipData, tooltip, delayedShow, a11yContent, positionOption = $.extend({}, this.options.position);
            if (!content) {
                return;
            }
            tooltipData = this._find(target);
            if (tooltipData) {
                tooltipData.tooltip.find(".ui-tooltip-content").html(content);
                return;
            }
            if (target.is("[title]")) {
                if (event && event.type === "mouseover") {
                    target.attr("title", "");
                } else {
                    target.removeAttr("title");
                }
            }
            tooltipData = this._tooltip(target);
            tooltip = tooltipData.tooltip;
            this._addDescribedBy(target, tooltip.attr("id"));
            tooltip.find(".ui-tooltip-content").html(content);
            this.liveRegion.children().hide();
            a11yContent = $("<div>").html(tooltip.find(".ui-tooltip-content").html());
            a11yContent.removeAttr("name").find("[name]").removeAttr("name");
            a11yContent.removeAttr("id").find("[id]").removeAttr("id");
            a11yContent.appendTo(this.liveRegion);

            function position(event) {
                positionOption.of = event;
                if (tooltip.is(":hidden")) {
                    return;
                }
                tooltip.position(positionOption);
            }
            if (this.options.track && event && /^mouse/.test(event.type)) {
                this._on(this.document, {
                    mousemove: position
                });
                position(event);
            } else {
                tooltip.position($.extend({ of: target
                }, this.options.position));
            }
            tooltip.hide();
            this._show(tooltip, this.options.show);
            if (this.options.track && this.options.show && this.options.show.delay) {
                delayedShow = this.delayedShow = setInterval(function() {
                    if (tooltip.is(":visible")) {
                        position(positionOption.of);
                        clearInterval(delayedShow);
                    }
                }, $.fx.interval);
            }
            this._trigger("open", event, {
                tooltip: tooltip
            });
        },
        _registerCloseHandlers: function(event, target) {
            var events = {
                keyup: function(event) {
                    if (event.keyCode === $.ui.keyCode.ESCAPE) {
                        var fakeEvent = $.Event(event);
                        fakeEvent.currentTarget = target[0];
                        this.close(fakeEvent, true);
                    }
                }
            };
            if (target[0] !== this.element[0]) {
                events.remove = function() {
                    this._removeTooltip(this._find(target).tooltip);
                };
            }
            if (!event || event.type === "mouseover") {
                events.mouseleave = "close";
            }
            if (!event || event.type === "focusin") {
                events.focusout = "close";
            }
            this._on(true, target, events);
        },
        close: function(event) {
            var tooltip, that = this,
                target = $(event ? event.currentTarget : this.element),
                tooltipData = this._find(target);
            if (!tooltipData) {
                target.removeData("ui-tooltip-open");
                return;
            }
            tooltip = tooltipData.tooltip;
            if (tooltipData.closing) {
                return;
            }
            clearInterval(this.delayedShow);
            if (target.data("ui-tooltip-title") && !target.attr("title")) {
                target.attr("title", target.data("ui-tooltip-title"));
            }
            this._removeDescribedBy(target);
            tooltipData.hiding = true;
            tooltip.stop(true);
            this._hide(tooltip, this.options.hide, function() {
                that._removeTooltip($(this));
            });
            target.removeData("ui-tooltip-open");
            this._off(target, "mouseleave focusout keyup");
            if (target[0] !== this.element[0]) {
                this._off(target, "remove");
            }
            this._off(this.document, "mousemove");
            if (event && event.type === "mouseleave") {
                $.each(this.parents, function(id, parent) {
                    $(parent.element).attr("title", parent.title);
                    delete that.parents[id];
                });
            }
            tooltipData.closing = true;
            this._trigger("close", event, {
                tooltip: tooltip
            });
            if (!tooltipData.hiding) {
                tooltipData.closing = false;
            }
        },
        _tooltip: function(element) {
            var tooltip = $("<div>").attr("role", "tooltip"),
                content = $("<div>").appendTo(tooltip),
                id = tooltip.uniqueId().attr("id");
            this._addClass(content, "ui-tooltip-content");
            this._addClass(tooltip, "ui-tooltip", "ui-widget ui-widget-content");
            tooltip.appendTo(this._appendTo(element));
            return this.tooltips[id] = {
                element: element,
                tooltip: tooltip
            };
        },
        _find: function(target) {
            var id = target.data("ui-tooltip-id");
            return id ? this.tooltips[id] : null;
        },
        _removeTooltip: function(tooltip) {
            tooltip.remove();
            delete this.tooltips[tooltip.attr("id")];
        },
        _appendTo: function(target) {
            var element = target.closest(".ui-front, dialog");
            if (!element.length) {
                element = this.document[0].body;
            }
            return element;
        },
        _destroy: function() {
            var that = this;
            $.each(this.tooltips, function(id, tooltipData) {
                var event = $.Event("blur"),
                    element = tooltipData.element;
                event.target = event.currentTarget = element[0];
                that.close(event, true);
                $("#" + id).remove();
                if (element.data("ui-tooltip-title")) {
                    if (!element.attr("title")) {
                        element.attr("title", element.data("ui-tooltip-title"));
                    }
                    element.removeData("ui-tooltip-title");
                }
            });
            this.liveRegion.remove();
        }
    });
    if ($.uiBackCompat !== false) {
        $.widget("ui.tooltip", $.ui.tooltip, {
            options: {
                tooltipClass: null
            },
            _tooltip: function() {
                var tooltipData = this._superApply(arguments);
                if (this.options.tooltipClass) {
                    tooltipData.tooltip.addClass(this.options.tooltipClass);
                }
                return tooltipData;
            }
        });
    }
    var widgetsTooltip = $.ui.tooltip;
}));;
! function(a) {
    "use strict";

    function b(a, b) {
        return a + ".touchspin_" + b
    }

    function c(c, d) {
        return a.map(c, function(a) {
            return b(a, d)
        })
    }
    var d = 0;
    a.fn.TouchSpin = function(b) {
        if ("destroy" === b) return void this.each(function() {
            var b = a(this),
                d = b.data();
            a(document).off(c(["mouseup", "touchend", "touchcancel", "mousemove", "touchmove", "scroll", "scrollstart"], d.spinnerid).join(" "))
        });
        var e = {
                min: 0,
                max: 100,
                initval: "",
                step: 1,
                decimals: 0,
                stepinterval: 100,
                forcestepdivisibility: "round",
                stepintervaldelay: 500,
                verticalbuttons: !1,
                verticalupclass: "glyphicon glyphicon-chevron-up",
                verticaldownclass: "glyphicon glyphicon-chevron-down",
                prefix: "",
                postfix: "",
                prefix_extraclass: "",
                postfix_extraclass: "",
                booster: !0,
                boostat: 10,
                maxboostedstep: !1,
                mousewheel: !0,
                buttondown_class: "btn btn-default",
                buttonup_class: "btn btn-default",
                buttondown_txt: "-",
                buttonup_txt: "+"
            },
            f = {
                min: "min",
                max: "max",
                initval: "init-val",
                step: "step",
                decimals: "decimals",
                stepinterval: "step-interval",
                verticalbuttons: "vertical-buttons",
                verticalupclass: "vertical-up-class",
                verticaldownclass: "vertical-down-class",
                forcestepdivisibility: "force-step-divisibility",
                stepintervaldelay: "step-interval-delay",
                prefix: "prefix",
                postfix: "postfix",
                prefix_extraclass: "prefix-extra-class",
                postfix_extraclass: "postfix-extra-class",
                booster: "booster",
                boostat: "boostat",
                maxboostedstep: "max-boosted-step",
                mousewheel: "mouse-wheel",
                buttondown_class: "button-down-class",
                buttonup_class: "button-up-class",
                buttondown_txt: "button-down-txt",
                buttonup_txt: "button-up-txt"
            };
        return this.each(function() {
            function g() {
                if (!J.data("alreadyinitialized")) {
                    if (J.data("alreadyinitialized", !0), d += 1, J.data("spinnerid", d), !J.is("input")) return void console.log("Must be an input.");
                    j(), h(), u(), m(), p(), q(), r(), s(), D.input.css("display", "block")
                }
            }

            function h() {
                "" !== B.initval && "" === J.val() && J.val(B.initval)
            }

            function i(a) {
                l(a), u();
                var b = D.input.val();
                "" !== b && (b = Number(D.input.val()), D.input.val(b.toFixed(B.decimals)))
            }

            function j() {
                B = a.extend({}, e, K, k(), b)
            }

            function k() {
                var b = {};
                return a.each(f, function(a, c) {
                    var d = "bts-" + c;
                    J.is("[data-" + d + "]") && (b[a] = J.data(d))
                }), b
            }

            function l(b) {
                B = a.extend({}, B, b)
            }

            function m() {
                var a = J.val(),
                    b = J.parent();
                "" !== a && (a = Number(a).toFixed(B.decimals)), J.data("initvalue", a).val(a), J.addClass("form-control"), b.hasClass("input-group") ? n(b) : o()
            }

            function n(b) {
                b.addClass("bootstrap-touchspin");
                var c, d, e = J.prev(),
                    f = J.next(),
                    g = '<span class="input-group-addon bootstrap-touchspin-prefix">' + B.prefix + "</span>",
                    h = '<span class="input-group-addon bootstrap-touchspin-postfix">' + B.postfix + "</span>";
                e.hasClass("input-group-btn") ? (c = '<button class="' + B.buttondown_class + ' bootstrap-touchspin-down" type="button">' + B.buttondown_txt + "</button>", e.append(c)) : (c = '<span class="input-group-btn"><button class="' + B.buttondown_class + ' bootstrap-touchspin-down" type="button">' + B.buttondown_txt + "</button></span>", a(c).insertBefore(J)), f.hasClass("input-group-btn") ? (d = '<button class="' + B.buttonup_class + ' bootstrap-touchspin-up" type="button">' + B.buttonup_txt + "</button>", f.prepend(d)) : (d = '<span class="input-group-btn"><button class="' + B.buttonup_class + ' bootstrap-touchspin-up" type="button">' + B.buttonup_txt + "</button></span>", a(d).insertAfter(J)), a(g).insertBefore(J), a(h).insertAfter(J), C = b
            }

            function o() {
                var b;
                b = B.verticalbuttons ? '<div class="input-group bootstrap-touchspin"><span class="input-group-addon bootstrap-touchspin-prefix">' + B.prefix + '</span><span class="input-group-addon bootstrap-touchspin-postfix">' + B.postfix + '</span><span class="input-group-btn-vertical"><button class="' + B.buttondown_class + ' bootstrap-touchspin-up" type="button"><i class="' + B.verticalupclass + '"></i></button><button class="' + B.buttonup_class + ' bootstrap-touchspin-down" type="button"><i class="' + B.verticaldownclass + '"></i></button></span></div>' : '<div class="input-group bootstrap-touchspin"><span class="input-group-btn"><button class="' + B.buttondown_class + ' bootstrap-touchspin-down" type="button">' + B.buttondown_txt + '</button></span><span class="input-group-addon bootstrap-touchspin-prefix">' + B.prefix + '</span><span class="input-group-addon bootstrap-touchspin-postfix">' + B.postfix + '</span><span class="input-group-btn"><button class="' + B.buttonup_class + ' bootstrap-touchspin-up" type="button">' + B.buttonup_txt + "</button></span></div>", C = a(b).insertBefore(J), a(".bootstrap-touchspin-prefix", C).after(J), J.hasClass("input-sm") ? C.addClass("input-group-sm") : J.hasClass("input-lg") && C.addClass("input-group-lg")
            }

            function p() {
                D = {
                    down: a(".bootstrap-touchspin-down", C),
                    up: a(".bootstrap-touchspin-up", C),
                    input: a("input", C),
                    prefix: a(".bootstrap-touchspin-prefix", C).addClass(B.prefix_extraclass),
                    postfix: a(".bootstrap-touchspin-postfix", C).addClass(B.postfix_extraclass)
                }
            }

            function q() {
                "" === B.prefix && D.prefix.hide(), "" === B.postfix && D.postfix.hide()
            }

            function r() {
                J.on("keydown", function(a) {
                    var b = a.keyCode || a.which;
                    38 === b ? ("up" !== M && (w(), z()), a.preventDefault()) : 40 === b && ("down" !== M && (x(), y()), a.preventDefault())
                }), J.on("keyup", function(a) {
                    var b = a.keyCode || a.which;
                    38 === b ? A() : 40 === b && A()
                }), J.on("blur", function() {
                    u()
                }), D.down.on("keydown", function(a) {
                    var b = a.keyCode || a.which;
                    (32 === b || 13 === b) && ("down" !== M && (x(), y()), a.preventDefault())
                }), D.down.on("keyup", function(a) {
                    var b = a.keyCode || a.which;
                    (32 === b || 13 === b) && A()
                }), D.up.on("keydown", function(a) {
                    var b = a.keyCode || a.which;
                    (32 === b || 13 === b) && ("up" !== M && (w(), z()), a.preventDefault())
                }), D.up.on("keyup", function(a) {
                    var b = a.keyCode || a.which;
                    (32 === b || 13 === b) && A()
                }), D.down.on("mousedown.touchspin", function(a) {
                    D.down.off("touchstart.touchspin"), J.is(":disabled") || (x(), y(), a.preventDefault(), a.stopPropagation())
                }), D.down.on("touchstart.touchspin", function(a) {
                    D.down.off("mousedown.touchspin"), J.is(":disabled") || (x(), y(), a.preventDefault(), a.stopPropagation())
                }), D.up.on("mousedown.touchspin", function(a) {
                    D.up.off("touchstart.touchspin"), J.is(":disabled") || (w(), z(), a.preventDefault(), a.stopPropagation())
                }), D.up.on("touchstart.touchspin", function(a) {
                    D.up.off("mousedown.touchspin"), J.is(":disabled") || (w(), z(), a.preventDefault(), a.stopPropagation())
                }), D.up.on("mouseout touchleave touchend touchcancel", function(a) {
                    M && (a.stopPropagation(), A())
                }), D.down.on("mouseout touchleave touchend touchcancel", function(a) {
                    M && (a.stopPropagation(), A())
                }), D.down.on("mousemove touchmove", function(a) {
                    M && (a.stopPropagation(), a.preventDefault())
                }), D.up.on("mousemove touchmove", function(a) {
                    M && (a.stopPropagation(), a.preventDefault())
                }), a(document).on(c(["mouseup", "touchend", "touchcancel"], d).join(" "), function(a) {
                    M && (a.preventDefault(), A())
                }), a(document).on(c(["mousemove", "touchmove", "scroll", "scrollstart"], d).join(" "), function(a) {
                    M && (a.preventDefault(), A())
                }), J.on("mousewheel DOMMouseScroll", function(a) {
                    if (B.mousewheel && J.is(":focus")) {
                        var b = a.originalEvent.wheelDelta || -a.originalEvent.deltaY || -a.originalEvent.detail;
                        a.stopPropagation(), a.preventDefault(), 0 > b ? x() : w()
                    }
                })
            }

            function s() {
                J.on("touchspin.uponce", function() {
                    A(), w()
                }), J.on("touchspin.downonce", function() {
                    A(), x()
                }), J.on("touchspin.startupspin", function() {
                    z()
                }), J.on("touchspin.startdownspin", function() {
                    y()
                }), J.on("touchspin.stopspin", function() {
                    A()
                }), J.on("touchspin.updatesettings", function(a, b) {
                    i(b)
                })
            }

            function t(a) {
                switch (B.forcestepdivisibility) {
                    case "round":
                        return (Math.round(a / B.step) * B.step).toFixed(B.decimals);
                    case "floor":
                        return (Math.floor(a / B.step) * B.step).toFixed(B.decimals);
                    case "ceil":
                        return (Math.ceil(a / B.step) * B.step).toFixed(B.decimals);
                    default:
                        return a
                }
            }

            function u() {
                var a, b, c;
                a = J.val(), "" !== a && (B.decimals > 0 && "." === a || (b = parseFloat(a), isNaN(b) && (b = 0), c = b, b.toString() !== a && (c = b), b < B.min && (c = B.min), b > B.max && (c = B.max), c = t(c), Number(a).toString() !== c.toString() && (J.val(c), J.trigger("change"))))
            }

            function v() {
                if (B.booster) {
                    var a = Math.pow(2, Math.floor(L / B.boostat)) * B.step;
                    return B.maxboostedstep && a > B.maxboostedstep && (a = B.maxboostedstep, E = Math.round(E / a) * a), Math.max(B.step, a)
                }
                return B.step
            }

            function w() {
                u(), E = parseFloat(D.input.val()), isNaN(E) && (E = 0);
                var a = E,
                    b = v();
                E += b, E > B.max && (E = B.max, J.trigger("touchspin.on.max"), A()), D.input.val(Number(E).toFixed(B.decimals)), a !== E && J.trigger("change")
            }

            function x() {
                u(), E = parseFloat(D.input.val()), isNaN(E) && (E = 0);
                var a = E,
                    b = v();
                E -= b, E < B.min && (E = B.min, J.trigger("touchspin.on.min"), A()), D.input.val(E.toFixed(B.decimals)), a !== E && J.trigger("change")
            }

            function y() {
                A(), L = 0, M = "down", J.trigger("touchspin.on.startspin"), J.trigger("touchspin.on.startdownspin"), H = setTimeout(function() {
                    F = setInterval(function() {
                        L++, x()
                    }, B.stepinterval)
                }, B.stepintervaldelay)
            }

            function z() {
                A(), L = 0, M = "up", J.trigger("touchspin.on.startspin"), J.trigger("touchspin.on.startupspin"), I = setTimeout(function() {
                    G = setInterval(function() {
                        L++, w()
                    }, B.stepinterval)
                }, B.stepintervaldelay)
            }

            function A() {
                switch (clearTimeout(H), clearTimeout(I), clearInterval(F), clearInterval(G), M) {
                    case "up":
                        J.trigger("touchspin.on.stopupspin"), J.trigger("touchspin.on.stopspin");
                        break;
                    case "down":
                        J.trigger("touchspin.on.stopdownspin"), J.trigger("touchspin.on.stopspin")
                }
                L = 0, M = !1
            }
            var B, C, D, E, F, G, H, I, J = a(this),
                K = J.data(),
                L = 0,
                M = !1;
            g()
        })
    }
}(jQuery);;
$.widget("app.autocomplete", $.ui.autocomplete, {
    _renderItem: function(ul, item) {
        var re = new RegExp(this.term + '\\\S*', 'gi'),
            template = "<strong>$&</strong>";
        if (Object.keys(item).length == 6) {
            $(ul).addClass("airports-dropdown");
            var name = item.name.replace(re, template),
                country = item.country.replace(re, template),
                id = item.id.replace(re, template);
            var label = '<div>' + '<i class="airports-dropdown__icn ui-menu-item-wrapper"></i>' + '<span class="airports-dropdown__name ui-menu-item-wrapper">' + '<span class="airports-dropdown__place">' + name + '</span>, ' + '<span class="airports-dropdown__country">' + country + '</span>, ' + '<span class="airports-dropdown__iata">' + id + '</span>' + '</span>' + '</div>',
                liCh = $("<li/>").addClass("airports-dropdown__item ui-menu-item").appendTo(ul);
            liCh.html(label);
            return liCh;
        } else {
            var liChild = $("<li/>").appendTo(ul);
            liChild.html(item.value.replace(re, template));
            return liChild;
        }
    }
});
const maxSum = 9;

function initTouchSpinButton() {
    var cnt = 0;
    cnt += parseInt($("#child-number-pass").val());
    cnt += parseInt($("#adult-number-pass").val());
    if (maxSum <= cnt) {
        $('.bootstrap-touchspin-up').each(function() {
            $(this).addClass('disabled').prop('disabled', true);
        });
    } else {
        $('.bootstrap-touchspin-up').each(function() {
            $(this).removeClass('disabled').prop('disabled', false);
        });
    }
    if (parseInt($("#child-number-pass").val()) == 0) {
        $("#child-number-pass").parent().find('.bootstrap-touchspin-down').addClass('disabled').prop('disabled', true);
    } else {
        $("#child-number-pass").parent().find('.bootstrap-touchspin-down').removeClass('disabled').prop('disabled', false);
    }
    if (parseInt($("#adult-number-pass").val()) == 1) {
        $("#adult-number-pass").parent().find('.bootstrap-touchspin-down').addClass('disabled').prop('disabled', true);
    } else {
        $("#adult-number-pass").parent().find('.bootstrap-touchspin-down').removeClass('disabled').prop('disabled', false);
    }
}

function passSum(input) {
    var cnt = 0;
    cnt += parseInt($("#child-number-pass").val());
    cnt += parseInt($("#adult-number-pass").val());
    if (maxSum < cnt) {
        switch (input.attr('id')) {
            case 'adults':
                var val = parseInt($("#adult-number-pass").val()) - 1;
                $("#adult-number-pass").val(val);
                break;
            case 'children':
                var val = parseInt($("#child-number-pass").val()) - 1;
                $("#child-number-pass").val(val);
                break;
        }
        cnt--;
    }
    initTouchSpinButton();
    var postData = {
        category: "search-form",
        message: "{count} {num, plural, =1{passenger} other{passengers}}",
        params: {
            count: cnt,
            num: cnt
        }
    };
    translate($('.js-total-pax-number'), postData);
}

function translate(block, postData) {
    var lang = $('html').attr('lang').toLowerCase();
    var url = (lang != 'en-gb') ? '/' + lang + '/site/get-translate' : '/site/get-translate';
    $.ajax({
        url: url,
        type: 'post',
        data: postData,
        success: function(data) {
            block.text(data);
        },
        error: function(xhr, status, error) {
            console.log("Error: " + error);
        }
    });
}
$('.passengers-number__quant').TouchSpin({});
$('.passengers-number__quant').on('change', function() {
    passSum($(this));
});
$(document).on('click', '#total-pax-num', function(e) {
    initTouchSpinButton();
});
$(document).on('click', '.search-option--pax .dropdown-menu', function(e) {
    initTouchSpinButton();
    e.stopPropagation();
});
$("input[name='cabin-class']").on('change', function() {
    $('.js-screen-cabin').text($(this).parent().find('label')[0].innerHTML);
});
$("input[name='SearchForm[tripType]']").on('change', function() {
    var divElement = $('a[href="#dates-screen"]');
    switch ($(this).val()) {
        case 'ow':
            divElement.find('.js-search-return').addClass('hidden');
            divElement.find('.js-search-day-return').addClass('hidden');
            $('#js-mdest-container').hide();
            $('#js-row-container').show();
            $('#js-row-container').addClass('fields-group--ow');
            break;
        case 'rt':
            var day = new Date($("input[name='SearchForm[departing]']").val());
            day.setDate(day.getDate() + 6);
            $("input[name='SearchForm[returning]']").val(moment(day).format("MM/DD/YYYY"));
            $('#data-returning').val($("input[name='SearchForm[returning]']").val());
            $('a[href="#dates-screen"] .js-search-day-return').text('- ' + moment(day).format("ddd"));
            $('a[href="#dates-screen"] .js-search-return').text('- ' + moment(day).format("DD MMM"));
            divElement.find('.js-search-return').removeClass('hidden');
            divElement.find('.js-search-day-return').removeClass('hidden');
            $('#js-mdest-container').hide();
            $('#js-row-container').show();
            $('#js-row-container').removeClass('fields-group--ow');
            break;
    }
});
$("input[type=text]").focus(function() {
    $(this).select();
});
$('a[href="#dates-screen"]').click(function(e) {
    e.preventDefault();
    var isOw = false;
    $("input[name='SearchForm[tripType]']").each(function() {
        if ($(this).is(':checked') && $(this).val() == 'ow') {
            isOw = true;
        }
    });
    $('#data-departing').val($("input[name='SearchForm[departing]']").val());
    $('#data-returning').val($("input[name='SearchForm[returning]']").val());
    if (isOw) {
        initializeDatepicker($('#data-departing'), true);
        $('#data-returning').addClass('hidden');
    } else {
        initializeDatepicker($('#data-departing'), false);
        $('#data-returning').removeClass('hidden');
    }
});
$('#dates-screen').on('shown.bs.modal', function(e) {
    $('.month-wrapper').find('.first-date-selected').each(function() {
        if ($(this).hasClass('toMonth')) {
            $('#dates-screen').scrollTop($(this).parent().offsetParent().position().top);
        }
    });
});
$('#dates-screen .js-modal-back').click(function(e) {
    e.preventDefault();
    $('#data-departing').data('dateRangePicker').destroy();
});
$('#dates-screen .js-apply-dates').click(function(e) {
    e.preventDefault();
    var datesValue = $('#value-date-picker').val();
    if (datesValue != '') {
        var dates = datesValue.split(" to ");
        $("input[name='SearchForm[departing]']").val(dates[0]);
        if (dates.length > 1) {
            $("input[name='SearchForm[returning]']").val(dates[1]);
        }
        var departe = $('#data-departing').val().split(", ");
        $('.js-search-dates .js-search-depart').text(departe[1]);
        if (dates.length > 1) {
            var returne = $('#data-returning').val().split(", ");
            $('.js-search-dates .js-search-return').text('- ' + returne[1]);
        }
        $('a[href="#dates-screen"] .js-search-day-depart').text(departe[0]);
        if (dates.length > 1) {
            $('a[href="#dates-screen"] .js-search-day-return').text('- ' + returne[0]);
        }
    }
    $('#data-departing').data('dateRangePicker').destroy();
});
$('a[href="#location-screen"]').click(function(e) {
    e.preventDefault();
    var elem = $('#location-screen').find('.field-location input');
    elem.attr('data-div-id', $(this).attr('id'));
    elem.attr('data-code-id', $(this).find('.airport-code-input').attr('id'));
    elem.attr('data-name-id', $(this).find('.airport-name-input').attr('id'));
    elem.attr('placeholder', $(this).find('.airport-name-input').attr('placeholder'));
    elem.val($(this).find('.airport-name-input').val());
});
$("#location-screen").on('shown.bs.modal', function() {
    $(this).find('.field-location input').focus();
    $(this).find('.field-location input').focus();
});
$('.js-clear-topbar').click(function(e) {
    e.preventDefault();
    var inputElem = $(this).parent().find('.field-location input');
    $('#' + inputElem.attr('data-name-id')).val('');
    $('#' + inputElem.attr('data-code-id')).val('');
    var divElement = $('#' + inputElem.attr('data-div-id'));
    divElement.find('.js-search-city').hide();
    divElement.find('.js-search-country').hide();
    divElement.find('.js-search-placeholder').show();
    $(this).parent().find('.field-location input').val('');
    $(this).parent().find('.field-location input').focus();
});
$('a[href="#additional-options-screen"]').click(function(e) {
    e.preventDefault();
    $('#child-number-pass').val($("input[name='SearchForm[children]']").val());
    $('#adult-number-pass').val($("input[name='SearchForm[adults]']").val());
    initTouchSpinButton();
    var cnt = parseInt($("input[name='SearchForm[children]']").val()) + parseInt($("input[name='SearchForm[adults]']").val());
    var postData = {
        category: "search-form",
        message: "{count} {num, plural, =1{passenger} other{passengers}}",
        params: {
            count: cnt,
            num: cnt
        }
    };
    translate($('.js-total-pax-number'), postData);
});
$('#additional-options-screen .js-apply-additional').click(function(e) {
    e.preventDefault();
    $("input[name='SearchForm[children]']").val($('#child-number-pass').val());
    $("input[name='SearchForm[adults]']").val($('#adult-number-pass').val());
    $('.js-search-pax').text($('.js-total-pax-number').text());
    $("input[name='cabin-class']").each(function() {
        if ($(this).is(':checked')) {
            $("input[name='SearchForm[cabinClass]']").val($(this).val());
        }
    });
    $('.js-search-cabin').text($('.js-screen-cabin').text());
});;;
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.moment = factory()
}(this, (function() {
    'use strict';
    var hookCallback;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return (Object.getOwnPropertyNames(obj).length === 0);
        } else {
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [],
            i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }
        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }
        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }
        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            meridiem: null,
            rfc2822: false,
            weekdayMismatch: false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }
    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function(fun) {
            var t = Object(this);
            var len = t.length >>> 0;
            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }
            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function(i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) && flags.overflow < 0 && !flags.empty && !flags.invalidMonth && !flags.invalidWeekday && !flags.weekdayMismatch && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated && (!flags.meridiem || (flags.meridiem && parsedParts));
            if (m._strict) {
                isNowValid = isNowValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === undefined;
            }
            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            } else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid(flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }
        return m;
    }
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;
        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }
        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }
        return to;
    }
    var updateInProgress = false;

    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor(number) {
        if (number < 0) {
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;
        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }
        return value;
    }

    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) || (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false && (typeof console !== 'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function() {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2);
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }
    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }
    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set(config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig),
            prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) && !hasOwnProp(childConfig, prop) && isObject(parentConfig[prop])) {
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }
    var keys;
    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function(obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }
    var defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L'
    };

    function calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }
    var defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];
        if (format || !formatUpper) {
            return format;
        }
        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function(val) {
            return val.slice(1);
        });
        return this._longDateFormat[key];
    }
    var defaultInvalidDate = 'Invalid date';

    function invalidDate() {
        return this._invalidDate;
    }
    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }
    var defaultRelativeTime = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        ss: '%d seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
    };

    function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
    }

    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }
    var aliases = {};

    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp, prop;
        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }
        return normalizedInput;
    }
    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({
                unit: u,
                priority: priorities[u]
            });
        }
        units.sort(function(a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }
    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;
    var formatFunctions = {};
    var formatTokenFunctions = {};

    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function() {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function() {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function() {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens),
            i, length;
        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }
        return function(mom) {
            var output = '',
                i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }
        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);
        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }
        return format;
    }
    var match1 = /\d/;
    var match2 = /\d\d/;
    var match3 = /\d{3}/;
    var match4 = /\d{4}/;
    var match6 = /[+-]?\d{6}/;
    var match1to2 = /\d\d?/;
    var match3to4 = /\d\d\d\d?/;
    var match5to6 = /\d\d\d\d\d\d?/;
    var match1to3 = /\d{1,3}/;
    var match1to4 = /\d{1,4}/;
    var match1to6 = /[+-]?\d{1,6}/;
    var matchUnsigned = /\d+/;
    var matchSigned = /[+-]?\d+/;
    var matchOffset = /Z|[+-]\d\d:?\d\d/gi;
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi;
    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/;
    var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;
    var regexes = {};

    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function(isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }
        return regexes[token](config._strict, config._locale);
    }

    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    var tokens = {};

    function addParseToken(token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function(input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken(token, callback) {
        addParseToken(token, function(input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }
    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;
    addFormatToken('Y', 0, 0, function() {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });
    addFormatToken(0, ['YY', 2], 0, function() {
        return this.year() % 100;
    });
    addFormatToken(0, ['YYYY', 4], 0, 'year');
    addFormatToken(0, ['YYYYY', 5], 0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');
    addUnitAlias('year', 'y');
    addUnitPriority('year', 1);
    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);
    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function(input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function(input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function(input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
    hooks.parseTwoDigitYear = function(input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };
    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear() {
        return isLeapYear(this.year());
    }

    function makeGetSet(unit, keepTime) {
        return function(value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get(mom, unit) {
        return mom.isValid() ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1(mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
            } else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }

    function stringSet(units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function mod(n, x) {
        return ((n % x) + x) % x;
    }
    var indexOf;
    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(o) {
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
    }
    addFormatToken('M', ['MM', 2], 'Mo', function() {
        return this.month() + 1;
    });
    addFormatToken('MMM', 0, 0, function(format) {
        return this.localeData().monthsShort(this, format);
    });
    addFormatToken('MMMM', 0, 0, function(format) {
        return this.localeData().months(this, format);
    });
    addUnitAlias('month', 'M');
    addUnitPriority('month', 8);
    addRegexToken('M', match1to2);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', function(isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function(isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });
    addParseToken(['M', 'MM'], function(input, array) {
        array[MONTH] = toInt(input) - 1;
    });
    addParseToken(['MMM', 'MMMM'], function(input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });
    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');

    function localeMonths(m, format) {
        if (!m) {
            return isArray(this._months) ? this._months : this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] : this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }
    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');

    function localeMonthsShort(m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort : this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }
        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;
        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }
        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }
        for (i = 0; i < 12; i++) {
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    function setMonth(mom, value) {
        var dayOfMonth;
        if (!mom.isValid()) {
            return mom;
        }
        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }
        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }
    var defaultMonthsShortRegex = matchWord;

    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }
    var defaultMonthsRegex = matchWord;

    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }
        var shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }
        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function createDate(y, m, d, h, M, s, ms) {
        var date = new Date(y, m, d, h, M, s, ms);
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function firstWeekOffset(year, dow, doy) {
        var
            fwd = 7 + dow - doy,
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
        return -fwdlw + fwd - 1;
    }

    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;
        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }
        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;
        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }
        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }
    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');
    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');
    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);
    addRegexToken('w', match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2);
    addRegexToken('WW', match1to2, match2);
    addWeekParseToken(['w', 'ww', 'W', 'WW'], function(input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }
    var defaultLocaleWeek = {
        dow: 0,
        doy: 6
    };

    function localeFirstDayOfWeek() {
        return this._week.dow;
    }

    function localeFirstDayOfYear() {
        return this._week.doy;
    }

    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }
    addFormatToken('d', 0, 'do', 'day');
    addFormatToken('dd', 0, 0, function(format) {
        return this.localeData().weekdaysMin(this, format);
    });
    addFormatToken('ddd', 0, 0, function(format) {
        return this.localeData().weekdaysShort(this, format);
    });
    addFormatToken('dddd', 0, 0, function(format) {
        return this.localeData().weekdays(this, format);
    });
    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');
    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);
    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', function(isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd', function(isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd', function(isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });
    addWeekParseToken(['dd', 'ddd', 'dddd'], function(input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });
    addWeekParseToken(['d', 'e', 'E'], function(input, week, config, token) {
        week[token] = toInt(input);
    });

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }
        if (!isNaN(input)) {
            return parseInt(input, 10);
        }
        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }
        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }
    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');

    function localeWeekdays(m, format) {
        if (!m) {
            return isArray(this._weekdays) ? this._weekdays : this._weekdays['standalone'];
        }
        return isArray(this._weekdays) ? this._weekdays[m.day()] : this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }
    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');

    function localeWeekdaysShort(m) {
        return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }
    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');

    function localeWeekdaysMin(m) {
        return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];
            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }
        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;
        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }
        for (i = 0; i < 7; i++) {
            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    function getSetDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }
    var defaultWeekdaysRegex = matchWord;

    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }
    var defaultWeekdaysShortRegex = matchWord;

    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }
    var defaultWeekdaysMinRegex = matchWord;

    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }

    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }
        var minPieces = [],
            shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            mom = createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }
        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;
        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }
    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);
    addFormatToken('hmm', 0, 0, function() {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });
    addFormatToken('hmmss', 0, 0, function() {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });
    addFormatToken('Hmm', 0, 0, function() {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });
    addFormatToken('Hmmss', 0, 0, function() {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function() {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }
    meridiem('a', true);
    meridiem('A', false);
    addUnitAlias('hour', 'h');
    addUnitPriority('hour', 13);

    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }
    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2);
    addRegexToken('h', match1to2);
    addRegexToken('k', match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);
    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);
    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function(input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function(input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function(input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function(input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function(input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function(input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function(input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    function localeIsPM(input) {
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }
    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;

    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }
    var getSetHour = makeGetSet('Hours', true);
    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,
        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,
        week: defaultLocaleWeek,
        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,
        meridiemParse: defaultLocaleMeridiemParse
    };
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    function chooseLocale(names) {
        var i = 0,
            j, next, locale, split;
        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && (typeof module !== 'undefined') && module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                var aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {}
        }
        return locales[name];
    }

    function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            } else {
                data = defineLocale(key, values);
            }
            if (data) {
                globalLocale = data;
            }
        }
        return globalLocale._abbr;
    }

    function defineLocale(name, config) {
        if (config !== null) {
            var parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride', 'use moment.updateLocale(localeName, config) to change ' + 'an existing locale. moment.defineLocale(localeName, ' + 'config) should only be used for creating a new locale ' + 'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    if (!localeFamilies[config.parentLocale]) {
                        localeFamilies[config.parentLocale] = [];
                    }
                    localeFamilies[config.parentLocale].push({
                        name: name,
                        config: config
                    });
                    return null;
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));
            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function(x) {
                    defineLocale(x.name, x.config);
                });
            }
            getSetGlobalLocale(name);
            return locales[name];
        } else {
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, tmpLocale, parentConfig = baseConfig;
            tmpLocale = loadLocale(name);
            if (tmpLocale != null) {
                parentConfig = tmpLocale._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;
            getSetGlobalLocale(name);
        } else {
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    function getLocale(key) {
        var locale;
        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }
        if (!key) {
            return globalLocale;
        }
        if (!isArray(key)) {
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }
        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow(m) {
        var overflow;
        var a = m._a;
        if (a && getParsingFlags(m).overflow === -2) {
            overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;
            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }
            getParsingFlags(m).overflow = overflow;
        }
        return m;
    }

    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    function configFromArray(config) {
        var i, date, input = [],
            currentDate, expectedWeekday, yearToUse;
        if (config._d) {
            return;
        }
        currentDate = currentDateArray(config);
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }
            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }
        if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }
        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }
        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
        if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;
        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;
            var curWeek = weekOfYear(createLocal(), dow, doy);
            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);
            week = defaults(w.w, curWeek.week);
            if (w.d != null) {
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;
    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];
    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    function configFromISO(config) {
        var i, l, string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;
        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [untruncateYear(yearStr), defaultLocaleMonthsShort.indexOf(monthStr), parseInt(dayStr, 10), parseInt(hourStr, 10), parseInt(minuteStr, 10)];
        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }
        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').trim();
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }
    var obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
    };

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            return 0;
        } else {
            var hm = parseInt(numOffset, 10);
            var m = hm % 100,
                h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i));
        if (match) {
            var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }
            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);
            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }
        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }
        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }
        hooks.createFromInputFallback(config);
    }
    hooks.createFromInputFallback = deprecate('value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' + 'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' + 'discouraged and will be removed in an upcoming major release. Please refer to ' + 'http://momentjs.com/guides/#/warnings/js-date/ for more info.', function(config) {
        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
    });
    hooks.ISO_8601 = function() {};
    hooks.RFC_2822 = function() {};

    function configFromStringAndFormat(config) {
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped, stringLength = string.length,
            totalParsedInputLength = 0;
        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                } else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }
        if (config._a[HOUR] <= 12 && getParsingFlags(config).bigHour === true && config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }
        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
        configFromArray(config);
        checkOverflow(config);
    }

    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;
        if (meridiem == null) {
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            return hour;
        }
    }

    function configFromStringAndArray(config) {
        var tempConfig, bestMoment, scoreToBeat, i, currentScore;
        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }
        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);
            if (!isValid(tempConfig)) {
                continue;
            }
            currentScore += getParsingFlags(tempConfig).charsLeftOver;
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
            getParsingFlags(tempConfig).score = currentScore;
            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }
        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }
        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function(obj) {
            return obj && parseInt(obj, 10);
        });
        configFromArray(config);
    }

    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            res.add(1, 'd');
            res._nextDay = undefined;
        }
        return res;
    }

    function prepareConfig(config) {
        var input = config._i,
            format = config._f;
        config._locale = config._locale || getLocale(config._l);
        if (input === null || (format === undefined && input === '')) {
            return createInvalid({
                nullInput: true
            });
        }
        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }
        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }
        if (!isValid(config)) {
            config._d = null;
        }
        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function(obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};
        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }
        if ((isObject(input) && isObjectEmpty(input)) || (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        return createFromConfig(c);
    }

    function createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }
    var prototypeMin = deprecate('moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/', function() {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other < this ? this : other;
        } else {
            return createInvalid();
        }
    });
    var prototypeMax = deprecate('moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/', function() {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
            return other > this ? this : other;
        } else {
            return createInvalid();
        }
    });

    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    function min() {
        var args = [].slice.call(arguments, 0);
        return pickBy('isBefore', args);
    }

    function max() {
        var args = [].slice.call(arguments, 0);
        return pickBy('isAfter', args);
    }
    var now = function() {
        return Date.now ? Date.now() : +(new Date());
    };
    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }
        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false;
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }
        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;
        this._isValid = isDurationValid(normalizedInput);
        this._milliseconds = +milliseconds +
            seconds * 1e3 +
            minutes * 6e4 +
            hours * 1000 * 60 * 60;
        this._days = +days +
            weeks * 7;
        this._months = +months +
            quarters * 3 +
            years * 12;
        this._data = {};
        this._locale = getLocale();
        this._bubble();
    }

    function isDuration(obj) {
        return obj instanceof Duration;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    function offset(token, separator) {
        addFormatToken(token, 0, 0, function() {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }
    offset('Z', ':');
    offset('ZZ', '');
    addRegexToken('Z', matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function(input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);
        if (matches === null) {
            return null;
        }
        var chunk = matches[matches.length - 1] || [];
        var parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);
        return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
    }

    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset(m) {
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }
    hooks.updateOffset = function() {};

    function getSetOffset(input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }
            this.utcOffset(input, keepLocalTime);
            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;
            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset() {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            } else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;
        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime() {
        return (this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset());
    }

    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }
        var c = {};
        copyConfig(c, this);
        c = prepareConfig(c);
        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }
        return this._isDSTShifted;
    }

    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }
    var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;
    var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration(input, key) {
        var duration = input,
            match = null,
            sign, ret, diffRes;
        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : (match[1] === '+') ? 1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign)
            };
        } else if (duration == null) {
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));
            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }
        ret = new Duration(duration);
        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }
        return ret;
    }
    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso(inp, sign) {
        var res = inp && parseFloat(inp.replace(',', '.'));
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {
            milliseconds: 0,
            months: 0
        };
        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }
        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));
        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {
                milliseconds: 0,
                months: 0
            };
        }
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }
        return res;
    }

    function createAdder(direction, name) {
        return function(val, period) {
            var dur, tmp;
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' + 'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val;
                val = period;
                period = tmp;
            }
            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);
        if (!mom.isValid()) {
            return;
        }
        updateOffset = updateOffset == null ? true : updateOffset;
        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }
    var add = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1(time, formats) {
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';
        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);
        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone() {
        return new Moment(this);
    }

    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween(from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) && (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff(input, units, asFloat) {
        var that, zoneDelta, delta, output;
        if (!this.isValid()) {
            return NaN;
        }
        that = cloneWithOffset(input, this);
        if (!that.isValid()) {
            return NaN;
        }
        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;
        units = normalizeUnits(units);
        switch (units) {
            case 'year':
                output = monthDiff(this, that) / 12;
                break;
            case 'month':
                output = monthDiff(this, that);
                break;
            case 'quarter':
                output = monthDiff(this, that) / 3;
                break;
            case 'second':
                output = (this - that) / 1e3;
                break;
            case 'minute':
                output = (this - that) / 6e4;
                break;
            case 'hour':
                output = (this - that) / 36e5;
                break;
            case 'day':
                output = (this - that - zoneDelta) / 864e5;
                break;
            case 'week':
                output = (this - that - zoneDelta) / 6048e5;
                break;
            default:
                output = this - that;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff(a, b) {
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;
        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            adjust = (b - anchor) / (anchor2 - anchor);
        }
        return -(wholeMonthDiff + adjust) || 0;
    }
    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true;
        var m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }
        if (isFunction(Date.prototype.toISOString)) {
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this._d.valueOf()).toISOString().replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }

    function inspect() {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';
        return this.format(prefix + year + datetime + suffix);
    }

    function format(inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from(time, withoutSuffix) {
        if (this.isValid() && ((isMoment(time) && time.isValid()) || createLocal(time).isValid())) {
            return createDuration({
                to: this,
                from: time
            }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to(time, withoutSuffix) {
        if (this.isValid() && ((isMoment(time) && time.isValid()) || createLocal(time).isValid())) {
            return createDuration({
                from: this,
                to: time
            }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    function locale(key) {
        var newLocaleData;
        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }
    var lang = deprecate('moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.', function(key) {
        if (key === undefined) {
            return this.localeData();
        } else {
            return this.locale(key);
        }
    });

    function localeData() {
        return this._locale;
    }

    function startOf(units) {
        units = normalizeUnits(units);
        switch (units) {
            case 'year':
                this.month(0);
            case 'quarter':
            case 'month':
                this.date(1);
            case 'week':
            case 'isoWeek':
            case 'day':
            case 'date':
                this.hours(0);
            case 'hour':
                this.minutes(0);
            case 'minute':
                this.seconds(0);
            case 'second':
                this.milliseconds(0);
        }
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }
        return this;
    }

    function endOf(units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }
        if (units === 'date') {
            units = 'day';
        }
        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function valueOf() {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate() {
        return new Date(this.valueOf());
    }

    function toArray() {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON() {
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2() {
        return isValid(this);
    }

    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt() {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }
    addFormatToken(0, ['gg', 2], 0, function() {
        return this.weekYear() % 100;
    });
    addFormatToken(0, ['GG', 2], 0, function() {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }
    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');
    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');
    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);
    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);
    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function(input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });
    addWeekParseToken(['gg', 'GG'], function(input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(this, input, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy);
    }

    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }
    addFormatToken('Q', 0, 'Qo', 'quarter');
    addUnitAlias('quarter', 'Q');
    addUnitPriority('quarter', 7);
    addRegexToken('Q', match1);
    addParseToken('Q', function(input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    function getSetQuarter(input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }
    addFormatToken('D', ['DD', 2], 'Do', 'date');
    addUnitAlias('date', 'D');
    addUnitPriority('date', 9);
    addRegexToken('D', match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function(isStrict, locale) {
        return isStrict ? (locale._dayOfMonthOrdinalParse || locale._ordinalParse) : locale._dayOfMonthOrdinalParseLenient;
    });
    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function(input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });
    var getSetDayOfMonth = makeGetSet('Date', true);
    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');
    addUnitAlias('dayOfYear', 'DDD');
    addUnitPriority('dayOfYear', 4);
    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function(input, array, config) {
        config._dayOfYear = toInt(input);
    });

    function getSetDayOfYear(input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }
    addFormatToken('m', ['mm', 2], 0, 'minute');
    addUnitAlias('minute', 'm');
    addUnitPriority('minute', 14);
    addRegexToken('m', match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);
    var getSetMinute = makeGetSet('Minutes', false);
    addFormatToken('s', ['ss', 2], 0, 'second');
    addUnitAlias('second', 's');
    addUnitPriority('second', 15);
    addRegexToken('s', match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);
    var getSetSecond = makeGetSet('Seconds', false);
    addFormatToken('S', 0, 0, function() {
        return ~~(this.millisecond() / 100);
    });
    addFormatToken(0, ['SS', 2], 0, function() {
        return ~~(this.millisecond() / 10);
    });
    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function() {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function() {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function() {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function() {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function() {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function() {
        return this.millisecond() * 1000000;
    });
    addUnitAlias('millisecond', 'ms');
    addUnitPriority('millisecond', 16);
    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);
    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }
    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    var getSetMillisecond = makeGetSet('Milliseconds', false);
    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }
    var proto = Moment.prototype;
    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix(input) {
        return createLocal(input * 1000);
    }

    function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat(string) {
        return string;
    }
    var proto$1 = Locale.prototype;
    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;
    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;
    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;
    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;
    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1(format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl(format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }
        format = format || '';
        if (index != null) {
            return get$1(format, index, field, 'month');
        }
        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    function listWeekdaysImpl(localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }
            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }
            format = format || '';
        }
        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;
        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }
        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths(format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort(format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }
    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function(number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' : (b === 1) ? 'st' : (b === 2) ? 'nd' : (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });
    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);
    var mathAbs = Math.abs;

    function abs() {
        var data = this._data;
        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);
        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);
        return this;
    }

    function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);
        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;
        return duration._bubble();
    }

    function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble() {
        var milliseconds = this._milliseconds;
        var days = this._days;
        var months = this._months;
        var data = this._data;
        var seconds, minutes, hours, years, monthsFromDays;
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) || (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }
        data.milliseconds = milliseconds % 1000;
        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;
        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;
        hours = absFloor(minutes / 60);
        data.hours = hours % 24;
        days += absFloor(hours / 24);
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));
        years = absFloor(months / 12);
        months %= 12;
        data.days = days;
        data.months = months;
        data.years = years;
        return this;
    }

    function daysToMonths(days) {
        return days * 4800 / 146097;
    }

    function monthsToDays(months) {
        return months * 146097 / 4800;
    }

    function as(units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;
        units = normalizeUnits(units);
        if (units === 'month' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week':
                    return days / 7 + milliseconds / 6048e5;
                case 'day':
                    return days + milliseconds / 864e5;
                case 'hour':
                    return days * 24 + milliseconds / 36e5;
                case 'minute':
                    return days * 1440 + milliseconds / 6e4;
                case 'second':
                    return days * 86400 + milliseconds / 1000;
                case 'millisecond':
                    return Math.floor(days * 864e5) + milliseconds;
                default:
                    throw new Error('Unknown unit ' + units);
            }
        }
    }

    function valueOf$1() {
        if (!this.isValid()) {
            return NaN;
        }
        return (this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6);
    }

    function makeAs(alias) {
        return function() {
            return this.as(alias);
        };
    }
    var asMilliseconds = makeAs('ms');
    var asSeconds = makeAs('s');
    var asMinutes = makeAs('m');
    var asHours = makeAs('h');
    var asDays = makeAs('d');
    var asWeeks = makeAs('w');
    var asMonths = makeAs('M');
    var asYears = makeAs('y');

    function clone$1() {
        return createDuration(this);
    }

    function get$2(units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function() {
            return this.isValid() ? this._data[name] : NaN;
        };
    }
    var milliseconds = makeGetter('milliseconds');
    var seconds = makeGetter('seconds');
    var minutes = makeGetter('minutes');
    var hours = makeGetter('hours');
    var days = makeGetter('days');
    var months = makeGetter('months');
    var years = makeGetter('years');

    function weeks() {
        return absFloor(this.days() / 7);
    }
    var round = Math.round;
    var thresholds = {
        ss: 44,
        s: 45,
        m: 45,
        h: 22,
        d: 26,
        M: 11
    };

    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1(posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds = round(duration.as('s'));
        var minutes = round(duration.as('m'));
        var hours = round(duration.as('h'));
        var days = round(duration.as('d'));
        var months = round(duration.as('M'));
        var years = round(duration.as('y'));
        var a = seconds <= thresholds.ss && ['s', seconds] || seconds < thresholds.s && ['ss', seconds] || minutes <= 1 && ['m'] || minutes < thresholds.m && ['mm', minutes] || hours <= 1 && ['h'] || hours < thresholds.h && ['hh', hours] || days <= 1 && ['d'] || days < thresholds.d && ['dd', days] || months <= 1 && ['M'] || months < thresholds.M && ['MM', months] || years <= 1 && ['y'] || ['yy', years];
        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    function getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    function getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize(withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);
        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }
        return locale.postformat(output);
    }
    var abs$1 = Math.abs;

    function sign(x) {
        return ((x > 0) - (x < 0)) || +x;
    }

    function toISOString$1() {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }
        var seconds = abs$1(this._milliseconds) / 1000;
        var days = abs$1(this._days);
        var months = abs$1(this._months);
        var minutes, hours, years;
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;
        years = absFloor(months / 12);
        months %= 12;
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
        var total = this.asSeconds();
        if (!total) {
            return 'P0D';
        }
        var totalSign = total < 0 ? '-' : '';
        var ymSign = sign(this._months) !== sign(total) ? '-' : '';
        var daysSign = sign(this._days) !== sign(total) ? '-' : '';
        var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';
        return totalSign + 'P' +
            (Y ? ymSign + Y + 'Y' : '') +
            (M ? ymSign + M + 'M' : '') +
            (D ? daysSign + D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? hmsSign + h + 'H' : '') +
            (m ? hmsSign + m + 'M' : '') +
            (s ? hmsSign + s + 'S' : '');
    }
    var proto$2 = Duration.prototype;
    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.clone = clone$1;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;
    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;
    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');
    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function(input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function(input, array, config) {
        config._d = new Date(toInt(input));
    });
    hooks.version = '2.20.1';
    setHookCallback(createLocal);
    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',
        DATE: 'YYYY-MM-DD',
        TIME: 'HH:mm',
        TIME_SECONDS: 'HH:mm:ss',
        TIME_MS: 'HH:mm:ss.SSS',
        WEEK: 'YYYY-[W]WW',
        MONTH: 'YYYY-MM'
    };
    return hooks;
})));;
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'moment'], factory);
    } else if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory(require('jquery'), require('moment'));
    } else {
        factory(jQuery, moment);
    }
}(function($, moment) {
    'use strict';
    $.dateRangePickerLanguages = {
        "default": {
            "selected": "Selected:",
            "day": "Day",
            "days": "Days",
            "apply": "Close",
            "week-1": "mo",
            "week-2": "tu",
            "week-3": "we",
            "week-4": "th",
            "week-5": "fr",
            "week-6": "sa",
            "week-7": "su",
            "week-number": "W",
            "month-name": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
            "shortcuts": "Shortcuts",
            "custom-values": "Custom Values",
            "past": "Past",
            "following": "Following",
            "previous": "Previous",
            "prev-week": "Week",
            "prev-month": "Month",
            "prev-year": "Year",
            "next": "Next",
            "next-week": "Week",
            "next-month": "Month",
            "next-year": "Year",
            "less-than": "Date range should not be more than %d days",
            "more-than": "Date range should not be less than %d days",
            "default-more": "Please select a date range longer than %d days",
            "default-single": "Please select a date",
            "default-less": "Please select a date range less than %d days",
            "default-range": "Please select a date range between %d and %d days",
            "default-default": "Please select a date range",
            "time": "Time",
            "hour": "Hour",
            "minute": "Minute"
        },
        "id": {
            "selected": "Terpilih:",
            "day": "Hari",
            "days": "Hari",
            "apply": "Tutup",
            "week-1": "sen",
            "week-2": "sel",
            "week-3": "rab",
            "week-4": "kam",
            "week-5": "jum",
            "week-6": "sab",
            "week-7": "min",
            "week-number": "W",
            "month-name": ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"],
            "shortcuts": "Pintas",
            "custom-values": "Nilai yang ditentukan",
            "past": "Yang Lalu",
            "following": "Mengikuti",
            "previous": "Sebelumnya",
            "prev-week": "Minggu",
            "prev-month": "Bulan",
            "prev-year": "Tahun",
            "next": "Selanjutnya",
            "next-week": "Minggu",
            "next-month": "Bulan",
            "next-year": "Tahun",
            "less-than": "Tanggal harus lebih dari %d hari",
            "more-than": "Tanggal harus kurang dari %d hari",
            "default-more": "Jarak tanggal harus lebih lama dari %d hari",
            "default-single": "Silakan pilih tanggal",
            "default-less": "Jarak rentang tanggal tidak boleh lebih lama dari %d hari",
            "default-range": "Rentang tanggal harus antara %d dan %d hari",
            "default-default": "Silakan pilih rentang tanggal",
            "time": "Waktu",
            "hour": "Jam",
            "minute": "Menit"
        },
        "az": {
            "selected": "Seçildi:",
            "day": " gün",
            "days": " gün",
            "apply": "tətbiq",
            "week-1": "1",
            "week-2": "2",
            "week-3": "3",
            "week-4": "4",
            "week-5": "5",
            "week-6": "6",
            "week-7": "7",
            "month-name": ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"],
            "shortcuts": "Qısayollar",
            "past": "Keçmiş",
            "following": "Növbəti",
            "previous": "&nbsp;&nbsp;&nbsp;",
            "prev-week": "Öncəki həftə",
            "prev-month": "Öncəki ay",
            "prev-year": "Öncəki il",
            "next": "&nbsp;&nbsp;&nbsp;",
            "next-week": "Növbəti həftə",
            "next-month": "Növbəti ay",
            "next-year": "Növbəti il",
            "less-than": "Tarix aralığı %d gündən çox olmamalıdır",
            "more-than": "Tarix aralığı %d gündən az olmamalıdır",
            "default-more": "%d gündən çox bir tarix seçin",
            "default-single": "Tarix seçin",
            "default-less": "%d gündən az bir tarix seçin",
            "default-range": "%d və %d gün aralığında tarixlər seçin",
            "default-default": "Tarix aralığı seçin"
        },
        "bg": {
            "selected": "Избрано:",
            "day": "Ден",
            "days": "Дни",
            "apply": "Затвори",
            "week-1": "пн",
            "week-2": "вт",
            "week-3": "ср",
            "week-4": "чт",
            "week-5": "пт",
            "week-6": "сб",
            "week-7": "нд",
            "week-number": "С",
            "month-name": ["януари", "февруари", "март", "април", "май", "юни", "юли", "август", "септември", "октомври", "ноември", "декември"],
            "shortcuts": "Преки пътища",
            "custom-values": "Персонализирани стойности",
            "past": "Минал",
            "following": "Следващ",
            "previous": "Предишен",
            "prev-week": "Седмица",
            "prev-month": "Месец",
            "prev-year": "Година",
            "next": "Следващ",
            "next-week": "Седмица",
            "next-month": "Месец",
            "next-year": "Година",
            "less-than": "Периодът от време не трябва да е повече от %d дни",
            "more-than": "Периодът от време не трябва да е по-малко от %d дни",
            "default-more": "Моля изберете период по-дълъг от %d дни",
            "default-single": "Моля изберете дата",
            "default-less": "Моля изберете период по-къс от %d дни",
            "default-range": "Моля изберете период между %d и %d дни",
            "default-default": "Моля изберете период",
            "time": "Време",
            "hour": "Час",
            "minute": "Минута"
        },
        "cn": {
            "selected": "已选择:",
            "day": "天",
            "days": "天",
            "apply": "确定",
            "week-1": "一",
            "week-2": "二",
            "week-3": "三",
            "week-4": "四",
            "week-5": "五",
            "week-6": "六",
            "week-7": "日",
            "week-number": "周",
            "month-name": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            "shortcuts": "快捷选择",
            "past": "过去",
            "following": "将来",
            "previous": "&nbsp;&nbsp;&nbsp;",
            "prev-week": "上周",
            "prev-month": "上个月",
            "prev-year": "去年",
            "next": "&nbsp;&nbsp;&nbsp;",
            "next-week": "下周",
            "next-month": "下个月",
            "next-year": "明年",
            "less-than": "所选日期范围不能大于%d天",
            "more-than": "所选日期范围不能小于%d天",
            "default-more": "请选择大于%d天的日期范围",
            "default-less": "请选择小于%d天的日期范围",
            "default-range": "请选择%d天到%d天的日期范围",
            "default-single": "请选择一个日期",
            "default-default": "请选择一个日期范围",
            "time": "时间",
            "hour": "小时",
            "minute": "分钟"
        },
        "cz": {
            "selected": "Vybráno:",
            "day": "Den",
            "days": "Dny",
            "apply": "Zavřít",
            "week-1": "po",
            "week-2": "út",
            "week-3": "st",
            "week-4": "čt",
            "week-5": "pá",
            "week-6": "so",
            "week-7": "ne",
            "month-name": ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"],
            "shortcuts": "Zkratky",
            "past": "po",
            "following": "následující",
            "previous": "předchozí",
            "prev-week": "týden",
            "prev-month": "měsíc",
            "prev-year": "rok",
            "next": "další",
            "next-week": "týden",
            "next-month": "měsíc",
            "next-year": "rok",
            "less-than": "Rozsah data by neměl být větší než %d dnů",
            "more-than": "Rozsah data by neměl být menší než %d dnů",
            "default-more": "Prosím zvolte rozsah data větší než %d dnů",
            "default-single": "Prosím zvolte datum",
            "default-less": "Prosím zvolte rozsah data menší než %d dnů",
            "default-range": "Prosím zvolte rozsah data mezi %d a %d dny",
            "default-default": "Prosím zvolte rozsah data"
        },
        "de": {
            "selected": "Auswahl:",
            "day": "Tag",
            "days": "Tage",
            "apply": "Schließen",
            "week-1": "mo",
            "week-2": "di",
            "week-3": "mi",
            "week-4": "do",
            "week-5": "fr",
            "week-6": "sa",
            "week-7": "so",
            "month-name": ["januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember"],
            "shortcuts": "Schnellwahl",
            "past": "Vorherige",
            "following": "Folgende",
            "previous": "Vorherige",
            "prev-week": "Woche",
            "prev-month": "Monat",
            "prev-year": "Jahr",
            "next": "Nächste",
            "next-week": "Woche",
            "next-month": "Monat",
            "next-year": "Jahr",
            "less-than": "Datumsbereich darf nicht größer sein als %d Tage",
            "more-than": "Datumsbereich darf nicht kleiner sein als %d Tage",
            "default-more": "Bitte mindestens %d Tage auswählen",
            "default-single": "Bitte ein Datum auswählen",
            "default-less": "Bitte weniger als %d Tage auswählen",
            "default-range": "Bitte einen Datumsbereich zwischen %d und %d Tagen auswählen",
            "default-default": "Bitte ein Start- und Enddatum auswählen",
            "Time": "Zeit",
            "hour": "Stunde",
            "minute": "Minute"
        },
        "es": {
            "selected": "Seleccionado:",
            "day": "Día",
            "days": "Días",
            "apply": "Cerrar",
            "week-1": "lu",
            "week-2": "ma",
            "week-3": "mi",
            "week-4": "ju",
            "week-5": "vi",
            "week-6": "sa",
            "week-7": "do",
            "month-name": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
            "shortcuts": "Accesos directos",
            "past": "Pasado",
            "following": "Siguiente",
            "previous": "Anterior",
            "prev-week": "Semana",
            "prev-month": "Mes",
            "prev-year": "Año",
            "next": "Siguiente",
            "next-week": "Semana",
            "next-month": "Mes",
            "next-year": "Año",
            "less-than": "El rango no debería ser mayor de %d días",
            "more-than": "El rango no debería ser menor de %d días",
            "default-more": "Por favor selecciona un rango mayor a %d días",
            "default-single": "Por favor selecciona un día",
            "default-less": "Por favor selecciona un rango menor a %d días",
            "default-range": "Por favor selecciona un rango entre %d y %d días",
            "default-default": "Por favor selecciona un rango de fechas."
        },
        "fr": {
            "selected": "Sélection:",
            "day": "Jour",
            "days": "Jours",
            "apply": "Fermer",
            "week-1": "lu",
            "week-2": "ma",
            "week-3": "me",
            "week-4": "je",
            "week-5": "ve",
            "week-6": "sa",
            "week-7": "di",
            "month-name": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
            "shortcuts": "Raccourcis",
            "past": "Passé",
            "following": "Suivant",
            "previous": "Précédent",
            "prev-week": "Semaine",
            "prev-month": "Mois",
            "prev-year": "Année",
            "next": "Suivant",
            "next-week": "Semaine",
            "next-month": "Mois",
            "next-year": "Année",
            "less-than": "L'intervalle ne doit pas être supérieure à %d jours",
            "more-than": "L'intervalle ne doit pas être inférieure à %d jours",
            "default-more": "Merci de choisir une intervalle supérieure à %d jours",
            "default-single": "Merci de choisir une date",
            "default-less": "Merci de choisir une intervalle inférieure %d jours",
            "default-range": "Merci de choisir une intervalle comprise entre %d et %d jours",
            "default-default": "Merci de choisir une date"
        },
        "hu": {
            "selected": "Kiválasztva:",
            "day": "Nap",
            "days": "Nap",
            "apply": "Ok",
            "week-1": "h",
            "week-2": "k",
            "week-3": "sz",
            "week-4": "cs",
            "week-5": "p",
            "week-6": "sz",
            "week-7": "v",
            "month-name": ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"],
            "shortcuts": "Gyorsválasztó",
            "past": "Múlt",
            "following": "Következő",
            "previous": "Előző",
            "prev-week": "Hét",
            "prev-month": "Hónap",
            "prev-year": "Év",
            "next": "Következő",
            "next-week": "Hét",
            "next-month": "Hónap",
            "next-year": "Év",
            "less-than": "A kiválasztás nem lehet több %d napnál",
            "more-than": "A kiválasztás nem lehet több %d napnál",
            "default-more": "Válassz ki egy időszakot ami hosszabb mint %d nap",
            "default-single": "Válassz egy napot",
            "default-less": "Válassz ki egy időszakot ami rövidebb mint %d nap",
            "default-range": "Válassz ki egy %d - %d nap hosszú időszakot",
            "default-default": "Válassz ki egy időszakot"
        },
        "it": {
            "selected": "Selezionati:",
            "day": "Giorno",
            "days": "Giorni",
            "apply": "Chiudi",
            "week-1": "lu",
            "week-2": "ma",
            "week-3": "me",
            "week-4": "gi",
            "week-5": "ve",
            "week-6": "sa",
            "week-7": "do",
            "month-name": ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
            "shortcuts": "Scorciatoie",
            "past": "Scorso",
            "following": "Successivo",
            "previous": "Precedente",
            "prev-week": "Settimana",
            "prev-month": "Mese",
            "prev-year": "Anno",
            "next": "Prossimo",
            "next-week": "Settimana",
            "next-month": "Mese",
            "next-year": "Anno",
            "less-than": "L'intervallo non dev'essere maggiore di %d giorni",
            "more-than": "L'intervallo non dev'essere minore di %d giorni",
            "default-more": "Seleziona un intervallo maggiore di %d giorni",
            "default-single": "Seleziona una data",
            "default-less": "Seleziona un intervallo minore di %d giorni",
            "default-range": "Seleziona un intervallo compreso tra i %d e i %d giorni",
            "default-default": "Seleziona un intervallo di date"
        },
        "ko": {
            "selected": "기간:",
            "day": "일",
            "days": "일간",
            "apply": "닫기",
            "week-1": "월",
            "week-2": "화",
            "week-3": "수",
            "week-4": "목",
            "week-5": "금",
            "week-6": "토",
            "week-7": "일",
            "week-number": "주",
            "month-name": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            "shortcuts": "단축키들",
            "past": "지난(오늘기준)",
            "following": "이후(오늘기준)",
            "previous": "이전",
            "prev-week": "1주",
            "prev-month": "1달",
            "prev-year": "1년",
            "next": "다음",
            "next-week": "1주",
            "next-month": "1달",
            "next-year": "1년",
            "less-than": "날짜 범위는 %d 일보다 많을 수 없습니다",
            "more-than": "날짜 범위는 %d 일보다 작을 수 없습니다",
            "default-more": "날짜 범위를 %d 일보다 길게 선택해 주세요",
            "default-single": "날짜를 선택해 주세요",
            "default-less": "%d 일보다 작은 날짜를 선택해 주세요",
            "default-range": "%d와 %d 일 사이의 날짜 범위를 선택해 주세요",
            "default-default": "날짜 범위를 선택해 주세요",
            "time": "시각",
            "hour": "시",
            "minute": "분"
        },
        "no": {
            "selected": "Valgt:",
            "day": "Dag",
            "days": "Dager",
            "apply": "Lukk",
            "week-1": "ma",
            "week-2": "ti",
            "week-3": "on",
            "week-4": "to",
            "week-5": "fr",
            "week-6": "lø",
            "week-7": "sø",
            "month-name": ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"],
            "shortcuts": "Snarveier",
            "custom-values": "Egendefinerte Verdier",
            "past": "Over",
            "following": "Følger",
            "previous": "Forrige",
            "prev-week": "Uke",
            "prev-month": "Måned",
            "prev-year": "År",
            "next": "Neste",
            "next-week": "Uke",
            "next-month": "Måned",
            "next-year": "År",
            "less-than": "Datoperioden skal ikkje være lengre enn %d dager",
            "more-than": "Datoperioden skal ikkje være kortere enn %d dager",
            "default-more": "Vennligst velg ein datoperiode lengre enn %d dager",
            "default-single": "Vennligst velg ein dato",
            "default-less": "Vennligst velg ein datoperiode mindre enn %d dager",
            "default-range": "Vennligst velg ein datoperiode mellom %d og %d dager",
            "default-default": "Vennligst velg ein datoperiode",
            "time": "Tid",
            "hour": "Time",
            "minute": "Minutter"
        },
        "nl": {
            "selected": "Geselecteerd:",
            "day": "Dag",
            "days": "Dagen",
            "apply": "Ok",
            "week-1": "ma",
            "week-2": "di",
            "week-3": "wo",
            "week-4": "do",
            "week-5": "vr",
            "week-6": "za",
            "week-7": "zo",
            "month-name": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
            "shortcuts": "Snelkoppelingen",
            "custom-values": "Aangepaste waarden",
            "past": "Verleden",
            "following": "Komend",
            "previous": "Vorige",
            "prev-week": "Week",
            "prev-month": "Maand",
            "prev-year": "Jaar",
            "next": "Volgende",
            "next-week": "Week",
            "next-month": "Maand",
            "next-year": "Jaar",
            "less-than": "Interval moet langer dan %d dagen zijn",
            "more-than": "Interval mag niet minder dan %d dagen zijn",
            "default-more": "Selecteer een interval langer dan %dagen",
            "default-single": "Selecteer een datum",
            "default-less": "Selecteer een interval minder dan %d dagen",
            "default-range": "Selecteer een interval tussen %d en %d dagen",
            "default-default": "Selecteer een interval",
            "time": "Tijd",
            "hour": "Uur",
            "minute": "Minuut"
        },
        "ru": {
            "selected": "Выбрано:",
            "day": "День",
            "days": "Дней",
            "apply": "Применить",
            "week-1": "пн",
            "week-2": "вт",
            "week-3": "ср",
            "week-4": "чт",
            "week-5": "пт",
            "week-6": "сб",
            "week-7": "вс",
            "month-name": ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
            "shortcuts": "Быстрый выбор",
            "custom-values": "Пользовательские значения",
            "past": "Прошедшие",
            "following": "Следующие",
            "previous": "&nbsp;&nbsp;&nbsp;",
            "prev-week": "Неделя",
            "prev-month": "Месяц",
            "prev-year": "Год",
            "next": "&nbsp;&nbsp;&nbsp;",
            "next-week": "Неделя",
            "next-month": "Месяц",
            "next-year": "Год",
            "less-than": "Диапазон не может быть больше %d дней",
            "more-than": "Диапазон не может быть меньше %d дней",
            "default-more": "Пожалуйста выберите диапазон больше %d дней",
            "default-single": "Пожалуйста выберите дату",
            "default-less": "Пожалуйста выберите диапазон меньше %d дней",
            "default-range": "Пожалуйста выберите диапазон между %d и %d днями",
            "default-default": "Пожалуйста выберите диапазон",
            "time": "Время",
            "hour": "Часы",
            "minute": "Минуты"
        },
        "pl": {
            "selected": "Wybrany:",
            "day": "Dzień",
            "days": "Dni",
            "apply": "Zamknij",
            "week-1": "pon",
            "week-2": "wt",
            "week-3": "śr",
            "week-4": "czw",
            "week-5": "pt",
            "week-6": "so",
            "week-7": "nd",
            "month-name": ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"],
            "shortcuts": "Skróty",
            "custom-values": "Niestandardowe wartości",
            "past": "Przeszłe",
            "following": "Następne",
            "previous": "Poprzednie",
            "prev-week": "tydzień",
            "prev-month": "miesiąc",
            "prev-year": "rok",
            "next": "Następny",
            "next-week": "tydzień",
            "next-month": "miesiąc",
            "next-year": "rok",
            "less-than": "Okres nie powinien być dłuższy niż %d dni",
            "more-than": "Okres nie powinien być krótszy niż  %d ni",
            "default-more": "Wybierz okres dłuższy niż %d dni",
            "default-single": "Wybierz datę",
            "default-less": "Wybierz okres krótszy niż %d dni",
            "default-range": "Wybierz okres trwający od %d do %d dni",
            "default-default": "Wybierz okres",
            "time": "Czas",
            "hour": "Godzina",
            "minute": "Minuta"
        },
        "se": {
            "selected": "Vald:",
            "day": "dag",
            "days": "dagar",
            "apply": "godkänn",
            "week-1": "ma",
            "week-2": "ti",
            "week-3": "on",
            "week-4": "to",
            "week-5": "fr",
            "week-6": "lö",
            "week-7": "sö",
            "month-name": ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"],
            "shortcuts": "genvägar",
            "custom-values": "Anpassade värden",
            "past": "över",
            "following": "följande",
            "previous": "förra",
            "prev-week": "vecka",
            "prev-month": "månad",
            "prev-year": "år",
            "next": "nästa",
            "next-week": "vecka",
            "next-month": "måned",
            "next-year": "år",
            "less-than": "Datumintervall bör inte vara mindre än %d dagar",
            "more-than": "Datumintervall bör inte vara mer än %d dagar",
            "default-more": "Välj ett datumintervall längre än %d dagar",
            "default-single": "Välj ett datum",
            "default-less": "Välj ett datumintervall mindre än %d dagar",
            "default-range": "Välj ett datumintervall mellan %d och %d dagar",
            "default-default": "Välj ett datumintervall",
            "time": "tid",
            "hour": "timme",
            "minute": "minut"
        },
        "pt": {
            "selected": "Selecionado:",
            "day": "Dia",
            "days": "Dias",
            "apply": "Fechar",
            "week-1": "seg",
            "week-2": "ter",
            "week-3": "qua",
            "week-4": "qui",
            "week-5": "sex",
            "week-6": "sab",
            "week-7": "dom",
            "week-number": "N",
            "month-name": ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
            "shortcuts": "Atalhos",
            "custom-values": "Valores Personalizados",
            "past": "Passado",
            "following": "Seguinte",
            "previous": "Anterior",
            "prev-week": "Semana",
            "prev-month": "Mês",
            "prev-year": "Ano",
            "next": "Próximo",
            "next-week": "Próxima Semana",
            "next-month": "Próximo Mês",
            "next-year": "Próximo Ano",
            "less-than": "O período selecionado não deve ser maior que %d dias",
            "more-than": "O período selecionado não deve ser menor que %d dias",
            "default-more": "Selecione um período superior a %d dias",
            "default-single": "Selecione uma data",
            "default-less": "Selecione um período inferior a %d dias",
            "default-range": "Selecione um período de %d a %d dias",
            "default-default": "Selecione um período",
            "time": "Tempo",
            "hour": "Hora",
            "minute": "Minuto"
        },
        "tc": {
            "selected": "已選擇:",
            "day": "天",
            "days": "天",
            "apply": "確定",
            "week-1": "一",
            "week-2": "二",
            "week-3": "三",
            "week-4": "四",
            "week-5": "五",
            "week-6": "六",
            "week-7": "日",
            "week-number": "周",
            "month-name": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            "shortcuts": "快速選擇",
            "past": "過去",
            "following": "將來",
            "previous": "&nbsp;&nbsp;&nbsp;",
            "prev-week": "上週",
            "prev-month": "上個月",
            "prev-year": "去年",
            "next": "&nbsp;&nbsp;&nbsp;",
            "next-week": "下周",
            "next-month": "下個月",
            "next-year": "明年",
            "less-than": "所選日期範圍不能大於%d天",
            "more-than": "所選日期範圍不能小於%d天",
            "default-more": "請選擇大於%d天的日期範圍",
            "default-less": "請選擇小於%d天的日期範圍",
            "default-range": "請選擇%d天到%d天的日期範圍",
            "default-single": "請選擇一個日期",
            "default-default": "請選擇一個日期範圍",
            "time": "日期",
            "hour": "小時",
            "minute": "分鐘"
        },
        "ja": {
            "selected": "選択しました:",
            "day": "日",
            "days": "日々",
            "apply": "閉じる",
            "week-1": "月",
            "week-2": "火",
            "week-3": "水",
            "week-4": "木",
            "week-5": "金",
            "week-6": "土",
            "week-7": "日",
            "month-name": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            "shortcuts": "クイック選択",
            "past": "過去",
            "following": "将来",
            "previous": "&nbsp;&nbsp;&nbsp;",
            "prev-week": "先週、",
            "prev-month": "先月",
            "prev-year": "昨年",
            "next": "&nbsp;&nbsp;&nbsp;",
            "next-week": "来週",
            "next-month": "来月",
            "next-year": "来年",
            "less-than": "日付の範囲は ％d 日以上にすべきではありません",
            "more-than": "日付の範囲は ％d 日を下回ってはいけません",
            "default-more": "％d 日よりも長い期間を選択してください",
            "default-less": "％d 日未満の期間を選択してください",
            "default-range": "％d と％ d日の間の日付範囲を選択してください",
            "default-single": "日付を選択してください",
            "default-default": "日付範囲を選択してください",
            "time": "時間",
            "hour": "時間",
            "minute": "分"
        },
        "da": {
            "selected": "Valgt:",
            "day": "Dag",
            "days": "Dage",
            "apply": "Luk",
            "week-1": "ma",
            "week-2": "ti",
            "week-3": "on",
            "week-4": "to",
            "week-5": "fr",
            "week-6": "lö",
            "week-7": "sö",
            "month-name": ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
            "shortcuts": "genveje",
            "custom-values": "Brugerdefinerede værdier",
            "past": "Forbi",
            "following": "Følgende",
            "previous": "Forrige",
            "prev-week": "uge",
            "prev-month": "månad",
            "prev-year": "år",
            "next": "Næste",
            "next-week": "Næste uge",
            "next-month": "Næste måned",
            "next-year": "Næste år",
            "less-than": "Dato interval bør ikke være med end %d dage",
            "more-than": "Dato interval bør ikke være mindre end %d dage",
            "default-more": "Vælg datointerval længere end %d dage",
            "default-single": "Vælg dato",
            "default-less": "Vælg datointerval mindre end %d dage",
            "default-range": "Vælg datointerval mellem %d og %d dage",
            "default-default": "Vælg datointerval",
            "time": "tid",
            "hour": "time",
            "minute": "minut"
        },
        "fi": {
            "selected": "Valittu:",
            "day": "Päivä",
            "days": "Päivää",
            "apply": "Sulje",
            "week-1": "ma",
            "week-2": "ti",
            "week-3": "ke",
            "week-4": "to",
            "week-5": "pe",
            "week-6": "la",
            "week-7": "su",
            "week-number": "V",
            "month-name": ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
            "shortcuts": "Pikavalinnat",
            "custom-values": "Mukautetut Arvot",
            "past": "Menneet",
            "following": "Tulevat",
            "previous": "Edellinen",
            "prev-week": "Viikko",
            "prev-month": "Kuukausi",
            "prev-year": "Vuosi",
            "next": "Seuraava",
            "next-week": "Viikko",
            "next-month": "Kuukausi",
            "next-year": "Vuosi",
            "less-than": "Aikajakson tulisi olla vähemmän kuin %d päivää",
            "more-than": "Aikajakson ei tulisi olla vähempää kuin %d päivää",
            "default-more": "Valitse pidempi aikajakso kuin %d päivää",
            "default-single": "Valitse päivä",
            "default-less": "Valitse lyhyempi aikajakso kuin %d päivää",
            "default-range": "Valitse aikajakso %d ja %d päivän väliltä",
            "default-default": "Valitse aikajakso",
            "time": "Aika",
            "hour": "Tunti",
            "minute": "Minuutti"
        },
        "cat": {
            "selected": "Seleccionats:",
            "day": "Dia",
            "days": "Dies",
            "apply": "Tanca",
            "week-1": "Dl",
            "week-2": "Dm",
            "week-3": "Dc",
            "week-4": "Dj",
            "week-5": "Dv",
            "week-6": "Ds",
            "week-7": "Dg",
            "week-number": "S",
            "month-name": ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
            "shortcuts": "Dreçeres",
            "custom-values": "Valors personalitzats",
            "past": "Passat",
            "following": "Futur",
            "previous": "Anterior",
            "prev-week": "Setmana",
            "prev-month": "Mes",
            "prev-year": "Any",
            "next": "Següent",
            "next-week": "Setmana",
            "next-month": "Mes",
            "next-year": "Any",
            "less-than": "El període no hauria de ser de més de %d dies",
            "more-than": "El període no hauria de ser de menys de %d dies",
            "default-more": "Perfavor selecciona un període més gran de %d dies",
            "default-single": "Perfavor selecciona una data",
            "default-less": "Perfavor selecciona un període de menys de %d dies",
            "default-range": "Perfavor selecciona un període d'entre %d i %d dies",
            "default-default": "Perfavor selecciona un període",
            "time": "Temps",
            "hour": "Hora",
            "minute": "Minut"
        }
    };
    $.fn.dateRangePicker = function(opt) {
        if (!opt) opt = {};
        opt = $.extend(true, {
            autoClose: false,
            format: 'YYYY-MM-DD',
            separator: ' to ',
            language: 'auto',
            startOfWeek: 'sunday',
            getValue: function() {
                return $(this).val();
            },
            setValue: function(s) {
                if (!$(this).attr('readonly') && !$(this).is(':disabled') && s != $(this).val()) {
                    $(this).val(s);
                }
            },
            startDate: false,
            endDate: false,
            time: {
                enabled: false
            },
            minDays: 0,
            maxDays: 0,
            showShortcuts: false,
            shortcuts: {},
            customShortcuts: [],
            inline: false,
            container: 'body',
            alwaysOpen: false,
            singleDate: false,
            lookBehind: false,
            batchMode: false,
            duration: 200,
            stickyMonths: false,
            dayDivAttrs: [],
            dayTdAttrs: [],
            selectForward: false,
            selectBackward: false,
            applyBtnClass: '',
            singleMonth: 'auto',
            hoveringTooltip: function(days, startTime, hoveringTime) {
                return days > 1 ? days + ' ' + translate('days') : '';
            },
            showTopbar: true,
            swapTime: false,
            showWeekNumbers: false,
            getWeekNumber: function(date) {
                return moment(date).format('w');
            },
            customOpenAnimation: null,
            customCloseAnimation: null,
            customArrowPrevSymbol: null,
            customArrowNextSymbol: null
        }, opt);
        opt.start = false;
        opt.end = false;
        opt.startWeek = false;
        opt.isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;
        if (opt.isTouchDevice) opt.hoveringTooltip = false;
        if (opt.singleMonth == 'auto') opt.singleMonth = $(window).width() < 480;
        if (opt.singleMonth) opt.stickyMonths = false;
        if (!opt.showTopbar) opt.autoClose = true;
        if (opt.startDate && typeof opt.startDate == 'string') opt.startDate = moment(opt.startDate, opt.format).toDate();
        if (opt.endDate && typeof opt.endDate == 'string') opt.endDate = moment(opt.endDate, opt.format).toDate();
        var languages = getLanguages();
        var box;
        var initiated = false;
        var self = this;
        var selfDom = $(self).get(0);
        var domChangeTimer;
        $(this).unbind('.datepicker').bind('click.datepicker', function(evt) {
            var isOpen = box.is(':visible');
            if (!isOpen) open(opt.duration);
        }).bind('change.datepicker', function(evt) {
            checkAndSetDefaultValue();
        }).bind('keyup.datepicker', function() {
            try {
                clearTimeout(domChangeTimer);
            } catch (e) {}
            domChangeTimer = setTimeout(function() {
                checkAndSetDefaultValue();
            }, 2000);
        });
        init_datepicker.call(this);
        if (opt.alwaysOpen) {
            open(0);
        }
        $(this).data('dateRangePicker', {
            setStart: function(d1) {
                if (typeof d1 == 'string') {
                    d1 = moment(d1, opt.format).toDate();
                }
                opt.end = false;
                setSingleDate(d1);
                return this;
            },
            setEnd: function(d2, silent) {
                var start = new Date();
                start.setTime(opt.start);
                if (typeof d2 == 'string') {
                    d2 = moment(d2, opt.format).toDate();
                }
                setDateRange(start, d2, silent);
                return this;
            },
            setDateRange: function(d1, d2, silent) {
                if (typeof d1 == 'string' && typeof d2 == 'string') {
                    d1 = moment(d1, opt.format).toDate();
                    d2 = moment(d2, opt.format).toDate();
                }
                setDateRange(d1, d2, silent);
            },
            clear: clearSelection,
            close: closeDatePicker,
            open: open,
            redraw: redrawDatePicker,
            getDatePicker: getDatePicker,
            resetMonthsView: resetMonthsView,
            destroy: function() {
                $(self).unbind('.datepicker');
                $(self).data('dateRangePicker', '');
                $(self).data('date-picker-opened', null);
                box.remove();
                $(window).unbind('resize.datepicker', calcPosition);
                $(document).unbind('click.datepicker', closeDatePicker);
            }
        });
        $(window).bind('resize.datepicker', calcPosition);
        return this;

        function IsOwnDatePickerClicked(evt, selfObj) {
            return (selfObj.contains(evt.target) || evt.target == selfObj || (selfObj.childNodes != undefined && $.inArray(evt.target, selfObj.childNodes) >= 0));
        }

        function init_datepicker() {
            var self = this;
            if ($(this).data('date-picker-opened')) {
                closeDatePicker();
                return;
            }
            $(this).data('date-picker-opened', true);
            box = createDom().hide();
            box.append('<div class="date-range-length-tip"></div>');
            $(opt.container).append(box);
            if (!opt.inline) {
                calcPosition();
            } else {
                box.addClass('inline-wrapper');
            }
            if (opt.alwaysOpen) {
                box.find('.apply-btn').hide();
            }
            var defaultTime = getDefaultTime();
            resetMonthsView(defaultTime);
            if (opt.time.enabled) {
                if ((opt.startDate && opt.endDate) || (opt.start && opt.end)) {
                    showTime(moment(opt.start || opt.startDate).toDate(), 'time1');
                    showTime(moment(opt.end || opt.endDate).toDate(), 'time2');
                } else {
                    var defaultEndTime = opt.defaultEndTime ? opt.defaultEndTime : defaultTime;
                    showTime(defaultTime, 'time1');
                    showTime(defaultEndTime, 'time2');
                }
            }
            var defaultTopText = '';
            if (opt.singleDate)
                defaultTopText = translate('default-single');
            else if (opt.minDays && opt.maxDays)
                defaultTopText = translate('default-range');
            else if (opt.minDays)
                defaultTopText = translate('default-more');
            else if (opt.maxDays)
                defaultTopText = translate('default-less');
            else
                defaultTopText = translate('default-default');
            box.find('.default-top').html(defaultTopText.replace(/\%d/, opt.minDays).replace(/\%d/, opt.maxDays));
            if (opt.singleMonth == 'all') {
                box.addClass('all-months');
            }
            if (opt.singleMonth) {
                box.addClass('single-month');
            } else {
                box.addClass('two-months');
            }
            setTimeout(function() {
                updateCalendarWidth();
                initiated = true;
            }, 0);
            box.click(function(evt) {
                evt.stopPropagation();
            });
            $(document).bind('click.datepicker', function(evt) {
                if (!IsOwnDatePickerClicked(evt, self[0])) {
                    if (box.is(':visible')) closeDatePicker();
                }
            });
            box.find('.next').click(function() {
                if (!opt.stickyMonths)
                    gotoNextMonth(this);
                else
                    gotoNextMonth_stickily(this);
            });

            function gotoNextMonth(self) {
                var isMonth2 = $(self).parents('table').hasClass('month2');
                var month = isMonth2 ? opt.month2 : opt.month1;
                month = nextMonth(month);
                if (!opt.singleMonth && !opt.singleDate && !isMonth2 && compare_month(month, opt.month2) >= 0 || isMonthOutOfBounds(month)) return;
                showMonth(month, isMonth2 ? 'month2' : 'month1');
                showGap();
            }

            function gotoNextMonth_stickily(self) {
                var nextMonth1 = nextMonth(opt.month1);
                var nextMonth2 = nextMonth(opt.month2);
                if (isMonthOutOfBounds(nextMonth2)) return;
                if (!opt.singleDate && compare_month(nextMonth1, nextMonth2) >= 0) return;
                showMonth(nextMonth1, 'month1');
                showMonth(nextMonth2, 'month2');
                showSelectedDays();
            }
            box.find('.prev').click(function() {
                if (!opt.stickyMonths)
                    gotoPrevMonth(this);
                else
                    gotoPrevMonth_stickily(this);
            });

            function gotoPrevMonth(self) {
                var isMonth2 = $(self).parents('table').hasClass('month2');
                var month = isMonth2 ? opt.month2 : opt.month1;
                month = prevMonth(month);
                if (isMonth2 && compare_month(month, opt.month1) <= 0 || isMonthOutOfBounds(month)) return;
                showMonth(month, isMonth2 ? 'month2' : 'month1');
                showGap();
            }

            function gotoPrevMonth_stickily(self) {
                var prevMonth1 = prevMonth(opt.month1);
                var prevMonth2 = prevMonth(opt.month2);
                if (isMonthOutOfBounds(prevMonth1)) return;
                if (!opt.singleDate && compare_month(prevMonth2, prevMonth1) <= 0) return;
                showMonth(prevMonth2, 'month2');
                showMonth(prevMonth1, 'month1');
                showSelectedDays();
            }
            box.attr('unselectable', 'on').css('user-select', 'none').bind('selectstart', function(e) {
                e.preventDefault();
                return false;
            });
            box.find('.apply-btn').click(function() {
                closeDatePicker();
                var dateRange = getDateString(new Date(opt.start)) + opt.separator + getDateString(new Date(opt.end));
                $(self).trigger('datepicker-apply', {
                    'value': dateRange,
                    'date1': new Date(opt.start),
                    'date2': new Date(opt.end)
                });
            });
            box.find('[custom]').click(function() {
                var valueName = $(this).attr('custom');
                opt.start = false;
                opt.end = false;
                box.find('.day.checked').removeClass('checked');
                opt.setValue.call(selfDom, valueName);
                checkSelectionValid();
                showSelectedInfo(true);
                showSelectedDays();
                if (opt.autoClose) closeDatePicker();
            });
            box.find('[shortcut]').click(function() {
                var shortcut = $(this).attr('shortcut');
                var end = new Date(),
                    start = false;
                var dir;
                if (shortcut.indexOf('day') != -1) {
                    var day = parseInt(shortcut.split(',', 2)[1], 10);
                    start = new Date(new Date().getTime() + 86400000 * day);
                    end = new Date(end.getTime() + 86400000 * (day > 0 ? 1 : -1));
                } else if (shortcut.indexOf('week') != -1) {
                    dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;
                    var stopDay;
                    if (dir == 1)
                        stopDay = opt.startOfWeek == 'monday' ? 1 : 0;
                    else
                        stopDay = opt.startOfWeek == 'monday' ? 0 : 6;
                    end = new Date(end.getTime() - 86400000);
                    while (end.getDay() != stopDay) end = new Date(end.getTime() + dir * 86400000);
                    start = new Date(end.getTime() + dir * 86400000 * 6);
                } else if (shortcut.indexOf('month') != -1) {
                    dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;
                    if (dir == 1)
                        start = nextMonth(end);
                    else
                        start = prevMonth(end);
                    start.setDate(1);
                    end = nextMonth(start);
                    end.setDate(1);
                    end = new Date(end.getTime() - 86400000);
                } else if (shortcut.indexOf('year') != -1) {
                    dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;
                    start = new Date();
                    start.setFullYear(end.getFullYear() + dir);
                    start.setMonth(0);
                    start.setDate(1);
                    end.setFullYear(end.getFullYear() + dir);
                    end.setMonth(11);
                    end.setDate(31);
                } else if (shortcut == 'custom') {
                    var name = $(this).html();
                    if (opt.customShortcuts && opt.customShortcuts.length > 0) {
                        for (var i = 0; i < opt.customShortcuts.length; i++) {
                            var sh = opt.customShortcuts[i];
                            if (sh.name == name) {
                                var data = [];
                                data = sh['dates'].call();
                                if (data && data.length == 2) {
                                    start = data[0];
                                    end = data[1];
                                }
                                if (data && data.length == 1) {
                                    var movetodate = data[0];
                                    showMonth(movetodate, 'month1');
                                    showMonth(nextMonth(movetodate), 'month2');
                                    showGap();
                                }
                                break;
                            }
                        }
                    }
                }
                if (start && end) {
                    setDateRange(start, end);
                    checkSelectionValid();
                }
            });
            box.find('.time1 input[type=range]').bind('change touchmove', function(e) {
                var target = e.target,
                    hour = target.name == 'hour' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined,
                    min = target.name == 'minute' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined;
                setTime('time1', hour, min);
            });
            box.find('.time2 input[type=range]').bind('change touchmove', function(e) {
                var target = e.target,
                    hour = target.name == 'hour' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined,
                    min = target.name == 'minute' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined;
                setTime('time2', hour, min);
            });
        }

        function calcPosition() {
            if (!opt.inline) {
                var offset = $(self).offset();
                if ($(opt.container).css('position') == 'relative') {
                    var containerOffset = $(opt.container).offset();
                    box.css({
                        top: offset.top - containerOffset.top + $(self).outerHeight() + 4,
                        left: offset.left - containerOffset.left
                    });
                } else {
                    if (offset.left < 460) {
                        box.css({
                            top: offset.top + $(self).outerHeight() + parseInt($('body').css('border-top') || 0, 10),
                            left: offset.left
                        });
                    } else {
                        box.css({
                            top: offset.top + $(self).outerHeight() + parseInt($('body').css('border-top') || 0, 10),
                            left: offset.left + $(self).width() - box.width() - 16
                        });
                    }
                }
            }
        }

        function getDatePicker() {
            return box;
        }

        function open(animationTime) {
            calcPosition();
            redrawDatePicker();
            checkAndSetDefaultValue();
            if (opt.customOpenAnimation) {
                opt.customOpenAnimation.call(box.get(0), function() {
                    $(self).trigger('datepicker-opened', {
                        relatedTarget: box
                    });
                });
            } else {
                box.slideDown(animationTime, function() {
                    $(self).trigger('datepicker-opened', {
                        relatedTarget: box
                    });
                });
            }
            $(self).trigger('datepicker-open', {
                relatedTarget: box
            });
            showGap();
            updateCalendarWidth();
        }

        function checkAndSetDefaultValue() {
            var __default_string = opt.getValue.call(selfDom);
            var defaults = __default_string ? __default_string.split(opt.separator) : '';
            if (defaults && ((defaults.length == 1 && opt.singleDate) || defaults.length >= 2)) {
                var ___format = opt.format;
                if (___format.match(/Do/)) {
                    ___format = ___format.replace(/Do/, 'D');
                    defaults[0] = defaults[0].replace(/(\d+)(th|nd|st)/, '$1');
                    if (defaults.length >= 2) {
                        defaults[1] = defaults[1].replace(/(\d+)(th|nd|st)/, '$1');
                    }
                }
                initiated = false;
                if (defaults.length >= 2) {
                    setDateRange(getValidValue(defaults[0], ___format, moment.locale(opt.language)), getValidValue(defaults[1], ___format, moment.locale(opt.language)));
                } else if (defaults.length == 1 && opt.singleDate) {
                    setSingleDate(getValidValue(defaults[0], ___format, moment.locale(opt.language)));
                }
                initiated = true;
            }
        }

        function getValidValue(date, format, locale) {
            if (moment(date, format, locale).isValid()) {
                return moment(date, format, locale).toDate();
            } else {
                return moment().toDate();
            }
        }

        function updateCalendarWidth() {
            var gapMargin = box.find('.gap').css('margin-left');
            if (gapMargin) gapMargin = parseInt(gapMargin);
            var w1 = box.find('.month1').width();
            var w2 = box.find('.gap').width() + (gapMargin ? gapMargin * 2 : 0);
            var w3 = box.find('.month2').width();
            box.find('.month-wrapper').width(w1 + w2 + w3);
        }

        function renderTime(name, date) {
            box.find('.' + name + ' input[type=range].hour-range').val(moment(date).hours());
            box.find('.' + name + ' input[type=range].minute-range').val(moment(date).minutes());
            setTime(name, moment(date).format('HH'), moment(date).format('mm'));
        }

        function changeTime(name, date) {
            opt[name] = parseInt(moment(parseInt(date)).startOf('day').add(moment(opt[name + 'Time']).format('HH'), 'h').add(moment(opt[name + 'Time']).format('mm'), 'm').valueOf());
        }

        function swapTime() {
            renderTime('time1', opt.start);
            renderTime('time2', opt.end);
        }

        function setTime(name, hour, minute) {
            hour && (box.find('.' + name + ' .hour-val').text(hour));
            minute && (box.find('.' + name + ' .minute-val').text(minute));
            switch (name) {
                case 'time1':
                    if (opt.start) {
                        setRange('start', moment(opt.start));
                    }
                    setRange('startTime', moment(opt.startTime || moment().valueOf()));
                    break;
                case 'time2':
                    if (opt.end) {
                        setRange('end', moment(opt.end));
                    }
                    setRange('endTime', moment(opt.endTime || moment().valueOf()));
                    break;
            }

            function setRange(name, timePoint) {
                var h = timePoint.format('HH'),
                    m = timePoint.format('mm');
                opt[name] = timePoint.startOf('day').add(hour || h, 'h').add(minute || m, 'm').valueOf();
            }
            checkSelectionValid();
            showSelectedInfo();
            showSelectedDays();
        }

        function clearSelection() {
            opt.start = false;
            opt.end = false;
            box.find('.day.checked').removeClass('checked');
            box.find('.day.last-date-selected').removeClass('last-date-selected');
            box.find('.day.first-date-selected').removeClass('first-date-selected');
            opt.setValue.call(selfDom, '');
            checkSelectionValid();
            showSelectedInfo();
            showSelectedDays();
        }

        function handleStart(time) {
            var r = time;
            if (opt.batchMode === 'week-range') {
                if (opt.startOfWeek === 'monday') {
                    r = moment(parseInt(time)).startOf('isoweek').valueOf();
                } else {
                    r = moment(parseInt(time)).startOf('week').valueOf();
                }
            } else if (opt.batchMode === 'month-range') {
                r = moment(parseInt(time)).startOf('month').valueOf();
            }
            return r;
        }

        function handleEnd(time) {
            var r = time;
            if (opt.batchMode === 'week-range') {
                if (opt.startOfWeek === 'monday') {
                    r = moment(parseInt(time)).endOf('isoweek').valueOf();
                } else {
                    r = moment(parseInt(time)).endOf('week').valueOf();
                }
            } else if (opt.batchMode === 'month-range') {
                r = moment(parseInt(time)).endOf('month').valueOf();
            }
            return r;
        }

        function dayClicked(day) {
            if (day.hasClass('invalid')) return;
            var time = day.attr('time');
            day.addClass('checked');
            if (opt.singleDate) {
                opt.start = time;
                opt.end = false;
            } else if (opt.batchMode === 'week') {
                if (opt.startOfWeek === 'monday') {
                    opt.start = moment(parseInt(time)).startOf('isoweek').valueOf();
                    opt.end = moment(parseInt(time)).endOf('isoweek').valueOf();
                } else {
                    opt.end = moment(parseInt(time)).endOf('week').valueOf();
                    opt.start = moment(parseInt(time)).startOf('week').valueOf();
                }
            } else if (opt.batchMode === 'workweek') {
                opt.start = moment(parseInt(time)).day(1).valueOf();
                opt.end = moment(parseInt(time)).day(5).valueOf();
            } else if (opt.batchMode === 'weekend') {
                opt.start = moment(parseInt(time)).day(6).valueOf();
                opt.end = moment(parseInt(time)).day(7).valueOf();
            } else if (opt.batchMode === 'month') {
                opt.start = moment(parseInt(time)).startOf('month').valueOf();
                opt.end = moment(parseInt(time)).endOf('month').valueOf();
            } else if ((opt.start && opt.end) || (!opt.start && !opt.end)) {
                opt.start = handleStart(time);
                opt.end = false;
            } else if (opt.start) {
                opt.end = handleEnd(time);
                if (opt.time.enabled) {
                    changeTime('end', opt.end);
                }
            }
            if (opt.time.enabled) {
                if (opt.start) {
                    changeTime('start', opt.start);
                }
                if (opt.end) {
                    changeTime('end', opt.end);
                }
            }
            if (!opt.singleDate && opt.start && opt.end && opt.start > opt.end) {
                var tmp = opt.end;
                opt.end = handleEnd(opt.start);
                opt.start = handleStart(tmp);
                if (opt.time.enabled && opt.swapTime) {
                    swapTime();
                }
            }
            opt.start = parseInt(opt.start);
            opt.end = parseInt(opt.end);
            clearHovering();
            if (opt.start && !opt.end) {
                $(self).trigger('datepicker-first-date-selected', {
                    'date1': new Date(opt.start)
                });
                dayHovering(day);
            }
            updateSelectableRange(time);
            checkSelectionValid();
            showSelectedInfo();
            showSelectedDays();
            autoclose();
        }

        function weekNumberClicked(weekNumberDom) {
            var thisTime = parseInt(weekNumberDom.attr('data-start-time'), 10);
            var date1, date2;
            if (!opt.startWeek) {
                opt.startWeek = thisTime;
                weekNumberDom.addClass('week-number-selected');
                date1 = new Date(thisTime);
                opt.start = moment(date1).day(opt.startOfWeek == 'monday' ? 1 : 0).valueOf();
                opt.end = moment(date1).day(opt.startOfWeek == 'monday' ? 7 : 6).valueOf();
            } else {
                box.find('.week-number-selected').removeClass('week-number-selected');
                date1 = new Date(thisTime < opt.startWeek ? thisTime : opt.startWeek);
                date2 = new Date(thisTime < opt.startWeek ? opt.startWeek : thisTime);
                opt.startWeek = false;
                opt.start = moment(date1).day(opt.startOfWeek == 'monday' ? 1 : 0).valueOf();
                opt.end = moment(date2).day(opt.startOfWeek == 'monday' ? 7 : 6).valueOf();
            }
            updateSelectableRange();
            checkSelectionValid();
            showSelectedInfo();
            showSelectedDays();
            autoclose();
        }

        function isValidTime(time) {
            time = parseInt(time, 10);
            if (opt.startDate && compare_day(time, opt.startDate) < 0) return false;
            if (opt.endDate && compare_day(time, opt.endDate) > 0) return false;
            if (opt.start && !opt.end && !opt.singleDate) {
                if (opt.maxDays > 0 && countDays(time, opt.start) > opt.maxDays) return false;
                if (opt.minDays > 0 && countDays(time, opt.start) < opt.minDays) return false;
                if (opt.selectForward && time < opt.start) return false;
                if (opt.selectBackward && time > opt.start) return false;
                if (opt.beforeShowDay && typeof opt.beforeShowDay == 'function') {
                    var valid = true;
                    var timeTmp = time;
                    while (countDays(timeTmp, opt.start) > 1) {
                        var arr = opt.beforeShowDay(new Date(timeTmp));
                        if (!arr[0]) {
                            valid = false;
                            break;
                        }
                        if (Math.abs(timeTmp - opt.start) < 86400000) break;
                        if (timeTmp > opt.start) timeTmp -= 86400000;
                        if (timeTmp < opt.start) timeTmp += 86400000;
                    }
                    if (!valid) return false;
                }
            }
            return true;
        }

        function updateSelectableRange() {
            box.find('.day.invalid.tmp').removeClass('tmp invalid').addClass('valid');
            if (opt.start && !opt.end) {
                box.find('.day.toMonth.valid').each(function() {
                    var time = parseInt($(this).attr('time'), 10);
                    if (!isValidTime(time))
                        $(this).addClass('invalid tmp').removeClass('valid');
                    else
                        $(this).addClass('valid tmp').removeClass('invalid');
                });
            }
            return true;
        }

        function dayHovering(day) {
            var hoverTime = parseInt(day.attr('time'));
            var tooltip = '';
            if (day.hasClass('has-tooltip') && day.attr('data-tooltip')) {
                tooltip = '<span style="white-space:nowrap">' + day.attr('data-tooltip') + '</span>';
            } else if (!day.hasClass('invalid')) {
                if (opt.singleDate) {
                    box.find('.day.hovering').removeClass('hovering');
                    day.addClass('hovering');
                } else {
                    box.find('.day').each(function() {
                        var time = parseInt($(this).attr('time')),
                            start = opt.start,
                            end = opt.end;
                        if (time == hoverTime) {
                            $(this).addClass('hovering');
                        } else {
                            $(this).removeClass('hovering');
                        }
                        if ((opt.start && !opt.end) && ((opt.start < time && hoverTime >= time) || (opt.start > time && hoverTime <= time))) {
                            $(this).addClass('hovering');
                        } else {
                            $(this).removeClass('hovering');
                        }
                    });
                    if (opt.start && !opt.end) {
                        var days = countDays(hoverTime, opt.start);
                        if (opt.hoveringTooltip) {
                            if (typeof opt.hoveringTooltip == 'function') {
                                tooltip = opt.hoveringTooltip(days, opt.start, hoverTime);
                            } else if (opt.hoveringTooltip === true && days > 1) {
                                tooltip = days + ' ' + translate('days');
                            }
                        }
                    }
                }
            }
            if (tooltip) {
                var posDay = day.offset();
                var posBox = box.offset();
                var _left = posDay.left - posBox.left;
                var _top = posDay.top - posBox.top;
                _left += day.width() / 2;
                var $tip = box.find('.date-range-length-tip');
                var w = $tip.css({
                    'visibility': 'hidden',
                    'display': 'none'
                }).html(tooltip).width();
                var h = $tip.height();
                _left -= w / 2;
                _top -= h;
                setTimeout(function() {
                    $tip.css({
                        left: _left,
                        top: _top,
                        display: 'block',
                        'visibility': 'visible'
                    });
                }, 10);
            } else {
                box.find('.date-range-length-tip').hide();
            }
        }

        function clearHovering() {
            box.find('.day.hovering').removeClass('hovering');
            box.find('.date-range-length-tip').hide();
        }

        function autoclose() {
            if (opt.singleDate === true) {
                if (initiated && opt.start) {
                    if (opt.autoClose) closeDatePicker();
                }
            } else {
                if (initiated && opt.start && opt.end) {
                    if (opt.autoClose) closeDatePicker();
                }
            }
        }

        function checkSelectionValid() {
            var days = Math.ceil((opt.end - opt.start) / 86400000) + 1;
            if (opt.singleDate) {
                if (opt.start && !opt.end)
                    box.find('.drp_top-bar').removeClass('error').addClass('normal');
                else
                    box.find('.drp_top-bar').removeClass('error').removeClass('normal');
            } else if (opt.maxDays && days > opt.maxDays) {
                opt.start = false;
                opt.end = false;
                box.find('.day').removeClass('checked');
                box.find('.drp_top-bar').removeClass('normal').addClass('error').find('.error-top').html(translate('less-than').replace('%d', opt.maxDays));
            } else if (opt.minDays && days < opt.minDays) {
                opt.start = false;
                opt.end = false;
                box.find('.day').removeClass('checked');
                box.find('.drp_top-bar').removeClass('normal').addClass('error').find('.error-top').html(translate('more-than').replace('%d', opt.minDays));
            } else {
                if (opt.start || opt.end)
                    box.find('.drp_top-bar').removeClass('error').addClass('normal');
                else
                    box.find('.drp_top-bar').removeClass('error').removeClass('normal');
            }
            if ((opt.singleDate && opt.start && !opt.end) || (!opt.singleDate && opt.start && opt.end)) {
                box.find('.apply-btn').removeClass('disabled');
            } else {
                box.find('.apply-btn').addClass('disabled');
            }
            if (opt.batchMode) {
                if ((opt.start && opt.startDate && compare_day(opt.start, opt.startDate) < 0) || (opt.end && opt.endDate && compare_day(opt.end, opt.endDate) > 0)) {
                    opt.start = false;
                    opt.end = false;
                    box.find('.day').removeClass('checked');
                }
            }
        }

        function showSelectedInfo(forceValid, silent) {
            box.find('.start-day').html('...');
            box.find('.end-day').html('...');
            box.find('.selected-days').hide();
            if (opt.start) {
                box.find('.start-day').html(getDateString(new Date(parseInt(opt.start))));
            }
            if (opt.end) {
                box.find('.end-day').html(getDateString(new Date(parseInt(opt.end))));
            }
            var dateRange;
            if (opt.start && opt.singleDate) {
                box.find('.apply-btn').removeClass('disabled');
                dateRange = getDateString(new Date(opt.start));
                opt.setValue.call(selfDom, dateRange, getDateString(new Date(opt.start)), getDateString(new Date(opt.end)));
                if (initiated && !silent) {
                    $(self).trigger('datepicker-change', {
                        'value': dateRange,
                        'date1': new Date(opt.start)
                    });
                }
            } else if (opt.start && opt.end) {
                box.find('.selected-days').show().find('.selected-days-num').html(countDays(opt.end, opt.start));
                box.find('.apply-btn').removeClass('disabled');
                dateRange = getDateString(new Date(opt.start)) + opt.separator + getDateString(new Date(opt.end));
                opt.setValue.call(selfDom, dateRange, getDateString(new Date(opt.start)), getDateString(new Date(opt.end)));
                if (initiated && !silent) {
                    $(self).trigger('datepicker-change', {
                        'value': dateRange,
                        'date1': new Date(opt.start),
                        'date2': new Date(opt.end)
                    });
                }
            } else if (forceValid) {
                box.find('.apply-btn').removeClass('disabled');
            } else {
                box.find('.apply-btn').addClass('disabled');
            }
        }

        function countDays(start, end) {
            return Math.abs(daysFrom1970(start) - daysFrom1970(end)) + 1;
        }

        function setDateRange(date1, date2, silent) {
            if (date1.getTime() > date2.getTime()) {
                var tmp = date2;
                date2 = date1;
                date1 = tmp;
                tmp = null;
            }
            var valid = true;
            if (opt.startDate && compare_day(date1, opt.startDate) < 0) valid = false;
            if (opt.endDate && compare_day(date2, opt.endDate) > 0) valid = false;
            if (!valid) {
                showMonth(opt.startDate, 'month1');
                showMonth(nextMonth(opt.startDate), 'month2');
                showGap();
                return;
            }
            opt.start = date1.getTime();
            opt.end = date2.getTime();
            if (opt.time.enabled) {
                renderTime('time1', date1);
                renderTime('time2', date2);
            }
            if (opt.stickyMonths || (compare_day(date1, date2) > 0 && compare_month(date1, date2) === 0)) {
                if (opt.lookBehind) {
                    date1 = prevMonth(date2);
                } else {
                    date2 = nextMonth(date1);
                }
            }
            if (opt.stickyMonths && opt.endDate !== false && compare_month(date2, opt.endDate) > 0) {
                date1 = prevMonth(date1);
                date2 = prevMonth(date2);
            }
            if (!opt.stickyMonths) {
                if (compare_month(date1, date2) === 0) {
                    if (opt.lookBehind) {
                        date1 = prevMonth(date2);
                    } else {
                        date2 = nextMonth(date1);
                    }
                }
            }
            if (opt.singleMonth != 'all') {
                showMonth(date1, 'month1');
                showMonth(date2, 'month2');
            }
            showGap();
            checkSelectionValid();
            showSelectedInfo(false, silent);
            autoclose();
        }

        function setSingleDate(date1) {
            var valid = true;
            if (opt.startDate && compare_day(date1, opt.startDate) < 0) valid = false;
            if (opt.endDate && compare_day(date1, opt.endDate) > 0) valid = false;
            if (!valid) {
                showMonth(opt.startDate, 'month1');
                return;
            }
            opt.start = date1.getTime();
            if (opt.time.enabled) {
                renderTime('time1', date1);
            }
            showMonth(date1, 'month1');
            if (opt.singleMonth !== true) {
                var date2 = nextMonth(date1);
                showMonth(date2, 'month2');
            }
            showGap();
            showSelectedInfo();
            autoclose();
        }

        function showSelectedDays() {
            if (!opt.start && !opt.end) return;
            box.find('.day').each(function() {
                var time = parseInt($(this).attr('time')),
                    start = opt.start,
                    end = opt.end;
                if (opt.time.enabled) {
                    time = moment(time).startOf('day').valueOf();
                    start = moment(start || moment().valueOf()).startOf('day').valueOf();
                    end = moment(end || moment().valueOf()).startOf('day').valueOf();
                }
                if ((opt.start && opt.end && end >= time && start <= time) || (opt.start && !opt.end && moment(start).format('YYYY-MM-DD') == moment(time).format('YYYY-MM-DD'))) {
                    $(this).addClass('checked');
                } else {
                    $(this).removeClass('checked');
                }
                if (opt.start && moment(start).format('YYYY-MM-DD') == moment(time).format('YYYY-MM-DD')) {
                    $(this).addClass('first-date-selected');
                } else {
                    $(this).removeClass('first-date-selected');
                }
                if (opt.end && moment(end).format('YYYY-MM-DD') == moment(time).format('YYYY-MM-DD')) {
                    $(this).addClass('last-date-selected');
                } else {
                    $(this).removeClass('last-date-selected');
                }
            });
            box.find('.week-number').each(function() {
                if ($(this).attr('data-start-time') == opt.startWeek) {
                    $(this).addClass('week-number-selected');
                }
            });
        }

        function showMonth(date, month) {
            date = moment(date).toDate();
            var monthName = nameMonth(date.getMonth());
            box.find('.' + month + ' .month-name').html(monthName + ' ' + date.getFullYear());
            box.find('.' + month + ' tbody').html(createMonthHTML(date));
            opt[month] = date;
            updateSelectableRange();
            bindDayEvents();
        }

        function bindDayEvents() {
            box.find('.day').unbind("click").click(function(evt) {
                dayClicked($(this));
            });
            box.find('.day').unbind("mouseenter").mouseenter(function(evt) {
                dayHovering($(this));
            });
            box.find('.day').unbind("mouseleave").mouseleave(function(evt) {
                box.find('.date-range-length-tip').hide();
                if (opt.singleDate) {
                    clearHovering();
                }
            });
            box.find('.week-number').unbind("click").click(function(evt) {
                weekNumberClicked($(this));
            });
        }

        function showTime(date, name) {
            box.find('.' + name).append(getTimeHTML());
            renderTime(name, date);
        }

        function nameMonth(m) {
            return translate('month-name')[m];
        }

        function getDateString(d) {
            return moment(d).format(opt.format);
        }

        function showGap() {
            showSelectedDays();
            var m1 = parseInt(moment(opt.month1).format('YYYYMM'));
            var m2 = parseInt(moment(opt.month2).format('YYYYMM'));
            var p = Math.abs(m1 - m2);
            var shouldShow = (p > 1 && p != 89);
            if (shouldShow) {
                box.addClass('has-gap').removeClass('no-gap').find('.gap').css('visibility', 'visible');
            } else {
                box.removeClass('has-gap').addClass('no-gap').find('.gap').css('visibility', 'hidden');
            }
            var h1 = box.find('table.month1').height();
            var h2 = box.find('table.month2').height();
            box.find('.gap').height(Math.max(h1, h2) + 10);
        }

        function closeDatePicker() {
            if (opt.alwaysOpen) return;
            var afterAnim = function() {
                $(self).data('date-picker-opened', false);
                $(self).trigger('datepicker-closed', {
                    relatedTarget: box
                });
            };
            if (opt.customCloseAnimation) {
                opt.customCloseAnimation.call(box.get(0), afterAnim);
            } else {
                $(box).slideUp(opt.duration, afterAnim);
            }
            $(self).trigger('datepicker-close', {
                relatedTarget: box
            });
        }

        function redrawDatePicker() {
            showMonth(opt.month1, 'month1');
            if (opt.singleMonth == 'all') {
                var nextMon = opt.month1;
                $.each([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(index, value) {
                    nextMon = nextMonth(nextMon);
                    showMonth(nextMon, 'month' + value);
                });
            } else {
                showMonth(opt.month2, 'month2');
            }
        }

        function compare_month(m1, m2) {
            var p = parseInt(moment(m1).format('YYYYMM')) - parseInt(moment(m2).format('YYYYMM'));
            if (p > 0) return 1;
            if (p === 0) return 0;
            return -1;
        }

        function compare_day(m1, m2) {
            var p = parseInt(moment(m1).format('YYYYMMDD')) - parseInt(moment(m2).format('YYYYMMDD'));
            if (p > 0) return 1;
            if (p === 0) return 0;
            return -1;
        }

        function nextMonth(month) {
            return moment(month).add(1, 'months').toDate();
        }

        function prevMonth(month) {
            return moment(month).add(-1, 'months').toDate();
        }

        function getTimeHTML() {
            return '<div>' + '<span>' + translate('Time') + ': <span class="hour-val">00</span>:<span class="minute-val">00</span></span>' + '</div>' + '<div class="hour">' + '<label>' + translate('Hour') + ': <input type="range" class="hour-range" name="hour" min="0" max="23"></label>' + '</div>' + '<div class="minute">' + '<label>' + translate('Minute') + ': <input type="range" class="minute-range" name="minute" min="0" max="59"></label>' + '</div>';
        }

        function createDom() {
            var html = '<div class="date-picker-wrapper';
            if (opt.extraClass) html += ' ' + opt.extraClass + ' ';
            if (opt.singleDate) html += ' single-date ';
            if (!opt.showShortcuts) html += ' no-shortcuts ';
            if (!opt.showTopbar) html += ' no-topbar ';
            if (opt.customTopBar) html += ' custom-topbar ';
            html += '">';
            if (opt.showTopbar) {
                html += '<div class="drp_top-bar">';
                if (opt.customTopBar) {
                    if (typeof opt.customTopBar == 'function') opt.customTopBar = opt.customTopBar();
                    html += '<div class="custom-top">' + opt.customTopBar + '</div>';
                } else {
                    html += '<div class="normal-top">' + '<span style="color:#333">' + translate('selected') + ' </span> <b class="start-day">...</b>';
                    if (!opt.singleDate) {
                        html += ' <span class="separator-day">' + opt.separator + '</span> <b class="end-day">...</b> <i class="selected-days">(<span class="selected-days-num">3</span> ' + translate('days') + ')</i>';
                    }
                    html += '</div>';
                    html += '<div class="error-top">error</div>' + '<div class="default-top">default</div>';
                }
                html += '<input type="button" class="apply-btn disabled' + getApplyBtnClass() + '" value="' + translate('apply') + '" />';
                html += '</div>';
            }
            var _colspan = opt.showWeekNumbers ? 6 : 5;
            var arrowPrev = '&lt;';
            if (opt.customArrowPrevSymbol) arrowPrev = opt.customArrowPrevSymbol;
            var arrowNext = '&gt;';
            if (opt.customArrowNextSymbol) arrowNext = opt.customArrowNextSymbol;
            html += '<div class="month-wrapper">' + '   <table class="month1" cellspacing="0" border="0" cellpadding="0">' + '       <thead>' + '           <tr class="caption">' + '               <th style="width:27px;">' +
                (opt.singleMonth == 'all' ? '' : '<span class="prev">' + arrowPrev + '</span>') + '               </th>' + '               <th colspan="' + _colspan + '" class="month-name">' + '               </th>' + '               <th style="width:27px;">' +
                (opt.singleDate || !opt.stickyMonths ? (opt.singleMonth == 'all' ? '' : '<span class="next">' + arrowNext + '</span>') : '') + '               </th>' + '           </tr>' + '           <tr class="week-name">' + getWeekHead() + '       </thead>' + '       <tbody></tbody>' + '   </table>';
            if (opt.singleMonth == 'all') {
                $.each([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], function(index, value) {
                    html += '<div class="gap">' + getGapHTML() + '</div>' + '<table class="month' + value + '" cellspacing="0" border="0" cellpadding="0">' + '   <thead>' + '   <tr class="caption">' + '       <th style="width:27px;">' + '       </th>' + '       <th colspan="' + _colspan + '" class="month-name">' + '       </th>' + '       <th style="width:27px;">' + '       </th>' + '   </tr>' + '   <tr class="week-name">' + getWeekHead() + '   </thead>' + '   <tbody></tbody>' + '</table>';
                });
            } else if (hasMonth2()) {
                html += '<div class="gap">' + getGapHTML() + '</div>' + '<table class="month2" cellspacing="0" border="0" cellpadding="0">' + '   <thead>' + '   <tr class="caption">' + '       <th style="width:27px;">' +
                    (!opt.stickyMonths ? '<span class="prev">' + arrowPrev + '</span>' : '') + '       </th>' + '       <th colspan="' + _colspan + '" class="month-name">' + '       </th>' + '       <th style="width:27px;">' + '           <span class="next">' + arrowNext + '</span>' + '       </th>' + '   </tr>' + '   <tr class="week-name">' + getWeekHead() + '   </thead>' + '   <tbody></tbody>' + '</table>';
            }
            html += '<div style="clear:both;height:0;font-size:0;"></div>' + '<div class="time">' + '<div class="time1"></div>';
            if (!opt.singleDate) {
                html += '<div class="time2"></div>';
            }
            html += '</div>' + '<div style="clear:both;height:0;font-size:0;"></div>' + '</div>';
            html += '<div class="footer">';
            if (opt.showShortcuts) {
                html += '<div class="shortcuts"><b>' + translate('shortcuts') + '</b>';
                var data = opt.shortcuts;
                if (data) {
                    var name;
                    if (data['prev-days'] && data['prev-days'].length > 0) {
                        html += '&nbsp;<span class="prev-days">' + translate('past');
                        for (var i = 0; i < data['prev-days'].length; i++) {
                            name = data['prev-days'][i];
                            name += (data['prev-days'][i] > 1) ? translate('days') : translate('day');
                            html += ' <a href="javascript:;" shortcut="day,-' + data['prev-days'][i] + '">' + name + '</a>';
                        }
                        html += '</span>';
                    }
                    if (data['next-days'] && data['next-days'].length > 0) {
                        html += '&nbsp;<span class="next-days">' + translate('following');
                        for (var i = 0; i < data['next-days'].length; i++) {
                            name = data['next-days'][i];
                            name += (data['next-days'][i] > 1) ? translate('days') : translate('day');
                            html += ' <a href="javascript:;" shortcut="day,' + data['next-days'][i] + '">' + name + '</a>';
                        }
                        html += '</span>';
                    }
                    if (data.prev && data.prev.length > 0) {
                        html += '&nbsp;<span class="prev-buttons">' + translate('previous');
                        for (var i = 0; i < data.prev.length; i++) {
                            name = translate('prev-' + data.prev[i]);
                            html += ' <a href="javascript:;" shortcut="prev,' + data.prev[i] + '">' + name + '</a>';
                        }
                        html += '</span>';
                    }
                    if (data.next && data.next.length > 0) {
                        html += '&nbsp;<span class="next-buttons">' + translate('next');
                        for (var i = 0; i < data.next.length; i++) {
                            name = translate('next-' + data.next[i]);
                            html += ' <a href="javascript:;" shortcut="next,' + data.next[i] + '">' + name + '</a>';
                        }
                        html += '</span>';
                    }
                }
                if (opt.customShortcuts) {
                    for (var i = 0; i < opt.customShortcuts.length; i++) {
                        var sh = opt.customShortcuts[i];
                        html += '&nbsp;<span class="custom-shortcut"><a href="javascript:;" shortcut="custom">' + sh.name + '</a></span>';
                    }
                }
                html += '</div>';
            }
            if (opt.showCustomValues) {
                html += '<div class="customValues"><b>' + (opt.customValueLabel || translate('custom-values')) + '</b>';
                if (opt.customValues) {
                    for (var i = 0; i < opt.customValues.length; i++) {
                        var val = opt.customValues[i];
                        html += '&nbsp;<span class="custom-value"><a href="javascript:;" custom="' + val.value + '">' + val.name + '</a></span>';
                    }
                }
            }
            html += '</div></div>';
            return $(html);
        }

        function getApplyBtnClass() {
            var klass = '';
            if (opt.autoClose === true) {
                klass += ' hide';
            }
            if (opt.applyBtnClass !== '') {
                klass += ' ' + opt.applyBtnClass;
            }
            return klass;
        }

        function getWeekHead() {
            var prepend = opt.showWeekNumbers ? '<th>' + translate('week-number') + '</th>' : '';
            if (opt.startOfWeek == 'monday') {
                return prepend + '<th>' + translate('week-1') + '</th>' + '<th>' + translate('week-2') + '</th>' + '<th>' + translate('week-3') + '</th>' + '<th>' + translate('week-4') + '</th>' + '<th>' + translate('week-5') + '</th>' + '<th>' + translate('week-6') + '</th>' + '<th>' + translate('week-7') + '</th>';
            } else {
                return prepend + '<th>' + translate('week-7') + '</th>' + '<th>' + translate('week-1') + '</th>' + '<th>' + translate('week-2') + '</th>' + '<th>' + translate('week-3') + '</th>' + '<th>' + translate('week-4') + '</th>' + '<th>' + translate('week-5') + '</th>' + '<th>' + translate('week-6') + '</th>';
            }
        }

        function isMonthOutOfBounds(month) {
            month = moment(month);
            if (opt.startDate && month.endOf('month').isBefore(opt.startDate)) {
                return true;
            }
            if (opt.endDate && month.startOf('month').isAfter(opt.endDate)) {
                return true;
            }
            return false;
        }

        function getGapHTML() {
            var html = ['<div class="gap-top-mask"></div><div class="gap-bottom-mask"></div><div class="gap-lines">'];
            for (var i = 0; i < 20; i++) {
                html.push('<div class="gap-line">' + '<div class="gap-1"></div>' + '<div class="gap-2"></div>' + '<div class="gap-3"></div>' + '</div>');
            }
            html.push('</div>');
            return html.join('');
        }

        function hasMonth2() {
            return (!opt.singleMonth);
        }

        function attributesCallbacks(initialObject, callbacksArray, today) {
            var resultObject = $.extend(true, {}, initialObject);
            $.each(callbacksArray, function(cbAttrIndex, cbAttr) {
                var addAttributes = cbAttr(today);
                for (var attr in addAttributes) {
                    if (resultObject.hasOwnProperty(attr)) {
                        resultObject[attr] += addAttributes[attr];
                    } else {
                        resultObject[attr] = addAttributes[attr];
                    }
                }
            });
            var attrString = '';
            for (var attr in resultObject) {
                if (resultObject.hasOwnProperty(attr)) {
                    attrString += attr + '="' + resultObject[attr] + '" ';
                }
            }
            return attrString;
        }

        function daysFrom1970(t) {
            return Math.floor(toLocalTimestamp(t) / 86400000);
        }

        function toLocalTimestamp(t) {
            if (moment.isMoment(t)) t = t.toDate().getTime();
            if (typeof t == 'object' && t.getTime) t = t.getTime();
            if (typeof t == 'string' && !t.match(/\d{13}/)) t = moment(t, opt.format).toDate().getTime();
            t = parseInt(t, 10) - new Date().getTimezoneOffset() * 60 * 1000;
            return t;
        }

        function createMonthHTML(d) {
            var days = [];
            d.setDate(1);
            var lastMonth = new Date(d.getTime() - 86400000);
            var now = new Date();
            var dayOfWeek = d.getDay();
            if ((dayOfWeek === 0) && (opt.startOfWeek === 'monday')) {
                dayOfWeek = 7;
            }
            var today, valid;
            if (dayOfWeek > 0) {
                for (var i = dayOfWeek; i > 0; i--) {
                    var day = new Date(d.getTime() - 86400000 * i);
                    valid = isValidTime(day.getTime());
                    if (opt.startDate && compare_day(day, opt.startDate) < 0) valid = false;
                    if (opt.endDate && compare_day(day, opt.endDate) > 0) valid = false;
                    days.push({
                        date: day,
                        type: 'lastMonth',
                        day: day.getDate(),
                        time: day.getTime(),
                        valid: valid
                    });
                }
            }
            var toMonth = d.getMonth();
            for (var i = 0; i < 40; i++) {
                today = moment(d).add(i, 'days').toDate();
                valid = isValidTime(today.getTime());
                if (opt.startDate && compare_day(today, opt.startDate) < 0) valid = false;
                if (opt.endDate && compare_day(today, opt.endDate) > 0) valid = false;
                days.push({
                    date: today,
                    type: today.getMonth() == toMonth ? 'toMonth' : 'nextMonth',
                    day: today.getDate(),
                    time: today.getTime(),
                    valid: valid
                });
            }
            var html = [];
            for (var week = 0; week < 6; week++) {
                if (days[week * 7].type == 'nextMonth') break;
                html.push('<tr>');
                for (var day = 0; day < 7; day++) {
                    var _day = (opt.startOfWeek == 'monday') ? day + 1 : day;
                    today = days[week * 7 + _day];
                    var highlightToday = moment(today.time).format('L') == moment(now).format('L');
                    today.extraClass = '';
                    today.tooltip = '';
                    if (today.valid && opt.beforeShowDay && typeof opt.beforeShowDay == 'function') {
                        var _r = opt.beforeShowDay(moment(today.time).toDate());
                        today.valid = _r[0];
                        today.extraClass = _r[1] || '';
                        today.tooltip = _r[2] || '';
                        if (today.tooltip !== '') today.extraClass += ' has-tooltip ';
                    }
                    var todayDivAttr = {
                        time: today.time,
                        'data-tooltip': today.tooltip,
                        'class': 'day ' + today.type + ' ' + today.extraClass + ' ' + (today.valid ? 'valid' : 'invalid') + ' ' + (highlightToday ? 'real-today' : '')
                    };
                    if (day === 0 && opt.showWeekNumbers) {
                        html.push('<td><div class="week-number" data-start-time="' + today.time + '">' + opt.getWeekNumber(today.date) + '</div></td>');
                    }
                    html.push('<td ' + attributesCallbacks({}, opt.dayTdAttrs, today) + '><div ' + attributesCallbacks(todayDivAttr, opt.dayDivAttrs, today) + '>' + showDayHTML(today.time, today.day) + '</div></td>');
                }
                html.push('</tr>');
            }
            return html.join('');
        }

        function showDayHTML(time, date) {
            if (opt.showDateFilter && typeof opt.showDateFilter == 'function') return opt.showDateFilter(time, date);
            return date;
        }

        function getLanguages() {
            if (opt.language == 'auto') {
                var language = navigator.language ? navigator.language : navigator.browserLanguage;
                if (!language) {
                    return $.dateRangePickerLanguages['default'];
                }
                language = language.toLowerCase();
                if (language in $.dateRangePickerLanguages) {
                    return $.dateRangePickerLanguages[language];
                }
                return $.dateRangePickerLanguages['default'];
            } else if (opt.language && opt.language in $.dateRangePickerLanguages) {
                return $.dateRangePickerLanguages[opt.language];
            } else {
                return $.dateRangePickerLanguages['default'];
            }
        }

        function translate(translationKey) {
            var translationKeyLowerCase = translationKey.toLowerCase();
            var result = (translationKey in languages) ? languages[translationKey] : (translationKeyLowerCase in languages) ? languages[translationKeyLowerCase] : null;
            var defaultLanguage = $.dateRangePickerLanguages['default'];
            if (result == null) result = (translationKey in defaultLanguage) ? defaultLanguage[translationKey] : (translationKeyLowerCase in defaultLanguage) ? defaultLanguage[translationKeyLowerCase] : '';
            return result;
        }

        function getDefaultTime() {
            var defaultTime = opt.defaultTime ? opt.defaultTime : new Date();
            if (opt.lookBehind) {
                if (opt.startDate && compare_month(defaultTime, opt.startDate) < 0) defaultTime = nextMonth(moment(opt.startDate).toDate());
                if (opt.endDate && compare_month(defaultTime, opt.endDate) > 0) defaultTime = moment(opt.endDate).toDate();
            } else {
                if (opt.startDate && compare_month(defaultTime, opt.startDate) < 0) defaultTime = moment(opt.startDate).toDate();
                if (opt.endDate && compare_month(nextMonth(defaultTime), opt.endDate) > 0) defaultTime = prevMonth(moment(opt.endDate).toDate());
            }
            if (opt.singleDate) {
                if (opt.startDate && compare_month(defaultTime, opt.startDate) < 0) defaultTime = moment(opt.startDate).toDate();
                if (opt.endDate && compare_month(defaultTime, opt.endDate) > 0) defaultTime = moment(opt.endDate).toDate();
            }
            return defaultTime;
        }

        function resetMonthsView(time) {
            if (!time) {
                time = getDefaultTime();
            }
            if (opt.lookBehind) {
                showMonth(prevMonth(time), 'month1');
                showMonth(time, 'month2');
            } else {
                showMonth(time, 'month1');
                showMonth(nextMonth(time), 'month2');
            }
            if (opt.singleDate) {
                showMonth(time, 'month1');
            }
            showSelectedDays();
            showGap();
        }
    };
}));;

function initializeDatepicker(elem, singleDate, startDate) {
    if (startDate == undefined) {
        startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
    }
    elem.dateRangePicker({
        startOfWeek: 'monday',
        language: moment.locale(),
        format: "MM/DD/YYYY",
        startDate: startDate,
        singleDate: singleDate,
        hoveringTooltip: false,
        showTopbar: false,
        selectForward: true,
        stickyMonths: true,
        customArrowPrevSymbol: '<i class="icn-calendar-prev"></i>',
        customArrowNextSymbol: '<i class="icn-calendar-next"></i>',
        autoClose: false,
        extraClass: 'datepicker-custom',
        singleMonth: 'all',
        inline: true,
        container: '#dates-screen .modal-screen-body',
        alwaysOpen: true,
        getValue: function() {
            if ($('#data-departing').val() && $('#data-returning').val() && !singleDate) {
                return $('#data-departing').val() + ' to ' + $('#data-returning').val();
            } else {
                return elem.val();
            }
        },
        setValue: function(s, s1, s2) {
            elem.val(s1);
            if (!singleDate) {
                $('#data-returning').val(s2);
            }
        }
    }).bind('datepicker-first-date-selected', function(event, obj) {
        elem.val(moment(obj.date1).format("ddd, DD MMM"));
        if (!singleDate) {
            $('#data-returning').focus();
        }
    }).bind('datepicker-change', function(event, obj) {
        elem.val(moment(obj.date1).format("ddd, DD MMM"));
        if (!singleDate) {
            $('#data-returning').val(moment(obj.date2).format("ddd, DD MMM"));
        }
        $('#value-date-picker').val(obj.value);
    }).bind('datepicker-open', function() {
        var departing = new Date($("input[name='SearchForm[departing]']").val());
        $('#data-departing').val(moment(departing).format("ddd, DD MMM"));
        if (!singleDate) {
            var returning = new Date($("input[name='SearchForm[returning]']").val());
            $('#data-returning').val(moment(returning).format("ddd, DD MMM"));
        }
    });
};
window.yii = (function($) {
    var pub = {
        reloadableScripts: [],
        clickableSelector: 'a, button, input[type="submit"], input[type="button"], input[type="reset"], ' + 'input[type="image"]',
        changeableSelector: 'select, input, textarea',
        getCsrfParam: function() {
            return $('meta[name=csrf-param]').attr('content');
        },
        getCsrfToken: function() {
            return $('meta[name=csrf-token]').attr('content');
        },
        setCsrfToken: function(name, value) {
            $('meta[name=csrf-param]').attr('content', name);
            $('meta[name=csrf-token]').attr('content', value);
        },
        refreshCsrfToken: function() {
            var token = pub.getCsrfToken();
            if (token) {
                $('form input[name="' + pub.getCsrfParam() + '"]').val(token);
            }
        },
        confirm: function(message, ok, cancel) {
            if (window.confirm(message)) {
                !ok || ok();
            } else {
                !cancel || cancel();
            }
        },
        handleAction: function($e, event) {
            var $form = $e.attr('data-form') ? $('#' + $e.attr('data-form')) : $e.closest('form'),
                method = !$e.data('method') && $form ? $form.attr('method') : $e.data('method'),
                action = $e.attr('href'),
                isValidAction = action && action !== '#',
                params = $e.data('params'),
                areValidParams = params && $.isPlainObject(params),
                pjax = $e.data('pjax'),
                usePjax = pjax !== undefined && pjax !== 0 && $.support.pjax,
                pjaxContainer, pjaxOptions = {};
            if (usePjax) {
                pjaxContainer = $e.data('pjax-container');
                if (pjaxContainer === undefined || !pjaxContainer.length) {
                    pjaxContainer = $e.closest('[data-pjax-container]').attr('id') ? ('#' + $e.closest('[data-pjax-container]').attr('id')) : '';
                }
                if (!pjaxContainer.length) {
                    pjaxContainer = 'body';
                }
                pjaxOptions = {
                    container: pjaxContainer,
                    push: !!$e.data('pjax-push-state'),
                    replace: !!$e.data('pjax-replace-state'),
                    scrollTo: $e.data('pjax-scrollto'),
                    pushRedirect: $e.data('pjax-push-redirect'),
                    replaceRedirect: $e.data('pjax-replace-redirect'),
                    skipOuterContainers: $e.data('pjax-skip-outer-containers'),
                    timeout: $e.data('pjax-timeout'),
                    originalEvent: event,
                    originalTarget: $e
                };
            }
            if (method === undefined) {
                if (isValidAction) {
                    usePjax ? $.pjax.click(event, pjaxOptions) : window.location.assign(action);
                } else if ($e.is(':submit') && $form.length) {
                    if (usePjax) {
                        $form.on('submit', function(e) {
                            $.pjax.submit(e, pjaxOptions);
                        });
                    }
                    $form.trigger('submit');
                }
                return;
            }
            var oldMethod, oldAction, newForm = !$form.length;
            if (!newForm) {
                oldMethod = $form.attr('method');
                $form.attr('method', method);
                if (isValidAction) {
                    oldAction = $form.attr('action');
                    $form.attr('action', action);
                }
            } else {
                if (!isValidAction) {
                    action = pub.getCurrentUrl();
                }
                $form = $('<form/>', {
                    method: method,
                    action: action
                });
                var target = $e.attr('target');
                if (target) {
                    $form.attr('target', target);
                }
                if (!/(get|post)/i.test(method)) {
                    $form.append($('<input/>', {
                        name: '_method',
                        value: method,
                        type: 'hidden'
                    }));
                    method = 'post';
                    $form.attr('method', method);
                }
                if (/post/i.test(method)) {
                    var csrfParam = pub.getCsrfParam();
                    if (csrfParam) {
                        $form.append($('<input/>', {
                            name: csrfParam,
                            value: pub.getCsrfToken(),
                            type: 'hidden'
                        }));
                    }
                }
                $form.hide().appendTo('body');
            }
            var activeFormData = $form.data('yiiActiveForm');
            if (activeFormData) {
                activeFormData.submitObject = $e;
            }
            if (areValidParams) {
                $.each(params, function(name, value) {
                    $form.append($('<input/>').attr({
                        name: name,
                        value: value,
                        type: 'hidden'
                    }));
                });
            }
            if (usePjax) {
                $form.on('submit', function(e) {
                    $.pjax.submit(e, pjaxOptions);
                });
            }
            $form.trigger('submit');
            $.when($form.data('yiiSubmitFinalizePromise')).done(function() {
                if (newForm) {
                    $form.remove();
                    return;
                }
                if (oldAction !== undefined) {
                    $form.attr('action', oldAction);
                }
                $form.attr('method', oldMethod);
                if (areValidParams) {
                    $.each(params, function(name) {
                        $('input[name="' + name + '"]', $form).remove();
                    });
                }
            });
        },
        getQueryParams: function(url) {
            var pos = url.indexOf('?');
            if (pos < 0) {
                return {};
            }
            var pairs = $.grep(url.substring(pos + 1).split('#')[0].split('&'), function(value) {
                return value !== '';
            });
            var params = {};
            for (var i = 0, len = pairs.length; i < len; i++) {
                var pair = pairs[i].split('=');
                var name = decodeURIComponent(pair[0].replace(/\+/g, '%20'));
                var value = decodeURIComponent(pair[1].replace(/\+/g, '%20'));
                if (!name.length) {
                    continue;
                }
                if (params[name] === undefined) {
                    params[name] = value || '';
                } else {
                    if (!$.isArray(params[name])) {
                        params[name] = [params[name]];
                    }
                    params[name].push(value || '');
                }
            }
            return params;
        },
        initModule: function(module) {
            if (module.isActive !== undefined && !module.isActive) {
                return;
            }
            if ($.isFunction(module.init)) {
                module.init();
            }
            $.each(module, function() {
                if ($.isPlainObject(this)) {
                    pub.initModule(this);
                }
            });
        },
        init: function() {
            initCsrfHandler();
            initRedirectHandler();
            initAssetFilters();
            initDataMethods();
        },
        getBaseCurrentUrl: function() {
            return window.location.protocol + '//' + window.location.host;
        },
        getCurrentUrl: function() {
            return window.location.href;
        }
    };

    function initCsrfHandler() {
        $.ajaxPrefilter(function(options, originalOptions, xhr) {
            if (!options.crossDomain && pub.getCsrfParam()) {
                xhr.setRequestHeader('X-CSRF-Token', pub.getCsrfToken());
            }
        });
        pub.refreshCsrfToken();
    }

    function initRedirectHandler() {
        $(document).ajaxComplete(function(event, xhr) {
            var url = xhr && xhr.getResponseHeader('X-Redirect');
            if (url) {
                window.location.assign(url);
            }
        });
    }

    function initAssetFilters() {
        var loadedScripts = {};
        $('script[src]').each(function() {
            var url = getAbsoluteUrl(this.src);
            loadedScripts[url] = true;
        });
        $.ajaxPrefilter('script', function(options, originalOptions, xhr) {
            if (options.dataType == 'jsonp') {
                return;
            }
            var url = getAbsoluteUrl(options.url),
                forbiddenRepeatedLoad = loadedScripts[url] === true && !isReloadableAsset(url),
                cleanupRunning = loadedScripts[url] !== undefined && loadedScripts[url]['xhrDone'] === true;
            if (forbiddenRepeatedLoad || cleanupRunning) {
                xhr.abort();
                return;
            }
            if (loadedScripts[url] === undefined || loadedScripts[url] === true) {
                loadedScripts[url] = {
                    xhrList: [],
                    xhrDone: false
                };
            }
            xhr.done(function(data, textStatus, jqXHR) {
                if (loadedScripts[jqXHR.yiiUrl]['xhrDone'] === true) {
                    return;
                }
                loadedScripts[jqXHR.yiiUrl]['xhrDone'] = true;
                for (var i = 0, len = loadedScripts[jqXHR.yiiUrl]['xhrList'].length; i < len; i++) {
                    var singleXhr = loadedScripts[jqXHR.yiiUrl]['xhrList'][i];
                    if (singleXhr && singleXhr.readyState !== XMLHttpRequest.DONE) {
                        singleXhr.abort();
                    }
                }
                loadedScripts[jqXHR.yiiUrl] = true;
            }).fail(function(jqXHR, textStatus) {
                if (textStatus === 'abort') {
                    return;
                }
                delete loadedScripts[jqXHR.yiiUrl]['xhrList'][jqXHR.yiiIndex];
                var allFailed = true;
                for (var i = 0, len = loadedScripts[jqXHR.yiiUrl]['xhrList'].length; i < len; i++) {
                    if (loadedScripts[jqXHR.yiiUrl]['xhrList'][i]) {
                        allFailed = false;
                    }
                }
                if (allFailed) {
                    delete loadedScripts[jqXHR.yiiUrl];
                }
            });
            xhr.yiiIndex = loadedScripts[url]['xhrList'].length;
            xhr.yiiUrl = url;
            loadedScripts[url]['xhrList'][xhr.yiiIndex] = xhr;
        });
        $(document).ajaxComplete(function() {
            var styleSheets = [];
            $('link[rel=stylesheet]').each(function() {
                var url = getAbsoluteUrl(this.href);
                if (isReloadableAsset(url)) {
                    return;
                }
                $.inArray(url, styleSheets) === -1 ? styleSheets.push(url) : $(this).remove();
            });
        });
    }

    function initDataMethods() {
        var handler = function(event) {
            var $this = $(this),
                method = $this.data('method'),
                message = $this.data('confirm'),
                form = $this.data('form');
            if (method === undefined && message === undefined && form === undefined) {
                return true;
            }
            if (message !== undefined) {
                $.proxy(pub.confirm, this)(message, function() {
                    pub.handleAction($this, event);
                });
            } else {
                pub.handleAction($this, event);
            }
            event.stopImmediatePropagation();
            return false;
        };
        $(document).on('click.yii', pub.clickableSelector, handler).on('change.yii', pub.changeableSelector, handler);
    }

    function isReloadableAsset(url) {
        for (var i = 0; i < pub.reloadableScripts.length; i++) {
            var rule = getAbsoluteUrl(pub.reloadableScripts[i]);
            var match = new RegExp("^" + escapeRegExp(rule).split('\\*').join('.+') + "$").test(url);
            if (match === true) {
                return true;
            }
        }
        return false;
    }

    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    function getAbsoluteUrl(url) {
        return url.charAt(0) === '/' ? pub.getBaseCurrentUrl() + url : url;
    }
    return pub;
})(window.jQuery);
window.jQuery(function() {
    window.yii.initModule(window.yii);
});;
yii.validation = (function($) {
    var pub = {
        isEmpty: function(value) {
            return value === null || value === undefined || ($.isArray(value) && value.length === 0) || value === '';
        },
        addMessage: function(messages, message, value) {
            messages.push(message.replace(/\{value\}/g, value));
        },
        required: function(value, messages, options) {
            var valid = false;
            if (options.requiredValue === undefined) {
                var isString = typeof value == 'string' || value instanceof String;
                if (options.strict && value !== undefined || !options.strict && !pub.isEmpty(isString ? $.trim(value) : value)) {
                    valid = true;
                }
            } else if (!options.strict && value == options.requiredValue || options.strict && value === options.requiredValue) {
                valid = true;
            }
            if (!valid) {
                pub.addMessage(messages, options.message, value);
            }
        },
        'boolean': function(value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            var valid = !options.strict && (value == options.trueValue || value == options.falseValue) || options.strict && (value === options.trueValue || value === options.falseValue);
            if (!valid) {
                pub.addMessage(messages, options.message, value);
            }
        },
        string: function(value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            if (typeof value !== 'string') {
                pub.addMessage(messages, options.message, value);
                return;
            }
            if (options.is !== undefined && value.length != options.is) {
                pub.addMessage(messages, options.notEqual, value);
                return;
            }
            if (options.min !== undefined && value.length < options.min) {
                pub.addMessage(messages, options.tooShort, value);
            }
            if (options.max !== undefined && value.length > options.max) {
                pub.addMessage(messages, options.tooLong, value);
            }
        },
        file: function(attribute, messages, options) {
            var files = getUploadedFiles(attribute, messages, options);
            $.each(files, function(i, file) {
                validateFile(file, messages, options);
            });
        },
        image: function(attribute, messages, options, deferredList) {
            var files = getUploadedFiles(attribute, messages, options);
            $.each(files, function(i, file) {
                validateFile(file, messages, options);
                if (typeof FileReader === "undefined") {
                    return;
                }
                var deferred = $.Deferred();
                pub.validateImage(file, messages, options, deferred, new FileReader(), new Image());
                deferredList.push(deferred);
            });
        },
        validateImage: function(file, messages, options, deferred, fileReader, image) {
            image.onload = function() {
                validateImageSize(file, image, messages, options);
                deferred.resolve();
            };
            image.onerror = function() {
                messages.push(options.notImage.replace(/\{file\}/g, file.name));
                deferred.resolve();
            };
            fileReader.onload = function() {
                image.src = this.result;
            };
            fileReader.onerror = function() {
                deferred.resolve();
            };
            fileReader.readAsDataURL(file);
        },
        number: function(value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            if (typeof value === 'string' && !options.pattern.test(value)) {
                pub.addMessage(messages, options.message, value);
                return;
            }
            if (options.min !== undefined && value < options.min) {
                pub.addMessage(messages, options.tooSmall, value);
            }
            if (options.max !== undefined && value > options.max) {
                pub.addMessage(messages, options.tooBig, value);
            }
        },
        range: function(value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            if (!options.allowArray && $.isArray(value)) {
                pub.addMessage(messages, options.message, value);
                return;
            }
            var inArray = true;
            $.each($.isArray(value) ? value : [value], function(i, v) {
                if ($.inArray(v, options.range) == -1) {
                    inArray = false;
                    return false;
                } else {
                    return true;
                }
            });
            if (options.not === undefined) {
                options.not = false;
            }
            if (options.not === inArray) {
                pub.addMessage(messages, options.message, value);
            }
        },
        regularExpression: function(value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            if (!options.not && !options.pattern.test(value) || options.not && options.pattern.test(value)) {
                pub.addMessage(messages, options.message, value);
            }
        },
        email: function(value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            var valid = true,
                regexp = /^((?:"?([^"]*)"?\s)?)(?:\s+)?(?:(<?)((.+)@([^>]+))(>?))$/,
                matches = regexp.exec(value);
            if (matches === null) {
                valid = false;
            } else {
                var localPart = matches[5],
                    domain = matches[6];
                if (options.enableIDN) {
                    localPart = punycode.toASCII(localPart);
                    domain = punycode.toASCII(domain);
                    value = matches[1] + matches[3] + localPart + '@' + domain + matches[7];
                }
                if (localPart.length > 64) {
                    valid = false;
                } else if ((localPart + '@' + domain).length > 254) {
                    valid = false;
                } else {
                    valid = options.pattern.test(value) || (options.allowName && options.fullPattern.test(value));
                }
            }
            if (!valid) {
                pub.addMessage(messages, options.message, value);
            }
        },
        url: function(value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            if (options.defaultScheme && !/:\/\//.test(value)) {
                value = options.defaultScheme + '://' + value;
            }
            var valid = true;
            if (options.enableIDN) {
                var matches = /^([^:]+):\/\/([^\/]+)(.*)$/.exec(value);
                if (matches === null) {
                    valid = false;
                } else {
                    value = matches[1] + '://' + punycode.toASCII(matches[2]) + matches[3];
                }
            }
            if (!valid || !options.pattern.test(value)) {
                pub.addMessage(messages, options.message, value);
            }
        },
        trim: function($form, attribute, options) {
            var $input = $form.find(attribute.input);
            var value = $input.val();
            if (!options.skipOnEmpty || !pub.isEmpty(value)) {
                value = $.trim(value);
                $input.val(value);
            }
            return value;
        },
        captcha: function(value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            var hash = $('body').data(options.hashKey);
            hash = hash == null ? options.hash : hash[options.caseSensitive ? 0 : 1];
            var v = options.caseSensitive ? value : value.toLowerCase();
            for (var i = v.length - 1, h = 0; i >= 0; --i) {
                h += v.charCodeAt(i);
            }
            if (h != hash) {
                pub.addMessage(messages, options.message, value);
            }
        },
        compare: function(value, messages, options, $form) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            var compareValue, valid = true;
            if (options.compareAttribute === undefined) {
                compareValue = options.compareValue;
            } else {
                var attributes = $form.data('yiiActiveForm').attributes
                for (var i = attributes.length - 1; i >= 0; i--) {
                    if (attributes[i].id === options.compareAttribute) {
                        compareValue = $(attributes[i].input).val();
                    }
                }
            }
            if (options.type === 'number') {
                value = parseFloat(value);
                compareValue = parseFloat(compareValue);
            }
            switch (options.operator) {
                case '==':
                    valid = value == compareValue;
                    break;
                case '===':
                    valid = value === compareValue;
                    break;
                case '!=':
                    valid = value != compareValue;
                    break;
                case '!==':
                    valid = value !== compareValue;
                    break;
                case '>':
                    valid = value > compareValue;
                    break;
                case '>=':
                    valid = value >= compareValue;
                    break;
                case '<':
                    valid = value < compareValue;
                    break;
                case '<=':
                    valid = value <= compareValue;
                    break;
                default:
                    valid = false;
                    break;
            }
            if (!valid) {
                pub.addMessage(messages, options.message, value);
            }
        },
        ip: function(value, messages, options) {
            if (options.skipOnEmpty && pub.isEmpty(value)) {
                return;
            }
            var negation = null,
                cidr = null,
                matches = new RegExp(options.ipParsePattern).exec(value);
            if (matches) {
                negation = matches[1] || null;
                value = matches[2];
                cidr = matches[4] || null;
            }
            if (options.subnet === true && cidr === null) {
                pub.addMessage(messages, options.messages.noSubnet, value);
                return;
            }
            if (options.subnet === false && cidr !== null) {
                pub.addMessage(messages, options.messages.hasSubnet, value);
                return;
            }
            if (options.negation === false && negation !== null) {
                pub.addMessage(messages, options.messages.message, value);
                return;
            }
            var ipVersion = value.indexOf(':') === -1 ? 4 : 6;
            if (ipVersion == 6) {
                if (!(new RegExp(options.ipv6Pattern)).test(value)) {
                    pub.addMessage(messages, options.messages.message, value);
                }
                if (!options.ipv6) {
                    pub.addMessage(messages, options.messages.ipv6NotAllowed, value);
                }
            } else {
                if (!(new RegExp(options.ipv4Pattern)).test(value)) {
                    pub.addMessage(messages, options.messages.message, value);
                }
                if (!options.ipv4) {
                    pub.addMessage(messages, options.messages.ipv4NotAllowed, value);
                }
            }
        }
    };

    function getUploadedFiles(attribute, messages, options) {
        if (typeof File === "undefined") {
            return [];
        }
        var files = $(attribute.input, attribute.$form).get(0).files;
        if (!files) {
            messages.push(options.message);
            return [];
        }
        if (files.length === 0) {
            if (!options.skipOnEmpty) {
                messages.push(options.uploadRequired);
            }
            return [];
        }
        if (options.maxFiles && options.maxFiles < files.length) {
            messages.push(options.tooMany);
            return [];
        }
        return files;
    }

    function validateFile(file, messages, options) {
        if (options.extensions && options.extensions.length > 0) {
            var index = file.name.lastIndexOf('.');
            var ext = !~index ? '' : file.name.substr(index + 1, file.name.length).toLowerCase();
            if (!~options.extensions.indexOf(ext)) {
                messages.push(options.wrongExtension.replace(/\{file\}/g, file.name));
            }
        }
        if (options.mimeTypes && options.mimeTypes.length > 0) {
            if (!validateMimeType(options.mimeTypes, file.type)) {
                messages.push(options.wrongMimeType.replace(/\{file\}/g, file.name));
            }
        }
        if (options.maxSize && options.maxSize < file.size) {
            messages.push(options.tooBig.replace(/\{file\}/g, file.name));
        }
        if (options.minSize && options.minSize > file.size) {
            messages.push(options.tooSmall.replace(/\{file\}/g, file.name));
        }
    }

    function validateMimeType(mimeTypes, fileType) {
        for (var i = 0, len = mimeTypes.length; i < len; i++) {
            if (new RegExp(mimeTypes[i]).test(fileType)) {
                return true;
            }
        }
        return false;
    }

    function validateImageSize(file, image, messages, options) {
        if (options.minWidth && image.width < options.minWidth) {
            messages.push(options.underWidth.replace(/\{file\}/g, file.name));
        }
        if (options.maxWidth && image.width > options.maxWidth) {
            messages.push(options.overWidth.replace(/\{file\}/g, file.name));
        }
        if (options.minHeight && image.height < options.minHeight) {
            messages.push(options.underHeight.replace(/\{file\}/g, file.name));
        }
        if (options.maxHeight && image.height > options.maxHeight) {
            messages.push(options.overHeight.replace(/\{file\}/g, file.name));
        }
    }
    return pub;
})(jQuery);;
(function($) {
    $.fn.yiiActiveForm = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.yiiActiveForm');
            return false;
        }
    };
    var events = {
        beforeValidate: 'beforeValidate',
        afterValidate: 'afterValidate',
        beforeValidateAttribute: 'beforeValidateAttribute',
        afterValidateAttribute: 'afterValidateAttribute',
        beforeSubmit: 'beforeSubmit',
        ajaxBeforeSend: 'ajaxBeforeSend',
        ajaxComplete: 'ajaxComplete',
        afterInit: 'afterInit'
    };
    var defaults = {
        encodeErrorSummary: true,
        errorSummary: '.error-summary',
        validateOnSubmit: true,
        errorCssClass: 'has-error',
        successCssClass: 'has-success',
        validatingCssClass: 'validating',
        ajaxParam: 'ajax',
        ajaxDataType: 'json',
        validationUrl: undefined,
        scrollToError: true,
        scrollToErrorOffset: 0,
        validationStateOn: 'container'
    };
    var attributeDefaults = {
        id: undefined,
        name: undefined,
        container: undefined,
        input: undefined,
        error: '.help-block',
        encodeError: true,
        validateOnChange: true,
        validateOnBlur: true,
        validateOnType: false,
        validationDelay: 500,
        enableAjaxValidation: false,
        validate: undefined,
        status: 0,
        cancelled: false,
        value: undefined,
        updateAriaInvalid: true
    };
    var submitDefer;
    var setSubmitFinalizeDefer = function($form) {
        submitDefer = $.Deferred();
        $form.data('yiiSubmitFinalizePromise', submitDefer.promise());
    };
    var submitFinalize = function($form) {
        if (submitDefer) {
            submitDefer.resolve();
            submitDefer = undefined;
            $form.removeData('yiiSubmitFinalizePromise');
        }
    };
    var methods = {
        init: function(attributes, options) {
            return this.each(function() {
                var $form = $(this);
                if ($form.data('yiiActiveForm')) {
                    return;
                }
                var settings = $.extend({}, defaults, options || {});
                if (settings.validationUrl === undefined) {
                    settings.validationUrl = $form.attr('action');
                }
                $.each(attributes, function(i) {
                    attributes[i] = $.extend({
                        value: getValue($form, this)
                    }, attributeDefaults, this);
                    watchAttribute($form, attributes[i]);
                });
                $form.data('yiiActiveForm', {
                    settings: settings,
                    attributes: attributes,
                    submitting: false,
                    validated: false,
                    options: getFormOptions($form)
                });
                $form.on('reset.yiiActiveForm', methods.resetForm);
                if (settings.validateOnSubmit) {
                    $form.on('mouseup.yiiActiveForm keyup.yiiActiveForm', ':submit', function() {
                        $form.data('yiiActiveForm').submitObject = $(this);
                    });
                    $form.on('submit.yiiActiveForm', methods.submitForm);
                }
                var event = $.Event(events.afterInit);
                $form.trigger(event);
            });
        },
        add: function(attribute) {
            var $form = $(this);
            attribute = $.extend({
                value: getValue($form, attribute)
            }, attributeDefaults, attribute);
            $form.data('yiiActiveForm').attributes.push(attribute);
            watchAttribute($form, attribute);
        },
        remove: function(id) {
            var $form = $(this),
                attributes = $form.data('yiiActiveForm').attributes,
                index = -1,
                attribute = undefined;
            $.each(attributes, function(i) {
                if (attributes[i]['id'] == id) {
                    index = i;
                    attribute = attributes[i];
                    return false;
                }
            });
            if (index >= 0) {
                attributes.splice(index, 1);
                unwatchAttribute($form, attribute);
            }
            return attribute;
        },
        validateAttribute: function(id) {
            var attribute = methods.find.call(this, id);
            if (attribute != undefined) {
                validateAttribute($(this), attribute, true);
            }
        },
        find: function(id) {
            var attributes = $(this).data('yiiActiveForm').attributes,
                result = undefined;
            $.each(attributes, function(i) {
                if (attributes[i]['id'] == id) {
                    result = attributes[i];
                    return false;
                }
            });
            return result;
        },
        destroy: function() {
            return this.each(function() {
                $(this).off('.yiiActiveForm');
                $(this).removeData('yiiActiveForm');
            });
        },
        data: function() {
            return this.data('yiiActiveForm');
        },
        validate: function(forceValidate) {
            if (forceValidate) {
                $(this).data('yiiActiveForm').submitting = true;
            }
            var $form = $(this),
                data = $form.data('yiiActiveForm'),
                needAjaxValidation = false,
                messages = {},
                deferreds = deferredArray(),
                submitting = data.submitting;
            if (submitting) {
                var event = $.Event(events.beforeValidate);
                $form.trigger(event, [messages, deferreds]);
                if (event.result === false) {
                    data.submitting = false;
                    submitFinalize($form);
                    return;
                }
            }
            $.each(data.attributes, function() {
                this.$form = $form;
                if (!$(this.input).is(":disabled")) {
                    this.cancelled = false;
                    if (data.submitting || this.status === 2 || this.status === 3) {
                        var msg = messages[this.id];
                        if (msg === undefined) {
                            msg = [];
                            messages[this.id] = msg;
                        }
                        var event = $.Event(events.beforeValidateAttribute);
                        $form.trigger(event, [this, msg, deferreds]);
                        if (event.result !== false) {
                            if (this.validate) {
                                this.validate(this, getValue($form, this), msg, deferreds, $form);
                            }
                            if (this.enableAjaxValidation) {
                                needAjaxValidation = true;
                            }
                        } else {
                            this.cancelled = true;
                        }
                    }
                }
            });
            $.when.apply(this, deferreds).always(function() {
                for (var i in messages) {
                    if (0 === messages[i].length) {
                        delete messages[i];
                    }
                }
                if (needAjaxValidation && ($.isEmptyObject(messages) || data.submitting)) {
                    var $button = data.submitObject,
                        extData = '&' + data.settings.ajaxParam + '=' + $form.attr('id');
                    if ($button && $button.length && $button.attr('name')) {
                        extData += '&' + $button.attr('name') + '=' + $button.attr('value');
                    }
                    $.ajax({
                        url: data.settings.validationUrl,
                        type: $form.attr('method'),
                        data: $form.serialize() + extData,
                        dataType: data.settings.ajaxDataType,
                        complete: function(jqXHR, textStatus) {
                            $form.trigger(events.ajaxComplete, [jqXHR, textStatus]);
                        },
                        beforeSend: function(jqXHR, settings) {
                            $form.trigger(events.ajaxBeforeSend, [jqXHR, settings]);
                        },
                        success: function(msgs) {
                            if (msgs !== null && typeof msgs === 'object') {
                                $.each(data.attributes, function() {
                                    if (!this.enableAjaxValidation || this.cancelled) {
                                        delete msgs[this.id];
                                    }
                                });
                                updateInputs($form, $.extend(messages, msgs), submitting);
                            } else {
                                updateInputs($form, messages, submitting);
                            }
                        },
                        error: function() {
                            data.submitting = false;
                            submitFinalize($form);
                        }
                    });
                } else if (data.submitting) {
                    window.setTimeout(function() {
                        updateInputs($form, messages, submitting);
                    }, 200);
                } else {
                    updateInputs($form, messages, submitting);
                }
            });
        },
        submitForm: function() {
            var $form = $(this),
                data = $form.data('yiiActiveForm');
            if (data.validated) {
                data.submitting = false;
                var event = $.Event(events.beforeSubmit);
                $form.trigger(event);
                if (event.result === false) {
                    data.validated = false;
                    submitFinalize($form);
                    return false;
                }
                updateHiddenButton($form);
                return true;
            } else {
                setSubmitFinalizeDefer($form);
                if (data.settings.timer !== undefined) {
                    clearTimeout(data.settings.timer);
                }
                data.submitting = true;
                methods.validate.call($form);
                return false;
            }
        },
        resetForm: function() {
            var $form = $(this);
            var data = $form.data('yiiActiveForm');
            window.setTimeout(function() {
                $.each(data.attributes, function() {
                    this.value = getValue($form, this);
                    this.status = 0;
                    var $container = $form.find(this.container),
                        $input = findInput($form, this),
                        $errorElement = data.settings.validationStateOn === 'input' ? $input : $container;
                    $errorElement.removeClass(data.settings.validatingCssClass + ' ' +
                        data.settings.errorCssClass + ' ' +
                        data.settings.successCssClass);
                    $container.find(this.error).html('');
                });
                $form.find(data.settings.errorSummary).hide().find('ul').html('');
            }, 1);
        },
        updateMessages: function(messages, summary) {
            var $form = $(this);
            var data = $form.data('yiiActiveForm');
            $.each(data.attributes, function() {
                updateInput($form, this, messages);
            });
            if (summary) {
                updateSummary($form, messages);
            }
        },
        updateAttribute: function(id, messages) {
            var attribute = methods.find.call(this, id);
            if (attribute != undefined) {
                var msg = {};
                msg[id] = messages;
                updateInput($(this), attribute, msg);
            }
        }
    };
    var watchAttribute = function($form, attribute) {
        var $input = findInput($form, attribute);
        if (attribute.validateOnChange) {
            $input.on('change.yiiActiveForm', function() {
                validateAttribute($form, attribute, false);
            });
        }
        if (attribute.validateOnBlur) {
            $input.on('blur.yiiActiveForm', function() {
                if (attribute.status == 0 || attribute.status == 1) {
                    validateAttribute($form, attribute, true);
                }
            });
        }
        if (attribute.validateOnType) {
            $input.on('keyup.yiiActiveForm', function(e) {
                if ($.inArray(e.which, [16, 17, 18, 37, 38, 39, 40]) !== -1) {
                    return;
                }
                if (attribute.value !== getValue($form, attribute)) {
                    validateAttribute($form, attribute, false, attribute.validationDelay);
                }
            });
        }
    };
    var unwatchAttribute = function($form, attribute) {
        findInput($form, attribute).off('.yiiActiveForm');
    };
    var validateAttribute = function($form, attribute, forceValidate, validationDelay) {
        var data = $form.data('yiiActiveForm');
        if (forceValidate) {
            attribute.status = 2;
        }
        $.each(data.attributes, function() {
            if (this.value !== getValue($form, this)) {
                this.status = 2;
                forceValidate = true;
            }
        });
        if (!forceValidate) {
            return;
        }
        if (data.settings.timer !== undefined) {
            clearTimeout(data.settings.timer);
        }
        data.settings.timer = window.setTimeout(function() {
            if (data.submitting || $form.is(':hidden')) {
                return;
            }
            $.each(data.attributes, function() {
                if (this.status === 2) {
                    this.status = 3;
                    $form.find(this.container).addClass(data.settings.validatingCssClass);
                }
            });
            methods.validate.call($form);
        }, validationDelay ? validationDelay : 200);
    };
    var deferredArray = function() {
        var array = [];
        array.add = function(callback) {
            this.push(new $.Deferred(callback));
        };
        return array;
    };
    var buttonOptions = ['action', 'target', 'method', 'enctype'];
    var getFormOptions = function($form) {
        var attributes = {};
        for (var i = 0; i < buttonOptions.length; i++) {
            attributes[buttonOptions[i]] = $form.attr(buttonOptions[i]);
        }
        return attributes;
    };
    var applyButtonOptions = function($form, $button) {
        for (var i = 0; i < buttonOptions.length; i++) {
            var value = $button.attr('form' + buttonOptions[i]);
            if (value) {
                $form.attr(buttonOptions[i], value);
            }
        }
    };
    var restoreButtonOptions = function($form) {
        var data = $form.data('yiiActiveForm');
        for (var i = 0; i < buttonOptions.length; i++) {
            $form.attr(buttonOptions[i], data.options[buttonOptions[i]] || null);
        }
    };
    var updateInputs = function($form, messages, submitting) {
        var data = $form.data('yiiActiveForm');
        if (data === undefined) {
            return false;
        }
        if (submitting) {
            var errorAttributes = [];
            $.each(data.attributes, function() {
                if (!$(this.input).is(":disabled") && !this.cancelled && updateInput($form, this, messages)) {
                    errorAttributes.push(this);
                }
            });
            $form.trigger(events.afterValidate, [messages, errorAttributes]);
            updateSummary($form, messages);
            if (errorAttributes.length) {
                if (data.settings.scrollToError) {
                    var top = $form.find($.map(errorAttributes, function(attribute) {
                        return attribute.input;
                    }).join(',')).first().closest(':visible').offset().top - data.settings.scrollToErrorOffset;
                    if (top < 0) {
                        top = 0;
                    } else if (top > $(document).height()) {
                        top = $(document).height();
                    }
                    var wtop = $(window).scrollTop();
                    if (top < wtop || top > wtop + $(window).height()) {
                        $(window).scrollTop(top);
                    }
                }
                data.submitting = false;
            } else {
                data.validated = true;
                if (data.submitObject) {
                    applyButtonOptions($form, data.submitObject);
                }
                $form.submit();
                if (data.submitObject) {
                    restoreButtonOptions($form);
                }
            }
        } else {
            $.each(data.attributes, function() {
                if (!this.cancelled && (this.status === 2 || this.status === 3)) {
                    updateInput($form, this, messages);
                }
            });
        }
        submitFinalize($form);
    };
    var updateHiddenButton = function($form) {
        var data = $form.data('yiiActiveForm');
        var $button = data.submitObject || $form.find(':submit:first');
        if ($button.length && $button.attr('type') == 'submit' && $button.attr('name')) {
            var $hiddenButton = $('input[type="hidden"][name="' + $button.attr('name') + '"]', $form);
            if (!$hiddenButton.length) {
                $('<input>').attr({
                    type: 'hidden',
                    name: $button.attr('name'),
                    value: $button.attr('value')
                }).appendTo($form);
            } else {
                $hiddenButton.attr('value', $button.attr('value'));
            }
        }
    };
    var updateInput = function($form, attribute, messages) {
        var data = $form.data('yiiActiveForm'),
            $input = findInput($form, attribute),
            hasError = false;
        if (!$.isArray(messages[attribute.id])) {
            messages[attribute.id] = [];
        }
        attribute.status = 1;
        if ($input.length) {
            hasError = messages[attribute.id].length > 0;
            var $container = $form.find(attribute.container);
            var $error = $container.find(attribute.error);
            updateAriaInvalid($form, attribute, hasError);
            var $errorElement = data.settings.validationStateOn === 'input' ? $input : $container;
            if (hasError) {
                if (attribute.encodeError) {
                    $error.text(messages[attribute.id][0]);
                } else {
                    $error.html(messages[attribute.id][0]);
                }
                $errorElement.removeClass(data.settings.validatingCssClass + ' ' + data.settings.successCssClass).addClass(data.settings.errorCssClass);
            } else {
                $error.empty();
                $errorElement.removeClass(data.settings.validatingCssClass + ' ' + data.settings.errorCssClass + ' ').addClass(data.settings.successCssClass);
            }
            attribute.value = getValue($form, attribute);
        }
        $form.trigger(events.afterValidateAttribute, [attribute, messages[attribute.id]]);
        return hasError;
    };
    var updateSummary = function($form, messages) {
        var data = $form.data('yiiActiveForm'),
            $summary = $form.find(data.settings.errorSummary),
            $ul = $summary.find('ul').empty();
        if ($summary.length && messages) {
            $.each(data.attributes, function() {
                if ($.isArray(messages[this.id]) && messages[this.id].length) {
                    var error = $('<li/>');
                    if (data.settings.encodeErrorSummary) {
                        error.text(messages[this.id][0]);
                    } else {
                        error.html(messages[this.id][0]);
                    }
                    $ul.append(error);
                }
            });
            $summary.toggle($ul.find('li').length > 0);
        }
    };
    var getValue = function($form, attribute) {
        var $input = findInput($form, attribute);
        var type = $input.attr('type');
        if (type === 'checkbox' || type === 'radio') {
            var $realInput = $input.filter(':checked');
            if (!$realInput.length) {
                $realInput = $form.find('input[type=hidden][name="' + $input.attr('name') + '"]');
            }
            return $realInput.val();
        } else {
            return $input.val();
        }
    };
    var findInput = function($form, attribute) {
        var $input = $form.find(attribute.input);
        if ($input.length && $input[0].tagName.toLowerCase() === 'div') {
            return $input.find('input');
        } else {
            return $input;
        }
    };
    var updateAriaInvalid = function($form, attribute, hasError) {
        if (attribute.updateAriaInvalid) {
            $form.find(attribute.input).attr('aria-invalid', hasError ? 'true' : 'false');
        }
    }
})(window.jQuery);;
/*!
 * @package    yii2-krajee-base
 * @subpackage yii2-widget-activeform
 * @author     Kartik Visweswaran <kartikv2@gmail.com>
 * @copyright  Copyright &copy; Kartik Visweswaran, Krajee.com, 2014 - 2017
 * @version    1.8.9
 *
 * Common script file for all kartik\widgets.
 *
 * For more JQuery/Bootstrap plugins and demos visit http://plugins.krajee.com
 * For more Yii related demos visit http://demos.krajee.com
 */
var kvInitHtml5;
! function(a) {
    "use strict";
    kvInitHtml5 = function(b, c) {
        var d = a(b),
            e = a(c);
        a(document).on("change", b, function() {
            e.val(this.value)
        }).on("input change", c, function(a) {
            d.val(this.value), "change" === a.type && d.trigger("change")
        })
    }
}(window.jQuery);;