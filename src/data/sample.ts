export type PenId =
  | 'main'
  | 'latePregnancy'
  | 'birthing'
  | 'nursing'
  | 'weaning'
  | 'fattening'
  | 'studs'
  | 'isolation'

export interface Pen {
  id: PenId
  name: string
  capacity: number
  note?: string
}

export interface Animal {
  id: string
  tag: string
  gender: 'ذكر' | 'أنثى'
  birthDate: string // ISO
  pen: PenId
  status: 'سليم' | 'مريض'
  purpose: 'قطيع' | 'لحم' | 'فحل' | 'مواليد'
  weightKg?: number
  expectedDueDate?: string
  motherTag?: string
}

export interface Vaccination {
  id: string
  animalId: string
  label: string
  dueDate: string
  status: 'قريب' | 'متأخر' | 'تم'
}

export interface CleaningTask {
  id: string
  penId: PenId
  dueDate: string
  status: 'اليوم' | 'متأخر' | 'قريب'
}

export interface FeedPlan {
  id: string
  penId: PenId
  ration: string
  notes?: string
}

export const pens: Pen[] = [
  { id: 'main', name: 'حظيرة القطيع الرئيسي', capacity: 50, note: 'يشمل 50 رأس + معالف وماء' },
  { id: 'latePregnancy', name: 'حظيرة الحمل المتأخر', capacity: 15 },
  { id: 'birthing', name: 'بوكسات ولادة', capacity: 6, note: 'أم + مواليد' },
  { id: 'nursing', name: 'حظيرة نفاس/رضاعة', capacity: 12 },
  { id: 'weaning', name: 'حظيرة فطام', capacity: 20 },
  { id: 'fattening', name: 'حظيرة تسمين/بيع الذكور', capacity: 25 },
  { id: 'studs', name: 'حظيرة فحول مستقلة', capacity: 10 },
  { id: 'isolation', name: 'حظيرة عزل/مرض', capacity: 6 },
]

export const animals: Animal[] = [
  {
    id: 'a1',
    tag: 'E-501',
    gender: 'أنثى',
    birthDate: '2024-03-10',
    pen: 'main',
    status: 'سليم',
    purpose: 'قطيع',
    weightKg: 62,
  },
  {
    id: 'a2',
    tag: 'E-780',
    gender: 'أنثى',
    birthDate: '2024-07-20',
    pen: 'main',
    status: 'سليم',
    expectedDueDate: '2026-02-05',
    purpose: 'قطيع',
    weightKg: 58,
  },
  {
    id: 'a3',
    tag: 'E-889',
    gender: 'أنثى',
    birthDate: '2025-08-01',
    pen: 'latePregnancy',
    status: 'سليم',
    expectedDueDate: '2026-01-28',
    purpose: 'قطيع',
    weightKg: 55,
  },
  {
    id: 'a4',
    tag: 'N-125',
    gender: 'أنثى',
    birthDate: '2025-11-30',
    pen: 'nursing',
    status: 'سليم',
    motherTag: 'E-889',
    purpose: 'مواليد',
    weightKg: 18,
  },
  {
    id: 'a5',
    tag: 'M-332',
    gender: 'ذكر',
    birthDate: '2025-10-15',
    pen: 'nursing',
    status: 'سليم',
    motherTag: 'E-780',
    purpose: 'لحم',
    weightKg: 21,
  },
  {
    id: 'a6',
    tag: 'S-210',
    gender: 'ذكر',
    birthDate: '2025-06-20',
    pen: 'weaning',
    status: 'سليم',
    purpose: 'لحم',
    weightKg: 34,
  },
  {
    id: 'a7',
    tag: 'R-014',
    gender: 'ذكر',
    birthDate: '2024-05-12',
    pen: 'fattening',
    status: 'سليم',
    purpose: 'لحم',
    weightKg: 64,
  },
  {
    id: 'a8',
    tag: 'F-991',
    gender: 'ذكر',
    birthDate: '2024-04-22',
    pen: 'studs',
    status: 'سليم',
    purpose: 'فحل',
    weightKg: 72,
  },
  {
    id: 'a9',
    tag: 'Q-220',
    gender: 'أنثى',
    birthDate: '2024-09-02',
    pen: 'main',
    status: 'مريض',
    purpose: 'قطيع',
    weightKg: 49,
  },
  {
    id: 'a10',
    tag: 'I-004',
    gender: 'أنثى',
    birthDate: '2025-06-12',
    pen: 'main',
    status: 'سليم',
    purpose: 'قطيع',
    weightKg: 36,
  },
]

export const vaccinations: Vaccination[] = [
  { id: 'v1', animalId: 'a1', label: 'طاعون المجترات الصغيرة', dueDate: '2026-01-30', status: 'قريب' },
  { id: 'v2', animalId: 'a5', label: 'جدري الأغنام', dueDate: '2026-01-25', status: 'قريب' },
  { id: 'v3', animalId: 'a9', label: 'طعوم وقائية قبل الدمج', dueDate: '2026-01-23', status: 'متأخر' },
]

export const cleaningTasks: CleaningTask[] = [
  { id: 'c1', penId: 'latePregnancy', dueDate: '2026-01-23', status: 'اليوم' },
  { id: 'c2', penId: 'nursing', dueDate: '2026-01-24', status: 'قريب' },
  { id: 'c3', penId: 'isolation', dueDate: '2026-01-22', status: 'متأخر' },
]

export const feedPlans: FeedPlan[] = [
  { id: 'f1', penId: 'main', ration: 'برسيم + شعير متزن', notes: 'وجبتان' },
  { id: 'f2', penId: 'latePregnancy', ration: 'مركزات عالية الطاقة + معادن', notes: 'وجبتان + ماء دائم' },
  { id: 'f3', penId: 'weaning', ration: 'بادي فطام + علف خشن', notes: '3 وجبات خفيفة' },
  { id: 'f4', penId: 'fattening', ration: 'مركز طاقة عالي + مياه عذبة', notes: '3 وجبات' },
]

