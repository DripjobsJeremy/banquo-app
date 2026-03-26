                    (() => {
                      if (scene.soundType === 'Musical Number') {
                        const sceneChars = scene.characters || [];
                        const currentPerformers = Array.isArray(scene.performers)
                          ? scene.performers
                          : (scene.artist || '').split(',').map(s => s.trim()).filter(Boolean);
                        const availableToAdd = sceneChars.filter(c => !currentPerformers.includes(c));
                        const isFullCompany = sceneChars.length > 0 && currentPerformers.length === sceneChars.length;
                        const updatePerformers = (updated) => {
                          handleUpdateScene(actIndex, sceneIndex, 'performers', updated);
                          handleUpdateScene(actIndex, sceneIndex, 'artist', updated.join(', '));
                        };
                        return React.createElement(
                          'div',
                          null,
                          React.createElement(
                            'div',
                            { className: 'flex items-center justify-between mb-2' },
                            React.createElement(
                              'label',
                              { className: 'text-xs font-medium', style: { color: 'var(--color-text-muted)' } },
                              '🎭 Performers'
                            ),
                            React.createElement(
                              'span',
                              { className: 'text-xs', style: { color: 'var(--color-text-muted)' } },
                              currentPerformers.length + ' of ' + sceneChars.length
                            )
                          ),
                          sceneChars.length === 0
                            ? React.createElement(
                                'p',
                                {
                                  className: 'text-xs px-3 py-2 rounded-lg',
                                  style: { color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }
                                },
                                'No characters in scene — add characters above first'
                              )
                            : React.createElement(
                                'div',
                                { className: 'space-y-2' },
                                React.createElement(
                                  'button',
                                  {
                                    type: 'button',
                                    onClick: () => updatePerformers(isFullCompany ? [] : [...sceneChars]),
                                    className: 'w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                    style: {
                                      backgroundColor: isFullCompany ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                                      color: isFullCompany ? '#ffffff' : 'var(--color-text-secondary)',
                                      border: '1px solid ' + (isFullCompany ? 'var(--color-primary)' : 'var(--color-border)'),
                                    }
                                  },
                                  isFullCompany ? '✓ Full Company' : '+ Full Company'
                                ),
                                currentPerformers.length > 0 && !isFullCompany
                                  ? React.createElement(
                                      'div',
                                      { className: 'flex flex-wrap gap-1' },
                                      currentPerformers.map(p =>
                                        React.createElement(
                                          'span',
                                          {
                                            key: p,
                                            className: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                            style: { backgroundColor: 'var(--color-primary-surface)', color: 'var(--color-primary)' }
                                          },
                                          p,
                                          React.createElement(
                                            'button',
                                            {
                                              type: 'button',
                                              onClick: () => updatePerformers(currentPerformers.filter(x => x !== p)),
                                              style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', lineHeight: 1, padding: '0 1px' }
                                            },
                                            '×'
                                          )
                                        )
                                      )
                                    )
                                  : null,
                                !isFullCompany && availableToAdd.length > 0
                                  ? React.createElement(
                                      'select',
                                      {
                                        value: '',
                                        onChange: (e) => {
                                          if (!e.target.value) return;
                                          updatePerformers([...currentPerformers, e.target.value]);
                                        },
                                        className: 'w-full px-3 py-2 rounded-lg text-sm',
                                        style: {
                                          backgroundColor: 'var(--color-bg-elevated)',
                                          color: 'var(--color-text-muted)',
                                          border: '1px solid var(--color-border)',
                                        }
                                      },
                                      React.createElement('option', { value: '' }, '+ Add performer...'),
                                      availableToAdd.map(char =>
                                        React.createElement('option', { key: char, value: char }, char)
                                      )
                                    )
                                  : null
                              )
                        );
                      }
                      return React.createElement(
                        'div',
                        null,
                        React.createElement('label', { className: 'block text-xs font-medium text-gray-600 mb-1' }, '🎤 Artist / Composer'),
                        React.createElement('input', {
                          type: 'text',
                          value: scene.artist || '',
                          onChange: (e) => handleUpdateScene(actIndex, sceneIndex, 'artist', e.target.value),
                          className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors',
                          placeholder: 'e.g., Stephen Sondheim'
                        })
                      );
                    })(),