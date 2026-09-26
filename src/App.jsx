import { useMemo, useRef, useState } from 'react'

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

function App() {
  const [current, setCurrent] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [grammarAnswers, setGrammarAnswers] = useState(Array(3).fill(null))
  const [fillAnswers, setFillAnswers] = useState(Array(6).fill(''))
  const [orders, setOrders] = useState(orderQuestions.map(() => []))
  const [scenarioAnswers, setScenarioAnswers] = useState(Array(3).fill(null))
  const [matchAnswers, setMatchAnswers] = useState(Array(5).fill(''))
  const [submitted, setSubmitted] = useState(Array(5).fill(false))
  const contentRef = useRef(null)

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
              {!submitted[current] ? <>{remaining > 0 && <span>Còn {remaining} câu chưa hoàn thành</span>}<button className="button-primary" type="button" disabled={!sectionReady} onClick={submitCurrent}><span className="button-label"><span>Kiểm tra đáp án</span><small>Check answers</small></span><Icon name="check" size={18} /></button></> : <><button className="button-ghost" type="button" onClick={resetCurrent}><Icon name="reset" size={17} /><span className="button-label"><span>Làm lại</span><small>Try again</small></span></button>{current < exercises.length - 1 && <button className="button-primary" type="button" onClick={() => goToExercise(current + 1)}><span className="button-label"><span>Sang bài tiếp theo</span><small>Next exercise</small></span><Icon name="arrow" size={18} /></button>}</>}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div><span>Học tiếng Việt mỗi ngày, từng bước một.</span></div><span>© 2026 Luyện tiếng Việt</span></footer>
    </div>
  )
}

export default App
