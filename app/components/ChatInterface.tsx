"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp, ChatGroup, ChatMessage } from "@/app/context";
import { Send, Users, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatInterfaceProps {
  groupId: string;
  group: ChatGroup;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ groupId, group }) => {
  const { currentUser, messages, sendMessage, loadGroupMessages, markMessagesAsRead, deleteMessage, deleteChatGroup } = useApp();
  const router = useRouter();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const groupMessages = messages[groupId] || [];

  // Load messages on mount
  useEffect(() => {
    loadGroupMessages(groupId);
    markMessagesAsRead(groupId);
  }, [groupId]);

  // Mark as read when messages change
  useEffect(() => {
    if (groupMessages.length > 0) {
      markMessagesAsRead(groupId);
    }
  }, [groupMessages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [groupMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(groupId, messageText);
      setMessageText("");
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    setDeletingMessageId(messageId);
    try {
      await deleteMessage(messageId, groupId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message. Please try again.');
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm(`Are you sure you want to delete "${group.name}"? This will delete all messages in the group and cannot be undone.`)) {
      return;
    }

    setIsDeletingGroup(true);
    try {
      await deleteChatGroup(groupId);
      router.push(`/${currentUser?.role}/chat`);
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Failed to delete group. Please try again.');
      setIsDeletingGroup(false);
    }
  };

  const isManager = currentUser?.role === 'manager';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-black text-zinc-900">{group.name}</h3>
          <p className="text-xs text-zinc-500 font-semibold">
            {group.memberIds.length} members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            title="View members"
          >
            <Users size={20} className="text-zinc-600" />
          </button>
          {isManager && (
            <button
              onClick={handleDeleteGroup}
              disabled={isDeletingGroup}
              className={`p-2 rounded-lg transition-colors ${
                isDeletingGroup
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-red-50 text-zinc-400 hover:text-red-600'
              }`}
              title="Delete group"
            >
              {isDeletingGroup ? (
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 size={20} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6 bg-zinc-50"
      >
        {groupMessages.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {groupMessages.map((message) => {
              const isOwnMessage = message.senderId === currentUser?.id;
              const isSystemMessage = message.type === 'system';

              if (isSystemMessage) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="bg-zinc-200 text-zinc-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {message.text}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isOwnMessage && (
                      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {message.senderAvatar}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="flex-1">
                      {!isOwnMessage && (
                        <p className="text-xs font-bold text-zinc-700 mb-1 px-1">
                          {message.senderName}
                        </p>
                      )}
                      <div className="flex items-start gap-2">
                        <div
                          className={`rounded-2xl px-4 py-2.5 flex-1 ${
                            isOwnMessage
                              ? 'bg-primary text-white'
                              : 'bg-white border border-zinc-200 text-zinc-900'
                          }`}
                        >
                          <p className="text-sm font-semibold break-words whitespace-pre-wrap">
                            {message.text}
                          </p>
                        </div>
                        
                        {/* Delete Button (Manager Only) */}
                        {isManager && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            disabled={deletingMessageId === message.id}
                            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                              deletingMessageId === message.id
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-red-50 text-zinc-400 hover:text-red-600'
                            }`}
                            title="Delete message"
                          >
                            {deletingMessageId === message.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        )}
                      </div>
                      <p className={`text-[10px] text-zinc-400 font-semibold mt-1 px-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-zinc-400 font-semibold">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-zinc-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Members Sidebar (Mobile Drawer / Desktop Sidebar) */}
      {showMembers && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMembers(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-white border-l border-zinc-200 z-50 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                Group Members
              </h3>
              <button
                onClick={() => setShowMembers(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {group.members?.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{member.name}</p>
                    <p className="text-xs text-zinc-500 font-semibold">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
