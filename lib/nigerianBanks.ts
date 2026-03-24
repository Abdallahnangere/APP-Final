export type NigerianBank = {
  code: string;
  name: string;
};

const UNSORTED_BANKS: NigerianBank[] = [
  { code: '044', name: 'Access Bank' },
  { code: '063', name: 'Access Bank (Diamond)' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '090267', name: 'Kuda Bank' },
  { code: '090405', name: 'Moniepoint' },
  { code: '100004', name: 'OPay' },
  { code: '100033', name: 'PalmPay' },
  { code: '526', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank For Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

export const NIGERIAN_BANKS = [...UNSORTED_BANKS].sort((a, b) => a.name.localeCompare(b.name));

export const MIN_TRANSFER_AMOUNT = 100;
export const MAX_TRANSFER_AMOUNT = 5000000;
export const DAILY_TRANSFER_LIMIT = 50000000;

export function calculateTransferFee(amount: number) {
  if (amount <= 5000) return 10.75;
  if (amount <= 50000) return 26.88;
  return 53.75;
}
