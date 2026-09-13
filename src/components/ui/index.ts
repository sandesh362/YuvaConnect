// ============================================================
// YuvaConnect Design System — Component Barrel
// ------------------------------------------------------------
//   import { GigCard, StatGrid, PrimaryButton, ScreenHeader } from '@/components/ui';
//
// Every screen rebuild in Phase 7 imports from here. If a pattern
// is needed on two screens, it gets promoted into this folder
// rather than being re-styled locally.
// ============================================================

// --- Primitives ---
export { Icon, IconButton, iconName, type IconProps, type IconButtonProps } from './Icon';
export { Text, type TextProps } from './Text';
export { Card, PressableCard, Divider, type CardProps, type PressableCardProps } from './Card';

// --- Layout / chrome ---
export {
  Screen,
  ScrollScreen,
  BottomActionBar,
  SectionHeader,
  type ScreenProps,
  type ScrollScreenProps,
} from './Screen';
export {
  ScreenHeader,
  DashboardHeader,
  InlineBackBar,
  type ScreenHeaderProps,
  type HeaderAction,
} from './ScreenHeader';
export {
  BottomTabBar,
  STUDENT_TABS,
  BUSINESS_TABS,
  type BottomTabBarProps,
  type TabItem,
} from './BottomTabBar';

// --- Actions ---
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  SoftButton,
  GhostButton,
  DangerButton,
  TextLink,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from './Button';

// --- Wizard & files ---
export { StepProgress, type StepProgressProps } from './StepProgress';
export { Slider, type SliderProps } from './Slider';
export { FileRow, type FileRowProps } from './FileRow';

// --- Disclosure & selection ---
export { Accordion, type AccordionProps, type AccordionItem } from './Accordion';
export { SelectTile, type SelectTileProps } from './SelectTile';

// --- Onboarding ---
export { RoleSelectCard, type RoleSelectCardProps } from './RoleSelectCard';

// --- Identity & trust ---
export { Avatar, BusinessIcon, type AvatarProps, type AvatarSize } from './Avatar';
export {
  StatusBadge,
  VerifiedBadge,
  SkillPill,
  SkillPillRow,
  type StatusBadgeProps,
  type SkillPillProps,
  type BadgeTone,
} from './Badge';

// --- Data display ---
export { GigCard, GigCardFlags, MetaItem, type GigCardData, type GigCardProps } from './GigCard';
export { StatBox, StatGrid, type StatBoxProps, type StatGridProps } from './StatBox';
export {
  ListItem,
  SwitchRow,
  ListGroup,
  CandidateCard,
  type ListItemProps,
  type CandidateCardData,
  type CandidateCardProps,
} from './ListItem';
export { RatingStars, RatingInput } from './RatingStars';
export {
  ProgressBar,
  MilestoneStepper,
  ChecklistItem,
  type Milestone,
  type MilestoneStatus,
  type ProgressTone,
} from './Progress';

// --- Banners ---
export { Banner, InfoBanner, type BannerProps } from './Banner';

// --- Inputs ---
export { SearchBar, type SearchBarProps } from './SearchBar';
export { TextField, SelectField, type TextFieldProps } from './TextField';
export { SelectableChip, ChipRail, ChipGroup, type SelectableChipProps } from './SelectableChip';
export { SegmentedControl, type SegmentedControlProps, type Segment } from './SegmentedControl';

// --- System states ---
export {
  EmptyState,
  ErrorState,
  SuccessState,
  Skeleton,
  GigCardSkeleton,
  LoadingSkeleton,
  InlineLoader,
  type EmptyStateProps,
  type ErrorStateProps,
  type SuccessStateProps,
} from './States';
