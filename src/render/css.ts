export const CSS = `:root {
  --paper: #F7F3E6;
  --paper-deep: #EFE8D4;
  --ink: #2a2620;
  --ink-soft: #5a5246;
  --ink-muted: #8a8170;
  --line: #d9cfb8;
  --green: #7ba87b;
  --green-soft: #d4e3c9;
  --red: #d97a6c;
  --red-soft: #f3d5cc;
  --blue: #7da3c4;
  --blue-soft: #d3e0eb;
  --purple: #9b8bc4;
  --purple-soft: #ddd3ea;
  --yellow: #e5b96a;
  --yellow-soft: #f5e5b8;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--paper);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.65;
  background-image:
    radial-gradient(ellipse at 15% 5%, rgba(155,139,196,0.07), transparent 40%),
    radial-gradient(ellipse at 90% 95%, rgba(123,168,123,0.07), transparent 40%);
}
.wrap { max-width: 1040px; margin: 0 auto; padding: 56px 28px 96px; }

h1, h2, h3 {
  font-family: 'Outfit', sans-serif;
  color: var(--ink);
  letter-spacing: -0.01em;
}
h1 { font-size: clamp(36px, 5vw, 52px); line-height: 1.05; font-weight: 700; }
h2 { font-size: 28px; font-weight: 700; margin: 56px 0 16px; display: flex; align-items: center; gap: 14px; }
h2::before {
  content: ""; display: inline-block;
  width: 36px; height: 4px;
  background: var(--ink);
  border-radius: 4px;
}
h3 { font-size: 19px; font-weight: 600; margin: 24px 0 10px; }
p { color: var(--ink-soft); margin-bottom: 14px; }
p strong { color: var(--ink); font-weight: 600; }
.handwrite { font-family: 'Caveat', cursive; font-weight: 700; color: var(--ink); }

a { color: var(--purple); text-decoration: none; border-bottom: 1px solid var(--purple-soft); }
a:hover { border-bottom-color: var(--purple); }

code {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12.5px;
  background: var(--paper-deep);
  border: 1px solid var(--line);
  padding: 2px 7px;
  border-radius: 5px;
  color: var(--ink);
}
pre {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  background: var(--paper-deep);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px 18px;
  overflow-x: auto;
  margin: 12px 0;
  color: var(--ink);
}
pre code {
  background: transparent;
  border: none;
  padding: 0;
}

ul, ol { margin: 0 0 14px 22px; }
li { color: var(--ink-soft); margin-bottom: 6px; }
li strong { color: var(--ink); }

.hero { margin-bottom: 28px; }
.hero .kicker {
  font-family: 'Caveat', cursive;
  font-size: 22px;
  color: var(--purple);
  margin-bottom: 6px;
  transform: rotate(-1deg);
  display: inline-block;
}
.hero h1 { margin-bottom: 14px; }
.hero .lede {
  font-size: 18px;
  color: var(--ink-soft);
  max-width: 760px;
}
.meta-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 22px;
  font-size: 13px;
  color: var(--ink-muted);
}
.meta-row span { font-family: 'JetBrains Mono', monospace; }

.figure {
  margin: 28px 0;
  text-align: center;
}
.figure img {
  max-width: 100%;
  height: auto;
  border-radius: 14px;
  box-shadow:
    0 1px 0 rgba(0,0,0,0.04),
    0 12px 32px -8px rgba(42,38,32,0.18);
  border: 1px solid var(--line);
}
.figure .caption {
  font-family: 'Caveat', cursive;
  font-size: 18px;
  color: var(--ink-muted);
  margin-top: 10px;
}

.status-panel {
  background: linear-gradient(180deg, var(--paper-deep), var(--paper));
  border: 2px solid var(--ink);
  border-radius: 22px;
  padding: 28px 32px;
  margin: 32px 0;
  position: relative;
}
.status-panel::before {
  content: "";
  position: absolute;
  top: 6px; left: 6px; right: 6px; bottom: 6px;
  border-radius: 16px;
  border: 1px dashed var(--ink-muted);
  pointer-events: none;
  opacity: 0.4;
}
.status-panel .tag {
  display: inline-block;
  background: var(--yellow-soft);
  border: 1.5px solid var(--yellow);
  color: var(--ink);
  font-family: 'Caveat', cursive;
  font-weight: 700;
  font-size: 18px;
  padding: 2px 14px;
  border-radius: 18px;
  transform: rotate(-1deg);
  margin-bottom: 14px;
}
.status-panel h2 { margin: 0 0 12px; font-size: 26px; }
.status-panel h2::before { display: none; }
.status-panel .progress {
  margin: 18px 0 8px;
}
.progress-track {
  height: 18px;
  background: var(--paper);
  border: 2px solid var(--ink);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green) 0%, var(--green) 80%, var(--yellow) 100%);
  border-right: 2px solid var(--ink);
}
.progress-labels {
  display: flex; justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--ink-muted);
}

.card {
  background: var(--paper);
  border: 1.5px solid var(--ink);
  border-radius: 16px;
  padding: 20px 24px;
  margin: 14px 0;
}
.card.green { background: linear-gradient(170deg, var(--green-soft), var(--paper)); border-color: var(--green); }
.card.red   { background: linear-gradient(170deg, var(--red-soft), var(--paper)); border-color: var(--red); }
.card.blue  { background: linear-gradient(170deg, var(--blue-soft), var(--paper)); border-color: var(--blue); }
.card.yellow { background: linear-gradient(170deg, var(--yellow-soft), var(--paper)); border-color: var(--yellow); }
.card.purple { background: linear-gradient(170deg, var(--purple-soft), var(--paper)); border-color: var(--purple); }

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin: 20px 0;
}
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 20px 0;
}
@media (max-width: 800px) {
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}

.done-list { list-style: none; margin: 12px 0; padding: 0; }
.done-list li {
  padding: 10px 14px 10px 42px;
  background: var(--paper);
  border: 1.5px solid var(--green);
  border-radius: 10px;
  margin-bottom: 8px;
  position: relative;
  color: var(--ink);
}
.done-list li::before {
  content: "\\2713";
  position: absolute;
  left: 14px; top: 50%;
  transform: translateY(-50%);
  width: 20px; height: 20px;
  background: var(--green);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.done-list strong { color: var(--ink); }

.pending-list { list-style: none; margin: 12px 0; padding: 0; }
.pending-list li {
  padding: 10px 14px 10px 42px;
  background: var(--paper);
  border: 1.5px solid var(--yellow);
  border-radius: 10px;
  margin-bottom: 8px;
  position: relative;
}
.pending-list li::before {
  content: "\\2192";
  position: absolute;
  left: 14px; top: 50%;
  transform: translateY(-50%);
  width: 20px; height: 20px;
  background: var(--yellow);
  color: var(--ink);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
}

.check-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 18px 0;
  background: var(--paper);
  border: 2px solid var(--ink);
  border-radius: 14px;
  overflow: hidden;
}
.check-table th, .check-table td {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  border-bottom: 1px solid var(--line);
}
.check-table th {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  background: var(--paper-deep);
  color: var(--ink);
  border-bottom: 2px solid var(--ink);
}
.check-table td { color: var(--ink-soft); }
.check-table td:first-child { font-weight: 600; color: var(--ink); }
.check-table tr:last-child td { border-bottom: none; }
.check-table code { font-size: 11.5px; }
.match { color: var(--green); font-weight: 700; }

.steps {
  counter-reset: step;
  list-style: none;
  margin: 18px 0;
  padding: 0;
}
.steps li {
  counter-increment: step;
  padding: 16px 20px 16px 64px;
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 12px;
  margin-bottom: 10px;
  position: relative;
}
.steps li::before {
  content: counter(step);
  position: absolute;
  left: 18px; top: 14px;
  width: 32px; height: 32px;
  background: var(--purple);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700; font-size: 15px;
}
.steps li strong { display: block; color: var(--ink); margin-bottom: 4px; font-family: 'Outfit'; font-size: 16px; }
.steps li small { font-size: 12px; color: var(--ink-muted); font-family: 'JetBrains Mono', monospace; }

.gotcha {
  background: var(--red-soft);
  border-left: 4px solid var(--red);
  padding: 14px 18px;
  border-radius: 0 12px 12px 0;
  margin: 12px 0;
}
.gotcha strong { color: var(--red); }

.err {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  background: var(--red-soft);
  border: 1px solid var(--red);
  color: var(--ink);
  padding: 2px 7px;
  border-radius: 5px;
  display: inline-block;
  margin: 2px 4px 2px 0;
}

.tester-pill {
  display: inline-block;
  background: var(--green-soft);
  border: 1.5px solid var(--green);
  color: var(--ink);
  padding: 4px 14px;
  border-radius: 20px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  margin: 4px 6px 4px 0;
}

.badge-red, .badge-gold, .badge-green {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 18px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.badge-red { background: var(--red-soft); border: 1.5px solid var(--red); color: var(--ink); }
.badge-gold { background: var(--yellow-soft); border: 1.5px solid var(--yellow); color: var(--ink); }
.badge-green { background: var(--green-soft); border: 1.5px solid var(--green); color: var(--ink); }

.footer {
  margin-top: 70px;
  padding-top: 24px;
  border-top: 2px dashed var(--line);
  text-align: center;
  color: var(--ink-muted);
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
}
.footer p { color: var(--ink-muted); }

.scribble {
  font-family: 'Caveat', cursive;
  color: var(--ink-soft);
  font-size: 18px;
  transform: rotate(-2deg);
  display: inline-block;
}`;
