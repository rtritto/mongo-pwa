// import { Box, Container, Divider, Typography } from '@suid/material'
import { type Component, Show, createEffect } from 'solid-js'
// import { useAtom } from 'solid-jotai'
// import { useHydrateAtoms } from 'solid-jotai/utils'
import { useData } from 'vike-solid/useData'

import type { mapServerStatus } from '@/utils/mappers/mapInfo'
// import StatsTable from '@/components/common/StatsTable'
// import ShowDatabases from '@/components/Index/ShowDatabases'
// import { databasesState, messageErrorState, messageSuccessState } from '../../components/store/globalAtoms'

const Page: Component<{
  databases: Mongo['databases']
  // messageError?: string
  // messageSuccess?: string
  options: {
    noDelete: boolean
    readOnly: boolean
  }
  serverStatus?: ReturnType<typeof mapServerStatus>
}> = () => {
  const data = useData<DataIndex>()

  return (
    <>Hejj</>
    // <Container sx={{ p: 1 }}>
    //   <Typography component="h4" gutterBottom variant="h4">Mongo Express</Typography>

    //   <Divider sx={{ border: 1, my: 1.5 }} />

    //   <ShowDatabases
    //     databases={data.databases}
    //     show={{
    //       create: props.options.readOnly === false,
    //       delete: props.options.noDelete === false && props.options.readOnly === false
    //     }}
    //   />

    //   <Box sx={{ mb: 2 }}>
    //     <Show
    //       when={props.serverStatus}
    //       fallback={<>
    //         <Typography component="h4" gutterBottom variant="h4">Server Status</Typography>

    //         <Typography>Turn on admin in <b>config.js</b> to view server stats!</Typography>
    //       </>}
    //     >
    //       <StatsTable label="Server Status" fields={props.serverStatus} />
    //     </Show>
    //   </Box>
    // </Container>
  )
}

export default Page
