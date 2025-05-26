package arduino

import (
	"encoding/json"
	"log"
	"time"

	"github.com/anthony/network-topology-visualization/protocol"
)

// Spoofer mimics an Arduino device for testing
type Spoofer struct {
	broadcaster protocol.MessageBroadcaster
	nodeStates  map[string]protocol.ArduinoState
}

// NewSpoofer creates a new Arduino spoofer
func NewSpoofer(broadcaster protocol.MessageBroadcaster) *Spoofer {
	return &Spoofer{
		broadcaster: broadcaster,
		nodeStates:  make(map[string]protocol.ArduinoState),
	}
}

// Start begins the spoofer
func (s *Spoofer) Start() {
	log.Println("Arduino spoofer started")
}

// Stop halts the spoofer
func (s *Spoofer) Stop() {
	log.Println("Arduino spoofer stopped")
}

// HandleMessage implements the MessageHandler interface
func (s *Spoofer) HandleMessage(message []byte) {
	start := time.Now()
	var control protocol.LightControl
	if err := json.Unmarshal(message, &control); err != nil {
		log.Printf("Error parsing light control message: %v", err)
		return
	}

	// Update the state
	state := protocol.ArduinoState{
		Type:   protocol.TypeArduinoState,
		NodeID: control.NodeID,
		State:  control.Command,
		Color:  control.Color,
	}

	// Store the state
	s.nodeStates[control.NodeID] = state

	// Handle basic commands
	switch control.Command {
	case "on", "off":
		// Immediate response for on/off
		s.broadcastState(state)
	default:
		log.Printf("Unsupported command: %s", control.Command)
	}

	// Log timing
	elapsed := time.Since(start)
	log.Printf("Message processed in %v", elapsed)

	// Log current states after update
	log.Printf("Current node states:")
	for id, nodeState := range s.nodeStates {
		log.Printf("  %s: state=%s, color=%s", id, nodeState.State, nodeState.Color)
	}
}

// broadcastState sends a state update
func (s *Spoofer) broadcastState(state protocol.ArduinoState) {
	data, err := json.Marshal(state)
	if err != nil {
		log.Printf("Error marshaling state: %v", err)
		return
	}
	s.broadcaster.Broadcast(data)
}

// GetNodeState returns the current state of a node
func (s *Spoofer) GetNodeState(nodeID string) (protocol.ArduinoState, bool) {
	state, exists := s.nodeStates[nodeID]
	return state, exists
}

// GetAllNodeStates returns all node states
func (s *Spoofer) GetAllNodeStates() map[string]protocol.ArduinoState {
	return s.nodeStates
}
