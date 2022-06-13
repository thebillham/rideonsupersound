import { NextApiHandler } from 'next'
import { query } from '../../lib/db'

const handler: NextApiHandler = async (req, res) => {
  const { k } = req.query
  const { vendor_payment_id } = req.body
  try {
    if (!k || k !== process.env.NEXT_PUBLIC_SWR_API_KEY)
      return res.status(401).json({ message: 'Resource Denied.' })
    const results = await query(
      // `
      // DELETE FROM sale_item WHERE sale_id = ? AND item_id = ?
      // `,
      `
      UPDATE vendor_payment SET is_deleted = 1 WHERE id = ?
      `,
      [vendor_payment_id]
    )
    return res.json(results)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler
