(() => {
  if (window.__outOfOfficeGuardLive) return;
  window.__outOfOfficeGuardLive = true;

  const rules = [
    {title:"Specific absence dates disclosed",level:"medium",re:/\b(?:from\s+)?(?:\d{1,2}(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2})(?:\s+(?:to|until|through|-|–)\s+|\s*[-–]\s*)(?:\d{1,2}(?:st|nd|rd|th)?\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i,ctx:/\b(?:away|out of office|unavailable|leave|holiday|vacation|return|back)\b/i,why:"Exact absence dates can reveal when you are unavailable."},
    {title:"Travel or movement details disclosed",level:"high",re:/\b(?:travell?ing|on holiday|on vacation|visiting|trip to|flying to|staying in|abroad|holidaying)\b/i,why:"Travel plans and destinations reveal personal movements."},
    {title:"Possible phone number included",level:"medium",re:/(?:\+?\d[\d\s().-]{7,}\d)/g,why:"A personal phone number may be collected by unintended recipients."},
    {title:"Home or property may be unattended",level:"high",re:/\b(?:house|home|flat|apartment|property)\b.{0,65}\b(?:empty|unattended|nobody|no one|vacant|left alone)\b|\b(?:nobody|no one)\b.{0,45}\b(?:home|house|flat|apartment)\b/i,why:"This wording may reveal that a property is unattended."},
    {title:"Internal operational information disclosed",level:"medium",re:/\b(?:internal only|confidential|vpn|admin(?:istrator)? panel|internal server|production server|incident response|on-call engineer|network credentials|office access code)\b/i,why:"Internal systems and access procedures can help outsiders target an organisation."},
    {title:"Possible credential or secret disclosed",level:"high",re:/\b(?:password|passcode|one[- ]time code|otp|access token|api key|secret key)\s*(?:is|:|=)\s*\S+/i,why:"Automatic replies should never contain passwords, one-time codes, API keys or access tokens."}
  ];

  function candidateContext(el) {
    const bits = [el.getAttribute("aria-label"), el.getAttribute("placeholder"), el.id, el.getAttribute("name")];
    if (el.labels) bits.push(...[...el.labels].map(x => x.innerText));
    let node = el;
    for (let i=0; i<5 && node; i++, node=node.parentElement) {
      const txt = (node.innerText || "").slice(0,1200);
      bits.push(txt);
      if (/out.?of.?office|automatic.?repl|auto.?repl|vacation.?responder|away message|absence repl/i.test(txt)) break;
    }
    return bits.filter(Boolean).join(" ").toLowerCase();
  }
  function isCandidate(el) {
    if (!(el instanceof HTMLElement)) return false;
    if (!el.matches("textarea,input[type='text'],[contenteditable='true'],[role='textbox']")) return false;
    if (el.closest("#oof-guard-shadow-host")) return false;
    return /out.?of.?office|automatic.?repl|auto.?repl|vacation.?responder|away message|absence repl/i.test(candidateContext(el));
  }
  function fieldText(el) {
    return String(el.value ?? el.innerText ?? el.textContent ?? "").trim();
  }
  function inspect(text) {
    return rules.filter(r => {
      if (r.title.startsWith("Specific absence")) return r.re.test(text) && r.ctx.test(text);
      if (r.title.startsWith("Possible phone")) return (text.match(r.re)||[]).some(v => v.replace(/\D/g,"").length>=9 && v.replace(/\D/g,"").length<=15);
      return r.re.test(text);
    });
  }

  const host = document.createElement("div");
  host.id = "oof-guard-shadow-host";
  host.style.cssText = "all:initial;position:fixed;z-index:2147483647;right:18px;bottom:18px;";
  const shadow = host.attachShadow({mode:"closed"});
  const style = document.createElement("style");
  style.textContent = `
    .panel{font:13px/1.45 Arial,sans-serif;width:310px;background:#fff;color:#172033;border:1px solid #d9e0ec;border-radius:13px;box-shadow:0 8px 30px #14213d30;overflow:hidden}
    .top{display:flex;align-items:center;justify-content:space-between;background:#172b4d;color:white;padding:10px 12px;font-weight:700}
    .top button{background:transparent;color:white;border:0;font-size:18px;cursor:pointer}
    .body{padding:11px 12px}.status{font-size:11px;color:#5b667c;margin-bottom:7px}
    .item{border-left:3px solid #e49a22;background:#f7f8fb;padding:7px 8px;margin:6px 0;border-radius:5px;font-size:11px}
    .item.high{border-color:#d92d20}.item strong{display:block;margin-bottom:2px}
    .safe{font-size:11px;color:#147444;background:#e8f6ee;padding:8px;border-radius:7px;margin-top:8px}
    .foot{font-size:9px;color:#7a8598;margin-top:8px}
    .empty{font-size:11px;color:#147444}
  `;
  const panel = document.createElement("div");
  panel.className = "panel";
  panel.innerHTML = `<div class="top"><span>OutOfOffice Guard · Live</span><button type="button" aria-label="Close">×</button></div><div class="body"><div class="status">Waiting for an automatic-reply field…</div></div>`;
  shadow.append(style,panel);
  document.documentElement.append(host);
  panel.querySelector("button").addEventListener("click",()=>{host.remove();window.__outOfOfficeGuardLive=false;});

  function update(el) {
    const text = fieldText(el);
    if (!text) {
      panel.querySelector(".body").innerHTML = `<div class="status">Automatic-reply field detected. Type your message to check it.</div><div class="foot">Only this identified field is analysed locally.</div>`;
      return;
    }
    const findings = inspect(text);
    const body = panel.querySelector(".body");
    body.replaceChildren();
    const status = document.createElement("div");
    status.className="status";
    status.textContent = findings.length ? `${findings.length} potential disclosure(s) found in this reply.` : "No configured disclosure patterns detected.";
    body.append(status);
    findings.forEach(f=>{
      const item=document.createElement("div");
      item.className="item "+f.level;
      const strong=document.createElement("strong");strong.textContent=f.title;
      const desc=document.createElement("span");desc.textContent=f.why;
      item.append(strong,desc);body.append(item);
    });
    if (!findings.length) {
      const ok=document.createElement("div");ok.className="empty";ok.textContent="Keep reviewing the message; no pattern match is not a safety guarantee.";body.append(ok);
    }
    const foot=document.createElement("div");foot.className="foot";foot.textContent="Local check only. Nothing is sent or changed. Review before enabling your reply.";body.append(foot);
  }

  let lastField=null, timer=null;
  function onInput(event) {
    const el=event.target;
    if (!isCandidate(el)) return;
    lastField=el;
    clearTimeout(timer);
    timer=setTimeout(()=>update(el),300);
  }
  document.addEventListener("input",onInput,true);
  document.addEventListener("change",onInput,true);

  function findCandidate() {
    const els=[...document.querySelectorAll("textarea,input[type='text'],[contenteditable='true'],[role='textbox']")];
    return els.find(el=>isCandidate(el) && fieldText(el).length>0) || els.find(el=>isCandidate(el)) || null;
  }
  const initial=findCandidate();
  if(initial){lastField=initial;update(initial);}
  const observer=new MutationObserver(()=>{
    if(lastField && !document.contains(lastField)) lastField=null;
    const candidate=findCandidate();
    if(candidate && candidate!==lastField){lastField=candidate;update(candidate);}
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-label","placeholder","contenteditable"]});
  window.addEventListener("pagehide",()=>{observer.disconnect();document.removeEventListener("input",onInput,true);document.removeEventListener("change",onInput,true);},{once:true});
})();