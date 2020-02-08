const getTodoCount = state => {
  switch (state) {
    case "empty":
      return "No items"
    case "withoneitem":
      return "Lonely Item"
    case "withmoreitems":
      return "A lot of items"
    default:
      throw new Error("Impossible state")
  }
}

export default (targetElement, state) => {
  const newCounter = targetElement.cloneNode(true)
  newCounter.textContent = getTodoCount(state)
  return newCounter
}
