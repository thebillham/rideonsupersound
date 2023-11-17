// const testCon = require('../testConn')
import testCon from '../testConn'
import { dbCreateCustomer } from '../customer'

beforeAll(() => testCon.migrate.latest())

beforeEach(() => testCon.seed.run())

afterAll(() => testCon.destroy())

describe('createCustomer', () => {
  it('create customer and return id', () => {
    return dbCreateCustomer({ name: 'Test Customer' }, testCon).then((customerId) => {
      expect(customerId).toEqual(3)
    })
  })
})
