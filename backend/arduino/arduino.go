package arduino

import (
	"encoding/json"
	"log"
	"time"

	"github.com/anthony/network-topology-visualization/protocol"
	"github.com/tarm/serial"
)

// ArduinoController handles communication with the Arduino
type ArduinoController struct {
	port        *serial.Port
	broadcaster protocol.MessageBroadcaster
	isActive    bool
	nodeStates  map[string]protocol.ArduinoState
}

// NewArduinoController creates a new Arduino controller
func NewArduinoController(broadcaster protocol.MessageBroadcaster) *ArduinoController {
	return &ArduinoController{
		broadcaster: broadcaster,
		isActive:    false,
		nodeStates:  make(map[string]protocol.ArduinoState),
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
			// Try to parse as ArduinoState
			var state protocol.ArduinoState
			if err := json.Unmarshal(buf[:n], &state); err == nil {
				ac.nodeStates[state.NodeID] = state
				// Broadcast state update to all clients
				ac.broadcaster.Broadcast(buf[:n])
			} else {
				// If not a state update, just broadcast raw message
				ac.broadcaster.Broadcast(buf[:n])
			}
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

// ControlLight sends a light control command to the Arduino
func (ac *ArduinoController) ControlLight(nodeID, command, color string) error {
	if !ac.isActive {
		return nil
	}

	control := protocol.LightControl{
		Type:    protocol.TypeLightControl,
		NodeID:  nodeID,
		Command: command,
		Color:   color,
	}

	data, err := json.Marshal(control)
	if err != nil {
		return err
	}

	_, err = ac.port.Write(append(data, '\n'))
	return err
}

// GetNodeState returns the current state of a node's light
func (ac *ArduinoController) GetNodeState(nodeID string) (protocol.ArduinoState, bool) {
	state, exists := ac.nodeStates[nodeID]
	return state, exists
}

// GetAllNodeStates returns the states of all nodes
func (ac *ArduinoController) GetAllNodeStates() map[string]protocol.ArduinoState {
	return ac.nodeStates
}

// HandleMessage implements the MessageHandler interface
func (ac *ArduinoController) HandleMessage(message []byte) {
	var control protocol.LightControl
	if err := json.Unmarshal(message, &control); err != nil {
		log.Printf("Error parsing light control message: %v", err)
		return
	}

	if err := ac.ControlLight(control.NodeID, control.Command, control.Color); err != nil {
		log.Printf("Error controlling light: %v", err)
	}
}
