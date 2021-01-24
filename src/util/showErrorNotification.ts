const showErrorNotification = (err: Error) => {
  atom.notifications.addError(`[linter-autocomplete-jing] ${err.message}`, {
    detail: err.stack,
    dismissable: true,
  })
}

export default showErrorNotification
