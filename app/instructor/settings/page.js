'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'

const TABS = [
  { id:'profile',  label:'Profile',       icon:'👤' },
  { id:'password', label:'Password',      icon:'🔒' },
  { id:'payout',   label:'Payouts',       icon:'💰' },
  { id:'notifs',   label:'Notifications', icon:'🔔' },
]

function SettingsCard({ title, subtitle, children }) {
  return (
    <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'14px', padding:'24px', marginBottom:'20px' }}>
      {(title||subtitle) && (
        <div style={{ marginBottom:'20px' }}>
          {title    && <h2 style={{ margin:'0 0 4px', fontSize:'16px', fontWeight:700, color:'#1a1a2e' }}>{title}</h2>}
          {subtitle && <p style={{ margin:0, fontSize:'13px', color:'#8a94a6' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

function InputField({ label, value, onChange, type='text', placeholder, hint, error, disabled }) {
  return (
    <div style={{ marginBottom:'18px' }}>
      <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#1a1a2e', marginBottom:'6px' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ width:'100%', padding:'10px 14px', fontSize:'14px', border:`1.5px solid ${error?'#e84040':'#e2e6ed'}`, borderRadius:'10px', outline:'none', color: disabled?'#8a94a6':'#1a1a2e', background: disabled?'#f9fafb':'#fafbfc', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }} />
      {hint  && !error && <div style={{ fontSize:'12px', color:'#8a94a6', marginTop:'5px' }}>{hint}</div>}
      {error && <div style={{ fontSize:'12px', color:'#e84040', marginTop:'5px' }}>{error}</div>}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #f5f5f5' }}>
      <div>
        <div style={{ fontSize:'14px', fontWeight:600, color:'#1a1a2e' }}>{label}</div>
        {description && <div style={{ fontSize:'12.5px', color:'#8a94a6', marginTop:'2px' }}>{description}</div>}
      </div>
      <button onClick={() => onChange(!checked)} style={{ width:44, height:24, borderRadius:'12px', border:'none', background: checked?'#4a9eff':'#e2e6ed', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
        <div style={{ position:'absolute', top:'3px', left: checked?'22px':'3px', width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }} />
      </button>
    </div>
  )
}

function SaveButton({ onClick, saved, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ padding:'10px 28px', background: saved?'rgba(62,232,122,0.13)':'linear-gradient(135deg,#4a9eff,#2563eb)', border: saved?'1.5px solid #3ee87a':'none', borderRadius:'10px', color: saved?'#3ee87a':'#fff', fontWeight:700, fontSize:'14px', cursor: loading?'not-allowed':'pointer' }}>
      {loading?'Saving...':saved?'✓ Saved!':'Save Changes'}
    </button>
  )
}

function EarningsStat({ label, value, color }) {
  return (
    <div style={{ background:`${color}10`, borderRadius:'12px', padding:'14px 18px', flex:1, minWidth:'120px' }}>
      <div style={{ fontSize:'20px', fontWeight:800, color, marginBottom:'4px' }}>{value}</div>
      <div style={{ fontSize:'12px', color:'#8a94a6' }}>{label}</div>
    </div>
  )
}

export default function InstructorSettings() {
  const router = useRouter()
  const [width, setWidth]     = useState(1200)
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [userId, setUserId]   = useState(null)
  const fileRef               = useRef(null)

  const [profile, setProfile] = useState({ firstName:'', lastName:'', email:'', phone:'', title:'', bio:'', location:'', website:'', twitter:'', linkedin:'', avatar:null })
  const [payout, setPayout]   = useState({ bankName:'', accountName:'', accountNumber:'', bvn:'', payoutFrequency:'monthly' })
  const [passwords, setPasswords] = useState({ current:'', newPass:'', confirm:'' })
  const [pwErrors, setPwErrors]   = useState({})
  const [notifs, setNotifs]   = useState({ newEnrollment:true, courseReview:true, payoutConfirmed:true, studentMessage:true, weeklyReport:true, platformUpdates:false })

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)

    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    if (data) {
      const [firstName, ...rest] = (data.full_name || '').split(' ')
      setProfile({
        firstName:  firstName || '',
        lastName:   rest.join(' ') || '',
        email:      data.email || '',
        phone:      data.phone || '',
        title:      data.bio?.split('|')[0]?.trim() || '',
        bio:        data.bio || '',
        location:   data.location || '',
        website:    data.website || '',
        twitter:    '',
        linkedin:   '',
        avatar:     data.avatar_url || null,
      })
      if (data.bank_name)       setPayout(p => ({ ...p, bankName:data.bank_name }))
      if (data.account_name)    setPayout(p => ({ ...p, accountName:data.account_name }))
      if (data.account_number)  setPayout(p => ({ ...p, accountNumber:data.account_number }))
      if (data.payout_frequency) setPayout(p => ({ ...p, payoutFrequency:data.payout_frequency }))
    }
  }

  async function handleSave() {
    if (!userId || saving) return
    setSaving(true)
    try {
      await supabase.from('profiles').update({
        full_name:  `${profile.firstName} ${profile.lastName}`.trim(),
        phone:      profile.phone,
        bio:        profile.bio,
        location:   profile.location,
        website:    profile.website,
      }).eq('id', userId)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handlePayoutSave() {
    if (!userId || saving) return
    setSaving(true)
    try {
      await supabase.from('profiles').update({
        bank_name:        payout.bankName,
        account_name:     payout.accountName,
        account_number:   payout.accountNumber,
        payout_frequency: payout.payoutFrequency,
      }).eq('id', userId)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Payout save error:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSave() {
    const errs = {}
    if (!passwords.current) errs.current = 'Enter your current password'
    if (passwords.newPass.length < 6) errs.newPass = 'Minimum 6 characters'
    if (passwords.newPass !== passwords.confirm) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwErrors({})
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.newPass })
      if (error) throw error
      setSaved(true)
      setPasswords({ current:'', newPass:'', confirm:'' })
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setPwErrors({ submit: err.message })
    } finally {
      setSaving(false)
    }
  }

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024
  const isNarrow = isMobile || isTablet
  const initials = `${profile.firstName?.[0]||''}${profile.lastName?.[0]||''}` || 'IN'

  const pwStrength = (pw) => { if (!pw) return 0; if (pw.length<6) return 1; if (pw.length<10) return 2; if (/[A-Z]/.test(pw)&&/\d/.test(pw)) return 4; return 3 }
  const strength      = pwStrength(passwords.newPass)
  const strengthLabel = ['','Too short','Weak','Good','Strong'][strength]
  const strengthColor = ['','#e84040','#f5a623','#4a9eff','#3ee87a'][strength]

  return (
    <DashboardShell role="instructor">
      <div style={{ paddingTop: isMobile?'20px':'32px', paddingLeft: isMobile?'16px':'40px', paddingRight: isMobile?'16px':'40px', paddingBottom:'40px', maxWidth:900, margin:'0 auto' }}>
        <div style={{ marginBottom:'28px' }}>
          <h1 style={{ fontSize: isMobile?'22px':'26px', fontWeight:800, color:'#1a1a2e', margin:'0 0 4px' }}>Instructor Settings</h1>
          <p style={{ fontSize:'14px', color:'#8a94a6', margin:0 }}>Manage your profile, payout details, and preferences</p>
        </div>

        {/* Earnings strip */}
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'28px' }}>
          <EarningsStat label="Gross Revenue"      value="₦0"  color="#4a9eff" />
          <EarningsStat label="Your Earnings (40%)" value="₦0" color="#3ee87a" />
          <EarningsStat label="Pending Payout"      value="₦0" color="#f5a623" />
          <EarningsStat label="Total Students"      value="0"  color="#8c64ff" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isNarrow?'1fr':'200px 1fr', gap: isMobile?'0':'28px', alignItems:'start' }}>
          {/* Tabs */}
          <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'14px', overflow:'hidden', marginBottom: isNarrow?'20px':'0', display: isNarrow?'flex':'block', overflowX: isNarrow?'auto':'visible' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: isNarrow?'auto':'100%', display:'flex', alignItems:'center', gap: isNarrow?'6px':'10px', padding: isNarrow?'12px 16px':'13px 18px', background: activeTab===tab.id?'rgba(74,158,255,0.08)':'none', border:'none', borderLeft: !isNarrow&&activeTab===tab.id?'3px solid #4a9eff':!isNarrow?'3px solid transparent':'none', borderBottom: isNarrow?`2px solid ${activeTab===tab.id?'#4a9eff':'transparent'}`:'none', cursor:'pointer', textAlign:'left', whiteSpace:'nowrap' }}>
                <span style={{ fontSize:'16px' }}>{tab.icon}</span>
                <span style={{ fontSize:'13.5px', fontWeight: activeTab===tab.id?700:500, color: activeTab===tab.id?'#4a9eff':'#8a94a6' }}>{tab.label}</span>
              </button>
            ))}
          </div>

          <div>
            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div className="anim-fade-in">
                <SettingsCard title="Profile Photo">
                  <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                    <div onClick={() => fileRef.current?.click()} style={{ width:80, height:80, borderRadius:'50%', background:'#1e3a5f', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:700, color:'#4a9eff', border:'3px solid rgba(74,158,255,0.3)', overflow:'hidden' }}>
                      {profile.avatar ? <img src={profile.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => { const f=e.target.files?.[0]; if(f) setProfile(p=>({...p,avatar:URL.createObjectURL(f)})) }} />
                    <div>
                      <button onClick={() => fileRef.current?.click()} style={{ padding:'8px 20px', background:'rgba(74,158,255,0.1)', border:'1.5px solid #4a9eff', borderRadius:'8px', color:'#4a9eff', fontSize:'13px', fontWeight:600, cursor:'pointer', display:'block', marginBottom:'6px' }}>Upload Photo</button>
                      <p style={{ fontSize:'12px', color:'#b0b8c8', margin:0 }}>JPG, PNG · Max 2MB</p>
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard title="Personal Information">
                  <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:'0 20px' }}>
                    <InputField label="First Name" value={profile.firstName} onChange={v => setProfile(p=>({...p,firstName:v}))} placeholder="First name" />
                    <InputField label="Last Name"  value={profile.lastName}  onChange={v => setProfile(p=>({...p,lastName:v}))}  placeholder="Last name" />
                  </div>
                  <InputField label="Email" value={profile.email} onChange={() => {}} type="email" disabled hint="Contact support to change your email" />
                  <InputField label="Phone" value={profile.phone} onChange={v => setProfile(p=>({...p,phone:v}))} placeholder="+234 800 000 0000" />
                  <InputField label="Professional Title" value={profile.title} onChange={v => setProfile(p=>({...p,title:v}))} placeholder="e.g. Senior Web Developer" />
                  <InputField label="Location" value={profile.location} onChange={v => setProfile(p=>({...p,location:v}))} placeholder="City, Country" />
                  <div style={{ marginBottom:'18px' }}>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#1a1a2e', marginBottom:'6px' }}>Bio <span style={{ color:'#b0b8c8', fontWeight:400 }}>(shown on your courses)</span></label>
                    <textarea value={profile.bio} onChange={e => setProfile(p=>({...p,bio:e.target.value}))} rows={4} style={{ width:'100%', padding:'10px 14px', fontSize:'14px', border:'1.5px solid #e2e6ed', borderRadius:'10px', outline:'none', color:'#1a1a2e', background:'#fafbfc', resize:'vertical', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }} />
                  </div>
                  <SaveButton onClick={handleSave} saved={saved} loading={saving} />
                </SettingsCard>

                <SettingsCard title="Social Links">
                  <InputField label="Website"    value={profile.website}  onChange={v => setProfile(p=>({...p,website:v}))}  placeholder="https://yourwebsite.com" />
                  <InputField label="Twitter / X" value={profile.twitter} onChange={v => setProfile(p=>({...p,twitter:v}))} placeholder="@username" />
                  <InputField label="LinkedIn"    value={profile.linkedin} onChange={v => setProfile(p=>({...p,linkedin:v}))} placeholder="linkedin.com/in/yourname" />
                  <SaveButton onClick={handleSave} saved={saved} loading={saving} />
                </SettingsCard>
              </div>
            )}

            {/* PASSWORD */}
            {activeTab === 'password' && (
              <div className="anim-fade-in">
                <SettingsCard title="Change Password">
                  {pwErrors.submit && <div style={{ padding:'12px 16px', background:'rgba(232,64,64,0.08)', border:'1px solid rgba(232,64,64,0.25)', borderRadius:'10px', marginBottom:'16px', fontSize:'13px', color:'#e84040' }}>{pwErrors.submit}</div>}
                  <InputField label="Current Password"    value={passwords.current} type="password" onChange={v=>setPasswords(p=>({...p,current:v}))}  error={pwErrors.current}  placeholder="Enter current password" />
                  <InputField label="New Password"        value={passwords.newPass} type="password" onChange={v=>setPasswords(p=>({...p,newPass:v}))}   error={pwErrors.newPass}  placeholder="At least 6 characters" />
                  {passwords.newPass.length > 0 && (
                    <div style={{ marginTop:'-10px', marginBottom:'18px' }}>
                      <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
                        {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i<=strength?strengthColor:'#e2e6ed' }} />)}
                      </div>
                      <div style={{ fontSize:'12px', color:strengthColor }}>{strengthLabel}</div>
                    </div>
                  )}
                  <InputField label="Confirm New Password" value={passwords.confirm} type="password" onChange={v=>setPasswords(p=>({...p,confirm:v}))} error={pwErrors.confirm} placeholder="Repeat new password" />
                  <SaveButton onClick={handlePasswordSave} saved={saved} loading={saving} />
                </SettingsCard>
              </div>
            )}

            {/* PAYOUTS */}
            {activeTab === 'payout' && (
              <div className="anim-fade-in">
                <div style={{ background:'rgba(245,166,35,0.08)', border:'1px solid rgba(245,166,35,0.25)', borderRadius:'12px', padding:'14px 18px', marginBottom:'20px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'16px', flexShrink:0 }}>⚠️</span>
                  <div style={{ fontSize:'13px', color:'#1a1a2e', lineHeight:1.5 }}>
                    Tutors earn <strong>40%</strong> per registration. Apps & Scripts takes <strong>50%</strong>. LMS developer earns <strong>10%</strong>. Paystack integration will be enabled in Phase D. All courses are currently free.
                  </div>
                </div>

                <SettingsCard title="Earnings Summary">
                  {[
                    { label:'Total Gross Revenue',   value:'₦0',  color:'#4a9eff' },
                    { label:'Platform Fee (50%)',     value:'₦0',  color:'#e84040' },
                    { label:'Developer Fee (10%)',    value:'₦0',  color:'#8c64ff' },
                    { label:'Your Earnings (40%)',    value:'₦0',  color:'#3ee87a' },
                    { label:'Pending Payout',         value:'₦0',  color:'#f5a623' },
                  ].map((item,i,arr) => (
                    <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i<arr.length-1?'1px solid #f5f5f5':'none' }}>
                      <span style={{ fontSize:'13.5px', color:'#8a94a6' }}>{item.label}</span>
                      <span style={{ fontSize:'15px', fontWeight:700, color:item.color }}>{item.value}</span>
                    </div>
                  ))}
                </SettingsCard>

                <SettingsCard title="Bank Account" subtitle="Your Nigerian bank account for payouts">
                  <InputField label="Bank Name"       value={payout.bankName}       onChange={v=>setPayout(p=>({...p,bankName:v}))}       placeholder="e.g. First Bank of Nigeria" />
                  <InputField label="Account Name"    value={payout.accountName}    onChange={v=>setPayout(p=>({...p,accountName:v}))}    placeholder="As it appears on your account" />
                  <InputField label="Account Number"  value={payout.accountNumber}  onChange={v=>setPayout(p=>({...p,accountNumber:v}))}  placeholder="10-digit account number" hint="Must be a valid Nigerian bank account" />
                  <InputField label="BVN"             value={payout.bvn}            onChange={v=>setPayout(p=>({...p,bvn:v}))}            type="password" placeholder="Bank Verification Number" hint="Stored securely and never shared" />
                  <div style={{ marginBottom:'18px' }}>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#1a1a2e', marginBottom:'6px' }}>Payout Frequency</label>
                    <select value={payout.payoutFrequency} onChange={e=>setPayout(p=>({...p,payoutFrequency:e.target.value}))} style={{ width:'100%', padding:'10px 14px', fontSize:'14px', border:'1.5px solid #e2e6ed', borderRadius:'10px', outline:'none', color:'#1a1a2e', background:'#fafbfc', boxSizing:'border-box' }}>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="manual">Manual (request when ready)</option>
                    </select>
                  </div>
                  <SaveButton onClick={handlePayoutSave} saved={saved} loading={saving} />
                </SettingsCard>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifs' && (
              <div className="anim-fade-in">
                <SettingsCard title="Email Notifications" subtitle="Stay informed about your courses and students">
                  {[
                    { key:'newEnrollment',   label:'New student enrollment',  desc:'When a student enrolls in one of your courses' },
                    { key:'courseReview',    label:'New course review',        desc:'When a student leaves a review on your course' },
                    { key:'payoutConfirmed', label:'Payout confirmed',         desc:'When a payout is processed to your bank account' },
                    { key:'studentMessage',  label:'Student messages',         desc:'When a student sends you a message or question' },
                    { key:'weeklyReport',    label:'Weekly earnings report',   desc:'A summary of your weekly enrollments' },
                    { key:'platformUpdates', label:'Platform updates',         desc:'New features and announcements from Apps & Scripts' },
                  ].map(item => (
                    <Toggle key={item.key} checked={notifs[item.key]} onChange={v=>setNotifs(n=>({...n,[item.key]:v}))} label={item.label} description={item.desc} />
                  ))}
                  <div style={{ marginTop:'20px' }}>
                    <SaveButton onClick={handleSave} saved={saved} loading={saving} />
                  </div>
                </SettingsCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}