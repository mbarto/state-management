import todosView from './view/todos.js'
import counterView from './view/counter.js'
import filtersView from './view/filters.js'
import appView from './view/app.js'
import applyDiff from './applyDiff.js'

import registry from './registry.js'

import { createStore } from 'redux';
// import { createStore, applyMiddleware } from 'redux';
// import thunk from 'redux-thunk';

import connect from './connect.js'

// UI MAPPING
const counterMapper = (state) => {
  const { todos } = state
  return todos.length
}

registry.add('app', appView)
registry.add('todos', todosView)
registry.add('counter', connect(counterMapper)(counterView))
registry.add('filters', filtersView)

const state = {
  todos: [],
  currentFilter: 'All'
}

// action creator -> boilerplate?
const addItem = (item) => ({
  type: 'ADD_ITEM',
  item
})

/*
SIDE EFFECTS:
const addItem = (item) => {
  return (dispatch) => {
    setTimeout(() => {
      dispatch({
        type: 'ADD_ITEM',
        item
      })
    }, 1000)
  }
}*/

const deleteItem = (index) => ({
  type: 'DELETE_ITEM',
  index
})

// TRANSITIONS
const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      return {
        ...state,
        todos: [
          ...state.todos,
          action.item
        ]
      }
    }
    case 'DELETE_ITEM': {
      return {
        ...state,
        todos: state.todos.filter((item, idx) => idx !== Number(action.index))
      }
    }
    default:
      return state
  }
}

// STATE
const store = createStore(reducer, state)
// , window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
// const store = createStore(reducer, state, applyMiddleware(thunk))

// EVENTS
const events = {
  deleteItem: (index) => {
    store.dispatch(deleteItem(index))
  },
  addItem: text => {
    store.dispatch(addItem({
      text,
      completed: false
    }))
  }
}

const render = (currentState) => {
  window.requestAnimationFrame(() => {
    const main = document.querySelector('#root')

    const newMain = registry.renderRoot(
      main,
      currentState,
      events)

    applyDiff(document.body, main, newMain)
  })
}
// UI MAPPING
store.subscribe(() => render(store.getState()))
render(state)
