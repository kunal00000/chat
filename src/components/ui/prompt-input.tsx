"use client"

import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"

type PromptInputContextType = {
    isLoading: boolean
    value: string
    setValue: (value: string) => void
    maxHeight: number | string
    onSubmit?: () => void
    disabled?: boolean
}

const PromptInputContext = createContext<PromptInputContextType>({
    isLoading: false,
    value: "",
    setValue: () => { },
    maxHeight: 240,
    onSubmit: undefined,
    disabled: false,
})

function usePromptInput() {
    const context = useContext(PromptInputContext)
    if (!context) {
        throw new Error("usePromptInput must be used within a PromptInput")
    }
    return context
}

type PromptInputProps = {
    isLoading?: boolean
    value?: string
    onValueChange?: (value: string) => void
    maxHeight?: number | string
    onSubmit?: () => void
    children: React.ReactNode
    className?: string
}

function PromptInput({
    className,
    isLoading = false,
    maxHeight = 240,
    value,
    onValueChange,
    onSubmit,
    children,
}: PromptInputProps) {
    const [internalValue, setInternalValue] = useState(value || "")

    const handleChange = (newValue: string) => {
        setInternalValue(newValue)
        onValueChange?.(newValue)
    }

    return (
        <TooltipProvider>
            <PromptInputContext.Provider
                value={{
                    isLoading,
                    value: value ?? internalValue,
                    setValue: onValueChange ?? handleChange,
                    maxHeight,
                    onSubmit,
                }}
            >
                <div
                    className={cn(
                        "border-input bg-background rounded-3xl border p-2 shadow-xs",
                        className
                    )}
                >
                    {children}
                </div>
            </PromptInputContext.Provider>
        </TooltipProvider>
    )
}

const SKIP_KEYS = [
    'Escape', 'Tab', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
    'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Meta', 'Alt',
    'Control', 'Shift', 'CapsLock', 'NumLock', 'ScrollLock',
    'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
]

export type PromptInputTextareaProps = {
    disableAutosize?: boolean
} & React.ComponentProps<typeof Textarea>

function PromptInputTextarea({
    className,
    onKeyDown,
    disableAutosize = false,
    ...props
}: PromptInputTextareaProps) {
    const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Autofocus functionality - focus textarea when any key is pressed
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't focus if already focused or if it's a special key
            if (document.activeElement === textareaRef.current) return

            // Skip function keys, modifier keys, and navigation keys
            if (SKIP_KEYS.includes(event.key)) return

            // Don't focus if user is typing in another input/textarea
            const activeElement = document.activeElement as HTMLElement
            if (activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.contentEditable === 'true'
            )) return

            textareaRef.current?.focus()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (disableAutosize) return

        if (!textareaRef.current) return
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height =
            typeof maxHeight === "number"
                ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
                : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`
    }, [value, maxHeight, disableAutosize])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSubmit?.()
        }
        onKeyDown?.(e)
    }

    return (
        <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
                "text-primary min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                className
            )}
            rows={1}
            disabled={disabled}
            {...props}
        />
    )
}

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>

function PromptInputActions({
    children,
    className,
    ...props
}: PromptInputActionsProps) {
    return (
        <div className={cn("flex items-center gap-2", className)} {...props}>
            {children}
        </div>
    )
}

type PromptInputActionProps = {
    className?: string
    tooltip: React.ReactNode
    children: React.ReactNode
    side?: "top" | "bottom" | "left" | "right"
} & React.ComponentProps<typeof Tooltip>

function PromptInputAction({
    tooltip,
    children,
    className,
    side = "top",
    ...props
}: PromptInputActionProps) {
    const { disabled } = usePromptInput()

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

export {
    PromptInput, PromptInputAction, PromptInputActions, PromptInputTextarea
}

