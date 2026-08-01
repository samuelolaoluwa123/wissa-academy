'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'
import { useCurrentUser } from '../../../hooks/useCurrentUser'

const TABS = [
  { id:'profile',  label:'Profile',       icon:'👤' },
  { id:'password', label:'Password',      icon:'🔒' },
  { id:'notifs',   label:'Notifications', icon:'🔔' },
  { id:'privacy',  label:'Privacy',       icon:'🛡️' },
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

export default function StudentSettings() {
  const router = useRouter()
  const { authUser, profile, refreshProfile, initials, loading: userLoading } = useCurrentUser()

  const [width, setWidth]       = useState(1200)
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const fileRef                 = useRef(null)

  const [profileForm, setProfileForm] = useState({ firstName:'', lastName:'', email:'', phone:'', bio:'', location:'', website:'' })
  const [avatarUrl, setAvatarUrl]     = useState(null)
  const [passwords, setPasswords]     = useState({ newPass:'', confirm:'' })
  const [pwErrors, setPwErrors]       = useState({})
  const [notifs, setNotifs]   = useState({ newLessons:true, courseUpdates:true, quizReminders:true, weeklyDigest:false, certificateReady:true, promotions:false })
  const [privacy, setPrivacy] = useState({ profilePublic:true, showProgress:false, showCertificates:true, twoFactor:false })

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Populate form whenever profile data arrives/changes
  useEffect(() => {
    if (!authUser && !userLoading) { router.push('/auth'); return }
    if (profile) {
      const [firstName, ...rest] = (profile.full_name || '').split(' ')
      setProfileForm({
        firstName: firstName || '',
        lastName:  rest.join(' ') || '',
        email:     profile.email || authUser?.email || '',
        phone:     profile.phone || '',
        bio:       profile.bio || '',
        location:  profile.location || '',
        website:   profile.website || '',
      })
      setAvatarUrl(profile.avatar_url || null)
    }
  }, [profile, authUser, userLoading])

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !authUser) return
    setPhotoError('')

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('File must be under 2MB')
      return
    }

    setUploadingPhoto(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${authUser.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}` // cache-bust

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', authUser.id)
      setAvatarUrl(publicUrl)
      await refreshProfile()
    } catch (err) {
      console.error('Avatar upload error:', err)
      setPhotoError(err.message?.includes('Bucket not found')
        ? 'Storage not set up yet — ask your developer to create an "avatars" bucket in Supabase'
        : 'Upload failed. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSave() {
    if (!authUser || saving) return
    setSaving(true)
    try {
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim()
      await supabase.from('profiles').update({
        full_name: fullName,
        phone:     profileForm.phone,
        bio:       profileForm.bio,
        location:  profileForm.location,
        website:   profileForm.website,
      }).eq('id', authUser.id)

      // Keep auth metadata in sync so Sidebar/Topbar update instantly
      await supabase.auth.updateUser({ data: { full_name: fullName } })
      await refreshProfile()

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('Profile save error:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSave() {
    const errs = {}
    if (passwords.newPass.length < 6) errs.newPass = 'Minimum 6 characters'
    if (passwords.newPass !== passwords.confirm) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwErrors({})
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.newPass })
      if (error) throw error
      setSaved(true)
      setPasswords({ newPass:'', confirm:'' }) // clears the form on success
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setPwErrors({ submit: err.message })
    } finally {
      setSaving(false)
    }
  }

  const isMobile  = width <= 768
  const isTablet  = width > 768 && width <= 1024
  const isNarrow  = isMobile || isTablet
  const displayInitials = userLoading ? '··' : initials

  const pwStrength = (pw) => { if (!pw) return 0; if (pw.length<6) return 1; if (pw.length<10) return 2; if (/[A-Z]/.test(pw)&&/\d/.test(pw)) return 4; return 3 }
  const strength      = pwStrength(passwords.newPass)
  const strengthLabel = ['','Too short','Weak','Good','Strong'][strength]
  const strengthColor = ['','#e84040','#f5a623','#4a9eff','#3ee87a'][strength]

  return (
    <DashboardShell role="student">
      <div style={{ paddingTop: isMobile?'20px':'32px', paddingLeft: isMobile?'16px':'40px', paddingRight: isMobile?'16px':'40px', paddingBottom:'40px', maxWidth:900, margin:'0 auto' }}>
        <div style={{ marginBottom:'28px' }}>
          <h1 style={{ fontSize: isMobile?'22px':'26px', fontWeight:800, color:'#1a1a2e', margin:'0 0 4px' }}>Account Settings</h1>
          <p style={{ fontSize:'14px', color:'#8a94a6', margin:0 }}>Manage your profile and preferences</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isNarrow?'1fr':'200px 1fr', gap: isMobile?'0':'28px', alignItems:'start' }}>
          <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'14px', overflow:'hidden', marginBottom: isNarrow?'20px':'0', display: isNarrow?'flex':'block', overflowX: isNarrow?'auto':'visible' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: isNarrow?'auto':'100%', display:'flex', alignItems:'center', gap: isNarrow?'6px':'10px', padding: isNarrow?'12px 16px':'13px 18px', background: activeTab===tab.id?'rgba(74,158,255,0.08)':'none', border:'none', borderLeft: !isNarrow&&activeTab===tab.id?'3px solid #4a9eff':!isNarrow?'3px solid transparent':'none', borderBottom: isNarrow?`2px solid ${activeTab===tab.id?'#4a9eff':'transparent'}`:'none', cursor:'pointer', textAlign:'left', whiteSpace:'nowrap' }}>
                <span style={{ fontSize:'16px' }}>{tab.icon}</span>
                <span style={{ fontSize:'13.5px', fontWeight: activeTab===tab.id?700:500, color: activeTab===tab.id?'#4a9eff':'#8a94a6' }}>{tab.label}</span>
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'profile' && (
              <div className="anim-fade-in">
                <SettingsCard title="Profile Photo">
                  <div style={{ display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
                    <div onClick={() => fileRef.current?.click()} style={{ width:80, height:80, borderRadius:'50%', background:'#1e3a5f', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:700, color:'#4a9eff', border:'3px solid rgba(74,158,255,0.3)', overflow:'hidden', position:'relative' }}>
                      {uploadingPhoto ? (
                        <span style={{ fontSize:'13px' }}>...</span>
                      ) : avatarUrl ? (
                        <img src={avatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      ) : displayInitials}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} />
                    <div>
                      <button onClick={() => fileRef.current?.click()} disabled={uploadingPhoto} style={{ padding:'8px 20px', background:'rgba(74,158,255,0.1)', border:'1.5px solid #4a9eff', borderRadius:'8px', color:'#4a9eff', fontSize:'13px', fontWeight:600, cursor: uploadingPhoto ? 'not-allowed' : 'pointer', display:'block', marginBottom:'6px' }}>
                        {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                      </button>
                      <p style={{ fontSize:'12px', color:'#b0b8c8', margin:0 }}>JPG, PNG · Max 2MB</p>
                      {photoError && <p style={{ fontSize:'12px', color:'#e84040', margin:'4px 0 0' }}>{photoError}</p>}
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard title="Personal Information">
                  <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:'0 20px' }}>
                    <InputField label="First Name" value={profileForm.firstName} onChange={v => setProfileForm(p => ({ ...p, firstName:v }))} placeholder="First name" />
                    <InputField label="Last Name"  value={profileForm.lastName}  onChange={v => setProfileForm(p => ({ ...p, lastName:v }))}  placeholder="Last name" />
                  </div>
                  <InputField label="Email Address" value={profileForm.email} onChange={() => {}} type="email" disabled hint="Contact support to change your email" />
                  <InputField label="Phone Number" value={profileForm.phone} onChange={v => setProfileForm(p => ({ ...p, phone:v }))} placeholder="+234 800 000 0000" />
                  <InputField label="Location" value={profileForm.location} onChange={v => setProfileForm(p => ({ ...p, location:v }))} placeholder="City, Country" />
                  <InputField label="Website" value={profileForm.website} onChange={v => setProfileForm(p => ({ ...p, website:v }))} placeholder="https://yourwebsite.com" />
                  <div style={{ marginBottom:'20px' }}>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#1a1a2e', marginBottom:'6px' }}>Bio</label>
                    <textarea value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio:e.target.value }))} rows={3} placeholder="Tell us about yourself..." style={{ width:'100%', padding:'10px 14px', fontSize:'14px', border:'1.5px solid #e2e6ed', borderRadius:'10px', outline:'none', color:'#1a1a2e', background:'#fafbfc', resize:'vertical', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }} />
                  </div>
                  <SaveButton onClick={handleSave} saved={saved} loading={saving} />
                </SettingsCard>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="anim-fade-in">
                <SettingsCard title="Change Password" subtitle="Use a strong password with at least 6 characters">
                  {pwErrors.submit && <div style={{ padding:'12px 16px', background:'rgba(232,64,64,0.08)', border:'1px solid rgba(232,64,64,0.25)', borderRadius:'10px', marginBottom:'16px', fontSize:'13px', color:'#e84040' }}>{pwErrors.submit}</div>}
                  <InputField label="New Password" value={passwords.newPass} type="password" onChange={v => setPasswords(p => ({ ...p, newPass:v }))} error={pwErrors.newPass} placeholder="At least 6 characters" />
                  {passwords.newPass.length > 0 && (
                    <div style={{ marginTop:'-10px', marginBottom:'18px' }}>
                      <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
                        {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i<=strength?strengthColor:'#e2e6ed' }} />)}
                      </div>
                      <div style={{ fontSize:'12px', color:strengthColor }}>{strengthLabel}</div>
                    </div>
                  )}
                  <InputField label="Confirm New Password" value={passwords.confirm} type="password" onChange={v => setPasswords(p => ({ ...p, confirm:v }))} error={pwErrors.confirm} placeholder="Repeat new password" />
                  <SaveButton onClick={handlePasswordSave} saved={saved} loading={saving} />
                </SettingsCard>
              </div>
            )}

            {activeTab === 'notifs' && (
              <div className="anim-fade-in">
                <SettingsCard title="Email Notifications" subtitle="Choose which emails you want to receive">
                  {[
                    { key:'newLessons',       label:'New lesson published',    desc:'When a course you\'re enrolled in adds new content' },
                    { key:'courseUpdates',    label:'Course updates',          desc:'Updates and announcements from your instructors' },
                    { key:'quizReminders',    label:'Quiz reminders',          desc:'Reminders to complete pending quizzes' },
                    { key:'certificateReady', label:'Certificate ready',       desc:'When a new certificate is available for download' },
                    { key:'weeklyDigest',     label:'Weekly learning digest',  desc:'A summary of your weekly progress' },
                    { key:'promotions',       label:'Platform announcements',  desc:'Updates and news from Apps & Scripts' },
                  ].map(item => (
                    <Toggle key={item.key} checked={notifs[item.key]} onChange={v => setNotifs(n => ({ ...n, [item.key]:v }))} label={item.label} description={item.desc} />
                  ))}
                  <div style={{ marginTop:'20px' }}><SaveButton onClick={handleSave} saved={saved} loading={saving} /></div>
                </SettingsCard>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="anim-fade-in">
                <SettingsCard title="Privacy Settings">
                  {[
                    { key:'profilePublic',    label:'Public profile',        desc:'Allow other students to see your profile' },
                    { key:'showProgress',     label:'Show learning progress', desc:'Display your course progress on your public profile' },
                    { key:'showCertificates', label:'Show certificates',      desc:'Make your earned certificates visible to others' },
                  ].map(item => (
                    <Toggle key={item.key} checked={privacy[item.key]} onChange={v => setPrivacy(p => ({ ...p, [item.key]:v }))} label={item.label} description={item.desc} />
                  ))}
                  <div style={{ marginTop:'20px' }}><SaveButton onClick={handleSave} saved={saved} loading={saving} /></div>
                </SettingsCard>

                <SettingsCard title="Security">
                  <Toggle checked={privacy.twoFactor} onChange={v => setPrivacy(p => ({ ...p, twoFactor:v }))} label="Two-factor authentication" description="Add an extra layer of security when signing in" />
                  <div style={{ marginTop:'20px' }}><SaveButton onClick={handleSave} saved={saved} loading={saving} /></div>
                </SettingsCard>

                <SettingsCard title="Danger Zone">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
                    <div>
                      <div style={{ fontSize:'14px', fontWeight:600, color:'#1a1a2e' }}>Delete Account</div>
                      <div style={{ fontSize:'12.5px', color:'#8a94a6', marginTop:'2px' }}>Permanently remove your account. This cannot be undone.</div>
                    </div>
                    <button style={{ padding:'9px 20px', background:'none', border:'1.5px solid #e84040', borderRadius:'8px', color:'#e84040', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>Delete Account</button>
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