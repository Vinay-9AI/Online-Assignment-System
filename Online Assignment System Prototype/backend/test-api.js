(async function(){
  const base = 'http://localhost:4000';
  const log = (label, obj) => console.log('\n=== ' + label + ' ===\n', typeof obj === 'object' ? JSON.stringify(obj, null, 2) : obj);
  try{
    const root = await (await fetch(base + '/')).text();
    log('root', root);

    // register teacher
    let res = await fetch(base + '/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'Teacher One', email: 'teacher1@example.com', password: 'pass123', role: 'teacher' }) });
    const tr = await res.json(); log('teacher register status ' + res.status, tr);

    // login teacher
    res = await fetch(base + '/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email:'teacher1@example.com', password:'pass123' }) });
    const tl = await res.json(); log('teacher login status ' + res.status, tl);
    const token = tl.token;

    // create course
    res = await fetch(base + '/api/courses', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer ' + token}, body: JSON.stringify({ title:'Math 101', description:'Basics' }) });
    const course = await res.json(); log('create course status ' + res.status, course);

    // register student
    res = await fetch(base + '/api/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'Student One', email: 'student1@example.com', password: 'pass123', role: 'student' }) });
    const sr = await res.json(); log('student register status ' + res.status, sr);

    // login student
    res = await fetch(base + '/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email:'student1@example.com', password:'pass123' }) });
    const sl = await res.json(); log('student login status ' + res.status, sl);

    // assign student to course
    res = await fetch(base + '/api/courses/' + course._id + '/assign-students', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer ' + token}, body: JSON.stringify({ studentIds: [ sr.id ] }) });
    const assignResp = await res.json(); log('assign students status ' + res.status, assignResp);

    // create assignment
    res = await fetch(base + '/api/assignments', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer ' + token}, body: JSON.stringify({ courseId: course._id, title: 'HW1', description: 'Solve', dueDate: new Date(Date.now()+7*24*3600*1000).toISOString() }) });
    const assign = await res.json(); log('create assignment status ' + res.status, assign);

  } catch (err){
    console.error('Test script error', err);
  }
})();
