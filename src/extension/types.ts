interface ApplyVisibilityMsg {
  type: "APPLY_VISIBILITY";
  visible: boolean; // Adjust the type if needed
}

interface PingMsg {
  type: "PING";
}

export type Message = ApplyVisibilityMsg | PingMsg;
