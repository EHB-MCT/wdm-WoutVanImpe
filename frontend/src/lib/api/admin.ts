import { apiClient } from "./client";

/**
 * Represents a high-level user summary for the admin dashboard.
 * Includes basic account info and calculated risk metrics.
 */
export interface AdminUser {
	id: number;
	username: string;
	email: string;
	role: string;
	created_at: string;
	risk_score: number;
	risk_level: "laag" | "gemiddeld" | "hoog" | "geen_data";
	total_receipts: number;
	unique_cards: number;
	intervention_needed: boolean;
}

/**
 * Comprehensive user profile data for detailed analysis.
 * Contains financial habits, behavioral AI scoring, location patterns, and risk factors.
 */
export interface UserProfile {
	user: {
		id: number;
		username: string;
		email: string;
		role: string;
		created_at: string;
	};
	financial: {
		total_spent: number;
		transaction_count: number;
		average_transaction: number;
		unique_cards_count: number;
		unique_banks_count: number;
		unique_cards: string[];
		unique_banks: string[];
		payment_methods: Record<string, number>;
	};
	behavior: {
		average_health_score: number;
		average_sin_score: number;
		average_urgency_score: number;
		ai_flags: Record<string, number>;
	};
	location: {
		location_distribution: Record<string, number>;
		time_distribution: Record<string, number>;
		geographic_patterns: Record<string, number>;
	};
	risk: {
		overall_risk_score: number;
		risk_factors: {
			multiple_cards: "Hoog" | "Gemiddeld" | "Laag";
			high_sin_activity: "Hoog" | "Laag";
			night_activity: "Hoog" | "Laag";
		};
		intervention_needed: boolean;
		warnings: string[];
	};
}

/**
 * Aggregated system statistics.
 * Provides an overview of total activity and risk distribution across the platform.
 */
export interface GlobalStats {
	total_users: number;
	total_receipts: number;
	total_unique_cards: number;
	risk_distribution: {
		laag: number;
		gemiddeld: number;
		hoog: number;
	};
	average_cards_per_user: number;
}

/**
 * Service class responsible for administrative operations.
 * Handles fetching user lists, detailed profiles, and global system analytics.
 */
class AdminApiClient {
	private readonly client = apiClient;

	/**
	 * Fetches a list of all registered users.
	 * Includes their current risk assessments and summary metrics.
	 * @returns {Promise<{ success: boolean; data: AdminUser[]; total: number }>} The list of users and total count.
	 */
	async getUsers(): Promise<{ success: boolean; data: AdminUser[]; total: number }> {
		return this.client.get("/api/admin/users");
	}

	/**
	 * Retrieves a detailed profile for a specific user.
	 * Aggregates financial, behavioral, and location data for analysis.
	 * @param {number} userId - The unique ID of the user to fetch.
	 * @returns {Promise<{ success: boolean; data: UserProfile }>} The detailed user profile.
	 */
	async getUserProfile(userId: number): Promise<{ success: boolean; data: UserProfile }> {
		return this.client.get(`/api/admin/users/${userId}/profile`);
	}

	/**
	 * Get global system statistics.
	 * Returns aggregated data on user base, receipt volume, and overall risk levels.
	 * @returns {Promise<{ success: boolean; data: GlobalStats }>} The global statistics object.
	 */
	async getGlobalStats(): Promise<{ success: boolean; data: GlobalStats }> {
		return this.client.get("/api/admin/stats");
	}
}

export const adminApi = new AdminApiClient();
