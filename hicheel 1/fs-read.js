const fs = require('fs');

const data = fs.readFileSync('students.json', 'utf8')

const students = JSON.parse(data);

students.students.forEach(students => {
    console.log(students.id, students.name, students.age);
});


// console.log(students.students[0].name);
// console.log(students.students[0].age);
    