// src/components/index.js - Central Component Export Hub

// Base Components
export { default as Text } from './common/Text';
export { HeaderText, SubHeaderText, BodyText, CaptionText, CurrencyText, DebtText, CardNumberText } from './common/Text';

export { default as Button } from './common/Button';
export { PrimaryButton, SecondaryButton, SuccessButton, DangerButton, LinkButton, PayNowButton, AnalyzeDebtButton, SMSPermissionButton } from './common/Button';

export { default as Card } from './common/Card';
export { CreditCard, DebtSummaryCard, InfoCard } from './common/Card';

export { default as Screen } from './common/Screen';
export { ScrollScreen, CenteredScreen, GradientScreen, DebtScreen, AuthScreen } from './common/Screen';

export { default as Header } from './common/Header';
export { default as Input } from './common/Input';
export { default as LoadingSpinner } from './common/LoadingSpinner';

// Form Components (to be created)
// export { default as FormField } from './forms/FormField';
// export { default as FormSection } from './forms/FormSection';

// Chart Components (to be created)
// export { default as DebtChart } from './charts/DebtChart';
// export { default as UtilizationChart } from './charts/UtilizationChart';

// Card Components (to be created)
// export { default as TransactionCard } from './cards/TransactionCard';
// export { default as PaymentCard } from './cards/PaymentCard';
// export { default as AlertCard } from './cards/AlertCard';