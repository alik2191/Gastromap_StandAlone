import { useCallback } from 'react'
import { useAIChatStore } from '@/features/shared/hooks/useAIChatStore'
import { useAIQueryMutation } from '@/shared/api/queries'
import { useUserPrefsStore } from '@/features/auth/hooks/useUserPrefsStore'

/**
 * useAIChat — GastroGuide conversation logic.
 *
 * Combines:
 *   - useAIChatStore     (message history, typing state)
 *   - useAIQueryMutation (API call to AI service)
 *   - useUserPrefsStore  (user context for personalised responses)
 *
 * @returns {{
 *   messages: Array,
 *   isTyping: boolean,
 *   error: string|null,
 *   sendMessage: (text: string) => Promise<void>,
 *   clearHistory: () => void,
 * }}
 */
export function useAIChat() {
    const {
        messages,
        isTyping,
        error,
        addMessage,
        setTyping,
        setError,
        clearError,
        clearHistory,
        trimHistory,
    } = useAIChatStore()

    const { prefs } = useUserPrefsStore()
    const aiMutation = useAIQueryMutation()

    const sendMessage = useCallback(async (text) => {
        if (!text?.trim() || isTyping) return

        clearError()
        addMessage('user', text.trim())
        setTyping(true)

        try {
            const response = await aiMutation.mutateAsync({
                message: text.trim(),
                context: { preferences: prefs },
            })

            addMessage('assistant', response.content, {
                matches: response.matches,
                intent: response.intent,
            })

            trimHistory()
        } catch (err) {
            setError(err.message ?? 'Ошибка ответа GastroGuide')
            addMessage('assistant', 'Произошла ошибка. Попробуйте ещё раз.', {
                isError: true,
            })
        } finally {
            setTyping(false)
        }
    }, [isTyping, prefs, addMessage, setTyping, setError, clearError, trimHistory, aiMutation])

    return {
        messages,
        isTyping,
        error,
        sendMessage,
        clearHistory,
    }
}
