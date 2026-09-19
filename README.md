# TaskQueue: SRP and Scope Refactor

Task 1: AI Implementation & Quality (Pair Programming with AI).

A legacy `TaskQueue` class mixed task storage, logging, and scheduling inside `addTask`, and had a scope bug: the inner `notify()` function used `name`, which is not in scope. This repo contains the legacy file, the AI-assisted refactor, and the prompts, evidence, and reflection from the exercise.

## Files

| File | Description |
|---|---|
| `task_queue_legacy.js` | Original class (SRP violations and scope bug) |
| `task_queue_clean.js` | Refactored version |
| `screenshots/` | AI responses used as evidence |

## Usage

```js
const { TaskQueue, QueueScheduler } = require('./task_queue_clean');

const queue = new TaskQueue('emails');
const scheduler = new QueueScheduler(queue);

scheduler.submit(() => console.log('send'), 10);
// Starting queue emails.
// High priority task added to emails.
```

`addTask` no longer logs or starts the queue. Use `scheduler.submit()` for that behavior.

## What Changed

| Responsibility | Legacy | Clean |
|---|---|---|
| Validate and store the task | `addTask` | `TaskQueue.addTask` (returns `true` / `false`) |
| Logging | `console.*` calls inside `addTask` | `QueueLogger` |
| Deciding when to start | `tasks.length === 1` inside `addTask` | `QueueScheduler.submit` |
| High-priority warning | inner `notify()` using undefined `name` | `QueueLogger.highPriorityAdded` using `this.queueName` |

**Scope fix:** `name` was the constructor's parameter and was never in `addTask`'s scope chain, so `notify()` threw a `ReferenceError` only when `priority > 9`. The inner function is gone, `priority` is passed as a parameter, and the queue name comes from `this.queueName`.

## Prompts

### 1. Audit (scope and closures)

```text
Act as a senior JavaScript reviewer. Analyze the addTask method in the class below.

Context: this is legacy code from a task queue. I'm auditing it for scope and closure problems.

Please:
1. Explain the scope of the inner notify() function: where it's declared, where it can be called, and what outer variables it "closes over" (priority, this, name, etc.).
2. Explain how the closure is created in this specific case, step by step.
3. Identify any variable in the notify function that is not actually in scope, and say what happens at runtime when priority > 9.
4. Tell me which variables should be block-scoped (let/const) but aren't, and why that matters for predictable code.
5. Give a corrected notify that fixes the scope issue, without changing behavior otherwise.

Format: short numbered sections, with code snippets only where needed.
```

### 2. Refactoring (SRP)

```text
Act as a software architect. Review the TaskQueue class below for Single Responsibility Principle violations.

Please:
1. List every SRP violation in addTask (consider the queue-state check, logging, and scheduling/starting the processing).
2. Refactor the class so that addTask is only responsible for validating and adding the task to the array. Extract the logging and scheduling logic into a separate function or class (e.g., a QueueLogger and/or a QueueScheduler).
3. Fix the notify scope issue in the refactor (no undefined or shadowed `name`; use this.queueName).
4. Explain why the refactored version improves testability and maintainability, with one concrete example (e.g., how you'd unit test addTask now).

Return the full refactored file, then the explanation.
```

### 3. Verification

```text
Review the file below (task_queue_clean.js), which is a refactor of a legacy TaskQueue class.

Confirm whether each of these is resolved, and quote the relevant lines as evidence:
1. addTask only validates and adds the task (no logging or scheduling inside it).
2. The logging/scheduling logic lives in a separate function or class.
3. The notify scope issue is fixed (no undefined or shadowed `name`; variables correctly block-scoped).

Then list any remaining SRP or scope problems, or say explicitly that there are none.
```

## Evidence

![AI explanation of scope and closure in notify()](screenshots/1-scope-closure.png)

![AI refactored code and SRP explanation](screenshots/2-srp-refactor.png)

## Reflection

Because LLMs are pattern-matching engines rather than code executors, asking an AI to simply "fix the code" gets me output that looks plausible but that the model never ran, with no explanation I can check. Asking it to audit structure (scope chains, closures, and the Single Responsibility Principle) played to what it does well and showed me that `name` inside `notify()` was never in `addTask`'s scope chain, so it throws a ReferenceError only when `priority > 9`, a bug that low-priority test runs would never reveal. That understanding let me judge the refactor myself and then confirm it by running the code in Node, instead of trusting the AI's answer.
