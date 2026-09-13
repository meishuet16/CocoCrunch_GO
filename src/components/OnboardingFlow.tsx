import { useState } from 'react';
import welcomeTravelKit from '../assets/onboarding/welcome-travel-kit.png';

export type OnboardingStep = 'entry' | 'login' | 'signup' | 'packing';

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

export function OnboardingFlow({ initialStep = 'entry', initialAccount, onAccountChange, onAccountReady, onTermsAccepted, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [name, setName] = useState(initialAccount?.name ?? '');
  const [countryCode, setCountryCode] = useState(initialAccount?.countryCode ?? countryCodes[0].value);
  const [birthday, setBirthday] = useState(initialAccount?.birthday ?? '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [preferences, setPreferences] = useState<string[]>(['portable-charger', 'rain-layer']);

  const passwordValid = password.length >= 8;

  const account = (changes: Partial<OnboardingAccount> = {}): OnboardingAccount => ({ name, countryCode, birthday, ...changes });
  const updateAccount = (changes: Partial<OnboardingAccount>) => {
    if (changes.name !== undefined) setName(changes.name);
    if (changes.countryCode !== undefined) setCountryCode(changes.countryCode);
    if (changes.birthday !== undefined) setBirthday(changes.birthday);
    onAccountChange?.(account(changes));
  };
  const advanceToTingo = () => {
    onAccountReady(account({ name: step === 'signup' ? name.trim() : '' }));
    onTermsAccepted();
  };
  const togglePreference = (id: string) => {
    setPreferences(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  return (
    <main className="onboarding-flow" aria-label="CocoCrunch onboarding">
      <section className={`onboarding-card onboarding-card--${step}`}>
        {step === 'entry' && <>
          <div className="onboarding-welcome-copy">
            <span>Welcome</span>
            <h1>CocoCrunch</h1>
          </div>
          <img className="onboarding-welcome-art" src={welcomeTravelKit} alt="Coco and travel essentials" />
          <p className="onboarding-welcome-tagline">Start with the route that fits you.</p>
          <div className="onboarding-actions onboarding-actions--primary onboarding-entry-actions">
            <button className="primary" onClick={() => setStep('login')}>Login</button>
            <button className="secondary" onClick={() => setStep('signup')}>Sign up</button>
          </div>
        </>}

        {step === 'login' && <>
          <span className="drawer-kicker">LOGIN</span>
          <h1>Welcome back.</h1>
          <label className="onboarding-field"><span>Phone number</span><input value={phone} inputMode="tel" autoComplete="tel" onChange={event => setPhone(event.target.value)} placeholder="012 345 6789" /></label>
          <label className="onboarding-field"><span>Password</span><input value={password} type="password" autoComplete="current-password" onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
          <div className="onboarding-actions onboarding-actions--primary"><button className="secondary" onClick={() => setStep('entry')}>Back</button><button className="primary" disabled={!phone.trim() || !passwordValid} onClick={advanceToTingo}>Continue</button></div>
        </>}

        {step === 'signup' && <>
          <span className="drawer-kicker">SIGN UP</span>
          <h1>Set up your travel profile.</h1>
          <label className="onboarding-field"><span>Name</span><input value={name} autoComplete="name" onChange={event => updateAccount({ name: event.target.value })} placeholder="Your name" /></label>
          <label className="onboarding-field"><span>Country code</span><select aria-label="Country code" value={countryCode} onChange={event => updateAccount({ countryCode: event.target.value })}>{countryCodes.map(country => <option value={country.value} key={country.value}>{country.label}</option>)}</select></label>
          <label className="onboarding-field"><span>Phone number</span><input value={phone} inputMode="tel" autoComplete="tel" onChange={event => setPhone(event.target.value)} placeholder="012 345 6789" /></label>
          <label className="onboarding-field"><span>Password</span><input value={password} type="password" autoComplete="new-password" onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
          <label className="onboarding-field"><span>Birthday</span><input type="date" aria-label="Birthday" value={birthday} onChange={event => updateAccount({ birthday: event.target.value })} /></label>
          <label className="onboarding-consent onboarding-consent--inline"><input type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} /><span>I agree to the <button type="button" className="onboarding-terms-link" onClick={event => { event.preventDefault(); event.stopPropagation(); setTermsOpen(open => !open); }}>Terms &amp; Conditions</button>.</span></label>
          {termsOpen && <section className="onboarding-terms-disclosure" aria-label="Terms and Conditions"><div><b>Terms &amp; Conditions</b><button type="button" aria-label="Close Terms and Conditions" onClick={() => setTermsOpen(false)}>×</button></div><p>Use CocoCrunch responsibly and keep your account details private. Travel recommendations and plans should be checked against current provider information before you book or travel.</p></section>}
          <div className="onboarding-actions onboarding-actions--primary"><button className="secondary" onClick={() => setStep('entry')}>Back</button><button className="primary" disabled={!name.trim() || !phone.trim() || !passwordValid || !termsAccepted} onClick={advanceToTingo}>Continue</button></div>
        </>}

        {step === 'packing' && <>
          <span className="drawer-kicker">PACKING</span>
          <h1>Packing basics.</h1>
          <div className="onboarding-packing-questions">{packingQuestions.map(question => <label key={question.id}><input type="checkbox" checked={preferences.includes(question.id)} onChange={() => togglePreference(question.id)} /> <span>{question.label}</span></label>)}</div>
          <div className="onboarding-actions onboarding-actions--primary"><button className="secondary" onClick={() => onComplete([])}>Skip</button><button className="primary" onClick={() => onComplete(preferences)}>Finish setup</button></div>
        </>}
      </section>
    </main>
  );
}
