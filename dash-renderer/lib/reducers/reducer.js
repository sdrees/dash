"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createReducer = createReducer;
exports.apiRequests = void 0;

var _ramda = require("ramda");

var _redux = require("redux");

var _dependencies_ts = require("../actions/dependencies_ts");

var _api = _interopRequireDefault(require("./api"));

var _appLifecycle = _interopRequireDefault(require("./appLifecycle"));

var _callbacks = _interopRequireDefault(require("./callbacks"));

var _config = _interopRequireDefault(require("./config"));

var _dependencyGraph = _interopRequireDefault(require("./dependencyGraph"));

var _error = _interopRequireDefault(require("./error"));

var _history = _interopRequireDefault(require("./history"));

var _hooks = _interopRequireDefault(require("./hooks"));

var _profile = _interopRequireDefault(require("./profile"));

var _changed = _interopRequireDefault(require("./changed"));

var _isLoading = _interopRequireDefault(require("./isLoading"));

var _layout = _interopRequireDefault(require("./layout"));

var _loadingMap = _interopRequireDefault(require("./loadingMap"));

var _paths = _interopRequireDefault(require("./paths"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var apiRequests = ['dependenciesRequest', 'layoutRequest', 'reloadRequest', 'loginRequest'];
exports.apiRequests = apiRequests;

function mainReducer() {
  var parts = {
    appLifecycle: _appLifecycle["default"],
    callbacks: _callbacks["default"],
    config: _config["default"],
    error: _error["default"],
    graphs: _dependencyGraph["default"],
    history: _history["default"],
    hooks: _hooks["default"],
    profile: _profile["default"],
    changed: _changed["default"],
    isLoading: _isLoading["default"],
    layout: _layout["default"],
    loadingMap: _loadingMap["default"],
    paths: _paths["default"]
  };
  (0, _ramda.forEach)(function (r) {
    parts[r] = (0, _api["default"])(r);
  }, apiRequests);
  return (0, _redux.combineReducers)(parts);
}

function getInputHistoryState(payload, state, recordChanges) {
  var graphs = state.graphs,
      paths = state.paths,
      layout = state.layout;
  var itempath = payload.itempath,
      props = payload.props;
  var refProps = (0, _ramda.path)(itempath.concat(['props']), layout) || {};
  var id = refProps.id;
  var historyEntry;

  if (id) {
    if (recordChanges) {
      state.changed = {
        id: id,
        props: props
      };
    }

    historyEntry = {
      id: id,
      props: {}
    };
    (0, _ramda.keys)(props).forEach(function (propKey) {
      if ((0, _dependencies_ts.getCallbacksByInput)(graphs, paths, id, propKey).length) {
        historyEntry.props[propKey] = refProps[propKey];
      }
    });
  }

  return historyEntry;
}

function recordHistory(reducer) {
  return function (state, action) {
    // Record initial state
    var type = action.type,
        payload = action.payload;

    if (type === 'ON_PROP_CHANGE') {
      // history records all prop changes that are inputs.
      var historyEntry = getInputHistoryState(payload, state, true);

      if (historyEntry && !(0, _ramda.isEmpty)(historyEntry.props)) {
        state.history.present = historyEntry;
      }
    }

    var nextState = reducer(state, action);

    if (type === 'ON_PROP_CHANGE' && payload.source !== 'response') {
      /*
       * if the prop change is an input, then
       * record it so that it can be played back
       */
      var _historyEntry = getInputHistoryState(payload, nextState);

      if (_historyEntry && !(0, _ramda.isEmpty)(_historyEntry.props)) {
        nextState.history = {
          past: [].concat(_toConsumableArray(nextState.history.past), [state.history.present]),
          present: _historyEntry,
          future: []
        };
      }
    }

    return nextState;
  };
}

function reloaderReducer(reducer) {
  return function (state, action) {
    var _ref = state || {},
        history = _ref.history,
        config = _ref.config,
        hooks = _ref.hooks;

    var newState = state;

    if (action.type === 'RELOAD') {
      newState = {
        history: history,
        config: config,
        hooks: hooks
      };
    } else if (action.type === 'SET_CONFIG') {
      // new config also reloads, and even clears history,
      // in case there's a new user or even a totally different app!
      // hooks are set at an even higher level than config though.
      newState = {
        hooks: hooks
      };
    }

    return reducer(newState, action);
  };
}

function createReducer() {
  return reloaderReducer(recordHistory(mainReducer()));
}