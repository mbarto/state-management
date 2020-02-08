import todosView from './view/todos.js'
import counterView from './view/counter.js'
import filtersView from './view/filters.js'
import appView from './view/app.js'
import applyDiff from './applyDiff.js'

import registry from './registry.js'

import { types, onSnapshot, flow } from "mobx-state-tree"
import "babel-polyfill"

import connect from './connect.js'

// UI MAPPING
const counterMapper = (state) => state.itemCount

registry.add('app', appView)
registry.add('todos', todosView)
registry.add('counter', connect(counterMapper)(counterView))
registry.add('filters', filtersView)

const Todo = types
  .model("Todo", {
    text: types.string,
    completed: types.boolean
  })

// SIDE EFFECTS
const someAsyncCall = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), 1000)
  })

// TRANSITIONS
const syncActions = self => ({
  add(item) {
    self.todos.push(item)
  },
  delete(index) {
    self.todos.splice(index, 1)
  }
})

const asyncActions = self => ({
  add: flow(function* add(item) { // <- note the star, this a generator function!
    yield someAsyncCall()
    self.todos.push(item)
  }),
  delete(index) {
    self.todos.splice(index, 1)
  }
})

const Store = types.model("Store", {
  todos: types.array(Todo),
  currentFilter: types.string
}).views(self => ({
  get itemCount() {
    return self.todos.filter(todo => !todo.completed).length
  },
})).actions(syncActions)

const state = {
  todos: [],
  currentFilter: 'All'
}

// STATE
const store = Store.create(state)

// EVENTS
const events = {
  deleteItem: (index) => {
    store.delete(index)
  },
  addItem: text => {
    store.add({
      text,
      completed: false
    })
  }
}

const render = (snapshot) => {
  window.requestAnimationFrame(() => {
    const main = document.querySelector('#root')

    const newMain = registry.renderRoot(
      main,
      snapshot,
      events)

    applyDiff(document.body, main, newMain)
  })
}

render(store)
// UI MAPPING
onSnapshot(store, () => {
  render(store)
})
