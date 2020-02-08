import todosView from './view/todos.js'
import counterView from './view/counter.js'
import filtersView from './view/filters.js'
import appView from './view/app.js'
import applyDiff from './applyDiff.js'

import registry from './registry.js'

import { configureStore, createSlice } from "@reduxjs/toolkit"

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

const initialState = {
    todos: [],
    currentFilter: 'All'
}

// TRANSITIONS
const todos = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        delete: (state, action) => {
            state.todos.splice(action.payload, 1)
        },
        add: (state, action) => {
            state.todos.push(action.payload)
        }
    }
})

// STATE
const store = configureStore({
    reducer: todos.reducer
})

// EVENTS
const events = {
    deleteItem: (index) => {
        store.dispatch(todos.actions.delete(index))
    },
    addItem: text => {
        store.dispatch(todos.actions.add({
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
render(initialState)
