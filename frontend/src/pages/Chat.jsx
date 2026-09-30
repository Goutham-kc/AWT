import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useApp } from '../context/AppContext';

export const Chat = () => {
  const { token, user } = useApp();
  const location = useLocation();
  const targetConvId = location.state?.conversationId;

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Message input state
  const [inputText, setInputText] = useState('');
  
  // Proposal modal states
  const [showProposal, setShowProposal] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupTime, setMeetupTime] = useState('');

  // Fetch Conversations list
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/chats/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setConversations(data);
        if (targetConvId) {
          const found = data.find(c => c._id === targetConvId);
          if (found) setActiveConv(found);
          else if (data.length > 0) setActiveConv(data[0]);
        } else if (data.length > 0 && !activeConv) {
          setActiveConv(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token, targetConvId]);

  // Connect Socket.io client
  useEffect(() => {
    if (!token || !user) return;

    // Establish Socket connection
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.io connected to server.');
      socket.emit('register_user', user.id);
    });

    // Listen for new incoming messages
    socket.on('new_message', (msg) => {
      // Append to active message log if conversation matches
      setMessages((prev) => {
        if (prev.length > 0 && prev[0].conversation === msg.conversation) {
          // Prevent duplicates
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        }
        return prev;
      });

      // Refresh last message preview in list
      fetchConversations();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  // Load message log on active conversation change
  useEffect(() => {
    const fetchMessages = async () => {
      if (!token || !activeConv) return;
      try {
        const res = await fetch(`/api/chats/conversations/${activeConv._id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setMessages(data);
          
          // Join conversation Socket room
          socketRef.current?.emit('join_conversation', activeConv._id);
        }
      } catch (err) {
        console.error('Failed to load message history:', err);
      }
    };
    fetchMessages();
  }, [activeConv, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !user) return;

    socketRef.current?.emit('send_message', {
      conversationId: activeConv._id,
      senderId: user.id,
      content,
      type: 'text'
    });

    setInputText('');
  };

  const handleSendProposal = (e) => {
    e.preventDefault();
    if (!activeConv || !user) return;

    let contentStr = '';
    let type = 'text';
    let metadata = {};

    if (proposedPrice) {
      type = 'price_proposal';
      contentStr = `Proposal: New price proposal for rental rate at ${proposedPrice} credits/day.`;
      metadata.proposedPrice = Number(proposedPrice);
    } else if (meetupLocation && meetupTime) {
      type = 'meetup_proposal';
      contentStr = `Proposal: Propose physical pickup handoff meetup at ${meetupLocation} on ${new Date(meetupTime).toLocaleString()}.`;
      metadata.meetupLocation = meetupLocation;
      metadata.meetupTime = meetupTime;
    } else {
      return;
    }

    socketRef.current?.emit('send_message', {
      conversationId: activeConv._id,
      senderId: user.id,
      content,
      type,
      metadata
    });

    // Reset proposal fields
    setProposedPrice('');
    setMeetupLocation('');
    setMeetupTime('');
    setShowProposal(false);
  };

  const getRecipientName = (conv) => {
    const peer = conv.participants.find(p => p._id !== user?.id);
    return peer ? peer.name : 'Unknown User';
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-container-margin py-stack-lg flex gap-stack-lg h-[calc(100vh-90px)] min-h-[500px]">
      
      {/* Left panel: Conversation list */}
      <aside className="w-full md:w-80 flex-shrink-0 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        <h3 className="font-headline font-bold text-lg text-primary p-4 border-b border-outline-variant">Messages Inbox</h3>
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-outline text-sm">No active chats.</div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv._id}
                onClick={() => setActiveConv(conv)}
                className={`p-4 cursor-pointer transition-colors ${
                  activeConv?._id === conv._id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-surface-container-low'
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <h4 className="font-headline font-bold text-sm text-on-surface line-clamp-1">
                    {getRecipientName(conv)}
                  </h4>
                  <span className="text-[10px] text-outline font-semibold">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {conv.associatedListing && (
                  <p className="text-xs text-primary font-bold mt-1 line-clamp-1">
                    Ref: {conv.associatedListing.title}
                  </p>
                )}
                {conv.lastMessage && (
                  <p className="text-xs text-outline line-clamp-1 mt-1">
                    {conv.lastMessage.sender._id === user?.id ? 'You: ' : ''}{conv.lastMessage.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right panel: Active conversation log */}
      <div className="flex-1 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        {activeConv ? (
          <>
            {/* Context Header */}
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="font-headline font-bold text-on-surface text-base">
                  {getRecipientName(activeConv)}
                </h3>
                {activeConv.associatedListing && (
                  <p className="text-xs text-primary font-bold">
                    Referencing Item: {activeConv.associatedListing.title} ({activeConv.associatedListing.pricePerDay} credits/day)
                  </p>
                )}
              </div>
              
              <button 
                onClick={() => setShowProposal(!showProposal)}
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors shadow-sm"
              >
                Propose Terms
              </button>
            </div>

            {/* Proposal Options Area */}
            {showProposal && (
              <div className="p-4 bg-white border-b border-outline-variant space-y-3">
                <h4 className="text-sm font-bold text-primary">Propose Meetup or Rate adjustment</h4>
                <form onSubmit={handleSendProposal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-on-surface">Adjust Rate (credits/day)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 12"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      className="w-full px-3 py-1 border border-outline-variant rounded-md text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-on-surface">Handoff Meetup Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dorm Block B Entrance"
                      value={meetupLocation}
                      onChange={(e) => setMeetupLocation(e.target.value)}
                      className="w-full px-3 py-1 border border-outline-variant rounded-md text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface">Meetup Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={meetupTime}
                      onChange={(e) => setMeetupTime(e.target.value)}
                      className="w-full px-3 py-1 border border-outline-variant rounded-md text-xs focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="md:col-span-2 py-1.5 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary-container transition-colors"
                  >
                    Submit Proposal
                  </button>
                </form>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-surface-container-lowest space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender._id === user?.id;
                const isSystem = msg.content.startsWith('System:');
                
                if (isSystem) {
                  return (
                    <div key={msg._id} className="flex justify-center my-2">
                      <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full text-center max-w-xl">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-xl px-4 py-2 text-sm shadow-sm ${
                      isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-surface border border-outline-variant text-on-surface rounded-tl-none'
                    }`}>
                      <div className="text-[10px] opacity-75 font-semibold mb-0.5">{msg.sender.name}</div>
                      <p className="font-body-sm leading-relaxed">{msg.content}</p>
                      <div className="text-[9px] opacity-50 text-right mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant flex gap-2 flex-shrink-0">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container transition-colors shadow-sm"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-outline">
            <span className="material-symbols-outlined text-5xl mb-2">forum</span>
            <p className="text-sm font-semibold">Select a conversation thread to start real-time coordination.</p>
          </div>
        )}
      </div>

    </div>
  );
};
