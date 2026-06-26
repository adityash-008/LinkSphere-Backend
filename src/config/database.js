const mongoose = require('mongoose')

const dbConnect = async () => {
    try {
        await mongoose.connect(
            process.env.DB_CONNECTION_STRING
        )
    } catch(err) {
        console.error("DB Connection Error:", err.message)
        throw err
    }
}

module.exports = dbConnect