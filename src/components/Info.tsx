import { Icon } from "@iconify/react"
import { Tooltip } from "@mui/material"

export const Info = ({content}: {content: React.ReactNode}) => {
    return <Tooltip title={content}><Icon icon="material-symbols:help-outline" /></Tooltip>
}