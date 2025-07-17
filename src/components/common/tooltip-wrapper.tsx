import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

type TooltipWrapperProps = {
    className?: string
    tooltip: React.ReactNode
    children: React.ReactNode
    side?: "top" | "bottom" | "left" | "right"
    disabled?: boolean
} & React.ComponentProps<typeof Tooltip>

export default function TooltipWrapper({ children, tooltip, side = "top", className, disabled = false, ...props }: TooltipWrapperProps) {
    return (
        <Tooltip {...props}>
            <TooltipTrigger asChild disabled={disabled}>
                {children}
            </TooltipTrigger>
            <TooltipContent side={side} className={className}>
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
}
