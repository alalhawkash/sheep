import './index.css'
import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { animals as sampleAnimals, breedingSeason, pens as samplePens, type Animal, type Pen, type PenId } from './data/sample'

declare global {
  interface Window {
    google?: any
    gapi?: any
  }
}

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

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly'
const FALLBACK_CLIENT_ID = '377565604559-94ejku2bdvu6lp9m8jqtsdcn9nnr2fjk.apps.googleusercontent.com'
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? FALLBACK_CLIENT_ID

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
  const [fileId, setFileId] = useState<string>('')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<string>('لم يتم تسجيل الدخول')
  const [driveStatus, setDriveStatus] = useState<string>('لم يتم التحميل')
  const [loadingDrive, setLoadingDrive] = useState(false)

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

  const labelForPen = (penId: PenId) => penList.find((p) => p.id === penId)?.name ?? penId

  const waitForGapi = () =>
    new Promise<void>((resolve, reject) => {
      const start = Date.now()
      const tryLoad = () => {
        if (window.gapi?.load) {
          window.gapi.load('client', {
            callback: () => resolve(),
            onerror: () => reject(new Error('gapi load error')),
          })
          return
        }
        if (Date.now() - start > 10000) {
          reject(new Error('gapi not available'))
          return
        }
        setTimeout(tryLoad, 50)
      }
      tryLoad()
    })

  const handleSignIn = async () => {
    if (!CLIENT_ID) {
      setAuthStatus('الرجاء ضبط VITE_GOOGLE_CLIENT_ID')
      return
    }
    setAuthStatus('جارٍ تسجيل الدخول...')
    try {
      await waitForGapi()
      const client = window.google?.accounts?.oauth2?.initTokenClient?.({
        client_id: CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: (resp: any) => {
          if (resp.error) {
            setAuthStatus('فشل تسجيل الدخول')
            return
          }
          setAccessToken(resp.access_token)
          setAuthStatus('تم تسجيل الدخول')
        },
      })
      if (!client) {
        setAuthStatus('Google client غير متاح')
        return
      }
      client.requestAccessToken({ prompt: 'consent' })
    } catch (err) {
      setAuthStatus('تعذر تحميل gapi/تسجيل الدخول')
    }
  }

  const handleSignOut = () => {
    if (accessToken && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(accessToken, () => {})
    }
    setAccessToken(null)
    setAuthStatus('تم تسجيل الخروج')
  }

  const handleFetchDrive = async () => {
    if (!accessToken) {
      setDriveStatus('سجّل الدخول أولاً')
      return
    }
    if (!fileId) {
      setDriveStatus('أدخل File ID من Google Drive')
      return
    }
    setLoadingDrive(true)
    setDriveStatus('جارٍ التحميل من Drive...')
    try {
      const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const json = await resp.json()
      if (Array.isArray(json.pens) && Array.isArray(json.animals)) {
        setPenList(json.pens)
        setHerd(json.animals)
        setDriveStatus('تم التحديث من Drive')
      } else {
        setDriveStatus('تنسيق غير متوقع: يحتاج { pens: [], animals: [] }')
      }
    } catch (err) {
      setDriveStatus('فشل التحميل من Drive')
    } finally {
      setLoadingDrive(false)
    }
  }

  useEffect(() => {
    if (!CLIENT_ID) {
      setAuthStatus('ضبط VITE_GOOGLE_CLIENT_ID مفقود')
    }
    // warm hint if scripts missing
    if (!window.google || !window.gapi) {
      // pass
    }
  }, [])

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
          <h3>ربط Google Drive</h3>
          <span className="hint">قراءة ملف JSON فيه pens + animals</span>
        </div>
        <div className="actions" style={{ marginBottom: 10 }}>
          <button className="btn" onClick={handleSignIn}>
            تسجيل دخول
          </button>
          <button className="btn secondary" onClick={handleSignOut}>
            تسجيل خروج
          </button>
          <button className="btn" onClick={handleFetchDrive} disabled={loadingDrive}>
            {loadingDrive ? '...جارٍ التحميل' : 'تحميل البيانات'}
          </button>
        </div>
        <div className="input-row">
          <label htmlFor="fileId">File ID</label>
          <input
            id="fileId"
            className="input"
            placeholder="مثال: 1AbCdEfGhIj..."
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
          />
        </div>
        <div className="hint-row">
          <span className="meta">حالة الدخول: {authStatus}</span>
        </div>
        <div className="hint-row">
          <span className="meta">حالة التحميل: {driveStatus}</span>
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
