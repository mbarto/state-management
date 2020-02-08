import todosView from './view/todos.js'
import counterView from './view/counter.js'
import filtersView from './view/filters.js'
import appView from './view/app.js'
import applyDiff from './applyDiff.js'

import registry from './registry.js'
import connect from './connect.js'

import { Subject, from } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators'

// STATE
const state = {
  todos: [],
  currentFilter: 'All',
  itemCount: 0
}

registry.add('app', appView)
registry.add('todos', todosView)
registry.add('counter', connect(() => state.itemCount)(counterView))
registry.add('filters', filtersView)

// STATE
const store = new Subject()
const eventDispatcher = new Subject()

// computed values
map(({ todos }) => todos
  .filter(todo => !todo.completed).length)(store).subscribe(count => {
    state.itemCount = count
  })

// SIDE EFFECTS
store.pipe(
  map(({ todos }) => from(someAsyncCall(todos))),
  mergeAll()
).subscribe((length) => {
  console.log("Current length: " + length)
})

const someAsyncCall = (todos) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(todos.length), 1000)
  })

// TRANSITIONS
eventDispatcher.subscribe((event) => {
  switch (event.type) {
    case "ADD_ITEM":
      state.todos.push(event.item)
      store.next(state);
      break;

    case "DELETE_ITEM":
      state.todos.splice(event.index, 1)
      store.next(state);
      break;
    default:
      break;
  }
});

// EVENTS
const events = {
  deleteItem: (index) => {
    eventDispatcher.next({ type: "DELETE_ITEM", index })
  },
  addItem: text => {
    eventDispatcher.next({
      type: "ADD_ITEM", item: {
        text,
        completed: false
      }
    })
  }
}

const render = (data) => {
  window.requestAnimationFrame(() => {
    const main = document.querySelector('#root')

    const newMain = registry.renderRoot(
      main,
      data,
      events)

    applyDiff(document.body, main, newMain)
  })
}
// UI MAPPING
store.subscribe((data) => {
  render(data)
})

store.next(state)
