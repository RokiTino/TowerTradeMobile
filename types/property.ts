export interface Property {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  goalAmount: number;
  raisedAmount: number;
  location: string;
  type: string;
  expectedROI: number;
  minimumInvestment: number;
  aiInsight?: string;
}

export interface Investment {
  id: string;
  propertyId: string;
  amount: number;
  date: Date;
  status: 'active' | 'completed' | 'cancelled';
}
