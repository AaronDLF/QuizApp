import { StyleSheet, Dimensions } from 'react-native';
import { darkTheme, spacing, borderRadius, fontSize, fontWeight, wp, normalize } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ThemeColors = typeof darkTheme;

// Función para crear estilos dinámicos basados en el tema
export const createHomeStyles = (colors: ThemeColors) => StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  titleSmall: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  logoutText: {
    fontSize: fontSize.lg,
    color: colors.danger,
  },
  backButton: {
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  themeToggle: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeToggleText: {
    fontSize: fontSize.xl,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: normalize(100),
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    marginTop: normalize(60),
  },
  emptyIcon: {
    fontSize: normalize(60),
    marginBottom: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },

  // Quiz Card
  quizCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quizCardContent: {
    flex: 1,
  },
  quizCardTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  quizCardCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  // Delete Button
  deleteButton: {
    width: normalize(30),
    height: normalize(30),
    borderRadius: normalize(15),
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: normalize(30),
    right: spacing.xl,
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(30),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: fontSize.display,
    color: colors.textPrimary,
    fontWeight: '300',
    marginTop: -2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.modalBackground,
    borderRadius: spacing.xl,
    padding: spacing.xxl,
    width: wp(90),
    maxWidth: normalize(400),
  },
  modalContentLarge: {
    backgroundColor: colors.modalBackground,
    borderRadius: spacing.xl,
    padding: spacing.xxl,
    width: wp(90),
    maxWidth: normalize(400),
  },
  modalTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    justifyContent: 'space-between',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    minHeight: 52,
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    minHeight: 52,
  },
  modalButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Input
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md + 2,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  // Type Selector
  typeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: 10,
  },
  typeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  typeOptionText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },

  // Option Input
  optionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optionRadio: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    borderWidth: 2,
    borderColor: colors.borderStrong,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  optionInput: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Card Item
  cardItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardItemHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingRight: normalize(40),
    gap: spacing.md,
  },
  cardNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textDimmed,
  },
  cardTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  cardTypeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  cardQuestion: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    lineHeight: normalize(22),
  },
  cardDeleteButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: normalize(26),
    height: normalize(26),
    borderRadius: normalize(13),
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Detail View
  detailSection: {
    marginBottom: spacing.lg,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  detailText: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    lineHeight: normalize(24),
  },
  detailOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailOptionIndicator: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    borderWidth: 2,
    borderColor: colors.borderStrong,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailOptionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  detailOptionText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  detailOptionTextCorrect: {
    color: colors.success,
    fontWeight: fontWeight.semibold,
  },

  // Profile
  profileAvatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileAvatar: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(40),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  profileButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  profileButtonText: {
    fontSize: fontSize.xl,
  },

  // Header Actions
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});

// Estilos por defecto (para compatibilidad)
export const homeStyles = createHomeStyles(darkTheme);
