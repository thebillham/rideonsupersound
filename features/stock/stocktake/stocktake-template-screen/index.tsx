// import { useEffect, useState } from 'react'
// import {
//   ModalButton,
//   StockObject,
//   StocktakeObject,
//   StocktakeStatuses,
//   StocktakeTemplateObject,
// } from 'lib/types'
// import ScreenContainer from 'components/container/screen'
// import TextField from 'components/inputs/text-field'
// import FilterBox from './filter-box'
// import StocktakeListItem from './stocktake-list-item'
// import AddIcon from '@mui/icons-material/Add'
// import dayjs from 'dayjs'
// import { writeStocktakeFilterDescription } from 'lib/functions/stocktake'
// import StocktakeScreen from '../stocktake-screen'
// import { useStockList } from 'lib/api/stock'
// import { useVendors } from 'lib/api/vendor'
// import { useClerk } from 'lib/api/clerk'
// import { useAppStore } from 'lib/store'
// import { ViewProps } from 'lib/store/types'

// export default function StocktakeTemplateScreen() {
//   const { clerk } = useClerk()
//   const { closeView } = useAppStore()
//   // Atoms
//   const { inventory, mutateInventory } = useStockList()
//   const { selects, isSelectsLoading } = useAllSelects()
//   const { vendors, isVendorsLoading } = useVendors()

//   const [stocktakeId, setLoadedStocktakeId] = useAtom(loadedStocktakeIdAtom)
//   const [stocktakeTemplateId, setLoadedStocktakeTemplateId] = useAtom(
//     loadedStocktakeTemplateIdAtom
//   )

//   const { stocktakes, isStocktakesLoading, mutateStocktakes } =
//     useStocktakesByTemplate(stocktakeTemplateId)
//   const {
//     stocktakeTemplates,
//     isStocktakeTemplatesLoading,
//     mutateStocktakeTemplates,
//   } = useStocktakeTemplates()

//   const stocktake = stocktakes?.filter(
//     (stocktake) => stocktake?.id === stocktakeId
//   )?.[0]
//   const { isStocktakeItemsLoading } = useStocktakeItemsByStocktake(
//     stocktake?.id
//   )
//   const stocktakeTemplate = stocktakeTemplates?.filter(
//     (st) => st?.id === stocktakeTemplateId
//   )?.[0]
//   const [isLoading, setIsLoading] = useState(false)

//   useEffect(() => {
//     const inventoryList = inventory?.filter(
//       (i: StockObject) =>
//         i?.quantity > 0 &&
//         (stocktakeTemplate?.vendor_enabled
//           ? stocktakeTemplate?.vendor_list?.includes(i?.vendor_id)
//           : true) &&
//         (stocktakeTemplate?.format_enabled
//           ? stocktakeTemplate?.format_list?.includes(i?.format)
//           : true) &&
//         (stocktakeTemplate?.media_enabled
//           ? stocktakeTemplate?.media_list?.includes(i?.media)
//           : true) &&
//         (stocktakeTemplate?.section_enabled
//           ? stocktakeTemplate?.section_list?.includes(i?.section)
//           : true)
//     )

//     const newStocktakeTemplate = {
//       ...stocktakeTemplate,
//       total_estimated: inventoryList?.reduce(
//         (prev, curr) => prev + curr?.quantity,
//         0
//       ),
//       total_unique_estimated: inventoryList?.length,
//       filter_description: writeStocktakeFilterDescription(stocktakeTemplate),
//     }
//     updateStocktakeTemplateInDatabase(newStocktakeTemplate)
//     mutateStocktakeTemplates(
//       stocktakeTemplates?.map((st) =>
//         st?.id === stocktakeTemplateId ? newStocktakeTemplate : st
//       ),
//       false
//     )
//     // }
//   }, [
//     inventory,
//     stocktakeTemplate?.vendor_enabled,
//     stocktakeTemplate?.vendor_list,
//     stocktakeTemplate?.format_enabled,
//     stocktakeTemplate?.format_list,
//     stocktakeTemplate?.media_enabled,
//     stocktakeTemplate?.media_list,
//     stocktakeTemplate?.section_enabled,
//     stocktakeTemplate?.section_list,
//   ])

//   const buttons: ModalButton[] = [
//     {
//       type: 'cancel',
//       hidden: Boolean(stocktakeTemplate?.id),
//       onClick: () => {
//         closeView(ViewProps.stocktakeTemplateScreen)
//         setLoadedStocktakeTemplateId(null)
//       },
//       text: 'CANCEL',
//     },
//     {
//       type: 'ok',
//       loading: isLoading,
//       disabled: isLoading,
//       text: `${stocktakeTemplate?.id ? 'OK' : 'SAVE AND CLOSE'}`,
//       onClick: async () => {
//         updateStocktakeTemplateInDatabase(stocktakeTemplate)
//         mutateStocktakeTemplates(
//           stocktakeTemplates?.map((s) =>
//             s?.id === stocktakeTemplate?.id ? stocktakeTemplate : s
//           ),
//           false
//         )
//         closeView(ViewProps.stocktakeTemplateScreen)
//         setLoadedStocktakeTemplateId(null)
//         // }
//       },
//     },
//   ]

//   const stocktakeInProgress =
//     stocktakes?.filter((s) => !s?.date_cancelled && !s?.date_closed)?.length > 0

//   function setLoadedStocktakeTemplate(newTemplate: StocktakeTemplateObject) {
//     // console.log(newTemplate);
//     updateStocktakeTemplateInDatabase(newTemplate)
//     mutateStocktakeTemplates(
//       stocktakeTemplates?.map((st) =>
//         st?.id === newTemplate?.id ? newTemplate : st
//       ),
//       false
//     )
//   }

//   return (
//     <>
//       <ScreenContainer
//         show={view?.stocktakeTemplateScreen}
//         closeFunction={() => {
//           closeView(ViewProps.stocktakeTemplateScreen)
//           setLoadedStocktakeTemplateId(null)
//         }}
//         loading={
//           isStocktakeTemplatesLoading ||
//           isStocktakesLoading ||
//           isStocktakeItemsLoading ||
//           isSelectsLoading ||
//           isVendorsLoading ||
//           isLoading
//         }
//         title={`${
//           stocktakeTemplate?.id
//             ? `${stocktakeTemplate?.name?.toUpperCase?.()} STOCKTAKE`
//             : 'NEW STOCKTAKE TEMPLATE'
//         }`}
//         buttons={buttons}
//         titleClass="bg-col1"
//       >
//         <div className="flex flex-col w-full overflow-y-scroll">
//           <div className="flex mt-4">
//             <div className="w-2/3">
//               <div className="flex justify-between">
//                 <div className="font-bold">STOCKTAKE HISTORY</div>
//                 <button
//                   className="icon-text-button"
//                   onClick={async () => {
//                     setIsLoading(true)
//                     updateStocktakeTemplateInDatabase({
//                       ...stocktakeTemplate,
//                       status: StocktakeStatuses?.inProgress,
//                     })
//                     let newStocktake: StocktakeObject = {
//                       dateStarted: dayjs.utc().format(),
//                       startedBy: clerk?.id,
//                       stocktakeTemplateId: stocktakeTemplate?.id,
//                       totalEstimated: stocktakeTemplate?.totalEstimated,
//                       totalUniqueEstimated:
//                         stocktakeTemplate?.totalUniqueEstimated,
//                     }
//                     const id = await createStocktakeInDatabase(newStocktake)
//                     mutateStocktakes(
//                       [{ ...newStocktake, id }, ...stocktakes],
//                       false
//                     )
//                     setView({ ...view, stocktakeScreen: true })
//                     setLoadedStocktakeId(id)
//                     setIsLoading(false)
//                   }}
//                   disabled={
//                     stocktakeInProgress || !Boolean(stocktakeTemplateId)
//                   }
//                 >
//                   <AddIcon className="pr-2" />
//                   New Stocktake
//                 </button>
//               </div>
//               {stocktakes?.length === 0 ? (
//                 <div>No Stocktakes</div>
//               ) : (
//                 stocktakes?.map((s) => (
//                   <StocktakeListItem key={s?.id} stocktake={s} />
//                 ))
//               )}
//             </div>
//             <div className="w-1/3 px-4">
//               <div className="font-bold">STOCKTAKE SETUP</div>
//               <TextField
//                 value={stocktakeTemplate?.name || ''}
//                 onChange={(e: any) =>
//                   setLoadedStocktakeTemplate({
//                     ...stocktakeTemplate,
//                     name: e.target.value,
//                   })
//                 }
//                 inputLabel="NAME"
//               />
//               <div className="w-100 bg-red-200">
//                 <div className="p-2">
//                   <div className="italic">
//                     {stocktakeTemplate?.filterDescription}
//                   </div>
//                   <div className="flex">
//                     <div className="mr-2">
//                       Estimated Number of Items in Stock:{' '}
//                     </div>
//                     <div className="font-bold">
//                       {stocktakeTemplate?.totalEstimated || '0'}
//                     </div>
//                   </div>
//                   <div className="flex">
//                     <div className="mr-2">
//                       Estimated Number of Unique Items:{' '}
//                     </div>
//                     <div className="font-bold">
//                       {stocktakeTemplate?.totalUniqueEstimated || '0'}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="font-bold pt-2">STOCKTAKE FILTERS</div>
//               <FilterBox
//                 title="Format"
//                 list={selects
//                   ?.filter((s) => s?.setting_select === 'format')
//                   ?.map((s) => ({ label: s?.label, value: s?.label }))}
//                 stocktakeTemplate={stocktakeTemplate}
//                 setStocktakeTemplate={setLoadedStocktakeTemplate}
//                 field={'format'}
//               />
//               <FilterBox
//                 title="Section"
//                 list={selects
//                   ?.filter((s) => s?.setting_select === 'section')
//                   ?.map((s) => ({ label: s?.label, value: s?.label }))}
//                 stocktakeTemplate={stocktakeTemplate}
//                 setStocktakeTemplate={setLoadedStocktakeTemplate}
//                 field={'section'}
//               />
//               <FilterBox
//                 title="Vendors"
//                 list={vendors?.map((v) => ({
//                   label: `${v?.name} [${v?.id}]`,
//                   value: v?.id,
//                 }))}
//                 stocktakeTemplate={stocktakeTemplate}
//                 setStocktakeTemplate={setLoadedStocktakeTemplate}
//                 field={'vendor'}
//               />
//               <FilterBox
//                 title="Media Type"
//                 list={selects
//                   ?.filter((s) => s?.setting_select === 'media')
//                   ?.map((s) => ({ label: s?.label, value: s?.label }))}
//                 stocktakeTemplate={stocktakeTemplate}
//                 setStocktakeTemplate={setLoadedStocktakeTemplate}
//                 field={'media'}
//               />
//             </div>
//           </div>
//         </div>
//       </ScreenContainer>
//       {/* <StocktakeScreen /> */}
//       {stocktakeId && <StocktakeScreen />}
//     </>
//   )
// }
