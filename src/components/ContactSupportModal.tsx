import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Send, Loader2, CheckCircle2 } from "lucide-react";

export function ContactSupportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [responseMsg, setResponseMsg] = useState("");

  const MARKETING_API_URL = import.meta.env.VITE_MARKETING_HUB_URL?.replace("/webhook", "") || "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${MARKETING_API_URL}/email-agent/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: email,
          recipient: "support@bookwebsite.com",
          subject: subject,
          body: body,
        }),
      });

      if (!res.ok) throw new Error("Failed to send email");

      const data = await res.json();
      setResponseMsg(data.reply || "Message received! We will get back to you soon.");
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setResponseMsg("");
    setEmail("");
    setSubject("");
    setBody("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-off/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-elite overflow-hidden relative"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-off text-text2 hover:text-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text">Email Support</h3>
                  <p className="text-sm text-text2">Powered by our AI Agent</p>
                </div>
              </div>

              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  <h4 className="text-lg font-bold text-text mb-2">Message Sent!</h4>
                  <p className="text-text2 mb-6 max-w-[80%]">Our AI Agent has processed your request.</p>
                  <div className="bg-off p-4 rounded-xl text-left border border-border text-sm text-text2 w-full max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {responseMsg}
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2 bg-text text-white rounded-full text-sm font-medium hover:bg-text2 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text2 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-off border border-border rounded-xl text-text placeholder-text2/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text2 mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-off border border-border rounded-xl text-text placeholder-text2/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                      placeholder="e.g. Question about pricing"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text2 mb-1.5">Message</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-off border border-border rounded-xl text-text placeholder-text2/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                      placeholder="How does your coverage compare?"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  </div>

                  {status === "error" && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      Failed to contact our support agent. Please try again later.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full mt-2 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent2 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
