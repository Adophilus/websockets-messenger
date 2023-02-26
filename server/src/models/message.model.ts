import { Model, Table, Column } from 'sequelize-typescript'

@Table({
  tableName: 'messages'
})
class Message extends Model {
  @Column
  public declare sender: string

  @Column
  public declare recepient: string

  @Column
  public declare message: string

  @Column
  public declare image: string

  @Column
  public declare has_read: boolean
}

export default Message
