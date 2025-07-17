"use client"

import { useChatStore } from '@/store/chat.store'
import { useEffect } from 'react'

export default function ResetChatEffects() {
    useEffect(() => {
        useChatStore.setState({ chatId: null, chatTitle: null })
    }, [])

    return null
}
