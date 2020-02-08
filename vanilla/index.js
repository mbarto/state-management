import todosView from './view/todos.js'
import counterView from './view/counter.js'
import filtersView from './view/filters.js'
import appView from './view/app.js'

import applyDiff from './applyDiff.js'
import registry from './registry.js'

import connect from './connect.js'

// UI MAPPING
const counterMapper = (state) => {
  const { todos } = state
  return todos.length
}

// register all components (views) with the rendering engine (registry)
registry.add('app', appView)
registry.add('todos', todosView)
registry.add('counter', connect(counterMapper)(counterView))
registry.add('filters', filtersView)

// STATE
const state = {
  todos: [],
  currentFilter: 'All'
}

// SIDE EFFECTS
const someAsyncCall = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), 1000)
  })

const saveToServer = (todos) => {
  someAsyncCall(todos).then(() => {
    console.log("Todos saved!")
  })
}

// EVENTS / TRANSITIONS
const events = {
  deleteItem: (index) => {
    state.todos.splice(index, 1)
    // side effects: start
    console.log("item " + index + " deleted")
    saveToServer(state.todos)
    // side effects: end
    render()
  },
  addItem: text => {
    state.todos.push({
      text,
      completed: false
    })
    // side effects: start
    console.log("item " + text + " added")
    saveToServer(state.todos)
    // side effects: end
    render()
  }
}

const render = () => {
  window.requestAnimationFrame(() => {
    // app DOM container -> #root
    const main = document.querySelector('#root')

    // call rendering engine to create Virtual DOM
    const newMain = registry.renderRoot(
      main,
      state,
      events)

    // Virtual DOM applied to Real DOM
    applyDiff(document.body, main, newMain)
  })
}

render()
