package arduino

import (
	"log"
	"time"

	"github.com/anthony/network-topology-visualization/wshub"
	"github.com/tarm/serial"
)

// ArduinoController handles communication with the Arduino
type ArduinoController struct {
	port     *serial.Port
	hub      *wshub.Hub
	isActive bool
}

// NewArduinoController creates a new Arduino controller
func NewArduinoController(hub *wshub.Hub) *ArduinoController {
	return &ArduinoController{
		hub:      hub,
		isActive: false,
	}
}

// Connect establishes a connection with the Arduino
func (ac *ArduinoController) Connect(portName string) error {
	config := &serial.Config{
		Name:        portName,
		Baud:        9600,
		ReadTimeout: time.Second * 1,
	}

	port, err := serial.OpenPort(config)
	if err != nil {
		return err
	}

	ac.port = port
	ac.isActive = true
	go ac.readLoop()
	return nil
}

// Disconnect closes the connection with the Arduino
func (ac *ArduinoController) Disconnect() {
	if ac.port != nil {
		ac.isActive = false
		ac.port.Close()
	}
}

// readLoop continuously reads from the Arduino
func (ac *ArduinoController) readLoop() {
	buf := make([]byte, 128)
	for ac.isActive {
		n, err := ac.port.Read(buf)
		if err != nil {
			log.Printf("Error reading from Arduino: %v", err)
			continue
		}

		if n > 0 {
			// Process the received data
			// For now, just broadcast it to all WebSocket clients
			ac.hub.Messages <- buf[:n]
		}
	}
}

// SendCommand sends a command to the Arduino
func (ac *ArduinoController) SendCommand(cmd string) error {
	if ac.port == nil {
		return nil
	}

	_, err := ac.port.Write([]byte(cmd + "\n"))
	return err
}
