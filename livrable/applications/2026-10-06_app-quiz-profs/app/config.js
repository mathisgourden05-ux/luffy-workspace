// Réglages de connexion à Supabase.
// Vide = MODE DÉMO LOCAL (tout est stocké dans ce navigateur, pratique pour tester seul).
// Rempli = MODE EN LIGNE (profs et élèves partagent les mêmes données, sur tous les appareils).
// Où trouver ces deux valeurs : Supabase → ton projet → Project Settings → API.
window.QUIZ_CONFIG = {
  supabaseUrl: "https://ijitjsteecicgftywcfy.supabase.co",
  // clé "anon" (publique, pas la service_role !)
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaXRqc3RlZWNpY2dmdHl3Y2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0MTE1ODEsImV4cCI6MjEwNjk4NzU4MX0.5fxOGmYRrWZHbIwLx7MQgG6UFzOxnBYefpFDOirC_ZE",
};
