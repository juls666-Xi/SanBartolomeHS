import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const teacherPassword = await bcrypt.hash("teacher123", 12);
  const studentPassword = await bcrypt.hash("student123", 12);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@sanbartolome.edu",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.email);

  // Create Teachers
  const teacher1 = await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "maria@sanbartolome.edu",
      password: teacherPassword,
      role: "TEACHER",
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: "Juan Cruz",
      email: "juan@sanbartolome.edu",
      password: teacherPassword,
      role: "TEACHER",
    },
  });
  console.log("Created teachers");

  // Create Students
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.create({
      data: {
        name: `Student ${i}`,
        email: `student${i}@sanbartolome.edu`,
        password: studentPassword,
        role: "STUDENT",
      },
    });
    students.push(student);
  }
  console.log("Created students");

  // Create Courses
  const mathCourse = await prisma.course.create({
    data: {
      title: "Mathematics 101",
      description: "Introduction to basic mathematics concepts for high school students.",
      teacherId: teacher1.id,
    },
  });

  const scienceCourse = await prisma.course.create({
    data: {
      title: "Science and Technology",
      description: "Exploring fundamental concepts in science and technology.",
      teacherId: teacher2.id,
    },
  });
  console.log("Created courses");

  // Create Modules for Math Course
  const mathModule1 = await prisma.module.create({
    data: {
      title: "Introduction to Algebra",
      description: "Basic algebraic concepts and operations",
      courseId: mathCourse.id,
      order: 0,
    },
  });

  const mathModule2 = await prisma.module.create({
    data: {
      title: "Geometry Fundamentals",
      description: "Understanding shapes, angles, and measurements",
      courseId: mathCourse.id,
      order: 1,
    },
  });

  // Create Modules for Science Course
  const scienceModule1 = await prisma.module.create({
    data: {
      title: "States of Matter",
      description: "Understanding solids, liquids, and gases",
      courseId: scienceCourse.id,
      order: 0,
    },
  });
  console.log("Created modules");

  // Create Lessons for Math Module 1
  await prisma.lesson.create({
    data: {
      title: "What is Algebra?",
      description: "Introduction to algebraic thinking and variables",
      type: "TEXT",
      moduleId: mathModule1.id,
      order: 0,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "Solving Linear Equations",
      description: "Step-by-step guide to solving linear equations",
      type: "DOCUMENT",
      moduleId: mathModule1.id,
      order: 1,
    },
  });

  // Create Lessons for Math Module 2
  await prisma.lesson.create({
    data: {
      title: "Understanding Angles",
      description: "Different types of angles and their measurements",
      type: "TEXT",
      moduleId: mathModule2.id,
      order: 0,
    },
  });

  // Create Lessons for Science Module 1
  await prisma.lesson.create({
    data: {
      title: "The Three States of Matter",
      description: "Understanding solids, liquids, and gases",
      type: "TEXT",
      moduleId: scienceModule1.id,
      order: 0,
    },
  });
  console.log("Created lessons");

  // Create Quizzes
  const mathQuiz = await prisma.quiz.create({
    data: {
      title: "Algebra Basics Quiz",
      description: "Test your understanding of basic algebra",
      timeLimit: 15,
      passingScore: 70,
      moduleId: mathModule1.id,
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: mathQuiz.id,
        question: "What is the value of x in the equation 2x + 5 = 15?",
        options: ["5", "10", "7.5", "20"],
        correctAnswer: 0,
        order: 0,
      },
      {
        quizId: mathQuiz.id,
        question: "Which of the following is a variable?",
        options: ["5", "y", "+", "="],
        correctAnswer: 1,
        order: 1,
      },
      {
        quizId: mathQuiz.id,
        question: "Simplify: 3(x + 2)",
        options: ["3x + 2", "3x + 5", "3x + 6", "x + 6"],
        correctAnswer: 2,
        order: 2,
      },
    ],
  });

  const scienceQuiz = await prisma.quiz.create({
    data: {
      title: "States of Matter Quiz",
      description: "Test your knowledge about states of matter",
      timeLimit: 10,
      passingScore: 60,
      moduleId: scienceModule1.id,
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: scienceQuiz.id,
        question: "Which state of matter has a fixed shape?",
        options: ["Liquid", "Gas", "Solid", "Plasma"],
        correctAnswer: 2,
        order: 0,
      },
      {
        quizId: scienceQuiz.id,
        question: "What is the process of a liquid becoming a gas?",
        options: ["Freezing", "Melting", "Condensation", "Evaporation"],
        correctAnswer: 3,
        order: 1,
      },
    ],
  });
  console.log("Created quizzes");

  // Create Enrollments
  for (const student of students.slice(0, 3)) {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: mathCourse.id,
      },
    });
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: scienceCourse.id,
      },
    });
  }
  console.log("Created enrollments");

  // Create Announcements
  await prisma.announcement.create({
    data: {
      title: "Welcome to Mathematics 101!",
      content: "Welcome students! Please review the course materials and complete the first module by next week.",
      courseId: mathCourse.id,
      authorId: teacher1.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Science Lab Next Week",
      content: "We will be conducting a lab experiment on states of matter. Please come prepared.",
      courseId: scienceCourse.id,
      authorId: teacher2.id,
    },
  });
  console.log("Created announcements");

  console.log("\n--- Seed Complete ---");
  console.log("Login credentials:");
  console.log("Admin: admin@sanbartolome.edu / admin123");
  console.log("Teacher: maria@sanbartolome.edu / teacher123");
  console.log("Student: student1@sanbartolome.edu / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
