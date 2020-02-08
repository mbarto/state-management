const getTodoCount = items => {
  if (items === 1) {
    return '1 Item left'
  }

  return `${items} Items left`
}

export default (targetElement, items) => {
  const newCounter = targetElement.cloneNode(true)
  newCounter.textContent = getTodoCount(items)
  return newCounter
}
