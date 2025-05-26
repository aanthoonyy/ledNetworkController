package protocol

type MessageHandler interface {
	HandleMessage(message []byte)
}

type MessageBroadcaster interface {
	Broadcast(message []byte)
}
