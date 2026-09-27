// Clips reaching this queue are only those where the number the tagger read has a
// look-alike that is ALSO on this team's roster. No roster collision means no review.
const CLIPS = [
  { id:1, club:"Ridgeline Youth Soccer", read:"4",
    reason:"Read 4. This roster also has a 14, and the first digit was blocked by another player at the moment of the shot.",
    candidates:[ {num:"4", name:"Priya Raman", guess:true}, {num:"14", name:"Maya Chen"} ] },
  { id:2, club:"Cobblestone Little League", read:"11",
    reason:"Read 11. This roster also has a 1. The jersey was side-on, so a single digit can read as a double.",
    candidates:[ {num:"11", name:"Daniel Okafor", guess:true}, {num:"1", name:"Sam Whitlock"} ] },
  { id:3, club:"Brightwater Youth Lacrosse", read:"32",
    reason:"Read 32. This roster also has a 23. Same digits, reversed, and the player was turning away from the camera.",
    candidates:[ {num:"32", name:"Ellis Barnes", guess:true}, {num:"23", name:"Tomas Reyes"} ] }
];

const REVIEWER = "coach.brightwater";
let i = 0;
const decisions = [];
const audit = [];

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const stamp = () => new Date().toISOString().slice(11,19);

const jersey = n => `<svg viewBox="0 0 80 80" aria-hidden="true">
  <path d="M26 16 L40 22 L54 16 L64 26 L57 34 L57 66 L23 66 L23 34 L16 26 Z"
    fill="#3a4351" stroke="#525c6e" stroke-width="1.5"/>
  <text x="40" y="54" font-size="26" font-weight="700" fill="#e9ecf1"
    text-anchor="middle" font-family="system-ui" opacity="0.92">${esc(n)}</text></svg>`;

function bar(){
  document.getElementById('bar').innerHTML =
    CLIPS.map((_,k)=>`<div class="seg ${k<=i?'on':''}"></div>`).join('');
}

function render(){
  bar();
  const app = document.getElementById('app');
  const left = CLIPS.length - i;
  document.getElementById('count').textContent =
    left === 0 ? "Queue clear" : left + (left===1?" clip needs review":" clips need review");

  if (i >= CLIPS.length) return finish();

  const c = CLIPS[i];
  app.innerHTML = `
    <div class="card">
      <div class="row">
        <div class="frame">${jersey(c.read)}</div>
        <div class="meta">
          <h3>${esc(c.club)}</h3>
          <p>Clip ${c.id} of ${CLIPS.length}. Held before publishing.</p>
          <span class="conf">Not confident enough to send on its own</span>
        </div>
      </div>
      <div class="why"><b>Why this stopped:</b> ${esc(c.reason)}</div>
      <div class="choices">
        <div class="lab">Who is this?</div>
        ${c.candidates.map((p,k)=>`
          <button class="opt" data-pick="${k}">
            <span class="num">${esc(p.num)}</span>
            <span>${esc(p.name)}</span>
            ${p.guess?'<span class="guess">SYSTEM GUESS</span>':''}
          </button>`).join('')}
      </div>
      <div class="actions">
        <button class="btn ghost" data-act="discard">Not our player</button>
        <button class="btn ghost" data-act="skip">Skip for now</button>
      </div>
    </div>`;
}

function logAudit(action, detail){
  audit.push({ at: stamp(), who: REVIEWER, action, detail });
}

function pick(k){
  const c = CLIPS[i], p = c.candidates[k];
  if (p.guess){
    decisions.push({ club:c.club, tag:'ok',
      text:`Confirmed. Clip goes to ${p.name}, number ${p.num}.` });
    logAudit('confirmed', `clip ${c.id} to #${p.num}`);
  } else {
    decisions.push({ club:c.club, tag:'fix',
      text:`Corrected. Clip moved off number ${c.read} and sent to ${p.name}, number ${p.num}.` });
    logAudit('reassigned', `clip ${c.id} from #${c.read} to #${p.num}`);
  }
  i++; render();
}
function discard(){
  const c = CLIPS[i];
  decisions.push({ club:c.club, tag:'drop',
    text:'Discarded. Not a player on this roster, so it is in nobody’s reel.' });
  logAudit('discarded', `clip ${c.id}, queued for deletion`);
  i++; render();
}
function skip(){
  const c = CLIPS[i];
  decisions.push({ club:c.club, tag:'held',
    text:'Left for later. It stays held, so it does not go out in this week’s recap.' });
  logAudit('held', `clip ${c.id} remains unpublished`);
  i++; render();
}

function finish(){
  const held = decisions.filter(d=>d.tag==='held').length;
  const fixed = decisions.filter(d=>d.tag==='fix').length;
  document.getElementById('app').innerHTML = `
    <div class="card done">
      <div class="tick">&#10003;</div>
      <h3>Queue clear</h3>
      <p class="sub">${fixed>0
        ? fixed + (fixed===1?' clip was':' clips were') + ' going to the wrong child and will not now.'
        : 'Nothing was heading to the wrong child this week.'}</p>
      <div class="recap ${held>0?'warnbox':''}">
        <b>${held>0?'Recap sends with a gap':'Recap sends complete'}</b>
        ${held>0
          ? held + (held===1?' clip is':' clips are') + ' still held, so ' +
            (held===1?'it stays':'they stay') + ' out of this week’s recap rather than going out unchecked. ' +
            'Any child left with no clips at all gets no reel this week, and you get told which.'
          : 'Every held clip was resolved before the weekly recap assembles.'}
      </div>
      <div class="notif">
        <b>What the family actually receives</b>
        "Your child&rsquo;s reel from Saturday is ready." No child name, no jersey number,
        no thumbnail in the message itself. The reel opens only behind that family&rsquo;s own login.
      </div>
      <div class="actions"><button class="btn primary" data-act="reset">Run it again</button></div>
    </div>`;
  showLog();
}

function showLog(){
  document.getElementById('logwrap').style.display='block';
  document.getElementById('log').innerHTML = decisions.map(d=>`
    <div class="logitem">
      <span class="tag ${d.tag}">${d.tag==='ok'?'sent':d.tag==='fix'?'fixed':d.tag==='drop'?'dropped':'held'}</span>
      <span><b>${esc(d.club)}.</b> ${esc(d.text)}</span>
    </div>`).join('');
  document.getElementById('auditwrap').style.display='block';
  document.getElementById('audit').innerHTML = audit.map(a=>`
    <div class="logitem mono">
      <span>${a.at}</span><span>${esc(a.who)}</span>
      <span><b>${esc(a.action)}</b> ${esc(a.detail)}</span>
    </div>`).join('');
}

function reset(){
  i=0; decisions.length=0; audit.length=0;
  document.getElementById('logwrap').style.display='none';
  document.getElementById('auditwrap').style.display='none';
  render();
}

document.addEventListener('click', e => {
  const p = e.target.closest('[data-pick]');
  if (p) return pick(Number(p.dataset.pick));
  const a = e.target.closest('[data-act]');
  if (!a) return;
  if (a.dataset.act==='discard') discard();
  else if (a.dataset.act==='skip') skip();
  else if (a.dataset.act==='reset') reset();
});

render();
