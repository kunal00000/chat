import Image, { ImageProps } from "next/image";

export default function Logo(props: Omit<ImageProps, "src" | "alt"> & { className?: string }) {
    return (
        <Image
            width={32}
            height={32}
            {...props}
            src="/logo2.webp"
            alt="logo"
        />
    )
}
