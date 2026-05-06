export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student' | 'staff';
  name: string;
  createdAt: Date;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  class: string;
  section: string;
  dateOfBirth: string;
  parentName: string;
  contactNumber: string;
  address: string;
  profileImage?: string;
  attendancePercentage?: number;
  plainPassword?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  contactNumber: string;
  joinDate: string;
  profileImage?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  class: string;
}

export interface Result {
  id: string;
  studentId: string;
  rollNumber: string;
  examType: string;
  subjects: {
    name: string;
    marks: number;
    maxMarks: number;
    grade: string;
  }[];
  totalMarks: number;
  percentage: number;
  grade: string;
  uploadedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  date: string;
  scheduledFor?: string;
  isActive: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  uploadedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  presentToday: number;
  absentToday: number;
  recentAnnouncements: Announcement[];
  recentResults: Result[];
}
