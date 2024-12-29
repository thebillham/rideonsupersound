import { query } from 'lib/database/utils/db'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  const { uid } = req.query
  try {
    const results = await query(
      `
      SELECT * FROM vendor_payment
      WHERE NOT is_deleted AND
      vendor_id = (
        SELECT id FROM vendor WHERE uid = ?
        )
        ORDER BY date DESC
      `,
      uid,
    )

    return res.json(results)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler