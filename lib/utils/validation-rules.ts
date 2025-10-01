export const validationRules = {
  payment: {
    min: 1,
    max: 100000000,
    recommendDepositAbove: 100000,
    requireLegalConsultationAbove: 1000000,
  },
  revisions: {
    min: 0,
    max: 10,
    recommended: { min: 2, max: 5 },
  },
  timeline: {
    minDays: 1,
    rushDaysThreshold: 7,
    recommendMilestoneAbove: 30,
  },
};

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}
