import { Component, OnInit } from '@angular/core';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'technodev.page.html',
  styleUrls: ['technodev.page.scss'],
  standalone: false,
})
export class TechnoDevPage implements OnInit {
  selectedTab: string = 'file';
  promptText: string = '';
  selectedFile: File | null = null;
  isDragOver: boolean = false;
  isLoading: boolean = false;
  generatedQuestions: QuizQuestion[] = [];

  constructor() {}

  ngOnInit() {
    // Initialize component
  }

  onTabChange() {
    // Tab change handler
    console.log('Tab changed to:', this.selectedTab);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File) {
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain', 'image/png', 'image/jpeg'];

    if (file.size > maxSize) {
      console.error('File size exceeds 10 MB limit');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      console.error('File type not supported');
      return;
    }

    this.selectedFile = file;
  }

  clearFile() {
    this.selectedFile = null;
  }

  generateFromPrompt() {
    if (!this.promptText.trim()) {
      console.error('Please enter a prompt');
      return;
    }

    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.generatedQuestions = this.mockGenerateQuestions(this.promptText);
      this.isLoading = false;
      console.log('Quiz generated from prompt');
    }, 2000);
  }

  generateFromFile() {
    if (!this.selectedFile) {
      console.error('Please select a file');
      return;
    }

    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.generatedQuestions = this.mockGenerateQuestions(this.selectedFile?.name || 'Document');
      this.isLoading = false;
      console.log('Quiz generated from file:', this.selectedFile?.name);
    }, 2000);
  }

  startScanning() {
    console.log('Starting camera scan...');
    // TODO: Implement camera scanning functionality
  }

  downloadQuiz() {
    const quizContent = this.formatQuizForDownload();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(quizContent));
    element.setAttribute('download', 'quiz_questions.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    console.log('Quiz downloaded');
  }

  private formatQuizForDownload(): string {
    let content = 'TechnoDev Quiz Questions\n';
    content += '='.repeat(50) + '\n\n';

    this.generatedQuestions.forEach((q, index) => {
      content += `Question ${index + 1}: ${q.question}\n`;
      q.options.forEach((option, i) => {
        content += `  ${String.fromCharCode(65 + i)}) ${option}\n`;
      });
      content += `Correct Answer: ${q.correctAnswer}\n\n`;
    });

    return content;
  }

  private mockGenerateQuestions(source: string): QuizQuestion[] {
    return [
      {
        question: 'What is the primary purpose of this content?',
        options: ['To educate', 'To entertain', 'To inform', 'All of the above'],
        correctAnswer: 'To inform'
      },
      {
        question: 'Which of the following best describes the main topic?',
        options: ['Technical subject', 'General knowledge', 'Specialized domain', 'Undefined'],
        correctAnswer: 'Specialized domain'
      },
      {
        question: 'What key concept is emphasized in the document?',
        options: ['Innovation', 'Efficiency', 'Security', 'Scalability'],
        correctAnswer: 'Innovation'
      },
      {
        question: 'How would you apply this knowledge in practice?',
        options: ['In development', 'In testing', 'In deployment', 'In all stages'],
        correctAnswer: 'In all stages'
      },
      {
        question: 'What is the learning outcome from this material?',
        options: ['Theoretical understanding', 'Practical skills', 'Both theory and practice', 'Advanced expertise'],
        correctAnswer: 'Both theory and practice'
      }
    ];
  }
}
