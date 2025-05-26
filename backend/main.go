package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/anthony/network-topology-visualization/arduino"
	"github.com/anthony/network-topology-visualization/protocol"
	"github.com/anthony/network-topology-visualization/wshub"
)

var hub *wshub.Hub
var arduinoController protocol.MessageHandler

func main() {
	// Parse command line flags
	arduinoPort := flag.String("arduino", "", "Arduino serial port (e.g., COM3 on Windows, /dev/ttyUSB0 on Linux)")
	useSpoofer := flag.Bool("spoof", false, "Use Arduino spoofer instead of real hardware")
	flag.Parse()

	// Create hub first (we'll set the Arduino controller after)
	hub = wshub.NewHub(nil)

	// Initialize either real Arduino or spoofer
	if *arduinoPort != "" {
		// Use real Arduino
		controller := arduino.NewArduinoController(hub)
		if err := controller.Connect(*arduinoPort); err != nil {
			log.Printf("Failed to connect to Arduino: %v", err)
		} else {
			log.Printf("Connected to Arduino on port %s", *arduinoPort)
			arduinoController = controller
			defer controller.Disconnect()
		}
	} else if *useSpoofer {
		// Use spoofer
		spoofer := arduino.NewSpoofer(hub)
		spoofer.Start()
		arduinoController = spoofer
		defer spoofer.Stop()
		log.Println("Using Arduino spoofer")
	}

	// Set the Arduino controller in the hub
	if arduinoController != nil {
		hub.SetArduino(arduinoController)
	}

	// Start the hub
	go hub.Run()

	// Serve static files
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)

	// WebSocket endpoint
	http.HandleFunc("/ws", hub.HandleWebSocket)

	// Start the server
	port := ":8080"
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
