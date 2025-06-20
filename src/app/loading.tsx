import Loader from "@/icons/loader";

export default function Loading() {
    return (
        <div className="absolute w-full h-full flex place-content-center place-items-center">
            <Loader className="size-16" />
        </div>
    )
}
