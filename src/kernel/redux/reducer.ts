// import { REGISTER_THREAD, UPDATE_THREAD } from "./actions.js";

// import { stat } from "fs";

var INITIAL_STATE = {};

export var reducer = (state = INITIAL_STATE, action: any) => {
  // switch (action.type) {
  //     case REGISTER_THREAD:
  //         if (!Object.keys(state).includes(action.thread.id))
  //             // Register thread only once
  //             state[action.thread.id] = action.thread.state;
  //         return state;
  //     case UPDATE_THREAD:
  //         if (Object.keys(state).includes(action.thread.id)) {
  //             // Ignore when thread is not registered
  //             state[action.thread.id] = action.thread.state;
  //         }
  //         return state;
  //     default:
  //         return state;
  // }
  return state;
};
