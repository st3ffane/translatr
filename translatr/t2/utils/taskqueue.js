var events = require('events');

/**
 * Juste un utilitaire pour me permettre de lancer des taches en parallele
 * en maitrisant le nombre (evite d'en balancer 20000 d'un coup...)
 */
var TaskQueue = new events.EventEmitter();

var TaskQueue = function( concurrents ){

    events.EventEmitter.call(this);
    this.concurrency = +concurrents || 10;
    this.queue = [];
    this.running = 0;
}

TaskQueue.prototype = Object.create(new events.EventEmitter());
/*
TaskQueue.concurrency = 0;
TaskQueue.queue = [];
TaskQueue.running = 0;
*/

TaskQueue.prototype.push = function (task){
    this.queue.push(task);
}

//todo: handler qud tout est fini?
TaskQueue.prototype.next = function() {

        
        var self = this;
        while(self.running < self.concurrency && self.queue.length) {
            var task = self.queue.shift();
            task().then(function() {
                self.running--;
                if(self.running == 0 && self.queue.length == 0) self.emit('end');
                else self.next();
            });
            self.running++;
        }
    
}

module.exports = function(count){
    return new TaskQueue(count);
    //TaskQueue.concurrency = count;
    //return TaskQueue;
}