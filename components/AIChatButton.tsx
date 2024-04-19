import { Bot } from "lucide-react";
import { useState } from "react";
import AIChatBox from "./AIChatBox";
import { Button } from "./ui/button";

interface AIChatButtonProps {
  transcript: string;
}

export default function AIChatButton({transcript} : AIChatButtonProps) {
  const [chatBoxOpen, setChatBoxOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setChatBoxOpen(true)}>
        <Bot size={20} className="mr-2" />
        AI Chat
      </Button>
      <AIChatBox open={chatBoxOpen} onClose={() => setChatBoxOpen(false)} transcript = {transcript} />
    </>
  );
}
