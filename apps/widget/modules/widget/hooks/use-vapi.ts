import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

interface TranscriptMessage {
    role: "user" | "assistant";
    text: string;
}

export const useVapi = () => {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

    useEffect(() => {
        //only for testing the vapi api, otherwise customers will provide their own API keys.
        const vapiInstance = new Vapi("7d54e13a-26a2-412e-b2d3-03837bc2f8e6");
        setVapi(vapiInstance);

        vapiInstance.on("call-start", () => {
            setIsConnected(true);
            setIsConnecting(false);
            setTranscript([]);
        })

        vapiInstance.on("call-end", () => {
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);
        })

        vapiInstance.on("speech-start", () => {
            setIsSpeaking(true);
        })

        vapiInstance.on("speech-end", () => {
            setIsSpeaking(false);
        })

        vapiInstance.on("error", (error) => {
            console.log(error, "VAPI_ERROR");
            setIsConnecting(false);
        });
        
        vapiInstance.on("message", (message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                setTranscript((prev) => [...prev, 
                { 
                role: message.role === "user" ? "user" : "assistant",
                text: message.transcript,
                }]);
            }
        });

        return () => {
            vapiInstance?.stop();
        }
    }, []);

    const startCall = () => {
        setIsConnecting(true);

        if(vapi){
        //only for testing the vapi api, otherwise customers will provide their own Assistant IDs.
            vapi.start("f1f3df6f-c2f5-4685-aada-7db6e74d078b");
        }
    }

    const endCall = () => {
        if(vapi){
            vapi.stop();
        }
    };

    return{
        isSpeaking,
        isConnecting,
        isConnected,
        transcript,
        startCall,
        endCall,
    }
};