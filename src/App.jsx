import { useEffect, useMemo, useRef, useState } from 'react'

const PROGRESS_STORAGE_KEY = 'luyen-tieng-viet:lesson-05:progress-v1'

const readSavedProgress = () => {
  if (typeof window === 'undefined') return {}

  try {
    const saved = window.localStorage.getItem(PROGRESS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

const restoreArray = (value, length, fallback, isValid) => (
  Array.isArray(value) && value.length === length && value.every(isValid)
    ? value
    : Array(length).fill(fallback)
)

const exercises = [
  { short: 'Bài 1', title: 'Chọn câu đúng', englishTitle: 'Choose the correct sentence', description: 'Nhận dạng cấu trúc đúng ngữ pháp', count: 3 },
  { short: 'Bài 2', title: 'Điền vào chỗ trống', englishTitle: 'Fill in the blanks', description: 'Hoàn chỉnh đoạn văn về hội sách', count: 6 },
  { short: 'Bài 3', title: 'Sắp xếp câu', englishTitle: 'Put the sentence in order', description: 'Xếp các thẻ từ theo đúng trật tự', count: 3 },
  { short: 'Bài 4', title: 'Tình huống giao tiếp', englishTitle: 'Communication situations', description: 'Chọn cách nói phù hợp với ngữ cảnh', count: 3 },
  { short: 'Bài 5', title: 'Nối hai vế câu', englishTitle: 'Match the sentence halves', description: 'Ghép hai vế thành câu hoàn chỉnh', count: 5 },
]

const grammarQuestions = [
  {
    structure: '...đã...chưa?',
    prompt: 'Chọn câu đúng ngữ pháp với cấu trúc “...đã...chưa?”',
    options: [
      'Bạn chưa bao giờ đã đi cắm trại ở biển?',
      'Bạn đã đi cắm trại ở biển chưa bao giờ?',
      'Bạn đã bao giờ đi cắm trại ở biển chưa?',
      'Đã bao giờ bạn chưa đi cắm trại ở biển?',
    ],
    answer: 2,
    explanation: 'Cấu trúc hỏi trải nghiệm đúng là: Chủ ngữ + đã (bao giờ) + cụm động từ + chưa?',
    explanationEn: 'Vietnamese experience questions follow this order: Subject + đã (bao giờ) + verb phrase + chưa? Only option C follows that order; the other choices place đã, chưa or bao giờ incorrectly.',
  },
  {
    structure: 'Nghe nói...',
    prompt: 'Chọn câu đúng ngữ pháp với cấu trúc “Nghe nói...”',
    options: [
      'Bộ phim mới này nghe nói chưa xem bao giờ.',
      'Nghe nói bộ phim hoạt hình mới này hấp dẫn và xúc động lắm!',
      'Tôi nghe nói đã đi xem bộ phim này chưa?',
      'Nghe nói vì bộ phim hay nên chưa xem.',
    ],
    answer: 1,
    explanation: '“Nghe nói” thường đứng đầu câu trần thuật để truyền đạt lại thông tin nghe được từ người khác.',
    explanationEn: 'Nghe nói normally comes at the beginning of a statement to introduce information heard from another person. Option B is the only complete and natural statement.',
  },
  {
    structure: 'vẫn / còn / vẫn còn',
    prompt: 'Chọn câu dùng đúng phó từ “vẫn / còn / vẫn còn”',
    options: [
      'Dù đã khuya nhưng anh ấy chưa vẫn xem phim.',
      'Bố mẹ không cho nó chơi game mà nó đã chơi.',
      'Mưa cả buổi sáng, chiều nay chưa mưa nữa.',
      'Dù đã xem bộ phim này hai lần rồi nhưng tôi vẫn còn muốn xem lại.',
    ],
    answer: 3,
    explanation: '“Vẫn còn” đứng trước động từ “muốn” để biểu thị cảm xúc tiếp tục tồn tại.',
    explanationEn: 'Vẫn còn is placed before the verb muốn to show that the desire continues. Option D correctly contrasts a previous action with a feeling that still remains.',
  },
]

const fillItems = [
  { choices: ['đã có', 'chưa có', 'vẫn có'], choicesEn: ['already have', 'do not have yet', 'still have'], answer: 'đã có', explanation: 'Đi với “chưa” ở cuối câu để tạo cấu trúc hỏi “...đã...chưa?”.', explanationEn: 'Đã có pairs with chưa at the end to ask whether someone has already made a plan.' },
  { choices: ['rồi', 'chưa', 'vẫn'], choicesEn: ['already', 'yet', 'still'], answer: 'chưa', explanation: 'Hoàn thành cấu trúc câu hỏi “...đã...chưa?”.', explanationEn: 'Chưa closes the question pattern đã...chưa?, which means “have...yet?”' },
  { choices: ['Nghe nói', 'Đã từng', 'Vẫn còn'], choicesEn: ['I heard that', 'have experienced', 'still'], answer: 'Nghe nói', explanation: 'Đứng đầu câu để truyền đạt thông tin nghe được về hội sách.', explanationEn: 'Nghe nói introduces information the speaker heard from someone else, so it naturally begins the sentence about the book fair.' },
  { choices: ['đã', 'chưa', 'vẫn'], choicesEn: ['already', 'not yet', 'still'], answer: 'vẫn', explanation: 'Biểu thị mong muốn tiếp tục, dù người nói đã đi hội sách hôm qua.', explanationEn: 'Vẫn means “still” and shows that the wish to return continues even though the speaker went there yesterday.' },
  { choices: ['chưa', 'còn', 'đã'], choicesEn: ['not yet', 'still / additionally', 'already'], answer: 'còn', explanation: 'Biểu thị hoạt động tặng vé vẫn tiếp tục và là một thông tin bổ sung.', explanationEn: 'Còn shows that the ticket giveaway is still available and adds another piece of information about the event.' },
  { choices: ['đã từng', 'vẫn còn', 'nghe nói'], choicesEn: ['have experienced', 'are still', 'I heard that'], answer: 'vẫn còn', explanation: 'Nhấn mạnh hành động xếp hàng đang tiếp diễn bất chấp thời tiết nắng.', explanationEn: 'Vẫn còn emphasizes that people continue to queue despite the sunny weather.' },
]

const orderQuestions = [
  {
    tokens: ['xem', 'Bạn', 'ở rạp', 'chưa?', 'đã', 'phim hoạt hình', 'bao giờ'],
    answer: ['Bạn', 'đã', 'bao giờ', 'xem', 'phim hoạt hình', 'ở rạp', 'chưa?'],
    explanation: 'Cấu trúc hỏi trải nghiệm: Chủ ngữ + đã bao giờ + động từ + chưa?',
    explanationEn: 'The correct order for an experience question is: Subject + đã bao giờ + verb phrase + chưa? The time and place details come after the main verb phrase.',
  },
  {
    tokens: ['cuối tuần này', 'Nghe nói', 'ca nhạc', 'có', 'rất hay.', 'chương trình'],
    answer: ['Nghe nói', 'cuối tuần này', 'có', 'chương trình', 'ca nhạc', 'rất hay.'],
    explanation: '“Nghe nói” đứng đầu câu để truyền đạt lại một thông tin.',
    explanationEn: 'Nghe nói introduces reported information, followed by the time phrase, có and the event being announced.',
  },
  {
    tokens: ['căng thẳng,', 'học tập', 'vẫn', 'chơi thể thao', 'Dù', 'Nam', 'đều đặn.'],
    answer: ['Dù', 'học tập', 'căng thẳng,', 'Nam', 'vẫn', 'chơi thể thao', 'đều đặn.'],
    explanation: '“Vẫn” chỉ sự duy trì thói quen dù có một điều kiện gây cản trở.',
    explanationEn: 'The contrast pattern is Dù + difficult condition, + subject + vẫn + action. Vẫn shows that Nam continues the habit despite the pressure.',
  },
]

const scenarioQuestions = [
  {
    context: 'Minh đang trò chuyện với một người bạn mới quen về sở thích đọc sách.',
    quote: 'Mình rất thích đọc truyện trinh thám. Bạn ______ đọc cuốn sách nổi tiếng này ______?',
    options: ['vẫn ... còn', 'nghe nói ... chưa', 'còn ... không', 'đã ... chưa'],
    answer: 3,
    explanation: 'Minh hỏi xem người bạn đã trải nghiệm việc đọc cuốn sách đó hay chưa.',
    explanationEn: 'Minh is asking whether the other person has had the experience of reading the book, so the paired structure đã...chưa? is required.',
  },
  {
    context: 'Lan nghe các bạn trong lớp bàn tán về chuyến dã ngoại rồi quay sang nói với Mai.',
    quote: 'Mai ơi, ______ tháng sau trường mình sẽ tổ chức đi cắm trại ở biển đấy!',
    options: ['Đã bao giờ', 'Nghe nói', 'Vẫn còn', 'Chưa từng'],
    answer: 1,
    explanation: 'Lan truyền đạt lại thông tin mình vừa nghe được nên dùng “Nghe nói”.',
    explanationEn: 'Lan is passing on information she has just heard from classmates. Nghe nói is therefore the natural phrase at the beginning of the sentence.',
  },
  {
    context: 'Đã 11 giờ đêm, mẹ đi ngang qua phòng và thấy đèn bàn của Tuấn vẫn sáng.',
    quote: 'Muộn thế này rồi mà con ______ thức để xem bóng đá à?',
    options: ['đã từng', 'nghe nói', 'vẫn còn', 'đã chưa'],
    answer: 2,
    explanation: 'Hành động xem bóng đá đang tiếp diễn đến khuya và chưa dừng lại.',
    explanationEn: 'The action is continuing late at night and has not stopped, so vẫn còn, meaning “still”, is the appropriate choice.',
  },
]

const matchLeft = [
  'Anh đã bao giờ tham gia',
  'Nghe nói bộ phim Coco của hãng Pixar',
  'Dù công việc cuối năm rất bận rộn và áp lực nhưng cô ấy',
  'Họ đã xem chương trình giải trí này cả tiếng đồng hồ rồi mà',
  'Chiều nay tập cầu lông xong chúng mình',
]

const matchRight = [
  'các hoạt động tình nguyện vào dịp cuối tuần chưa?',
  'có nội dung rất xúc động và đáng để xem lắm!',
  'vẫn duy trì thói quen tập yoga đều đặn mỗi sáng.',
  'vẫn còn cười nói rất hào hứng, chưa muốn tắt ti vi.',
  'còn đi nhà sách để tìm mua tài liệu học tiếng Việt nữa.',
]

const matchRightEn = [
  'in volunteer activities on weekends?',
  'is very moving and well worth watching!',
  'still maintains her habit of doing yoga every morning.',
  'are still laughing excitedly and do not want to turn off the TV.',
  'will also go to the bookstore to buy Vietnamese learning materials.',
]

const matchExplanations = [
  '“Đã bao giờ...chưa?” là cấu trúc hỏi về một trải nghiệm trong quá khứ.',
  '“Nghe nói” mở đầu thông tin được nghe lại; vế sau mô tả nội dung bộ phim.',
  'Cặp “dù...nhưng...vẫn” diễn tả một hành động vẫn tiếp tục bất chấp khó khăn.',
  '“Vẫn còn” cho biết trạng thái cười nói hào hứng đang tiếp diễn.',
  '“Còn” bổ sung thêm hoạt động đi nhà sách sau khi tập cầu lông.',
]

const matchExplanationsEn = [
  'Đã bao giờ...chưa? is used to ask whether someone has ever had a past experience.',
  'Nghe nói introduces reported information, and the second half describes the content of the film.',
  'The pattern dù...nhưng...vẫn shows that an action continues despite a difficult condition.',
  'Vẫn còn shows that their excited laughing and talking are continuing.',
  'Còn adds another activity—going to the bookstore—after playing badminton.',
]

const Icon = ({ name, size = 20 }) => {
  const paths = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
    spark: <><path d="m12 3-1.1 3.4a7.5 7.5 0 0 1-4.5 4.5L3 12l3.4 1.1a7.5 7.5 0 0 1 4.5 4.5L12 21l1.1-3.4a7.5 7.5 0 0 1 4.5-4.5L21 12l-3.4-1.1a7.5 7.5 0 0 1-4.5-4.5z" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    trophy: <><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function OptionList({ questionIndex, options, value, onChange, correctAnswer, submitted, group }) {
  return (
    <div className="option-list" role="radiogroup" aria-label={`Câu ${questionIndex + 1}`}>
      {options.map((option, index) => {
        const isCorrect = submitted && index === correctAnswer
        const isWrong = submitted && index === value && index !== correctAnswer
        const className = ['option', value === index ? 'selected' : '', isCorrect ? 'correct' : '', isWrong ? 'wrong' : ''].filter(Boolean).join(' ')

        return (
          <label className={className} key={option}>
            <input type="radio" name={`${group}-${questionIndex}`} checked={value === index} onChange={() => onChange(index)} disabled={submitted} />
            <span className="option-letter">{String.fromCharCode(65 + index)}</span>
            <span className="option-text">{option}</span>
            {isCorrect && <span className="answer-icon"><Icon name="check" size={16} /></span>}
            {isWrong && <span className="answer-icon wrong-icon">×</span>}
          </label>
        )
      })}
    </div>
  )
}

function Feedback({ correct, explanation, explanationEn }) {
  return (
    <div className={`feedback ${correct ? 'feedback-correct' : 'feedback-wrong'}`} role="status">
      <span className="feedback-mark">{correct ? <Icon name="check" size={18} /> : '!'}</span>
      <div>
        <strong><span>{correct ? 'Chính xác!' : 'Chưa chính xác'}</span><small>{correct ? 'Correct!' : 'Not quite'}</small></strong>
        <p>{explanation}</p>
        <p className="explanation-en">{explanationEn}</p>
      </div>
    </div>
  )
}

function ResultsPage({ exercises, sectionScores, totalQuestions, reviewItems, onReviewExercise, onReviewMistakes, onRestart }) {
  const finalScore = sectionScores.reduce((sum, score) => sum + score, 0)
  const percentage = Math.round((finalScore / totalQuestions) * 100)
  const wrongCount = totalQuestions - finalScore
  const [reviewFilter, setReviewFilter] = useState('all')
  const visibleItems = reviewFilter === 'wrong' ? reviewItems.filter((item) => !item.correct) : reviewItems
  const resultMessage = percentage >= 90
    ? 'Xuất sắc! Bạn đã nắm rất chắc các cấu trúc của bài học.'
    : percentage >= 70
      ? 'Làm tốt lắm! Hãy xem lại vài câu chưa đúng để ghi nhớ lâu hơn.'
      : 'Bạn đã hoàn thành bài học. Phần xem lại bên dưới sẽ giúp bạn củng cố kiến thức.'
  const resultMessageEn = percentage >= 90
    ? 'Excellent! You have a strong command of the structures in this lesson.'
    : percentage >= 70
      ? 'Great work! Review the questions you missed to remember them longer.'
      : 'You completed the lesson. Use the review below to strengthen your understanding.'

  return (
    <div className="app-shell results-shell">
      <header className="site-header results-header">
        <div className="header-inner">
          <button className="brand brand-button" type="button" onClick={() => onReviewExercise(0)} aria-label="Quay lại bài học / Back to lesson"><div><strong>Luyện tiếng Việt</strong><span>Cùng hiểu · Cùng dùng</span></div></button>
          <div className="results-header-label"><Icon name="check" size={16} /><span>Đã hoàn thành 5/5 bài<small>Completed 5/5 exercises</small></span></div>
        </div>
      </header>

      <main className="results-page">
        <section className="results-hero">
          <div className="result-trophy"><Icon name="trophy" size={34} /></div>
          <span className="results-kicker">TỔNG KẾT BÀI HỌC 05 <small>LESSON 05 SUMMARY</small></span>
          <h1>Bạn đã hoàn thành bài học!<small>You have completed the lesson!</small></h1>
          <p>{resultMessage}<small>{resultMessageEn}</small></p>
          <div className="score-ring" style={{ '--score-angle': `${percentage * 3.6}deg` }}>
            <div><strong>{percentage}%</strong><span>{finalScore}/{totalQuestions} câu đúng · correct</span></div>
          </div>
        </section>

        <section className="result-stats" aria-label="Thống kê tổng quan">
          <article><span className="stat-icon stat-blue"><Icon name="target" size={21} /></span><div><small>Độ chính xác</small><strong>{percentage}%</strong><p>Accuracy</p></div></article>
          <article><span className="stat-icon stat-green"><Icon name="check" size={21} /></span><div><small>Câu trả lời đúng</small><strong>{finalScore}</strong><p>Correct answers</p></div></article>
          <article><span className="stat-icon stat-red">×</span><div><small>Cần xem lại</small><strong>{wrongCount}</strong><p>Needs review</p></div></article>
          <article><span className="stat-icon stat-gold"><Icon name="chart" size={21} /></span><div><small>Bài đã hoàn thành</small><strong>5/5</strong><p>Exercises completed</p></div></article>
        </section>

        <section className="results-section">
          <div className="results-section-heading"><div><span>KẾT QUẢ THEO BÀI · RESULTS BY EXERCISE</span><h2>Điểm chi tiết<small>Detailed scores</small></h2></div><p>Chọn một bài để quay lại xem nội dung và lời giải.<small>Select an exercise to review its content and explanations.</small></p></div>
          <div className="section-score-list">
            {exercises.map((exercise, index) => {
              const sectionPercent = Math.round((sectionScores[index] / exercise.count) * 100)
              return (
                <button type="button" className="section-score-row" key={exercise.title} onClick={() => onReviewExercise(index)}>
                  <span className="section-score-index">{index + 1}</span>
                  <span className="section-score-info"><strong>{exercise.title}</strong><small>{exercise.englishTitle}</small><span className="mini-progress"><i style={{ width: `${sectionPercent}%` }} /></span></span>
                  <span className="section-score-value"><strong>{sectionScores[index]}/{exercise.count}</strong><small>{sectionPercent}%</small></span>
                  <Icon name="arrow" size={17} />
                </button>
              )
            })}
          </div>
        </section>

        <section className="results-section review-section">
          <div className="results-section-heading review-heading"><div><span>XEM LẠI CÂU TRẢ LỜI · ANSWER REVIEW</span><h2>Chi tiết từng câu<small>Question details</small></h2></div><div className="review-filters"><button className={reviewFilter === 'all' ? 'active' : ''} type="button" onClick={() => setReviewFilter('all')}><span>Tất cả ({totalQuestions})</span><small>All</small></button><button className={reviewFilter === 'wrong' ? 'active' : ''} type="button" onClick={() => setReviewFilter('wrong')}><span>Cần xem lại ({wrongCount})</span><small>Needs review</small></button></div></div>
          {visibleItems.length > 0 ? (
            <div className="review-details-list">
              {visibleItems.map((item) => (
                <details className={`review-detail ${item.correct ? 'is-correct' : 'is-wrong'}`} key={`${item.sectionIndex}-${item.questionNumber}`}>
                  <summary>
                    <span className="review-result-icon">{item.correct ? <Icon name="check" size={15} /> : '×'}</span>
                    <span><small>{exercises[item.sectionIndex].short} · Câu {item.questionNumber} / Question {item.questionNumber}</small><strong>{item.prompt}</strong></span>
                    <span className="review-result-label">{item.correct ? 'Đúng · Correct' : 'Xem lại · Review'}</span>
                  </summary>
                  <div className="review-detail-body">
                    <div className="answer-comparison"><p><small>Câu trả lời của bạn · Your answer</small><strong className={item.correct ? 'answer-good' : 'answer-bad'}>{item.userAnswer}</strong></p>{!item.correct && <p><small>Đáp án đúng · Correct answer</small><strong className="answer-good">{item.correctAnswer}</strong></p>}</div>
                    <p className="review-explanation"><strong>Giải thích · Explanation:</strong> {item.explanation}<small>{item.explanationEn}</small></p>
                  </div>
                </details>
              ))}
            </div>
          ) : <div className="perfect-review"><Icon name="trophy" size={27} /><strong>Không có câu nào cần xem lại!</strong><span>No questions need review. You answered the entire lesson correctly.</span></div>}
        </section>

        <div className="results-actions">
          <button className="button-secondary" type="button" onClick={onRestart}><Icon name="reset" size={18} /><span className="button-label"><span>Làm lại toàn bộ</span><small>Restart lesson</small></span></button>
          {wrongCount > 0 && <button className="button-primary" type="button" onClick={onReviewMistakes}><span className="button-label"><span>Xem bài có câu sai</span><small>Review incorrect answers</small></span><Icon name="arrow" size={18} /></button>}
        </div>
      </main>
      <footer className="site-footer"><div><span>Học tiếng Việt mỗi ngày, từng bước một. · Learn Vietnamese every day, one step at a time.</span></div><span>© 2026 Luyện tiếng Việt</span></footer>
    </div>
  )
}

function App() {
  const [savedProgress] = useState(readSavedProgress)
  const [current, setCurrent] = useState(() => Number.isInteger(savedProgress.current) && savedProgress.current >= 0 && savedProgress.current < exercises.length ? savedProgress.current : 0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [grammarAnswers, setGrammarAnswers] = useState(() => restoreArray(savedProgress.grammarAnswers, 3, null, (answer) => answer === null || (Number.isInteger(answer) && answer >= 0 && answer < 4)))
  const [fillAnswers, setFillAnswers] = useState(() => restoreArray(savedProgress.fillAnswers, 6, '', (answer) => typeof answer === 'string'))
  const [orders, setOrders] = useState(() => (
    Array.isArray(savedProgress.orders) && savedProgress.orders.length === orderQuestions.length && savedProgress.orders.every((order, index) => Array.isArray(order) && order.every((tokenIndex) => Number.isInteger(tokenIndex) && tokenIndex >= 0 && tokenIndex < orderQuestions[index].tokens.length))
      ? savedProgress.orders
      : orderQuestions.map(() => [])
  ))
  const [scenarioAnswers, setScenarioAnswers] = useState(() => restoreArray(savedProgress.scenarioAnswers, 3, null, (answer) => answer === null || (Number.isInteger(answer) && answer >= 0 && answer < 4)))
  const [matchAnswers, setMatchAnswers] = useState(() => restoreArray(savedProgress.matchAnswers, 5, '', (answer) => typeof answer === 'string' && (answer === '' || ['0', '1', '2', '3', '4'].includes(answer))))
  const [submitted, setSubmitted] = useState(() => restoreArray(savedProgress.submitted, 5, false, (value) => typeof value === 'boolean'))
  const [showResults, setShowResults] = useState(() => Boolean(typeof window !== 'undefined' && window.location.hash === '#/results' && restoreArray(savedProgress.submitted, 5, false, (value) => typeof value === 'boolean').every(Boolean)))
  const contentRef = useRef(null)

  useEffect(() => {
    const progressSnapshot = {
      current,
      grammarAnswers,
      fillAnswers,
      orders,
      scenarioAnswers,
      matchAnswers,
      submitted,
      showResults,
      savedAt: new Date().toISOString(),
    }

    try {
      window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressSnapshot))
    } catch {
      // The lesson remains usable even when storage is blocked or full.
    }
  }, [current, grammarAnswers, fillAnswers, orders, scenarioAnswers, matchAnswers, submitted, showResults])

  useEffect(() => {
    if (window.location.hash !== '#/lesson' && window.location.hash !== '#/results') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/lesson`)
    }

    const syncPageWithRoute = () => {
      const canShowResults = submitted.every(Boolean)
      setShowResults(window.location.hash === '#/results' && canShowResults)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('hashchange', syncPageWithRoute)
    syncPageWithRoute()
    return () => window.removeEventListener('hashchange', syncPageWithRoute)
  }, [submitted])

  const answeredBySection = [
    grammarAnswers.filter((answer) => answer !== null).length,
    fillAnswers.filter(Boolean).length,
    orders.filter((order, index) => order.length === orderQuestions[index].tokens.length).length,
    scenarioAnswers.filter((answer) => answer !== null).length,
    matchAnswers.filter(Boolean).length,
  ]
  const totalAnswered = answeredBySection.reduce((sum, count) => sum + count, 0)
  const totalQuestions = exercises.reduce((sum, exercise) => sum + exercise.count, 0)
  const progress = Math.round((totalAnswered / totalQuestions) * 100)
  const sectionScores = useMemo(() => [
    grammarAnswers.reduce((score, answer, index) => score + Number(answer === grammarQuestions[index].answer), 0),
    fillAnswers.reduce((score, answer, index) => score + Number(answer === fillItems[index].answer), 0),
    orders.reduce((score, order, index) => {
      const sentence = order.map((tokenIndex) => orderQuestions[index].tokens[tokenIndex])
      return score + Number(JSON.stringify(sentence) === JSON.stringify(orderQuestions[index].answer))
    }, 0),
    scenarioAnswers.reduce((score, answer, index) => score + Number(answer === scenarioQuestions[index].answer), 0),
    matchAnswers.reduce((score, answer, index) => score + Number(answer === String(index)), 0),
  ], [grammarAnswers, fillAnswers, orders, scenarioAnswers, matchAnswers])

  const allSubmitted = submitted.every(Boolean)
  const finalScore = sectionScores.reduce((sum, score) => sum + score, 0)
  const sectionReady = answeredBySection[current] === exercises[current].count

  const goToExercise = (index) => {
    setCurrent(index)
    setMenuOpen(false)
    window.requestAnimationFrame(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const submitCurrent = () => {
    if (!sectionReady) return
    setSubmitted((previous) => previous.map((value, index) => index === current ? true : value))
    const completesLesson = submitted.every((value, index) => index === current ? true : value)
    if (completesLesson) {
      window.location.hash = '/results'
      return
    }
    window.requestAnimationFrame(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const resetCurrent = () => {
    if (current === 0) setGrammarAnswers(Array(3).fill(null))
    if (current === 1) setFillAnswers(Array(6).fill(''))
    if (current === 2) setOrders(orderQuestions.map(() => []))
    if (current === 3) setScenarioAnswers(Array(3).fill(null))
    if (current === 4) setMatchAnswers(Array(5).fill(''))
    setSubmitted((previous) => previous.map((value, index) => index === current ? false : value))
  }

  const chooseOrderToken = (questionIndex, tokenIndex) => {
    if (submitted[2]) return
    setOrders((previous) => previous.map((order, index) => index === questionIndex ? [...order, tokenIndex] : order))
  }

  const removeOrderToken = (questionIndex, orderIndex) => {
    if (submitted[2]) return
    setOrders((previous) => previous.map((order, index) => index === questionIndex ? order.filter((_, itemIndex) => itemIndex !== orderIndex) : order))
  }

  const renderExerciseOne = () => (
    <div className="question-stack">
      {grammarQuestions.map((question, index) => (
        <article className="question-card" key={question.prompt}>
          <div className="question-topline"><span className="question-number">Câu {index + 1}</span><span className="structure-chip">{question.structure}</span></div>
          <h3>{question.prompt}</h3>
          <OptionList questionIndex={index} options={question.options} value={grammarAnswers[index]} onChange={(value) => setGrammarAnswers((answers) => answers.map((answer, answerIndex) => answerIndex === index ? value : answer))} correctAnswer={question.answer} submitted={submitted[0]} group="grammar" />
          {submitted[0] && <Feedback correct={grammarAnswers[index] === question.answer} explanation={question.explanation} explanationEn={question.explanationEn} />}
        </article>
      ))}
    </div>
  )

  const renderInlineSelect = (index) => {
    const item = fillItems[index]
    const state = submitted[1] ? (fillAnswers[index] === item.answer ? 'select-correct' : 'select-wrong') : ''
    return (
      <span className="inline-field">
        <span className="blank-number">{index + 1}</span>
        <select aria-label={`Chỗ trống ${index + 1}`} value={fillAnswers[index]} className={state} disabled={submitted[1]} onChange={(event) => setFillAnswers((answers) => answers.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))}>
          <option value="">Chọn từ / Choose</option>
          {item.choices.map((choice) => <option key={choice} value={choice}>{choice}</option>)}
        </select>
      </span>
    )
  }

  const renderExerciseTwo = () => (
    <div className="question-stack">
      <article className="passage-card">
        <div className="passage-heading"><span className="passage-icon"><Icon name="book" size={22} /></span><div><span>Đoạn văn</span><strong>Một cuối tuần ở hội sách</strong></div></div>
        <p>
          Cuối tuần này bạn {renderInlineSelect(0)} dự định đi đâu {renderInlineSelect(1)}?
          {' '}{renderInlineSelect(2)} ở trung tâm văn hóa thành phố đang có hội sách mùa thu rất lớn.
          Mình đã đến đó sáng qua mà hôm nay {renderInlineSelect(3)} muốn quay lại tìm thêm vài cuốn truyện.
          Hiện tại ban tổ chức {renderInlineSelect(4)} tặng vé xem kịch miễn phí cho sinh viên đấy.
          Mặc dù trời hơi nắng nhưng mọi người {renderInlineSelect(5)} xếp hàng tham quan rất đông!
        </p>
      </article>
      {submitted[1] && (
        <div className="answer-review">
          <h3>Giải thích từng chỗ trống</h3>
          {fillItems.map((item, index) => (
            <div className="review-row" key={`${item.answer}-${index}`}>
              <span className={fillAnswers[index] === item.answer ? 'review-status correct-status' : 'review-status wrong-status'}>{fillAnswers[index] === item.answer ? <Icon name="check" size={15} /> : '×'}</span>
              <p>
                <strong>({index + 1}) {item.answer} <small>({item.choicesEn[item.choices.indexOf(item.answer)]})</small>:</strong> {item.explanation}
                <span className="explanation-en">{item.explanationEn}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderExerciseThree = () => (
    <div className="question-stack">
      {orderQuestions.map((question, questionIndex) => {
        const orderedWords = orders[questionIndex].map((tokenIndex) => question.tokens[tokenIndex])
        const isComplete = orders[questionIndex].length === question.tokens.length
        const isCorrect = JSON.stringify(orderedWords) === JSON.stringify(question.answer)
        return (
          <article className="question-card ordering-card" key={question.answer.join(' ')}>
            <div className="question-topline"><span className="question-number">Câu {questionIndex + 1}</span><span className="order-hint">Chọn từng thẻ theo thứ tự đúng</span></div>
            <div className={`sentence-dropzone ${isComplete ? 'complete' : ''} ${submitted[2] ? (isCorrect ? 'dropzone-correct' : 'dropzone-wrong') : ''}`}>
              {orders[questionIndex].length === 0 && <span className="dropzone-placeholder">Câu trả lời sẽ xuất hiện ở đây...</span>}
              {orders[questionIndex].map((tokenIndex, orderIndex) => <button type="button" key={`${tokenIndex}-${orderIndex}`} onClick={() => removeOrderToken(questionIndex, orderIndex)} disabled={submitted[2]}>{question.tokens[tokenIndex]}</button>)}
            </div>
            <div className="token-bank" aria-label="Các thẻ từ chưa chọn">
              {question.tokens.map((token, tokenIndex) => !orders[questionIndex].includes(tokenIndex) && <button type="button" key={`${token}-${tokenIndex}`} onClick={() => chooseOrderToken(questionIndex, tokenIndex)} disabled={submitted[2]}>{token}</button>)}
            </div>
            {!submitted[2] && orders[questionIndex].length > 0 && <button className="clear-line" type="button" onClick={() => setOrders((previous) => previous.map((order, index) => index === questionIndex ? [] : order))}><span>Xóa câu này</span><small>Clear sentence</small></button>}
            {submitted[2] && <Feedback correct={isCorrect} explanation={`${isCorrect ? '' : `Câu đúng: ${question.answer.join(' ')} `}${question.explanation}`} explanationEn={question.explanationEn} />}
          </article>
        )
      })}
    </div>
  )

  const renderExerciseFour = () => (
    <div className="question-stack">
      {scenarioQuestions.map((question, index) => (
        <article className="question-card scenario-card" key={question.quote}>
          <div className="question-topline"><span className="question-number">Tình huống {index + 1}</span></div>
          <p className="context-text">{question.context}</p>
          <blockquote>“{question.quote}”</blockquote>
          <OptionList questionIndex={index} options={question.options} value={scenarioAnswers[index]} onChange={(value) => setScenarioAnswers((answers) => answers.map((answer, answerIndex) => answerIndex === index ? value : answer))} correctAnswer={question.answer} submitted={submitted[3]} group="scenario" />
          {submitted[3] && <Feedback correct={scenarioAnswers[index] === question.answer} explanation={question.explanation} explanationEn={question.explanationEn} />}
        </article>
      ))}
    </div>
  )

  const renderExerciseFive = () => (
    <div className="question-stack">
      <div className="matching-instruction"><span><Icon name="spark" size={20} /></span>Mỗi vế câu bên phải chỉ được dùng một lần.</div>
      <div className="matching-list">
        {matchLeft.map((left, index) => {
          const isCorrect = matchAnswers[index] === String(index)
          const usedAnswers = matchAnswers.filter((answer, answerIndex) => answerIndex !== index && answer)
          return (
            <article className={`matching-row ${submitted[4] ? (isCorrect ? 'matching-correct' : 'matching-wrong') : ''}`} key={left}>
              <span className="match-index">{index + 1}</span>
              <div className="match-content">
                <p>{left}</p>
                <select aria-label={`Vế kết thúc cho câu ${index + 1}`} value={matchAnswers[index]} disabled={submitted[4]} onChange={(event) => setMatchAnswers((answers) => answers.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))}>
                  <option value="">Chọn vế phù hợp / Choose a match...</option>
                  {matchRight.map((right, rightIndex) => <option key={right} value={String(rightIndex)} disabled={usedAnswers.includes(String(rightIndex))}>{right}</option>)}
                </select>
                {submitted[4] && (
                  <div className="match-explanation">
                    {!isCorrect && <small><strong>Đáp án / Answer:</strong> {matchRight[index]} — {matchRightEn[index]}</small>}
                    <p>{matchExplanations[index]}</p>
                    <p className="explanation-en">{matchExplanationsEn[index]}</p>
                  </div>
                )}
              </div>
              {submitted[4] && <span className={`match-result ${isCorrect ? 'correct-status' : 'wrong-status'}`}>{isCorrect ? <Icon name="check" size={16} /> : '×'}</span>}
            </article>
          )
        })}
      </div>
    </div>
  )

  const exerciseRenderers = [renderExerciseOne, renderExerciseTwo, renderExerciseThree, renderExerciseFour, renderExerciseFive]
  const currentExercise = exercises[current]
  const remaining = currentExercise.count - answeredBySection[current]

  const reviewItems = useMemo(() => [
    ...grammarQuestions.map((question, index) => ({ sectionIndex: 0, questionNumber: index + 1, prompt: question.prompt, userAnswer: grammarAnswers[index] === null ? 'Chưa trả lời · Not answered' : question.options[grammarAnswers[index]], correctAnswer: question.options[question.answer], correct: grammarAnswers[index] === question.answer, explanation: question.explanation, explanationEn: question.explanationEn })),
    ...fillItems.map((item, index) => ({ sectionIndex: 1, questionNumber: index + 1, prompt: `Chỗ trống số ${index + 1} trong đoạn “Một cuối tuần ở hội sách”`, userAnswer: fillAnswers[index] || 'Chưa trả lời · Not answered', correctAnswer: item.answer, correct: fillAnswers[index] === item.answer, explanation: item.explanation, explanationEn: item.explanationEn })),
    ...orderQuestions.map((question, index) => {
      const userSentence = orders[index].map((tokenIndex) => question.tokens[tokenIndex]).join(' ')
      const correctSentence = question.answer.join(' ')
      return { sectionIndex: 2, questionNumber: index + 1, prompt: 'Sắp xếp các từ thành câu hoàn chỉnh · Put the words in the correct order', userAnswer: userSentence || 'Chưa trả lời · Not answered', correctAnswer: correctSentence, correct: userSentence === correctSentence, explanation: question.explanation, explanationEn: question.explanationEn }
    }),
    ...scenarioQuestions.map((question, index) => ({ sectionIndex: 3, questionNumber: index + 1, prompt: question.quote, userAnswer: scenarioAnswers[index] === null ? 'Chưa trả lời · Not answered' : question.options[scenarioAnswers[index]], correctAnswer: question.options[question.answer], correct: scenarioAnswers[index] === question.answer, explanation: question.explanation, explanationEn: question.explanationEn })),
    ...matchLeft.map((left, index) => ({ sectionIndex: 4, questionNumber: index + 1, prompt: left, userAnswer: matchAnswers[index] ? `${left} ${matchRight[Number(matchAnswers[index])]}` : 'Chưa trả lời · Not answered', correctAnswer: `${left} ${matchRight[index]}`, correct: matchAnswers[index] === String(index), explanation: matchExplanations[index], explanationEn: matchExplanationsEn[index] })),
  ], [grammarAnswers, fillAnswers, orders, scenarioAnswers, matchAnswers])

  const openExerciseFromResults = (index) => {
    setCurrent(index)
    window.location.hash = '/lesson'
  }

  const openFirstMistake = () => {
    const firstMistake = reviewItems.find((item) => !item.correct)
    openExerciseFromResults(firstMistake?.sectionIndex ?? 0)
  }

  const restartLesson = () => {
    setCurrent(0)
    setGrammarAnswers(Array(3).fill(null))
    setFillAnswers(Array(6).fill(''))
    setOrders(orderQuestions.map(() => []))
    setScenarioAnswers(Array(3).fill(null))
    setMatchAnswers(Array(5).fill(''))
    setSubmitted(Array(5).fill(false))
    window.location.hash = '/lesson'
    try {
      window.localStorage.removeItem(PROGRESS_STORAGE_KEY)
    } catch {
      // State is still cleared for the current session when storage is unavailable.
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (showResults) {
    return <ResultsPage exercises={exercises} sectionScores={sectionScores} totalQuestions={totalQuestions} reviewItems={reviewItems} onReviewExercise={openExerciseFromResults} onReviewMistakes={openFirstMistake} onRestart={restartLesson} />
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="Trang chủ Luyện tiếng Việt"><div><strong>Luyện tiếng Việt</strong><span>Cùng hiểu · Cùng dùng</span></div></a>
          <div className="header-progress" aria-label={`Tiến độ ${progress}%`}><div className="progress-label"><span>Tiến độ bài học</span><strong>{totalAnswered}/{totalQuestions}</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
          <button className="mobile-menu-button" type="button" aria-label="Mở danh sách bài tập" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        </div>
      </header>

      <main id="top" className="page-layout">
        <aside className={`lesson-sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-intro"><span className="lesson-tag">BÀI HỌC 05</span><h1>Cấu trúc trong chủ đề giải trí</h1><p>Luyện cách dùng “đã...chưa?”, “nghe nói”, “vẫn”, “còn” và “vẫn còn”.</p></div>
          <nav className="exercise-nav" aria-label="Danh sách bài tập">
            {exercises.map((exercise, index) => (
              <button type="button" key={exercise.title} className={`${current === index ? 'active' : ''} ${submitted[index] ? 'done' : ''}`} onClick={() => goToExercise(index)}>
                <span className="nav-step">{submitted[index] ? <Icon name="check" size={16} /> : index + 1}</span>
                <span><small>{exercise.short}</small><strong>{exercise.title}</strong><em>{exercise.englishTitle}</em></span>
                <span className="nav-count">{answeredBySection[index]}/{exercise.count}</span>
              </button>
            ))}
          </nav>
          <div className="grammar-note"><span><Icon name="spark" size={18} /></span><p><strong>Mẹo nhỏ</strong>Đọc cả câu thành tiếng sau khi hoàn thành để ghi nhớ cấu trúc tự nhiên hơn.</p></div>
        </aside>

        <section className="lesson-content" ref={contentRef}>
          {allSubmitted && <div className="final-banner"><div className="final-icon"><Icon name="spark" size={26} /></div><div><span>Đã hoàn thành toàn bộ bài học</span><strong>{finalScore}/{totalQuestions} câu chính xác</strong></div><div className="final-score">{Math.round((finalScore / totalQuestions) * 100)}%</div></div>}
          <div className="content-heading">
            <div><span className="content-kicker">{currentExercise.short} · {currentExercise.count} câu</span><h2>{currentExercise.title}</h2><p>{currentExercise.description}</p></div>
            {submitted[current] && <div className="score-pill"><span>Kết quả</span><strong>{sectionScores[current]}/{currentExercise.count}</strong></div>}
          </div>
          {exerciseRenderers[current]()}
          <div className="lesson-actions">
            <button className="button-secondary" type="button" onClick={() => goToExercise(Math.max(0, current - 1))} disabled={current === 0}><Icon name="back" size={18} /><span className="button-label"><span>Bài trước</span><small>Previous</small></span></button>
            <div className="submit-area">
              {!submitted[current] ? <>{remaining > 0 && <span>Còn {remaining} câu chưa hoàn thành</span>}<button className="button-primary" type="button" disabled={!sectionReady} onClick={submitCurrent}><span className="button-label"><span>{current === exercises.length - 1 ? 'Hoàn thành & xem kết quả' : 'Kiểm tra đáp án'}</span><small>{current === exercises.length - 1 ? 'Finish & view results' : 'Check answers'}</small></span><Icon name="check" size={18} /></button></> : <><button className="button-ghost" type="button" onClick={resetCurrent}><Icon name="reset" size={17} /><span className="button-label"><span>Làm lại</span><small>Try again</small></span></button>{current < exercises.length - 1 ? <button className="button-primary" type="button" onClick={() => goToExercise(current + 1)}><span className="button-label"><span>Sang bài tiếp theo</span><small>Next exercise</small></span><Icon name="arrow" size={18} /></button> : <button className="button-primary" type="button" onClick={() => { window.location.hash = '/results' }}><span className="button-label"><span>Xem tổng kết</span><small>View results</small></span><Icon name="arrow" size={18} /></button>}</>}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div><span>Học tiếng Việt mỗi ngày, từng bước một.</span></div><span>© 2026 Luyện tiếng Việt</span></footer>
    </div>
  )
}

export default App
