const { useState } = React;

const BAW_STEPS = 9;

function BadActorWizard({ onClose }) {
  const [step, setStep] = useState(1);

  const goTo = (n) => setStep(n);

  const restart = () => setStep(1);

  const signs = [
    {
      n: 1,
      title: 'You decide the emotion before the scene starts.',
      bad: '"This scene is angry."',
      body: "That's where most actors go wrong. Instead, pursue an objective. Emotion is the result, not the plan.",
    },
    {
      n: 2,
      title: 'You wait for your turn to speak.',
      bad: null,
      body: "Most actors aren't listening. They're rehearsing their next line while the other person is talking. The scene dies the moment listening stops.",
    },
    {
      n: 3,
      title: 'Every scene looks like you.',
      bad: 'Different character. Same voice. Same posture. Same rhythm.',
      body: "You're not transforming. You're repeating yourself.",
    },
    {
      n: 4,
      title: 'You force pauses.',
      bad: 'You learned that good actors pause. Now every silence feels planned.',
      body: "A pause isn't a technique. It's the result of a real thought happening.",
    },
    {
      n: 5,
      title: 'You show the emotion instead of experiencing it.',
      bad: 'Showing sadness. Showing anger. Showing love.',
      body: 'The audience sees the effort. Not the truth.',
    },
    {
      n: 6,
      title: 'You judge your character.',
      bad: 'The moment you think "My character is wrong."',
      body: "You stop defending their reality. Great actors don't judge. They understand.",
    },
    {
      n: 7,
      title: 'You focus more on the audience than the moment.',
      bad: 'Thinking: "How do I look?" Instead of: "What do I want?"',
      body: 'The audience watches the scene. You watch yourself.',
    },
    {
      n: 8,
      title: 'You leave the scene exactly as you entered it.',
      bad: 'Nothing changes. No discovery. No shift. No consequences.',
      body: "If the character isn't affected, the scene usually isn't either.",
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">The Green Room</div>
          <div className="text-lg font-bold text-gray-900">8 Signs of a Bad Actor</div>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 border border-gray-300 rounded-full">
          ✕ Close
        </button>
      </div>

      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: BAW_STEPS }, (_, i) => i + 1).map(n => (
          <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? '' : 'bg-gray-200'}`} style={n <= step ? { backgroundColor: 'var(--color-accent-crimson)' } : {}} />
        ))}
      </div>

      <div className="flex items-center justify-between mb-6 text-xs text-gray-400">
        <span>Content inspired by Actorisation</span>

          href="https://www.instagram.com/actorisation"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-colors no-underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span className="font-medium">@actorisation</span>
        </a>
      </div>

      {step === 1 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Introduction</div>
          <h2 className="text-3xl font-serif text-gray-900 mb-4">Most actors don't even realize they're doing these.</h2>
          <p className="text-gray-600 mb-6">Eight habits that quietly undercut a performance — and the shift that fixes each one. Go through them honestly. The goal isn't to feel bad about what you find. It's to notice it sooner next time.</p>
          <button type="button" onClick={() => goTo(2)} className="px-7 py-3 iw-btn-crimson text-white rounded-xl font-medium">Begin →</button>
        </div>
      )}

      {signs.map(sign => (
        step === sign.n + 1 && (
          <div key={sign.n}>
            <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Sign {sign.n} of 8</div>
            <h2 className="text-2xl font-serif text-gray-900 mb-4">{sign.title}</h2>
            {sign.bad && (
              <div className="text-gray-700 italic bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-5">{sign.bad}</div>
            )}
            <p className="text-gray-600 mb-6">{sign.body}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => goTo(sign.n)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl">← Back</button>
              <button type="button" onClick={() => goTo(sign.n + 2)} className="px-7 py-3 iw-btn-crimson text-white rounded-xl font-medium">
                {sign.n < 8 ? 'Next sign →' : 'Finish →'}
              </button>
            </div>
          </div>
        )
      ))}

      {step === 9 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>The takeaway</div>
          <h2 className="text-3xl font-serif text-gray-900 mb-4">The best actors aren't perfect.</h2>
          <p className="text-xl text-gray-700 mb-7">They simply notice their mistakes sooner.</p>
          <hr className="border-gray-200 mb-7" />
          <div className="flex gap-3">
            <button type="button" onClick={() => goTo(8)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl">← Back</button>
            <button
              type="button"
              onClick={restart}
              className="px-7 py-3 bg-white rounded-xl font-medium"
              style={{ borderColor: 'var(--color-accent-crimson)', borderWidth: '2px', color: 'var(--color-accent-crimson)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(139, 26, 43, 0.06)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >↩ Start again</button>
          </div>
        </div>
      )}
    </div>
  );
}

window.BadActorWizard = BadActorWizard;
console.log('✅ BadActorWizard component loaded');
