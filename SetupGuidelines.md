# Setup Guidelines (Git Basics)

If you haven't used Git/GitHub much before, this doc walks you through everything you need for this assignment, step by step. Don't worry about getting it perfect — the goal is just to get your work committed and pushed so we can review it.

**The short version:** use this repo as a template to create your own repo, do all your work there, and send us the link when you're done.

> **Please don't fork this repo or open a Pull Request against it.** Use the **Use this template** button instead (step 2). This gives you a clean, standalone repo of your own — your work stays yours, and it isn't mixed in with anyone else's.

## 1. Install Git

If you don't already have Git installed:

- **Windows:** download and install from [git-scm.com](https://git-scm.com/downloads)
- **Mac:** run `git --version` in Terminal — it'll prompt you to install if missing
- **Linux:** `sudo apt install git` (or your distro's equivalent)

Check it worked:

```bash
git --version
```

You'll also need a free GitHub account — sign up at [github.com](https://github.com) if you don't have one.

## 2. Create Your Repo From This Template

1. Go to the repo on GitHub: `https://github.com/Rohanmrao/kangasys-intern-take-home`
2. Click the green **Use this template** button (top right) → **Create a new repository**
3. Give it a name — something like `device-monitoring-service`
4. Set visibility to **Public** (simplest), or **Private** if you'd rather — see step 7 about giving us access
5. Click **Create repository**

You now have your own repo, pre-loaded with the problem statement and sample data, at `https://github.com/YOUR-USERNAME/device-monitoring-service`.

## 3. Clone Your Repo

This downloads your repo to your machine. Note the URL uses **your** username.

```bash
git clone https://github.com/YOUR-USERNAME/device-monitoring-service.git
cd device-monitoring-service
```

## 4. Do Your Work, Commit as You Go

You can work directly on `main`/`master` in your own repo — it's yours. (If you prefer to work on branches, go right ahead; that's good practice and we won't mark you down for it either way.)

Don't wait until everything is done to make one giant commit. Commit as you make progress — after setting up the project skeleton, after each feature, after adding tests, etc. We'll be reviewing your commit history too, so a series of small, sensible commits tells us more about how you worked than one big dump at the end.

Basic cycle:

```bash
# check what's changed
git status

# stage the files you want to commit
git add <file-or-folder>
# or, to stage everything you've changed
git add .

# commit with a short, clear message
git commit -m "Add device CRUD endpoints"

# push to GitHub
git push
```

## 5. Keep Pushing

Push regularly — don't just push once at the very end. Pushing as you go means that if something goes wrong on your machine, your work is safe, and it lets us see how the solution came together. There's no such thing as "too many commits."

## 6. Don't Commit Junk

Add a `.gitignore` early so you don't commit things that shouldn't be in version control — virtual environments (`.venv/`), `node_modules/`, local database files, `.env` files with secrets, build output. GitHub has ready-made templates for most languages.

**Never commit secrets** — API keys, passwords, AWS credentials. If you use any, load them from environment variables and document what's needed in your README.

## 7. Submitting Your Work

When you're done (or time's up):

1. Make sure everything is committed and pushed
2. Send us the link to your repo
3. **If your repo is private**, add us as a collaborator so we can actually see it: your repo → **Settings** → **Collaborators** → **Add people** → `Rohanmrao`

In your README, include a short summary: what you built, how to run it (including how to start the reading simulator), what you'd do with more time, and any assumptions you made.

## 8. Questions? Raise a GitHub Issue

If anything in the problem statement is unclear, or you hit a blocker you want to flag, open a GitHub Issue on **our** repo rather than guessing silently — asking a good clarifying question is a positive signal, not a negative one.

1. Go to `https://github.com/Rohanmrao/kangasys-intern-take-home`
2. Click the **Issues** tab
3. Click **New Issue**
4. Give it a short title (e.g. "Clarification on alert resolution behavior") and describe your question in the body
5. Click **Submit new issue**

We'll reply on the issue thread.

## Quick Reference

| What you want to do | Command |
|---|---|
| See what's changed | `git status` |
| Stage a file | `git add <file>` |
| Stage everything | `git add .` |
| Commit staged changes | `git commit -m "message"` |
| Push your work | `git push` |
| See your commit history | `git log --oneline` |
| Switch branches | `git checkout <branch-name>` |
| Create + switch to a new branch | `git checkout -b <branch-name>` |

## Recap

1. **Use this template** → your own repo → 2. **Clone** it → 3. **Commit & push** as you go → 4. **Send us the link**
