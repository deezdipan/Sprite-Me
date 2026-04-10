export type ContainerType = 'Can' | 'Bottle' | '2-Liter' | 'Cup';

export interface DrinkLog {
  id: string;
  user_id: string;
  type: ContainerType;
  quantity: number;
  logged_at: string;
  created_at: string;
}
