import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create ExamTypes
  const foundationLevel = await prisma.examType.create({
    data: { name: 'Foundation Level', description: 'Basic level exam for ICAN' },
  })

  const skillLevel = await prisma.examType.create({
    data: { name: 'Skill Level', description: 'Intermediate level exam for ICAN' },
  })

  // Create Courses for Foundation Level
  const financialAccounting = await prisma.course.create({
    data: {
      name: 'Financial Accounting',
      examType: { connect: { id: foundationLevel.id } },
    },
  })

  const managementInformation = await prisma.course.create({
    data: {
      name: 'Management Information',
      examType: { connect: { id: foundationLevel.id } },
    },
  })

  // Create Courses for Skill Level
  const financialReporting = await prisma.course.create({
    data: {
      name: 'Financial Reporting',
      examType: { connect: { id: skillLevel.id } },
    },
  })

  // Create Diets for Financial Accounting
  const diets = await Promise.all([
    prisma.diet.create({
      data: {
        name: 'November 2023',
        course: { connect: { id: financialAccounting.id } },
      },
    }),
    prisma.diet.create({
      data: {
        name: 'May 2023',
        course: { connect: { id: financialAccounting.id } },
      },
    }),
  ])

  // Create sample questions for the first diet
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        type: QuestionType.MCQ,
        content: 'What is the primary purpose of financial accounting?',
        optionA: 'To provide information for internal decision-making',
        optionB: 'To calculate taxes',
        optionC: 'To provide financial information to external users',
        optionD: 'To manage day-to-day operations',
        optionE: 'To forecast future economic trends',
        correctAnswer: 'To provide financial information to external users',
        explanation: 'Financial accounting primarily aims to provide financial information to external stakeholders such as investors, creditors, and regulators.',
        simplifiedExplanation: 'It\'s about showing the company\'s financial health to people outside the company.',
        diet: { connect: { id: diets[0].id } },
        course: { connect: { id: financialAccounting.id } },
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.LONG_FORM,
        content: 'Explain the difference between accrual basis accounting and cash basis accounting.',
        correctAnswer: 'The main difference is in the timing of when revenues and expenses are recognized...',
        explanation: 'Accrual basis accounting records revenue when earned and expenses when incurred, regardless of cash flow. Cash basis accounting records transactions only when cash is received or paid.',
        simplifiedExplanation: 'Accrual basis is about when you earn or owe money, cash basis is about when you actually receive or pay money.',
        diet: { connect: { id: diets[0].id } },
        course: { connect: { id: financialAccounting.id } },
      },
    }),
  ])

  console.log({ foundationLevel, skillLevel, financialAccounting, managementInformation, financialReporting, diets, questions })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })