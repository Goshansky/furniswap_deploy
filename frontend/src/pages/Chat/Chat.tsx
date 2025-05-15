import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import chatService from '../../services/chat.service';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';
import { Chat as ChatType, Message } from '../../services/chat.service';
import styles from './Chat.module.css';
import React from 'react';
import { getFullImageUrl } from '../../services/api';

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [usersData, setUsersData] = useState<Record<number, any>>({});
  const isAuthenticated = authService.isAuthenticated();
  const messageListRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Проверка авторизации
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { state: { from: id ? `/chats/${id}` : '/chats' } });
      return;
    }

    // Получение информации о текущем пользователе
    const user = authService.getCurrentUser();
    console.log('Current user:', user);
    setCurrentUser(user);

    // Загрузка списка чатов
    const fetchChats = async () => {
      if (!isAuthenticated) {
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching chats...');
        const data = await chatService.getChats();
        console.log('Chats received:', data);
        
        if (data && Array.isArray(data.chats)) {
          const filteredChats = data.chats.filter(chat => chat !== null && chat !== undefined);
          setChats(filteredChats);
          
          // Загружаем информацию о пользователях для всех чатов
          const userIds = new Set<number>();
          filteredChats.forEach(chat => {
            // Get other user ID based on the API response format
            if (chat.user1_id && chat.user2_id) {
              const currentUserId = authService.getCurrentUser()?.id;
              const otherUserId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
              if (otherUserId) userIds.add(otherUserId);
            } 
            // Alternative way to get user ID
            else if (chat.other_user_id) {
              userIds.add(chat.other_user_id);
            }
            // Check buyer/seller IDs
            else if (chat.buyer_id && chat.seller_id) {
              const currentUserId = authService.getCurrentUser()?.id;
              const otherUserId = chat.buyer_id === currentUserId ? chat.seller_id : chat.buyer_id;
              if (otherUserId) userIds.add(otherUserId);
            }
            // Check users array
            else if (chat.users && Array.isArray(chat.users)) {
              chat.users.forEach(user => {
                if (user && user.id && user.id !== authService.getCurrentUser()?.id) {
                  userIds.add(user.id);
                }
              });
            }
          });
          
          console.log('User IDs to fetch:', Array.from(userIds));
          // Загружаем данные пользователей
          await fetchUserData(userIds);
          
          setError(null);
        } else {
          console.warn('No valid chats data returned from API:', data);
          setChats([]);
          setError('Не удалось загрузить список чатов');
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Не удалось загрузить чаты');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [isAuthenticated, navigate, id]);

  // Загрузка данных пользователей
  const fetchUserData = async (userIds: Set<number>) => {
    const newUsersData: Record<number, any> = { ...usersData };
    
    for (const userId of userIds) {
      if (!newUsersData[userId]) {
        try {
          console.log(`Fetching user data for ID ${userId}`);
          const userData = await userService.getUserById(userId);
          if (userData) {
            console.log(`Received user data for ID ${userId}:`, userData);
            newUsersData[userId] = userData;
          }
        } catch (error) {
          console.error(`Failed to fetch user data for ID ${userId}:`, error);
        }
      }
    }
    
    setUsersData(newUsersData);
  };

  // Добавляем обработчик ресайза окна для поддержания скролла
  useEffect(() => {
    const handleResize = () => {
      // Обновляем скролл при изменении размера окна
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    };

    // Добавляем слушатель события
    window.addEventListener('resize', handleResize);
    
    // Удаляем слушатель при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Функция для скролла к последнему сообщению
  const scrollToBottom = (delay = 100) => {
    setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    }, delay);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    // Use setTimeout to ensure scroll happens after render
    scrollToBottom();
  }, [messages]);

  // Загрузка сообщений при выборе чата
  useEffect(() => {
    const fetchMessages = async () => {
      if (id && isAuthenticated) {
        setIsLoading(true);
        try {
          console.log(`Fetching messages for chat ID: ${id}`);
          const data = await chatService.getChat(Number(id));
          console.log('Messages received:', data);
          
          if (data && Array.isArray(data.messages)) {
            const validMessages = data.messages.filter(msg => msg !== null && msg !== undefined);
            setMessages(validMessages);
            
            // Получаем ID пользователей из сообщений
            const userIds = new Set<number>();
            
            // Get the current chat to extract other user ID
            const currentChat = chats.find(c => c.id === Number(id));
            if (currentChat) {
              // Determine other user ID based on available data
              if (currentChat.user1_id && currentChat.user2_id) {
                const otherUserId = currentChat.user1_id === currentUser?.id 
                  ? currentChat.user2_id 
                  : currentChat.user1_id;
                userIds.add(otherUserId);
              } else if (currentChat.other_user_id) {
                userIds.add(currentChat.other_user_id);
              } else if (currentChat.buyer_id && currentChat.seller_id) {
                const otherUserId = currentChat.buyer_id === currentUser?.id 
                  ? currentChat.seller_id 
                  : currentChat.buyer_id;
                userIds.add(otherUserId);
              }
            }
            
            // Add message sender IDs
            validMessages.forEach(msg => {
              if (msg.senderId && msg.senderId !== currentUser?.id) {
                userIds.add(msg.senderId);
              }
            });
            
            // Загружаем данные пользователей из сообщений
            await fetchUserData(userIds);
            
            setError(null);
            
            // Scroll to bottom after loading messages - with timeout to ensure render is complete
            scrollToBottom(200);
          } else {
            console.warn('No valid messages returned from API:', data);
            setMessages([]);
            setError('Не удалось загрузить сообщения для выбранного чата');
          }
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError('Не удалось загрузить сообщения');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchMessages();
  }, [id, isAuthenticated, currentUser?.id, chats]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !id) return;

    // Создаем временное сообщение для немедленного отображения
    const tempMessage: Message = {
      id: Date.now() + Math.random(), // Уникальный временный ID
      chatId: Number(id),
      senderId: currentUser?.id,
      text: messageText,
      createdAt: new Date().toISOString()
    };
    
    try {
      setIsSending(true);
      
      // Добавляем сообщение в список сразу для мгновенной обратной связи
      setMessages(prev => [...prev, tempMessage]);
      
      // Очищаем поле ввода сразу
      setMessageText('');
      
      // Прокручиваем к последнему сообщению
      scrollToBottom(100);
      
      // Отправляем сообщение на сервер
      console.log(`Sending message to chat ID: ${id}, text: ${tempMessage.text}`);
      const response = await chatService.sendMessage(Number(id), { content: tempMessage.text });
      console.log('Message sent, response:', response);
      
      // Заменяем временное сообщение реальным, если пришел ответ
      if (response && response.message) {
        setMessages(prev => {
          // Находим и заменяем временное сообщение на реальное
          const newMessages = prev.filter(msg => msg.id !== tempMessage.id);
          // Добавляем сообщение от сервера
          newMessages.push({
            ...response.message,
            // Убедимся, что сообщение точно имеет требуемые поля
            id: response.message.id || Date.now() + Math.random(),
            chatId: Number(id),
            senderId: currentUser?.id,
            text: response.message.text || tempMessage.text,
            createdAt: response.message.createdAt || tempMessage.createdAt
          });
          return newMessages;
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Не удалось отправить сообщение');
      
      // Удаляем временное сообщение в случае ошибки
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Защита от рендеринга при отсутствии авторизации
  if (!isAuthenticated) {
    return null; // Редирект на страницу логина выполняется в useEffect
  }

  // Безопасно найти чат по ID
  const findChatById = (chatId: number): ChatType | null => {
    if (!Array.isArray(chats)) return null;
    return chats.find(chat => chat && typeof chat === 'object' && chat.id === chatId) || null;
  };

  // Безопасно получить другого пользователя из чата
  const getOtherUserInfo = (chat: ChatType) => {
    // Current user ID from state
    const currentUserId = currentUser?.id;
    
    // First determine other user ID based on available fields
    let otherUserId = 0;
    let otherUserName = 'Пользователь';
    
    // Check if chat has user1_id and user2_id (from API response format)
    if (chat?.user1_id && chat?.user2_id) {
      otherUserId = chat.user1_id === currentUserId ? chat.user2_id : chat.user1_id;
      otherUserName = chat.user1_id === currentUserId ? (chat.user2_name || 'Пользователь') : (chat.user1_name || 'Пользователь');
    }
    // Alternative format with buyer/seller IDs
    else if (chat?.buyer_id && chat?.seller_id) {
      otherUserId = chat.buyer_id === currentUserId ? chat.seller_id : chat.buyer_id;
    }
    // If there's a direct other_user_id field
    else if (chat?.other_user_id) {
      otherUserId = chat.other_user_id;
      otherUserName = chat.other_user_name || 'Пользователь';
    }
    // Check users array if available
    else if (chat?.users && Array.isArray(chat.users) && chat.users.length > 0) {
      const otherUser = chat.users.find(user => user && user.id !== currentUserId);
      if (otherUser) {
        otherUserId = otherUser.id;
        otherUserName = otherUser.name || 'Пользователь';
      }
    }
    
    // Get cached user data if available
    const cachedUser = usersData[otherUserId];
    
    return {
      id: otherUserId,
      name: cachedUser?.name || otherUserName,
      avatar: cachedUser?.avatar || null
    };
  };
  
  // Get chat title and image
  const getChatListingInfo = (chat: ChatType) => {
    return {
      title: chat?.listing_title || chat?.listingTitle || '',
      image: chat?.image_url || chat?.listingImage || null
    };
  };
  
  // Get last message info
  const getLastMessageInfo = (chat: ChatType) => {
    // Check for last_message field from the API response
    if (chat?.last_message) {
      return {
        text: chat.last_message,
        time: chat.last_message_at || chat.last_message_time || chat.created_at || ''
      };
    }
    
    // If chat has lastMessage object (backward compatibility)
    if (chat?.lastMessage && typeof chat.lastMessage === 'object') {
      return {
        text: chat.lastMessage.text || 'Нет сообщений',
        time: chat.lastMessage.createdAt || chat.created_at || ''
      };
    }
    
    // Default fallback
    return {
      text: 'Нет сообщений',
      time: chat?.created_at || ''
    };
  };
  
  // Format time to Moscow timezone (UTC+3)
  const formatTimeToMSK = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if valid date
      if (isNaN(date.getTime())) {
        return 'Неизвестное время';
      }
      
      // Convert to Moscow time (UTC+3)
      const mskTime = new Date(date.getTime());
      mskTime.setHours(date.getHours() - 3 - new Date().getTimezoneOffset() / 60);
      
      return mskTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
      }) + ' (МСК)';
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Неизвестное время';
    }
  };
  
  // Format date for displaying
  const formatMessageDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if valid date
      if (isNaN(date.getTime())) {
        return 'Неизвестная дата';
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const messageDate = new Date(date);
      messageDate.setHours(0, 0, 0, 0); // Set to beginning of day
      
      // Check if the date is today
      if (messageDate.getTime() === today.getTime()) {
        return 'Сегодня';
      }
      
      // Check if the date is yesterday
      if (messageDate.getTime() === yesterday.getTime()) {
        return 'Вчера';
      }
      
      // For other dates, format as DD.MM.YYYY
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Неизвестная дата';
    }
  };
  
  // Group messages by date and sender
  const groupMessagesByDateAndSender = (messages: Message[]) => {
    // First group by date
    const groupedByDate: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      if (!message) return;
      
      const date = new Date(message.createdAt);
      const dateString = date.toDateString(); // Use date string as key
      
      if (!groupedByDate[dateString]) {
        groupedByDate[dateString] = [];
      }
      
      groupedByDate[dateString].push(message);
    });
    
    // Define interface for extended message with isConsecutive flag
    interface MessageWithFlag extends Message {
      isConsecutive?: boolean;
    }
    
    // Process each date group for consecutive sender messages
    const processedGroups: [string, MessageWithFlag[]][] = Object.entries(groupedByDate)
      .sort(([dateA], [dateB]) => {
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .reverse() // Reverse to show oldest first
      .map(([dateString, messages]) => {
        // Tag consecutive messages
        const messagesWithConsecutiveFlag = messages.map((message, index) => {
          const isConsecutive = index > 0 && messages[index - 1]?.senderId === message.senderId;
          return { ...message, isConsecutive };
        });
        
        return [dateString, messagesWithConsecutiveFlag];
      });
    
    return processedGroups;
  };

  // Получаем текущий чат, если есть ID
  const currentChat = id ? findChatById(Number(id)) : null;

  return (
    <div className={styles.container}>
      <Header />
      {isLoading && !id ? (
        <div className={styles.loadingContainer}>
          <span className={styles.loadingText}>Загрузка чатов...</span>
        </div>
      ) : error && !id ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      ) : (
        <div className={styles.chatContainer}>
          <div className={styles.chatsList}>
            <h2 className={styles.chatTitle}>Сообщения</h2>
            {!Array.isArray(chats) || chats.length === 0 ? (
              <div className={styles.emptyChats}>
                <p>У вас пока нет сообщений</p>
                <Link to="/catalog" className={styles.browseCatalogLink}>
                  Найти что-нибудь интересное
                </Link>
              </div>
            ) : (
              chats.map((chat) => {
                if (!chat || typeof chat !== 'object') {
                  console.warn("Invalid chat object:", chat);
                  return null;
                }
                
                try {
                  // Get other user info, listing info, and last message safely
                  const otherUser = getOtherUserInfo(chat);
                  getChatListingInfo(chat);
                  const lastMessage = getLastMessageInfo(chat);
                  
                  return (
                    <div 
                      key={chat.id} 
                      className={`${styles.chatItem} ${Number(id) === chat.id ? styles.active : ''}`}
                      onClick={() => navigate(`/chats/${chat.id}`)}
                    >
                      <img 
                        src={otherUser.avatar 
                          ? (typeof otherUser.avatar === 'string' && (otherUser.avatar.startsWith('http://') || otherUser.avatar.startsWith('https://'))
                              ? otherUser.avatar
                              : getFullImageUrl(otherUser.avatar)) 
                          : 'https://via.placeholder.com/50?text=U'} 
                        alt={otherUser.name} 
                        className={styles.avatar} 
                      />
                      <div className={styles.chatInfo}>
                        <h3>{otherUser.name}</h3>
                        <p>{lastMessage.text}</p>
                      </div>
                      {lastMessage.time && (
                        <span className={styles.time}>
                          {formatTimeToMSK(lastMessage.time)}
                        </span>
                      )}
                    </div>
                  );
                } catch (err) {
                  console.error("Error rendering chat item:", err, chat);
                  return null;
                }
              }).filter(Boolean) // Удаляем null элементы
            )}
          </div>
          
          {id ? (
            isLoading ? (
              <div className={styles.messagesContainer}>
                <div className={styles.loadingMessages}>
                  <span>Загрузка сообщений...</span>
                </div>
              </div>
            ) : error ? (
              <div className={styles.messagesContainer}>
                <div className={styles.errorMessages}>
                  <p>{error}</p>
                  <button 
                    className={styles.retryButton}
                    onClick={() => window.location.reload()}
                  >
                    Попробовать снова
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.messagesContainer}>
                <div className={styles.messagesHeader}>
                  {currentChat && (
                    <>
                      <div className={styles.headerUserInfo}>
                        {getOtherUserInfo(currentChat).avatar && (
                          <img 
                            src={typeof getOtherUserInfo(currentChat).avatar === 'string' && 
                                 (getOtherUserInfo(currentChat).avatar?.startsWith('http://') || 
                                  getOtherUserInfo(currentChat).avatar?.startsWith('https://'))
                                ? getOtherUserInfo(currentChat).avatar 
                                : getFullImageUrl(getOtherUserInfo(currentChat).avatar)}
                            alt={getOtherUserInfo(currentChat).name}
                            className={styles.headerAvatar}
                          />
                        )}
                        <h2>
                          {getOtherUserInfo(currentChat).name}
                        </h2>
                      </div>
                      <div className={styles.listingInfo}>
                        {getChatListingInfo(currentChat).title}
                      </div>
                    </>
                  )}
                </div>
                <div className={styles.messagesList} ref={messageListRef}>
                  {!Array.isArray(messages) || messages.length === 0 ? (
                    <div className={styles.emptyMessages}>
                      <p>Нет сообщений</p>
                      <p>Отправьте сообщение, чтобы начать диалог</p>
                    </div>
                  ) : (
                    groupMessagesByDateAndSender(messages).map(([dateString, dateMessages], groupIndex) => (
                      <div key={`date-group-${dateString}-${groupIndex}`}>
                        <div className={styles.messageDate}>
                          <span>{formatMessageDate(dateString)}</span>
                        </div>
                        {dateMessages.map((message, msgIndex) => {
                          if (!message || typeof message !== 'object') return null;
                          
                          // Определяем, является ли сообщение моим или от собеседника
                          const isMyMessage = message.senderId === currentUser?.id;
                          
                          // Получаем данные пользователя
                          const userData = isMyMessage 
                            ? currentUser 
                            : usersData[message.senderId] || getOtherUserInfo(currentChat!);
                          
                          // Получаем URL аватара
                          const avatarUrl = userData?.avatar 
                            ? (typeof userData.avatar === 'string' && (userData.avatar.startsWith('http://') || userData.avatar.startsWith('https://')) 
                              ? userData.avatar 
                              : getFullImageUrl(userData.avatar))
                            : (isMyMessage 
                              ? 'https://via.placeholder.com/50?text=Me'
                              : 'https://via.placeholder.com/50?text=U');
                          
                          return (
                            <div 
                              key={`msg-${message.id}-${msgIndex}`}
                              className={`${styles.message} ${isMyMessage ? styles.ownMessage : styles.otherMessage} ${message.isConsecutive ? styles.consecutiveMessage : ''}`}
                            >
                              <img 
                                src={avatarUrl}
                                alt={isMyMessage ? 'Вы' : userData?.name || 'Собеседник'} 
                                className={styles.messageAvatar} 
                              />
                              <div className={styles.messageContent}>
                                <p>{message.text}</p>
                                <span className={styles.timestamp}>
                                  {formatTimeToMSK(message.createdAt)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.messageInputContainer}>
                  <textarea 
                    value={messageText} 
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Напишите сообщение..."
                    className={styles.messageInput}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    className={styles.sendButton}
                    disabled={isSending}
                  >
                    {isSending ? 'Отправка...' : 'Отправить'}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className={styles.emptyState}>
              <h2>Выберите чат, чтобы начать общение</h2>
              {(!Array.isArray(chats) || chats.length === 0) && (
                <p>У вас пока нет сообщений. Перейдите в каталог, чтобы найти интересные объявления.</p>
              )}
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Chat; 