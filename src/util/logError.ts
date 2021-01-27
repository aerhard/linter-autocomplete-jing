const logError = (message: string, error?: Error) => {
  error
    ? console.error(`[linter-autocomplete-jing] ${message}`, error) // eslint-disable-line no-console
    : console.error(`[linter-autocomplete-jing] ${message}`) // eslint-disable-line no-console
}

export default logError
