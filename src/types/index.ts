export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
}

export interface CourseWithRelations {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  createdAt: Date;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      type: string;
    }[];
  }[];
  _count?: {
    enrollments: number;
  };
}

export interface LessonWithFiles {
  id: string;
  title: string;
  description: string | null;
  type: string;
  order: number;
  lessonFiles: {
    id: string;
    order: number;
    file: {
      id: string;
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
    };
  }[];
}
