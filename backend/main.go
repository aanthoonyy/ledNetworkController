package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/anthony/network-topology-visualization/arduino"
	"github.com/anthony/network-topology-visualization/wshub"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // In production, implement proper origin checking
	},
}

var hub = wshub.NewHub()
var arduinoController *arduino.ArduinoController

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &wshub.Client{
		Conn: conn,
		Send: make(chan []byte, 256),
	}

	hub.Register <- client

	// Start goroutines for reading and writing
	go writePump(client)
	go readPump(client)
}

func readPump(c *wshub.Client) {
	defer func() {
		hub.Unregister <- c
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
		// Handle incoming messages here
		// For now, just broadcast to all clients
		hub.Messages <- message
	}
}

func writePump(c *wshub.Client) {
	defer func() {
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

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
}

func main() {
	// Parse command line flags
	arduinoPort := flag.String("arduino", "", "Arduino serial port (e.g., COM3 on Windows, /dev/ttyUSB0 on Linux)")
	flag.Parse()

	// Start the hub
	go hub.Run()

	// Initialize Arduino controller if port is specified
	if *arduinoPort != "" {
		arduinoController = arduino.NewArduinoController(hub)
		if err := arduinoController.Connect(*arduinoPort); err != nil {
			log.Printf("Failed to connect to Arduino: %v", err)
		} else {
			log.Printf("Connected to Arduino on port %s", *arduinoPort)
			defer arduinoController.Disconnect()
		}
	}

	// Serve static files
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)

	// WebSocket endpoint
	http.HandleFunc("/ws", handleWebSocket)

	// Start the server
	port := ":8080"
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
