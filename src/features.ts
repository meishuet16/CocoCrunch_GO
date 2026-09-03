export type FamilyReportState = {
  status: 'ok' | 'changed';
  area: string;
  withGroup: boolean;
  returnTime: string;
  note: string;
};

export const familyReport: FamilyReportState = {
  status: 'changed',
  area: 'Tokyo · Shibuya area',
  withGroup: true,
  returnTime: '10:55 PM',
  note: 'Rain changed the evening plan. The group moved indoors and is still together.',
};

export const splitBill = {
  total: 6380,
  currency: 'JPY',
  members: [
    { name: 'Mei', amount: 2130 },
    { name: 'JH', amount: 2120 },
    { name: 'Zi Shan', amount: 2130 },
  ],
};

export const savedPlace = {
  name: 'Kichijoji kissaten',
  reason: 'Saved after capture · quiet, affordable, indoors',
};
