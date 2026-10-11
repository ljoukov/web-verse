const BRANDS = {
  stillwater: { name: 'Stillwater', full: 'Stillwater Plumbing', person: 'Wren', letter: 's.', address: 'stillwater', className: 'stillwater', note: 'Thoughtful plumbing & fittings', welcome: 'Hello, I’m Wren. I can help with specifications, an itemized estimate, and the right fitting for your room.' },
  goodhands: { name: 'GoodHands', full: 'GoodHands', person: 'Kit', letter: '✳', address: 'goodhands', className: 'goodhands', note: 'Installation & the finishing touches', welcome: 'Hey, I’m Kit! Tell me what you have in mind. We can talk through installation, bundles, and availability.' },
  formfield: { name: 'Form & Field', full: 'Form & Field', person: 'Ada', letter: 'f/f', address: 'formfield', className: 'formfield', note: 'Considered materials & furniture', welcome: 'I’m Ada. Let’s find the materials and pieces that work together, then prepare a clear specification.' },
  webverse: { name: 'WebVerse', person: 'WebVerse', letter: '✧', className: 'webverse' },
};

const ICONS = {
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  shield: '<path d="M12 3 4 6v6c0 4 8 9 8 9s8-5 8-9V6Z"/><path d="m8.5 12 2.3 2.3 4.7-4.7"/>',
  eye: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  block: '<circle cx="12" cy="12" r="8"/><path d="m6.5 6.5 11 11"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3A7 7 0 0 0 18 17"/>',
  message: '<path d="M20 15a3 3 0 0 1-3 3H9l-5 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3Z"/><path d="M8 8h8M8 12h5"/>',
  graph: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><path d="M7 5h4v14H7m4-7h6"/>',
};

const KINDS = {
  read: { label: 'Read', icon: 'eye' },
  message: { label: 'Received', icon: 'message' },
  compose: { label: 'Rehearsal', icon: 'message' },
  forecast: { label: 'Projected reply', icon: 'message' },
  review: { label: 'Review', icon: 'shield' },
  blocked: { label: 'Blocked', icon: 'block' },
  commit: { label: 'Allowed', icon: 'check' },
  refresh: { label: 'Refreshed', icon: 'refresh' },
};

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.message}</svg>`;

function graphMarkup() {
  return `<div class="wv-inspector-graph-heading"><div><span class="wv-inspector-eyebrow">THE DECISION PATH</span><h3>A little foresight.<br>A deliberate next step.</h3></div><p>Explore the whole conversation. Review the consequences. Release one authorized action, then begin again with what actually happened.</p></div>
  <div class="wv-inspector-graph-canvas"><svg viewBox="0 60 900 310" role="img" aria-labelledby="wv-graph-title wv-graph-description">
    <title id="wv-graph-title">WebVerse reviews a rehearsal before releasing an external action</title><desc id="wv-graph-description">User instructions lead to rehearsal and review. Unsafe disclosures and premature bookings are rejected, prompting a revised rehearsal. Authorized requests are committed one at a time, and actual responses refresh the next rehearsal.</desc>
    <defs><marker id="wv-graph-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="m0 0 10 5-10 5Z" fill="currentColor"/></marker><pattern id="wv-graph-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#d4d9cf"/></pattern></defs>
    <rect width="900" height="410" fill="url(#wv-graph-grid)"/>
    <g class="wv-inspector-graph-edges" fill="none" stroke="currentColor" stroke-width="1.3" marker-end="url(#wv-graph-arrow)"><path d="M174 132h34"/><path d="M356 132h34"/><path d="M539 132h35"/><path d="M720 132h35"/><path class="wv-inspector-graph-return" d="M816 166v186H278V171"/><path class="wv-inspector-graph-reject-edge" d="M465 170v57"/><path class="wv-inspector-graph-reject-edge" d="M390 270H279v-99"/></g>
    <text x="487" y="204" class="wv-inspector-graph-edge-label">outside your instructions</text><text x="436" y="343" class="wv-inspector-graph-edge-label">actual response → new rehearsal</text><text x="300" y="257" class="wv-inspector-graph-edge-label">revise</text>
    <g class="wv-inspector-graph-node" data-node="instructions" transform="translate(26 94)"><rect width="148" height="76" rx="12"/><text x="16" y="27" class="wv-inspector-graph-node-label">Your instructions</text><text x="16" y="49" class="wv-inspector-graph-node-sub">The source of authority</text></g>
    <g class="wv-inspector-graph-node" data-node="rehearsal" transform="translate(208 94)"><rect width="148" height="76" rx="12"/><circle cx="18" cy="-13" r="4"/><text x="30" y="-9" class="wv-inspector-graph-step">01</text><text x="16" y="27" class="wv-inspector-graph-node-label">Rehearsal</text><text x="16" y="49" class="wv-inspector-graph-node-sub">Follow the conversation</text></g>
    <g class="wv-inspector-graph-node" data-node="review" transform="translate(390 94)"><rect width="149" height="76" rx="12"/><circle cx="18" cy="-13" r="4"/><text x="30" y="-9" class="wv-inspector-graph-step">02</text><text x="16" y="27" class="wv-inspector-graph-node-label">Review</text><text x="16" y="49" class="wv-inspector-graph-node-sub">Judge the whole trajectory</text></g>
    <g class="wv-inspector-graph-node" data-node="commit" transform="translate(574 94)"><rect width="146" height="76" rx="12"/><circle cx="18" cy="-13" r="4"/><text x="30" y="-9" class="wv-inspector-graph-step">03</text><text x="16" y="27" class="wv-inspector-graph-node-label">Commit</text><text x="16" y="49" class="wv-inspector-graph-node-sub">One authorized action</text></g>
    <g class="wv-inspector-graph-node" data-node="refresh" transform="translate(754 94)"><rect width="120" height="76" rx="12"/><circle cx="18" cy="-13" r="4"/><text x="30" y="-9" class="wv-inspector-graph-step">04</text><text x="16" y="27" class="wv-inspector-graph-node-label">Refresh</text><text x="16" y="49" class="wv-inspector-graph-node-sub">Observe & restart</text></g>
    <g class="wv-inspector-graph-node wv-inspector-graph-reject" data-node="blocked" transform="translate(390 228)"><rect width="233" height="83" rx="12"/><text x="16" y="28" class="wv-inspector-graph-node-label">Branch rejected</text><text x="16" y="49" class="wv-inspector-graph-node-sub">Sensitive disclosure · premature booking</text><text x="16" y="67" class="wv-inspector-graph-node-sub">Nothing from this branch leaves WebVerse</text></g>
  </svg></div>
  <div class="wv-inspector-graph-notes"><article><span>01 / SEE AHEAD</span><h4>Consequences, in context.</h4><p>A friendly offer can lead to a deposit, or a question can become a request for credentials. The complete trajectory makes that visible.</p></article><article><span>02 / KEEP THE BOUNDARY</span><h4>Your intent stays in charge.</h4><p>Vendor persuasion does not grant permission. Messages, bookings, payments, and personal details each cross an explicit boundary.</p></article><article><span>03 / STAY GROUNDED</span><h4>One effect. Fresh context.</h4><p>After an approved action, the next rehearsal starts from the actual response. Earlier predictions are left behind.</p></article></div>`;
}

export function createActivityPanel() {
  let events = [];
  let currentPhase = 'ready';
  let previousFocus = null;
  let previousOverflow = '';
  let wasOpen = false;
  const element = document.createElement('div');
  element.className = 'wv-inspector';
  element.hidden = true;
  element.innerHTML = `<button class="wv-inspector-backdrop" aria-label="Close agent activity" tabindex="-1"></button><section class="wv-inspector-panel" role="dialog" aria-modal="true" aria-labelledby="wv-inspector-title" tabindex="-1">
    <header class="wv-inspector-header"><div class="wv-inspector-header-top"><span class="wv-inspector-eyebrow">WEBVERSE / AGENT WORKSPACE</span><button class="wv-inspector-close" aria-label="Close agent activity">${icon('close')}</button></div><div class="wv-inspector-heading"><div><h2 id="wv-inspector-title">Behind the conversation.</h2><p>A clear view of every conversation, decision, and boundary.</p></div><span class="wv-inspector-session-status"><i></i><span data-session-label>Ready when you are</span></span></div></header>
    <nav class="wv-inspector-tabs" role="tablist" aria-label="Agent workspace views"><button id="wv-tab-activity" role="tab" aria-controls="wv-pane-activity" aria-selected="true" data-tab="activity">${icon('eye')}Activity<span data-event-count>0</span></button><button id="wv-tab-vendors" role="tab" aria-controls="wv-pane-vendors" aria-selected="false" tabindex="-1" data-tab="vendors">${icon('message')}Vendor rooms</button><button id="wv-tab-graph" role="tab" aria-controls="wv-pane-graph" aria-selected="false" tabindex="-1" data-tab="graph">${icon('graph')}Decision graph</button></nav>
    <div class="wv-inspector-body"><section id="wv-pane-activity" role="tabpanel" aria-labelledby="wv-tab-activity" data-pane="activity"><div class="wv-inspector-activity-grid"><div class="wv-inspector-timeline-section"><div class="wv-inspector-section-label"><span>THE ACTIVITY TRAIL</span><span data-trail-count>Awaiting your question</span></div><div class="wv-inspector-timeline" aria-live="polite" aria-relevant="additions"><div class="wv-inspector-empty">${icon('message')}<h3>Every step has a story.</h3><p>Ask WebVerse a question to follow its conversations and decisions here.</p><span>Read → Rehearse → Review → Act</span></div></div></div><aside class="wv-inspector-boundary"><div class="wv-inspector-boundary-icon">${icon('shield')}</div><span class="wv-inspector-eyebrow">YOUR INTENT, PROTECTED</span><h3>Look ahead.<br>Then take one step.</h3><p>WebVerse reviews a complete rehearsal before allowing an action to reach a website.</p><div class="wv-inspector-phase-list"><div data-phase="rehearsal"><span>01</span><div><strong>Rehearsal</strong><small>Explore where an action leads</small></div><i></i></div><div data-phase="review"><span>02</span><div><strong>Review</strong><small>Check the full trajectory</small></div><i></i></div><div data-phase="commit"><span>03</span><div><strong>Commit</strong><small>Release one allowed action</small></div><i></i></div><div data-phase="refresh"><span>04</span><div><strong>Refresh</strong><small>Start from the actual response</small></div><i></i></div></div><div class="wv-inspector-counts"><div><strong data-allowed-count>0</strong><span>allowed actions</span></div><div><strong data-blocked-count>0</strong><span>protected boundaries</span></div></div><div class="wv-inspector-boundary-foot">${icon('shield')}<span>Booking and payment always stay within your instructions.</span></div></aside></div></section>
    <section id="wv-pane-vendors" role="tabpanel" aria-labelledby="wv-tab-vendors" data-pane="vendors" hidden><div class="wv-inspector-room-intro"><div><span class="wv-inspector-eyebrow">THREE WEBSITES. ONE INTENTION.</span><h3>At the other end.</h3></div><p>See what each website says, what your agent considers, and what it actually sends.</p></div><div class="wv-inspector-rooms">${Object.entries(BRANDS).filter(([key]) => key !== 'webverse').map(([key, brand]) => `<article class="wv-inspector-room wv-inspector-room-${key}"><header><div class="wv-inspector-room-brand"><span>${brand.letter}</span><div><strong>${brand.name}</strong><small>${brand.person} · Website agent</small></div><a href="/${brand.address}/" target="_blank" rel="noopener noreferrer" aria-label="Open ${brand.full} website">${icon('arrow')}</a></div><p>${brand.note}</p><div class="wv-inspector-room-status"><i></i><span data-room-status="${key}">Conversation ready</span></div></header><div class="wv-inspector-room-messages" data-room="${key}"></div><footer><span>Visible to you</span><span data-room-count="${key}">0 actions released</span></footer></article>`).join('')}</div><div class="wv-inspector-room-legend"><span><i class="wv-inspector-legend-incoming"></i>Website reply</span><span><i class="wv-inspector-legend-rehearsal"></i>Agent rehearsal</span><span><i class="wv-inspector-legend-blocked"></i>Blocked before sending</span><span><i class="wv-inspector-legend-committed"></i>Released to website</span></div></section>
    <section id="wv-pane-graph" role="tabpanel" aria-labelledby="wv-tab-graph" data-pane="graph" hidden>${graphMarkup()}</section></div>
    <footer class="wv-inspector-footer"><span>${icon('shield')}Your brief is the source of authority.</span><span class="wv-inspector-footer-right">A thoughtful step, every time.<span>✧</span></span></footer></section>`;

  const $ = selector => element.querySelector(selector);
  const $$ = selector => [...element.querySelectorAll(selector)];
  const timeline = $('.wv-inspector-timeline');

  function seedRooms() {
    Object.entries(BRANDS).filter(([key]) => key !== 'webverse').forEach(([key, brand]) => {
      $(`[data-room="${key}"]`).innerHTML = `<div class="wv-inspector-room-context"><span>THE BRIEF</span>Gather options and itemized quotes. No booking or payment without permission.</div><div class="wv-inspector-bubble wv-inspector-bubble-incoming wv-inspector-bubble-seed"><span>${brand.person}</span><p>${brand.welcome}</p></div>`;
    });
  }

  function selectTab(name) {
    const aliases = { 'vendor rooms': 'vendors', 'vendor-rooms': 'vendors', rooms: 'vendors', 'decision graph': 'graph', 'decision-graph': 'graph', decision: 'graph' };
    const tabName = aliases[String(name).toLowerCase()] || name;
    const current = ['activity', 'vendors', 'graph'].includes(tabName) ? tabName : 'activity';
    const previous = $('[data-tab][aria-selected="true"]')?.dataset.tab;
    $$('[data-tab]').forEach(button => { const selected = button.dataset.tab === current; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
    $$('[data-pane]').forEach(pane => { pane.hidden = pane.dataset.pane !== current; });
    if (previous !== current) $('.wv-inspector-body').scrollTop = 0;
    if (current === 'vendors' && !element.hidden) requestAnimationFrame(revealVendorIncident);
    return current;
  }

  function revealVendorIncident() {
    if (element.hidden || $('[data-pane="vendors"]').hidden) return;
    const room = $('[data-room="goodhands"]');
    const blocked = [...room.querySelectorAll('[data-kind="blocked"]')].at(-1);
    if (!blocked) return;
    let context = blocked;
    let preceding = blocked.previousElementSibling;
    while (preceding && preceding.dataset.kind !== 'blocked') {
      if (preceding.dataset.kind === 'message') { context = preceding; break; }
      preceding = preceding.previousElementSibling;
    }
    const roomRect = room.getBoundingClientRect();
    const contextTop = context.getBoundingClientRect().top - roomRect.top + room.scrollTop;
    const blockedBottom = blocked.getBoundingClientRect().bottom - roomRect.top + room.scrollTop;
    // Keep the refusal fully in view, with the vendor's pressure above it whenever it fits.
    const scrollTop = blockedBottom - contextTop <= room.clientHeight - 24
      ? contextTop - 12
      : blockedBottom - room.clientHeight + 18;
    room.scrollTo({ top: Math.max(0, scrollTop), behavior: 'instant' });
    room.querySelectorAll('.is-incident-focus').forEach(node => node.classList.remove('is-incident-focus'));
    blocked.classList.add('is-incident-focus');
    const card = room.closest('.wv-inspector-room');
    if (window.innerWidth > 640) {
      const body = $('.wv-inspector-body');
      const top = card.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 8;
      body.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    } else {
      const rooms = $('.wv-inspector-rooms');
      const left = card.getBoundingClientRect().left - rooms.getBoundingClientRect().left + rooms.scrollLeft;
      rooms.scrollTo({ left, behavior: 'instant' });
    }
  }

  function open(tabName = 'activity') {
    const tab = selectTab(tabName);
    if (!element.isConnected) document.body.append(element);
    if (!wasOpen) { previousFocus = document.activeElement; previousOverflow = document.body.style.overflow; }
    wasOpen = true;
    element.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      element.classList.add('is-open');
      $('.wv-inspector-close').focus({ preventScroll: true });
      if (tab === 'vendors') requestAnimationFrame(revealVendorIncident);
    });
  }

  function close() {
    element.classList.remove('is-open');
    element.hidden = true;
    if (wasOpen) document.body.style.overflow = previousOverflow;
    wasOpen = false;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }

  function setPhase(phase) {
    const value = String(phase || 'ready').toLowerCase();
    const phaseMap = { reading: 'rehearsal', searching: 'rehearsal', gathering: 'rehearsal', read: 'rehearsal', message: 'rehearsal', compose: 'rehearsal', forecast: 'rehearsal', composing: 'rehearsal', thinking: 'rehearsal', retry: 'rehearsal', reviewing: 'review', blocked: 'review', committing: 'commit', allowed: 'commit', refreshing: 'refresh', complete: 'complete', done: 'complete' };
    currentPhase = phaseMap[value] || value;
    const labels = { ready: 'Ready when you are', rehearsal: 'Exploring the conversation', review: 'Reviewing the trajectory', commit: 'Releasing an allowed action', refresh: 'Refreshing the context', complete: 'All caught up' };
    $('[data-session-label]').textContent = currentPhase === 'ready' && events.length ? 'Review complete' : labels[currentPhase] || phase;
    $('.wv-inspector-session-status').classList.toggle('is-active', !['ready', 'complete'].includes(currentPhase));
    $$('[data-phase]').forEach(row => row.classList.toggle('is-current', row.dataset.phase === currentPhase));
    $$('[data-node]').forEach(node => node.classList.toggle('is-current', node.dataset.node === (value === 'blocked' ? 'blocked' : currentPhase)));
  }

  function safeText(value) {
    // The inspector never renders full payment credentials, including in expandable details.
    return String(value ?? '').replace(/\b(?:\d[ -]?){12,18}\d\b/g, '•••• •••• •••• 4242');
  }

  function addRoomEvent(event) {
    if (!BRANDS[event.vendor] || event.vendor === 'webverse') return;
    const brand = BRANDS[event.vendor];
    const room = $(`[data-room="${event.vendor}"]`);
    const bubble = document.createElement('div');
    const variant = event.kind === 'blocked' ? 'blocked' : event.kind === 'commit' ? 'committed' : ['compose', 'forecast', 'review'].includes(event.kind) ? 'rehearsal' : 'incoming';
    const speaker = event.kind === 'blocked' ? 'WebVerse · boundary protected' : event.kind === 'commit' ? 'WebVerse · sent to website' : event.kind === 'review' ? 'WebVerse · trajectory review' : event.kind === 'compose' ? 'WebVerse · considering' : event.kind === 'forecast' ? `${brand.person} · projected reply` : brand.person;
    bubble.className = `wv-inspector-bubble wv-inspector-bubble-${variant}`;
    bubble.dataset.kind = event.kind;
    bubble.dataset.eventId = event.id;
    bubble.innerHTML = `<span>${event.kind === 'blocked' ? icon('shield') : event.kind === 'commit' ? icon('check') : ''}${esc(speaker)}</span><p>${esc(event.detail || event.title)}</p>${event.kind === 'blocked' ? '<small>Stopped before leaving WebVerse</small>' : event.kind === 'compose' ? '<small>Rehearsal · not sent</small>' : event.kind === 'forecast' ? '<small>Private branch · not sent</small>' : ''}`;
    room.append(bubble);
    const count = events.filter(item => item.vendor === event.vendor && item.kind === 'commit').length;
    $(`[data-room-count="${event.vendor}"]`).textContent = `${count} action${count === 1 ? '' : 's'} released`;
    $(`[data-room-status="${event.vendor}"]`).textContent = event.kind === 'blocked' ? 'Boundary protected' : event.kind === 'commit' ? 'Request delivered' : ['compose', 'forecast'].includes(event.kind) ? 'Exploring a response' : event.kind === 'review' ? 'Under review' : 'Conversation in progress';
    requestAnimationFrame(() => { room.scrollTo({ top: room.scrollHeight, behavior: element.hidden ? 'instant' : 'smooth' }); });
  }

  function addEvent(input) {
    const event = { id: input.id || `step-${events.length + 1}`, vendor: BRANDS[input.vendor] ? input.vendor : 'webverse', kind: KINDS[input.kind] ? input.kind : 'read', title: safeText(input.title || 'Agent activity'), detail: safeText(input.detail || ''), time: input.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) };
    if (events.some(item => item.id === event.id)) return;
    events.push(event);
    $('.wv-inspector-empty')?.remove();
    const kind = KINDS[event.kind];
    const row = document.createElement('details');
    row.className = `wv-inspector-event wv-inspector-event-${event.kind}`;
    row.dataset.eventId = event.id;
    if (event.kind === 'blocked') row.open = true;
    row.innerHTML = `<summary><span class="wv-inspector-event-marker">${icon(kind.icon)}</span><div class="wv-inspector-event-copy"><div class="wv-inspector-event-meta"><span class="wv-inspector-vendor-tag wv-inspector-vendor-${event.vendor}">${esc(BRANDS[event.vendor].name)}</span><time>${esc(event.time)}</time><span class="wv-inspector-event-number">${String(events.length).padStart(2, '0')}</span></div><h4>${esc(event.title)}</h4><div class="wv-inspector-event-bottom"><span class="wv-inspector-event-badge">${kind.icon === 'check' || event.kind === 'blocked' ? icon(kind.icon) : ''}${kind.label}</span><span class="wv-inspector-event-expand">Details <span>+</span></span></div></div></summary><div class="wv-inspector-event-detail"><p>${esc(event.detail || event.title)}</p>${event.kind === 'blocked' ? '<div class="wv-inspector-block-note">'+icon('shield')+'<span>This action was stopped before it reached the website.</span></div>' : event.kind === 'commit' ? '<div class="wv-inspector-allow-note">'+icon('check')+'<span>One action released. The next rehearsal uses the actual response.</span></div>' : ''}</div>`;
    timeline.append(row);
    $('[data-event-count]').textContent = events.length;
    $('[data-trail-count]').textContent = `${events.length} step${events.length === 1 ? '' : 's'} recorded`;
    $('[data-allowed-count]').textContent = events.filter(item => item.kind === 'commit').length;
    $('[data-blocked-count]').textContent = events.filter(item => item.kind === 'blocked').length;
    addRoomEvent(event);
    setPhase(event.kind);
    if (!element.hidden && $('[data-pane="activity"]').hidden === false) row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    events = [];
    timeline.innerHTML = `<div class="wv-inspector-empty">${icon('message')}<h3>Every step has a story.</h3><p>Ask WebVerse a question to follow its conversations and decisions here.</p><span>Read → Rehearse → Review → Act</span></div>`;
    $('[data-event-count]').textContent = '0';
    $('[data-trail-count]').textContent = 'Awaiting your question';
    $('[data-allowed-count]').textContent = '0';
    $('[data-blocked-count]').textContent = '0';
    $$('[data-room-count]').forEach(node => { node.textContent = '0 actions released'; });
    $$('[data-room-status]').forEach(node => { node.textContent = 'Conversation ready'; });
    seedRooms();
    setPhase('ready');
  }

  $('.wv-inspector-close').addEventListener('click', close);
  $('.wv-inspector-backdrop').addEventListener('click', close);
  $$('[data-tab]').forEach(button => button.addEventListener('click', () => selectTab(button.dataset.tab)));
  element.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.target.matches('[role="tab"]') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const tabs = $$('[role="tab"]');
      const index = tabs.indexOf(event.target);
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[nextIndex].dataset.tab); tabs[nextIndex].focus();
    }
    if (event.key !== 'Tab') return;
    const focusables = $$('button:not([disabled]), a[href], summary, [tabindex="0"]').filter(node => node.tabIndex >= 0 && !node.closest('[hidden]') && node.getClientRects().length);
    const first = focusables[0]; const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  seedRooms();
  return { element, open, close, addEvent, setPhase, reset };
}
