import todosView from './view/todos.js'
import counterView from './view/counter.js'
import filtersView from './view/filters.js'
import appView from './view/app.js'
import applyDiff from './applyDiff.js'

import registry from './registry.js'
import { observable, computed, observe, action } from "mobx"

import connect from './connect.js'

// UI MAPPING
const counterMapper = (state) => state.itemCount


registry.add('app', appView)
registry.add('todos', todosView)
registry.add('counter', connect(counterMapper)(counterView))
registry.add('filters', filtersView)

// STATE
const todos = observable([])
const state = {
  todos,
  currentFilter: 'All',
  itemCount: computed(() => todos.filter(todo => !todo.completed)
    .length)
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
const transitions = {
  deleteItem: action((index) => {
    state.todos.splice(index, 1)
    // side effects: start
    console.log("item " + index + " deleted")
    saveToServer(state.todos)
    // side effects: end
  }),
  addItem: action(text => {
    state.todos.push({
      text,
      completed: false
    })
    // side effects: start
    console.log("item " + text + " added")
    saveToServer(state.todos)
    // side effects: end
  })
}

const render = () => {
  window.requestAnimationFrame(() => {
    const main = document.querySelector('#root')

    const newMain = registry.renderRoot(
      main,
      state,
      transitions)

    applyDiff(document.body, main, newMain)
  })
}

render()

// UI MAPPING
observe(state.todos, undefined, change => {
  render()
})
