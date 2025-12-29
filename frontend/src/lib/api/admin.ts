import { apiClient } from "./client";

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

class AdminApiClient {
	private readonly client = apiClient;

	/**
	 * Get all users with their risk assessments
	 */
	async getUsers(): Promise<{ success: boolean; data: AdminUser[]; total: number }> {
		return this.client.get("/api/admin/users");
	}

	/**
	 * Get detailed profile for a specific user
	 */
	async getUserProfile(userId: number): Promise<{ success: boolean; data: UserProfile }> {
		return this.client.get(`/api/admin/users/${userId}/profile`);
	}

	/**
	 * Get global system statistics
	 */
	async getGlobalStats(): Promise<{ success: boolean; data: GlobalStats }> {
		return this.client.get("/api/admin/stats");
	}
}

export const adminApi = new AdminApiClient();
