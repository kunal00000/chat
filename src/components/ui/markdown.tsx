import { cn } from "@/lib/utils"
import { CheckIcon, CopyIcon } from "lucide-react"
import { marked } from "marked"
import React, { memo, useId, useMemo } from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { Button } from "./button"
import { CodeBlock, CodeBlockCode } from "./code-block"

export type MarkdownProps = {
    children: string
    id?: string
    className?: string
    components?: Partial<Components>
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
    const tokens = marked.lexer(markdown)
    return tokens.map((token) => token.raw)
}

function extractLanguage(className?: string): string {
    if (!className) return "plaintext"
    const match = className.match(/language-(\w+)/)
    return match ? match[1] : "plaintext"
}

const INITIAL_COMPONENTS: Partial<Components> = {
    code: function CodeComponent({ className, children, ...props }) {
        const isInline =
            !props.node?.position?.start.line ||
            props.node?.position?.start.line === props.node?.position?.end.line

        // Copy button state and handler
        const [copied, setCopied] = React.useState(false)
        const codeString = Array.isArray(children) ? children.join("") : String(children)
        const handleCopy = async () => {
            await navigator.clipboard.writeText(codeString)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
        }

        if (isInline) {
            return (
                <span
                    className={cn(
                        "bg-primary-foreground rounded-sm px-1 font-mono text-sm",
                        className
                    )}
                    {...props}
                >
                    {children}
                </span>
            )
        }

        const language = extractLanguage(className)

        return (
            <div className="relative">
                <Button
                    variant={"ghost"}
                    onClick={handleCopy}
                    className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium shadow-none text-muted-foreground hover:bg-transparent"
                >
                    {copied ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                    {copied ? "Copied" : "Copy"}
                </Button>
                <CodeBlock className={className}>
                    <CodeBlockCode code={codeString} language={language} />
                </CodeBlock>
            </div>
        )
    },
    pre: function PreComponent({ children }) {
        return <>{children}</>
    },
}

const MemoizedMarkdownBlock = memo(
    function MarkdownBlock({
        content,
        components = INITIAL_COMPONENTS,
    }: {
        content: string
        components?: Partial<Components>
    }) {
        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        )
    },
    function propsAreEqual(prevProps, nextProps) {
        return prevProps.content === nextProps.content
    }
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

function MarkdownComponent({
    children,
    id,
    className,
    components = INITIAL_COMPONENTS,
}: MarkdownProps) {
    const generatedId = useId()
    const blockId = id ?? generatedId
    const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children])

    return (
        <div className={className}>
            {blocks.map((block, index) => (
                <MemoizedMarkdownBlock
                    key={`${blockId}-block-${index}`}
                    content={block}
                    components={components}
                />
            ))}
        </div>
    )
}

const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"

export { Markdown }
