import { Routes } from '@angular/router';
import { PromptsHomePage } from './pages/prompts-home-page/prompts-home-page';
import { PromptFormPage } from './pages/prompt-form-page/prompt-form-page';

export const PROMPTS_ROUTES: Routes = [
  {
    path: '',
    component: PromptsHomePage,
    title: 'Prompts',
  },
  {
    path: 'new',
    component: PromptFormPage,
    title: 'New Prompt',
  },
  {
    path: ':id',
    component: PromptFormPage,
    title: 'Edit Prompt',
  },
];
