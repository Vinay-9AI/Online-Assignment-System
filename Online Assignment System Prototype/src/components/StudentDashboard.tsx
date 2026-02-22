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
  BookOpen, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  LogOut,
  Star,
  TrendingUp
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
  status: 'not_started' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  submittedAt?: string;
}

interface StudentDashboardProps {
  username: string;
  onLogout: () => void;
}

export function StudentDashboard({ username, onLogout }: StudentDashboardProps) {
  const { token } = useAuth();
  const [coursesCount, setCoursesCount] = useState<number | null>(null);

  // load assignments from backend for the student
  useEffect(() => {
    async function loadStudentAssignments() {
      if (!token) return;
      try {
        const courses: any = await api.getCourses(token);
        if (!Array.isArray(courses)) return;
        // fetch assignments for each course
        const lists = await Promise.all(courses.map((c: any) => api.getAssignments(c._id || c.id, token).catch(() => [])));
        const allAssignments: any[] = lists.flat();
        // fetch student's submissions to mark status
        const subs: any = await api.getStudentSubmissions(token).catch(() => []);
        const byAssignment: Record<string, any> = {};
        if (Array.isArray(subs)) {
          subs.forEach((s: any) => {
            const aid = s.assignment && (s.assignment._id || s.assignment.id) || (s.assignment || s.assignment);
            byAssignment[aid] = s;
          });
        }

        const mapped = allAssignments.map((a: any) => {
          const id = a._id || a.id;
          const sub = byAssignment[id];
          if (sub) {
            return {
              id,
              title: a.title,
              description: a.description,
              dueDate: a.dueDate,
              maxScore: a.maxScore || 100,
              status: sub.grade != null ? 'graded' : 'submitted',
              score: sub.grade,
              feedback: sub.feedback,
              submittedAt: sub.submittedAt
            } as Assignment;
          }
          return {
            id,
            title: a.title,
            description: a.description,
            dueDate: a.dueDate,
            maxScore: a.maxScore || 100,
            status: 'not_started'
          } as Assignment;
        });

        setAssignments(mapped);
      } catch (err) {
        console.error('Failed to load student assignments', err);
      }
    }
    loadStudentAssignments();
  }, [token]);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const courses: any = await api.getCourses(token);
        if (Array.isArray(courses)) setCoursesCount(courses.length);
      } catch (err) {
        console.error('Failed to load courses for student', err);
      }
    }
    load();
  }, [token]);
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'React Fundamentals Project',
      description: 'Build a React application demonstrating component lifecycle and state management',
      dueDate: '2024-12-15',
      maxScore: 100,
      status: 'graded',
      score: 85,
      feedback: 'Great work on component structure. Consider adding more error handling.',
      submittedAt: '2024-12-10 14:30'
    },
    {
      id: '2',
      title: 'Database Design Assignment',
      description: 'Design a normalized database schema for an e-commerce application',
      dueDate: '2024-12-20',
      maxScore: 75,
      status: 'submitted',
      submittedAt: '2024-12-11 09:15'
    },
    {
      id: '3',
      title: 'API Integration Project',
      description: 'Create a web application that integrates with a RESTful API',
      dueDate: '2024-12-25',
      maxScore: 90,
      status: 'not_started'
    },
    {
      id: '4',
      title: 'CSS Responsive Design',
      description: 'Build a responsive website using modern CSS techniques',
      dueDate: '2024-12-30',
      maxScore: 80,
      status: 'not_started'
    }
  ]);

  const [submissionText, setSubmissionText] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmitAssignment = async () => {
    if (!submittingAssignment) return;
    if (!selectedFile) {
      toast.error('Please choose a file to upload for submission.');
      return;
    }
    if (!token) {
      toast.error('Not authenticated');
      return;
    }
    try {
      // ensure assignment id is the backend id
      const assignmentId = submittingAssignment.id;
      await api.submitAssignment(token, assignmentId, selectedFile);
      // optimistically update UI
      const updatedAssignments = assignments.map(assignment =>
        assignment.id === submittingAssignment.id
          ? {
              ...assignment,
              status: 'submitted' as const,
              submittedAt: new Date().toLocaleString()
            }
          : assignment
      );
      setAssignments(updatedAssignments);
      setSubmittingAssignment(null);
      setSubmissionText('');
      setSelectedFile(null);
      toast.success('Assignment submitted');
      // try to refresh student submissions (for teacher view later)
      try {
        const subs: any = await api.getStudentSubmissions(token);
        // (optional) do something with subs or store them elsewhere
        console.log('Student submissions refreshed', subs);
      } catch (err) {
        console.warn('Could not refresh student submissions', err);
      }
    } catch (err) {
      console.error('Submit failed', err);
      toast.error('Failed to submit assignment');
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'graded': return 'default';
      case 'submitted': return 'secondary';
      case 'not_started': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: Assignment['status']) => {
    switch (status) {
      case 'graded': return 'Graded';
      case 'submitted': return 'Submitted';
      case 'not_started': return 'Not Started';
      default: return 'Unknown';
    }
  };

  const completedAssignments = assignments.filter(a => a.status === 'graded');
  const pendingAssignments = assignments.filter(a => a.status === 'submitted');
  const upcomingAssignments = assignments.filter(a => a.status === 'not_started');
  
  const averageScore = completedAssignments.length > 0 
    ? completedAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssignments.length 
    : 0;

  const upcomingDeadlines = assignments
    .filter(a => a.status === 'not_started')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

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
              <h1 className="text-xl font-semibold">Student Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{completedAssignments.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{pendingAssignments.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 rounded-full p-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{upcomingAssignments.length}</p>
                  <p className="text-sm text-muted-foreground">Due Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{Math.round(averageScore)}%</p>
                  <p className="text-sm text-muted-foreground">Average Grade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Assignments</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="submitted">Submitted</TabsTrigger>
                <TabsTrigger value="graded">Graded</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{assignment.title}</h3>
                              <Badge variant={getStatusColor(assignment.status)}>
                                {getStatusText(assignment.status)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                            
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Max Score: {assignment.maxScore}
                              </div>
                              {getDaysUntilDue(assignment.dueDate) > 0 && assignment.status === 'not_started' && (
                                <div className="flex items-center gap-2 text-orange-600">
                                  <AlertTriangle className="w-4 h-4" />
                                  {getDaysUntilDue(assignment.dueDate)} days left
                                </div>
                              )}
                            </div>
                            
                            {assignment.score !== undefined && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span>Your Score</span>
                                  <span>{assignment.score}/{assignment.maxScore} ({Math.round((assignment.score / assignment.maxScore) * 100)}%)</span>
                                </div>
                                <Progress value={(assignment.score / assignment.maxScore) * 100} />
                              </div>
                            )}
                            
                            {assignment.feedback && (
                              <div className="mt-4 bg-blue-50 rounded-lg p-3">
                                <p className="text-sm font-medium mb-1">Teacher Feedback:</p>
                                <p className="text-sm">{assignment.feedback}</p>
                              </div>
                            )}
                            
                            {assignment.submittedAt && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Submitted: {assignment.submittedAt}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {assignment.status === 'not_started' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="w-full gap-2"
                                onClick={() => setSubmittingAssignment(assignment)}
                              >
                                <Upload className="w-4 h-4" />
                                Submit Assignment
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Submit Assignment</DialogTitle>
                                <DialogDescription>
                                  Submit your work for: {assignment.title}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="submission">Your Submission</Label>
                                  <Textarea
                                    id="submission"
                                    value={submissionText}
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    placeholder="Paste your submission text, code, or provide links to your work..."
                                    rows={6}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="file">Upload File (Optional)</Label>
                                  <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt,.zip"
                                    onChange={(e) => {
                                      const f = (e.target as HTMLInputElement).files?.[0] || null;
                                      setSelectedFile(f);
                                    }}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Supported formats: PDF, DOC, DOCX, TXT, ZIP
                                  </p>
                                </div>
                                
                                <Button onClick={handleSubmitAssignment} className="w-full">
                                  Submit Assignment
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <div className="grid gap-4">
                  {upcomingAssignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-6">
                        {/* Same card content but filtered for pending */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{assignment.title}</h3>
                              <Badge variant="destructive">Not Started</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                {getDaysUntilDue(assignment.dueDate)} days left
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full gap-2">
                          <Upload className="w-4 h-4" />
                          Submit Assignment
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="submitted" className="space-y-4">
                <div className="grid gap-4">
                  {pendingAssignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{assignment.title}</h3>
                          <Badge variant="secondary">Under Review</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {assignment.submittedAt}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="graded" className="space-y-4">
                <div className="grid gap-4">
                  {completedAssignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{assignment.title}</h3>
                          <Badge>Graded</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
                        
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Your Score</span>
                            <span>{assignment.score}/{assignment.maxScore} ({Math.round((assignment.score! / assignment.maxScore) * 100)}%)</span>
                          </div>
                          <Progress value={(assignment.score! / assignment.maxScore) * 100} />
                        </div>
                        
                        {assignment.feedback && (
                          <div className="mt-4 bg-blue-50 rounded-lg p-3">
                            <p className="text-sm font-medium mb-1">Teacher Feedback:</p>
                            <p className="text-sm">{assignment.feedback}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingDeadlines.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getDaysUntilDue(assignment.dueDate)}d
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Completion Rate</span>
                    <span>{Math.round((completedAssignments.length / assignments.length) * 100)}%</span>
                  </div>
                  <Progress value={(completedAssignments.length / assignments.length) * 100} />
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">This semester:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Assignments:</span>
                      <span>{assignments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span>{completedAssignments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Score:</span>
                      <span>{Math.round(averageScore)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}