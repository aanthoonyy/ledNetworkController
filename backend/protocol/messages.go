package protocol

const (
	TypeLightControl = "light_control"
	TypeArduinoState = "arduino_state"
)

type LightControl struct {
	Type    string `json:"type"`
	NodeID  string `json:"nodeId"`
	Command string `json:"command"` // "on", "off", "blink", "pulse"
	Color   string `json:"color,omitempty"`
}

type ArduinoState struct {
	Type   string `json:"type"`
	NodeID string `json:"nodeId"`
	State  string `json:"state"` // "on", "off", "blink", "pulse"
	Color  string `json:"color,omitempty"`
}
