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
  const activeConvRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Message input state
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  // Proposal modal states
  const [showProposal, setShowProposal] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupTime, setMeetupTime] = useState('');

  // Keep activeConvRef in sync with activeConv
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // Fetch Conversations list
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/chats/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setConversations(data);
        if (targetConvId) {
          const found = data.find(c => c._id === targetConvId);
          if (found) {
            setActiveConv(found);
          } else if (data.length > 0 && !activeConvRef.current) {
            setActiveConv(data[0]);
          }
        } else if (data.length > 0 && !activeConvRef.current) {
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
      if (activeConvRef.current?._id) {
        socket.emit('join_conversation', activeConvRef.current._id);
      }
    });

    // Listen for new incoming messages
    socket.on('new_message', (msg) => {
      const currentActive = activeConvRef.current;
      const msgConvId = typeof msg.conversation === 'object' ? msg.conversation?._id : msg.conversation;

      if (currentActive && currentActive._id === msgConvId) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      // Refresh last message preview in list
      fetchConversations();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  // Load message history on active conversation change
  useEffect(() => {
    const fetchMessages = async () => {
      if (!token || !activeConv) return;
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/chats/conversations/${activeConv._id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setMessages(data);
          
          // Join conversation Socket room
          socketRef.current?.emit('join_conversation', activeConv._id);
        }
      } catch (err) {
        console.error('Failed to load message history:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeConv?._id, token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeConv || !user || sending) return;

    setInputText('');
    setSending(true);

    try {
      // Send via REST API endpoint (persists to DB and triggers socket broadcast)
      const res = await fetch(`/api/chats/conversations/${activeConv._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: text,
          type: 'text'
        })
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages((prev) => {
          if (prev.some(m => m._id === savedMsg._id)) return prev;
          return [...prev, savedMsg];
        });
        fetchConversations();
      } else {
        // Fallback to socket directly
        socketRef.current?.emit('send_message', {
          conversationId: activeConv._id,
          senderId: user.id,
          content: text,
          type: 'text'
        });
      }
    } catch (err) {
      // Fallback to socket on network glitch
      socketRef.current?.emit('send_message', {
        conversationId: activeConv._id,
        senderId: user.id,
        content: text,
        type: 'text'
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (!activeConv || !user) return;

    let contentStr = '';
    let type = 'text';
    let metadata = {};

    if (proposedPrice) {
      type = 'price_proposal';
      contentStr = `Proposal: New price proposal for rental rate at ₹${proposedPrice} / day.`;
      metadata.proposedPrice = Number(proposedPrice);
    } else if (meetupLocation && meetupTime) {
      type = 'meetup_proposal';
      contentStr = `Proposal: Propose physical pickup handoff meetup at ${meetupLocation} on ${new Date(meetupTime).toLocaleString()}.`;
      metadata.meetupLocation = meetupLocation;
      metadata.meetupTime = meetupTime;
    } else {
      return;
    }

    try {
      const res = await fetch(`/api/chats/conversations/${activeConv._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: contentStr,
          type,
          metadata
        })
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages((prev) => {
          if (prev.some(m => m._id === savedMsg._id)) return prev;
          return [...prev, savedMsg];
        });
        fetchConversations();
      } else {
        socketRef.current?.emit('send_message', {
          conversationId: activeConv._id,
          senderId: user.id,
          content: contentStr,
          type,
          metadata
        });
      }
    } catch (err) {
      socketRef.current?.emit('send_message', {
        conversationId: activeConv._id,
        senderId: user.id,
        content: contentStr,
        type,
        metadata
      });
    }

    // Reset proposal fields
    setProposedPrice('');
    setMeetupLocation('');
    setMeetupTime('');
    setShowProposal(false);
  };

  const getRecipientName = (conv) => {
    if (!conv?.participants || !Array.isArray(conv.participants)) return 'Chat';
    const peer = conv.participants.find(p => {
      const pid = typeof p === 'object' ? p?._id?.toString() : p?.toString();
      return pid && pid !== user?.id?.toString();
    });
    return peer?.name || 'Classmate';
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)] min-h-[500px]">
      
      {/* Left panel: Conversation list */}
      <aside className="w-full md:w-80 flex-shrink-0 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        <h3 className="font-headline font-bold text-lg text-primary p-4 border-b border-outline-variant flex items-center justify-between">
          <span>Messages Inbox</span>
          <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
            {conversations.length}
          </span>
        </h3>
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4 text-outline text-sm">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline/60 block">chat_bubble_outline</span>
              No active conversations yet.<br />
              <span className="text-xs text-on-surface-variant">Message a seller from Marketplace or Cart to start chatting!</span>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = activeConv?._id === conv._id;
              const lastSenderId = (conv.lastMessage?.sender?._id || conv.lastMessage?.sender)?.toString();
              const isMe = lastSenderId === user?.id?.toString();

              return (
                <div 
                  key={conv._id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-headline font-bold text-sm text-on-surface line-clamp-1">
                      {getRecipientName(conv)}
                    </h4>
                    <span className="text-[10px] text-outline font-semibold whitespace-nowrap">
                      {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {conv.associatedListing && (
                    <p className="text-xs text-primary font-semibold mt-1 line-clamp-1">
                      Item: {conv.associatedListing.title}
                    </p>
                  )}
                  {conv.lastMessage && (
                    <p className="text-xs text-outline line-clamp-1 mt-1">
                      {isMe ? 'You: ' : ''}{conv.lastMessage.content}
                    </p>
                  )}
                </div>
              );
            })
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
                <h3 className="font-headline font-bold text-on-surface text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                  <span>{getRecipientName(activeConv)}</span>
                </h3>
                {activeConv.associatedListing && (
                  <p className="text-xs text-primary font-semibold mt-0.5">
                    Referencing Item: {activeConv.associatedListing.title} (₹{activeConv.associatedListing.pricePerDay} / day)
                  </p>
                )}
              </div>
              
              <button 
                onClick={() => setShowProposal(!showProposal)}
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
              >
                {showProposal ? 'Close Terms' : 'Propose Terms'}
              </button>
            </div>

            {/* Proposal Options Area */}
            {showProposal && (
              <div className="p-4 bg-white border-b border-outline-variant space-y-3">
                <h4 className="text-sm font-bold text-primary">Propose Meetup or Rate adjustment</h4>
                <form onSubmit={handleSendProposal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface">Adjust Rate (₹/day)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 12"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-on-surface">Handoff Meetup Location</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mechanical Block Entrance"
                      value={meetupLocation}
                      onChange={(e) => setMeetupLocation(e.target.value)}
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-semibold text-on-surface">Meetup Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={meetupTime}
                      onChange={(e) => setMeetupTime(e.target.value)}
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="md:col-span-2 py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/90 transition-colors cursor-pointer"
                  >
                    Submit Proposal
                  </button>
                </form>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-surface-container-lowest space-y-4">
              {loadingMessages ? (
                <div className="text-center py-8 text-outline text-xs font-semibold">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-outline text-xs font-semibold">
                  <span className="material-symbols-outlined text-4xl mb-1 text-outline/50 block">forum</span>
                  No messages yet. Send a message below to start coordinating!
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = (msg.sender?._id || msg.sender)?.toString();
                  const isMe = senderId === user?.id?.toString();
                  const isSystem = msg.content?.startsWith('System:');
                  
                  if (isSystem) {
                    return (
                      <div key={msg._id} className="flex justify-center my-2">
                        <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full text-center max-w-xl">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  const isProposal = msg.type === 'price_proposal' || msg.type === 'meetup_proposal';

                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm shadow-sm ${
                        isProposal 
                          ? 'bg-secondary/10 border border-secondary text-on-surface'
                          : isMe 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-white border border-outline-variant text-on-surface rounded-tl-none'
                      }`}>
                        <div className={`text-[10px] font-semibold mb-0.5 ${isMe ? 'text-white/80' : 'text-primary'}`}>
                          {isMe ? 'You' : (msg.sender?.name || 'Classmate')}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className={`text-[9px] text-right mt-1 ${isMe ? 'text-white/60' : 'text-outline'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant flex gap-2 flex-shrink-0 bg-white">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
              />
              <button 
                type="submit"
                disabled={sending || !inputText.trim()}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-outline p-6 text-center">
            <span className="material-symbols-outlined text-5xl mb-2 text-outline/60">forum</span>
            <h4 className="font-bold text-on-surface text-base mb-1">Your Messages</h4>
            <p className="text-sm font-semibold max-w-sm">
              Select a conversation thread from the left or message a student from any listing to discuss handoffs and pricing.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
