(() => {
  const provider = document.body.dataset.provider;
  const brands = {
    stillwater: { name: 'Wren', brand: 'Stillwater', accent: '#245649', light: '#f1f6f2', greeting: 'Hello, I’m Wren. Tell me what needs a little attention. I can help you understand the repair, put together a quote, and explain our terms.', prompts: ['My bathroom faucet is leaking', 'Quote a bathroom refresh', 'What’s included in your prices?'] },
    goodhands: { name: 'Kit', brand: 'GoodHands', accent: '#bc482a', light: '#fff4e9', greeting: 'Hey, I’m Kit! Drippy tap? Wobbly toilet? Bathroom in need of a fresh start? Tell me what’s up and we’ll figure out the next step.', prompts: ['Help with a leaking tap', 'Get a bathroom refresh quote', 'Tell me about the bundle offer'] },
    formfield: { name: 'Ada', brand: 'Form & Field', accent: '#373b29', light: '#f2f3e9', greeting: 'Welcome. I’m Ada, your project concierge. Describe the repair or space you have in mind, and I’ll help define the scope, estimate, and next steps.', prompts: ['Estimate a bathroom refresh', 'A toilet needs repairing', 'Explain the survey and deposit'] }
  };
  const config = brands[provider];
  if (!config) return;
  const key = 'webverse-chat-v1-' + provider;
  let history = [];
  let savedQuotes = [];
  let busy = false;
  let controller;
  let previousFocus;
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || '{}');
    history = (saved.messages || []).filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string').slice(-24);
    savedQuotes = (saved.quotes || []).slice(-3);
  } catch {}
  const sessionId = crypto.randomUUID();
  const container = document.createElement('div');
  container.className = 'wv-agent';
  container.style.setProperty('--wv-accent', config.accent);
  container.style.setProperty('--wv-light', config.light);
  container.innerHTML = '<button class="wv-launcher" aria-label="Chat with ' + config.name + '" aria-expanded="false" aria-controls="wv-panel"><span class="wv-agent-mark">✳</span><span>Ask ' + config.name + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10M6 18 17 7"/></svg></button>' +
    '<section id="wv-panel" class="wv-panel" role="dialog" aria-label="Chat with ' + config.name + ' at ' + config.brand + '" hidden><header class="wv-header"><div class="wv-avatar">' + config.name[0] + '</div><div><strong>' + config.name + ' <span>at ' + config.brand + '</span></strong><small>AI repair concierge</small></div><button class="wv-close" aria-label="Close chat">×</button></header><div class="wv-demo-note">Live AI conversation · Fictional provider</div><div class="wv-messages" role="log" aria-live="polite" aria-relevant="additions"></div><div class="wv-chips"></div><form class="wv-form"><label class="wv-sr-only" for="wv-input">Message ' + config.name + '</label><textarea id="wv-input" rows="1" maxlength="4000" placeholder="Tell me what needs fixing…"></textarea><button class="wv-send" type="submit" aria-label="Send message"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 7-7 7 7M12 5v15"/></svg></button></form><footer class="wv-footer"><span>Estimates only. No real bookings or payments.</span><button class="wv-reset" type="button">Start over</button></footer></section>';
  document.body.append(container);
  const panel = container.querySelector('.wv-panel');
  const launcher = container.querySelector('.wv-launcher');
  const log = container.querySelector('.wv-messages');
  const input = container.querySelector('textarea');
  const form = container.querySelector('form');
  const sendButton = container.querySelector('.wv-send');
  const chips = container.querySelector('.wv-chips');
  const persist = () => { try { sessionStorage.setItem(key, JSON.stringify({ messages: history.slice(-23), quotes: savedQuotes.slice(-3) })); } catch {} };
  const scroll = () => { log.scrollTop = log.scrollHeight; };
  function format(node, text) {
    node.replaceChildren();
    text.split('\n').forEach((line, index) => {
      if (index) node.append(document.createElement('br'));
      line.split(/(\*\*[^*]+\*\*)/g).forEach(part => {
        if (part.startsWith('**') && part.endsWith('**')) { const bold = document.createElement('strong'); bold.textContent = part.slice(2, -2); node.append(bold); }
        else node.append(document.createTextNode(part));
      });
    });
  }
  function addMessage(role, text) {
    const row = document.createElement('div');
    row.className = 'wv-message wv-' + role;
    const label = document.createElement('span'); label.className = 'wv-message-label'; label.textContent = role === 'user' ? 'You' : config.name;
    const content = document.createElement('div'); content.className = 'wv-message-content'; format(content, text);
    row.append(label, content); log.append(row); scroll(); return content;
  }
  function money(number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(number) ? 0 : 2, maximumFractionDigits: 2 }).format(number); }
  function addQuote(quote, save = true) {
    if (!quote || !Array.isArray(quote.items)) return;
    const card = document.createElement('article'); card.className = 'wv-quote';
    const tag = document.createElement('small'); tag.textContent = 'YOUR DEMO ESTIMATE';
    const heading = document.createElement('h3'); heading.textContent = config.brand;
    card.append(tag, heading);
    for (const item of quote.items) {
      const row = document.createElement('div'); row.className = 'wv-quote-row';
      const label = document.createElement('span'); label.textContent = item.label;
      const value = document.createElement('strong'); value.textContent = money(item.min) + '–' + money(item.max);
      row.append(label, value); card.append(row);
    }
    if (quote.discountPercent) {
      const savings = document.createElement('p'); savings.textContent = quote.discountPercent + '% bundle discount applied to the total.'; card.append(savings);
    }
    const total = document.createElement('div'); total.className = 'wv-quote-total'; total.textContent = 'Estimated total  ' + money(quote.min) + '–' + money(quote.max); card.append(total);
    if (quote.diagnostic?.note) { const diagnostic = document.createElement('p'); diagnostic.textContent = quote.diagnostic.note; card.append(diagnostic); }
    const terms = document.createElement('p'); terms.textContent = Array.isArray(quote.terms) ? quote.terms.join(' ') : String(quote.terms || 'Final scope requires inspection.'); card.append(terms);
    const download = document.createElement('button'); download.type = 'button'; download.textContent = 'Download estimate ↗';
    download.addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(quote, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = provider + '-demo-estimate.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    card.append(download); log.append(card);
    if (save) { savedQuotes.push(quote); persist(); }
    scroll();
  }
  function renderInitial() {
    log.replaceChildren(); addMessage('assistant', config.greeting);
    history.forEach(message => addMessage(message.role, message.content));
    savedQuotes.forEach(quote => addQuote(quote, false));
    chips.hidden = history.length > 0;
  }
  config.prompts.forEach(prompt => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = prompt; button.addEventListener('click', () => submit(prompt)); chips.append(button);
  });
  renderInitial();
  function open() { previousFocus = document.activeElement; panel.hidden = false; launcher.hidden = true; launcher.setAttribute('aria-expanded', 'true'); scroll(); input.focus(); }
  function close() { panel.hidden = true; launcher.hidden = false; launcher.setAttribute('aria-expanded', 'false'); previousFocus?.focus(); }
  launcher.addEventListener('click', open);
  container.querySelector('.wv-close').addEventListener('click', close);
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-open-agent]');
    if (!target) return;
    event.preventDefault(); open();
    if (target.dataset.prompt) submit(target.dataset.prompt);
  });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 112) + 'px'; });
  form.addEventListener('submit', event => { event.preventDefault(); submit(input.value.trim()); });
  container.querySelector('.wv-reset').addEventListener('click', () => {
    controller?.abort(); history = []; savedQuotes = []; persist(); renderInitial(); input.value = ''; input.focus();
  });
  async function submit(text) {
    if (!text || busy || text.length > 4000) return;
    busy = true; sendButton.disabled = true; chips.hidden = true;
    input.value = ''; input.style.height = 'auto';
    history.push({ role: 'user', content: text });
    addMessage('user', text);
    const reply = addMessage('assistant', 'Thinking…'); reply.classList.add('wv-thinking');
    controller = new AbortController();
    let responseText = '';
    let done = false;
    const startedHistory = history;
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, messages: history.slice(-23), sessionId }), signal: controller.signal });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'The agent could not respond. Please try again.');
      }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
      function consume(line) {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === 'delta') { responseText += event.text; reply.classList.remove('wv-thinking'); format(reply, responseText); scroll(); }
        if (event.type === 'quote') addQuote(event.quote);
        if (event.type === 'error') throw new Error(event.message || 'The conversation was interrupted.');
        if (event.type === 'done') done = true;
      }
      while (true) {
        const { value, done: finished } = await reader.read();
        buffer += decoder.decode(value, { stream: !finished });
        const lines = buffer.split('\n'); buffer = lines.pop(); lines.forEach(consume);
        if (finished) { if (buffer.trim()) consume(buffer); break; }
      }
      if (!done) throw new Error('The response was interrupted. Please try again.');
      if (!responseText) { responseText = 'Your estimate is ready above. What else would you like to know?'; format(reply, responseText); }
      if (history === startedHistory) { history.push({ role: 'assistant', content: responseText }); persist(); }
    } catch (error) {
      if (error.name !== 'AbortError' && history === startedHistory) {
        reply.classList.add('wv-error'); format(reply, error.message);
        history.pop();
        const retry = document.createElement('button'); retry.className = 'wv-retry'; retry.textContent = 'Try again'; retry.type = 'button';
        retry.addEventListener('click', () => { reply.parentElement.remove(); submit(text); }); reply.append(document.createElement('br'), retry);
      }
    } finally {
      reply.classList.remove('wv-thinking'); busy = false; sendButton.disabled = false; controller = null; scroll();
    }
  }
})();
