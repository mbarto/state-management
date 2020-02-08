import todosView from './view/todos.js'
import counterView from './view/counter.js'
import filtersView from './view/filters.js'
import appView from './view/app.js'
import applyDiff from './applyDiff.js'

import registry from './registry.js'
import connect from './connect.js'
import { Machine, interpret, assign } from "xstate";

// UI MAPPING
const counterMapper = (state) => {
  return state.finiteState
}

registry.add('app', appView)
registry.add('todos', todosView)
registry.add('counter', connect(counterMapper)(counterView))
registry.add('filters', filtersView)

// TRANSITIONS
const addItem = assign({
  todos: (context, event) => context.todos.concat(event.item)
})

const loadItem = assign({
  todos: (context, event) => context.todos.concat(event.data)
})

const removeItem = assign({
  todos: (context, event) => context.todos.filter((item, index) => index !== parseInt(event.index))
})

// SIDE EFFECTS
const loadFromServer = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ text: "from server" }), 1000)
  })


// STATE
const todosMachine = Machine({
  id: "todos",
  context: {
    todos: [],
    currentFilter: 'All'
  },
  initial: "empty",
  states: {
    empty: {
      /*invoke: {
        id: 'load',
        src: () => loadFromServer(),
        onDone: {
          target: 'withoneitem',
          actions: loadItem
        },
        onError: {
          target: 'empty'
        }
      },*/
      on: {
        "ADD_ITEM": {
          target: 'withoneitem',
          actions: addItem,
        }
      }
    },
    withoneitem: {
      on: {
        "DELETE_ITEM": {
          target: "empty",
          actions: removeItem
        },
        "ADD_ITEM": {
          target: 'withmoreitems',
          actions: addItem,
        }
      }
    },
    withmoreitems: {
      on: {
        "DELETE_ITEM": [{
          target: "withoneitem",
          actions: removeItem,
          cond: (context) => {
            return context.todos.length === 2;
          }
        },
        {
          actions: removeItem
        }],
        "ADD_ITEM": {
          actions: addItem,
        }
      }
    }
  }
});

const todosService = interpret(todosMachine).onTransition(state => {
  console.log(state.value)
  render(getState(state))
});

// EVENTS
const events = {
  deleteItem: (index) => {
    todosService.send("DELETE_ITEM", { index })
  },
  addItem: text => {
    todosService.send("ADD_ITEM", {
      item: {
        text,
        completed: false
      }
    })
  }
}

const render = (state) => {
  window.requestAnimationFrame(() => {
    const main = document.querySelector('#root')

    const newMain = registry.renderRoot(
      main,
      state,
      events)

    applyDiff(document.body, main, newMain)
  })
}

const getState = (state) => ({
  ...state.context,
  finiteState: state.value
})

// UI MAPPING
render(getState(todosMachine.initialState))

todosService.start();
