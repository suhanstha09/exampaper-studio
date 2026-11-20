/**
 * ExamPaper Studio - Built-in Templates & Title Block Presets
 */

window.EXAM_TEMPLATES = {
  // Title block style definitions
  titleStyles: {
    classic: {
      name: 'Classic Centered',
      desc: 'School title centered with double bottom border'
    },
    boxed: {
      name: 'Boxed Header',
      desc: 'Clean bordered box around exam header details'
    },
    twocolumn: {
      name: 'Two-Column Split',
      desc: 'School & exam left, subject/time/marks right'
    }
  },

  createTitleElement(style = 'classic', x = 56, y = 48, width = 682) {
    return {
      id: 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type: 'titleBlock',
      style: style, // 'classic' | 'boxed' | 'twocolumn'
      x: x,
      y: y,
      width: width,
      height: 122,
      fontFamily: 'Times New Roman',
      fontSize: 13,
      color: '#111827',
      bold: false,
      italic: false,
      underline: false,
      align: 'center',
      isPreeti: false,
      fields: {
        schoolName: 'SHREE SARASWATI SECONDARY SCHOOL',
        examName: 'First Terminal Examination - 2083',
        className: 'Class: 10',
        subject: 'Subject: Compulsory Science',
        time: 'Time: 2 Hrs. 15 Mins.',
        fullMarks: 'Full Marks: 75',
        date: 'Date: 2083/03/15'
      }
    };
  },

  getDocumentTemplate(templateKey) {
    const uid = () => 'el_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

    if (templateKey === 'blank') {
      return {
        title: 'Untitled Exam Paper',
        pages: [
          {
            id: 'page_' + Date.now(),
            orientation: 'portrait', // 'portrait' | 'landscape'
            elements: []
          }
        ]
      };
    }

    if (templateKey === 'unittest') {
      return {
        title: 'Unit Test - Class 8',
        pages: [
          {
            id: 'page_' + Date.now(),
            orientation: 'portrait',
            elements: [
              {
                id: uid(),
                type: 'titleBlock',
                style: 'classic',
                x: 56, y: 48, width: 682, height: 118,
                fontFamily: 'Times New Roman', fontSize: 13, color: '#111827',
                bold: false, italic: false, underline: false, align: 'center', isPreeti: false,
                fields: {
                  schoolName: 'EVEREST MODEL SECONDARY SCHOOL',
                  examName: 'First Monthly Unit Test - 2083',
                  className: 'Class: 8',
                  subject: 'Subject: Mathematics',
                  time: 'Time: 45 Mins.',
                  fullMarks: 'Full Marks: 25',
                  date: 'Date: 2083/02/10'
                }
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 182, width: 682, height: 28,
                content: 'Attempt all the questions. Figures in the margin indicate full marks.',
                fontFamily: 'Times New Roman', fontSize: 12, color: '#374151',
                bold: false, italic: true, underline: false, align: 'center', isPreeti: false,
                preset: 'Normal'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 222, width: 682, height: 30,
                content: 'Group A: Very Short Questions [5 × 1 = 5]',
                fontFamily: 'Times New Roman', fontSize: 14, color: '#111827',
                bold: true, italic: false, underline: true, align: 'left', isPreeti: false,
                preset: 'Section Heading'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 262, width: 682, height: 135,
                content:
                  '1. Define a rational number with one example.\t[1]\n' +
                  '2. Simplify: 3x + 5y - 2x + y\t[1]\n' +
                  '3. Find the perimeter of a square having side 6 cm.\t[1]\n' +
                  '4. Write the formula to calculate simple interest.\t[1]\n' +
                  '5. What is the sum of interior angles of a triangle?\t[1]',
                fontFamily: 'Times New Roman', fontSize: 13, color: '#111827',
                bold: false, italic: false, underline: false, align: 'left', isPreeti: false,
                preset: 'Question'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 416, width: 682, height: 30,
                content: 'Group B: Short & Long Questions [5 × 4 = 20]',
                fontFamily: 'Times New Roman', fontSize: 14, color: '#111827',
                bold: true, italic: false, underline: true, align: 'left', isPreeti: false,
                preset: 'Section Heading'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 456, width: 682, height: 180,
                content:
                  '6. Solve the equation: 2(x - 3) + 4 = 12.\t[4]\n' +
                  '7. A shopkeeper bought a watch for Rs. 1,200 and sold it at 15% profit. Find the selling price.\t[4]\n' +
                  '8. Construct a triangle ABC where AB = 5 cm, BC = 6 cm and ∠B = 60°.\t[4]\n' +
                  '9. Find the mean of the following data: 12, 15, 18, 20, 25.\t[4]\n' +
                  '10. Prove that the base angles of an isosceles triangle are equal.\t[4]',
                fontFamily: 'Times New Roman', fontSize: 13, color: '#111827',
                bold: false, italic: false, underline: false, align: 'left', isPreeti: false,
                preset: 'Question'
              }
            ]
          }
        ]
      };
    }

    if (templateKey === 'terminal') {
      return {
        title: 'Terminal Exam - Full Paper',
        pages: [
          {
            id: 'page_' + Date.now(),
            orientation: 'portrait',
            elements: [
              {
                id: uid(),
                type: 'titleBlock',
                style: 'boxed',
                x: 56, y: 48, width: 682, height: 124,
                fontFamily: 'Times New Roman', fontSize: 13, color: '#111827',
                bold: false, italic: false, underline: false, align: 'center', isPreeti: false,
                fields: {
                  schoolName: 'JANATA SECONDARY SCHOOL',
                  examName: 'First Terminal Examination - 2083',
                  className: 'Class: 9',
                  subject: 'Subject: Compulsory English',
                  time: 'Time: 3 Hrs.',
                  fullMarks: 'Full Marks: 75',
                  date: 'Date: 2083/03/22'
                }
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 186, width: 682, height: 30,
                content: 'Section A: Reading Comprehension [15 Marks]',
                fontFamily: 'Times New Roman', fontSize: 14, color: '#111827',
                bold: true, italic: false, underline: true, align: 'left', isPreeti: false,
                preset: 'Section Heading'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 224, width: 682, height: 135,
                content:
                  '1. Read the following passage carefully and answer the questions given below:\t[5]\n' +
                  'Education is the cornerstone of personal and national development. In rural Nepal, community schools are working tirelessly to integrate modern digital tools into daily classroom teaching while preserving cultural values.\n' +
                  'a. What is described as the cornerstone of development?\n' +
                  'b. How are community schools in rural Nepal improving teaching?',
                fontFamily: 'Times New Roman', fontSize: 13, color: '#111827',
                bold: false, italic: false, underline: false, align: 'left', isPreeti: false,
                preset: 'Question'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 376, width: 682, height: 30,
                content: 'Section B: Grammar & Objective Questions [10 Marks]',
                fontFamily: 'Times New Roman', fontSize: 14, color: '#111827',
                bold: true, italic: false, underline: true, align: 'left', isPreeti: false,
                preset: 'Section Heading'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 414, width: 682, height: 140,
                content:
                  '2. Choose the correct alternative to complete each sentence:\t[5 × 1 = 5]\n' +
                  'a. She has been living in Butwal ______ 2018.\n' +
                  '    (A) for        (B) since        (C) from        (D) by\n' +
                  'b. Neither Ram nor his friends ______ present yesterday.\n' +
                  '    (A) was        (B) were        (C) is        (D) are',
                fontFamily: 'Times New Roman', fontSize: 13, color: '#111827',
                bold: false, italic: false, underline: false, align: 'left', isPreeti: false,
                preset: 'Question'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 572, width: 682, height: 30,
                content: 'Section C: Creative Writing [15 Marks]',
                fontFamily: 'Times New Roman', fontSize: 14, color: '#111827',
                bold: true, italic: false, underline: true, align: 'left', isPreeti: false,
                preset: 'Section Heading'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 610, width: 682, height: 90,
                content:
                  '3. Write a letter to your friend describing your recent educational tour.\t[7]\n' +
                  '4. Write an essay on "Importance of Discipline in Student Life" in about 150 words.\t[8]',
                fontFamily: 'Times New Roman', fontSize: 13, color: '#111827',
                bold: false, italic: false, underline: false, align: 'left', isPreeti: false,
                preset: 'Question'
              }
            ]
          }
        ]
      };
    }

    if (templateKey === 'worksheet') {
      return {
        title: 'Practice Worksheet',
        pages: [
          {
            id: 'page_' + Date.now(),
            orientation: 'portrait',
            elements: [
              {
                id: uid(),
                type: 'titleBlock',
                style: 'twocolumn',
                x: 56, y: 48, width: 682, height: 112,
                fontFamily: 'Arial', fontSize: 12, color: '#111827',
                bold: false, italic: false, underline: false, align: 'left', isPreeti: false,
                fields: {
                  schoolName: 'SUNRISE ENGLISH BOARDING SCHOOL',
                  examName: 'Weekly Practice Worksheet - Unit 4',
                  className: 'Class: 6',
                  subject: 'Subject: Social Studies',
                  time: 'Time: 40 Mins.',
                  fullMarks: 'Full Marks: 20',
                  date: 'Date: 2083/04/05'
                }
              },
              {
                id: uid(),
                type: 'box',
                x: 56, y: 174, width: 682, height: 48,
                borderStyle: 'solid', borderWidth: 1, borderColor: '#374151',
                fillColor: '#f8fafc', label: 'Student Name: ___________________________    Roll No: _______'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 240, width: 682, height: 30,
                content: '1. Fill in the blanks with suitable words:',
                fontFamily: 'Arial', fontSize: 13, color: '#111827',
                bold: true, italic: false, underline: false, align: 'left', isPreeti: false,
                preset: 'Question'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 276, width: 682, height: 110,
                content:
                  'a. Lumbini is the birthplace of __________________________.\n' +
                  'b. Nepal is divided into __________________________ provinces.\n' +
                  'c. The highest peak in the world is __________________________. ',
                fontFamily: 'Arial', fontSize: 13, color: '#111827',
                bold: false, italic: false, underline: false, align: 'left', isPreeti: false,
                preset: 'Normal'
              },
              {
                id: uid(),
                type: 'text',
                x: 56, y: 400, width: 682, height: 30,
                content: '2. Answer the following questions in two sentences:',
                fontFamily: 'Arial', fontSize: 13, color: '#111827',
                bold: true, italic: false, underline: false, align: 'left', isPreeti: false,
                preset: 'Question'
              },
              {
                id: uid(),
                type: 'line',
                x: 56, y: 455, width: 682, height: 14,
                lineStyle: 'dotted', thickness: 1.5, color: '#4b5563', mmLength: 180, charCount: 45
              },
              {
                id: uid(),
                type: 'line',
                x: 56, y: 485, width: 682, height: 14,
                lineStyle: 'dotted', thickness: 1.5, color: '#4b5563', mmLength: 180, charCount: 45
              },
              {
                id: uid(),
                type: 'line',
                x: 56, y: 515, width: 682, height: 14,
                lineStyle: 'dotted', thickness: 1.5, color: '#4b5563', mmLength: 180, charCount: 45
              }
            ]
          }
        ]
      };
    }

    return this.getDocumentTemplate('blank');
  }
};
