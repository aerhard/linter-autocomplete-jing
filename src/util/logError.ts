const logError = (message: string, error?: Error) => {
  error
    ? console.error(message, error) // eslint-disable-line no-console
    : console.error(message) // eslint-disable-line no-console
}

export default logError
