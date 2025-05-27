package wshub

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/anthony/network-topology-visualization/protocol"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// HandleWebSocket upgrades the HTTP connection to a WebSocket connection
func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		Conn: conn,
		Send: make(chan []byte, 256),
	}

	h.Register <- client

	// Start goroutines for reading and writing
	go h.readPump(client)
	go h.writePump(client)
}

func (h *Hub) readPump(c *Client) {
	defer func() {
		h.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var request map[string]string
		if err := json.Unmarshal(message, &request); err == nil && request["type"] == "request_states" {
			if arduino, ok := h.arduino.(interface {
				GetAllNodeStates() map[string]protocol.ArduinoState
			}); ok {
				states := arduino.GetAllNodeStates()
				stateArray := make([]protocol.ArduinoState, 0, len(states))
				for _, state := range states {
					stateArray = append(stateArray, state)
				}
				response := map[string]interface{}{
					"type":   "all_states",
					"states": stateArray,
				}
				if data, err := json.Marshal(response); err == nil {
					c.Send <- data
				}
			}
			continue
		}

		var control protocol.LightControl
		if err := json.Unmarshal(message, &control); err == nil && control.Type == protocol.TypeLightControl {
			if h.arduino != nil {
				h.arduino.HandleMessage(message)
			}
		} else {
			h.Broadcast(message)
		}
	}
}

func (h *Hub) writePump(c *Client) {
	defer func() {
		c.Conn.Close()
	}()

	for message := range c.Send {
		w, err := c.Conn.NextWriter(websocket.TextMessage)
		if err != nil {
			return
		}
		w.Write(message)

		if err := w.Close(); err != nil {
			return
		}
	}
}
