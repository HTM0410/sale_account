import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { registerConnection, unregisterConnection } from '@/lib/server/notificationEvents'

export async function GET(request: NextRequest) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return new Response('Unauthorized', { status: 401 })
	}

	const encoder = new TextEncoder()

	const stream = new ReadableStream({
		start(controller) {
			const write = (data: string) => controller.enqueue(encoder.encode(data))
			const close = () => controller.close()

			// Register this connection for the user
			registerConnection(session.user.id, { write, close })

			// Send initial connected event
			write(`data: ${JSON.stringify({ type: 'connected', message: 'connected' })}\n\n`)

			// Heartbeat
			const interval = setInterval(() => {
				try {
					write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`)
				} catch {
					// ignore
				}
			}, 25000)

			// Cleanup when stream is canceled
			request.signal.addEventListener('abort', () => {
				clearInterval(interval)
				unregisterConnection(session.user.id, { write, close })
				controller.close()
			})
		}
	})

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			'Connection': 'keep-alive',
			'X-Accel-Buffering': 'no',
		},
	})
}
