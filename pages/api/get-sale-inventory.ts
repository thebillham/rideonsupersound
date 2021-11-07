import { NextApiHandler } from "next";
import { query } from "../../lib/db";

const handler: NextApiHandler = async (req, res) => {
  try {
    const results = await query(
      `
      SELECT
        s.id,
        s.vendor_id,
        s.artist,
        s.title,
        s.display_as,
        s.media,
        s.format,
        s.image_url,
        s.is_gift_card,
        s.gift_card_code,
        s.gift_card_taken,
        s.gift_card_change_given,
        s.gift_card_amount,
        s.gift_card_remaining,
        s.gift_card_note,
        s.gift_card_is_valid,
        s.is_misc_item,
        s.misc_item_description,
        s.misc_item_amount,
        p.vendor_cut,
        p.total_sell,
      FROM stock AS s
      LEFT JOIN stock_price AS p ON p.stock_id = s.id
      WHERE
         p.id = (
            SELECT MAX(id)
            FROM stock_price
            WHERE stock_id = s.id
         )
      AND s.is_deleted = 0
      `
    );

    return res.json(results);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;

// SELECT
//   s.id,
//   s.vendor_id,
//   s.artist,
//   s.title,
//   s.format,
//   s.genre,
//   s.is_new,
//   s.cond,
//   stock_price1.vendor_cut,
//   stock_price1.total_sell,
//   q.quantity
// FROM
//   stock AS s
// LEFT JOIN
//   (
//       SELECT
//           stock_movement.stock_id,
//           SUM(stock_movement.quantity) AS quantity
//       FROM
//           stock_movement
//       GROUP BY
//           stock_movement.stock_id
//       ORDER BY
//           NULL
//   ) AS q
//       ON q.stock_id = s.id
// LEFT JOIN
//   stock_price AS stock_price1
//       ON stock_price1.stock_id = s.id
// LEFT JOIN
//   stock_price AS stock_price2
//       ON (
//           stock_price2.stock_id = s.id
//       )
//       AND (
//           stock_price1.id < stock_price2.id
//       )
// WHERE
//   (
//       1 = 1
//       AND s.is_deleted = 0
//   )
//   AND (
//       stock_price2.id IS NULL
//   )