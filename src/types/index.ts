export type IMCCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface UserData {
  name: string;
  accessCode: string;
  weight: number;
  height: number;
  imc: number;
  imcCategory: IMCCategory;
  waterIntake: number;
  capsuleDays: string[];
}

export interface Recipe {
  id: string;
  name: string;
  category: IMCCategory;
  mealTime: 'morning' | 'afternoon' | 'night';
  ingredients: string[];
  instructions: string[];
  calories: number;
  prepTime: string;
  image?: string;
}

export interface DetoxDrink {
  id: string;
  name: string;
  category: IMCCategory;
  timeOfDay: 'morning' | 'afternoon' | 'night';
  ingredients: string[];
  instructions: string[];
  benefits: string[];
  image?: string;
}

export interface Exercise {
  id: string;
  name: string;
  difficulty: 'easy' | 'moderate' | 'intense';
  duration: string;
  calories: number;
  description: string;
  steps: string[];
  image?: string;
}

export interface ProgressEntry {
  date: string;
  weight: number;
  imc: number;
  waterIntake: number;
  capsuleTaken: boolean;
}

export interface NotificationSettings {
  capsuleReminder: boolean;
  capsuleTime: string;
  waterReminder: boolean;
  waterInterval: number;
}
