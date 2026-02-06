"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getConversations,
  getOrCreateConversation,
  sendMessage,
  subscribeToMessages,
  getMyFriends,
  getUserProfile,
} from "@/lib/firebase-db";
import { ChatMessage, Conversation, UserData } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Settings,
  PlusCircle,
  Plus,
  Send,
  Image as ImageIcon,
  MoreHorizontal,
  Info,
  Mail,
  ArrowLeft,
  X,
  Loader,
  Smile,
  Check,
  Sticker,
  Clock,
} from "lucide-react";
import { compressImage } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatPartner, setChatPartner] = useState<UserData | null>(null);
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [gifs, setGifs] = useState<any[]>([]);
  const [searchGif, setSearchGif] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const COMMON_EMOJIS = [
    "❤️",
    "✨",
    "🔥",
    "😂",
    "🙌",
    "💀",
    "🫡",
    "✅",
    "🚀",
    "💯",
    "🙏",
    "👀",
    "📍",
    "🤝",
    "💻",
  ];

  // Load conversations and friends
  useEffect(() => {
    if (!user) return;

    async function loadInitialData() {
      if (!user) return; // Explicit check for TS
      try {
        const [convs, myFriends] = await Promise.all([
          getConversations(user.uid),
          getMyFriends(user.uid),
        ]);

        // For each conversation, fetch the other participant's profile
        const enrichedConvs = await Promise.all(
          convs.map(async (conv: any) => {
            const partnerUid = conv.participantUids.find(
              (id: string) => id !== user.uid,
            );
            const partnerProfile = await getUserProfile(partnerUid);
            return { ...conv, partnerProfile };
          }),
        );

        setConversations(enrichedConvs);
        setFriends(myFriends);
      } catch (error) {
        console.error("Failed to load messages data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [user]);

  // Subscribe to messages when a conversation is selected
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      setChatPartner(null);
      return;
    }

    const conv = conversations.find((c) => c.id === selectedConvId);
    if (conv) {
      setChatPartner(conv.partnerProfile);
    }

    const unsubscribe = subscribeToMessages(selectedConvId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConvId, conversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !selectedConvId || (!newMessage.trim() && !selectedImage))
      return;

    const text = newMessage;
    const photo = selectedImage;
    const tempId = "temp-" + Date.now();

    // Optimistic Update
    const optimisticMsg: ChatMessage = {
      id: tempId,
      senderId: user.uid,
      text: text,
      photoURL: photo || undefined,
      createdAt: { toDate: () => new Date() }, // Mock timestamp
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
    setSelectedImage(null);
    setIsUploading(true);

    try {
      let photoURL = null;
      if (photo) {
        const res = await fetch("/api/cloudinary/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: photo }),
        });

        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        photoURL = data.url;
      }

      await sendMessage(selectedConvId, user.uid, text, photoURL);

      // We don't manually remove the optimistic message here because
      // the Firestore listener will naturally update the list with the real one.
      // But we can mark it as sent or just let the listener handle it.
    } catch (error) {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(text);
      setSelectedImage(photo);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
    } catch (error) {
      toast.error("Failed to process image");
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGifSelect = (gifUrl: string) => {
    // Send directly as a photo message
    handleSendMessageFromUrl(gifUrl);
  };

  const handleSendMessageFromUrl = async (url: string) => {
    if (!user || !selectedConvId) return;

    const tempId = "temp-" + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      senderId: user.uid,
      text: "",
      photoURL: url,
      createdAt: { toDate: () => new Date() },
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsUploading(true);

    try {
      await sendMessage(selectedConvId, user.uid, "", url);
    } catch (error) {
      toast.error("Failed to send GIF");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsUploading(false);
    }
  };

  const loadGifs = async (query: string = "") => {
    try {
      // User's Giphy API key
      const GIPHY_KEY = "dftxcMjKgyHGzJ7h26ddlkrKMxMq0S7W";
      const endpoint = query
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${query}&limit=12`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=12`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.data) {
        setGifs(
          data.data.map((item: any) => ({
            id: item.id,
            url: item.images.original.url,
            preview: item.images.fixed_height_small.url,
            title: item.title,
          })),
        );
      } else {
        throw new Error("No data from Giphy");
      }
    } catch (error) {
      console.error("Failed to fetch GIFs:", error);
      // Fallback curated GIFs if API fails
      setGifs([
        {
          id: "1",
          url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx8A3A8L7C/giphy.gif",
          preview: "https://media.giphy.com/media/3o7TKMGpxx8A3A8L7C/giphy.gif",
          title: "Party",
        },
        {
          id: "2",
          url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlBO7eyWzSZ2hZS/giphy.gif",
          preview: "https://media.giphy.com/media/l0HlBO7eyWzSZ2hZS/giphy.gif",
          title: "Dance",
        },
        {
          id: "3",
          url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif",
          preview: "https://media.giphy.com/media/3o7TKVUn7iM8FMEU24/giphy.gif",
          title: "Wow",
        },
        {
          id: "4",
          url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqZ2dqJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfM77S0mF1gbu/giphy.gif",
          preview: "https://media.giphy.com/media/l41lTfM77S0mF1gbu/giphy.gif",
          title: "Chill",
        },
      ]);
    }
  };

  useEffect(() => {
    loadGifs();
  }, []);

  const startNewChat = async (friendUid: string) => {
    if (!user?.uid) return;
    try {
      const convId = await getOrCreateConversation(user.uid, friendUid);
      setSelectedConvId(convId);

      // Refresh conversation list to include this new one
      const convs = await getConversations(user.uid);
      const enrichedConvs = await Promise.all(
        convs.map(async (conv: any) => {
          const partnerUid = conv.participantUids.find(
            (id: string) => id !== user.uid,
          );
          const partnerProfile = await getUserProfile(partnerUid);
          return { ...conv, partnerProfile };
        }),
      );
      setConversations(enrichedConvs);
    } catch (error) {
      toast.error("Failed to start chat");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading messages...</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* List Column - Hidden on mobile when chat is selected */}
      <div
        className={cn(
          "w-full md:w-[400px] flex flex-col border-r border-zinc-200 dark:border-zinc-800 shrink-0",
          selectedConvId ? "hidden md:flex" : "flex",
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {isStartingNewChat ? (
            <div className="flex items-center gap-4">
              <ArrowLeft
                className="w-5 h-5 cursor-pointer text-zinc-500 hover:text-foreground transition-colors"
                onClick={() => setIsStartingNewChat(false)}
              />
              <h1 className="text-xl font-bold">New Message</h1>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold">Messages</h1>
              <div className="flex gap-2">
                <Settings className="w-5 h-5 cursor-pointer text-zinc-500 hover:text-foreground transition-colors" />
                <PlusCircle
                  className="w-5 h-5 cursor-pointer text-zinc-500 hover:text-foreground transition-colors"
                  onClick={() => setIsStartingNewChat(true)}
                />
              </div>
            </>
          )}
        </div>

        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search Direct Messages"
              className="pl-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border-none focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isStartingNewChat ? (
            <div className="space-y-1">
              {friends.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No friends yet. Add some from the Friends page!
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.uid}
                    onClick={() => {
                      startNewChat(friend.uid);
                      setIsStartingNewChat(false);
                    }}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={friend.photoURL || ""} />
                      <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-tight">
                        {friend.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        @{friend.username}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Welcome to your inbox!
              </p>
              <p className="text-sm">
                Drop a line, share a post and more with private conversations
                between you and others on HabitX.
              </p>
              <Button
                className="mt-4 rounded-full font-bold"
                onClick={() => setIsStartingNewChat(true)}
              >
                Write a message
              </Button>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-r-2",
                  selectedConvId === conv.id
                    ? "bg-zinc-100 dark:bg-zinc-900 border-primary"
                    : "border-transparent",
                )}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conv.partnerProfile?.photoURL || ""} />
                  <AvatarFallback>
                    {conv.partnerProfile?.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold truncate text-sm">
                      {conv.partnerProfile?.name}
                    </span>
                    <span className="text-xs text-zinc-500 shrink-0">
                      {conv.lastMessageAt &&
                        formatDistanceToNow(conv.lastMessageAt.toDate(), {
                          addSuffix: false,
                        })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 truncate">
                    {conv.lastMessage || "Start a conversation"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Column - Full width on mobile when selected */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 bg-background",
          selectedConvId ? "flex" : "hidden md:flex",
        )}
      >
        {selectedConvId ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <ArrowLeft
                  className="w-5 h-5 cursor-pointer text-zinc-500 hover:text-foreground transition-colors md:hidden"
                  onClick={() => setSelectedConvId(null)}
                />
                <Avatar className="w-8 h-8">
                  <AvatarImage src={chatPartner?.photoURL || ""} />
                  <AvatarFallback>{chatPartner?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-sm leading-tight">
                    {chatPartner?.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    @{chatPartner?.username}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-zinc-500">
                <Info className="w-5 h-5 cursor-pointer" />
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              <div className="flex flex-col items-center py-8 border-b border-zinc-100 dark:border-zinc-900 mb-4">
                <Avatar className="w-16 h-16 mb-2">
                  <AvatarImage src={chatPartner?.photoURL || ""} />
                  <AvatarFallback>{chatPartner?.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="font-bold">{chatPartner?.name}</span>
                <span className="text-sm text-zinc-500">
                  @{chatPartner?.username}
                </span>
                <p className="text-sm text-center mt-4 text-zinc-500 max-w-xs">
                  {chatPartner?.bio || "No bio yet"}
                </p>
                <span className="text-xs text-zinc-400 mt-2">
                  Joined{" "}
                  {chatPartner?.streak
                    ? `${chatPartner.streak} streaks ago`
                    : "recently"}
                </span>
              </div>

              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user?.uid;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col gap-2 w-full",
                      isMe ? "items-end" : "items-start",
                    )}
                  >
                    {/* Image Container (Separated) */}
                    {msg.photoURL && (
                      <div
                        className={cn(
                          "rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-w-[70%] sm:max-w-[400px]",
                          isMe
                            ? "bg-primary/5"
                            : "bg-zinc-100 dark:bg-zinc-900",
                        )}
                      >
                        <img
                          src={msg.photoURL}
                          alt="Attached photo"
                          className="w-full h-auto object-cover max-h-[500px]"
                        />
                      </div>
                    )}

                    {/* Text Bubble */}
                    <div
                      className={cn(
                        "flex flex-col gap-1 max-w-[85%]",
                        isMe ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl text-[15px] leading-snug flex items-end gap-2",
                          isMe
                            ? "bg-[#1D9BF0] text-white rounded-tr-none"
                            : "bg-zinc-100 dark:bg-[#2F3336] text-foreground rounded-tl-none",
                        )}
                      >
                        <span>{msg.text}</span>
                        {isMe && (
                          <div className="flex items-center gap-1 shrink-0 mb-0.5">
                            <span className="text-[10px] opacity-70">
                              {msg.createdAt &&
                                format(msg.createdAt.toDate(), "h:mm a")}
                            </span>
                            {msg.status === "sending" ? (
                              <Clock className="w-3 h-3 animate-pulse" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        )}
                        {!isMe && (
                          <span className="text-[10px] opacity-70 mb-0.5">
                            {msg.createdAt &&
                              format(msg.createdAt.toDate(), "h:mm a")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isUploading && (
                <div className="flex justify-end pr-2 py-1">
                  <span className="text-xs text-zinc-500 animate-pulse">
                    Sending message...
                  </span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              {selectedImage && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-xl border-2 border-primary"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-zinc-900 text-white rounded-full p-1 shadow-lg hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-[#15181C] hover:bg-zinc-200 dark:hover:bg-[#202327] cursor-pointer transition-colors text-zinc-900 dark:text-zinc-100"
                  >
                    <Plus className="w-5 h-5" />
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-[#15181C] hover:bg-zinc-200 dark:hover:bg-[#202327] cursor-pointer transition-colors text-zinc-900 dark:text-zinc-100 text-[9px] font-black border-2 border-current scale-90 flex-col leading-none tracking-tighter">
                        GIF
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="start"
                      className="w-80 p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl"
                    >
                      <div className="bg-background">
                        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <Input
                              value={searchGif}
                              onChange={(e) => {
                                setSearchGif(e.target.value);
                                loadGifs(e.target.value);
                              }}
                              placeholder="Search GIFs"
                              className="pl-10 h-9 rounded-full bg-zinc-100 dark:bg-[#202327] border-none focus-visible:ring-primary text-sm"
                            />
                          </div>
                        </div>
                        <div className="p-2 grid grid-cols-2 gap-2 h-64 overflow-y-auto custom-scrollbar">
                          {gifs.map((gif) => (
                            <img
                              key={gif.id}
                              src={gif.preview}
                              alt={gif.title}
                              onClick={() => handleGifSelect(gif.url)}
                              className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-[#15181C] hover:bg-zinc-200 dark:hover:bg-[#202327] cursor-pointer transition-colors text-zinc-900 dark:text-zinc-100">
                        <Smile className="w-5 h-5" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="start"
                      className="w-[300px] p-2 overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl bg-background"
                    >
                      <div className="grid grid-cols-5 gap-1">
                        {COMMON_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() =>
                              setNewMessage((prev) => prev + emoji)
                            }
                            className="w-12 h-12 flex items-center justify-center text-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 bg-zinc-100 dark:bg-[#202327] rounded-3xl px-4 py-2 flex items-center gap-3 ml-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message"
                    className="bg-transparent border-none focus-visible:ring-0 placeholder:text-zinc-500 p-0 h-9"
                  />
                  <button
                    type="submit"
                    disabled={
                      isUploading || (!newMessage.trim() && !selectedImage)
                    }
                    className="text-primary disabled:opacity-50 transition-opacity"
                  >
                    {isUploading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50 dark:bg-black">
            <div className="max-w-[400px] w-full text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-[#15181C] flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-zinc-900 dark:text-white" />
              </div>
              <h2 className="text-3xl font-black mb-2 dark:text-white">
                Start Conversation
              </h2>
              <p className="text-zinc-500 text-[15px] mb-8 leading-relaxed">
                Choose from your existing conversations, or start a new one.
              </p>
              <Button
                className="rounded-full px-8 h-10 font-bold text-sm bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 border-none"
                onClick={() => setIsStartingNewChat(true)}
              >
                New chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
