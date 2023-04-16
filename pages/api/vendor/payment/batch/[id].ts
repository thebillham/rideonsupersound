import { NextApiResponse } from 'next'
import { requireScope } from 'lib/api/utils'
import { NextAuthenticatedApiRequest } from '@serverless-jwt/next/dist/types'
import { dbGetBatchVendorPayment } from 'lib/database/vendor'

const apiRoute = async (req: NextAuthenticatedApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const { id } = req.query
      return dbGetBatchVendorPayment(id).then((data) => res.status(200).json(data))
    } catch (error) {
      res.status(error.status || 500).json({
        code: error.code,
        error: error.message,
      })
    }
    // } else if (req.method === 'PATCH') {
    //   const { id } = req.query
    //   const vendor = req.body
    //   try {
    //     return dbUpdateVendor(vendor, id).then((data) =>
    //       res.status(200).json(data)
    //     )
    //   } catch (error) {
    //     res.status(error.status || 500).json({
    //       code: error.code,
    //       error: error.message,
    //     })
    //   }
  }
}

export default requireScope('clerk', apiRoute)
