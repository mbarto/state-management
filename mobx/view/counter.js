const getTodoCount = length => {
  if (length === 1) {
    return '1 Item left'
  }

  return `${length} Items left`
}

export default (targetElement, length) => {
  const newCounter = targetElement.cloneNode(true)
  newCounter.textContent = getTodoCount(length)
  return newCounter
}
