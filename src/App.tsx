import './index.css'
import './App.css'
import {
  animals,
  cleaningTasks,
  feedPlans,
  pens,
  vaccinations,
  type Animal,
  type Pen,
  type PenId,
} from './data/sample'

type AlertStatus = 'overdue' | 'today' | 'soon' | 'later'

interface MovementAlert {
  id: string
  tag: string
  from: PenId
  to: PenId
  reason: string
  dueDate: string
  daysDiff: number
  statusKey: AlertStatus
}

const penOrder: PenId[] = [
  'latePregnancy',
  'birthing',
  'nursing',
  'weaning',
  'fattening',
  'studs',
  'main',
  'isolation',
]

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

const statusFromDays = (days: number): AlertStatus => {
  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  if (days <= 7) return 'soon'
  return 'later'
}

const statusLabel = (status: AlertStatus, days: number) => {
  if (status === 'overdue') return `متأخر بـ ${Math.abs(days)} يوم`
  if (status === 'today') return 'اليوم'
  if (status === 'soon') return `بعد ${days} يوم`
  return `بعد ${days} يوم`
}

const buildMovementAlerts = (list: Animal[]): MovementAlert[] => {
  const alerts: MovementAlert[] = []

  const pushAlert = (animal: Animal, to: PenId, dueDate: string, reason: string) => {
    const daysDiff = daysUntil(dueDate)
    alerts.push({
      id: `${animal.id}-${to}`,
      tag: animal.tag,
      from: animal.pen,
      to,
      reason,
      dueDate,
      daysDiff,
      statusKey: statusFromDays(daysDiff),
    })
  }

  list.forEach((animal) => {
    const age = ageInDays(animal.birthDate)

    if (animal.status === 'مريض' && animal.pen !== 'isolation') {
      pushAlert(animal, 'isolation', addDays(new Date().toISOString().slice(0, 10), 0), 'عزل صحي')
    }

    if (animal.expectedDueDate) {
      const daysToDue = daysUntil(animal.expectedDueDate)
      if (daysToDue <= 2 && animal.pen !== 'birthing') {
        pushAlert(animal, 'birthing', animal.expectedDueDate, 'قرب موعد الولادة')
      } else if (daysToDue <= 10 && animal.pen !== 'latePregnancy') {
        pushAlert(animal, 'latePregnancy', addDays(animal.expectedDueDate, -7), 'حمل متأخر')
      }
    }

    if (age >= 60 && age < 120 && animal.pen !== 'weaning') {
      pushAlert(animal, 'weaning', addDays(animal.birthDate, 70), 'عمر فطام (≈ 70 يوم)')
    }

    if (age >= 120 && animal.gender === 'ذكر' && animal.purpose === 'لحم' && animal.pen !== 'fattening') {
      pushAlert(animal, 'fattening', addDays(animal.birthDate, 130), 'تسمين/بيع الذكور')
    }

    if (age >= 270 && animal.gender === 'ذكر' && animal.purpose === 'فحل' && animal.pen !== 'studs') {
      pushAlert(animal, 'studs', addDays(animal.birthDate, 270), 'جاهز للفحول')
    }

    if (age >= 240 && animal.gender === 'أنثى' && animal.pen !== 'main') {
      pushAlert(animal, 'main', addDays(animal.birthDate, 240), 'انضمام للقطيع الرئيسي')
    }
  })

  return alerts.sort((a, b) => a.daysDiff - b.daysDiff)
}

const occupancyTone = (percent: number) => {
  if (percent >= 90) return 'danger'
  if (percent >= 75) return 'warn'
  return 'ok'
}

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

const StatCard = ({
  label,
  value,
  meta,
  tone = 'neutral',
}: {
  label: string
  value: string
  meta?: string
  tone?: 'neutral' | 'success' | 'warn' | 'error'
}) => (
  <div className="stat-card">
    <div className="label">{label}</div>
    <div className="value">{value}</div>
    {meta ? <div className="meta">{meta}</div> : null}
    <div className="hint-row" style={{ marginTop: 8 }}>
      <span className={`badge ${tone}`}>{tone === 'neutral' ? 'جاهز' : label}</span>
    </div>
  </div>
)

const AlertItem = ({ alert }: { alert: MovementAlert }) => {
  const tone = alert.statusKey === 'overdue' ? 'error' : alert.statusKey === 'today' ? 'success' : 'warn'
  return (
    <div className="alert-item">
      <div>
        <div className="tag">{alert.tag}</div>
        <div className="reason">{alert.reason}</div>
      </div>
      <div>
        <div className="reason">من: {labelForPen(alert.from)}</div>
        <div className="reason">إلى: {labelForPen(alert.to)}</div>
      </div>
      <div className="date">{formatDate(alert.dueDate)}</div>
      <div>
        <span className={`badge ${tone}`}>{statusLabel(alert.statusKey, alert.daysDiff)}</span>
      </div>
    </div>
  )
}

const labelForPen = (penId: PenId) => pens.find((p) => p.id === penId)?.name ?? penId

const AnimalPill = ({ animal }: { animal: Animal }) => {
  const age = ageInDays(animal.birthDate)
  return (
    <div className="pill">
      <div className="row">
        <span className="tag">{animal.tag}</span>
        <span className="chip">{animal.gender}</span>
      </div>
      <div className="row">
        <span className="meta">العمر: {age} يوم</span>
        <span className={animal.status === 'سليم' ? 'status-ok' : 'status-bad'}>{animal.status}</span>
      </div>
      <div className="row">
        <span className="meta">الغرض: {animal.purpose}</span>
        {animal.weightKg ? <span className="meta">{animal.weightKg} كجم</span> : null}
      </div>
      {animal.expectedDueDate ? (
        <div className="row meta">
          ولادة متوقعة: {formatDate(animal.expectedDueDate)} ({daysUntil(animal.expectedDueDate)} يوم)
        </div>
      ) : null}
    </div>
  )
}

const MovementColumn = ({ penId, herd }: { penId: PenId; herd: Animal[] }) => (
  <div className="column">
    <h5>
      {labelForPen(penId)}
      <span className="chip">{herd.length} رأس</span>
    </h5>
    <div className="list">
      {herd.map((animal) => (
        <AnimalPill animal={animal} key={animal.id} />
      ))}
      {herd.length === 0 ? <div className="meta">لا يوجد رؤوس حالياً</div> : null}
    </div>
  </div>
)

function App() {
  const movementAlerts = buildMovementAlerts(animals)
  const readyToday = movementAlerts.filter((a) => a.statusKey === 'today').length
  const overdueMoves = movementAlerts.filter((a) => a.statusKey === 'overdue').length
  const sickCount = animals.filter((a) => a.status === 'مريض').length

  const vaccWithDelta = vaccinations.map((v) => ({ ...v, days: daysUntil(v.dueDate) }))
  const upcomingVacc = vaccWithDelta.filter((v) => v.days >= 0 && v.days <= 7).length

  const penStats = pens.map((pen) => ({
    pen,
    herd: animals.filter((a) => a.pen === pen.id),
  }))

  const boardData = penOrder.map((id) => ({
    penId: id,
    herd: animals.filter((a) => a.pen === id),
  }))

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="title">
          <h1>إدارة حظائر الأغنام</h1>
          <div className="subtitle">نظام صفّين + ممر خدمة 2م مع تنبيهات عمرية تلقائية</div>
        </div>
        <div className="actions">
          <button className="btn secondary">تصدير PDF</button>
          <button className="btn">إضافة رأس جديد</button>
        </div>
      </header>

      <div className="grid stats-grid">
        <StatCard label="إجمالي القطيع" value={`${animals.length} رأس`} meta="محدث الآن" />
        <StatCard label="جاهز للنقل اليوم" value={`${readyToday}`} meta="تنبيهات فورية" tone="success" />
        <StatCard label="حركات متأخرة" value={`${overdueMoves}`} meta="الأولوية الأولى" tone="error" />
        <StatCard label="تطعيمات قريبة" value={`${upcomingVacc}`} meta="خلال 7 أيام" tone="warn" />
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
          <h3>تنبيهات النقل بحسب العمر</h3>
          <span className="hint">مسبقة + فورية + متأخرة</span>
        </div>
        <div className="list">
          {movementAlerts.length === 0 ? (
            <div className="meta">لا توجد تنبيهات حالياً</div>
          ) : (
            movementAlerts.map((alert) => <AlertItem alert={alert} key={alert.id} />)
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="panel-head">
          <h3>لوحة الحركة بين الحظائر</h3>
          <span className="hint">سحب وإفلات مستقبلاً — حالياً عرض حيّ للحظائر</span>
        </div>
        <div className="board">
          {boardData.map(({ penId, herd }) => (
            <MovementColumn penId={penId} herd={herd} key={penId} />
          ))}
        </div>
      </div>

      <div className="split-2" style={{ marginTop: 12 }}>
        <div className="panel">
          <div className="panel-head">
            <h3>التطعيمات القادمة</h3>
            <span className="hint">تنبيه بالعمر والحالة</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>الرمز</th>
                <th>اللقاح</th>
                <th>الموعد</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {vaccWithDelta.map((v) => (
                <tr key={v.id}>
                  <td>{animals.find((a) => a.id === v.animalId)?.tag ?? v.animalId}</td>
                  <td>{v.label}</td>
                  <td>{formatDate(v.dueDate)}</td>
                  <td>
                    <span
                      className={`badge ${v.days < 0 ? 'error' : v.days === 0 ? 'success' : 'warn'}`}
                    >
                      {v.days < 0 ? `متأخر بـ ${Math.abs(v.days)} يوم` : `بعد ${v.days} يوم`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>تنظيف/سماد + تغذية</h3>
            <span className="hint">تجميع المهام اليومية</span>
          </div>
          <div className="list">
            {cleaningTasks.map((task) => (
              <div className="pill" key={task.id}>
                <div className="row">
                  <span>{labelForPen(task.penId)}</span>
                  <span className="badge neutral">{task.status}</span>
                </div>
                <div className="meta">تنظيف/سماد: {formatDate(task.dueDate)}</div>
              </div>
            ))}
          </div>
          <div className="panel-head" style={{ marginTop: 14 }}>
            <h3>خطط التغذية</h3>
          </div>
          <div className="list">
            {feedPlans.map((plan) => (
              <div className="pill" key={plan.id}>
                <div className="row">
                  <span>{labelForPen(plan.penId)}</span>
                  <span className="chip">علف</span>
                </div>
                <div className="meta">{plan.ration}</div>
                {plan.notes ? <div className="meta">{plan.notes}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <div className="panel-head">
          <h3>ملخص صحة</h3>
          <span className="hint">رؤوس بحاجة متابعة فورية</span>
        </div>
        <div className="list">
          <div className="pill">
            <div className="row">
              <span>عدد الرؤوس المريضة</span>
              <span className="badge error">{sickCount}</span>
            </div>
            <div className="meta">تأكد من العزل والعلاج قبل النقل</div>
          </div>
          {animals
            .filter((a) => a.status === 'مريض')
            .map((a) => (
              <div className="pill" key={a.id}>
                <div className="row">
                  <span>{a.tag}</span>
                  <span className="badge warn">عزل/متابعة</span>
                </div>
                <div className="meta">الحظيرة الحالية: {labelForPen(a.pen)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default App
