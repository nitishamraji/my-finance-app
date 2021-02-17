/**
 * Handler to catch `async` operation errors.
 * Reduces having to write `try-catch` all the time.
 */
exports.catchErrors = action => (req, res, next) => action(req, res).catch(next)

/**
 * Show useful information to client in development.
 */
exports.devErrorHandler = (err, req, res, next) => {
  err.stack = err.stack || ''
  const status = err.status || 500
  // const error = { success: false, msg: err }
  console.log(err)
  res.status(status)
  res.json({ status, success: false, msg: err.stack  })
}
