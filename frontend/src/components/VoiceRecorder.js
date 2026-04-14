import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const VoiceRecorder = ({ conversationId, onVoiceSent }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]); // FIXED: should be useRef, not useState
    const timerRef = useRef(null); // FIXED: naming and useRef

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };
            
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Microphone access denied', err);
            alert('Microphone access is required to record voice messages.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        stopRecording();
        setAudioBlob(null);
        setRecordingTime(0);
    };

    const sendVoice = async () => {
        if (!audioBlob) return;
        try {
            const formData = new FormData();
            formData.append('voice', audioBlob, 'voice.webm'); // Matches backend field 'voice'
            formData.append('duration', recordingTime);
            
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/chat/messages/voice/${conversationId}`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setAudioBlob(null);
            setRecordingTime(0);
            onVoiceSent(res.data);
        } catch (error) {
            console.error('Error sending voice:', error);
            alert('Failed to send voice message.');
        }
    };

    return (
        <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
            {!audioBlob ? (
                <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '5px' }}
                >
                    {isRecording ? `⏺️ ${recordingTime}s` : '🎤'}
                </button>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f2f5', padding: '5px 10px', borderRadius: '20px' }}>
                    <audio src={URL.createObjectURL(audioBlob)} controls style={{ height: '30px', maxWidth: '150px' }} />
                    <button onClick={sendVoice} style={{ background: '#0095f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>Send</button>
                    <button onClick={cancelRecording} style={{ background: '#efefef', color: 'black', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
