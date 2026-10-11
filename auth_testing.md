# Auth Testing Playbook (single admin, Bearer JWT)

1. MongoDB: db.admin_users.findOne({username:"admin"}) -> password_hash starts with "$2b$", token_version int.
   Indexes: admin_users.username (unique), login_attempts.identifier (unique), import_drafts.created_at (TTL 24h).
2. Login: curl -X POST $API/api/admin/login -H "Content-Type: application/json" -d '{"password":"admin123"}' -> {"token"}
3. Protected: curl $API/api/admin/me -H "Authorization: Bearer <token>" -> 200; old static token "bbp-admin-2026-secret-token" -> 401
4. Wrong password x5 -> 6th attempt 429 (lock 15 min). Reset: db.login_attempts.deleteMany({})
5. Change password -> new token returned; old token -> 401; login with new password works; restore to admin123 afterwards.
