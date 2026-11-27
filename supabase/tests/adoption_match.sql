-- pgTAP tests for ADP-10 Smart Adoption Matching
BEGIN;
SELECT plan(8);

-- 1. adopter_preferences table exists
SELECT has_table('public', 'adopter_preferences', 'adopter_preferences table exists');

-- 2. adoption_match_logs table exists
SELECT has_table('public', 'adoption_match_logs', 'adoption_match_logs table exists');

-- 3. adopter_preferences has user_id column
SELECT has_column('public', 'adopter_preferences', 'user_id', 'adopter_preferences.user_id exists');

-- 4. adopter_preferences has species column
SELECT has_column('public', 'adopter_preferences', 'species', 'adopter_preferences.species exists');

-- 5. adopter_preferences has match scoring columns
SELECT has_column('public', 'adopter_preferences', 'wants_vaccinated', 'adopter_preferences.wants_vaccinated exists');

-- 6. adoption_match_logs has score column
SELECT has_column('public', 'adoption_match_logs', 'score', 'adoption_match_logs.score exists');

-- 7. upsert_adopter_preferences RPC exists
SELECT has_function('public', 'upsert_adopter_preferences', 'upsert_adopter_preferences() exists');

-- 8. get_adoption_matches RPC exists
SELECT has_function('public', 'get_adoption_matches', 'get_adoption_matches() exists');

SELECT finish();
ROLLBACK;
