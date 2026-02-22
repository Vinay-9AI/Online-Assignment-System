import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { 
  Plus, 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submissions: number;
  totalStudents: number;
}
 

interface Submission {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  status: 'pending' | 'graded';
  score?: number;
  maxScore: number;
  feedback?: string;
  fileUrl?: string;
}

interface TeacherDashboardProps {
  username: string;
  onLogout: () => void;
}

export function TeacherDashboard({ username, onLogout }: TeacherDashboardProps) {
  const { token } = useAuth();
  const [coursesCount, setCoursesCount] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseAssignments, setCourseAssignments] = useState<Assignment[]>([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('assignments');
  const [currentAssignmentTitle, setCurrentAssignmentTitle] = useState<string>('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const courses: any = await api.getCourses(token);
        if (Array.isArray(courses)) {
          setCourses(courses);
          setCoursesCount(courses.length);
          if (courses.length > 0 && !selectedCourseId) setSelectedCourseId(courses[0]._id || courses[0].id || null);
        }
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    }
    load();
  }, [token]);

  const loadCourses = async () => {
    if (!token) return;
    try {
      const cs: any = await api.getCourses(token);
      if (Array.isArray(cs)) {
        setCourses(cs);
        setCoursesCount(cs.length);
        if (cs.length > 0 && !selectedCourseId) setSelectedCourseId(cs[0]._id || cs[0].id || null);
      }
    } catch (err) {
      console.error('Failed to reload courses', err);
    }
  };

  const createCourse = async () => {
    if (!token || !newCourseTitle.trim()) return;
    try {
      await api.createCourse(token, { title: newCourseTitle, description: newCourseDescription });
      setNewCourseTitle('');
      setNewCourseDescription('');
      await loadCourses();
      toast.success('Course created');
    } catch (err) {
      console.error('Create course failed', err);
      toast.error('Failed to create course');
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!token) return;
    try {
      await api.deleteCourse(courseId, token);
      if (selectedCourseId === courseId) setSelectedCourseId(null);
      await loadCourses();
      toast.success('Course deleted');
    } catch (err) {
      console.error('Delete course failed', err);
      toast.error('Failed to delete course');
    }
  };

  const openAssignModal = async () => {
    if (!token) return;
    try {
      const users: any = await api.getAllUsers(token);
      if (Array.isArray(users)) {
        setAllUsers(users.filter((u: any) => u.role === 'student'));
      }
    } catch (err) {
      console.error('Failed to load users', err);
      toast.error('Failed to load users');
    }
  };

  const submitAssignStudents = async () => {
    if (!token || !selectedCourseId) return;
    try {
      await api.assignStudents(selectedCourseId, token, selectedStudentIds);
      toast.success('Students assigned');
      setSelectedStudentIds([]);
      await loadCourses();
    } catch (err) {
      console.error('Assign students failed', err);
      toast.error('Failed to assign students');
    }
  };

  useEffect(() => {
    if (selectedCourseId) loadAssignmentsForCourse(selectedCourseId);
  }, [selectedCourseId, token]);
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'React Fundamentals Project',
      description: 'Build a React application demonstrating component lifecycle and state management',
      dueDate: '2024-12-15',
      maxScore: 100,
      submissions: 18,
      totalStudents: 25
    },
    {
      id: '2',
      title: 'Database Design Assignment',
      description: 'Design a normalized database schema for an e-commerce application',
      dueDate: '2024-12-20',
      maxScore: 75,
      submissions: 12,
      totalStudents: 25
    }
  ]);

  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: '1',
      studentName: 'Alice Johnson',
      assignmentTitle: 'React Fundamentals Project',
      submittedAt: '2024-12-10 14:30',
      status: 'pending',
      maxScore: 100
    },
    {
      id: '2',
      studentName: 'Bob Smith',
      assignmentTitle: 'React Fundamentals Project',
      submittedAt: '2024-12-09 16:45',
      status: 'graded',
      score: 85,
      maxScore: 100,
      feedback: 'Great work on component structure. Consider adding more error handling.'
    },
    {
      id: '3',
      studentName: 'Carol Davis',
      assignmentTitle: 'Database Design Assignment',
      submittedAt: '2024-12-11 09:15',
      status: 'pending',
      maxScore: 75
    }
  ]);

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100
  });

  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  const handleCreateAssignment = () => {
    if (!token) { toast.error('Not authenticated'); return; }
    if (!selectedCourseId) { toast.error('Please select a course to create the assignment in'); return; }
    if (!newAssignment.title) { toast.error('Please enter an assignment title'); return; }
    if (!newAssignment.dueDate) { toast.error('Please select a due date'); return; }
    // call backend to create assignment
    api.createAssignment(token, { courseId: selectedCourseId, title: newAssignment.title, description: newAssignment.description, dueDate: newAssignment.dueDate })
      .then(() => {
        // reload assignments for the course
        loadAssignmentsForCourse(selectedCourseId);
        setActiveTab('assignments');
        setNewAssignment({ title: '', description: '', dueDate: '', maxScore: 100 });
      })
      .catch((err) => {
        console.error('Create assignment failed', err);
        toast.error('Failed to create assignment');
      });
  };

  const handleGradeSubmission = () => {
    if (!gradingSubmission || !gradeScore || !token) return;
    // call backend grade endpoint
    api.gradeSubmission(gradingSubmission.id, token, { grade: parseInt(gradeScore), feedback: gradeFeedback })
      .then(() => {
        // update local state optimistically
        const updatedSubmissions = submissions.map(sub => 
          sub.id === gradingSubmission.id 
            ? { 
                ...sub, 
                status: 'graded' as const, 
                score: parseInt(gradeScore), 
                feedback: gradeFeedback 
              }
            : sub
        );
        setSubmissions(updatedSubmissions);
        setGradingSubmission(null);
        setGradeScore('');
        setGradeFeedback('');
      })
      .catch((err) => {
        console.error('Grading failed', err);
        toast.error('Failed to submit grade');
      });
  };

  const loadAssignmentsForCourse = async (courseId: string) => {
    if (!token) return;
    try {
      const asg: any = await api.getAssignments(courseId, token);
      if (Array.isArray(asg)) {
        const mapped = asg.map((a: any) => ({ id: a._id || a.id, title: a.title, description: a.description, dueDate: a.dueDate, maxScore: a.maxScore || 100, submissions: a.submissions || 0, totalStudents: a.totalStudents || 0 }));
        setCourseAssignments(mapped);
        // auto-select first assignment and load its submissions
        if (mapped.length > 0) {
          setSelectedAssignmentId(mapped[0].id);
          setCurrentAssignmentTitle(mapped[0].title);
        } else {
          setSelectedAssignmentId(null);
          setCurrentAssignmentTitle('');
        }
      }
    } catch (err) {
      console.error('Failed to load assignments for course', err);
    }
  };

  const loadSubmissionsForAssignment = async (assignmentId: string) => {
    if (!token) return;
    try {
      const subs: any = await api.getSubmissions(assignmentId, token);
      if (Array.isArray(subs)) setSubmissions(subs.map((s: any) => ({ id: s.id || s._id, studentName: s.student?.name || s.student?.email || 'Student', assignmentTitle: s.assignment?.title || '', submittedAt: s.submittedAt, status: s.grade != null ? 'graded' : 'pending', score: s.grade, maxScore: s.maxScore || 100, feedback: s.feedback })));
    } catch (err) {
      console.error('Failed to load submissions', err);
    }
  };

  // when selectedAssignmentId changes, auto-load its submissions and switch to submissions tab
  useEffect(() => {
    if (selectedAssignmentId) {
      loadSubmissionsForAssignment(selectedAssignmentId);
      setActiveTab('submissions');
    }
  }, [selectedAssignmentId, token]);

  const handleDownload = async (submissionId: string) => {
    if (!token) return;
    try {
      const blob = await api.downloadSubmission(submissionId, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      console.error('Download failed', err);
      toast.error('Download failed');
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-2">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {username}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{(courseAssignments.length ? courseAssignments.length : assignments.length)}</p>
                  <p className="text-sm text-muted-foreground">Active Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 rounded-full p-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{pendingSubmissions.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{gradedSubmissions.length}</p>
                  <p className="text-sm text-muted-foreground">Graded This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Student Submissions</TabsTrigger>
            <TabsTrigger value="create">Create Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Assignment Overview</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground mr-2">Course:</label>
                <select value={selectedCourseId || ''} onChange={(e) => setSelectedCourseId(e.target.value)} className="border rounded px-2 py-1 text-sm">
                  <option value="">-- Select --</option>
                  {courses.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.title || c.name}</option>
                  ))}
                </select>
                <Button size="sm" onClick={() => { setAssignDialogOpen(true); openAssignModal(); }} className="ml-2">Assign Students</Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="ml-2">Delete</Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="ml-2">New Course</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Course</DialogTitle>
                      <DialogDescription>Provide a title and description for the new course</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="courseTitle">Title</Label>
                        <Input id="courseTitle" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="courseDesc">Description</Label>
                        <Textarea id="courseDesc" value={newCourseDescription} onChange={(e) => setNewCourseDescription(e.target.value)} rows={4} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={createCourse}>Create</Button>
                        <Button variant="outline">Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="grid gap-4">
              {(courseAssignments.length ? courseAssignments : assignments).map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {assignment.submissions}/{assignment.totalStudents} submitted
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Max Score: {assignment.maxScore}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Submission Progress</span>
                            <span>{Math.round((assignment.submissions / assignment.totalStudents) * 100)}%</span>
                          </div>
                          <Progress value={(assignment.submissions / assignment.totalStudents) * 100} />
                        </div>
                      </div>
                      
                      <Badge variant={assignment.submissions === assignment.totalStudents ? "default" : "secondary"}>
                        {assignment.submissions === assignment.totalStudents ? "Complete" : "In Progress"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assign Students Dialog (rendered near end so it can use state) */}
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Students</DialogTitle>
                <DialogDescription>Select students to assign to the selected course</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="max-h-64 overflow-auto">
                  {allUsers.map((u) => (
                    <div key={u._id || u.id} className="flex items-center gap-2 p-2">
                      <input type="checkbox" checked={selectedStudentIds.includes(u._id || u.id)} onChange={(e) => {
                        const id = u._id || u.id;
                        if (e.target.checked) setSelectedStudentIds(prev => [...prev, id]);
                        else setSelectedStudentIds(prev => prev.filter(x => x !== id));
                      }} />
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={async () => { await submitAssignStudents(); setAssignDialogOpen(false); }}>Assign</Button>
                  <Button variant="outline" onClick={() => { setSelectedStudentIds([]); setAssignDialogOpen(false); }}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Course</DialogTitle>
                <DialogDescription>Are you sure you want to delete this course? This action cannot be undone.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={async () => { if (selectedCourseId) { await deleteCourse(selectedCourseId); setDeleteDialogOpen(false); } }}>Delete</Button>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <TabsContent value="submissions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Student Submissions {currentAssignmentTitle ? `— ${currentAssignmentTitle}` : ''}</h2>
            </div>
            
            <div className="grid gap-4">
              {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{submission.studentName}</h3>
                          <Badge variant={submission.status === 'graded' ? "default" : "secondary"}>
                            {submission.status === 'graded' ? `${submission.score}/${submission.maxScore}` : 'Pending'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{submission.assignmentTitle}</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Submitted: {submission.submittedAt}
                        </p>
                        
                        {submission.feedback && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleDownload(submission.id)}>
                          Download
                        </Button>
                        {submission.status === 'pending' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setGradingSubmission(submission)}>
                                Grade
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Grade Submission</DialogTitle>
                                <DialogDescription>
                                  Grading {submission.studentName}'s submission for {submission.assignmentTitle}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="score">Score (out of {submission.maxScore})</Label>
                                  <Input
                                    id="score"
                                    type="number"
                                    min="0"
                                    max={submission.maxScore}
                                    value={gradeScore}
                                    onChange={(e) => setGradeScore(e.target.value)}
                                    placeholder="Enter score"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="feedback">Feedback</Label>
                                  <Textarea
                                    id="feedback"
                                    value={gradeFeedback}
                                    onChange={(e) => setGradeFeedback(e.target.value)}
                                    placeholder="Provide feedback to the student..."
                                    rows={4}
                                  />
                                </div>
                                
                                <Button onClick={handleGradeSubmission} className="w-full">
                                  Submit Grade
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Assignment</CardTitle>
                <CardDescription>
                  Create a new assignment for your students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="createCourse">Course</Label>
                  <select id="createCourse" value={selectedCourseId || ''} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full border rounded px-2 py-1">
                    <option value="">-- Select Course --</option>
                    {courses.map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.title || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="Enter assignment title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Describe the assignment requirements"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxScore">Maximum Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="1"
                      value={newAssignment.maxScore}
                      onChange={(e) => setNewAssignment({...newAssignment, maxScore: parseInt(e.target.value) || 100})}
                    />
                  </div>
                </div>
                
                <Button onClick={handleCreateAssignment} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}