"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ramda = require("ramda");

var _callbacks = require("../actions/callbacks");

var _callbacks2 = require("../utils/callbacks");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var observer = {
  observer: function observer(_ref) {
    var dispatch = _ref.dispatch,
        getState = _ref.getState;

    var _getState = getState(),
        callbacks = _getState.callbacks;

    var pendingCallbacks = (0, _callbacks2.getPendingCallbacks)(callbacks);

    var _getState2 = getState(),
        stored = _getState2.callbacks.stored;

    var _partition = (0, _ramda.partition)(function (cb) {
      return (0, _ramda.isNil)(cb.executionGroup);
    }, stored),
        _partition2 = _slicedToArray(_partition, 2),
        nullGroupCallbacks = _partition2[0],
        groupCallbacks = _partition2[1];

    var executionGroups = (0, _ramda.groupBy)(function (cb) {
      return cb.executionGroup;
    }, groupCallbacks);
    var pendingGroups = (0, _ramda.groupBy)(function (cb) {
      return cb.executionGroup;
    }, (0, _ramda.filter)(function (cb) {
      return !(0, _ramda.isNil)(cb.executionGroup);
    }, pendingCallbacks));
    var dropped = (0, _ramda.reduce)(function (res, _ref2) {
      var _ref3 = _slicedToArray(_ref2, 2),
          executionGroup = _ref3[0],
          executionGroupCallbacks = _ref3[1];

      return !pendingGroups[executionGroup] ? (0, _ramda.concat)(res, executionGroupCallbacks) : res;
    }, [], (0, _ramda.toPairs)(executionGroups));
    dispatch((0, _callbacks.aggregateCallbacks)([nullGroupCallbacks.length ? (0, _callbacks.removeStoredCallbacks)(nullGroupCallbacks) : null, dropped.length ? (0, _callbacks.removeStoredCallbacks)(dropped) : null]));
  },
  inputs: ['callbacks.stored', 'callbacks.completed']
};
var _default = observer;
exports["default"] = _default;