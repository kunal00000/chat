"use client";

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FirstLoadEffect() {
    const nextRouter = useRouter();
    useEffect(() => {
        window.nextRouter = nextRouter;
    }, [nextRouter]);

    return null;
}

declare global {
    interface Window {
        nextRouter: AppRouterInstance;
    }
}