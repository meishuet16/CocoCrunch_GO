import { useState } from 'react';

export type OnboardingStep = 'entry' | 'login' | 'signup' | 'terms' | 'packing';

export type OnboardingFlowProps = {
  initialStep?: OnboardingStep;
  onAccountReady: (account: { name: string }) => void;
  onTermsAccepted: () => void;
  onComplete: (preferences: string[]) => void;
};

const countryCodes = [
  { value: '+60', label: 'Malaysia +60' },
  { value: '+65', label: 'Singapore +65' },
  { value: '+86', label: 'China +86' },
  { value: '+852', label: 'Hong Kong +852' },
];

const packingQuestions = [
  { id: 'light-packer', label: 'I prefer a lighter suitcase' },
  { id: 'extra-outfits', label: 'I like a few extra outfit options' },
  { id: 'portable-charger', label: 'I usually carry a power bank' },
  { id: 'rain-layer', label: 'I usually pack an umbrella or rain layer' },
];

function isMockOtpValid(value: string): boolean {
  return /^\d{4,6}$/.test(value);
}

export function OnboardingFlow({ initialStep = 'entry', onAccountReady, onTermsAccepted, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [preferences, setPreferences] = useState<string[]>(['portable-charger', 'rain-layer']);

  const displayStep = step === 'packing' ? 4 : step === 'terms' ? 3 : step === 'entry' ? 1 : 2;
  const otpValid = isMockOtpValid(otp);
  const advanceToTerms = () => {
    onAccountReady({ name: step === 'signup' ? name.trim() : '' });
    setStep('terms');
  };
  const togglePreference = (id: string) => {
    setPreferences(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  return (
    <main className="onboarding-flow" aria-label="CocoCrunch onboarding">
      <section className="onboarding-card">
        <div className="onboarding-progress" aria-label={`Onboarding step ${displayStep} of 4`}>
          <span>GETTING STARTED</span>
          <b>{displayStep}/4</b>
          <div><i style={{ width: `${displayStep * 25}%` }} /></div>
        </div>

        {step === 'entry' && <>
          <span className="drawer-kicker">WELCOME TO COCOCRUNCH</span>
          <h1>Plan trips that still feel like yours.</h1>
          <p>Start with the route that fits you. This is a local frontend prototype.</p>
          <div className="onboarding-actions">
            <button className="primary" onClick={() => setStep('login')}>Login</button>
            <button className="secondary" onClick={() => setStep('signup')}>Sign up</button>
          </div>
        </>}

        {step === 'login' && <>
          <span className="drawer-kicker">LOGIN · PROTOTYPE</span>
          <h1>Welcome back.</h1>
          <p className="adapter-note">Prototype verification only — no real SMS is sent. Enter any 4–6 digit OTP to continue.</p>
          <label className="setup-field"><span>Phone number</span><input value={phone} inputMode="tel" onChange={event => setPhone(event.target.value)} placeholder="012 345 6789" /></label>
          <label className="setup-field"><span>OTP</span><input value={otp} inputMode="numeric" maxLength={6} onChange={event => setOtp(event.target.value)} placeholder="4–6 digits" /></label>
          <div className="onboarding-actions"><button className="secondary" onClick={() => setStep('entry')}>Back</button><button className="primary" disabled={!phone.trim() || !otpValid} onClick={advanceToTerms}>Continue</button></div>
          <button className="onboarding-skip" onClick={() => { onAccountReady({ name: '' }); setStep('terms'); }}>Skip login for this prototype</button>
        </>}

        {step === 'signup' && <>
          <span className="drawer-kicker">SIGN UP · PROTOTYPE</span>
          <h1>Set up your travel profile.</h1>
          <p className="adapter-note">Prototype verification only — no real SMS is sent. Enter any 4–6 digit OTP after sending it.</p>
          <label className="setup-field"><span>Name</span><input value={name} onChange={event => setName(event.target.value)} placeholder="Your name" /></label>
          <label className="setup-field"><span>Country code<select aria-label="Country code">{countryCodes.map(country => <option value={country.value} key={country.value}>{country.label}</option>)}</select></span></label>
          <label className="setup-field"><span>Phone number</span><input value={phone} inputMode="tel" onChange={event => setPhone(event.target.value)} placeholder="012 345 6789" /></label>
          <button className="secondary" type="button">Send mock OTP</button>
          <label className="setup-field"><span>OTP</span><input value={otp} inputMode="numeric" maxLength={6} onChange={event => setOtp(event.target.value)} placeholder="4–6 digits" /></label>
          <label className="setup-field"><span>Birthday</span><input type="date" aria-label="Birthday" /></label>
          <div className="onboarding-actions"><button className="secondary" onClick={() => setStep('entry')}>Back</button><button className="primary" disabled={!name.trim() || !phone.trim() || !otpValid} onClick={advanceToTerms}>Continue</button></div>
          <button className="onboarding-skip" onClick={() => { onAccountReady({ name: '' }); setStep('terms'); }}>Skip sign up for this prototype</button>
        </>}

        {step === 'terms' && <>
          <span className="drawer-kicker">TERMS &amp; CONDITIONS</span>
          <h1>Keep control of what CocoCrunch can use.</h1>
          <ul className="onboarding-permissions">
            <li><b>Real-time location</b><span>Used during a trip for route guidance and safety features. It stays off until you choose to share it.</span></li>
            <li><b>Notifications</b><span>Used for the reminders and travel updates you choose.</span></li>
            <li><b>Camera</b><span>Used only when you add photos to your private trip memories.</span></li>
          </ul>
          <label className="onboarding-consent"><input type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} /> <span>I agree to the Terms &amp; Conditions.</span></label>
          <button className="primary" disabled={!termsAccepted} onClick={() => { onTermsAccepted(); setStep('packing'); }}>I agree &amp; continue</button>
        </>}

        {step === 'packing' && <>
          <span className="drawer-kicker">PACKING BASICS</span>
          <h1>One last little habit check.</h1>
          <p>We will use these as your starting packing preferences. You can change them later.</p>
          <div className="onboarding-packing-questions">{packingQuestions.map(question => <label key={question.id}><input type="checkbox" checked={preferences.includes(question.id)} onChange={() => togglePreference(question.id)} /> <span>{question.label}</span></label>)}</div>
          <button className="primary" onClick={() => onComplete(preferences)}>Finish setup</button>
          <button className="onboarding-skip" onClick={() => onComplete([])}>Skip for now</button>
        </>}
      </section>
    </main>
  );
}
