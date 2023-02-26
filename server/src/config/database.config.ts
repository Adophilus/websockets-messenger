import { Dialect } from 'sequelize'

const defaultDialect: Dialect = 'sqlite'

export default {
  uri: process.env.DB_URI ? process.env.DB_URI : 'sqlite:///db.sqlite3',
  path: process.env.DB_PATH ? process.env.DB_PATH : 'db.sqlite3',
  dialect: process.env.DB_DIALECT
    ? (String(process.env.DB_DIALECT) as Dialect)
    : defaultDialect,
  username: process.env.DB_USERNAME ? String(process.env.DB_USERNAME) : '',
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : ''
}
