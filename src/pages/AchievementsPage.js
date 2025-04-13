import React, { useEffect, useState } from 'react';
import { db, app } from '../firebase.js';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import './AchievementsPage.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const badgeDescriptions = {
  "🐣 Beginner": "Complete at least 1 quiz.",
  "🧠 Quiz Master": "Complete 10 quizzes.",
  "💯 Perfect Score": "Answer all questions correctly in a quiz.",
  "📚 Consistent Learner": "Solve quizzes for 3 consecutive days.",
  "🔥 Streak Champion": "Complete quizzes for 5 consecutive days."
};

function getEarnedBadges(quizResults) {
  const badges = [];
  const totalQuizzes = quizResults.length;
  const perfectScores = quizResults.filter(q => q.score === q.total).length;

  if (totalQuizzes >= 1) badges.push('🐣 Beginner');
  if (totalQuizzes >= 10) badges.push('🧠 Quiz Master');
  if (perfectScores >= 1) badges.push('💯 Perfect Score');

  const uniqueDays = new Set(
    quizResults.map(q => q.timestamp.toDate().toDateString())
  );
  const sortedDays = [...uniqueDays].sort();
  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    if ((curr - prev) / (1000 * 60 * 60 * 24) === 1) {
      streak++;
      if (streak >= 3 && !badges.includes('📚 Consistent Learner')) {
        badges.push('📚 Consistent Learner');
      }
    } else {
      streak = 1;
    }
  }

  if (streak >= 5) badges.push('🔥 Streak Champion');

  return badges;
}

function AchievementsPage() {
  const [quizData, setQuizData] = useState({});
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [unearnedBadges, setUnearnedBadges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupGif, setPopupGif] = useState('');
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('english');

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const userId = user.uid;
      const q = query(collection(db, 'quizResults'), where('userId', '==', userId), where('module', '==', moduleFilter));

      const unsubscribeData = onSnapshot(q, (snapshot) => {
        const userResults = snapshot.docs.map(doc => doc.data());

        const badges = getEarnedBadges(userResults);
        setEarnedBadges(badges);

        const allBadges = ['🐣 Beginner', '🧠 Quiz Master', '💯 Perfect Score', '📚 Consistent Learner', '🔥 Streak Champion'];
        const unearned = allBadges.filter(b => !badges.includes(b));
        setUnearnedBadges(unearned);

        const dayMap = {
          0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
          4: 'Thursday', 5: 'Friday', 6: 'Saturday'
        };

        const grouped = {
          Monday: { correct: 0, incorrect: 0 },
          Tuesday: { correct: 0, incorrect: 0 },
          Wednesday: { correct: 0, incorrect: 0 },
          Thursday: { correct: 0, incorrect: 0 },
          Friday: { correct: 0, incorrect: 0 },
          Saturday: { correct: 0, incorrect: 0 },
          Sunday: { correct: 0, incorrect: 0 }
        };

        userResults.forEach(entry => {
          const date = entry.timestamp.toDate();
          const day = dayMap[date.getDay()];
          grouped[day].correct += entry.score;
          grouped[day].incorrect += (entry.total - entry.score);
        });

        setQuizData(grouped);
        setLoading(false);
      });

      return () => unsubscribeData();
    });

    return () => unsubscribeAuth();
  }, [moduleFilter]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const correctCounts = days.map(day => quizData[day]?.correct || 0);
  const incorrectCounts = days.map(day => quizData[day]?.incorrect || 0);

  const chartData = {
    labels: days,
    datasets: [
      {
        label: 'Correct',
        backgroundColor: '#4CAF50',
        data: correctCounts
      },
      {
        label: 'Incorrect',
        backgroundColor: '#F44336',
        data: incorrectCounts
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const handleBadgeClick = (badge) => {
    if (earnedBadges.includes(badge)) {
      setPopupMessage(`Congratulations! You've earned the ${badge} badge!`);
      setPopupGif('🎉');
    } else {
      setPopupMessage(`Keep going! You need to complete more quizzes to earn the ${badge} badge.`);
      setPopupGif('😞');
    }
    setShowPopup(true);
  };

  if (loading) return <p>Loading your achievements...</p>;

  return (
    <div className="achievements-container">
      <h2>🎓 Your Achievements</h2>

      <div className="module-filter">
        <label>Select Module:</label>
        <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
          <option value="english">English</option>
          <option value="math">Math</option>
          <option value="science">Science</option>
        </select>
      </div>

      <div className="section">
        <h3>📈 Weekly Quiz Progress ({moduleFilter.toUpperCase()})</h3>
        <div className="chart-area">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="sections">
        <div className="section-left">
          <h3>🏅 Badges Earned</h3>
          {earnedBadges.length > 0 ? (
            <ul className="badge-list">
              {earnedBadges.map((badge, index) => (
                <li key={index} className="badge" onClick={() => handleBadgeClick(badge)}>
                  <span>{badge}</span>
                  <p>{badgeDescriptions[badge]}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No badges earned yet. Keep learning!</p>
          )}
        </div>

        <div className="section-right">
          <h3>🏅 Badges Not Earned Yet</h3>
          {unearnedBadges.length > 0 ? (
            <ul className="badge-list">
              {unearnedBadges.map((badge, index) => (
                <li key={index} className="badge" onClick={() => handleBadgeClick(badge)}>
                  <span>{badge}</span>
                  <p>{badgeDescriptions[badge]}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>You’re close to earning all the badges!</p>
          )}
        </div>
      </div>

      <div className="section">
        <h3>🧩 Your Level</h3>
        <p>Level 1 - Beginner</p>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <span className="close-btn" onClick={() => setShowPopup(false)}>×</span>
            <h3>{popupMessage}</h3>
            <div className="popup-gif">{popupGif}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AchievementsPage;
