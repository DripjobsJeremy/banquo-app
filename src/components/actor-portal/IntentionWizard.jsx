const { useState } = React;

const IW_STEPS = 8;

function IntentionWizard({ onClose }) {
  const [step, setStep] = useState(1);
  const [selectedIntention, setSelectedIntention] = useState(null);
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [asifNeed, setAsifNeed] = useState('');
  const [asifLife, setAsifLife] = useState('');
  const [asifResult, setAsifResult] = useState('');

  const goTo = (n) => setStep(n);

  const intentions = [
    { icon: '🫶', label: 'Comfort', desc: 'You want them to feel safe. To stop hurting. To know they are not alone.' },
    { icon: '👁', label: 'Manipulate', desc: 'You want something. The words are a lever. Emotion is the tool, not the truth.' },
    { icon: '🙏', label: 'Apologize', desc: 'You need them to forgive you. The words carry the weight of guilt and regret.' },
    { icon: '🔥', label: 'Seduce', desc: 'You want to draw them closer. Every syllable is a step across the distance.' },
    { icon: '🛡', label: 'Save', desc: 'It may be the last thing you say. You need them to hold on.' },
  ];

  const tactics = [
    { label: 'Charm', sub: 'Make her want to trust you.' },
    { label: 'Reason', sub: 'Give her evidence. Logic.' },
    { label: 'Plead', sub: 'Appeal to her sympathy.' },
    { label: 'Provoke', sub: 'Shake her into responding.' },
    { label: 'Confess', sub: 'Disarm her with honesty.' },
    { label: 'Withdraw', sub: 'Make her come to you.' },
  ];

  const openDoor = () => {
    const need = asifNeed.trim();
    const life = asifLife.trim();
    if (!need && !life) {
      setAsifResult('Fill in at least one field to open the door.');
      return;
    }
    let result = '';
    if (need && life) {
      result = `"Act as if ${need.toLowerCase().replace(/^i need /, 'you need ')} — the way you needed ${life.toLowerCase().replace(/^when /, '')}"`;
    } else if (need) {
      result = `"Play it as if everything depends on ${need.toLowerCase().replace(/^i need /, '')}. Make it that urgent."`;
    } else {
      result = `"Bring that feeling — ${life.toLowerCase()} — into the room with you. That's the emotional truth of the scene."`;
    }
    setAsifResult(result);
  };

  const restart = () => {
    setSelectedIntention(null);
    setSelectedTactic(null);
    setAsifNeed('');
    setAsifLife('');
    setAsifResult('');
    setStep(1);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">The Green Room</div>
          <div className="text-lg font-bold text-gray-900">Intention Wizard</div>
        </div>
        <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 border border-gray-300 rounded-full">
          ✕ Close
        </button>
      </div>

      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: IW_STEPS }, (_, i) => i + 1).map(n => (
          <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? '' : 'bg-gray-200'}`} style={n <= step ? { backgroundColor: 'var(--color-accent-crimson)' } : {}} />
        ))}
      </div>

      <div className="flex items-center justify-between mb-6 text-xs text-gray-400">
        <span>Content inspired by Inspire Actors UK</span>
        <a
          href="https://www.instagram.com/inspireactorsuk?igsh=MW93aHZzMGE4czB0Ng=="
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-colors no-underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span className="font-medium">@inspireactorsuk</span>
        </a>
      </div>

      {step === 1 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Step 1 of 8 — The foundation</div>
          <h2 className="text-3xl font-serif text-gray-900 mb-4">Emotion follows intention.</h2>
          <p className="text-gray-600 mb-5">Human behavior doesn't begin with feeling. It begins somewhere else entirely.</p>
          <ul className="mb-6 space-y-0">
            {['Before there is emotion.', 'Before there is action.', 'Before there is performance.'].map((t, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-100 text-gray-700">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-accent-crimson)' }} />{t}
              </li>
            ))}
          </ul>
          <p className="text-gray-600 mb-6">There is <strong className="text-gray-900">imagination.</strong> There is <strong className="text-gray-900">intention.</strong></p>
          <button type="button" onClick={() => goTo(2)} className="px-7 py-3 iw-btn-crimson text-white rounded-xl font-medium">Keep going →</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Step 2 of 8 — The same words</div>
          <div className="text-center italic text-2xl text-gray-900 bg-gray-50 border border-gray-200 rounded-2xl p-7 mb-6">"I love you."</div>
          <p className="text-gray-600 mb-5">Three words. And yet — how many ways can they be performed?</p>
          <p className="text-xl font-serif text-gray-900 mb-6">Why are there so many different ways to say the same words?</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => goTo(1)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl">← Back</button>
            <button type="button" onClick={() => goTo(3)} className="px-7 py-3 iw-btn-crimson text-white rounded-xl font-medium">Find out →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Step 3 of 8 — The discovery</div>
          <p className="text-gray-600 mb-5">Because <strong className="text-gray-900">words never determine the performance.</strong> The <em>intention</em> behind them does.</p>
          <p className="text-gray-600 mb-4">You can say "I love you" to:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
            {intentions.map(opt => (
              <div
                key={opt.label}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedIntention(opt)}
                className={`flex flex-col items-center justify-center gap-2 text-center p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[88px] ${
                  selectedIntention?.label === opt.label ? 'iw-card-crimson-selected' : 'border-gray-200 bg-white iw-card-gold-hover'
                }`}
              >
                <div className="text-2xl">{opt.icon}</div>
                <div className="text-sm font-medium text-gray-900">{opt.label}</div>
              </div>
            ))}
          </div>
          {selectedIntention && (
            <div className="border-l-4 rounded-r-xl p-4 mb-5" style={{ borderColor: 'var(--color-accent-crimson)', backgroundColor: 'rgba(139, 26, 43, 0.08)' }}>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Your intention</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">{selectedIntention.label}</div>
              <div className="text-sm text-gray-600">{selectedIntention.desc}</div>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => goTo(2)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl">← Back</button>
            <button type="button" onClick={() => goTo(4)} className="px-7 py-3 iw-btn-crimson text-white rounded-xl font-medium">Same words. Different performance. →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Step 4 of 8 — The insight</div>
          <p className="text-xl font-serif text-gray-900 mb-6">Same words. Different intentions. Different performances.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5 space-y-2.5">
            <p className="text-sm text-gray-600">Great acting doesn't begin with: <em>"How should I feel?"</em></p>
            <p className="text-sm text-gray-600">It begins with understanding <strong className="text-gray-900">why your character is communicating</strong> in the first place.</p>
          </div>
          <p className="text-gray-600 mb-6">Emotions are a byproduct — the exhaust of genuine intention pursued through imagination. Chase the feeling and you perform a demonstration. Chase the intention and the feeling arrives on its own.</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => goTo(3)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl">← Back</button>
            <button type="button" onClick={() => goTo(5)} className="px-7 py-3 iw-btn-crimson text-white rounded-xl font-medium">How do I find the right intention? →</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Step 5 of 8 — Finding the intention</div>
          <p className="text-gray-600 mb-4">There is no single <em>right</em> intention waiting to be discovered. There's the most <strong className="text-gray-900">useful</strong> one — the one that makes the scene live.</p>
          <p className="text-gray-600 mb-4">Start here:</p>
          <div className="space-y-2.5 mb-5">
            {[
              ['Step 1', 'Inhabit the given circumstances. Where are you? What just happened? What do you believe is true right now?'],
              ['Step 2', 'Ask: what does my character need the other person to do, feel, or believe by the end of this scene?'],
              ['Step 3', '"I need him to admit he was wrong so I can stop feeling like I\'m losing my mind" beats "I want him to understand."'],
              ['Step 4', 'Test it against the text. A good intention makes the scene harder, not easier — it should create genuine obstacles.'],
            ].map(([label, text]) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--color-accent-crimson)' }}>{label}</div>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mb-6">Intentions are <strong className="text-gray-900">transitive</strong> — they land on the other person. "I feel guilty" is a state. "I need her to forgive me" is an intention. States are passive. Intentions are active.</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => goTo(4)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl">← Back</button>
            <button type="button" onClick={() => goTo(6)} className="px-7 py-3 iw-btn-crimson text-white rounded-xl font-medium">But what if it feels abstract? →</button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Step 6 of 8 — Tactics</div>
          <p className="text-gray-600 mb-4">Intentions don't stay static. You try something — it doesn't work — you try something else.</p>
          <p className="text-sm text-gray-600 mb-3">These are called <strong className="text-gray-900">tactics</strong>: the different ways you pursue the same underlying want.</p>
          <p className="text-sm text-gray-600 mb-5">Say your intention is: <em>"I need her to trust me."</em> You might try:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {tactics.map(t => (
              <div
                key={t.label}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTactic(t.label)}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedTactic === t.label ? 'iw-card-crimson-selected' : 'border-gray-200 bg-white iw-card-gold-hover'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900 mb-1">{t.label}</div>
                <div className="text-xs text-gray-600">{t.sub}</div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5">
            <p className="text-sm text-gray-600">If you play the same thing at the same intensity from top to bottom, you've locked onto a <em>result</em>, not a live intention. Stay responsive. Let your partner's behavior change your tactics — not your want.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => goTo(5)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl">← Back</button>
            <button type="button" onClick={() => goTo(7)} className="px-7 py-3 iw-btn-crimson text-white rounded-xl font-medium">The "as if" door →</button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Step 7 of 8 — The "as if" door</div>
          <p className="text-gray-600 mb-4">If the scene's circumstances feel distant or abstract, run them through an <em>as if.</em></p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5">
            <p className="text-sm text-gray-600">You don't need to have been betrayed by a king to play Hamlet. But you've probably known what it feels like when everyone around you is pretending something false is true. Find the bridge from your life to theirs.</p>
          </div>
          <p className="text-sm text-gray-600 mb-5">Try it now. Fill in what you know about your scene and let the door open.</p>
          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">What does your character need from the other person in this scene?</label>
              <input
                type="text"
                value={asifNeed}
                onChange={e => setAsifNeed(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent-gold)'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                placeholder="e.g. I need her to believe I didn't betray her"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">When in your own life have you needed something like that?</label>
              <input
                type="text"
                value={asifLife}
                onChange={e => setAsifLife(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent-gold)'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                placeholder="e.g. When I was accused of something I didn't do…"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none"
              />
            </div>
          </div>
          <button type="button" onClick={openDoor} className="px-7 py-3 bg-gray-900 hover:opacity-90 text-white rounded-xl font-medium mb-5">Open the door ✦</button>
          {asifResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5">
              <div className="inline-block text-xs font-semibold rounded-full px-3 py-0.5 mb-2.5" style={{ backgroundColor: 'rgba(201, 169, 97, 0.18)', color: 'var(--color-accent-crimson)' }}>Your "as if"</div>
              <p className="text-lg text-gray-900 italic">{asifResult}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => goTo(6)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl">← Back</button>
            <button type="button" onClick={() => goTo(8)} className="px-7 py-3 iw-btn-crimson text-white rounded-xl font-medium">Bring it together →</button>
          </div>
        </div>
      )}

      {step === 8 && (
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: 'var(--color-accent-crimson)' }}>Step 8 of 8 — Your practice</div>
          <p className="text-xl font-serif text-gray-900 mb-6">Every time you approach a line, a scene, a role — work through this sequence.</p>
          <div className="space-y-2.5 mb-6">
            {[
              ['1', 'What are my given circumstances? What do I know to be true right now?'],
              ['2', 'What am I trying to do to the other person?'],
              ['3', 'What matters to me — specifically, personally, urgently?'],
              ['4', 'When in my life have I needed something like this? (The "as if" door.)'],
              ['5', 'What tactics am I using — and what happens when they don\'t work?'],
            ].map(([n, text]) => (
              <div key={n} className="flex items-start gap-3.5 bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-7 h-7 rounded-full text-white text-xs font-semibold flex items-center justify-content-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--color-accent-crimson)' }}>{n}</div>
                <div className="text-sm text-gray-600">{text}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mb-7">Human behavior is driven by imagination and intention. So is great acting.</p>
          <hr className="border-gray-200 mb-7" />
          <div className="flex gap-3">
            <button type="button" onClick={() => goTo(7)} className="px-6 py-3 bg-white border border-gray-300 rounded-xl">← Back</button>
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

window.IntentionWizard = IntentionWizard;
console.log('✅ IntentionWizard component loaded');
