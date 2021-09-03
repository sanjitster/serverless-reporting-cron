var later = require('@breejs/later');
var sched = later.parse.text('at 9:41 am');
var occurrences = later.schedule(sched).next(10);
for (var i = 0; i < 10; i++) {
    // console.log(occurrences[i], new String(JSON.stringify(occurrences[i])).toString().replace(/\"/g, "") || '',)
    console.log(occurrences[i], new Date(occurrences[i]).toString());
}
// const occurrences2 = later.schedule(sched).next(1);
// console.log(typeof JSON.stringify(occurrences[0]));
// console.log(new String(JSON.stringify(occurrences2)).slice(1, -1), new String(occurrences[0]) || '')
// console.log(new String(JSON.stringify(occurrences2)).slice(1, -1));
// const t = new String(JSON.stringify(occurrences2)).slice(1, -1), 
//     date = new Date();
// var valid = later.schedule(schedule).isValid(date);
