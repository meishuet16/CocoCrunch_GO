import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { OnboardingFlow, type OnboardingStep } from './OnboardingFlow';

function render(step: OnboardingStep) {
  return renderToStaticMarkup(<OnboardingFlow initialStep={step} onAccountReady={vi.fn()} onTermsAccepted={vi.fn()} onComplete={vi.fn()} />);
}

describe('OnboardingFlow', () => {
  it('renders a distinct entry screen with login and sign-up choices', () => {
    const html = render('entry');
    expect(html).toContain('Welcome');
    expect(html).toContain('CocoCrunch');
    expect(html).toContain('Start with the route that fits you.');
    expect(html).toContain('Coco and travel essentials');
    expect(html).toContain('Login');
    expect(html).toContain('Sign up');
    expect(html).not.toContain('1/4');
  });

  it('uses password authentication without an OTP flow', () => {
    expect(render('login')).toContain('Password');
    expect(render('login')).not.toContain('OTP');
    expect(render('login')).not.toContain('Send code');
    expect(render('login')).not.toContain('Skip for now');
    expect(render('login')).not.toContain('SETUP');
    expect(render('login')).not.toContain('2/4');
    expect(render('signup')).toContain('Country code');
    expect(render('signup')).not.toContain('SETUP');
    expect(render('signup')).toContain('Birthday');
    expect(render('signup')).toContain('Password');
    expect(render('signup')).not.toContain('Send code');
    expect(render('signup')).toContain('disabled=""');
  });

  it('restores persisted signup country code and birthday values', () => {
    const html = renderToStaticMarkup(<OnboardingFlow initialStep="signup" initialAccount={{ countryCode: '+65', birthday: '1995-06-12' }} onAccountReady={vi.fn()} onTermsAccepted={vi.fn()} onComplete={vi.fn()} />);
    expect(html).toContain('value="+65"');
    expect(html).toContain('value="1995-06-12"');
  });

  it('keeps terms acknowledgement inside sign-up rather than a separate page', () => {
    const html = render('signup');
    expect(html).toContain('I agree to the');
    expect(html).toContain('Terms &amp; Conditions');
    expect(html).toContain('disabled=""');
  });

  it('offers editable packing basics and a skip exit after Tingo', () => {
    const html = render('packing');
    expect(html).toContain('power bank');
    expect(html).toContain('umbrella or rain layer');
    expect(html).toContain('Skip for now');
    expect(html).toContain('4/4');
  });
});
