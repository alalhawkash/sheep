import './index.css'
import './App.css'
import { animals, breedingSeason, pens, type Animal, type Pen, type PenId } from './data/sample'

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
const labelForPen = (penId: PenId) => pens.find((p) => p.id === penId)?.name ?? penId

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
  const penStats = pens.map((pen) => ({
    pen,
    herd: animals.filter((a) => a.pen === pen.id),
  }))

  const animalRows = animals.map((a) => {
    const age = ageInDays(a.birthDate)
    const estrusDate = a.bredStatus === 'غير ملقحة' ? nextEstrusDate(a.lastEstrusDate, breedingSeason.cycleDays) : null
    const estrusDays = estrusDate ? daysUntil(estrusDate) : null
    return {
      ...a,
      age,
      nextEstrus: estrusDate,
      nextEstrusDays: estrusDays,
    }
  })

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="title">
          <h1>إدارة حظائر الأغنام</h1>
          <div className="subtitle">خريطة الحظائر + خانة بيانات القطيع</div>
        </div>
      </header>

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
                  <td>{labelForPen(a.pen)}</td>
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
