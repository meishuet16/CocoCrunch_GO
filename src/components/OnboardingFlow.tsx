import { useEffect, useState } from 'react';

export type OnboardingStep = 'entry' | 'login' | 'signup' | 'terms' | 'packing';

export type OnboardingAccount = {
  name: string;
  countryCode: string;
  birthday: string;
};

export type OnboardingFlowProps = {
  initialStep?: OnboardingStep;
  initialAccount?: Partial<OnboardingAccount>;
  onAccountChange?: (account: OnboardingAccount) => void;
  onAccountReady: (account: OnboardingAccount) => void;
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

export function OnboardingFlow({ initialStep = 'entry', initialAccount, onAccountChange, onAccountReady, onTermsAccepted, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [name, setName] = useState(initialAccount?.name ?? '');
  const [countryCode, setCountryCode] = useState(initialAccount?.countryCode ?? countryCodes[0].value);
  const [birthday, setBirthday] = useState(initialAccount?.birthday ?? '');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [preferences, setPreferences] = useState<string[]>(['portable-charger', 'rain-layer']);

  const displayStep = step === 'packing' ? 4 : step === 'terms' ? 3 : step === 'entry' ? 1 : 2;
  const otpValid = isMockOtpValid(otp);
  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = window.setInterval(() => setResendCooldown(current => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const account = (changes: Partial<OnboardingAccount> = {}): OnboardingAccount => ({ name, countryCode, birthday, ...changes });
  const updateAccount = (changes: Partial<OnboardingAccount>) => {
    if (changes.name !== undefined) setName(changes.name);
    if (changes.countryCode !== undefined) setCountryCode(changes.countryCode);
    if (changes.birthday !== undefined) setBirthday(changes.birthday);
    onAccountChange?.(account(changes));
  };
  const sendMockOtp = () => {
    setOtpSent(true);
    setResendCooldown(30);
  };
  const advanceToTerms = () => {
    onAccountReady(account({ name: step === 'signup' ? name.trim() : '' }));
    setStep('terms');
  };
  const togglePreference = (id: string) => {
    setPreferences(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  return (
    <main className="onboarding-flow" aria-label="CocoCrunch onboarding">
      <section className="onboarding-card">
        <div className="onboarding-progress" aria-label={`Onboarding step ${displayStep} of 4`}>
          <span>SETUP</span>
          <b>{displayStep}/4</b>
          <div><i style={{ width: `${displayStep * 25}%` }} /></div>
        </div>

        {step === 'entry' && <>
          <span className="drawer-kicker">WELCOME</span>
          <h1>Plan trips that still feel like yours.</h1>
          <p>Start with the route that fits you. This is a local frontend prototype.</p>
          <div className="onboarding-actions">
            <button className="primary" onClick={() => setStep('login')}>Login</button>
            <button className="secondary" onClick={() => setStep('signup')}>Sign up</button>
          </div>
        </>}

        {step === 'login' && <>
          <span className="drawer-kicker">LOGIN</span>
          <h1>Welcome back.</h1>
          <p className="adapter-note">Prototype verification only — no real SMS is sent. Enter any 4–6 digit OTP to continue.</p>
          <label className="setup-field"><span>Phone number</span><input value={phone} inputMode="tel" onChange={event => setPhone(event.target.value)} placeholder="012 345 6789" /></label>
          <label className="setup-field"><span>OTP</span><input value={otp} inputMode="numeric" maxLength={6} onChange={event => setOtp(event.target.value)} placeholder="4–6 digits" /></label>
          <div className="onboarding-actions"><button className="secondary" onClick={() => setStep('entry')}>Back</button><button className="primary" disabled={!phone.trim() || !otpValid} onClick={advanceToTerms}>Continue</button></div>
          <button className="onboarding-skip" onClick={() => { onAccountReady(account({ name: '' })); setStep('terms'); }}>Skip login for this prototype</button>
        </>}

        {step === 'signup' && <>
          <span className="drawer-kicker">SIGN UP</span>
          <h1>Set up your travel profile.</h1>
          <p className="adapter-note">Prototype verification only — no real SMS is sent. Enter any 4–6 digit OTP after sending it.</p>
          <label className="setup-field"><span>Name</span><input value={name} onChange={event => updateAccount({ name: event.target.value })} placeholder="Your name" /></label>
          <label className="setup-field"><span>Country code<select aria-label="Country code" value={countryCode} onChange={event => updateAccount({ countryCode: event.target.value })}>{countryCodes.map(country => <option value={country.value} key={country.value}>{country.label}</option>)}</select></span></label>
          <label className="setup-field"><span>Phone number</span><input value={phone} inputMode="tel" onChange={event => setPhone(event.target.value)} placeholder="012 345 6789" /></label>
          <div className="onboarding-actions"><button className="secondary" type="button" onClick={sendMockOtp}>{otpSent ? 'Mock OTP sent' : 'Send mock OTP'}</button><button className="secondary" type="button" disabled={!otpSent || resendCooldown > 0} onClick={sendMockOtp}>{resendCooldown > 0 ? `Resend verification code (${resendCooldown}s)` : 'Resend verification code'}</button></div>
          <label className="setup-field"><span>OTP</span><input value={otp} inputMode="numeric" maxLength={6} onChange={event => setOtp(event.target.value)} placeholder="4–6 digits" /></label>
          <label className="setup-field"><span>Birthday</span><input type="date" aria-label="Birthday" value={birthday} onChange={event => updateAccount({ birthday: event.target.value })} /></label>
          <div className="onboarding-actions"><button className="secondary" onClick={() => setStep('entry')}>Back</button><button className="primary" disabled={!name.trim() || !phone.trim() || !otpValid} onClick={advanceToTerms}>Continue</button></div>
          <button className="onboarding-skip" onClick={() => { onAccountReady(account({ name: '' })); setStep('terms'); }}>Skip sign up for this prototype</button>
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
