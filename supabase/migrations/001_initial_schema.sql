-- KnowFlow AI Supabase Schema & pgvector Setup
-- Enable pgvector extension
create extension if not exists vector;

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workspaces table
create table if not exists public.workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  created_by uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workspace members table
create table if not exists public.workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text check (role in ('owner', 'admin', 'member')) default 'member' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (workspace_id, user_id)
);

-- Knowledge bases table
create table if not exists public.knowledge_bases (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Documents table
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  knowledge_base_id uuid references public.knowledge_bases on delete cascade not null,
  workspace_id uuid references public.workspaces on delete cascade not null,
  title text not null,
  file_path text,
  file_type text not null,
  file_size bigint default 0,
  status text check (status in ('uploaded', 'processing', 'completed', 'failed')) default 'uploaded' not null,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Document chunks table with pgvector (768 dimensions for Gemini text-embedding-004)
create table if not exists public.document_chunks (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references public.documents on delete cascade not null,
  workspace_id uuid references public.workspaces on delete cascade not null,
  content text not null,
  chunk_index int not null,
  embedding vector(768),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists document_chunks_embedding_idx on public.document_chunks using hnsw (embedding vector_cosine_ops);

-- Chat sessions table
create table if not exists public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  knowledge_base_id uuid references public.knowledge_bases on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat messages table
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  citations jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- API Keys table
create table if not exists public.api_keys (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  name text not null,
  key_hash text not null,
  prefix text not null,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Invitations table
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  email text not null,
  role text check (role in ('admin', 'member')) default 'member' not null,
  token text not null unique,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Usage records table
create table if not exists public.usage_records (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces on delete cascade not null,
  metric_name text not null,
  count int default 1 not null,
  date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.knowledge_bases enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.api_keys enable row level security;
alter table public.invitations enable row level security;
alter table public.usage_records enable row level security;

-- Helper function: check if user is workspace member
create or replace function public.is_workspace_member(p_workspace_id uuid, p_user_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id and user_id = p_user_id
  );
end;
$$ language plpgsql;

-- RLS Policies

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Workspaces
create policy "Members can view their workspaces" on public.workspaces for select
  using (public.is_workspace_member(id, auth.uid()));
create policy "Authenticated users can create workspaces" on public.workspaces for insert
  with check (auth.uid() = created_by);
create policy "Workspace owners and admins can update workspace" on public.workspaces for update
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = id and user_id = auth.uid() and role in ('owner', 'admin')
  ));

-- Workspace Members
create policy "Members can view workspace members" on public.workspace_members for select
  using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Workspace admins can insert members" on public.workspace_members for insert
  with check (exists (
    select 1 from public.workspace_members
    where workspace_id = workspace_id and user_id = auth.uid() and role in ('owner', 'admin')
  ));

-- Knowledge Bases
create policy "Workspace members can view knowledge bases" on public.knowledge_bases for select
  using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Workspace members can create knowledge bases" on public.knowledge_bases for insert
  with check (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Workspace members can update knowledge bases" on public.knowledge_bases for update
  using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Workspace members can delete knowledge bases" on public.knowledge_bases for delete
  using (public.is_workspace_member(workspace_id, auth.uid()));

-- Documents
create policy "Workspace members can view documents" on public.documents for select
  using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Workspace members can insert documents" on public.documents for insert
  with check (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Workspace members can update documents" on public.documents for update
  using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Workspace members can delete documents" on public.documents for delete
  using (public.is_workspace_member(workspace_id, auth.uid()));

-- Document Chunks
create policy "Workspace members can view document chunks" on public.document_chunks for select
  using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Workspace members can insert document chunks" on public.document_chunks for insert
  with check (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Workspace members can delete document chunks" on public.document_chunks for delete
  using (public.is_workspace_member(workspace_id, auth.uid()));

-- Chat Sessions
create policy "Workspace members can view chat sessions" on public.chat_sessions for select
  using (public.is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid());
create policy "Workspace members can create chat sessions" on public.chat_sessions for insert
  with check (public.is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid());
create policy "Workspace members can delete chat sessions" on public.chat_sessions for delete
  using (public.is_workspace_member(workspace_id, auth.uid()) and user_id = auth.uid());

-- Chat Messages
create policy "Workspace members can view chat messages" on public.chat_messages for select
  using (exists (
    select 1 from public.chat_sessions
    where id = session_id and user_id = auth.uid() and public.is_workspace_member(workspace_id, auth.uid())
  ));
create policy "Workspace members can insert chat messages" on public.chat_messages for insert
  with check (exists (
    select 1 from public.chat_sessions
    where id = session_id and user_id = auth.uid() and public.is_workspace_member(workspace_id, auth.uid())
  ));

-- API Keys
create policy "Workspace admins can manage api keys" on public.api_keys for all
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = workspace_id and user_id = auth.uid() and role in ('owner', 'admin')
  ));

-- Invitations
create policy "Workspace admins can manage invitations" on public.invitations for all
  using (exists (
    select 1 from public.workspace_members
    where workspace_id = workspace_id and user_id = auth.uid() and role in ('owner', 'admin')
  ));

-- Usage Records
create policy "Workspace members can view usage" on public.usage_records for select
  using (public.is_workspace_member(workspace_id, auth.uid()));

-- Vector similarity search RPC function with secure workspace filtering
create or replace function public.match_document_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_workspace_id uuid,
  filter_kb_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  chunk_index int,
  similarity float,
  document_title text
)
language plpgsql
security definer
as $$
begin
  -- Enforce workspace membership security check
  if not public.is_workspace_member(filter_workspace_id, auth.uid()) then
    raise exception 'Unauthorized workspace access';
  end if;

  return query
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as similarity,
    d.title as document_title
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id
  where dc.workspace_id = filter_workspace_id
    and (filter_kb_id is null or d.knowledge_base_id = filter_kb_id)
    and (1 - (dc.embedding <=> query_embedding)) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
