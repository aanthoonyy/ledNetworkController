package wshub

import (
	"sync"

	"github.com/anthony/network-topology-visualization/protocol"
	"github.com/gorilla/websocket"
)

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	Clients    map[*Client]bool // Basically a Set of Clients in Python
	Messages   chan []byte      // Channel is basically a queue in Python
	Register   chan *Client
	Unregister chan *Client
	mu         sync.Mutex
	arduino    protocol.MessageHandler
}

// Client represents a connected WebSocket client
type Client struct {
	Conn *websocket.Conn
	Send chan []byte
}

// NewHub creates a new hub instance
func NewHub(arduino protocol.MessageHandler) *Hub {
	return &Hub{
		Clients:    make(map[*Client]bool),
		Messages:   make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		arduino:    arduino,
	}
}

// Broadcast implements the MessageBroadcaster interface
func (h *Hub) Broadcast(message []byte) {
	select {
	case h.Messages <- message:
	default:
		break
	}
}

// Run starts the hub's message handling loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register: // Add new client
			h.mu.Lock()
			h.Clients[client] = true
			h.mu.Unlock()
		case client := <-h.Unregister: // Remove client
			h.mu.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}
			h.mu.Unlock()
		case message := <-h.Messages: // Broadcast message to all clients
			h.mu.Lock()
			for client := range h.Clients {
				select {
				case client.Send <- message: // Send message to client
				default: // If client can't receive message, close connection
					close(client.Send)
					delete(h.Clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}

func (h *Hub) SetArduino(arduino protocol.MessageHandler) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.arduino = arduino
}
