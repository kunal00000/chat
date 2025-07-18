import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"
import { marked } from "marked"
import { memo, useId, useMemo } from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { Button } from "./button"
import { CodeBlock, CodeBlockCode, CodeBlockGroup } from "./code-block"

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

        const { handleCopy, getCopyIcon, getCopyText } = useCopyToClipboard()

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
        const copyId = `${language}-${children?.toString().slice(0, 10)}`

        return (
            <CodeBlock className={className}>
                <CodeBlockGroup className="flex h-9 items-center justify-between px-4">
                    <div className="text-muted-foreground py-1 pr-2 font-mono text-xs">
                        {language}
                    </div>
                </CodeBlockGroup>
                <div className="sticky top-16 lg:top-0">
                    <div className="absolute right-0 bottom-0 flex h-9 items-center pr-1.5">
                        <Button
                            variant={"ghost"}
                            onClick={() => handleCopy(copyId, children as string)}
                            className="flex items-center gap-1 text-xs font-medium shadow-none text-muted-foreground hover:bg-transparent"
                        >
                            {getCopyIcon(copyId, "size-3")}
                            {getCopyText(copyId)}
                        </Button>
                    </div>
                </div>
                <CodeBlockCode code={children as string} language={language} />
            </CodeBlock>
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
