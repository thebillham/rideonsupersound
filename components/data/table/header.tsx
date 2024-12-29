import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import { flexRender } from '@tanstack/react-table'

export const Header = ({ table, color, colorDark, showFilters }) => (
  <thead className="sticky">
    {table.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th
            key={header.id}
            colSpan={header.colSpan}
            {...{
              className: `border border-white select-none`,
              style: {
                // left: header.getStart(),
                width: `calc(var(--header-${header?.id}-size) * 1px)`,
              },
            }}
          >
            {header.isPlaceholder ? null : (
              <div>
                <div
                  {...{
                    className: header.column.getCanSort()
                      ? `flex justify-between items-center cursor-pointer h-8 ${
                          color ? `${color} hover:${colorDark}` : 'bg-gray-200 hover:bg-gray-400'
                        } text-left px-2 truncate`
                      : '',
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: (
                      <div className="ml-1 p-0">
                        <ArrowDropDown />
                      </div>
                    ),
                    desc: (
                      <div className="ml-1 p-0">
                        <ArrowDropUp />
                      </div>
                    ),
                  }[header.column.getIsSorted() as string] ?? null}
                </div>
                <div
                  className={`border border-gray-200 overflow-hidden transition-all w-full ease-in-out duration-500 bg-white ${
                    showFilters ? 'max-h-60' : 'max-h-0'
                  }`}
                >
                  <input />
                </div>
              </div>
            )}
            {/* <div
              {...{
                onDoubleClick: () => header.column.resetSize(),
                onMouseDown: header.getResizeHandler(),
                onTouchStart: header.getResizeHandler(),
                className: `resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`,
              }}
            /> */}
          </th>
        ))}
      </tr>
    ))}
  </thead>
)
