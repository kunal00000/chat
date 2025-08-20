"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FirstLoadEffect() {
    const nextRouter = useRouter();
    useEffect(() => {
        window.nextRouter = nextRouter;
    }, [nextRouter]);

    return null;
}
