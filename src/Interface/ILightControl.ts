export interface LightControlMessage {
    type: 'light_control';
    nodeId: string;
    command: 'on' | 'off' | 'blink' | 'pulse';
    color: 'red' | 'green' | 'blue';
}

export interface NodeState {
    nodeId: string;
    state: 'on' | 'off';
    color: string;
    lastUpdated: string;
}

export interface ReceivedMessage {
    timestamp: string;
    data: string;
    roundTripTime: string | null;
}

export interface LightControlState {
    status: 'connected' | 'disconnected';
    lastMessage: string | null;
    roundTripTime: string | null;
    messageHistory: ReceivedMessage[];
    nodeStates: Record<string, NodeState>;
}
