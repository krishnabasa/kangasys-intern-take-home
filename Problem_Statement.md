# KangaSys — Software Engineering Intern Take-Home Assignment

**Duration:** 2 days from receipt
**Submission:** Create your own repo from this template, do your work there, and send us the link when you're done — see [SetupGuidelines.md](./SetupGuidelines.md) for step-by-step instructions. Include a `README.md` explaining how to run it, and any notes on decisions/tradeoffs you made.

---

## Context

KangaSys builds software that ingests data from thousands of physical devices (sensors, meters, equipment) and helps facility teams understand what's happening across their buildings in real time — is a device online, is a reading within a safe range, has something gone wrong that needs attention.

A recurring problem we deal with: **devices report readings over time, and we need to reliably store those readings, let users manage which devices/points we care about, and automatically flag when something is out of the ordinary** — without a human having to watch a dashboard 24/7.

This assignment asks you to build a small, self-contained version of that problem. It will not use our real data or algorithms — just a simplified version so we can see how you think, structure code, and make decisions under a real (if small) system design problem.

A sample dataset is included in [`sample-data/`](sample-data/) showing what device and reading data can look like, including a couple of worked examples of what an "anomaly" might be. Use it to get a feel for the shape of the data before you design your tables — you don't have to copy it exactly.

---

## The Problem

Build a **Device Monitoring Service** with the following capabilities:

### 1. Device Management (CRUD)
- A **Device** has at minimum: an id, a name, a type (e.g. "temperature-sensor", "pressure-gauge" — your choice of a small fixed set), and a status (active/inactive).
- Build an API that lets an operator manage the devices on a site:
  - Add a new device
  - List devices (and view a single device)
  - Update a device — rename it, change its status, adjust its configuration
  - Remove a device

This is the "who's on site" part of the system: a human curating the device inventory. It is **not** how readings arrive.

### 2. Ingesting the Reading Stream
On a real site, readings are not typed in by a person — they arrive continuously. A typical site has many sensors, each reporting **roughly once every 10 seconds**, all day, forever. That's the environment your service has to survive in.

- A **Reading** belongs to a device: a numeric value, a unit, and a timestamp.
- **Write a simulator** that mimics this environment — a script/process that generates readings for your active devices at roughly a 10-second cadence and feeds them into your system. It should produce mostly-normal data with occasional anomalies mixed in, so there's something for your detection logic to catch.
- Your service needs to accept that continuous stream, persist it, and let a user query a device's readings back (with basic filtering — e.g. by time range).

*(How the stream reaches your service is your call — an HTTP endpoint the simulator posts to, a queue, an in-process worker, a websocket, whatever you can justify. We care that you thought about ingesting a continuous feed rather than treating readings as hand-entered records.)*

### 3. Anomaly Detection
- At minimum: each device should have a configurable "normal range" (min/max) for its readings.
- When a reading arrives that falls outside the normal range for its device, the system should record an **Alert** (device id, reading that triggered it, timestamp, and a message).
- Expose an endpoint to list active/unresolved alerts, and a way to mark an alert as resolved.

*(This is intentionally open-ended — how you model "normal range," how you decide what counts as an alert, and how you structure this logic is part of what we're evaluating. There's no single correct answer. See `sample-data/README.md` for a couple of examples to prime your thinking.)*

**Brownie points — go beyond fixed thresholds.** Hand-configured min/max values don't scale: nobody wants to hand-tune a range for every one of thousands of devices, and a fixed band can't tell "slightly warm because it's a hot afternoon" from "the chiller has actually failed." If you want to stand out, use the incoming stream itself to work out what normal looks like for a given device:

- A **statistical approach** — rolling mean/standard deviation, z-scores, percentiles, IQR, EWMA, change-point or rate-of-change detection
- An **ML-based approach** — anything you can justify and actually run
- Learning the baseline per device (or per device type) from observed data rather than being told it up front

We're not looking for a research paper, and a clean threshold implementation is a perfectly good answer on its own. But if you attempt this, tell us in your README what you chose, why, and how you'd know whether it's working — the reasoning matters more than the sophistication of the algorithm.

### 4. Basic Frontend
- A simple UI (a single page is fine) that lets a user:
  - View the list of devices and their current status
  - View recent readings for a device (a simple table or chart is fine — no need for anything fancy)
  - View and resolve active alerts
- Polish is not the goal here — usability and clarity are.

### 5. Testing
- Write unit tests for the core logic, especially the anomaly detection logic and any business rules around devices/readings.
- We're less interested in 100% coverage and more interested in *what* you chose to test and why — show us you understand what's actually worth testing.

### 6. Code Quality
- We care about how you structure your code — separation of concerns, naming, how you'd extend this if we asked you to add a new device type or a new kind of alert rule next week.
- Feel free to note in your README any SOLID principles or design patterns you deliberately applied, and why.

---

## Bonus (Optional — Extra Credit)

These are **not required** to complete the core assignment, but if you have time and want to show off, pick any that interest you:

- **Auth:** Gate the API/UI behind authentication — AWS Cognito is one option, but any reasonable auth approach is fine.
- **Cloud hosting:** Deploy your app somewhere reachable (AWS Amplify, EC2, or any host of your choice) and share the link.
- **Agentic / AI workflow:** Add a way for a user to ask a natural-language question about their devices (e.g. "which devices had alerts in the last hour?") and get an answer — using an LLM, an agent framework, or whatever approach you like. This does not need to be sophisticated; we're curious how you'd approach wiring natural language up to real data.

## Using AI Tools

We expect you'll use AI coding tools (Copilot, Claude, ChatGPT, Cursor, or similar) — that's normal and encouraged, not a red flag. We're more interested in *how* you use them than whether you did.

If you use AI tools as part of your workflow, we'd love to see evidence of that process — this earns brownie points, not just a pass/fail checkbox:

- Any prompt files, system prompts, or `.md` instruction files you used to steer the AI
- Evidence of an agentic workflow (e.g. an agent plan, a task breakdown, iterative prompts/commits showing back-and-forth) rather than a single one-shot generation
- A short note on where the AI got it wrong and what you had to fix or redirect

Feel free to commit these prompt/instruction files alongside your code (a `.prompts/` or `.ai/` folder is a fine place for them).

---

## What We're Evaluating

- Can you design and build a working system end-to-end
- How you handle a continuous stream of incoming data rather than hand-entered records
- How you approach an ambiguous, real-world-shaped problem (the anomaly detection rules are deliberately underspecified)
- Testing instincts — what you test and why
- Code organization and adherence to good engineering principles
- Communication — your README and any notes on tradeoffs matter as much as the code
- How thoughtfully you use AI tools, if you use them

## What We're *Not* Evaluating

- Visual design polish
- Framework/language choice — use whatever stack you're most comfortable in (Python, Java, JS/TS, or anything else). We do not care what you pick.
- Whether you attempt the bonus section at all

---

## Submission Checklist

- [ ] Your own repo created from this template, with all work committed to it (sensible commit history — we like seeing how you got there, not just the final state)
- [ ] Repo link sent to us (and access granted if you made it private)
- [ ] `README.md` with setup/run instructions — including how to start the reading simulator
- [ ] Brief notes on design decisions and what you'd do differently with more time
- [ ] Tests included and passing

Good luck — and don't hesitate to note any assumptions you made along the way. We'd rather see a clearly-reasoned assumption than a guess we can't follow.

---

*Footnote: What we're really evaluating here is your thought process — how you break the problem down, the decisions you make, and why. A single prompt like "build this for me, go!" handed to an AI tool defeats the point of the exercise and will be obvious in the result (and in the commit history). We want to see your reasoning, not just working code.*
