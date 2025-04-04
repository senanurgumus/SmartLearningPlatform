export function evaluateBadges(quizResults) {
  const badges = [];

  const totalQuizzes = quizResults.length;
  const perfectScores = quizResults.filter(q => q.score === q.total).length;

  const sortedByDate = quizResults
    .map(q => ({ ...q, date: q.timestamp.toDate() }))
    .sort((a, b) => a.date - b.date);

  let streak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedByDate.length; i++) {
    const diff = (sortedByDate[i].date - sortedByDate[i - 1].date) / (1000 * 3600 * 24);
    if (diff <= 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }

  // 🐣 First quiz
  if (totalQuizzes >= 1) badges.push('🐣 Beginner');

  // 🧠 10 quiz
  if (totalQuizzes >= 10) badges.push('🧠 Quiz Master');

  // 💯 perfect score
  if (perfectScores >= 1) badges.push('💯 Perfect Score');

  // 📚 Consistent Learner: 3 gün üst üste
  if (maxStreak >= 3) badges.push('📚 Consistent Learner');

  // 🔥 Streak Champion: 5 gün üst üste
  if (maxStreak >= 5) badges.push('🔥 Streak Champion');

  return badges;
}
