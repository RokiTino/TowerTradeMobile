/**
 * AI Welcome Service
 * Generates personalized market briefings and welcome messages using Newell AI
 */

import { generateText } from '@fastshot/ai';
import { AuthUser } from './auth/AuthService';

export interface MarketBriefing {
  welcome: string;
  marketSummary: string;
  topProperties: string[];
  personalizedTip: string;
}

/**
 * Generate personalized welcome message for first-time social login
 */
export async function generatePersonalizedWelcome(
  user: AuthUser,
  isFirstLogin: boolean = true
): Promise<MarketBriefing> {
  try {
    const userName = user.displayName || user.email?.split('@')[0] || 'Investor';
    const timeOfDay = getTimeOfDay();

    const prompt = `You are TowerTrade's premium AI investment advisor. Generate a warm, sophisticated welcome message for ${userName} who just ${isFirstLogin ? 'joined' : 'signed in to'} our luxury real estate investment platform.

Context:
- User: ${userName}
- Time: ${timeOfDay}
- Platform: TowerTrade - Premium Real Estate Investment
- First Login: ${isFirstLogin ? 'Yes' : 'No'}

Generate a response in JSON format with these fields:
{
  "welcome": "Warm, personalized greeting (2-3 sentences)",
  "marketSummary": "Brief market overview highlighting current opportunities (2-3 sentences)",
  "topProperties": ["3 curated property recommendations matching luxury investment profile"],
  "personalizedTip": "One actionable investment tip for today (1-2 sentences)"
}

Keep the tone professional yet warm, befitting a wealth management platform. Focus on exclusivity and premium opportunities.`;

    const response = await generateText({
      prompt,
      maxTokens: 400,
    });

    // Parse AI response
    try {
      const briefing = JSON.parse(response || '{}');
      return {
        welcome: briefing.welcome || `Good ${timeOfDay}, ${userName}! Welcome to TowerTrade.`,
        marketSummary:
          briefing.marketSummary ||
          'Premium real estate opportunities are currently trending across beachfront and urban sectors.',
        topProperties: briefing.topProperties || [
          'Coastal Heights Residency - 12% projected ROI',
          'Metropolitan Tower Suite - Prime location',
          'Harbor View Estates - Waterfront excellence',
        ],
        personalizedTip:
          briefing.personalizedTip ||
          'Consider diversifying your portfolio with a mix of urban and coastal properties for optimal returns.',
      };
    } catch {
      // Fallback if JSON parsing fails
      return generateFallbackBriefing(userName, timeOfDay);
    }
  } catch (error) {
    console.error('Error generating AI welcome:', error);
    return generateFallbackBriefing(
      user.displayName || 'Investor',
      getTimeOfDay()
    );
  }
}

/**
 * Generate fallback briefing if AI is unavailable
 */
function generateFallbackBriefing(userName: string, timeOfDay: string): MarketBriefing {
  return {
    welcome: `Good ${timeOfDay}, ${userName}! Welcome to TowerTrade, where premium real estate investment meets sophisticated technology.`,
    marketSummary:
      'The luxury real estate market is showing strong momentum with coastal and urban properties leading appreciation trends. Prime investment opportunities await.',
    topProperties: [
      'Beachfront Properties - High demand, 10-15% ROI',
      'Urban Development Projects - Growth potential',
      'Suburban Family Homes - Stable returns',
    ],
    personalizedTip:
      'Start by exploring our curated beachfront collection - these properties historically deliver strong appreciation and rental yields.',
  };
}

/**
 * Get time of day greeting
 */
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Generate smart portfolio recommendation based on user profile
 */
export async function generatePortfolioRecommendation(
  user: AuthUser,
  currentInvestments: number = 0
): Promise<string> {
  try {
    const prompt = `As TowerTrade's AI advisor, provide a brief (2-3 sentences) personalized portfolio diversification recommendation for ${
      user.displayName || 'this investor'
    }.

Current portfolio size: ${currentInvestments} properties
Investment profile: Premium real estate investor

Focus on balance, risk mitigation, and growth potential. Be specific and actionable.`;

    const response = await generateText({
      prompt,
      maxTokens: 150,
    });

    return (
      response ||
      'Consider balancing your portfolio with a mix of high-growth urban properties and stable suburban investments for optimal risk-adjusted returns.'
    );
  } catch (error) {
    console.error('Error generating portfolio recommendation:', error);
    return 'Diversify across property types and locations to maximize returns while managing risk effectively.';
  }
}
