// ✅ Removida a duplicata, adicionado recent_teammates
export interface LeetifyProfileResponse {
  privacy_mode: "public" | "private";
  winrate: number;
  total_matches: number;
  first_match_date: string;
  name: string;
  bans: Ban[];
  steam64_id: string;
  id: string;
  ranks: Ranks;
  rating: Rating;
  stats: Stats;
  recent_matches: RecentMatch[];
  recent_teammates: RecentTeammate[];
}

// ✅ Nova
export interface Ban {
  platform: string;
  platform_nickname: string;
  banned_since: string;
}

// ✅ Nova
export interface Ranks {
  leetify: number | null;
  premier: number | null;
  faceit: number | null;
  faceit_elo: number | null;
  wingman: number | null;
  renown: number | null;
  competitive: CompetitiveRank[];
}

// ✅ Nova
export interface CompetitiveRank {
  map_name: string;
  rank: number;
}

// ✅ Nova
export interface Rating {
  aim: number;
  positioning: number;
  utility: number;
  clutch: number;
  opening: number;
  ct_leetify: number;
  t_leetify: number;
}

// ✅ Nova
export interface RecentTeammate {
  steam64_id: string;
  recent_matches_count: number;
}

// ✅ Corrigido: rank_type nullable
export interface RecentMatch {
  id: string;
  finished_at: string;
  data_source: string;
  outcome: "win" | "loss" | "tie";
  rank: number;
  rank_type: number | null; // ← era number, mas pode ser null
  map_name: string;
  leetify_rating: number;
  score: [number, number];
  preaim: number;
  reaction_time_ms: number;
  accuracy_enemy_spotted: number;
  accuracy_head: number;
  spray_accuracy: number;
}

export interface Stats {
  accuracy_enemy_spotted: number;
  accuracy_head: number;
  counter_strafing_good_shots_ratio: number;
  ct_opening_aggression_success_rate: number;
  ct_opening_duel_success_percentage: number;
  flashbang_hit_foe_avg_duration: number;
  flashbang_hit_foe_per_flashbang: number;
  flashbang_hit_friend_per_flashbang: number;
  flashbang_leading_to_kill: number;
  flashbang_thrown: number;
  he_foes_damage_avg: number;
  he_friends_damage_avg: number;
  preaim: number;
  reaction_time_ms: number;
  spray_accuracy: number;
  t_opening_aggression_success_rate: number;
  t_opening_duel_success_percentage: number;
  traded_deaths_success_percentage: number;
  trade_kill_opportunities_per_round: number;
  trade_kills_success_percentage: number;
  utility_on_death_avg: number;
}