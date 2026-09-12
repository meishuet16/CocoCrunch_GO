import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { OnboardingFlow, type OnboardingStep } from './OnboardingFlow';

function render(step: OnboardingStep) {
  return renderToStaticMarkup(<OnboardingFlow initialStep={step} onAccountReady={vi.fn()} onTermsAccepted={vi.fn()} onComplete={vi.fn()} />);
}

describe('OnboardingFlow', () => {
  it('renders a distinct entry screen with login and sign-up choices', () => {
    const html = render('entry');
    expect(html).toContain('Login');
    expect(html).toContain('Sign up');
    expect(html).toContain('1/4');
  });

  it('labels OTP verification honestly as a prototype in both account paths', () => {
    expect(render('login')).toContain('no real SMS is sent');
    expect(render('signup')).toContain('Country code');
    expect(render('signup')).toContain('Birthday');
    expect(render('signup')).toContain('Resend verification code');
    expect(render('signup')).toContain('disabled=""');
  });

  it('restores persisted signup country code and birthday values', () => {
    const html = renderToStaticMarkup(<OnboardingFlow initialStep="signup" initialAccount={{ countryCode: '+65', birthday: '1995-06-12' }} onAccountReady={vi.fn()} onTermsAccepted={vi.fn()} onComplete={vi.fn()} />);
    expect(html).toContain('value="+65"');
    expect(html).toContain('value="1995-06-12"');
  });

  it('requires explicit consent before terms can continue', () => {
    const html = render('terms');
    expect(html).toContain('Real-time location');
    expect(html).toContain('Notifications');
    expect(html).toContain('Camera');
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
