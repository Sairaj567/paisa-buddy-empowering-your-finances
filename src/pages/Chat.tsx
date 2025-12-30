import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send,
  Sparkles,
  User,
  Bot,
  Paperclip,
  Mic,
  Phone,
  Video,
  MoreVertical
} from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "नमस्ते! 👋 I'm your पैसा Buddy AI assistant. I can help you with budgeting, savings tips, and answer any financial questions. How can I help you today?",
    timestamp: "10:00 AM",
  },
  {
    id: 2,
    role: "user",
    content: "Hi! I want to save money for a trip to Goa. I have ₹25,000 saved already and my target is ₹50,000. Can you help me plan?",
    timestamp: "10:02 AM",
  },
  {
    id: 3,
    role: "assistant",
    content: "Great goal! 🏖️ You're already 50% there! Based on your income pattern, here's my suggestion:\n\n**Recommended Monthly Savings:** ₹5,000\n**Time to Goal:** ~5 months\n\n**Tips to reach faster:**\n1. Cut dining out by 2 times/week = Save ₹2,000\n2. Skip 1 streaming subscription = Save ₹500\n3. Use public transport once/week = Save ₹800\n\nWould you like me to set up automatic transfers to your Goa Trip goal?",
    timestamp: "10:02 AM",
  },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: "I'm analyzing your request... This feature will be fully powered by AI once connected to the backend. For now, I can show you the interface! 🚀",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 h-screen flex flex-col">
        <div className="container mx-auto max-w-4xl flex-1 flex flex-col p-4">
          {/* Chat Header */}
          <Card className="border-border/50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">पैसा Buddy AI</h2>
                    <p className="text-xs text-success flex items-center gap-1">
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" 
                    ? "bg-primary" 
                    : "gradient-primary shadow-glow"
                }`}>
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div className={`max-w-[75%] ${message.role === "user" ? "text-right" : ""}`}>
                  <div className={`rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border border-border rounded-tl-none"
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-2">{message.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {["Show my budget", "Savings tips", "Track expenses", "Investment advice"].map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setInput(action)}
              >
                {action}
              </Button>
            ))}
          </div>

          {/* Input */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Ask me anything about your finances..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="border-0 focus-visible:ring-0 bg-transparent"
                />
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Mic className="w-5 h-5" />
                </Button>
                <Button 
                  variant="hero" 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Chat;
