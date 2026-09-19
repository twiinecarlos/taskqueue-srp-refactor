class QueueLogger {
  constructor(queueName) {
    this.queueName = queueName;
  }

  invalidTask() {
    console.error('Task must be a function.');
  }

  queueStarting() {
    console.log(`Starting queue ${this.queueName}.`);
  }

  highPriorityAdded(priority) {
    if (priority > 9) {
      console.warn(`High priority task added to ${this.queueName}.`);
    }
  }
}

class TaskQueue {
  constructor(name) {
    this.queueName = name;
    this.tasks = [];
    this.isProcessing = false;
  }

  addTask(taskFn, priority) {
    if (typeof taskFn !== 'function') {
      return false;
    }
    this.tasks.push({ taskFn, priority, timestamp: Date.now() });
    return true;
  }

  startProcessing() {
    this.isProcessing = true;
    // ... logic to process tasks ...
  }
}

class QueueScheduler {
  constructor(queue, logger = new QueueLogger(queue.queueName)) {
    this.queue = queue;
    this.logger = logger;
  }

  submit(taskFn, priority) {
    const added = this.queue.addTask(taskFn, priority);
    if (!added) {
      this.logger.invalidTask();
      return false;
    }
    if (this.queue.tasks.length === 1) {
      this.logger.queueStarting();
      this.queue.startProcessing();
    }
    this.logger.highPriorityAdded(priority);
    return true;
  }
}

module.exports = { TaskQueue, QueueLogger, QueueScheduler };
