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
  fatherTag?: string
  bredStatus?: 'ملقحة' | 'غير ملقحة'
  lastEstrusDate?: string
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

export interface BreedingSeason {
  currentStart: string // ISO
  currentEnd: string // ISO
  nextStart: string // ISO
  nextEnd: string // ISO
  cycleDays: number
  notes: string[]
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
  { id: 'a1', tag: 'E-501', gender: 'أنثى', birthDate: '2024-03-10', pen: 'main', status: 'سليم', purpose: 'قطيع', weightKg: 62, bredStatus: 'غير ملقحة', lastEstrusDate: '2026-01-05' },
  { id: 'a2', tag: 'E-780', gender: 'أنثى', birthDate: '2024-07-20', pen: 'main', status: 'سليم', expectedDueDate: '2026-02-05', purpose: 'قطيع', weightKg: 58, bredStatus: 'ملقحة', fatherTag: 'F-991', lastEstrusDate: '2025-12-01' },
  { id: 'a3', tag: 'E-889', gender: 'أنثى', birthDate: '2025-08-01', pen: 'latePregnancy', status: 'سليم', expectedDueDate: '2026-01-28', purpose: 'قطيع', weightKg: 55, bredStatus: 'ملقحة', fatherTag: 'F-991', lastEstrusDate: '2025-12-10' },
  { id: 'a4', tag: 'N-125', gender: 'أنثى', birthDate: '2025-11-30', pen: 'nursing', status: 'سليم', motherTag: 'E-889', purpose: 'مواليد', weightKg: 18, fatherTag: 'F-991', bredStatus: 'غير ملقحة' },
  { id: 'a5', tag: 'M-332', gender: 'ذكر', birthDate: '2025-10-15', pen: 'nursing', status: 'سليم', motherTag: 'E-780', purpose: 'لحم', weightKg: 21, fatherTag: 'F-991', bredStatus: 'غير ملقحة' },
  { id: 'a6', tag: 'S-210', gender: 'ذكر', birthDate: '2025-06-20', pen: 'weaning', status: 'سليم', purpose: 'لحم', weightKg: 34, bredStatus: 'غير ملقحة' },
  { id: 'a7', tag: 'R-014', gender: 'ذكر', birthDate: '2024-05-12', pen: 'fattening', status: 'سليم', purpose: 'لحم', weightKg: 64, bredStatus: 'غير ملقحة' },
  { id: 'a8', tag: 'F-991', gender: 'ذكر', birthDate: '2024-04-22', pen: 'studs', status: 'سليم', purpose: 'فحل', weightKg: 72, bredStatus: 'غير ملقحة' },
  { id: 'a9', tag: 'Q-220', gender: 'أنثى', birthDate: '2024-09-02', pen: 'main', status: 'مريض', purpose: 'قطيع', weightKg: 49, bredStatus: 'غير ملقحة', lastEstrusDate: '2025-12-28' },
  { id: 'a10', tag: 'I-004', gender: 'أنثى', birthDate: '2025-06-12', pen: 'main', status: 'سليم', purpose: 'قطيع', weightKg: 36, bredStatus: 'غير ملقحة', lastEstrusDate: '2026-01-02' },
  { id: 'a11', tag: 'H-201', gender: 'أنثى', birthDate: '2024-11-05', pen: 'main', status: 'سليم', purpose: 'قطيع', weightKg: 52, bredStatus: 'غير ملقحة', lastEstrusDate: '2026-01-12' },
  { id: 'a12', tag: 'H-202', gender: 'أنثى', birthDate: '2024-12-01', pen: 'main', status: 'سليم', purpose: 'قطيع', weightKg: 48, bredStatus: 'غير ملقحة', lastEstrusDate: '2026-01-14' },
  { id: 'a13', tag: 'H-203', gender: 'أنثى', birthDate: '2024-10-25', pen: 'latePregnancy', status: 'سليم', expectedDueDate: '2026-03-01', purpose: 'قطيع', weightKg: 56, bredStatus: 'ملقحة', fatherTag: 'F-991', lastEstrusDate: '2025-12-20' },
  { id: 'a14', tag: 'H-204', gender: 'أنثى', birthDate: '2024-09-12', pen: 'birthing', status: 'سليم', expectedDueDate: '2026-01-24', purpose: 'قطيع', weightKg: 57, bredStatus: 'ملقحة', fatherTag: 'F-991', lastEstrusDate: '2025-12-05' },
  { id: 'a15', tag: 'H-205', gender: 'أنثى', birthDate: '2025-12-05', pen: 'nursing', status: 'سليم', motherTag: 'H-204', purpose: 'مواليد', weightKg: 16, fatherTag: 'F-991', bredStatus: 'غير ملقحة' },
  { id: 'a16', tag: 'H-206', gender: 'ذكر', birthDate: '2025-09-18', pen: 'weaning', status: 'سليم', purpose: 'لحم', weightKg: 29, motherTag: 'H-201', bredStatus: 'غير ملقحة' },
  { id: 'a17', tag: 'H-207', gender: 'أنثى', birthDate: '2024-08-15', pen: 'main', status: 'سليم', purpose: 'قطيع', weightKg: 60, bredStatus: 'غير ملقحة', lastEstrusDate: '2026-01-09' },
  { id: 'a18', tag: 'H-208', gender: 'أنثى', birthDate: '2024-10-10', pen: 'main', status: 'سليم', purpose: 'قطيع', weightKg: 58, bredStatus: 'غير ملقحة', lastEstrusDate: '2026-01-11' },
  { id: 'a19', tag: 'H-209', gender: 'أنثى', birthDate: '2024-07-07', pen: 'isolation', status: 'مريض', purpose: 'قطيع', weightKg: 47, bredStatus: 'غير ملقحة', lastEstrusDate: '2025-12-22' },
  { id: 'a20', tag: 'H-210', gender: 'ذكر', birthDate: '2024-06-02', pen: 'fattening', status: 'سليم', purpose: 'لحم', weightKg: 66, bredStatus: 'غير ملقحة' },
  { id: 'a21', tag: 'H-211', gender: 'ذكر', birthDate: '2024-06-20', pen: 'fattening', status: 'سليم', purpose: 'لحم', weightKg: 63, bredStatus: 'غير ملقحة' },
  { id: 'a22', tag: 'H-212', gender: 'ذكر', birthDate: '2024-03-30', pen: 'studs', status: 'سليم', purpose: 'فحل', weightKg: 70, bredStatus: 'غير ملقحة' },
  { id: 'a23', tag: 'H-213', gender: 'أنثى', birthDate: '2025-10-02', pen: 'weaning', status: 'سليم', motherTag: 'H-201', purpose: 'مواليد', weightKg: 20, bredStatus: 'غير ملقحة', lastEstrusDate: '2026-01-08' },
  { id: 'a24', tag: 'H-214', gender: 'أنثى', birthDate: '2025-11-10', pen: 'nursing', status: 'سليم', motherTag: 'H-203', purpose: 'مواليد', weightKg: 17, bredStatus: 'غير ملقحة' },
  { id: 'a25', tag: 'H-215', gender: 'أنثى', birthDate: '2024-09-25', pen: 'main', status: 'سليم', purpose: 'قطيع', weightKg: 53, bredStatus: 'غير ملقحة', lastEstrusDate: '2026-01-06' },
  { id: 'a26', tag: 'H-216', gender: 'أنثى', birthDate: '2024-05-25', pen: 'main', status: 'سليم', purpose: 'قطيع', weightKg: 61, bredStatus: 'غير ملقحة', lastEstrusDate: '2025-12-30' },
  { id: 'a27', tag: 'H-217', gender: 'أنثى', birthDate: '2024-11-12', pen: 'latePregnancy', status: 'سليم', expectedDueDate: '2026-02-20', purpose: 'قطيع', weightKg: 54, bredStatus: 'ملقحة', fatherTag: 'F-991', lastEstrusDate: '2025-12-18' },
  { id: 'a28', tag: 'H-218', gender: 'ذكر', birthDate: '2025-08-28', pen: 'weaning', status: 'سليم', motherTag: 'H-208', purpose: 'لحم', weightKg: 31, bredStatus: 'غير ملقحة' },
  { id: 'a29', tag: 'H-219', gender: 'أنثى', birthDate: '2024-11-22', pen: 'main', status: 'سليم', purpose: 'قطيع', weightKg: 50, bredStatus: 'غير ملقحة', lastEstrusDate: '2026-01-13' },
  { id: 'a30', tag: 'H-220', gender: 'ذكر', birthDate: '2024-04-18', pen: 'fattening', status: 'سليم', purpose: 'لحم', weightKg: 68, bredStatus: 'غير ملقحة' },
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

export const breedingSeason: BreedingSeason = {
  currentStart: '2025-08-15',
  currentEnd: '2026-02-15',
  nextStart: '2026-08-10',
  nextEnd: '2027-02-10',
  cycleDays: 17, // متوسط دورة الشبق للنجدي
  notes: [
    'تركز الرصد كل 12 ساعة أثناء الموسم',
    'تسجيل كل شبق/تزاوج لإدارة القطيع الرئيسي',
    'جاهزية الفحول (تغذية، حوافر، لقاحات) قبل بداية الموسم',
  ],
}

