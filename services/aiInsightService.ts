import { generateText } from '@fastshot/ai';
import { Property } from '@/types/property';

/**
 * Generate AI-powered investment insights for a property using Newell AI
 */
export async function generatePropertyInsight(property: Property): Promise<string> {
  try {
    const prompt = `You are an expert real estate investment analyst. Analyze this property and provide a concise 1-2 sentence investment insight focusing on market potential, ROI, and location advantages.

Property Details:
- Name: ${property.name}
- Type: ${property.type}
- Location: ${property.location}
- Goal Amount: $${property.goalAmount.toLocaleString()}
- Current Funding: $${property.raisedAmount.toLocaleString()} (${Math.round((property.raisedAmount / property.goalAmount) * 100)}%)
- Expected ROI: ${property.expectedROI}%
- Minimum Investment: $${property.minimumInvestment.toLocaleString()}

Provide a professional, data-driven insight that helps investors make informed decisions. Focus on market trends, appreciation potential, and investment grade quality.`;

    const response = await generateText({
      prompt,
      maxTokens: 150,
    });

    return response || 'Investment analysis pending. Please check back later.';
  } catch (error) {
    console.error('Error generating AI insight:', error);
    // Fallback to descriptive insight based on property data
    return generateFallbackInsight(property);
  }
}

/**
 * Generate fallback insight if AI service is unavailable
 */
function generateFallbackInsight(property: Property): string {
  const fundingPercentage = Math.round((property.raisedAmount / property.goalAmount) * 100);

  if (property.expectedROI >= 12) {
    return `Premium investment opportunity with ${property.expectedROI}% expected ROI. Strong investor interest with ${fundingPercentage}% funding achieved.`;
  } else if (fundingPercentage >= 80) {
    return `High demand property nearing funding goal (${fundingPercentage}%). Secure location in ${property.location.split(',')[1]} with consistent appreciation potential.`;
  } else {
    return `Solid ${property.type.toLowerCase()} investment in ${property.location}. Expected ${property.expectedROI}% ROI with accessible ${property.minimumInvestment.toLocaleString()} minimum entry.`;
  }
}

/**
 * Batch generate insights for multiple properties
 */
export async function generateBatchInsights(properties: Property[]): Promise<Map<string, string>> {
  const insights = new Map<string, string>();

  // Generate insights in parallel for better performance
  const promises = properties.map(async (property) => {
    try {
      const insight = await generatePropertyInsight(property);
      insights.set(property.id, insight);
    } catch (error) {
      console.error(`Error generating insight for property ${property.id}:`, error);
      insights.set(property.id, generateFallbackInsight(property));
    }
  });

  await Promise.all(promises);
  return insights;
}
