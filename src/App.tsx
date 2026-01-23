import './index.css'
import './App.css'
import { read, utils } from 'xlsx'
import { useMemo, useState } from 'react'
import { animals as sampleAnimals, breedingSeason, pens as samplePens, type Animal, type Pen, type PenId } from './data/sample'

const dayMs = 1000 * 60 * 60 * 24

const asDate = (value: string) => new Date(value + 'T00:00:00')
const ageInDays = (date: string) => Math.floor((Date.now() - asDate(date).getTime()) / dayMs)
const daysUntil = (date: string) => Math.floor((asDate(date).getTime() - Date.now()) / dayMs)
const formatDate = (date: string) =>
  asDate(date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
const addDays = (date: string, delta: number) => {
  const d = asDate(date)
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}
const nextEstrusDate = (lastEstrus: string | undefined, cycleDays: number) => {
  if (!lastEstrus) return null
  return addDays(lastEstrus, cycleDays)
}
const occupancyTone = (percent: number) => {
  if (percent >= 90) return 'danger'
  if (percent >= 75) return 'warn'
  return 'ok'
}
const labelForPen = (penId: PenId, pensList: Pen[]) => pensList.find((p) => p.id === penId)?.name ?? penId

const normalizePens = (list: any[]): Pen[] =>
  list
    .map((p) => ({
      id: String(p.id || '').trim() as PenId,
      name: String(p.name || '').trim() || 'حظيرة',
      capacity: Number(p.capacity || 0) || 0,
      note: p.note ? String(p.note) : undefined,
    }))
    .filter((p) => p.id)

const normalizeAnimals = (list: any[]): Animal[] =>
  list
    .map((a) => ({
      id: String(a.id || '').trim(),
      tag: String(a.tag || '').trim(),
      gender: (a.gender === 'ذكر' || a.gender === 'أنثى' ? a.gender : 'أنثى') as Animal['gender'],
      birthDate: String(a.birthDate || '').trim(),
      pen: String(a.pen || '').trim() as PenId,
      status: (a.status === 'مريض' ? 'مريض' : 'سليم') as Animal['status'],
      purpose: ((): Animal['purpose'] => {
        if (a.purpose === 'لحم' || a.purpose === 'فحل' || a.purpose === 'مواليد') return a.purpose
        return 'قطيع'
      })(),
      weightKg: a.weightKg ? Number(a.weightKg) : undefined,
      expectedDueDate: a.expectedDueDate ? String(a.expectedDueDate) : undefined,
      motherTag: a.motherTag ? String(a.motherTag) : undefined,
      fatherTag: a.fatherTag ? String(a.fatherTag) : undefined,
      bredStatus: (a.bredStatus === 'ملقحة' ? 'ملقحة' : 'غير ملقحة') as Animal['bredStatus'],
      lastEstrusDate: a.lastEstrusDate ? String(a.lastEstrusDate) : undefined,
    }))
    .filter((a) => a.id && a.tag && a.birthDate && a.pen)

const PenCard = ({ pen, herd }: { pen: Pen; herd: Animal[] }) => {
  const occupancy = Math.round((herd.length / pen.capacity) * 100)
  const tone = occupancyTone(occupancy)
  return (
    <div className="pen-card">
      <div className="top">
        <div>
          <h4>{pen.name}</h4>
          <div className="pen-meta">
            <span>{herd.length} رأس</span>
            <span>سعة {pen.capacity}</span>
          </div>
        </div>
        <span className={`badge ${tone === 'danger' ? 'error' : tone === 'warn' ? 'warn' : 'success'}`}>
          {occupancy}%
        </span>
      </div>
      <div className="capacity-bar">
        <div
          className={`capacity-fill ${tone !== 'ok' ? tone : ''}`}
          style={{ width: `${Math.min(occupancy, 100)}%` }}
        />
      </div>
      {pen.note ? <div className="meta" style={{ marginTop: 8, color: '#9fb1d0', fontSize: 12 }}>{pen.note}</div> : null}
    </div>
  )
}

function App() {
  const [herd, setHerd] = useState<Animal[]>(sampleAnimals)
  const [penList, setPenList] = useState<Pen[]>(samplePens)
  const [excelStatus, setExcelStatus] = useState<string>('البيانات المعروضة من العينة الافتراضية')

  const penStats = useMemo(
    () =>
      penList.map((pen) => ({
        pen,
        herd: herd.filter((a) => a.pen === pen.id),
      })),
    [herd, penList],
  )

  const animalRows = useMemo(
    () =>
      herd.map((a) => {
        const age = ageInDays(a.birthDate)
        const estrusDate =
          a.bredStatus === 'غير ملقحة' ? nextEstrusDate(a.lastEstrusDate, breedingSeason.cycleDays) : null
        const estrusDays = estrusDate ? daysUntil(estrusDate) : null
        return {
          ...a,
          age,
          nextEstrus: estrusDate,
          nextEstrusDays: estrusDays,
        }
      }),
    [herd],
  )

  const handleExcel = async (file: File) => {
    try {
      setExcelStatus('جارٍ قراءة الملف ...')
      const buffer = await file.arrayBuffer()
      const workbook = read(buffer)
      const getSheet = (...names: string[]) => {
        for (const name of names) {
          const sheet = workbook.Sheets[name]
          if (sheet) return sheet
        }
        return undefined
      }

      const pensSheet = getSheet('pens', 'PENS', 'حظائر')
      const animalsSheet = getSheet('animals', 'ANIMALS', 'قطيع')

      const nextPens = pensSheet ? normalizePens(utils.sheet_to_json(pensSheet)) : penList
      const nextAnimals = animalsSheet ? normalizeAnimals(utils.sheet_to_json(animalsSheet)) : herd

      if (!pensSheet && !animalsSheet) {
        setExcelStatus('لم يتم العثور على Sheets باسم pens أو animals')
        return
      }

      setPenList(nextPens.length ? nextPens : penList)
      setHerd(nextAnimals.length ? nextAnimals : herd)
      setExcelStatus('تم التحديث من ملف Excel')
    } catch (err) {
      setExcelStatus('فشل قراءة الملف - تأكد من التنسيق')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="title">
          <h1>إدارة حظائر الأغنام</h1>
          <div className="subtitle">خريطة الحظائر + خانة بيانات القطيع</div>
        </div>
      </header>

      <div className="panel">
        <div className="panel-head">
          <h3>تحميل من Excel</h3>
          <span className="hint">ملف يحوي Sheets باسم pens و animals</span>
        </div>
        <div className="input-row">
          <label htmlFor="excel-upload">اختر ملف Excel</label>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls"
            className="input"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleExcel(file)
            }}
          />
        </div>
        <div className="hint-row">
          <span className="meta">{excelStatus}</span>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="panel-head">
          <h3>خريطة الحظائر</h3>
          <span className="hint">صفّين مع ممر خدمة 2م + بوابات داخلية لتسهيل النقل</span>
        </div>
        <div className="pens-grid">
          {penStats.map(({ pen, herd }) => (
            <PenCard pen={pen} herd={herd} key={pen.id} />
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="panel-head">
          <h3>بيانات القطيع (الخانة المخصصة)</h3>
          <span className="hint">رموز، أعمار، حظائر، أغراض، حالات صحية</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الرمز</th>
                <th>الجنس</th>
                <th>العمر (يوم)</th>
                <th>الحظيرة</th>
                <th>الغرض</th>
                <th>الحالة</th>
                <th>ملقحة؟</th>
                <th>شبق متوقع</th>
                <th>الوزن</th>
                <th>الأم</th>
                <th>الأب</th>
                <th>ولادة متوقعة</th>
              </tr>
            </thead>
            <tbody>
              {animalRows.map((a) => (
                <tr key={a.id}>
                  <td>{a.tag}</td>
                  <td>{a.gender}</td>
                  <td>{a.age}</td>
                  <td>{labelForPen(a.pen, penList)}</td>
                  <td>{a.purpose}</td>
                  <td>
                    <span className={`badge ${a.status === 'سليم' ? 'success' : 'warn'}`}>{a.status}</span>
                  </td>
                  <td>
                    <span className={`badge ${a.bredStatus === 'ملقحة' ? 'success' : 'warn'}`}>
                      {a.bredStatus ?? 'غير ملقحة'}
                    </span>
                  </td>
                  <td>
                    {a.nextEstrus ? (
                      <span className={`badge ${a.nextEstrusDays !== null && a.nextEstrusDays <= 3 ? 'error' : 'warn'}`}>
                        {formatDate(a.nextEstrus)} {a.nextEstrusDays !== null ? `(${a.nextEstrusDays} يوم)` : ''}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{a.weightKg ? `${a.weightKg} كجم` : '-'}</td>
                  <td>{a.motherTag ?? '-'}</td>
                  <td>{a.fatherTag ?? '-'}</td>
                  <td>{a.expectedDueDate ? formatDate(a.expectedDueDate) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App
