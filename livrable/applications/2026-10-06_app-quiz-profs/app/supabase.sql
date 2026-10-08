-- =====================================================================
--  QuizClasse — base de données Supabase
--  À coller en entier dans Supabase → SQL Editor → Run. Rejouable sans risque.
--  Les élèves n'ont AUCUN accès direct aux tables : ils passent uniquement
--  par les fonctions qz_* ci-dessous (les bonnes réponses ne quittent jamais le serveur).
-- =====================================================================

create table if not exists qz_classes (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  code text not null unique,
  visibility text not null default 'full' check (visibility in ('full','top3','self')),
  reset_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists qz_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references qz_classes(id) on delete cascade,
  pseudo text not null,
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create unique index if not exists qz_members_pseudo on qz_members(class_id, lower(pseudo));

create table if not exists qz_quizzes (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default 'Nouveau quiz',
  subject text default '',
  level text default '',
  questions jsonb not null default '[]',
  settings jsonb not null default '{}',
  code text not null unique,
  published boolean not null default false,
  class_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists qz_attempts (
  id uuid primary key default gen_random_uuid(),
  token uuid not null default gen_random_uuid(),
  quiz_id uuid not null references qz_quizzes(id) on delete cascade,
  class_id uuid references qz_classes(id) on delete cascade,
  member_id uuid references qz_members(id) on delete cascade,
  pseudo text not null,
  answers jsonb not null default '{}',
  score int not null default 0,
  max_score int not null default 0,
  current_q int not null default 0,
  status text not null default 'in_progress' check (status in ('in_progress','locked','finished')),
  leaves int not null default 0,
  leave_log jsonb not null default '[]',
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists qz_attempts_quiz on qz_attempts(quiz_id);
create index if not exists qz_attempts_class on qz_attempts(class_id);

-- ---------- Sécurité : le prof ne voit que ses données ----------
alter table qz_classes enable row level security;
alter table qz_members enable row level security;
alter table qz_quizzes enable row level security;
alter table qz_attempts enable row level security;

drop policy if exists qz_classes_owner on qz_classes;
create policy qz_classes_owner on qz_classes for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists qz_quizzes_owner on qz_quizzes;
create policy qz_quizzes_owner on qz_quizzes for all to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists qz_members_owner on qz_members;
create policy qz_members_owner on qz_members for all to authenticated
  using (exists (select 1 from qz_classes c where c.id = class_id and c.owner = auth.uid()));

drop policy if exists qz_attempts_owner on qz_attempts;
create policy qz_attempts_owner on qz_attempts for all to authenticated
  using (exists (select 1 from qz_quizzes q where q.id = quiz_id and q.owner = auth.uid()));

-- ---------- Outils ----------
create or replace function qz_norm(s text) returns text language sql immutable as $$
  select trim(regexp_replace(regexp_replace(lower(translate(coalesce(s,''),
    'àâäáãéèêëíìîïóòôöõúùûüçñÀÂÄÁÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn')), '\s+', ' ', 'g'), '[.!?]+\s*$', ''))
$$;

create or replace function qz_grade(q jsonb, a jsonb) returns boolean language plpgsql immutable as $$
declare t text := q->>'type';
begin
  if a is null or a = 'null'::jsonb then return false; end if;
  if t in ('single','multi') then
    if jsonb_typeof(a) <> 'array' then return false; end if;
    return (select coalesce(array_agg(distinct x::int order by x::int), '{}') from jsonb_array_elements_text(q->'correct') x)
         = (select coalesce(array_agg(distinct x::int order by x::int), '{}') from jsonb_array_elements_text(a) x);
  elsif t = 'tf' then
    return a = (q->'correct');
  elsif t = 'short' then
    return exists (select 1 from jsonb_array_elements_text(q->'correct') c where qz_norm(c) = qz_norm(a #>> '{}'));
  end if;
  return false;
exception when others then return false;
end $$;

-- Membre d'une classe (pseudo réservé, identifié par un jeton gardé sur l'appareil)
create or replace function qz_member(p_class uuid, p_pseudo text, p_token uuid) returns qz_members
language plpgsql security definer set search_path = public as $$
declare m qz_members;
begin
  select * into m from qz_members where class_id = p_class and lower(pseudo) = lower(p_pseudo);
  if found then
    if p_token is distinct from m.token then raise exception 'PSEUDO_PRIS'; end if;
  else
    insert into qz_members(class_id, pseudo) values (p_class, p_pseudo) returning * into m;
  end if;
  return m;
end $$;
revoke all on function qz_member(uuid, text, uuid) from public, anon, authenticated;

create or replace function qz_check_pseudo(p text) returns text language plpgsql immutable as $$
begin
  p := trim(coalesce(p,''));
  if length(p) < 1 or length(p) > 24 then raise exception 'PSEUDO_INVALIDE'; end if;
  return p;
end $$;

-- ---------- Fonctions élève (accès sans compte) ----------
create or replace function qz_get_quiz(p_code text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v qz_quizzes;
begin
  select * into v from qz_quizzes where code = upper(trim(p_code)) and published;
  if not found then raise exception 'QUIZ_INTROUVABLE'; end if;
  return jsonb_build_object(
    'id', v.id, 'code', v.code, 'title', v.title, 'subject', v.subject, 'settings', v.settings,
    'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name) order by c.name)
                         from qz_classes c where c.id = any(v.class_ids)), '[]'),
    'questions', coalesce((select jsonb_agg(jsonb_build_object('id', q->>'id', 'type', q->>'type', 'text', q->>'text',
                         'choices', coalesce(q->'choices', '[]')) order by i)
                         from jsonb_array_elements(v.questions) with ordinality as t(q, i)), '[]'));
end $$;

create or replace function qz_join_class(p_code text, p_pseudo text, p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c qz_classes; m qz_members;
begin
  p_pseudo := qz_check_pseudo(p_pseudo);
  select * into c from qz_classes where code = upper(trim(p_code));
  if not found then raise exception 'CLASSE_INTROUVABLE'; end if;
  m := qz_member(c.id, p_pseudo, p_token);
  return jsonb_build_object('class_id', c.id, 'class_name', c.name, 'member_token', m.token, 'pseudo', m.pseudo);
end $$;

create or replace function qz_start(p_code text, p_class uuid, p_pseudo text, p_member_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v qz_quizzes; m qz_members; a qz_attempts;
begin
  p_pseudo := qz_check_pseudo(p_pseudo);
  select * into v from qz_quizzes where code = upper(trim(p_code)) and published;
  if not found then raise exception 'QUIZ_INTROUVABLE'; end if;
  if coalesce(array_length(v.class_ids, 1), 0) > 0 then
    if p_class is null or not (p_class = any(v.class_ids)) then raise exception 'CLASSE_REQUISE'; end if;
    m := qz_member(p_class, p_pseudo, p_member_token);
    select * into a from qz_attempts where quiz_id = v.id and member_id = m.id;
  else
    if exists (select 1 from qz_attempts where quiz_id = v.id and lower(pseudo) = lower(p_pseudo)) then
      raise exception 'PSEUDO_PRIS';
    end if;
  end if;
  if a.id is null then
    insert into qz_attempts(quiz_id, class_id, member_id, pseudo, max_score)
    values (v.id, case when m.id is null then null else p_class end, m.id, coalesce(m.pseudo, p_pseudo), jsonb_array_length(v.questions))
    returning * into a;
  end if;
  return jsonb_build_object('attempt_id', a.id, 'token', a.token, 'status', a.status, 'current_q', a.current_q,
    'member_token', m.token, 'class_id', a.class_id, 'pseudo', a.pseudo);
end $$;

create or replace function qz_answer(p_attempt uuid, p_token uuid, p_qid text, p_answer jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a qz_attempts; v qz_quizzes; q jsonb; idx int; ok boolean;
begin
  select * into a from qz_attempts where id = p_attempt and token = p_token for update;
  if not found then raise exception 'TENTATIVE_INVALIDE'; end if;
  if a.status <> 'in_progress' then return jsonb_build_object('status', a.status); end if;
  select * into v from qz_quizzes where id = a.quiz_id;
  select t.q, t.i into q, idx from jsonb_array_elements(v.questions) with ordinality as t(q, i) where t.q->>'id' = p_qid;
  if q is null then raise exception 'QUESTION_INCONNUE'; end if;
  ok := qz_grade(q, p_answer);
  update qz_attempts set
    answers = answers || jsonb_build_object(p_qid, jsonb_build_object('a', p_answer, 'ok', ok)),
    current_q = greatest(current_q, idx)
  where id = a.id returning * into a;
  update qz_attempts set score = (select count(*) from jsonb_each(a.answers) e where (e.value->>'ok')::boolean)
  where id = a.id;
  return jsonb_build_object('status', a.status);
end $$;

create or replace function qz_leave(p_attempt uuid, p_token uuid, p_q int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a qz_attempts; v qz_quizzes;
begin
  select * into a from qz_attempts where id = p_attempt and token = p_token for update;
  if not found then raise exception 'TENTATIVE_INVALIDE'; end if;
  select * into v from qz_quizzes where id = a.quiz_id;
  if a.status = 'in_progress' and coalesce((v.settings->'exam'->>'enabled')::boolean, false) then
    update qz_attempts set leaves = leaves + 1,
      leave_log = leave_log || jsonb_build_array(jsonb_build_object('at', now(), 'q', p_q)),
      status = case when v.settings->'exam'->>'onLeave' = 'lock' then 'locked' else status end
    where id = a.id returning * into a;
  end if;
  return jsonb_build_object('status', a.status, 'leaves', a.leaves);
end $$;

create or replace function qz_status(p_attempt uuid, p_token uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare a qz_attempts;
begin
  select * into a from qz_attempts where id = p_attempt and token = p_token;
  if not found then raise exception 'TENTATIVE_INVALIDE'; end if;
  return jsonb_build_object('status', a.status, 'current_q', a.current_q, 'leaves', a.leaves);
end $$;

create or replace function qz_finish(p_attempt uuid, p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a qz_attempts; v qz_quizzes;
begin
  select * into a from qz_attempts where id = p_attempt and token = p_token for update;
  if not found then raise exception 'TENTATIVE_INVALIDE'; end if;
  if a.status = 'locked' then return jsonb_build_object('status', 'locked'); end if;
  if a.status <> 'finished' then
    update qz_attempts set status = 'finished', finished_at = now() where id = a.id returning * into a;
  end if;
  select * into v from qz_quizzes where id = a.quiz_id;
  return jsonb_build_object('status', 'finished', 'score', a.score, 'max', a.max_score,
    'duration', extract(epoch from a.finished_at - a.started_at),
    'corrections', case when coalesce((v.settings->>'showCorrections')::boolean, true) then
      (select jsonb_agg(jsonb_build_object('id', q->>'id', 'type', q->>'type', 'text', q->>'text',
         'choices', coalesce(q->'choices','[]'), 'correct', q->'correct', 'explanation', coalesce(q->>'explanation',''),
         'yourAnswer', a.answers->(q->>'id')->'a',
         'isCorrect', coalesce((a.answers->(q->>'id')->>'ok')::boolean, false)) order by i)
       from jsonb_array_elements(v.questions) with ordinality as t(q, i))
    else null end);
end $$;

-- Applique le réglage de visibilité du prof (complet / top 3 / seulement soi)
create or replace function qz_visible(rows jsonb, vis text, me_rank int) returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(r order by (r->>'rank')::int), '[]') from jsonb_array_elements(rows) r
  where vis = 'full' or (vis = 'top3' and (r->>'rank')::int <= 3) or (vis = 'self' and (r->>'rank')::int = me_rank)
$$;

create or replace function qz_lb_quiz(p_attempt uuid, p_token uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare a qz_attempts; vis text; rows jsonb; me jsonb;
begin
  select * into a from qz_attempts where id = p_attempt and token = p_token;
  if not found then raise exception 'TENTATIVE_INVALIDE'; end if;
  select coalesce((select visibility from qz_classes where id = a.class_id), 'full') into vis;
  select coalesce(jsonb_agg(x order by (x->>'rank')::int), '[]') into rows from (
    select jsonb_build_object('pseudo', pseudo, 'score', score, 'max', max_score,
      'duration', extract(epoch from finished_at - started_at),
      'rank', row_number() over (order by score desc, finished_at - started_at asc),
      'isMe', id = a.id) x
    from qz_attempts where quiz_id = a.quiz_id and class_id is not distinct from a.class_id and status = 'finished') s;
  select r into me from jsonb_array_elements(rows) r where (r->>'isMe')::boolean;
  return jsonb_build_object('visibility', vis, 'me', me, 'rows', qz_visible(rows, vis, coalesce((me->>'rank')::int, -1)));
end $$;

create or replace function qz_lb_class(p_member_token uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare m qz_members; c qz_classes; rows jsonb; me jsonb;
begin
  select * into m from qz_members where token = p_member_token;
  if not found then raise exception 'MEMBRE_INCONNU'; end if;
  select * into c from qz_classes where id = m.class_id;
  select coalesce(jsonb_agg(x order by (x->>'rank')::int), '[]') into rows from (
    select jsonb_build_object('pseudo', mm.pseudo, 'score', s.score, 'quizzes', s.n, 'duration', s.dur,
      'rank', row_number() over (order by s.score desc, s.dur asc), 'isMe', mm.id = m.id) x
    from qz_members mm
    join lateral (select coalesce(sum(score),0) score, count(*) n,
                    coalesce(extract(epoch from sum(finished_at - started_at)),0) dur
                  from qz_attempts at where at.member_id = mm.id and at.status = 'finished'
                    and at.finished_at >= coalesce(c.reset_at, '-infinity')) s on true
    where mm.class_id = c.id and (s.n > 0 or mm.id = m.id)) t;
  select r into me from jsonb_array_elements(rows) r where (r->>'isMe')::boolean;
  return jsonb_build_object('class_name', c.name, 'pseudo', m.pseudo, 'visibility', c.visibility, 'me', me,
    'rows', qz_visible(rows, c.visibility, coalesce((me->>'rank')::int, -1)));
end $$;

-- Prof : supprimer une classe et la retirer de ses quiz
create or replace function qz_delete_class(p_class uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from qz_classes where id = p_class and owner = auth.uid()) then raise exception 'INTERDIT'; end if;
  update qz_quizzes set class_ids = array_remove(class_ids, p_class) where owner = auth.uid();
  delete from qz_classes where id = p_class;
end $$;

grant execute on function qz_get_quiz(text), qz_join_class(text, text, uuid), qz_start(text, uuid, text, uuid),
  qz_answer(uuid, uuid, text, jsonb), qz_leave(uuid, uuid, int), qz_status(uuid, uuid), qz_finish(uuid, uuid),
  qz_lb_quiz(uuid, uuid), qz_lb_class(uuid) to anon, authenticated;
grant execute on function qz_delete_class(uuid) to authenticated;

-- IA incluse : nombre de quiz générés par prof et par jour.
-- RLS sans aucune règle = personne n'y touche depuis le navigateur ; seule la fonction
-- serveur qz-generate (clé service_role) lit et écrit ce compteur.
create table if not exists qz_ai_usage (
  owner uuid not null references auth.users(id) on delete cascade,
  day date not null,
  n int not null default 0,
  primary key (owner, day)
);
alter table qz_ai_usage enable row level security;
