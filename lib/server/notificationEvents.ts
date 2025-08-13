type SSEController = {
	write: (data: string) => void
	close: () => void
}

interface NotificationEventPayload {
	type: 'connected' | 'notification' | 'unread_count' | 'heartbeat' | 'broadcast'
	notification?: any
	count?: number
	message?: string
	timestamp?: string
}

// Global registry for active SSE connections per userId
const globalForSSE = globalThis as unknown as {
	__sseConnections?: Map<string, Set<SSEController>>
}

if (!globalForSSE.__sseConnections) {
	globalForSSE.__sseConnections = new Map<string, Set<SSEController>>()
}

const connections = globalForSSE.__sseConnections

export function registerConnection(userId: string, controller: SSEController) {
	let set = connections.get(userId)
	if (!set) {
		set = new Set<SSEController>()
		connections.set(userId, set)
	}
	set.add(controller)
}

export function unregisterConnection(userId: string, controller: SSEController) {
	const set = connections.get(userId)
	if (!set) return
	set.delete(controller)
	if (set.size === 0) {
		connections.delete(userId)
	}
}

export function emitToUser(userId: string, payload: NotificationEventPayload) {
	const set = connections.get(userId)
	if (!set || set.size === 0) return
	const line = `data: ${JSON.stringify({ ...payload, timestamp: payload.timestamp || new Date().toISOString() })}\n\n`
	for (const c of set) {
		try {
			c.write(line)
		} catch {
			// ignore write errors
		}
	}
}

export function broadcast(payload: NotificationEventPayload) {
	const line = `data: ${JSON.stringify({ ...payload, timestamp: payload.timestamp || new Date().toISOString() })}\n\n`
	for (const set of connections.values()) {
		for (const c of set) {
			try {
				c.write(line)
			} catch {
				// ignore
			}
		}
	}
}