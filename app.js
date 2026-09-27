/* Roster Review Queue prototype.
   Clips reach this queue only when the number the tagger read has a look-alike that is
   ALSO on the same roster. No collision on that roster means no review. */

const CLIPS = [
  { id:1, club:"Ridgeline Youth Soccer", read:"14", truth:"4",
    reason:"Read 14. This roster also has a 4, and the jersey was partly blocked at the moment of the shot.",
    candidates:[ {num:"14", name:"Maya Chen", guess:true}, {num:"4", name:"Priya Raman"} ],
    ticket:"My daughter wears number 14. Her highlight reel this week had a clip of a completely different kid wearing number 4." },
  { id:2, club:"Cobblestone Little League", read:"1", truth:"11",
    reason:"Read 1. This roster also has an 11. The jersey was side-on, so a double digit can read as a single.",
    candidates:[ {num:"1", name:"Sam Whitlock", guess:true}, {num:"11", name:"Daniel Okafor"} ],
    ticket:"Same kind of mix-up I have seen mentioned elsewhere: my son is number 1 and the clip in his reel was number 11." },
  { id:3, club:"Brightwater Youth Lacrosse", read:"32", truth:"32",
    reason:"Read 32. This roster also has a 23. Same digits reversed, and the player was turning away from the camera.",
    candidates:[ {num:"32", name:"Ellis Barnes", guess:true}, {num:"23", name:"Tomas Reyes"} ],
    ticket:"Twice this season a highlight in one of my players' reels was clearly a different kid. Both times the jersey numbers were similar, just swapped digits." }
];

const REVIEWER = "coach.account";
let mode = null, i = 0;
const decisions = [], audit = [];

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stamp = () => new Date().toISOString().slice(11,19);
const el = id => document.getElementById(id);
const nameFor = (c, num) => (c.candidates.find(p=>p.num===num)||{}).name || "unknown";

const jersey = (n, dim) => `<svg viewBox="0 0 80 80" aria-hidden="true">
  <path d="M26 16 L40 22 L54 16 L64 26 L57 34 L57 66 L23 66 L23 34 L16 26 Z"
    fill="#3a4351" stroke="#525c6e" stroke-width="1.5"/>
  <text x="40" y="54" font-size="26" font-weight="700" fill="#e9ecf1"
    text-anchor="middle" font-family="system-ui" opacity="${dim?0.45:0.92}">${esc(n)}</text></svg>`;

function setBar(n, total){
  el('bar').innerHTML = Array.from({length:total},(_,k)=>
    `<div class="seg ${k<=n?'on':''}"></div>`).join('');
}

/* ---------- entry ---------- */
function start(){
  el('count').textContent = "Compare the two";
  el('bar').innerHTML = "";
  el('app').innerHTML = `
    <div class="card">
      <h3 class="h">The same three clips, two ways</h3>
      <p class="p">Three clubs filed the same complaint this week. In every one, the number the
      tagger read had a look-alike sitting on the same roster. Run it both ways and watch what
      reaches the family.</p>
      <div class="modes">
        <button class="mode bad" data-mode="off">
          <b>Ship it as we do today</b>
          <span>No gate. Whatever the tagger reads is what publishes.</span>
        </button>
        <button class="mode good" data-mode="on">
          <b>Ship it with the confidence gate</b>
          <span>Ambiguous clips hold for one coach tap before publishing.</span>
        </button>
      </div>
    </div>`;
  el('logwrap').style.display='none';
  el('auditwrap').style.display='none';
}

/* ---------- mode: gate off ---------- */
function gateOff(){
  mode='off';
  const wrong = CLIPS.filter(c=>c.read!==c.truth);
  setBar(2,3);
  el('count').textContent = "No gate";
  el('app').innerHTML = `
    <div class="card">
      <h3 class="h">Published without review</h3>
      <p class="p">All three clips go straight out, because nothing stops them.</p>
      ${CLIPS.map(c=>{
        const bad = c.read!==c.truth;
        return `<div class="pub ${bad?'wrongrow':''}">
          <div class="mini">${jersey(c.read, bad)}</div>
          <div class="pubmeta">
            <b>${esc(c.club)}</b>
            <span>Sent to ${esc(nameFor(c,c.read))}, number ${esc(c.read)}.
            ${bad?`The clip is actually number ${esc(c.truth)}, ${esc(nameFor(c,c.truth))}.`:'Correct.'}</span>
          </div>
          <span class="tag ${bad?'drop':'ok'}">${bad?'wrong child':'ok'}</span>
        </div>`;}).join('')}

      <div class="recap warnbox">
        <b>${wrong.length} of 3 families opened a reel with another child in it</b>
        These are the tickets. What the tickets do not show is the families who saw the wrong
        thumbnail and never opened at all.
      </div>

      <div class="notif">
        <b>What the parent wrote</b>
        ${wrong.map(c=>`<span class="quote">&ldquo;${esc(c.ticket)}&rdquo;</span>`).join('')}
      </div>

      <div class="recap warnbox metricbox">
        <b>And the dashboard still reads 92%</b>
        Reel Share Rate is calculated only over reels a parent opened. A family who saw the wrong
        child and closed it never enters the denominator. The number stays healthy precisely
        because it excludes the people we failed.
      </div>

      <div class="actions">
        <button class="btn primary" data-mode="on">Now run it with the gate</button>
        <button class="btn ghost" data-act="home">Back</button>
      </div>
    </div>`;
}

/* ---------- mode: gate on ---------- */
function gateOn(){ mode='on'; i=0; decisions.length=0; audit.length=0; render(); }

function render(){
  setBar(i, CLIPS.length);
  const left = CLIPS.length - i;
  el('count').textContent = left===0 ? "Queue clear"
    : left + (left===1?" clip needs review":" clips need review");
  if (i >= CLIPS.length) return finish();

  const c = CLIPS[i];
  el('app').innerHTML = `
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

const logAudit = (action, detail) => audit.push({at:stamp(), who:REVIEWER, action, detail});

function pick(k){
  const c = CLIPS[i], p = c.candidates[k];
  const correct = p.num === c.truth;
  decisions.push({ club:c.club, tag: p.guess ? 'ok' : 'fix', correct,
    text: p.guess
      ? `Confirmed the system. Clip goes to ${p.name}, number ${p.num}.`
      : `Corrected. Clip moved off number ${c.read} and sent to ${p.name}, number ${p.num}.` });
  logAudit(p.guess?'confirmed':'reassigned', `clip ${c.id} to #${p.num}`);
  i++; render();
}
function discard(){
  const c=CLIPS[i];
  decisions.push({club:c.club, tag:'drop', text:'Discarded. Not on this roster, so it is in nobody’s reel.'});
  logAudit('discarded', `clip ${c.id}, queued for deletion`); i++; render();
}
function skip(){
  const c=CLIPS[i];
  decisions.push({club:c.club, tag:'held', text:'Left for later. It stays held, so it does not go out in this week’s recap.'});
  logAudit('held', `clip ${c.id} remains unpublished`); i++; render();
}

function finish(){
  const held = decisions.filter(d=>d.tag==='held').length;
  const fixed = decisions.filter(d=>d.tag==='fix').length;
  setBar(CLIPS.length, CLIPS.length);
  el('app').innerHTML = `
    <div class="card done">
      <div class="tick">&#10003;</div>
      <h3>Queue clear</h3>
      <p class="sub">${fixed>0
        ? fixed + (fixed===1?' clip was':' clips were') + ' heading to the wrong child and will not now.'
        : 'You confirmed the system on every clip. That is a real outcome too, and if it keeps happening the threshold is too tight.'}</p>
      <div class="recap ${held>0?'warnbox':''}">
        <b>${held>0?'Recap sends with a gap':'Recap sends complete'}</b>
        ${held>0
          ? held + (held===1?' clip is':' clips are') + ' still held, so ' + (held===1?'it stays':'they stay') +
            ' out of this week’s recap rather than going out unchecked. Any child left with no clips at all gets no reel, and you get told which.'
          : 'Every held clip was resolved before the weekly recap assembles.'}
      </div>
      <div class="notif">
        <b>What the family actually receives</b>
        &ldquo;Your child&rsquo;s reel from Saturday is ready.&rdquo; No name, no jersey number and no
        thumbnail in the message itself. The reel opens only behind that family&rsquo;s own login.
      </div>
      <div class="actions">
        <button class="btn ghost" data-mode="off">See it without the gate</button>
        <button class="btn primary" data-act="home">Start over</button>
      </div>
    </div>`;
  showLog();
}

function showLog(){
  el('logwrap').style.display='block';
  el('log').innerHTML = decisions.map(d=>`
    <div class="logitem">
      <span class="tag ${d.tag}">${d.tag==='ok'?'sent':d.tag==='fix'?'fixed':d.tag==='drop'?'dropped':'held'}</span>
      <span><b>${esc(d.club)}.</b> ${esc(d.text)}</span>
    </div>`).join('');
  el('auditwrap').style.display='block';
  el('audit').innerHTML = audit.map(a=>`
    <div class="logitem mono"><span>${a.at}</span><span>${esc(a.who)}</span>
      <span><b>${esc(a.action)}</b> ${esc(a.detail)}</span></div>`).join('');
}

document.addEventListener('click', e => {
  const m = e.target.closest('[data-mode]');
  if (m) return m.dataset.mode==='off' ? gateOff() : gateOn();
  const p = e.target.closest('[data-pick]');
  if (p) return pick(Number(p.dataset.pick));
  const a = e.target.closest('[data-act]');
  if (!a) return;
  if (a.dataset.act==='discard') discard();
  else if (a.dataset.act==='skip') skip();
  else if (a.dataset.act==='home') start();
});

start();
