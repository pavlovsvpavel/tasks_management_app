interface Task {
  id: number;
  name: string;
  description: string;
  created_at: datetime;
  completed_at: datetime;
  completed: boolean;
  user_id: number;
}
