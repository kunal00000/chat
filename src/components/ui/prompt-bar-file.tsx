import { TPreviewFile } from "@/types-constants-schemas/client/chat.types"
import { Paperclip, XIcon } from "lucide-react"

export function PromptBarFilePreview({ previewFiles, removeFile }: { previewFiles: TPreviewFile[], removeFile: (index: number) => void }) {
    if (previewFiles.length === 0) {
        return null
    }

    return (
        <div className="flex flex-wrap items-center justify-start gap-2 p-2 pt-1">
            {previewFiles.map((pf, index) => {
                if (pf.file.type.startsWith("image/")) {
                    return (
                        <div key={index} className="relative border border-border rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={pf.base64} alt={pf.file.name} className="size-16 rounded-lg object-cover" />
                            <button
                                onClick={() => removeFile(index)}
                                className="absolute top-0.5 right-0.5 bg-foreground-custom cursor-pointer rounded-full p-0.5"
                            >
                                <XIcon className="size-3 text-white" />
                            </button>
                        </div>
                    )
                }


                return (
                    <div
                        key={index}
                        className="bg-secondary flex w-40 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            <Paperclip className="size-4" />
                            <span className="max-w-[80px] truncate text-sm">
                                {pf.file.name}
                            </span>
                        </div>
                        <button
                            onClick={() => removeFile(index)}
                            className="hover:bg-foreground-custom hover:text-white cursor-pointer rounded-full p-1"
                        >
                            <XIcon className="size-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}