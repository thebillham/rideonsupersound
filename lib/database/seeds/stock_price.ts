exports.seed = (knex) =>
  knex('stock_price')
    .del()
    .then(() =>
      knex('stock_price').insert([
        {
          id: 1,
          stock_id: 1,
          clerk_id: 1,
          vendor_cut: 1500,
          total_sell: 1800,
          date_valid_from: new Date('2018-06-01').toISOString(),
        },
        {
          id: 2,
          stock_id: 1,
          clerk_id: 2,
          vendor_cut: 1800,
          total_sell: 2000,
          date_valid_from: new Date('2018-07-01').toISOString(),
        },
        {
          id: 3,
          stock_id: 2,
          clerk_id: 1,
          vendor_cut: 3500,
          total_sell: 4000,
          date_valid_from: new Date('2018-08-01').toISOString(),
        },
        {
          id: 4,
          stock_id: 3,
          clerk_id: 1,
          vendor_cut: 1200,
          total_sell: 1500,
          date_valid_from: new Date('2018-09-01').toISOString(),
        },
        {
          id: 5,
          stock_id: 4,
          clerk_id: 1,
          vendor_cut: 700,
          total_sell: 1000,
          date_valid_from: new Date('2018-10-01').toISOString(),
        },
        {
          id: 6,
          stock_id: 5,
          clerk_id: 1,
          vendor_cut: 700,
          total_sell: 1000,
          date_valid_from: new Date('2018-11-01').toISOString(),
        },
        {
          id: 7,
          stock_id: 6,
          clerk_id: 1,
          vendor_cut: 700,
          total_sell: 1000,
          date_valid_from: new Date('2018-12-01').toISOString(),
        },
        {
          id: 8,
          stock_id: 5,
          clerk_id: 1,
          vendor_cut: 500,
          total_sell: 1000,
          date_valid_from: new Date('2019-01-01').toISOString(),
        },
        {
          id: 9,
          stock_id: 8,
          clerk_id: 1,
          vendor_cut: 2500,
          total_sell: 3000,
          date_valid_from: new Date('2018-01-01').toISOString(),
        },
        {
          id: 10,
          stock_id: 9,
          clerk_id: 1,
          vendor_cut: 3200,
          total_sell: 4000,
          date_valid_from: new Date('2018-01-01').toISOString(),
        },
        {
          id: 11,
          stock_id: 10,
          clerk_id: 1,
          vendor_cut: 1000,
          total_sell: 1200,
          date_valid_from: new Date('2018-01-01').toISOString(),
        },
        {
          id: 12,
          stock_id: 7,
          clerk_id: 1,
          vendor_cut: 1000,
          total_sell: 1500,
          date_valid_from: new Date('2018-01-01').toISOString(),
        },
        {
          id: 13,
          stock_id: 11,
          clerk_id: 1,
          vendor_cut: 500,
          total_sell: 1200,
          date_valid_from: new Date('2018-06-01').toISOString(),
        },
        {
          id: 14,
          stock_id: 11,
          clerk_id: 1,
          vendor_cut: 600,
          total_sell: 1200,
          date_valid_from: new Date('2018-07-01').toISOString(),
        },
        {
          id: 15,
          stock_id: 11,
          clerk_id: 1,
          vendor_cut: 700,
          total_sell: 1200,
          date_valid_from: new Date('2018-09-01').toISOString(),
        },
        {
          id: 16,
          stock_id: 11,
          clerk_id: 1,
          vendor_cut: 800,
          total_sell: 1200,
          date_valid_from: new Date('2018-11-01').toISOString(),
        },
        {
          id: 17,
          stock_id: 11,
          clerk_id: 1,
          vendor_cut: 900,
          total_sell: 1200,
          date_valid_from: new Date('2018-12-01').toISOString(),
        },
        {
          id: 18,
          stock_id: 11,
          clerk_id: 1,
          vendor_cut: 1000,
          total_sell: 1200,
          date_valid_from: new Date('2018-12-02').toISOString(),
        },
      ]),
    )