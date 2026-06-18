const { } = React;

function ActorResourcesView({ onLaunchIntentionWizard }) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-sm text-gray-500 mt-1">Tools to deepen your craft and sharpen your work.</p>
      </div>

      <div className="space-y-3 max-w-2xl">
        <button
          type="button"
          onClick={onLaunchIntentionWizard}
          className="w-full flex items-center gap-4 bg-white rounded-lg p-5 shadow-sm border border-gray-200 iw-card-gold-hover hover:shadow-md transition-all text-left"
        >
          <div className="text-3xl flex-shrink-0">🎭</div>
          <div className="flex-1">
            <div className="text-base font-semibold text-gray-900 mb-1">Intention Wizard</div>
            <div className="text-sm text-gray-600 leading-relaxed">
              An 8-step guided practice for finding the active intention behind any scene or line. Based on the foundational acting principle: emotion follows intention.
            </div>
          </div>
          <div className="text-2xl text-gray-300 flex-shrink-0">›</div>
        </button>
      </div>
    </div>
  );
}

window.ActorResourcesView = ActorResourcesView;
