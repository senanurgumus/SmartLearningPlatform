import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';  // Ensure you are importing your Firestore DB correctly
import './Chatbot.css';

function Chatbot() {
  const [input, setInput] = useState('');  // Kullanıcının yazdığı mesaj
  const [messages, setMessages] = useState([]);  // Mesajları saklamak
  const [loading, setLoading] = useState(false);  // Botun yazıp yazmadığını gösteren durum
  const [userId, setUserId] = useState(null);  // Kullanıcı ID'si
  const [quizResults, setQuizResults] = useState([]);  // Quiz sonuçları

  useEffect(() => {
    // Firebase Authentication'dan kullanıcı bilgilerini al
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      fetchQuizResults(user.uid);  // Kullanıcı ID'si ile quiz sonuçlarını al
    }
  }, []);

  // Firebase'den quiz sonuçlarını al
  const fetchQuizResults = async (userId) => {
    const q = query(collection(db, 'quizResults'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => doc.data());
    setQuizResults(results);
  };

  // Mesaj gönderme fonksiyonu
  const handleSendMessage = async () => {
    if (!input.trim()) return;  // Eğer input boşsa, göndermemek için

    const userMessage = { role: 'user', message: input };  // Kullanıcı mesajını ekliyoruz
    const updatedMessages = [...messages, userMessage];  // Eski mesajları ve yeni mesajı ekliyoruz
    setMessages(updatedMessages);  // Mesajları güncelliyoruz
    setInput('');  // Input kutusunu temizliyoruz
    setLoading(true);  // Botun yazıyormuş gibi durumu aktif ediyoruz

    try {
      // Calculate correct and incorrect answers
      const correctAnswers = quizResults.reduce((sum, entry) => sum + entry.score, 0);
      const incorrectAnswers = quizResults.reduce((sum, entry) => sum + (entry.total - entry.score), 0);

      // Create a JSON object for the AI model
      const quizData = {
        correctAnswers,
        incorrectAnswers,
        quizResults, // Send all quiz results for the AI model
      };

      // Send quiz data and user input to the backend API (Flask)
      const response = await axios.post('http://localhost:5000/ask', { 
        message: input,
        quizData: quizData,  // Send quiz data to AI
      });

      if (response && response.data) {
        const botMessage = { role: 'bot', message: response.data.response };
        setMessages([...updatedMessages, botMessage]);  // Bot mesajını ekliyoruz
      } else {
        console.error("No response data");
        alert("Bot response is missing!");
      }
    } catch (error) {
      console.error("Error sending message to bot:", error);  // Hata durumunda log yazıyoruz
      alert('An error occurred while communicating with the bot.');  // Kullanıcıya hata mesajı
    } finally {
      setLoading(false);  // Her durumda botun yazma durumunu kapatıyoruz
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-history">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role}>
            <span>{msg.message}</span>
          </div>
        ))}
        {loading && <div>Bot is typing...</div>}  {/* Eğer bot yazıyorsa, bunu göster */}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}  // Inputu değiştiriyoruz
        placeholder="Ask something..."  // Placeholder yazısı
      />
      <button className='send' onClick={handleSendMessage}>Send</button>  {/* Butona tıklandığında mesaj gönder */}
    </div>
  );
}

export default Chatbot;
