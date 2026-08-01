'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Drop into instructor/dashboard/page.js, alongside the other manager components.
// Props:
//   quizzes: array of { id, title, courseTitle } — the tutor's own existing quizzes,
//     used as the target to regenerate questions for. (Creating a brand-new quiz for
//     a lesson that doesn't have one yet is a natural next step, but out of scope for
//     this first version — see note at the bottom of the file.)

const emptyQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correct_index: 0,
  explanation: '',
})

export default function AIQuizGenerator({ quizzes }) {
  const [width, setWidth] = useState(1200)
  const [selectedQuizId, setSelectedQuizId] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(20)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const [draftQuestions, setDraftQuestions] = useState(null) // null = not generated yet
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isMobile = width <= 768

  async function handleGenerate() {
    setGenError(null)
    setPublishResult(null)

    if (!lessonContent.trim()) {
      setGenError('Paste some lesson content first — the AI needs material to base questions on.')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonContent, topic, numQuestions }),
      })
      const data = await res.json()

      if (!res.ok) {
        setGenError(data.error || 'Something went wrong generating questions.')
        setGenerating(false)
        return
      }

      setDraftQuestions(data.questions)
    } catch (err) {
      setGenError('Could not reach the AI service. Check your connection and try again.')
    } finally {
      setGenerating(false)
    }
  }

  function updateQuestion(idx, field, value) {
    setDraftQuestions(prev => prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q)))
  }

  function updateOption(qIdx, optIdx, value) {
    setDraftQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q
      const newOptions = [...q.options]
      newOptions[optIdx] = value
      return { ...q, options: newOptions }
    }))
  }

  function deleteQuestion(idx) {
    setDraftQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  function addQuestion() {
    setDraftQuestions(prev => [...(prev || []), emptyQuestion()])
  }

  async function handlePublish() {
    if (!selectedQuizId) {
      setGenError('Choose which quiz these questions should replace before publishing.')
      return
    }
    const incomplete = draftQuestions.some(q =>
      !q.question.trim() || q.options.some(o => !o.trim()) || !q.explanation.trim()
    )
    if (incomplete) {
      setGenError('Every question needs full text, all 4 options filled in, and an explanation before publishing.')
      return
    }

    setPublishing(true)
    setGenError(null)

    try {
      // Replace this quiz's question bank entirely with the reviewed set
      const { error: deleteError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', selectedQuizId)

      if (deleteError) throw deleteError

      const rows = draftQuestions.map((q, i) => ({
        quiz_id: selectedQuizId,
        question: q.question.trim(),
        options: q.options.map(o => o.trim()),
        correct_index: q.correct_index,
        explanation: q.explanation.trim(),
        position: i,
      }))

      const { error: insertError } = await supabase.from('quiz_questions').insert(rows)
      if (insertError) throw insertError

      setPublishResult({ success: true, count: rows.length })
      setDraftQuestions(null)
      setLessonContent('')
      setTopic('')
    } catch (err) {
      setGenError('Could not save the questions. ' + (err.message || ''))
    } finally {
      setPublishing(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#1a1a2e',
    fontFamily: 'Inter, sans-serif',
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
        AI Quiz Generator
      </h2>
      <p style={{ fontSize: 12.5, color: '#8a94a6', marginBottom: 16 }}>
        Paste lesson notes, generate draft questions, review and edit them, then publish. Nothing goes live until you publish.
      </p>

      <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: 16 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>
          Which quiz should these questions replace?
        </label>
        <select
          value={selectedQuizId}
          onChange={e => setSelectedQuizId(e.target.value)}
          style={{ ...inputStyle, marginBottom: 14, cursor: 'pointer' }}
        >
          <option value="">Select a quiz...</option>
          {quizzes.map(q => (
            <option key={q.id} value={q.id}>{q.courseTitle} — {q.title}</option>
          ))}
        </select>

        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>
          Topic (optional, helps the AI stay focused)
        </label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. CSS Box Model, JavaScript Arrays..."
          style={{ ...inputStyle, marginBottom: 14 }}
        />

        <label style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 6 }}>
          Lesson content to base questions on
        </label>
        <textarea
          value={lessonContent}
          onChange={e => setLessonContent(e.target.value)}
          placeholder="Paste your lesson notes, transcript, or key points here..."
          rows={6}
          style={{ ...inputStyle, marginBottom: 14, resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
        />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 11.5, color: '#8a94a6', display: 'block', marginBottom: 4 }}>Questions to generate</label>
            <input
              type="number"
              min={1}
              max={30}
              value={numQuestions}
              onChange={e => setNumQuestions(e.target.value)}
              style={{ ...inputStyle, width: 80 }}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              marginTop: 18, backgroundColor: '#4a9eff', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13.5,
              cursor: generating ? 'default' : 'pointer', opacity: generating ? 0.7 : 1,
            }}
          >
            {generating ? 'Generating...' : '✨ Generate Questions'}
          </button>
        </div>

        {genError && (
          <div style={{ marginTop: 12, background: 'rgba(232,64,64,0.08)', border: '1px solid rgba(232,64,64,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#e84040' }}>
            {genError}
          </div>
        )}
        {publishResult?.success && (
          <div style={{ marginTop: 12, background: 'rgba(62,232,122,0.1)', border: '1px solid rgba(62,232,122,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: '#1a9c4e' }}>
            ✓ Published {publishResult.count} questions successfully.
          </div>
        )}
      </div>

      {draftQuestions && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
              Review {draftQuestions.length} questions before publishing
            </h3>
            <button onClick={addQuestion} style={{ background: 'rgba(74,158,255,0.1)', border: '1.5px solid #4a9eff', borderRadius: 8, color: '#4a9eff', padding: '6px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              + Add Question
            </button>
          </div>

          {draftQuestions.map((q, qi) => (
            <div key={qi} style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: isMobile ? 14 : 18, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8a94a6' }}>QUESTION {qi + 1}</span>
                <button onClick={() => deleteQuestion(qi)} style={{ background: 'none', border: 'none', color: '#e84040', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>

              <textarea
                value={q.question}
                onChange={e => updateQuestion(qi, 'question', e.target.value)}
                rows={2}
                style={{ ...inputStyle, marginBottom: 10, resize: 'vertical', fontWeight: 600 }}
              />

              {q.options.map((opt, oi) => (
                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <input
                    type="radio"
                    checked={q.correct_index === oi}
                    onChange={() => updateQuestion(qi, 'correct_index', oi)}
                    title="Mark as correct answer"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    style={{ ...inputStyle, flex: 1, background: q.correct_index === oi ? 'rgba(62,232,122,0.06)' : '#fff', borderColor: q.correct_index === oi ? '#3ee87a' : 'rgba(0,0,0,0.15)' }}
                  />
                </div>
              ))}

              <textarea
                value={q.explanation}
                onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                placeholder="Explanation shown to students after they answer..."
                rows={2}
                style={{ ...inputStyle, marginTop: 8, resize: 'vertical', fontSize: 12.5, color: '#666' }}
              />
            </div>
          ))}

          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              width: '100%', padding: 13, background: publishing ? '#8fb8e8' : 'linear-gradient(135deg,#3ee87a,#1ab55c)',
              border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: publishing ? 'default' : 'pointer',
            }}
          >
            {publishing ? 'Publishing...' : `Publish ${draftQuestions.length} Questions →`}
          </button>
        </div>
      )}
    </div>
  )
}

/* NOTE — scope of this first version:
   This generator replaces the question bank of an EXISTING quiz (all 40 modules
   already have one, from earlier seeding). Creating a brand-new quiz for a lesson
   that doesn't have one yet — including converting a lesson to type='quiz' and
   creating the quizzes row — is a natural next step, but was left out here to keep
   this build focused. Worth doing as a fast follow if tutors add new modules later. */