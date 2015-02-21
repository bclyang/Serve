module.exports = {
  mongoUrl: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/treehacks-db"
}
