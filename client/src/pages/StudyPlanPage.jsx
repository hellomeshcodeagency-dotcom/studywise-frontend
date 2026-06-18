import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AppShell from '../components/layout/AppShell.jsx'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import { Plus, Trash2, Calendar, CheckCircle, Circle, ChevronDown, ChevronUp, Lock, Zap, RefreshCw } from 'lucide-react'

/* ─── LOCKED STATE ──────────────────────────────────── */
function PremiumLock() {
  return (
    <div className="glass rounded-2xl p-16 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="font-display font-bold text-white text-xl mb-2">Study Plans is Premium</h2>
      <p className="text-text-2 text-sm mb-6 max-w-sm mx-auto">
        Get a personalised day-by-day study schedule built around your exam date and weak areas.
      </p>
      <button onClick={() => toast('Paystack payments coming soon! 🚀')} className="btn-primary">
        ⚡ Upgrade for ₦700/month
      </button>
    </div>
  )
}

/* ─── CREATE PLAN FORM ──────────────────────────────── */
function CreatePlanForm({ onCreated }) {
  const [examName, setExamName]     = useState('')
  const [examDate, setExamDate]     = useState('')
  const [subjects, setSubjects]     = useState([''])
  const [weakAreas, setWeakAreas]   = useState('')
  const [loading, setLoading]       = useState(false)

  function addSubject() { setSubjects(s => [...s, '']) }
  function removeSubject(i) { setSubjects(s => s.filter((_, idx) => idx !== i)) }
  function updateSubject(i, val) { setSubjects(s => s.map((x, idx) => idx === i ? val : x)) }

  // Min date = tomorrow
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  async function submit() {
    if (!examName.trim())  { toast.error('Enter your exam name'); return }
    if (!examDate)         { toast.error('Select your exam date'); return }
    const filteredSubjects = subjects.filter(s => s.trim())
    if (filteredSubjects.length === 0) { toast.error('Add at least one subject'); return }

    setLoading(true)
    try {
      const res = await api.post('/study/plan/create', {
        exam_name:  examName.trim(),
        exam_date:  examDate,
        subjects:   filteredSubjects,
        weak_areas: weakAreas.trim(),
      })
      toast.success('Study plan created! 🎉')
      onCreated(res.data.plan)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create plan. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="glass rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
             style={{ background: 'rgba(124,58,237,0.15)' }}>📅</div>
        <div>
          <h2 className="font-display font-bold text-white text-lg">Create Study Plan</h2>
          <p className="text-text-3 text-xs">We'll build a personalised schedule around your exam</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Exam name */}
        <div>
          <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">
            Exam / Test Name
          </label>
          <input type="text" value={examName} onChange={e => setExamName(e.target.value)}
            placeholder="e.g. WAEC Biology, JAMB 2025, Final Exams"
            className="input-field"/>
        </div>

        {/* Exam date */}
        <div>
          <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">
            Exam Date
          </label>
          <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
            min={minDateStr} className="input-field"
            style={{ colorScheme: 'dark' }}/>
          {examDate && (
            <p className="text-xs text-text-3 mt-1.5">
              {Math.ceil((new Date(examDate) - new Date()) / (1000*60*60*24))} days to go
            </p>
          )}
        </div>

        {/* Subjects */}
        <div>
          <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">
            Subjects / Topics to cover
          </label>
          <div className="space-y-2">
            {subjects.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={s} onChange={e => updateSubject(i, e.target.value)}
                  placeholder={`Subject ${i + 1} e.g. Organic Chemistry`}
                  className="input-field flex-1"/>
                {subjects.length > 1 && (
                  <button onClick={() => removeSubject(i)}
                    className="text-text-3 hover:text-rose-400 transition-colors px-2">
                    <Trash2 size={15}/>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addSubject}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: '#9D5FF5' }}>
            <Plus size={13}/> Add another subject
          </button>
        </div>

        {/* Weak areas */}
        <div>
          <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">
            Weak Areas <span className="text-text-3 normal-case font-normal">(optional but recommended)</span>
          </label>
          <textarea value={weakAreas} onChange={e => setWeakAreas(e.target.value)}
            placeholder="e.g. Thermodynamics, Organic reactions, Essay writing, Calculus..."
            rows={3} className="input-field resize-none text-sm"/>
          <p className="text-xs text-text-3 mt-1.5">
            These will be scheduled earlier and revisited more often
          </p>
        </div>

        <button onClick={submit} disabled={loading} className="btn-primary w-full justify-center py-3.5">
          {loading
            ? <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
                Building your plan…
              </span>
            : <><Zap size={15}/> Generate My Study Plan</>
          }
        </button>
      </div>
    </div>
  )
}

/* ─── PLAN VIEW ─────────────────────────────────────── */
function PlanView({ plan, onUpdate, onDelete }) {
  const [expanded, setExpanded]   = useState({})
  const [updating, setUpdating]   = useState(null)
  const [deleting, setDeleting]   = useState(false)
  const [regenerating, setRegen]  = useState(false)

  const daysLeft  = Math.ceil((new Date(plan.exam_date) - new Date()) / (1000*60*60*24))
  const schedule  = plan.schedule || []
  const totalTopics = schedule.reduce((a, d) => a + d.topics.length, 0)
  const doneTopics  = schedule.reduce((a, d) => a + d.topics.filter(t => t.done).length, 0)
  const pct         = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0

  async function toggleTopic(dayIdx, topicIdx) {
    const key = `${dayIdx}-${topicIdx}`
    setUpdating(key)
    try {
      const res = await api.patch(`/study/plan/${plan.id}/topic`, { dayIdx, topicIdx })
      onUpdate(res.data.plan)
    } catch { toast.error('Failed to update') }
    finally { setUpdating(null) }
  }

  async function deletePlan() {
    if (!confirm('Delete this study plan?')) return
    setDeleting(true)
    try {
      await api.delete(`/study/plan/${plan.id}`)
      toast.success('Plan deleted')
      onDelete()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  async function regenerate() {
    setRegen(true)
    try {
      const res = await api.post(`/study/plan/${plan.id}/regenerate`)
      onUpdate(res.data.plan)
      toast.success('Plan regenerated! 🎉')
    } catch { toast.error('Failed to regenerate') }
    finally { setRegen(false) }
  }

  // Group days into: overdue, today, upcoming
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Plan header */}
      <div className="glass rounded-2xl p-5 md:p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2 className="font-display font-bold text-white text-xl mb-1">{plan.exam_name}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-text-2 flex items-center gap-1.5">
                <Calendar size={12}/>
                {new Date(plan.exam_date).toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                daysLeft <= 3 ? 'bg-rose-500/15 text-rose-400' :
                daysLeft <= 7 ? 'bg-amber-500/15 text-amber-400' :
                'bg-emerald-500/15 text-emerald-400'
              }`}>
                {daysLeft <= 0 ? 'Exam day!' : `${daysLeft} days left`}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={regenerate} disabled={regenerating}
              className="btn-ghost text-xs py-2 px-3 gap-1.5">
              <RefreshCw size={13} className={regenerating ? 'animate-spin' : ''}/>
              <span className="hidden sm:inline">Regenerate</span>
            </button>
            <button onClick={deletePlan} disabled={deleting}
              className="text-xs py-2 px-3 rounded-xl text-rose-400 transition-all flex items-center gap-1.5"
              style={{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)' }}>
              <Trash2 size={13}/>
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-2">Overall progress</span>
            <span className="text-xs font-bold text-white">{doneTopics}/{totalTopics} topics · {pct}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width:`${pct}%`, background:'linear-gradient(90deg,#7C3AED,#EC4899)' }}/>
          </div>
        </div>

        {/* Subjects */}
        <div className="mt-4 flex flex-wrap gap-2">
          {plan.subjects?.map(s => (
            <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.3)',color:'#9D5FF5' }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-3">
        {schedule.map((day, dayIdx) => {
          const isExpanded  = expanded[dayIdx] !== false // default open for today/upcoming
          const isToday     = day.date === today
          const isPast      = day.date < today
          const allDone     = day.topics.every(t => t.done)
          const donePct     = day.topics.length ? Math.round((day.topics.filter(t => t.done).length / day.topics.length) * 100) : 0

          return (
            <div key={dayIdx}
              className={`rounded-2xl overflow-hidden transition-all ${isToday ? 'ring-2' : ''}`}
              style={{
                background: isPast && allDone ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)',
                border: isToday ? '2px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isToday ? '0 0 20px rgba(124,58,237,0.15)' : 'none',
              }}>

              {/* Day header */}
              <button className="w-full px-5 py-4 flex items-center gap-3 text-left"
                      onClick={() => setExpanded(e => ({ ...e, [dayIdx]: !isExpanded }))}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  allDone ? 'bg-emerald-500/20 text-emerald-400' :
                  isToday ? 'text-white' : 'text-text-2'
                }`}
                style={isToday && !allDone ? { background:'linear-gradient(135deg,#7C3AED,#EC4899)' } :
                       !allDone ? { background:'rgba(255,255,255,0.07)' } : {}}>
                  {allDone ? '✓' : dayIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${allDone ? 'text-emerald-400' : 'text-white'}`}>
                      Day {dayIdx + 1} — {new Date(day.date + 'T12:00:00').toLocaleDateString('en-NG', { weekday:'short', day:'numeric', month:'short' })}
                    </span>
                    {isToday && <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full text-white" style={{ background:'linear-gradient(135deg,#7C3AED,#EC4899)' }}>TODAY</span>}
                    {isPast && !allDone && <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">OVERDUE</span>}
                  </div>
                  <div className="text-xs text-text-3 mt-0.5">{day.topics.length} topic{day.topics.length !== 1 ? 's' : ''} · {donePct}% done</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Mini progress */}
                  <div className="w-12 h-1.5 rounded-full overflow-hidden hidden sm:block" style={{ background:'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full" style={{ width:`${donePct}%`, background: allDone ? '#10B981' : 'linear-gradient(90deg,#7C3AED,#EC4899)' }}/>
                  </div>
                  {isExpanded ? <ChevronUp size={15} className="text-text-3"/> : <ChevronDown size={15} className="text-text-3"/>}
                </div>
              </button>

              {/* Topics */}
              {isExpanded && (
                <div className="px-5 pb-4 space-y-2 border-t border-white/8 pt-3">
                  {day.topics.map((topic, topicIdx) => {
                    const key = `${dayIdx}-${topicIdx}`
                    return (
                      <button key={topicIdx} onClick={() => toggleTopic(dayIdx, topicIdx)}
                        disabled={updating === key}
                        className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[.98] ${
                          topic.done ? 'opacity-70' : 'hover:bg-white/5'
                        }`}
                        style={{
                          background: topic.done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${topic.done ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        }}>
                        <div className="flex-shrink-0 mt-0.5">
                          {updating === key
                            ? <div className="w-4 h-4 rounded-full border-2 border-violet/30 border-t-violet animate-spin"/>
                            : topic.done
                            ? <CheckCircle size={16} className="text-emerald-400"/>
                            : <Circle size={16} className="text-text-3"/>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${topic.done ? 'line-through text-text-3' : 'text-white'}`}>
                            {topic.title}
                          </div>
                          {topic.description && (
                            <div className="text-xs text-text-3 mt-0.5 leading-relaxed">{topic.description}</div>
                          )}
                          {topic.is_weak_area && (
                            <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block bg-amber-500/15 text-amber-400">
                              ⚠️ Weak area
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-3 flex-shrink-0">{topic.duration_mins}m</div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Exam day card */}
      <div className="mt-4 rounded-2xl p-5 text-center"
           style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(236,72,153,0.1))', border:'1px solid rgba(124,58,237,0.3)' }}>
        <div className="text-3xl mb-2">🎓</div>
        <div className="font-display font-bold text-white mb-1">{plan.exam_name}</div>
        <div className="text-sm text-text-2">
          {new Date(plan.exam_date).toLocaleDateString('en-NG', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </div>
        {daysLeft > 0 && <div className="text-xs text-text-3 mt-1">{daysLeft} days away · You've got this! 💪</div>}
      </div>
    </div>
  )
}

/* ─── MAIN PAGE ─────────────────────────────────────── */
export default function StudyPlanPage() {
  const { hasPremium } = useAuth()
  const isPremium = hasPremium()

  const [plans, setPlans]     = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [activePlan, setActivePlan] = useState(null)

  useEffect(() => {
    if (!isPremium) { setLoading(false); return }
    api.get('/study/plan')
      .then(r => {
        setPlans(r.data.plans)
        if (r.data.plans.length > 0) setActivePlan(r.data.plans[0])
      })
      .catch(() => toast.error('Failed to load plans'))
      .finally(() => setLoading(false))
  }, [isPremium])

  function onCreated(plan) {
    setPlans(p => [plan, ...p])
    setActivePlan(plan)
    setCreating(false)
  }

  function onUpdate(updatedPlan) {
    setPlans(p => p.map(x => x.id === updatedPlan.id ? updatedPlan : x))
    setActivePlan(updatedPlan)
  }

  function onDelete() {
    const remaining = plans.filter(p => p.id !== activePlan?.id)
    setPlans(remaining)
    setActivePlan(remaining[0] || null)
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-5 md:py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white mb-1">Study Plans 📅</h1>
            <p className="text-text-2 text-sm">Personalised day-by-day schedules built around your exam date</p>
          </div>
          {isPremium && !creating && (
            <button onClick={() => { setCreating(true); setActivePlan(null) }} className="btn-primary text-sm py-2.5 px-5">
              <Plus size={15}/> New Plan
            </button>
          )}
        </div>

        {!isPremium ? (
          <PremiumLock />
        ) : loading ? (
          <div className="glass rounded-2xl p-16 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-violet border-t-transparent animate-spin"/>
          </div>
        ) : creating || (!activePlan && plans.length === 0) ? (
          <CreatePlanForm onCreated={onCreated} />
        ) : (
          <div>
            {/* Plan switcher if multiple plans */}
            {plans.length > 1 && (
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {plans.map(p => (
                  <button key={p.id} onClick={() => { setActivePlan(p); setCreating(false) }}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activePlan?.id === p.id ? 'text-white' : 'text-text-3 hover:text-text-2'}`}
                    style={{
                      background: activePlan?.id === p.id ? 'linear-gradient(135deg,#7C3AED,#EC4899)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                    {p.exam_name}
                  </button>
                ))}
              </div>
            )}

            {activePlan && (
              <PlanView
                plan={activePlan}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
