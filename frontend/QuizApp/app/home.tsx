import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useMemo, useRef } from 'react';

// Importaciones desde src
import { Quiz, Card, AnswerType, QuizConfig, QuizResult } from '../src/types';
import { createHomeStyles } from '../src/styles/homeStyles';
import { NewQuizModal, NewCardModal, CardDetailModal, EditCardModal } from '../src/components/Modals';
import { ProfileWithHistoryModal } from '../src/components/ProfileModal';
import { QuizList, CardList, FAB } from '../src/components/QuizComponents';
import { QuizConfigModal, QuizRunner, QuizResultModal } from '../src/components/QuizRunner';
import { ShareModal, JoinQuizModal } from '../src/components/ShareComponents';
import { useTheme } from '../src/context/ThemeContext';
import {
  getAllQuizzes,
  getQuiz,
  createQuiz as createQuizAPI,
  deleteQuiz as deleteQuizAPI,
  addQuestionToQuiz,
  deleteQuestion,
  updateQuestion,
  logout,
  loadTokenFromStorage,
  getCurrentUser,
  saveQuizResult,
  QuizAPI,
  QuizListAPI,
  UserAPI,
} from '../src/services/api';

export default function Home() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();

  // Crear estilos basados en el tema actual
  const styles = useMemo(() => createHomeStyles(colors), [colors]);

  // Quiz state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Modal states
  const [showNewQuizModal, setShowNewQuizModal] = useState(false);
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [showCardDetailModal, setShowCardDetailModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Profile state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAPI | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Quiz play state
  const [showQuizConfigModal, setShowQuizConfigModal] = useState(false);
  const [showQuizRunner, setShowQuizRunner] = useState(false);
  const [showQuizResultModal, setShowQuizResultModal] = useState(false);
  const [quizToPlay, setQuizToPlay] = useState<Quiz | null>(null);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [quizToShare, setQuizToShare] = useState<Quiz | null>(null);
  const [isExternalQuiz, setIsExternalQuiz] = useState(false);
  const [externalOwnerName, setExternalOwnerName] = useState<string | null>(null);

  // Form states
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswerType, setNewCardAnswerType] = useState<AnswerType>('options');
  const [newCardTextAnswer, setNewCardTextAnswer] = useState('');
  const [newCardOptions, setNewCardOptions] = useState(['', '', '', '']);
  const [newCardCorrectOption, setNewCardCorrectOption] = useState(0);

  // Edit form states
  const [editCardQuestion, setEditCardQuestion] = useState('');
  const [editCardAnswerType, setEditCardAnswerType] = useState<AnswerType>('options');
  const [editCardTextAnswer, setEditCardTextAnswer] = useState('');
  const [editCardOptions, setEditCardOptions] = useState(['', '', '', '']);
  const [editCardCorrectOption, setEditCardCorrectOption] = useState(0);

  // Verificar autenticación y cargar quizzes al iniciar
  useEffect(() => {
    const initAuth = async () => {
      // Cargar token desde storage (async para móvil)
      const token = await loadTokenFromStorage();
      setTokenChecked(true);

      if (!token) {
        router.replace('/login');
        return;
      }
      loadQuizzes();
    };

    initAuth();
  }, []);

  // Convertir de API a formato local (lista)
  const apiListToQuiz = (q: QuizListAPI): Quiz => ({
    id: q.id.toString(),
    title: q.title,
    cards: [], // Se cargarán al seleccionar el quiz
    cardCount: q.question_count, // Usar el conteo del servidor
  });

  // Convertir de API a formato local (detalle completo)
  const apiToQuiz = (q: QuizAPI): Quiz => ({
    id: q.id.toString(),
    title: q.title,
    cards: q.questions.map(question => ({
      id: question.id?.toString() || '',
      question: question.question_text,
      answerType: (question.answer_type === 'text' ? 'text' : 'options') as AnswerType,
      options: question.choices.map(c => c.choice_text),
      correctOption: question.choices.findIndex(c => c.is_correct),
      textAnswer: question.answer_type === 'text' ? (question.choices[0]?.choice_text || '') : undefined,
    })),
  });

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const quizzesList = await getAllQuizzes();
      setQuizzes(quizzesList.map(apiListToQuiz));
    } catch (err) {
      console.error(err);
      // Si la sesión expiró, redirigir al login
      if (err instanceof Error && err.message.includes('Sesión expirada')) {
        logout();
        router.replace('/login');
        return;
      }
      // Solo mostrar error si es un problema de conexión real
      if (err instanceof Error && err.message.includes('No se puede conectar')) {
        setError(err.message);
      }
      // Si es otro error, establecer lista vacía sin mostrar error
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizDetail = async (quizId: string) => {
    try {
      setLoading(true);
      setError(null);
      const quizDetail = await getQuiz(parseInt(quizId));
      const quiz = apiToQuiz(quizDetail);
      setSelectedQuiz(quiz);
      // Actualizar también en la lista
      setQuizzes(quizzes.map(q => q.id === quizId ? quiz : q));
    } catch (err) {
      setError('Error al cargar el quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar perfil del usuario
  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      setCurrentUser(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handlers
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
    loadUserProfile();
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    loadQuizDetail(quiz.id);
  };

  const resetCardForm = () => {
    setNewCardQuestion('');
    setNewCardTextAnswer('');
    setNewCardOptions(['', '', '', '']);
    setNewCardCorrectOption(0);
  };

  const createQuiz = async () => {
    if (!newQuizTitle.trim()) return;

    try {
      setLoading(true);
      const created = await createQuizAPI(newQuizTitle);
      setQuizzes([...quizzes, apiToQuiz(created)]);
      setNewQuizTitle('');
      setShowNewQuizModal(false);
    } catch (err) {
      setError('Error al crear el quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addCardToQuiz = async () => {
    if (!selectedQuiz || !newCardQuestion.trim()) return;

    try {
      setLoading(true);

      // Preparar las choices según el tipo de respuesta
      const choices = newCardAnswerType === 'options'
        ? newCardOptions
          .filter(opt => opt.trim() !== '')
          .map((opt, index) => ({
            choice_text: opt,
            is_correct: index === newCardCorrectOption,
          }))
        : [{
          choice_text: newCardTextAnswer,
          is_correct: true,
        }];

      // Agregar la pregunta al quiz
      const newQuestion = await addQuestionToQuiz(parseInt(selectedQuiz.id), {
        question_text: newCardQuestion,
        answer_type: newCardAnswerType,
        choices,
      });

      // Crear la card local
      const newCard: Card = {
        id: newQuestion.id?.toString() || '',
        question: newQuestion.question_text,
        answerType: newCardAnswerType,
        options: newQuestion.choices.map(c => c.choice_text),
        correctOption: newQuestion.choices.findIndex(c => c.is_correct),
        textAnswer: newCardAnswerType === 'text' ? newCardTextAnswer : undefined,
      };

      const updatedQuiz = {
        ...selectedQuiz,
        cards: [...selectedQuiz.cards, newCard],
      };

      setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? updatedQuiz : q));
      setSelectedQuiz(updatedQuiz);

      resetCardForm();
      setShowNewCardModal(false);
    } catch (err) {
      setError('Error al agregar la pregunta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      await deleteQuizAPI(parseInt(quizId));
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz(null);
      }
    } catch (err) {
      setError('Error al eliminar el quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!selectedQuiz) return;

    try {
      setLoading(true);
      await deleteQuestion(parseInt(cardId));

      const updatedQuiz = {
        ...selectedQuiz,
        cards: selectedQuiz.cards.filter(c => c.id !== cardId),
      };

      setSelectedQuiz(updatedQuiz);
      setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? updatedQuiz : q));
    } catch (err) {
      setError('Error al eliminar la pregunta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCard = (card: Card) => {
    setSelectedCard(card);
    setShowCardDetailModal(true);
  };

  const handleCloseCardDetail = () => {
    setShowCardDetailModal(false);
    setSelectedCard(null);
  };

  const handleEditCard = () => {
    if (!selectedCard) return;

    // Cargar datos de la card en el formulario de edición
    setEditCardQuestion(selectedCard.question);
    setEditCardAnswerType(selectedCard.answerType);
    setEditCardTextAnswer(selectedCard.textAnswer || '');

    // Asegurar que siempre hay 4 opciones
    const options = selectedCard.options || [];
    const paddedOptions = [...options];
    while (paddedOptions.length < 4) {
      paddedOptions.push('');
    }
    setEditCardOptions(paddedOptions);
    setEditCardCorrectOption(selectedCard.correctOption ?? 0);

    // Cerrar modal de detalle y abrir modal de edición
    setShowCardDetailModal(false);
    setShowEditCardModal(true);
  };

  const handleSaveEditCard = async () => {
    if (!selectedQuiz || !selectedCard || !editCardQuestion.trim()) return;

    try {
      setLoading(true);

      // Preparar las choices según el tipo de respuesta
      const choices = editCardAnswerType === 'options'
        ? editCardOptions
          .filter(opt => opt.trim() !== '')
          .map((opt, index) => ({
            choice_text: opt,
            is_correct: index === editCardCorrectOption,
          }))
        : [{
          choice_text: editCardTextAnswer,
          is_correct: true,
        }];

      // Actualizar la pregunta en el backend
      const updatedQuestion = await updateQuestion(parseInt(selectedCard.id), {
        question_text: editCardQuestion,
        answer_type: editCardAnswerType,
        choices,
      });

      // Actualizar la card local
      const updatedCard: Card = {
        id: updatedQuestion.id?.toString() || selectedCard.id,
        question: updatedQuestion.question_text,
        answerType: editCardAnswerType,
        options: updatedQuestion.choices.map(c => c.choice_text),
        correctOption: updatedQuestion.choices.findIndex(c => c.is_correct),
        textAnswer: editCardAnswerType === 'text' ? editCardTextAnswer : undefined,
      };

      const updatedQuiz = {
        ...selectedQuiz,
        cards: selectedQuiz.cards.map(c => c.id === selectedCard.id ? updatedCard : c),
      };

      setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? updatedQuiz : q));
      setSelectedQuiz(updatedQuiz);
      setSelectedCard(null);
      setShowEditCardModal(false);
    } catch (err) {
      setError('Error al actualizar la pregunta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditCard = () => {
    setShowEditCardModal(false);
    setSelectedCard(null);
  };

  const handleEditOptionChange = (index: number, text: string) => {
    const newOptions = [...editCardOptions];
    newOptions[index] = text;
    setEditCardOptions(newOptions);
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...newCardOptions];
    newOptions[index] = text;
    setNewCardOptions(newOptions);
  };

  // Handlers para jugar quiz
  const handlePlayQuiz = async (quiz: Quiz) => {
    // Reset estado de quiz externo
    setIsExternalQuiz(false);
    setExternalOwnerName(null);

    // Cargar el quiz completo si no tiene cards cargadas
    if (quiz.cards.length === 0 && (quiz.cardCount ?? 0) > 0) {
      try {
        setLoading(true);
        const quizDetail = await getQuiz(parseInt(quiz.id));
        const fullQuiz = apiToQuiz(quizDetail);
        setQuizToPlay(fullQuiz);
        setShowQuizConfigModal(true);
      } catch (err) {
        setError('Error al cargar el quiz');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setQuizToPlay(quiz);
      setShowQuizConfigModal(true);
    }
  };

  const handleStartQuiz = (config: QuizConfig) => {
    setQuizConfig(config);
    setShowQuizConfigModal(false);
    setShowQuizRunner(true);
  };

  const handleQuizFinish = async (result: QuizResult) => {
    if (quizToPlay) {
      result.quizId = quizToPlay.id;

      // Guardar en historial
      try {
        await saveQuizResult({
          quiz_id: isExternalQuiz ? null : parseInt(quizToPlay.id),
          quiz_title: quizToPlay.title,
          score: result.score,
          correct_answers: result.correctAnswers,
          total_questions: result.totalQuestions,
          time_spent: result.totalTime,
          is_external: isExternalQuiz,
          owner_name: externalOwnerName,
        });
      } catch (err) {
        console.error('Error al guardar historial:', err);
      }
    }
    setQuizResult(result);
    setShowQuizRunner(false);
    setShowQuizResultModal(true);
  };

  const handleQuizCancel = () => {
    setShowQuizRunner(false);
    setQuizToPlay(null);
    setQuizConfig(null);
  };

  const handleQuizRetry = () => {
    setShowQuizResultModal(false);
    setQuizResult(null);
    setShowQuizConfigModal(true);
  };

  const handleQuizResultClose = () => {
    setShowQuizResultModal(false);
    setQuizResult(null);
    setQuizToPlay(null);
    setQuizConfig(null);
    setIsExternalQuiz(false);
    setExternalOwnerName(null);
  };

  // Share handlers
  const handleShareQuiz = (quiz: Quiz) => {
    setQuizToShare(quiz);
    setShowShareModal(true);
  };

  const handleJoinQuizSuccess = (quizApi: QuizAPI, ownerName?: string) => {
    // Convertir el quiz compartido a formato local y lanzar el runner
    const quiz = apiToQuiz(quizApi);
    setQuizToPlay(quiz);
    setIsExternalQuiz(true);
    setExternalOwnerName(ownerName || null);
    setShowJoinModal(false);
    setShowQuizConfigModal(true);
  };

  // Pantalla de carga
  if (loading && quizzes.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textPrimary, marginTop: 16 }}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  // Dashboard view (list of quizzes)
  if (!selectedQuiz) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mis Quizzes</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.themeToggle, { backgroundColor: colors.successLight }]}
              onPress={() => setShowJoinModal(true)}
            >
              <Ionicons name="game-controller" size={20} color={colors.success} />
            </Pressable>
            <Pressable style={styles.themeToggle} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={colors.textPrimary} />
            </Pressable>
            <Pressable style={styles.profileButton} onPress={handleOpenProfile}>
              <Ionicons name="person" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Error message */}
        {error && (
          <View style={{ padding: 16, backgroundColor: colors.dangerLight }}>
            <Text style={{ color: colors.danger, textAlign: 'center' }}>{error}</Text>
          </View>
        )}

        {/* Quiz List */}
        <QuizList
          quizzes={quizzes}
          onSelectQuiz={handleSelectQuiz}
          onDeleteQuiz={handleDeleteQuiz}
          onPlayQuiz={handlePlayQuiz}
          onShareQuiz={handleShareQuiz}
          colors={colors}
        />

        {/* FAB */}
        <FAB onPress={() => setShowNewQuizModal(true)} />

        {/* New Quiz Modal */}
        <NewQuizModal
          visible={showNewQuizModal}
          title={newQuizTitle}
          onTitleChange={setNewQuizTitle}
          onCancel={() => {
            setShowNewQuizModal(false);
            setNewQuizTitle('');
          }}
          onCreate={createQuiz}
        />

        {/* User Profile Modal */}
        <ProfileWithHistoryModal
          visible={showProfileModal}
          user={currentUser}
          loading={loadingProfile}
          onClose={() => setShowProfileModal(false)}
          onLogout={async () => {
            setShowProfileModal(false);
            await handleLogout();
          }}
        />

        {/* Quiz Config Modal */}
        <QuizConfigModal
          visible={showQuizConfigModal}
          quizTitle={quizToPlay?.title || ''}
          cardCount={quizToPlay?.cards.length || 0}
          onStart={handleStartQuiz}
          onCancel={() => {
            setShowQuizConfigModal(false);
            setQuizToPlay(null);
          }}
        />

        {/* Quiz Runner */}
        <QuizRunner
          visible={showQuizRunner}
          quizTitle={quizToPlay?.title || ''}
          cards={quizToPlay?.cards || []}
          config={quizConfig || { timeLimit: null, shuffleQuestions: false, shuffleOptions: false }}
          onFinish={handleQuizFinish}
          onCancel={handleQuizCancel}
        />

        {/* Quiz Result Modal */}
        <QuizResultModal
          visible={showQuizResultModal}
          result={quizResult}
          onClose={handleQuizResultClose}
          onRetry={handleQuizRetry}
        />

        {/* Share Modal */}
        <ShareModal
          visible={showShareModal}
          quizId={quizToShare ? parseInt(quizToShare.id) : 0}
          quizTitle={quizToShare?.title || ''}
          onClose={() => {
            setShowShareModal(false);
            setQuizToShare(null);
          }}
        />

        {/* Join Quiz Modal */}
        <JoinQuizModal
          visible={showJoinModal}
          onJoinSuccess={handleJoinQuizSuccess}
          onClose={() => setShowJoinModal(false)}
        />
      </SafeAreaView>
    );
  }

  // Quiz detail view (list of cards)
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => setSelectedQuiz(null)} style={styles.themeToggle}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.titleSmall}>{selectedQuiz.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Error message */}
      {error && (
        <View style={{ padding: 16, backgroundColor: colors.dangerLight }}>
          <Text style={{ color: colors.danger, textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      {/* Loading overlay */}
      {loading && (
        <View style={{ padding: 8, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {/* Card List */}
      <CardList
        cards={selectedQuiz.cards}
        onSelectCard={handleSelectCard}
        onDeleteCard={deleteCard}
        colors={colors}
      />

      {/* FAB */}
      <FAB onPress={() => setShowNewCardModal(true)} />

      {/* New Card Modal */}
      <NewCardModal
        visible={showNewCardModal}
        question={newCardQuestion}
        onQuestionChange={setNewCardQuestion}
        answerType={newCardAnswerType}
        onAnswerTypeChange={setNewCardAnswerType}
        textAnswer={newCardTextAnswer}
        onTextAnswerChange={setNewCardTextAnswer}
        options={newCardOptions}
        onOptionChange={handleOptionChange}
        correctOption={newCardCorrectOption}
        onCorrectOptionChange={setNewCardCorrectOption}
        onCancel={() => {
          setShowNewCardModal(false);
          resetCardForm();
        }}
        onAdd={addCardToQuiz}
      />

      {/* Card Detail Modal */}
      <CardDetailModal
        visible={showCardDetailModal}
        card={selectedCard}
        onClose={handleCloseCardDetail}
        onEdit={handleEditCard}
      />

      {/* Edit Card Modal */}
      <EditCardModal
        visible={showEditCardModal}
        question={editCardQuestion}
        onQuestionChange={setEditCardQuestion}
        answerType={editCardAnswerType}
        onAnswerTypeChange={setEditCardAnswerType}
        textAnswer={editCardTextAnswer}
        onTextAnswerChange={setEditCardTextAnswer}
        options={editCardOptions}
        onOptionChange={handleEditOptionChange}
        correctOption={editCardCorrectOption}
        onCorrectOptionChange={setEditCardCorrectOption}
        onCancel={handleCancelEditCard}
        onSave={handleSaveEditCard}
      />
    </SafeAreaView>
  );
}
