interface ApplyVisibilityMsg {
  type: "APPLY_VISIBILITY";
  visible: boolean;
}

interface PingMsg {
  type: "PING";
}

export type Message = ApplyVisibilityMsg | PingMsg;

export type MessageResponse = { ok: true } | "PONG" | undefined;
