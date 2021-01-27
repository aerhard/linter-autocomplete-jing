export const showWarningNotification = (message: string, detail: string) => {
  atom.notifications.addWarning(`[linter-autocomplete-jing] ${message}`, {
    detail,
    dismissable: true,
  })
}

export const showErrorNotification = (err: Error) => {
  atom.notifications.addError(`[linter-autocomplete-jing] ${err.message}`, {
    detail: err.stack,
    dismissable: true,
  })
}
