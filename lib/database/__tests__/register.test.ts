// const testCon = require('../testConn')
import { dbGetCurrentRegister, dbGetCurrentRegisterId } from '../register'
import testCon from '../testConn'

beforeAll(() => testCon.migrate.latest())

beforeEach(() => testCon.seed.run())

afterAll(() => testCon.destroy())

describe('dbGetCashUp', () => {
  it('should have all the cash lists for the register', () => {
    return dbGetCurrentRegister(testCon).then((register) => {
      expect(register?.cashGiven).toHaveLength(1)
      expect(register?.cashReceived).toHaveLength(2)
      expect(register?.pettyCash[1].amount).toBe(2000)
      expect(register?.manualPayments[0].clerk_id).toBe(1)
    })
  })
})

describe('dbGetCurrentRegisterId', () => {
  it('should return the id of the current register', () => {
    return dbGetCurrentRegisterId(testCon).then((id) => {
      expect(id).toEqual(666)
    })
  })
})
