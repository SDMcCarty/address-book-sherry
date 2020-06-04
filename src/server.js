const app = require('./app')
const { PORT } = require('./config')

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})