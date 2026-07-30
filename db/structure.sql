SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: bi_models; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA bi_models;


--
-- Name: c_10313; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA c_10313;


--
-- Name: c_10463; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA c_10463;


--
-- Name: c_10501; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA c_10501;


--
-- Name: c_10542; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA c_10542;


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: tablefunc; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS tablefunc WITH SCHEMA public;


--
-- Name: EXTENSION tablefunc; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION tablefunc IS 'functions that manipulate whole tables, including crosstab';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: factors_norms_types; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.factors_norms_types AS ENUM (
    'yti',
    'eti'
);


--
-- Name: user_roles; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_roles AS ENUM (
    'superadmin',
    'admin',
    'manager',
    'user'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments (
    id integer NOT NULL,
    name character varying,
    category character varying,
    dimension_id integer,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    flow json,
    norm_rules json,
    description text,
    timing character varying,
    access_reports_at timestamp without time zone,
    status integer,
    owner_id integer,
    type character varying,
    enable_back boolean DEFAULT false NOT NULL,
    enable_progress boolean DEFAULT true,
    extra jsonb DEFAULT '{}'::jsonb NOT NULL,
    icon character varying,
    archived boolean DEFAULT false,
    resources json,
    data_sheet_columns jsonb DEFAULT '[]'::jsonb NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by_id bigint,
    options json DEFAULT '{}'::json,
    instructions json DEFAULT '{}'::json,
    default_norm_id integer,
    poster character varying,
    project_id bigint,
    created_by_id bigint,
    updated_by_id bigint,
    external_settings jsonb DEFAULT '{}'::jsonb,
    linked_assessment_id integer,
    linked_questions json DEFAULT '{}'::json,
    default_language character varying DEFAULT 'en'::character varying,
    campaign_factors_list jsonb DEFAULT '[]'::jsonb,
    translations_migrated boolean DEFAULT true,
    data_role integer DEFAULT 0 NOT NULL,
    tenant_id bigint
);


--
-- Name: assessments; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.assessments AS
 SELECT id,
    name,
    category
   FROM public.assessments;


--
-- Name: campaign_factor_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_factor_groups (
    id bigint NOT NULL,
    name character varying NOT NULL,
    campaign_id bigint NOT NULL,
    "position" integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: campaign_factor_group; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.campaign_factor_group AS
 SELECT id,
    campaign_id,
    name,
    "position"
   FROM public.campaign_factor_groups;


--
-- Name: campaign_factor_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_factor_values (
    id bigint NOT NULL,
    campaign_id bigint NOT NULL,
    user_id bigint NOT NULL,
    campaign_factor_id bigint NOT NULL,
    string_value character varying,
    numeric_value double precision,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    calculation_type integer DEFAULT 0,
    label character varying,
    tenant_id bigint
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id bigint NOT NULL,
    project_id bigint,
    name character varying,
    type integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    status integer DEFAULT 0,
    options jsonb DEFAULT '{}'::jsonb,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    uniq_code character varying,
    encrypted_pdf_password character varying,
    encrypted_pdf_password_iv character varying,
    default_idp_template_id bigint,
    practice_campaign boolean DEFAULT false,
    is_template boolean DEFAULT false,
    tenant_id bigint
);


--
-- Name: campaign_factor_values; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.campaign_factor_values AS
 SELECT campaign_factor_values.id,
    campaigns.project_id,
    campaigns.id AS campaign_id,
    campaign_factor_values.campaign_factor_id,
    campaign_factor_values.user_id,
    campaign_factor_values.string_value,
    campaign_factor_values.numeric_value
   FROM (public.campaign_factor_values
     JOIN public.campaigns ON ((campaigns.id = campaign_factor_values.campaign_id)));


--
-- Name: campaign_factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_factors (
    id bigint NOT NULL,
    campaign_factor_group_id bigint,
    "position" integer,
    name character varying NOT NULL,
    code character varying NOT NULL,
    description text,
    factor_type integer DEFAULT 0 NOT NULL,
    output_type integer DEFAULT 0 NOT NULL,
    campaign_id bigint NOT NULL,
    factor_id bigint,
    assessment_id bigint,
    sheet_column_name character varying,
    public_visibility boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    assessment_score_type integer DEFAULT 0,
    formula text,
    ranked boolean DEFAULT false NOT NULL,
    min_value integer,
    max_value integer,
    is_na_allowed boolean DEFAULT false NOT NULL,
    tenant_id bigint,
    disallow_lead_assessor_moderation boolean DEFAULT false NOT NULL
);


--
-- Name: campaign_factors; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.campaign_factors AS
 SELECT campaign_factors.id,
    campaigns.project_id,
    campaign_factors.campaign_id,
    campaign_factors.name,
    campaign_factors.code,
    campaign_factors.campaign_factor_group_id,
        CASE campaign_factors.factor_type
            WHEN 1 THEN 'assessment'::text
            WHEN 2 THEN 'assessor_scoring'::text
            WHEN 3 THEN 'formula'::text
            WHEN 4 THEN 'external_score'::text
            ELSE NULL::text
        END AS factor_type,
        CASE campaign_factors.output_type
            WHEN 0 THEN 'numeric'::text
            WHEN 1 THEN 'string'::text
            ELSE NULL::text
        END AS output_type
   FROM (public.campaign_factors
     JOIN public.campaigns ON ((campaigns.id = campaign_factors.campaign_id)));


--
-- Name: campaigns; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.campaigns AS
 SELECT id,
    name,
    project_id
   FROM public.campaigns;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name character varying,
    subdomain character varying,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    type integer DEFAULT 0,
    licenses_count integer DEFAULT 0,
    number character varying,
    country character varying,
    year integer,
    applicable_level integer DEFAULT 0,
    project_manager_id integer,
    archived boolean DEFAULT false,
    tte_id integer,
    created_by_id integer,
    modified_by_id integer,
    ancestry character varying,
    ancestry_depth integer DEFAULT 0,
    end_level boolean DEFAULT false,
    hogan_group_name character varying,
    privacy_consent boolean,
    enable_live_chat boolean DEFAULT false NOT NULL,
    migrated boolean DEFAULT false,
    locales json DEFAULT '[]'::json,
    live_chat_token character varying,
    custom_privacy_consent boolean DEFAULT false,
    custom_privacy_consent_text text,
    custom_privacy_policy_version integer,
    restricted_to_countries text[] DEFAULT '{}'::text[],
    tenant_id bigint
);


--
-- Name: clients; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.clients AS
 SELECT id,
    name
   FROM public.clients
  WHERE (ancestry_depth = 0);


--
-- Name: sheet_columns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sheet_columns (
    id bigint NOT NULL,
    column_type integer,
    name character varying,
    "position" integer,
    dashboard_use boolean DEFAULT false,
    accessor_access boolean DEFAULT false,
    visible_in_list boolean DEFAULT false,
    sheet_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: sheet_row_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sheet_row_data (
    id bigint NOT NULL,
    string_value text,
    numeric_value double precision,
    sheet_row_id bigint NOT NULL,
    sheet_column_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: sheet_rows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sheet_rows (
    id bigint NOT NULL,
    sheet_id bigint,
    email public.citext NOT NULL,
    data_deprecated_on_11_07_2025 jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    migrated boolean DEFAULT false,
    tenant_id bigint
);


--
-- Name: sheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sheets (
    id bigint NOT NULL,
    project_id bigint,
    columns_deprecated_on_11_07_2025 jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    campaign_id bigint,
    type character varying DEFAULT 'Datasheet'::character varying,
    flat_view_sha character varying,
    tenant_id bigint
);


--
-- Name: datasheets; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.datasheets AS
 SELECT sheet_rows.id,
    COALESCE(sheets.project_id, campaigns.project_id) AS project_id,
    sheets.campaign_id,
    sheet_rows.email,
    sheet_columns.name AS field_name,
    sheet_row_data.numeric_value,
    sheet_row_data.string_value
   FROM ((((public.sheet_row_data
     JOIN public.sheet_rows ON ((sheet_rows.id = sheet_row_data.sheet_row_id)))
     JOIN public.sheets ON ((sheets.id = sheet_rows.sheet_id)))
     JOIN public.sheet_columns ON ((sheet_columns.sheet_id = sheets.id)))
     LEFT JOIN public.campaigns ON ((campaigns.id = sheets.campaign_id)))
  WHERE ((sheets.type)::text = 'Datasheet'::text);


--
-- Name: factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factors (
    id integer NOT NULL,
    name character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    dimension_id integer NOT NULL,
    parent_id integer,
    disabled boolean DEFAULT false,
    icon character varying,
    description text,
    scoring_strategy smallint DEFAULT 0 NOT NULL,
    code character varying,
    use_percentage boolean DEFAULT false,
    use_sub_factor_norm_score boolean,
    external_scoring jsonb DEFAULT '[]'::jsonb,
    scale_min double precision,
    scale_max double precision,
    custom_formula character varying,
    "precision" integer,
    skill_id bigint,
    factor_type integer DEFAULT 0 NOT NULL,
    score_min integer,
    score_max integer,
    score_definitions jsonb DEFAULT '[]'::jsonb,
    what_to_look_for text,
    child_factor_type integer,
    tenant_id bigint
);


--
-- Name: factors; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.factors AS
 SELECT id,
    name
   FROM public.factors;


--
-- Name: user_assessment_factor_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_assessment_factor_scores (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    factor_id bigint NOT NULL,
    scores jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_assessments (
    id bigint NOT NULL,
    campaign_id bigint,
    relationship_id bigint,
    manager_nomination_status integer DEFAULT 0,
    evaluator_nomination_status integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    subject_id bigint,
    evaluator_id bigint,
    manager_evaluation_status integer DEFAULT 0,
    assessment_id bigint,
    users_result_id bigint,
    norm_id bigint,
    status integer DEFAULT 0,
    completed_at timestamp without time zone,
    completion_reason integer,
    fixed_norm boolean DEFAULT false,
    created_by_id integer,
    reset_count integer DEFAULT 0,
    expiry_date timestamp without time zone,
    additional_time integer,
    selected_locale character varying,
    started_at timestamp without time zone,
    last_activity_at timestamp without time zone,
    progress_reseted boolean DEFAULT false,
    schedule_time timestamp(6) without time zone,
    schedule_updated boolean DEFAULT false,
    meeting_type integer DEFAULT 0,
    meeting_link character varying,
    require_scheduling boolean DEFAULT false,
    completion_status_code character varying,
    evaluation_session_id character varying,
    score_calculated boolean DEFAULT false,
    score_calculated_at timestamp(6) without time zone,
    prework boolean DEFAULT false NOT NULL,
    approval_status character varying DEFAULT 'pending'::character varying,
    approval_status_updated_at timestamp(6) without time zone,
    score_assessed_by_id bigint,
    score_approved_by_id bigint,
    score_assessed_at timestamp(6) without time zone,
    score_approved_at timestamp(6) without time zone,
    tenant_id bigint
);


--
-- Name: normalized_factor_scores; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.normalized_factor_scores AS
 SELECT user_assessment_factor_scores.id,
    campaigns.project_id,
    campaigns.id AS campaign_id,
    user_assessment_factor_scores.user_assessment_id,
    user_assessment_factor_scores.factor_id,
    ((user_assessment_factor_scores.scores ->> 'norm_score'::text))::double precision AS norm_score,
    ((user_assessment_factor_scores.scores ->> 'score'::text))::double precision AS score,
    ((user_assessment_factor_scores.scores ->> 'zscore'::text))::double precision AS zscore,
    ((user_assessment_factor_scores.scores ->> 'percentage'::text))::double precision AS percentage,
    ((user_assessment_factor_scores.scores ->> 'total_questions'::text))::integer AS total_questions,
    ((user_assessment_factor_scores.scores ->> 'questions_attempted'::text))::integer AS questions_attempted,
    ((user_assessment_factor_scores.scores ->> 'questions_correct'::text))::integer AS questions_correct,
    ((user_assessment_factor_scores.scores ->> 'questions_partial_correct'::text))::integer AS questions_partial_correct,
    ((user_assessment_factor_scores.scores ->> 'questions_incorrect'::text))::integer AS questions_incorrect,
    ((user_assessment_factor_scores.scores ->> 'questions_not_attempted'::text))::integer AS questions_not_attempted
   FROM ((public.user_assessment_factor_scores
     JOIN public.user_assessments ON ((user_assessments.id = user_assessment_factor_scores.user_assessment_id)))
     JOIN public.campaigns ON ((campaigns.id = user_assessments.campaign_id)));


--
-- Name: profile_field_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_field_values (
    id bigint NOT NULL,
    numeric_value double precision,
    string_value character varying,
    user_profile_id bigint NOT NULL,
    profile_field_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: profile_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_fields (
    id bigint NOT NULL,
    required boolean,
    half_size boolean,
    "position" integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    question_id bigint NOT NULL,
    profile_setting_id bigint NOT NULL,
    locked boolean,
    tenant_id bigint
);


--
-- Name: profile_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_settings (
    id bigint NOT NULL,
    update_in integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    project_id bigint NOT NULL,
    required_default_fields json DEFAULT '{}'::json,
    locked_default_fields json DEFAULT '{}'::json,
    enabled_default_fields json DEFAULT '{"age":true,"gender":true,"photo":true}'::json,
    tenant_id bigint
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    name character varying,
    "position" integer,
    type character varying,
    props json,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    block_id integer,
    deleted_at timestamp without time zone,
    required_validation json,
    validation json,
    display_logic json,
    skip_logic json,
    view integer DEFAULT 0,
    disabled boolean DEFAULT false,
    template_id integer,
    assessment_id integer,
    owner_id integer,
    created_by_id bigint,
    updated_by_id bigint,
    skill_id bigint,
    tenant_id bigint
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id bigint NOT NULL,
    age integer,
    age_updated_at timestamp without time zone,
    gender integer,
    timezone character varying,
    photo character varying,
    locale character varying,
    custom_fields_deprecated_on_11_07_2025 json,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_id bigint NOT NULL,
    tenant_id bigint
);


--
-- Name: profile_fields_values; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.profile_fields_values AS
 SELECT profile_settings.project_id,
    user_profiles.user_id,
    questions.name AS field_name,
    profile_field_values.numeric_value,
    profile_field_values.string_value
   FROM ((((public.profile_settings
     JOIN public.profile_fields ON ((profile_fields.profile_setting_id = profile_settings.id)))
     JOIN public.questions ON ((questions.id = profile_fields.question_id)))
     JOIN public.profile_field_values ON ((profile_field_values.profile_field_id = profile_fields.id)))
     JOIN public.user_profiles ON ((user_profiles.id = profile_field_values.user_profile_id)));


--
-- Name: projects; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.projects AS
 SELECT id,
    name,
    tte_id AS client_id
   FROM public.clients
  WHERE (ancestry_depth = 1);


--
-- Name: relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relationships (
    id bigint NOT NULL,
    campaign_id bigint,
    name character varying,
    type integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assign_type integer DEFAULT 0,
    tenant_id bigint
);


--
-- Name: relationships; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.relationships AS
 SELECT relationships.id,
    campaigns.project_id,
    relationships.campaign_id,
    relationships.name,
        CASE relationships.type
            WHEN 0 THEN 'global'::text
            WHEN 1 THEN 'campaign'::text
            ELSE NULL::text
        END AS type
   FROM (public.relationships
     JOIN public.campaigns ON ((campaigns.id = relationships.campaign_id)));


--
-- Name: user_assessments; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.user_assessments AS
 SELECT user_assessments.id,
    campaigns.project_id,
    user_assessments.campaign_id,
    user_assessments.assessment_id,
    user_assessments.subject_id,
    user_assessments.evaluator_id,
    user_assessments.relationship_id,
    user_assessments.status,
    user_assessments.started_at,
    user_assessments.completed_at
   FROM (public.user_assessments
     JOIN public.campaigns ON ((campaigns.id = user_assessments.campaign_id)));


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email public.citext DEFAULT ''::character varying NOT NULL,
    encrypted_password character varying DEFAULT ''::character varying NOT NULL,
    reset_password_token character varying,
    reset_password_sent_at timestamp without time zone,
    remember_created_at timestamp without time zone,
    sign_in_count integer DEFAULT 0 NOT NULL,
    current_sign_in_at timestamp without time zone,
    last_sign_in_at timestamp without time zone,
    current_sign_in_ip inet,
    last_sign_in_ip inet,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    first_name character varying,
    last_name character varying,
    disabled boolean DEFAULT false,
    role character varying DEFAULT 'Users::Regular'::character varying,
    invitation_token character varying,
    invitation_created_at timestamp without time zone,
    invitation_sent_at timestamp without time zone,
    invitation_accepted_at timestamp without time zone,
    invitation_limit integer,
    invited_by_type character varying,
    invited_by_id integer,
    invitations_count integer DEFAULT 0,
    authentication_token character varying(30),
    is_anonym boolean DEFAULT false,
    grants jsonb,
    created_by_id integer,
    modified_by_id integer,
    spoof_token character varying,
    encrypted_invitation_raw character varying,
    project_id integer,
    second_factor_attempts_count integer DEFAULT 0,
    encrypted_otp_secret_key character varying,
    encrypted_otp_secret_key_iv character varying,
    encrypted_otp_secret_key_salt character varying,
    direct_otp character varying,
    direct_otp_sent_at timestamp without time zone,
    totp_timestamp timestamp without time zone,
    settings jsonb DEFAULT '{}'::jsonb,
    already_invited boolean DEFAULT false,
    enable_2fa boolean DEFAULT true NOT NULL,
    failed_attempts integer DEFAULT 0 NOT NULL,
    unlock_token character varying,
    locked_at timestamp without time zone,
    password_changed_at timestamp without time zone,
    timezone character varying,
    force_password_change boolean DEFAULT false,
    global_assessor boolean DEFAULT false,
    last_unsuccessful_attempt timestamp without time zone,
    manager_id bigint,
    mobile_number character varying,
    mobile_verified boolean DEFAULT false,
    unique_session_id character varying,
    external_id character varying,
    disabled_at timestamp(6) without time zone,
    tenant_id bigint,
    spoofed_by_id bigint
);


--
-- Name: users; Type: VIEW; Schema: bi_models; Owner: -
--

CREATE VIEW bi_models.users AS
 SELECT id,
    project_id,
    first_name,
    last_name,
    email
   FROM public.users;


--
-- Name: datasheet; Type: VIEW; Schema: c_10313; Owner: -
--

CREATE VIEW c_10313.datasheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade",
    (data_deprecated_on_11_07_2025 ->> 'Position'::text) AS "Position",
    (data_deprecated_on_11_07_2025 ->> 'Last Name'::text) AS "Last Name",
    (data_deprecated_on_11_07_2025 ->> 'Department'::text) AS "Department"
   FROM public.sheet_rows
  WHERE (sheet_id = 69)
  ORDER BY id;


--
-- Name: datasheet; Type: VIEW; Schema: c_10463; Owner: -
--

CREATE VIEW c_10463.datasheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade"
   FROM public.sheet_rows
  WHERE (sheet_id = 65)
  ORDER BY id;


--
-- Name: accesssheet; Type: VIEW; Schema: c_10501; Owner: -
--

CREATE VIEW c_10501.accesssheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'First Name'::text) AS "First Name",
    (data_deprecated_on_11_07_2025 ->> 'full name'::text) AS "full name",
    (data_deprecated_on_11_07_2025 ->> 'Last Name'::text) AS "Last Name",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade",
    (data_deprecated_on_11_07_2025 ->> 'roll number'::text) AS "roll number",
    (data_deprecated_on_11_07_2025 ->> 'Position'::text) AS "Position",
    (data_deprecated_on_11_07_2025 ->> 'Department'::text) AS "Department",
    (data_deprecated_on_11_07_2025 ->> 'sample'::text) AS sample
   FROM public.sheet_rows
  WHERE (sheet_id = 61)
  ORDER BY id;


--
-- Name: datasheet; Type: VIEW; Schema: c_10501; Owner: -
--

CREATE VIEW c_10501.datasheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'Department'::text) AS "Department",
    (data_deprecated_on_11_07_2025 ->> 'First Name'::text) AS "First Name",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade",
    (data_deprecated_on_11_07_2025 ->> 'Last Name'::text) AS "Last Name",
    (data_deprecated_on_11_07_2025 ->> 'Position'::text) AS "Position"
   FROM public.sheet_rows
  WHERE (sheet_id = 62)
  ORDER BY id;


--
-- Name: datasheet; Type: VIEW; Schema: c_10542; Owner: -
--

CREATE VIEW c_10542.datasheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade",
    (data_deprecated_on_11_07_2025 ->> 'Position'::text) AS "Position",
    (data_deprecated_on_11_07_2025 ->> 'Last Name'::text) AS "Last Name",
    (data_deprecated_on_11_07_2025 ->> 'Department'::text) AS "Department",
    (data_deprecated_on_11_07_2025 ->> 'First Name'::text) AS "First Name"
   FROM public.sheet_rows
  WHERE (sheet_id = 70)
  ORDER BY id;


--
-- Name: active_storage_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_attachments (
    id bigint NOT NULL,
    name character varying NOT NULL,
    record_type character varying NOT NULL,
    record_id bigint NOT NULL,
    blob_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_attachments_id_seq OWNED BY public.active_storage_attachments.id;


--
-- Name: active_storage_blobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_blobs (
    id bigint NOT NULL,
    key character varying NOT NULL,
    filename character varying NOT NULL,
    content_type character varying,
    metadata text,
    service_name character varying NOT NULL,
    byte_size bigint NOT NULL,
    checksum character varying,
    created_at timestamp without time zone NOT NULL
);


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_blobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_blobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_blobs_id_seq OWNED BY public.active_storage_blobs.id;


--
-- Name: active_storage_variant_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_storage_variant_records (
    id bigint NOT NULL,
    blob_id bigint NOT NULL,
    variation_digest character varying NOT NULL
);


--
-- Name: active_storage_variant_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.active_storage_variant_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: active_storage_variant_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.active_storage_variant_records_id_seq OWNED BY public.active_storage_variant_records.id;


--
-- Name: activesupport_tables_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activesupport_tables_migrations (
    id bigint NOT NULL,
    table_name character varying NOT NULL,
    model_name character varying NOT NULL,
    last_processed_id integer NOT NULL
);


--
-- Name: activesupport_tables_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activesupport_tables_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activesupport_tables_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activesupport_tables_migrations_id_seq OWNED BY public.activesupport_tables_migrations.id;


--
-- Name: admin_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_jobs (
    id bigint NOT NULL,
    owner_id bigint,
    operation smallint,
    data json DEFAULT '{}'::json,
    file character varying,
    status smallint DEFAULT 0,
    error_messages json DEFAULT '[]'::json,
    content character varying,
    read boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    total_tasks integer DEFAULT 1,
    completed_tasks integer DEFAULT 0,
    exception character varying,
    step character varying,
    weight double precision,
    parent_job_id bigint,
    tenant_id bigint
);


--
-- Name: admin_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_jobs_id_seq OWNED BY public.admin_jobs.id;


--
-- Name: admin_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_roles (
    id bigint NOT NULL,
    name character varying,
    description text,
    client_id bigint,
    permissions jsonb,
    tenant_id bigint
);


--
-- Name: admin_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_roles_id_seq OWNED BY public.admin_roles.id;


--
-- Name: agile_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agile_events (
    id bigint NOT NULL,
    assign_id bigint,
    session_id character varying,
    event character varying,
    data json DEFAULT '{}'::json,
    created_at timestamp without time zone NOT NULL,
    users_result_id bigint
);


--
-- Name: agile_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agile_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agile_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agile_events_id_seq OWNED BY public.agile_events.id;


--
-- Name: agiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agiles (
    id bigint NOT NULL,
    assessment_id bigint,
    config json DEFAULT '{}'::json,
    translations json DEFAULT '{}'::json,
    tenant_id bigint
);


--
-- Name: agiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agiles_id_seq OWNED BY public.agiles.id;


--
-- Name: ai_assistant_chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_assistant_chats (
    id bigint NOT NULL,
    model_id_string character varying,
    ai_assistant_id bigint NOT NULL,
    user_id bigint NOT NULL,
    client_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    ai_model_registry_id bigint,
    ai_assisted_user_session_id bigint,
    input_tokens integer DEFAULT 0,
    output_tokens integer DEFAULT 0,
    tenant_id bigint
);


--
-- Name: ai_assistant_chats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_assistant_chats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_assistant_chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_assistant_chats_id_seq OWNED BY public.ai_assistant_chats.id;


--
-- Name: ai_assistant_output_schema_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_assistant_output_schema_keys (
    id bigint NOT NULL,
    ai_assistant_id bigint NOT NULL,
    key character varying NOT NULL,
    key_type integer DEFAULT 0 NOT NULL,
    description text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: ai_assistant_output_schema_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_assistant_output_schema_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_assistant_output_schema_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_assistant_output_schema_keys_id_seq OWNED BY public.ai_assistant_output_schema_keys.id;


--
-- Name: ai_assistant_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_assistant_requests (
    id bigint NOT NULL,
    input_tokens bigint DEFAULT 0,
    output_tokens bigint DEFAULT 0,
    request_body_checksum character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    role character varying,
    content text,
    model_id_string character varying,
    ai_assistant_id bigint,
    ai_assistant_chat_id bigint NOT NULL,
    ai_assistant_tool_call_id bigint,
    ai_model_registry_id bigint,
    request_status integer DEFAULT 0 NOT NULL,
    meta jsonb,
    cached_tokens integer,
    cache_creation_tokens integer,
    content_raw json,
    thinking_text text,
    thinking_signature text,
    thinking_tokens integer,
    tenant_id bigint
);


--
-- Name: ai_assistant_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_assistant_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_assistant_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_assistant_requests_id_seq OWNED BY public.ai_assistant_requests.id;


--
-- Name: ai_assistant_tool_calls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_assistant_tool_calls (
    id bigint NOT NULL,
    ai_assistant_request_id bigint NOT NULL,
    tool_call_id character varying NOT NULL,
    name character varying NOT NULL,
    arguments jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    thought_signature character varying,
    tenant_id bigint
);


--
-- Name: ai_assistant_tool_calls_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_assistant_tool_calls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_assistant_tool_calls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_assistant_tool_calls_id_seq OWNED BY public.ai_assistant_tool_calls.id;


--
-- Name: ai_assistants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_assistants (
    id bigint NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_prompt text,
    system_prompt text,
    owner_id bigint,
    last_modified_by_id bigint,
    model_id character varying,
    assistant_type integer DEFAULT 0 NOT NULL,
    dependencies jsonb DEFAULT '[]'::jsonb NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    advanced_prompting_enabled boolean DEFAULT false NOT NULL,
    tenant_id bigint,
    model_params jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: ai_assistants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_assistants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_assistants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_assistants_id_seq OWNED BY public.ai_assistants.id;


--
-- Name: ai_assisted_user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_assisted_user_sessions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    assistable_type character varying,
    assistable_id bigint,
    checkpoint jsonb,
    type character varying,
    error text,
    status integer DEFAULT 0 NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb,
    content_checksum character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    resource_type character varying,
    resource_id bigint,
    tenant_id bigint
);


--
-- Name: ai_assisted_user_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_assisted_user_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_assisted_user_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_assisted_user_sessions_id_seq OWNED BY public.ai_assisted_user_sessions.id;


--
-- Name: ai_factor_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_factor_scores (
    id bigint NOT NULL,
    users_result_id bigint NOT NULL,
    question_id bigint,
    factor_id bigint NOT NULL,
    score double precision,
    override_score double precision,
    confidence double precision,
    citations jsonb,
    rationale text,
    status integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    parent_factor_id bigint,
    scoring_type integer DEFAULT 0,
    not_applicable boolean DEFAULT false,
    tenant_id bigint
);


--
-- Name: ai_factor_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_factor_scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_factor_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_factor_scores_id_seq OWNED BY public.ai_factor_scores.id;


--
-- Name: ai_model_registries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_model_registries (
    id bigint NOT NULL,
    model_id character varying NOT NULL,
    name character varying NOT NULL,
    provider character varying NOT NULL,
    family character varying,
    model_created_at timestamp(6) without time zone,
    context_window integer,
    max_output_tokens integer,
    knowledge_cutoff date,
    modalities jsonb DEFAULT '{}'::jsonb,
    capabilities jsonb DEFAULT '[]'::jsonb,
    pricing jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: ai_model_registries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_model_registries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_model_registries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_model_registries_id_seq OWNED BY public.ai_model_registries.id;


--
-- Name: ai_scoring_approval_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_scoring_approval_settings (
    id bigint NOT NULL,
    assessor_ids bigint[] DEFAULT '{}'::bigint[],
    approver_ids bigint[] DEFAULT '{}'::bigint[],
    allow_bulk_approve boolean DEFAULT false,
    allow_bulk_approve_scores boolean DEFAULT false,
    send_digest_emails boolean DEFAULT false,
    digest_frequency character varying DEFAULT 'daily'::character varying,
    digest_time time without time zone DEFAULT '21:00:00'::time without time zone,
    digest_weekdays integer[] DEFAULT '{}'::integer[],
    digest_timezone character varying DEFAULT 'Asia/Dubai'::character varying,
    digest_delivery_mode character varying DEFAULT 'immediate'::character varying,
    last_digest_sent_at timestamp(6) without time zone,
    digest_emails_enabled_at timestamp(6) without time zone,
    assessment_id bigint NOT NULL,
    campaign_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    allow_one_level_approve boolean DEFAULT false,
    approval_notification_user_ids bigint[] DEFAULT '{}'::bigint[] NOT NULL,
    do_not_send_notifications boolean DEFAULT false NOT NULL,
    tenant_id bigint
);


--
-- Name: ai_scoring_approval_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_scoring_approval_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_scoring_approval_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_scoring_approval_settings_id_seq OWNED BY public.ai_scoring_approval_settings.id;


--
-- Name: ai_translation_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_translation_results (
    id bigint NOT NULL,
    results json,
    translatable_id bigint,
    translatable_type character varying,
    hashsum bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: ai_translation_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ai_translation_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ai_translation_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ai_translation_results_id_seq OWNED BY public.ai_translation_results.id;


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_keys (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    disabled boolean DEFAULT false,
    encrypted_token character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    key character varying,
    encrypted_token_iv character varying,
    created_by_id bigint,
    updated_by_id bigint,
    description text,
    tenant_id bigint NOT NULL
);


--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_keys_id_seq OWNED BY public.api_keys.id;


--
-- Name: application_ip_whitelist_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_ip_whitelist_entries (
    id bigint NOT NULL,
    application_setting_id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    ip_or_cidr inet NOT NULL,
    description text,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: application_ip_whitelist_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.application_ip_whitelist_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: application_ip_whitelist_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.application_ip_whitelist_entries_id_seq OWNED BY public.application_ip_whitelist_entries.id;


--
-- Name: application_public_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_public_keys (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    public_key text NOT NULL,
    fingerprint character varying,
    description character varying,
    disabled boolean DEFAULT false NOT NULL,
    created_by_id integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    key_id bigint NOT NULL
);


--
-- Name: application_public_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.application_public_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: application_public_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.application_public_keys_id_seq OWNED BY public.application_public_keys.id;


--
-- Name: application_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_settings (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    ip_whitelisting_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    url_whitelisting_enabled boolean DEFAULT false NOT NULL
);


--
-- Name: application_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.application_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: application_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.application_settings_id_seq OWNED BY public.application_settings.id;


--
-- Name: application_url_whitelist_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_url_whitelist_entries (
    id bigint NOT NULL,
    application_setting_id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    url character varying NOT NULL,
    description text,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: application_url_whitelist_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.application_url_whitelist_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: application_url_whitelist_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.application_url_whitelist_entries_id_seq OWNED BY public.application_url_whitelist_entries.id;


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: assessment_assistants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_assistants (
    id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    ai_assistant_id bigint NOT NULL,
    assessment_prompt text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: assessment_assistants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessment_assistants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_assistants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessment_assistants_id_seq OWNED BY public.assessment_assistants.id;


--
-- Name: assessment_consent_setting_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_consent_setting_translations (
    id bigint NOT NULL,
    custom_consent_text text,
    locale character varying NOT NULL,
    assessment_consent_setting_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    custom_acknowledgment_text text,
    tenant_id bigint
);


--
-- Name: assessment_consent_setting_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessment_consent_setting_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_consent_setting_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessment_consent_setting_translations_id_seq OWNED BY public.assessment_consent_setting_translations.id;


--
-- Name: assessment_consent_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_consent_settings (
    id bigint NOT NULL,
    custom_consent_text text,
    policy_version integer DEFAULT 1 NOT NULL,
    assessment_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    custom_acknowledgment_text text,
    tenant_id bigint
);


--
-- Name: assessment_consent_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessment_consent_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_consent_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessment_consent_settings_id_seq OWNED BY public.assessment_consent_settings.id;


--
-- Name: assessment_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_translations (
    id bigint NOT NULL,
    name text,
    description text,
    timing text,
    locale character varying NOT NULL,
    assessment_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: assessment_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessment_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessment_translations_id_seq OWNED BY public.assessment_translations.id;


--
-- Name: assessments_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments_clients (
    id bigint NOT NULL,
    client_id bigint,
    assessment_id bigint,
    "position" integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    enable_universal_links boolean DEFAULT false,
    assessment_key character varying,
    key_generated_at timestamp without time zone,
    key_expires_at timestamp without time zone
);


--
-- Name: assessments_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessments_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessments_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessments_clients_id_seq OWNED BY public.assessments_clients.id;


--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;


--
-- Name: assessments_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments_reports (
    id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    report_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: assessments_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessments_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessments_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessments_reports_id_seq OWNED BY public.assessments_reports.id;


--
-- Name: assessors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessors (
    id bigint NOT NULL,
    campaign_id bigint,
    user_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: assessors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessors_id_seq OWNED BY public.assessors.id;


--
-- Name: assigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assigns (
    id integer NOT NULL,
    assessment_id integer NOT NULL,
    results jsonb,
    scoring jsonb,
    embedded_data jsonb,
    status integer DEFAULT 0,
    role integer DEFAULT 0,
    completed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    step integer,
    membership_id integer NOT NULL,
    started_at timestamp without time zone,
    norm_data jsonb,
    agile_scoring jsonb,
    project_assign_id integer,
    mindmill_report character varying,
    selected_locale character varying,
    mindmill_prefix character varying,
    external_results json,
    occupations jsonb DEFAULT '[]'::jsonb,
    innovation_styles jsonb DEFAULT '[]'::jsonb,
    campaign_id bigint,
    evaluator_id bigint,
    subject_id bigint,
    current_element character varying,
    current_page integer,
    seedrandom character varying,
    expiry_date timestamp without time zone,
    last_activity_at timestamp without time zone,
    meta_data jsonb DEFAULT '{}'::jsonb,
    additional_time integer,
    reset_count integer DEFAULT 0,
    prev_pages json DEFAULT '[]'::json
);


--
-- Name: assigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assigns_id_seq OWNED BY public.assigns.id;


--
-- Name: assigns_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assigns_reports (
    id integer NOT NULL,
    report_id integer,
    assign_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    access_reports_at timestamp without time zone,
    external_report character varying,
    hogan_score jsonb DEFAULT '{}'::jsonb,
    user_access boolean DEFAULT true,
    pdf character varying,
    generating boolean DEFAULT false
);


--
-- Name: assigns_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assigns_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assigns_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assigns_reports_id_seq OWNED BY public.assigns_reports.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    action character varying NOT NULL,
    user_id bigint,
    record_id bigint,
    record_type character varying,
    payload text,
    request text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    campaign_id integer,
    project_id integer,
    client_id integer,
    request_uuid character varying,
    user_agent character varying,
    interface integer,
    client_ip character varying,
    outcome integer DEFAULT 1,
    failure_reason character varying,
    tenant_id bigint,
    impersonated_by_id bigint
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: audits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audits (
    id bigint NOT NULL,
    auditable_id bigint,
    auditable_type character varying,
    associated_id bigint,
    associated_type character varying,
    user_id bigint,
    user_type character varying,
    username character varying,
    action character varying,
    audited_changes jsonb,
    version integer DEFAULT 0,
    comment character varying,
    remote_address character varying,
    request_uuid character varying,
    created_at timestamp(6) without time zone,
    tenant_id bigint
);


--
-- Name: audits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audits_id_seq OWNED BY public.audits.id;


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocks (
    id integer NOT NULL,
    name character varying,
    "position" integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assessment_id integer,
    deleted_at timestamp without time zone,
    props json,
    view integer DEFAULT 0,
    disabled boolean DEFAULT false,
    template_id integer,
    owner_id integer,
    block_type integer DEFAULT 0,
    tenant_id bigint
);


--
-- Name: blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blocks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blocks_id_seq OWNED BY public.blocks.id;


--
-- Name: bulk_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bulk_reports (
    id bigint NOT NULL,
    user_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    files character varying[] DEFAULT '{}'::character varying[],
    campaign_id bigint,
    tenant_id bigint
);


--
-- Name: bulk_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bulk_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bulk_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bulk_reports_id_seq OWNED BY public.bulk_reports.id;


--
-- Name: c_10313_datasheet; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.c_10313_datasheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade",
    (data_deprecated_on_11_07_2025 ->> 'Position'::text) AS "Position",
    (data_deprecated_on_11_07_2025 ->> 'Last Name'::text) AS "Last Name",
    (data_deprecated_on_11_07_2025 ->> 'Department'::text) AS "Department"
   FROM public.sheet_rows
  WHERE (sheet_id = 69)
  ORDER BY id;


--
-- Name: c_10463_datasheet; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.c_10463_datasheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade"
   FROM public.sheet_rows
  WHERE (sheet_id = 65)
  ORDER BY id;


--
-- Name: c_10501_datasheet; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.c_10501_datasheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'Department'::text) AS "Department",
    (data_deprecated_on_11_07_2025 ->> 'First Name'::text) AS "First Name",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade",
    (data_deprecated_on_11_07_2025 ->> 'Last Name'::text) AS "Last Name",
    (data_deprecated_on_11_07_2025 ->> 'Position'::text) AS "Position"
   FROM public.sheet_rows
  WHERE (sheet_id = 62)
  ORDER BY id;


--
-- Name: c_10542_datasheet; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.c_10542_datasheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade",
    (data_deprecated_on_11_07_2025 ->> 'Position'::text) AS "Position",
    (data_deprecated_on_11_07_2025 ->> 'Last Name'::text) AS "Last Name",
    (data_deprecated_on_11_07_2025 ->> 'Department'::text) AS "Department",
    (data_deprecated_on_11_07_2025 ->> 'First Name'::text) AS "First Name"
   FROM public.sheet_rows
  WHERE (sheet_id = 70)
  ORDER BY id;


--
-- Name: c_10543_datasheet; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.c_10543_datasheet AS
 SELECT id,
    email AS "Email",
    (data_deprecated_on_11_07_2025 ->> 'Grade'::text) AS "Grade"
   FROM public.sheet_rows
  WHERE (sheet_id = 72)
  ORDER BY id;


--
-- Name: campaign_ai_artifact_dependencies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_ai_artifact_dependencies (
    id bigint NOT NULL,
    campaign_ai_artifact_id bigint NOT NULL,
    dependency_type character varying NOT NULL,
    dependency_id bigint NOT NULL,
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: campaign_ai_artifact_dependencies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_ai_artifact_dependencies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_ai_artifact_dependencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_ai_artifact_dependencies_id_seq OWNED BY public.campaign_ai_artifact_dependencies.id;


--
-- Name: campaign_ai_artifacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_ai_artifacts (
    id bigint NOT NULL,
    ai_assistant_id bigint NOT NULL,
    code character varying NOT NULL,
    name character varying NOT NULL,
    campaign_id bigint NOT NULL,
    include_all_datasheet_columns boolean DEFAULT false,
    instructions text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    dependencies_checksum character varying,
    tenant_id bigint
);


--
-- Name: campaign_ai_artifacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_ai_artifacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_ai_artifacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_ai_artifacts_id_seq OWNED BY public.campaign_ai_artifacts.id;


--
-- Name: campaign_assessment_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_assessment_groups (
    id bigint NOT NULL,
    campaign_id bigint,
    name character varying,
    previous_group_required boolean,
    previous_assessments_required boolean,
    "position" integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    group_type integer DEFAULT 0 NOT NULL,
    require_previous_groups_completion_for_booking boolean DEFAULT false,
    tenant_id bigint
);


--
-- Name: campaign_assessment_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_assessment_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_assessment_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_assessment_groups_id_seq OWNED BY public.campaign_assessment_groups.id;


--
-- Name: campaign_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_assessments (
    id bigint NOT NULL,
    assessment_id bigint,
    campaign_id bigint,
    "position" integer DEFAULT 1 NOT NULL,
    enable_universal_links boolean DEFAULT false NOT NULL,
    assessment_key character varying,
    key_generated_at timestamp without time zone,
    key_expires_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    norm_id bigint,
    campaign_assessment_group_id bigint,
    assessor_form_id bigint,
    external_norm_id character varying,
    available_locales text[] DEFAULT '{}'::text[],
    external_config jsonb,
    prework boolean DEFAULT false,
    workshop_activity boolean DEFAULT false NOT NULL,
    workshop_activity_duration integer,
    allow_multiple_responses boolean DEFAULT false,
    require_scheduling boolean DEFAULT false,
    auto_assign boolean DEFAULT true,
    mettl_schedule_record_id bigint,
    caching_enabled boolean DEFAULT false,
    proctoring_enabled boolean DEFAULT false NOT NULL,
    tenant_id bigint,
    occupation_condition_set_id bigint
);


--
-- Name: campaign_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_assessments_id_seq OWNED BY public.campaign_assessments.id;


--
-- Name: campaign_assessor_assessment_factor_weights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_assessor_assessment_factor_weights (
    id bigint NOT NULL,
    campaign_id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    factor_id bigint NOT NULL,
    weight double precision DEFAULT 1.0 NOT NULL,
    tenant_id bigint
);


--
-- Name: campaign_assessor_assessment_factor_weights_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_assessor_assessment_factor_weights_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_assessor_assessment_factor_weights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_assessor_assessment_factor_weights_id_seq OWNED BY public.campaign_assessor_assessment_factor_weights.id;


--
-- Name: campaign_assessor_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_assessor_assessments (
    id bigint NOT NULL,
    campaign_id bigint,
    assessment_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    allow_multiple_responses boolean DEFAULT false,
    campaign_assessment_group_id bigint,
    tenant_id bigint
);


--
-- Name: campaign_assessor_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_assessor_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_assessor_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_assessor_assessments_id_seq OWNED BY public.campaign_assessor_assessments.id;


--
-- Name: campaign_factor_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_factor_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_factor_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_factor_groups_id_seq OWNED BY public.campaign_factor_groups.id;


--
-- Name: campaign_factor_values_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_factor_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_factor_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_factor_values_id_seq OWNED BY public.campaign_factor_values.id;


--
-- Name: campaign_factors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_factors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_factors_id_seq OWNED BY public.campaign_factors.id;


--
-- Name: campaign_idp_dependencies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_idp_dependencies (
    id bigint NOT NULL,
    campaign_idp_id bigint,
    dependency_type character varying,
    dependency_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: campaign_idp_dependencies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_idp_dependencies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_idp_dependencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_idp_dependencies_id_seq OWNED BY public.campaign_idp_dependencies.id;


--
-- Name: campaign_idps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_idps (
    id bigint NOT NULL,
    automatically_assign_new boolean DEFAULT false,
    campaign_id bigint NOT NULL,
    idp_template_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: campaign_idps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_idps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_idps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_idps_id_seq OWNED BY public.campaign_idps.id;


--
-- Name: campaign_option_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_option_translations (
    id bigint NOT NULL,
    instructions text,
    locale character varying NOT NULL,
    campaign_option_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    description text,
    tenant_id bigint
);


--
-- Name: campaign_option_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_option_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_option_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_option_translations_id_seq OWNED BY public.campaign_option_translations.id;


--
-- Name: campaign_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_options (
    id bigint NOT NULL,
    campaign_id bigint,
    time_zone character varying,
    fixed_time boolean DEFAULT false,
    fixed_time_duration integer,
    instructions_enabled boolean DEFAULT false,
    instructions text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    proctoring_enabled boolean DEFAULT false,
    identification integer DEFAULT 0,
    rules jsonb DEFAULT '{"allow_voices": false, "allow_to_use_books": false, "allow_to_use_excel": false, "allow_to_use_paper": true, "allow_to_use_websites": false, "allow_absence_in_frame": false, "allow_to_use_calculator": true, "allow_to_use_messengers": false, "allow_wrong_gaze_direction": false, "allow_to_use_human_assistant": false}'::jsonb,
    description text,
    integration_type integer DEFAULT 0 NOT NULL,
    proctoring_trial boolean DEFAULT false,
    workshop_booking_requires_prework_completion boolean DEFAULT false,
    campaign_scoring_variables text,
    proctoring_type integer DEFAULT 0 NOT NULL,
    show_watermark boolean DEFAULT false,
    watermark_content character varying DEFAULT ''::character varying,
    workshop_invite_requires_prework_completion boolean DEFAULT false,
    proctoring_enabled_on_workshop_activity boolean DEFAULT true,
    enable_video_call_recording boolean DEFAULT false NOT NULL,
    enable_mobile_proctoring boolean DEFAULT false,
    system_check_enabled boolean DEFAULT false NOT NULL,
    system_check_validity integer DEFAULT 86400,
    allow_continue_with_warning boolean DEFAULT false NOT NULL,
    minimum_upload_speed integer,
    minimum_download_speed integer,
    skip_assessment_level_checks boolean DEFAULT true NOT NULL,
    selective_proctoring_enabled boolean DEFAULT false NOT NULL,
    tenant_id bigint,
    face_detection_enabled boolean DEFAULT false NOT NULL,
    minimum_face_detection_ratio integer DEFAULT 85,
    phrase_verification_enabled boolean DEFAULT false NOT NULL
);


--
-- Name: campaign_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_options_id_seq OWNED BY public.campaign_options.id;


--
-- Name: campaign_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_reports (
    id bigint NOT NULL,
    report_id bigint,
    report_family_id bigint,
    campaign_id bigint,
    user_access boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assessor_access boolean DEFAULT false,
    user_dashboard boolean DEFAULT false,
    main_report boolean DEFAULT false,
    auto_assign boolean DEFAULT true,
    default_language character varying,
    available_languages jsonb DEFAULT '[]'::jsonb,
    tenant_id bigint
);


--
-- Name: campaign_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_reports_id_seq OWNED BY public.campaign_reports.id;


--
-- Name: campaign_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_templates (
    id bigint NOT NULL,
    name character varying NOT NULL,
    assessment_id integer NOT NULL,
    report_id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    owner_id integer,
    campaign_id bigint,
    tenant_id bigint
);


--
-- Name: campaign_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_templates_id_seq OWNED BY public.campaign_templates.id;


--
-- Name: campaign_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_users (
    id bigint NOT NULL,
    campaign_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_id bigint,
    active boolean DEFAULT true,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    completion_status integer DEFAULT 0,
    additional_time integer,
    expiry_date timestamp without time zone,
    status integer DEFAULT 0,
    schedule_start_date timestamp without time zone,
    schedule_end_date timestamp without time zone,
    campaign_scores_finalized boolean DEFAULT false,
    campaign_scores_calculated_date timestamp(6) without time zone,
    campaign_scores_finalized_date timestamp(6) without time zone,
    campaign_scores_errors json,
    external_id character varying,
    current_job_role_id bigint,
    target_job_role_id bigint,
    campaign_artifact_results_finalized boolean DEFAULT false,
    level integer,
    campaign_artifact_results_finalized_at timestamp(6) without time zone,
    tenant_id bigint
);


--
-- Name: campaign_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_users_id_seq OWNED BY public.campaign_users.id;


--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- Name: client_ai_assistants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_ai_assistants (
    id bigint NOT NULL,
    ai_assistant_id bigint NOT NULL,
    hourly_rate_limit integer,
    license_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: client_ai_assistants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_ai_assistants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_ai_assistants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_ai_assistants_id_seq OWNED BY public.client_ai_assistants.id;


--
-- Name: client_auditlog_export_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_auditlog_export_settings (
    id bigint NOT NULL,
    destination_type smallint,
    active boolean DEFAULT false,
    description character varying,
    s3_access_key_id character varying,
    encrypted_s3_secret_access_key character varying,
    encrypted_s3_secret_access_key_iv character varying,
    s3_bucket_name character varying,
    s3_bucket_folder character varying,
    s3_region character varying,
    s3_endpoint character varying,
    last_exported_at timestamp(6) without time zone,
    client_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: client_auditlog_export_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_auditlog_export_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_auditlog_export_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_auditlog_export_settings_id_seq OWNED BY public.client_auditlog_export_settings.id;


--
-- Name: client_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_features (
    id bigint NOT NULL,
    client_id bigint,
    sms_notification boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    ai_assisted_idp boolean DEFAULT false NOT NULL,
    ai_assistants boolean DEFAULT false NOT NULL,
    global_skills boolean DEFAULT false NOT NULL,
    idp boolean DEFAULT false NOT NULL,
    enhance_with_ai boolean DEFAULT false NOT NULL,
    ai_translation boolean DEFAULT false NOT NULL,
    ai_content_analysis boolean DEFAULT false NOT NULL,
    tenant_id bigint
);


--
-- Name: client_features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_features_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_features_id_seq OWNED BY public.client_features.id;


--
-- Name: client_privacy_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_privacy_settings (
    id bigint NOT NULL,
    client_id bigint NOT NULL,
    disable_data_processing boolean DEFAULT false,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: client_privacy_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_privacy_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_privacy_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_privacy_settings_id_seq OWNED BY public.client_privacy_settings.id;


--
-- Name: client_sso_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_sso_settings (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    sso_enabled boolean DEFAULT false NOT NULL,
    sso_enforced boolean DEFAULT false NOT NULL,
    idp_entity_id character varying,
    idp_sso_url character varying,
    idp_slo_url character varying,
    idp_cert text,
    session_timeout integer,
    allowed_domains jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: client_sso_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_sso_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_sso_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_sso_settings_id_seq OWNED BY public.client_sso_settings.id;


--
-- Name: client_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_translations (
    id bigint NOT NULL,
    custom_privacy_consent_text text,
    locale character varying NOT NULL,
    client_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: client_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_translations_id_seq OWNED BY public.client_translations.id;


--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: clients_report_families; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients_report_families (
    client_id integer NOT NULL,
    report_family_id integer NOT NULL
);


--
-- Name: clients_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients_reports (
    id integer NOT NULL,
    client_id integer,
    report_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_access boolean DEFAULT false,
    report_family_id bigint
);


--
-- Name: clients_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_reports_id_seq OWNED BY public.clients_reports.id;


--
-- Name: communication_cc_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communication_cc_users (
    id bigint NOT NULL,
    communication_id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: communication_cc_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communication_cc_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communication_cc_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communication_cc_users_id_seq OWNED BY public.communication_cc_users.id;


--
-- Name: communication_email_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communication_email_resources (
    id bigint NOT NULL,
    communication_email_id bigint NOT NULL,
    resource_type character varying NOT NULL,
    resource_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: communication_email_resources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communication_email_resources_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communication_email_resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communication_email_resources_id_seq OWNED BY public.communication_email_resources.id;


--
-- Name: communication_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communication_emails (
    id integer NOT NULL,
    membership_id integer,
    communication_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    sent_at timestamp without time zone,
    campaign_user_id bigint,
    workshop_id bigint,
    workshop_invite_id bigint,
    user_id bigint,
    tenant_id bigint
);


--
-- Name: communication_emails_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communication_emails_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communication_emails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communication_emails_id_seq OWNED BY public.communication_emails.id;


--
-- Name: communication_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communication_translations (
    id bigint NOT NULL,
    subject character varying,
    body text,
    locale character varying NOT NULL,
    communication_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: communication_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communication_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communication_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communication_translations_id_seq OWNED BY public.communication_translations.id;


--
-- Name: communications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communications (
    id integer NOT NULL,
    subject character varying,
    body text,
    assessment_id integer,
    client_id integer,
    recipients integer DEFAULT 0,
    delivery_rule integer,
    delivery_at timestamp without time zone,
    delivery_interval character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    owner_id integer,
    project_id integer,
    campaign_id integer,
    sub_campaign_id integer,
    end_level_id integer,
    kind integer,
    created_by_id integer,
    stop_reminder_datetime timestamp without time zone,
    stop_reminder boolean DEFAULT false NOT NULL,
    last_ran_at timestamp without time zone,
    updated_by_id bigint,
    assessment_completion_status_code character varying,
    delivery_delay_hours integer,
    campaign_assessment_group_id bigint,
    delivery_start_date date,
    delivery_end_date date,
    delivery_time_of_day time without time zone,
    delivery_timezone character varying,
    delivery_frequency character varying,
    delivery_weekdays character varying[] DEFAULT '{}'::character varying[],
    tenant_id bigint
);


--
-- Name: communications_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communications_assessments (
    id bigint NOT NULL,
    communication_id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: communications_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communications_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communications_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communications_assessments_id_seq OWNED BY public.communications_assessments.id;


--
-- Name: communications_copy_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communications_copy_memberships (
    communication_id integer NOT NULL,
    membership_id integer NOT NULL,
    tenant_id bigint
);


--
-- Name: communications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communications_id_seq OWNED BY public.communications.id;


--
-- Name: communications_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communications_memberships (
    communication_id integer NOT NULL,
    membership_id integer NOT NULL,
    tenant_id bigint
);


--
-- Name: communications_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communications_users (
    id integer NOT NULL,
    user_id integer,
    communication_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: communications_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communications_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communications_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communications_users_id_seq OWNED BY public.communications_users.id;


--
-- Name: course_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_schedules (
    id bigint NOT NULL,
    development_action_id bigint NOT NULL,
    start_date_time timestamp(6) without time zone NOT NULL,
    end_date_time timestamp(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: course_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.course_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: course_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.course_schedules_id_seq OWNED BY public.course_schedules.id;


--
-- Name: dashboards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboards (
    id bigint NOT NULL,
    campaign_id bigint,
    name character varying,
    dataset_id character varying,
    report_id character varying,
    enabled boolean DEFAULT false,
    refresh_interval integer DEFAULT 15,
    image character varying,
    last_refreshed_at timestamp without time zone,
    refresh_tried_at timestamp without time zone,
    dashboard_type integer DEFAULT 0 NOT NULL,
    project_path character varying,
    visual_header_visibility smallint DEFAULT 0,
    tenant_id bigint
);


--
-- Name: dashboards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dashboards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dashboards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dashboards_id_seq OWNED BY public.dashboards.id;


--
-- Name: data_geos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_geos (
    id integer NOT NULL,
    country_code character varying,
    country_name character varying,
    region_code character varying,
    region_name character varying,
    city character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: data_geos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.data_geos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_geos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.data_geos_id_seq OWNED BY public.data_geos.id;


--
-- Name: data_report_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_report_jobs (
    id bigint NOT NULL,
    data_report_id bigint,
    status integer DEFAULT 0,
    admin_job_record_id bigint,
    created_by_id bigint,
    password character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    file character varying,
    tenant_id bigint
);


--
-- Name: data_report_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.data_report_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_report_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.data_report_jobs_id_seq OWNED BY public.data_report_jobs.id;


--
-- Name: data_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_reports (
    id bigint NOT NULL,
    name character varying,
    configuration jsonb,
    owner_id bigint,
    last_updated_by_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint,
    report_type integer DEFAULT 0 NOT NULL,
    scope integer DEFAULT 0 NOT NULL
);


--
-- Name: data_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.data_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.data_reports_id_seq OWNED BY public.data_reports.id;


--
-- Name: datasheet_column_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.datasheet_column_preferences (
    id bigint NOT NULL,
    resource_type character varying,
    resource_id bigint,
    visible_columns json,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: datasheet_column_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.datasheet_column_preferences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: datasheet_column_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.datasheet_column_preferences_id_seq OWNED BY public.datasheet_column_preferences.id;


--
-- Name: design_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.design_settings (
    id bigint NOT NULL,
    logo character varying,
    background character varying,
    login_box_position character varying,
    background_color character varying,
    secondary_logo character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    project_id bigint,
    primary_color character varying,
    error_color character varying,
    warning_color character varying,
    success_color character varying,
    info_color character varying,
    background_size character varying DEFAULT 'cover'::character varying,
    logo_alt_text character varying,
    secondary_logo_alt_text character varying,
    tenant_id bigint,
    client_id bigint
);


--
-- Name: design_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.design_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: design_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.design_settings_id_seq OWNED BY public.design_settings.id;


--
-- Name: development_action_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.development_action_translations (
    id bigint NOT NULL,
    name character varying,
    description character varying,
    locale character varying NOT NULL,
    development_action_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: development_action_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.development_action_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: development_action_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.development_action_translations_id_seq OWNED BY public.development_action_translations.id;


--
-- Name: development_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.development_actions (
    id bigint NOT NULL,
    development_action_type integer DEFAULT 0 NOT NULL,
    learning_style integer DEFAULT 0 NOT NULL,
    name character varying,
    description character varying,
    course_url character varying,
    course_provider character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    image character varying,
    course_start_date timestamp(6) without time zone,
    course_end_date timestamp(6) without time zone,
    duration integer,
    available_languages jsonb DEFAULT '[]'::jsonb,
    owner_type character varying,
    owner_id bigint,
    source_type integer DEFAULT 0 NOT NULL,
    tenant_id bigint
);


--
-- Name: development_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.development_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: development_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.development_actions_id_seq OWNED BY public.development_actions.id;


--
-- Name: dimensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dimensions (
    id integer NOT NULL,
    name character varying,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    owner_id integer,
    occupations_enabled boolean DEFAULT false NOT NULL,
    innovation_styles_enabled boolean DEFAULT false NOT NULL,
    created_by_id bigint,
    updated_by_id bigint,
    dimension_type integer DEFAULT 0,
    tenant_id bigint,
    default_occupation_condition_set_id bigint
);


--
-- Name: dimensions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dimensions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dimensions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dimensions_id_seq OWNED BY public.dimensions.id;


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_templates (
    id bigint NOT NULL,
    campaign_id bigint,
    subject character varying,
    body text,
    from_email character varying,
    from_name character varying,
    translations jsonb,
    type integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_templates_id_seq OWNED BY public.email_templates.id;


--
-- Name: event_deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_deliveries (
    id bigint NOT NULL,
    resource_type character varying NOT NULL,
    resource_id bigint NOT NULL,
    event_type integer NOT NULL,
    delivery_type integer NOT NULL,
    sent_at timestamp(6) without time zone,
    meta jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: event_deliveries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_deliveries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_deliveries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_deliveries_id_seq OWNED BY public.event_deliveries.id;


--
-- Name: factor_benchmark_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factor_benchmark_scores (
    id bigint NOT NULL,
    benchmark_score numeric,
    factor_id bigint NOT NULL,
    campaign_id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: factor_benchmark_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.factor_benchmark_scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factor_benchmark_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.factor_benchmark_scores_id_seq OWNED BY public.factor_benchmark_scores.id;


--
-- Name: factor_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factor_translations (
    id bigint NOT NULL,
    locale character varying NOT NULL,
    name character varying,
    description character varying,
    factor_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: factor_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.factor_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factor_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.factor_translations_id_seq OWNED BY public.factor_translations.id;


--
-- Name: factors_aliases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factors_aliases (
    id bigint NOT NULL,
    factor_id bigint NOT NULL,
    report_id bigint NOT NULL,
    name character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: factors_aliases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.factors_aliases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factors_aliases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.factors_aliases_id_seq OWNED BY public.factors_aliases.id;


--
-- Name: factors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.factors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.factors_id_seq OWNED BY public.factors.id;


--
-- Name: factors_norms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factors_norms (
    id integer NOT NULL,
    type public.factors_norms_types,
    factor_id integer,
    norm_id integer,
    props json,
    tenant_id bigint
);


--
-- Name: factors_norms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.factors_norms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factors_norms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.factors_norms_id_seq OWNED BY public.factors_norms.id;


--
-- Name: factors_scoring; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factors_scoring (
    id integer NOT NULL,
    props json,
    factor_id integer,
    assessment_id integer,
    question_id integer,
    scoring_strategy integer DEFAULT 0,
    ai_scoring_config jsonb,
    tenant_id bigint
);


--
-- Name: factors_scoring_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.factors_scoring_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factors_scoring_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.factors_scoring_id_seq OWNED BY public.factors_scoring.id;


--
-- Name: factors_sub_factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factors_sub_factors (
    id bigint NOT NULL,
    sub_factor_id bigint,
    factor_id bigint,
    weight double precision DEFAULT 1.0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    predicate character varying,
    value double precision,
    "position" integer,
    tenant_id bigint
);


--
-- Name: factors_sub_factors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.factors_sub_factors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factors_sub_factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.factors_sub_factors_id_seq OWNED BY public.factors_sub_factors.id;


--
-- Name: highlights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.highlights (
    id uuid NOT NULL,
    assessment_id bigint,
    user_id bigint,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    resource_id integer NOT NULL,
    resource_type character varying NOT NULL,
    tenant_id bigint
);


--
-- Name: hogan_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hogan_credentials (
    id bigint NOT NULL,
    membership_id bigint,
    encrypted_password character varying NOT NULL,
    encrypted_password_iv character varying NOT NULL,
    participant_id character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_id bigint,
    provider integer DEFAULT 0,
    norm character varying,
    hogan_group_name character varying,
    active boolean DEFAULT true,
    tenant_id bigint
);


--
-- Name: hogan_credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hogan_credentials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hogan_credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hogan_credentials_id_seq OWNED BY public.hogan_credentials.id;


--
-- Name: hogan_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hogan_logs (
    id bigint NOT NULL,
    log_type character varying,
    participant_id character varying,
    "group" character varying,
    response jsonb,
    meta jsonb,
    call_stack jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: hogan_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hogan_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hogan_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hogan_logs_id_seq OWNED BY public.hogan_logs.id;


--
-- Name: hogan_report_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hogan_report_settings (
    id bigint NOT NULL,
    report_id bigint NOT NULL,
    hogan_report_id character varying NOT NULL,
    hogan_norm_id character varying NOT NULL,
    hogan_language_id character varying NOT NULL,
    load_report boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    hogan_suitability_id character varying,
    tenant_id bigint
);


--
-- Name: hogan_report_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hogan_report_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hogan_report_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hogan_report_settings_id_seq OWNED BY public.hogan_report_settings.id;


--
-- Name: idp_report_pdfs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_report_pdfs (
    id bigint NOT NULL,
    user_idp_plan_id bigint,
    locale character varying NOT NULL,
    first_generated_at timestamp(6) without time zone,
    last_generated_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    include_reflective_questions boolean DEFAULT false,
    tenant_id bigint
);


--
-- Name: idp_report_pdfs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_report_pdfs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: idp_report_pdfs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_report_pdfs_id_seq OWNED BY public.idp_report_pdfs.id;


--
-- Name: idp_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_settings (
    id bigint NOT NULL,
    allow_global_skills boolean DEFAULT false,
    manager_approves_idp boolean DEFAULT false,
    manager_can_edit_idp boolean DEFAULT false,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    project_id bigint,
    require_all_development_actions_complete boolean DEFAULT false,
    tenant_id bigint
);


--
-- Name: idp_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: idp_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_settings_id_seq OWNED BY public.idp_settings.id;


--
-- Name: idp_template_development_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_template_development_actions (
    id bigint NOT NULL,
    idp_template_id bigint NOT NULL,
    development_action_id bigint NOT NULL,
    category integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: idp_template_development_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_template_development_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: idp_template_development_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_template_development_actions_id_seq OWNED BY public.idp_template_development_actions.id;


--
-- Name: idp_template_interview_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_template_interview_questions (
    id bigint NOT NULL,
    idp_template_id bigint NOT NULL,
    interview_question_id bigint NOT NULL,
    "order" integer,
    time_limit integer,
    mandatory boolean,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: idp_template_interview_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_template_interview_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: idp_template_interview_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_template_interview_questions_id_seq OWNED BY public.idp_template_interview_questions.id;


--
-- Name: idp_template_reflection_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_template_reflection_questions (
    id bigint NOT NULL,
    idp_template_id bigint NOT NULL,
    reflection_question_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    mandatory boolean DEFAULT false,
    min_words integer,
    max_words integer,
    tenant_id bigint
);


--
-- Name: idp_template_reflection_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_template_reflection_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: idp_template_reflection_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_template_reflection_questions_id_seq OWNED BY public.idp_template_reflection_questions.id;


--
-- Name: idp_template_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_template_skills (
    id bigint NOT NULL,
    idp_template_id bigint NOT NULL,
    skill_id bigint NOT NULL,
    category integer DEFAULT 0 NOT NULL,
    scoring_source integer,
    assessment_id bigint,
    campaign_factor_code character varying,
    desired_rating double precision,
    min_rating integer DEFAULT 0,
    max_rating integer DEFAULT 5,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    factor_id bigint,
    assessment_score_type integer DEFAULT 0 NOT NULL,
    tenant_id bigint
);


--
-- Name: idp_template_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_template_skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: idp_template_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_template_skills_id_seq OWNED BY public.idp_template_skills.id;


--
-- Name: idp_template_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_template_translations (
    id bigint NOT NULL,
    instructions jsonb DEFAULT '{"content": ""}'::jsonb NOT NULL,
    locale character varying NOT NULL,
    idp_template_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    title_text character varying,
    subtitle_text character varying,
    chat_instructions jsonb DEFAULT '{"content": ""}'::jsonb,
    tenant_id bigint
);


--
-- Name: idp_template_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_template_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: idp_template_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_template_translations_id_seq OWNED BY public.idp_template_translations.id;


--
-- Name: idp_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.idp_templates (
    id bigint NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    level jsonb DEFAULT '[]'::jsonb NOT NULL,
    available_development_actions_selection_type integer DEFAULT 0 NOT NULL,
    suggested_development_actions_selection_type integer DEFAULT 0 NOT NULL,
    skill_gap_datasheet_columns jsonb DEFAULT '[]'::jsonb NOT NULL,
    skill_gap_profile_field_names jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    report_id bigint,
    self_rating_enabled boolean DEFAULT false,
    behavioural_global_tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    behavioural_client_tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    technical_global_tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    technical_client_tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    project_id bigint,
    skill_settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    title_text character varying,
    subtitle_text character varying,
    fields json DEFAULT '["name","role","assigned_data","division","review_date","publish_date","completion_date"]'::json,
    logo_type integer DEFAULT 3,
    show_reflections boolean DEFAULT true,
    instructions jsonb DEFAULT '{"content": ""}'::jsonb NOT NULL,
    status integer DEFAULT 0,
    ai_enabled boolean DEFAULT false NOT NULL,
    ai_assisted_idp_enabled boolean DEFAULT false NOT NULL,
    ai_assistant_id bigint,
    one_click_idp_enabled boolean DEFAULT false NOT NULL,
    one_click_ai_assistant_id bigint,
    skill_source_preference integer DEFAULT 0,
    document_analysis_ai_assistant_id bigint,
    skill_gap_report_analysis_ai_assistant_id bigint,
    chat_instructions jsonb DEFAULT '{"content": ""}'::jsonb,
    show_chat_instructions boolean DEFAULT false,
    guideline_position integer DEFAULT 0,
    flip_background boolean DEFAULT false,
    page_styles jsonb DEFAULT '{}'::jsonb NOT NULL,
    show_guidelines boolean DEFAULT true,
    tenant_id bigint
);


--
-- Name: idp_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.idp_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: idp_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.idp_templates_id_seq OWNED BY public.idp_templates.id;


--
-- Name: iiht_user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.iiht_user_assessments (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    number_of_attempts integer DEFAULT 0 NOT NULL,
    url character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    schedule_id integer,
    email character varying,
    tenant_id bigint
);


--
-- Name: iiht_user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.iiht_user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: iiht_user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.iiht_user_assessments_id_seq OWNED BY public.iiht_user_assessments.id;


--
-- Name: innovation_styles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.innovation_styles (
    id bigint NOT NULL,
    name character varying,
    icon character varying,
    description text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    dimension_id bigint,
    full_description text,
    "position" integer,
    tenant_id bigint
);


--
-- Name: innovation_styles_factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.innovation_styles_factors (
    id bigint NOT NULL,
    innovation_style_id bigint,
    factor_id bigint,
    predicate character varying,
    value double precision,
    "position" integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    weight double precision DEFAULT 1.0,
    tenant_id bigint
);


--
-- Name: innovation_styles_factors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.innovation_styles_factors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: innovation_styles_factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.innovation_styles_factors_id_seq OWNED BY public.innovation_styles_factors.id;


--
-- Name: innovation_styles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.innovation_styles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: innovation_styles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.innovation_styles_id_seq OWNED BY public.innovation_styles.id;


--
-- Name: integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.integrations (
    id bigint NOT NULL,
    name integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true,
    config jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    project_id bigint NOT NULL,
    tenant_id bigint
);


--
-- Name: integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.integrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.integrations_id_seq OWNED BY public.integrations.id;


--
-- Name: interview_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.interview_questions (
    id bigint NOT NULL,
    question character varying,
    description character varying,
    time_limit integer,
    mandatory boolean DEFAULT false,
    question_type integer DEFAULT 0,
    project_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: interview_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.interview_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: interview_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.interview_questions_id_seq OWNED BY public.interview_questions.id;


--
-- Name: job_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_groups (
    id bigint NOT NULL,
    project_id bigint,
    name character varying NOT NULL,
    ancestry character varying,
    ancestry_depth integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: job_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_groups_id_seq OWNED BY public.job_groups.id;


--
-- Name: job_role_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_role_translations (
    id bigint NOT NULL,
    name character varying,
    description character varying,
    locale character varying NOT NULL,
    job_role_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: job_role_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_role_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_role_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_role_translations_id_seq OWNED BY public.job_role_translations.id;


--
-- Name: job_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_roles (
    id bigint NOT NULL,
    name character varying NOT NULL,
    description character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    code character varying,
    project_id bigint,
    job_group_id bigint,
    tenant_id bigint
);


--
-- Name: job_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: job_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.job_roles_id_seq OWNED BY public.job_roles.id;


--
-- Name: last_job_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.last_job_runs (
    id bigint NOT NULL,
    name character varying NOT NULL,
    started_at timestamp(6) without time zone NOT NULL,
    finished_at timestamp(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: last_job_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.last_job_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: last_job_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.last_job_runs_id_seq OWNED BY public.last_job_runs.id;


--
-- Name: libraries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.libraries (
    id integer NOT NULL,
    name character varying,
    description text,
    type integer DEFAULT 0,
    file character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    owner_id integer,
    ancestry character varying,
    created_by_id bigint,
    updated_by_id bigint,
    tenant_id bigint
);


--
-- Name: libraries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.libraries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: libraries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.libraries_id_seq OWNED BY public.libraries.id;


--
-- Name: license_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.license_usages (
    id integer NOT NULL,
    license_id integer,
    assigns_report_id integer,
    client_id integer NOT NULL,
    user_id bigint,
    extras jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    campaign_id bigint,
    registration_code_id bigint,
    status_updated_by_id integer,
    status_updated_at timestamp without time zone,
    status integer DEFAULT 0,
    proctoring_session_id integer,
    proctoring_credits_debited integer,
    proctoring_credits_credited integer,
    proctoring_session_duration integer,
    consumer_id bigint,
    consumer_type character varying,
    project_id bigint,
    project_license_id bigint,
    tenant_id bigint
);


--
-- Name: license_usages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.license_usages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: license_usages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.license_usages_id_seq OWNED BY public.license_usages.id;


--
-- Name: licenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.licenses (
    id integer NOT NULL,
    number integer DEFAULT 0,
    overuse_number integer DEFAULT 0,
    used_number integer DEFAULT 0,
    client_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    end_date date NOT NULL,
    start_date date NOT NULL,
    report_family_id integer,
    disabled boolean DEFAULT false,
    type integer DEFAULT 0,
    is_project_specific boolean DEFAULT false NOT NULL,
    tenant_id bigint
);


--
-- Name: licenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.licenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: licenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.licenses_id_seq OWNED BY public.licenses.id;


--
-- Name: lti_oauth2_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lti_oauth2_access_tokens (
    id bigint NOT NULL,
    token_hash character varying NOT NULL,
    project_id bigint,
    integration_id character varying,
    scope character varying,
    expires_at timestamp(6) without time zone NOT NULL,
    last_used_at timestamp(6) without time zone,
    revoked boolean DEFAULT false,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: lti_oauth2_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lti_oauth2_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lti_oauth2_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lti_oauth2_access_tokens_id_seq OWNED BY public.lti_oauth2_access_tokens.id;


--
-- Name: maintenance_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_settings (
    id bigint NOT NULL,
    sub_system integer NOT NULL,
    maintenance_window_enabled boolean DEFAULT false NOT NULL,
    time_zone character varying NOT NULL,
    start_time timestamp(6) without time zone NOT NULL,
    end_time timestamp(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: maintenance_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maintenance_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maintenance_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maintenance_settings_id_seq OWNED BY public.maintenance_settings.id;


--
-- Name: media_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_responses (
    id bigint NOT NULL,
    asset character varying,
    question_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    users_result_id integer,
    assign_id integer,
    user_selected boolean DEFAULT false,
    tenant_id bigint
);


--
-- Name: media_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_responses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_responses_id_seq OWNED BY public.media_responses.id;


--
-- Name: meeting_recordings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_recordings (
    id bigint NOT NULL,
    meeting_room_id uuid NOT NULL,
    external_id character varying,
    s3key character varying,
    status integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    transcription_status integer DEFAULT 0 NOT NULL,
    transcription_external_id character varying,
    transcription_s3key character varying,
    meeting_session_id character varying,
    tenant_id bigint
);


--
-- Name: meeting_recordings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meeting_recordings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meeting_recordings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meeting_recordings_id_seq OWNED BY public.meeting_recordings.id;


--
-- Name: meeting_rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_rooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying,
    external_id character varying,
    meetable_type character varying,
    meetable_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    dailyco_api_version character varying DEFAULT 'v2'::character varying NOT NULL,
    transcription_enabled boolean DEFAULT false NOT NULL,
    tenant_id bigint
);


--
-- Name: membership_grants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_grants (
    id bigint NOT NULL,
    membership_id bigint,
    data jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: membership_grants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_grants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_grants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_grants_id_seq OWNED BY public.membership_grants.id;


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberships (
    id integer NOT NULL,
    client_id integer,
    user_id integer,
    hris jsonb DEFAULT '{}'::jsonb,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_retail boolean DEFAULT false,
    assigns_count integer DEFAULT 0,
    assigns_completed boolean DEFAULT false,
    project_membership_id integer,
    ancestry character varying,
    role integer DEFAULT 0 NOT NULL,
    already_invited boolean DEFAULT false NOT NULL,
    campaign_id integer,
    tenant_id bigint
);


--
-- Name: memberships_admin_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memberships_admin_roles (
    id bigint NOT NULL,
    membership_id bigint NOT NULL,
    admin_role_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: memberships_admin_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.memberships_admin_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: memberships_admin_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.memberships_admin_roles_id_seq OWNED BY public.memberships_admin_roles.id;


--
-- Name: memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.memberships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.memberships_id_seq OWNED BY public.memberships.id;


--
-- Name: mettl_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mettl_assessments (
    id bigint NOT NULL,
    product_id character varying NOT NULL,
    name character varying NOT NULL,
    duration integer,
    instructions text,
    default_instructions text,
    registration_fields jsonb,
    project_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: mettl_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mettl_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mettl_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mettl_assessments_id_seq OWNED BY public.mettl_assessments.id;


--
-- Name: mettl_schedule_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mettl_schedule_records (
    id bigint NOT NULL,
    project_id bigint,
    assessment_id bigint NOT NULL,
    schedule_id integer NOT NULL,
    schedule_name character varying,
    access_key character varying,
    access_url character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    duplicated_from_id bigint,
    schedule_number integer DEFAULT 1,
    proctoring_enabled boolean DEFAULT false,
    secure_browser_enabled boolean DEFAULT false,
    visual_proctoring_settings jsonb DEFAULT '{"enabled": false, "candidate_authorization": false, "candidate_screen_capture": false}'::jsonb,
    web_proctoring_settings jsonb DEFAULT '{"count": 5, "enabled": false, "show_remaining_counts": false}'::jsonb,
    tenant_id bigint
);


--
-- Name: mettl_schedule_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mettl_schedule_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mettl_schedule_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mettl_schedule_records_id_seq OWNED BY public.mettl_schedule_records.id;


--
-- Name: mettl_user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mettl_user_assessments (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    url character varying,
    email character varying,
    mettl_schedule_record_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: mettl_user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mettl_user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mettl_user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mettl_user_assessments_id_seq OWNED BY public.mettl_user_assessments.id;


--
-- Name: mhs_user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mhs_user_assessments (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    url character varying,
    email character varying,
    session_id character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    data_gatherer_id character varying,
    data_gathering_id character varying,
    observation_item_sets json,
    active boolean DEFAULT true NOT NULL,
    confidence_interval integer DEFAULT 0,
    leadership_bar integer DEFAULT 0,
    norm_region integer DEFAULT 0,
    norm_option integer DEFAULT 0,
    tenant_id bigint
);


--
-- Name: mhs_user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mhs_user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mhs_user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mhs_user_assessments_id_seq OWNED BY public.mhs_user_assessments.id;


--
-- Name: microsite_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.microsite_assessments (
    id bigint NOT NULL,
    product_id character varying NOT NULL,
    name character varying NOT NULL,
    metadata jsonb,
    project_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: microsite_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.microsite_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: microsite_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.microsite_assessments_id_seq OWNED BY public.microsite_assessments.id;


--
-- Name: microsite_user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.microsite_user_assessments (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    participant_id character varying,
    url character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    registration_status integer DEFAULT 0 NOT NULL,
    error_message text,
    answers jsonb DEFAULT '{}'::jsonb NOT NULL,
    completed_at timestamp(6) without time zone,
    tenant_id bigint
);


--
-- Name: microsite_user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.microsite_user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: microsite_user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.microsite_user_assessments_id_seq OWNED BY public.microsite_user_assessments.id;


--
-- Name: normalized_campaign_accessheets; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.normalized_campaign_accessheets AS
 SELECT sheets.campaign_id,
    sheet_rows.email,
    sheet_columns.name AS field,
    sheet_row_data.numeric_value,
    sheet_row_data.string_value
   FROM (((public.sheet_row_data
     JOIN public.sheet_rows ON ((sheet_rows.id = sheet_row_data.sheet_row_id)))
     JOIN public.sheets ON ((sheets.id = sheet_rows.sheet_id)))
     JOIN public.sheet_columns ON (((sheet_columns.sheet_id = sheets.id) AND (sheet_columns.id = sheet_row_data.sheet_column_id))))
  WHERE ((sheets.campaign_id IS NOT NULL) AND ((sheets.type)::text = 'Accesssheet'::text));


--
-- Name: normalized_campaign_datasheets; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.normalized_campaign_datasheets AS
 SELECT sheets.campaign_id,
    campaign_users.id AS campaign_user_id,
    users.id AS user_id,
    sheet_rows.email,
    sheet_columns.name AS field,
    sheet_row_data.numeric_value,
    sheet_row_data.string_value
   FROM (((((public.sheet_row_data
     JOIN public.sheet_rows ON ((sheet_rows.id = sheet_row_data.sheet_row_id)))
     JOIN public.sheets ON ((sheets.id = sheet_rows.sheet_id)))
     JOIN public.sheet_columns ON ((sheet_columns.sheet_id = sheets.id)))
     JOIN public.campaign_users ON ((campaign_users.campaign_id = sheets.campaign_id)))
     JOIN public.users ON (((users.id = campaign_users.user_id) AND (users.email OPERATOR(public.=) sheet_rows.email))))
  WHERE ((sheets.campaign_id IS NOT NULL) AND ((sheets.type)::text = 'Datasheet'::text));


--
-- Name: normalized_factor_scores; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.normalized_factor_scores AS
 SELECT id,
    factor_id,
    user_assessment_id,
    ((scores ->> 'norm_score'::text))::double precision AS norm_score,
    ((scores ->> 'score'::text))::double precision AS score,
    ((scores ->> 'zscore'::text))::double precision AS zscore,
    ((scores ->> 'percentage'::text))::double precision AS percentage
   FROM public.user_assessment_factor_scores;


--
-- Name: norms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.norms (
    id integer NOT NULL,
    name character varying,
    disabled boolean DEFAULT false,
    created_by_id integer,
    updated_by_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    dimension_id integer,
    owner_id integer,
    norm_type integer DEFAULT 0,
    tenant_id bigint
);


--
-- Name: norms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.norms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: norms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.norms_id_seq OWNED BY public.norms.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    text character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assessment_id integer,
    membership_id integer,
    tenant_id bigint
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: oracle_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oracle_credentials (
    id bigint NOT NULL,
    idcs_user_id character varying NOT NULL,
    idcs_user_name character varying NOT NULL,
    user_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    last_accessed_at timestamp(6) without time zone
);


--
-- Name: oac_users; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.oac_users AS
 SELECT oracle_credentials.idcs_user_name AS user_name,
    users.email
   FROM (public.oracle_credentials
     JOIN public.users ON ((users.id = oracle_credentials.user_id)));


--
-- Name: occupation_condition_sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.occupation_condition_sets (
    id bigint NOT NULL,
    name character varying NOT NULL,
    dimension_id integer NOT NULL,
    tenant_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    score_type integer DEFAULT 0 NOT NULL
);


--
-- Name: occupation_condition_sets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.occupation_condition_sets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: occupation_condition_sets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.occupation_condition_sets_id_seq OWNED BY public.occupation_condition_sets.id;


--
-- Name: occupations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.occupations (
    id integer NOT NULL,
    name character varying,
    icon character varying,
    description text,
    dimension_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    full_description text,
    potential_areas_of_study text,
    key_career_tracks text,
    high_school_entry_roles text,
    diploma_qualification text,
    bachelors_or_masters_qualification text,
    work_environment text,
    color character varying,
    alternative_icon character varying,
    indicative_roles_image character varying,
    key_career_tracks_image character varying,
    tenant_id bigint
);


--
-- Name: occupations_factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.occupations_factors (
    id integer NOT NULL,
    occupation_id integer,
    factor_id integer,
    predicate character varying,
    value double precision,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    "position" integer,
    weight double precision DEFAULT 1.0,
    tenant_id bigint,
    occupation_condition_set_id bigint NOT NULL
);


--
-- Name: occupations_factors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.occupations_factors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: occupations_factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.occupations_factors_id_seq OWNED BY public.occupations_factors.id;


--
-- Name: occupations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.occupations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: occupations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.occupations_id_seq OWNED BY public.occupations.id;


--
-- Name: old_passwords; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.old_passwords (
    id bigint NOT NULL,
    encrypted_password character varying,
    password_archivable_type character varying,
    password_archivable_id integer,
    password_salt character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: old_passwords_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.old_passwords_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: old_passwords_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.old_passwords_id_seq OWNED BY public.old_passwords.id;


--
-- Name: oracle_credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.oracle_credentials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oracle_credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.oracle_credentials_id_seq OWNED BY public.oracle_credentials.id;


--
-- Name: pearson_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pearson_assessments (
    id bigint NOT NULL,
    product_id character varying NOT NULL,
    title character varying NOT NULL,
    norms jsonb,
    languages jsonb
);


--
-- Name: pearson_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pearson_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pearson_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pearson_assessments_id_seq OWNED BY public.pearson_assessments.id;


--
-- Name: pearson_user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pearson_user_assessments (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    schedule_id character varying,
    url character varying,
    norm_id character varying,
    variation character varying,
    error_details jsonb DEFAULT '{}'::jsonb,
    tenant_id bigint
);


--
-- Name: pearson_user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pearson_user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pearson_user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pearson_user_assessments_id_seq OWNED BY public.pearson_user_assessments.id;


--
-- Name: platform_exceptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_exceptions (
    id bigint NOT NULL,
    identifier character varying NOT NULL,
    consecutive_failure_count integer DEFAULT 0 NOT NULL,
    resource_type character varying,
    resource_id bigint,
    last_notified_at timestamp(6) without time zone,
    meta jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: platform_exceptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_exceptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_exceptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_exceptions_id_seq OWNED BY public.platform_exceptions.id;


--
-- Name: power_bi_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.power_bi_settings (
    id bigint NOT NULL,
    capacity_id character varying,
    workspace_id character varying,
    project_id bigint,
    tenant_id bigint
);


--
-- Name: power_bi_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.power_bi_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: power_bi_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.power_bi_settings_id_seq OWNED BY public.power_bi_settings.id;


--
-- Name: privacy_consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.privacy_consents (
    id bigint NOT NULL,
    membership_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_id bigint,
    version smallint DEFAULT 1 NOT NULL,
    policy_type integer DEFAULT 0,
    ip_address character varying,
    user_agent character varying,
    locale character varying,
    campaign_id bigint,
    assessment_id bigint,
    data_role smallint DEFAULT 0 NOT NULL,
    tenant_id bigint
);


--
-- Name: privacy_consents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.privacy_consents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: privacy_consents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.privacy_consents_id_seq OWNED BY public.privacy_consents.id;


--
-- Name: privacy_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.privacy_links (
    id bigint NOT NULL,
    client_id bigint,
    text character varying,
    link text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: privacy_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.privacy_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: privacy_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.privacy_links_id_seq OWNED BY public.privacy_links.id;


--
-- Name: privacy_setting_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.privacy_setting_translations (
    id bigint NOT NULL,
    custom_privacy_consent_text text,
    locale character varying NOT NULL,
    privacy_setting_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    custom_privacy_acknowledgment_text text,
    tenant_id bigint
);


--
-- Name: privacy_setting_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.privacy_setting_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: privacy_setting_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.privacy_setting_translations_id_seq OWNED BY public.privacy_setting_translations.id;


--
-- Name: privacy_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.privacy_settings (
    id bigint NOT NULL,
    privacy_consent boolean DEFAULT true,
    custom_privacy_policy_version integer,
    custom_privacy_consent_text text,
    privacy_link_text character varying,
    privacy_link_url text,
    project_id bigint,
    enable_privacy_link boolean DEFAULT false,
    custom_privacy_consent boolean DEFAULT false,
    mask_identity_for_pearson boolean DEFAULT false,
    mask_identity_for_saville boolean DEFAULT false,
    mask_identity_for_hogan boolean DEFAULT false,
    mask_identity_for_iiht boolean DEFAULT false,
    mask_identity_for_examus boolean DEFAULT false,
    mask_identity_for_mettl boolean DEFAULT false,
    disable_data_processing boolean DEFAULT false,
    mask_identity_for_skillvue boolean DEFAULT false,
    allow_video_call_recording boolean DEFAULT false NOT NULL,
    enable_video_call_recording_for_all_new_campaigns boolean DEFAULT false NOT NULL,
    video_call_recording_expiry_in_seconds integer,
    mask_identity_for_yoodli boolean DEFAULT false,
    mask_identity_for_mhs boolean DEFAULT false NOT NULL,
    custom_privacy_acknowledgment_text text,
    tenant_id bigint
);


--
-- Name: privacy_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.privacy_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: privacy_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.privacy_settings_id_seq OWNED BY public.privacy_settings.id;


--
-- Name: proctoring_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proctoring_sessions (
    id bigint NOT NULL,
    session_id uuid DEFAULT public.gen_random_uuid(),
    campaign_user_id bigint,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    status integer,
    results jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    invalid_session boolean DEFAULT false,
    last_status_checked_at timestamp without time zone,
    user_assessment_id bigint,
    tenant_id bigint
);


--
-- Name: proctoring_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proctoring_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proctoring_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proctoring_sessions_id_seq OWNED BY public.proctoring_sessions.id;


--
-- Name: proficiency_level_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proficiency_level_translations (
    id bigint NOT NULL,
    proficiency_level_id bigint NOT NULL,
    locale character varying NOT NULL,
    level_definition jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: proficiency_level_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proficiency_level_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proficiency_level_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proficiency_level_translations_id_seq OWNED BY public.proficiency_level_translations.id;


--
-- Name: proficiency_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proficiency_levels (
    id bigint NOT NULL,
    project_id bigint,
    proficiency_type integer NOT NULL,
    skill_type integer,
    level integer NOT NULL,
    level_definition jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    skill_id bigint,
    tenant_id bigint
);


--
-- Name: proficiency_levels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.proficiency_levels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: proficiency_levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.proficiency_levels_id_seq OWNED BY public.proficiency_levels.id;


--
-- Name: profile_field_values_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profile_field_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profile_field_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profile_field_values_id_seq OWNED BY public.profile_field_values.id;


--
-- Name: profile_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profile_fields_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profile_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profile_fields_id_seq OWNED BY public.profile_fields.id;


--
-- Name: profile_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profile_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profile_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profile_settings_id_seq OWNED BY public.profile_settings.id;


--
-- Name: project_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_assessments (
    id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    project_id bigint NOT NULL,
    normalize_factor_scores boolean DEFAULT false,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_result_validity_in_days integer,
    tenant_id bigint
);


--
-- Name: project_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_assessments_id_seq OWNED BY public.project_assessments.id;


--
-- Name: project_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_features (
    id bigint NOT NULL,
    project_id integer,
    sms_notification boolean DEFAULT false NOT NULL,
    ai_assistants boolean DEFAULT false NOT NULL,
    ai_assisted_idp boolean DEFAULT false NOT NULL,
    global_skills boolean DEFAULT false NOT NULL,
    idp boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    enhance_with_ai boolean DEFAULT false NOT NULL,
    ai_translation boolean DEFAULT false NOT NULL,
    ai_content_analysis boolean DEFAULT false NOT NULL,
    tenant_id bigint
);


--
-- Name: project_features_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_features_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_features_id_seq OWNED BY public.project_features.id;


--
-- Name: project_licenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_licenses (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    license_id bigint NOT NULL,
    enabled boolean DEFAULT false,
    usage_limit integer DEFAULT 0 NOT NULL,
    used_number integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: project_licenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_licenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_licenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_licenses_id_seq OWNED BY public.project_licenses.id;


--
-- Name: question_recoding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_recoding (
    id bigint NOT NULL,
    assessment_id bigint,
    question_id bigint,
    props jsonb,
    tenant_id bigint
);


--
-- Name: question_recoding_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.question_recoding_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: question_recoding_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.question_recoding_id_seq OWNED BY public.question_recoding.id;


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: reflection_question_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reflection_question_translations (
    id bigint NOT NULL,
    question character varying,
    locale character varying NOT NULL,
    reflection_question_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: reflection_question_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reflection_question_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reflection_question_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reflection_question_translations_id_seq OWNED BY public.reflection_question_translations.id;


--
-- Name: reflection_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reflection_questions (
    id bigint NOT NULL,
    question text,
    mandatory boolean DEFAULT false,
    min_words integer,
    max_words integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    project_id bigint NOT NULL,
    tenant_id bigint
);


--
-- Name: reflection_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reflection_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reflection_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reflection_questions_id_seq OWNED BY public.reflection_questions.id;


--
-- Name: registration_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registration_codes (
    id bigint NOT NULL,
    name character varying,
    code public.citext,
    total_count integer NOT NULL,
    use_count integer DEFAULT 0,
    end_level_id integer,
    project_id integer,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    disabled boolean DEFAULT true,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    campaign_id integer,
    restricted_domains text[],
    tenant_id bigint
);


--
-- Name: registration_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registration_codes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registration_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registration_codes_id_seq OWNED BY public.registration_codes.id;


--
-- Name: registration_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registration_settings (
    id bigint NOT NULL,
    require_mobile_number boolean DEFAULT false,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    project_id bigint NOT NULL,
    hide_signup boolean DEFAULT false,
    tenant_id bigint
);


--
-- Name: registration_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registration_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registration_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registration_settings_id_seq OWNED BY public.registration_settings.id;


--
-- Name: relationships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.relationships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: relationships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.relationships_id_seq OWNED BY public.relationships.id;


--
-- Name: report_approval_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_approval_settings (
    id bigint NOT NULL,
    campaign_id bigint,
    report_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    qc_user_ids bigint[] DEFAULT '{}'::bigint[],
    approver_user_ids bigint[] DEFAULT '{}'::bigint[],
    approval_notification_user_ids bigint[] DEFAULT '{}'::bigint[],
    approvers_can_edit boolean DEFAULT false,
    approvers_not_required boolean DEFAULT false,
    do_not_send_notifications boolean DEFAULT false,
    allow_bulk_approve boolean DEFAULT false,
    allow_qc_bulk_submit boolean DEFAULT false,
    send_digest_emails boolean DEFAULT false NOT NULL,
    digest_frequency character varying DEFAULT 'daily'::character varying,
    digest_time time without time zone DEFAULT '21:00:00'::time without time zone,
    digest_weekdays integer[] DEFAULT '{}'::integer[],
    digest_timezone character varying DEFAULT 'Asia/Dubai'::character varying,
    digest_delivery_mode character varying DEFAULT 'immediate'::character varying,
    last_digest_sent_at timestamp(6) without time zone,
    digest_emails_enabled_at timestamp(6) without time zone,
    tenant_id bigint
);


--
-- Name: report_approval_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.report_approval_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_approval_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.report_approval_settings_id_seq OWNED BY public.report_approval_settings.id;


--
-- Name: report_families; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_families (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id integer
);


--
-- Name: report_families_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.report_families_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_families_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.report_families_id_seq OWNED BY public.report_families.id;


--
-- Name: report_families_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_families_reports (
    report_id integer,
    report_family_id integer,
    external_package_id character varying,
    id bigint NOT NULL,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


--
-- Name: report_families_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.report_families_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_families_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.report_families_reports_id_seq OWNED BY public.report_families_reports.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    assessment_id integer,
    name character varying,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    owner_id integer,
    extra jsonb DEFAULT '{}'::jsonb NOT NULL,
    icon character varying,
    props jsonb DEFAULT '{}'::jsonb NOT NULL,
    data_configuration jsonb DEFAULT '{}'::jsonb,
    default_language character varying DEFAULT 'en'::character varying,
    data_sheet_columns jsonb DEFAULT '[]'::jsonb NOT NULL,
    provider integer,
    category integer DEFAULT 0,
    archived boolean DEFAULT false,
    deleted_at timestamp without time zone,
    deleted_by_id bigint,
    description character varying,
    poster character varying,
    created_by_id bigint,
    updated_by_id bigint,
    data_only boolean DEFAULT false,
    external_settings jsonb DEFAULT '{}'::jsonb,
    campaign_factors_deprecated_on_2024_12_23 jsonb DEFAULT '[]'::jsonb NOT NULL,
    styles jsonb DEFAULT '{}'::jsonb,
    other_languages jsonb DEFAULT '[]'::jsonb,
    tenant_id bigint
);


--
-- Name: reports_accesses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports_accesses (
    id bigint NOT NULL,
    report_id bigint,
    membership_id bigint,
    user_access boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assessment_id bigint
);


--
-- Name: reports_accesses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_accesses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_accesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_accesses_id_seq OWNED BY public.reports_accesses.id;


--
-- Name: reports_campaign_ai_artifacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports_campaign_ai_artifacts (
    id bigint NOT NULL,
    code character varying NOT NULL,
    report_id bigint NOT NULL,
    name character varying NOT NULL,
    ai_assistant_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: reports_campaign_ai_artifacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_campaign_ai_artifacts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_campaign_ai_artifacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_campaign_ai_artifacts_id_seq OWNED BY public.reports_campaign_ai_artifacts.id;


--
-- Name: reports_campaign_factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports_campaign_factors (
    id bigint NOT NULL,
    code character varying NOT NULL,
    report_id bigint NOT NULL,
    name character varying NOT NULL,
    output_type character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    description text,
    tenant_id bigint
);


--
-- Name: reports_campaign_factors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_campaign_factors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_campaign_factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_campaign_factors_id_seq OWNED BY public.reports_campaign_factors.id;


--
-- Name: reports_filters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports_filters (
    id integer NOT NULL,
    report_id integer,
    name character varying,
    conditions json,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assessment_id integer,
    min_required_responses integer DEFAULT 0,
    tenant_id bigint
);


--
-- Name: reports_filters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_filters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_filters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_filters_id_seq OWNED BY public.reports_filters.id;


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: reports_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports_modules (
    id integer NOT NULL,
    page_id integer,
    name character varying,
    props json,
    "position" integer,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    type character varying,
    assessment_id bigint,
    meta json DEFAULT '{"hidden":false,"locked":false}'::json,
    tenant_id bigint
);


--
-- Name: reports_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_modules_id_seq OWNED BY public.reports_modules.id;


--
-- Name: reports_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports_pages (
    id integer NOT NULL,
    report_id integer,
    name character varying,
    props json,
    "position" integer,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    display_logic jsonb,
    tenant_id bigint
);


--
-- Name: reports_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_pages_id_seq OWNED BY public.reports_pages.id;


--
-- Name: resource_hogan_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_hogan_credentials (
    id bigint NOT NULL,
    resource_id integer NOT NULL,
    resource_type character varying NOT NULL,
    hogan_credential_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: resource_hogan_credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resource_hogan_credentials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resource_hogan_credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resource_hogan_credentials_id_seq OWNED BY public.resource_hogan_credentials.id;


--
-- Name: saml_service_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saml_service_providers (
    id bigint NOT NULL,
    name character varying NOT NULL,
    entity_id character varying NOT NULL,
    acs_urls text[] DEFAULT '{}'::text[],
    certificate text,
    encrypted_idp_certificate text,
    encrypted_idp_private_key text,
    enabled boolean DEFAULT true NOT NULL,
    require_signed_requests boolean DEFAULT false NOT NULL,
    project_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    mask_identity boolean DEFAULT false NOT NULL,
    integration_type integer DEFAULT 0 NOT NULL,
    tenant_id bigint
);


--
-- Name: saml_service_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saml_service_providers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saml_service_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saml_service_providers_id_seq OWNED BY public.saml_service_providers.id;


--
-- Name: saml_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saml_settings (
    id bigint NOT NULL,
    verified boolean DEFAULT false,
    enabled boolean DEFAULT false,
    enforced boolean DEFAULT false,
    entity_id character varying,
    sso_service_url character varying,
    after_signout_url character varying,
    cert text,
    test_settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    project_id bigint NOT NULL,
    name_identifier_format integer DEFAULT 0,
    email_pipetext character varying,
    tenant_id bigint
);


--
-- Name: saml_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saml_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saml_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saml_settings_id_seq OWNED BY public.saml_settings.id;


--
-- Name: saville_factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saville_factors (
    id bigint NOT NULL,
    assessment_id character varying,
    factor_id character varying,
    name character varying,
    score_type character varying,
    value_type character varying,
    tenant_id bigint
);


--
-- Name: saville_factors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saville_factors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saville_factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saville_factors_id_seq OWNED BY public.saville_factors.id;


--
-- Name: saville_report_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saville_report_settings (
    id bigint NOT NULL,
    report_id bigint NOT NULL,
    saville_report_id character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: saville_report_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saville_report_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saville_report_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saville_report_settings_id_seq OWNED BY public.saville_report_settings.id;


--
-- Name: saville_user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saville_user_assessments (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    request_id character varying,
    url character varying,
    norm_id character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    data_seprator character varying,
    error_code character varying,
    candidate_id bigint,
    tenant_id bigint
);


--
-- Name: saville_user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.saville_user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: saville_user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.saville_user_assessments_id_seq OWNED BY public.saville_user_assessments.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: security_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_settings (
    id bigint NOT NULL,
    project_id integer,
    enforce_strong_password boolean DEFAULT false,
    min_password_length integer DEFAULT 8,
    enforce_password_policy boolean DEFAULT false,
    disable_password_reuse boolean DEFAULT false,
    password_expiration integer,
    restrict_sequences boolean DEFAULT false,
    lock_account boolean DEFAULT false,
    attempts_to_lock integer DEFAULT 3,
    auto_unlock_time integer DEFAULT 10,
    send_unlock_email boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tfa_enabled boolean DEFAULT false,
    magic_link_expiry_in_seconds integer DEFAULT 604800 NOT NULL,
    magic_link_enabled boolean DEFAULT false,
    disallow_password_login boolean DEFAULT false,
    session_inactivity_timeout_in_seconds integer DEFAULT 7200 NOT NULL,
    enable_recaptcha boolean DEFAULT false,
    external_logout_redirect_enabled boolean DEFAULT false,
    external_logout_url character varying,
    tenant_id bigint,
    enforce_return_url_whitelist boolean DEFAULT false NOT NULL,
    return_url_whitelist text DEFAULT ''::text NOT NULL
);


--
-- Name: security_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.security_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: security_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.security_settings_id_seq OWNED BY public.security_settings.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id bigint NOT NULL,
    session_id character varying NOT NULL,
    data text,
    user_id bigint,
    subdomain character varying,
    tenant_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    impersonator_id bigint
);


--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: sheet_columns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sheet_columns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sheet_columns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sheet_columns_id_seq OWNED BY public.sheet_columns.id;


--
-- Name: sheet_row_data_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sheet_row_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sheet_row_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sheet_row_data_id_seq OWNED BY public.sheet_row_data.id;


--
-- Name: sheet_rows_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sheet_rows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sheet_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sheet_rows_id_seq OWNED BY public.sheet_rows.id;


--
-- Name: sheets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sheets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sheets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sheets_id_seq OWNED BY public.sheets.id;


--
-- Name: shortened_urls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shortened_urls (
    id bigint NOT NULL,
    owner_id integer,
    owner_type character varying(20),
    url text NOT NULL,
    unique_key character varying(10) NOT NULL,
    category character varying,
    use_count integer DEFAULT 0 NOT NULL,
    expires_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: shortened_urls_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shortened_urls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shortened_urls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shortened_urls_id_seq OWNED BY public.shortened_urls.id;


--
-- Name: simulation_user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.simulation_user_assessments (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    participant_id character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    content_variation_id character varying,
    time_extension double precision DEFAULT 1.0,
    tenant_id bigint
);


--
-- Name: simulation_user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.simulation_user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: simulation_user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.simulation_user_assessments_id_seq OWNED BY public.simulation_user_assessments.id;


--
-- Name: skill_aliases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_aliases (
    id bigint NOT NULL,
    client_id bigint NOT NULL,
    skill_id bigint NOT NULL,
    name character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: skill_aliases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skill_aliases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skill_aliases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skill_aliases_id_seq OWNED BY public.skill_aliases.id;


--
-- Name: skill_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_groups (
    id bigint NOT NULL,
    project_id bigint,
    name character varying NOT NULL,
    ancestry character varying,
    ancestry_depth integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: skill_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skill_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skill_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skill_groups_id_seq OWNED BY public.skill_groups.id;


--
-- Name: skill_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_translations (
    id bigint NOT NULL,
    name character varying,
    description character varying,
    locale character varying NOT NULL,
    skill_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: skill_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skill_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skill_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skill_translations_id_seq OWNED BY public.skill_translations.id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills (
    id bigint NOT NULL,
    name character varying NOT NULL,
    description character varying,
    skill_type integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    project_id bigint,
    skill_group_id bigint,
    tenant_id bigint
);


--
-- Name: skills_development_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills_development_actions (
    id bigint NOT NULL,
    skill_id bigint NOT NULL,
    development_action_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: skills_development_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skills_development_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skills_development_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skills_development_actions_id_seq OWNED BY public.skills_development_actions.id;


--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: skills_job_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skills_job_roles (
    id bigint NOT NULL,
    skill_id bigint NOT NULL,
    job_role_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    expected_proficiency_level integer,
    project_id bigint,
    tenant_id bigint
);


--
-- Name: skills_job_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skills_job_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skills_job_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skills_job_roles_id_seq OWNED BY public.skills_job_roles.id;


--
-- Name: skillvue_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skillvue_assessments (
    id bigint NOT NULL,
    product_id character varying NOT NULL,
    name character varying NOT NULL,
    iso_code character varying,
    expiration date,
    project_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: skillvue_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skillvue_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skillvue_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skillvue_assessments_id_seq OWNED BY public.skillvue_assessments.id;


--
-- Name: skillvue_user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skillvue_user_assessments (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    url character varying,
    email character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    external_user_id character varying,
    tenant_id bigint
);


--
-- Name: skillvue_user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skillvue_user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skillvue_user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skillvue_user_assessments_id_seq OWNED BY public.skillvue_user_assessments.id;


--
-- Name: sms_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sms_histories (
    id bigint NOT NULL,
    sms_record_id bigint NOT NULL,
    status character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    twilio_sid character varying,
    segment_length integer,
    price numeric,
    first_name character varying,
    last_name character varying,
    mobile_no character varying,
    tenant_id bigint
);


--
-- Name: sms_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sms_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sms_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sms_histories_id_seq OWNED BY public.sms_histories.id;


--
-- Name: sms_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sms_invites (
    id bigint NOT NULL,
    first_name character varying,
    last_name character varying,
    mobile_no character varying,
    locale character varying DEFAULT 'en'::character varying,
    code character varying,
    status integer DEFAULT 0,
    registered_user_id bigint,
    creator_id bigint NOT NULL,
    campaign_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    expiry timestamp without time zone,
    tenant_id bigint
);


--
-- Name: sms_invites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sms_invites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sms_invites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sms_invites_id_seq OWNED BY public.sms_invites.id;


--
-- Name: sms_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sms_records (
    id bigint NOT NULL,
    message character varying,
    link_expiry timestamp without time zone,
    filters jsonb DEFAULT '{}'::jsonb,
    creator_id bigint NOT NULL,
    campaign_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: sms_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sms_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sms_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sms_records_id_seq OWNED BY public.sms_records.id;


--
-- Name: smtp_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.smtp_settings (
    id bigint NOT NULL,
    from_name character varying,
    from_email character varying,
    host character varying,
    encryption integer DEFAULT 0,
    port integer,
    user_name character varying,
    encrypted_password character varying,
    encrypted_password_iv character varying,
    authentication_type integer DEFAULT 0,
    enabled boolean DEFAULT false,
    "boolean" boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    project_id bigint NOT NULL,
    use_sender_verification boolean DEFAULT false,
    concurrency_limit integer DEFAULT 2 NOT NULL,
    rate_limit integer DEFAULT 90 NOT NULL,
    rate_limit_period integer DEFAULT 1 NOT NULL,
    tenant_id bigint
);


--
-- Name: smtp_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.smtp_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: smtp_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.smtp_settings_id_seq OWNED BY public.smtp_settings.id;


--
-- Name: system_check_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_check_records (
    id bigint NOT NULL,
    system_check_session_id bigint NOT NULL,
    check_type character varying NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    data jsonb,
    finished_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: system_check_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_check_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_check_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_check_records_id_seq OWNED BY public.system_check_records.id;


--
-- Name: system_check_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_check_sessions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    finished_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: system_check_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_check_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_check_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_check_sessions_id_seq OWNED BY public.system_check_sessions.id;


--
-- Name: taggings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taggings (
    id bigint NOT NULL,
    tag_id bigint,
    taggable_type character varying,
    taggable_id bigint,
    tagger_type character varying,
    tagger_id bigint,
    context character varying(128),
    created_at timestamp without time zone,
    tenant character varying(128),
    tenant_id bigint
);


--
-- Name: taggings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.taggings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: taggings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.taggings_id_seq OWNED BY public.taggings.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id bigint NOT NULL,
    name character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    taggings_count integer DEFAULT 0
);


--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: taxonomy_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taxonomy_levels (
    id bigint NOT NULL,
    project_id bigint,
    hierarchy_type character varying NOT NULL,
    depth integer,
    label character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: taxonomy_levels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.taxonomy_levels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: taxonomy_levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.taxonomy_levels_id_seq OWNED BY public.taxonomy_levels.id;


--
-- Name: temporary_uploads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.temporary_uploads (
    id bigint NOT NULL,
    file_key character varying NOT NULL,
    filename character varying NOT NULL,
    content_type character varying NOT NULL,
    byte_size bigint NOT NULL,
    service_name character varying NOT NULL,
    bucket character varying NOT NULL,
    checksum character varying,
    status integer DEFAULT 0 NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: temporary_uploads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.temporary_uploads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: temporary_uploads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.temporary_uploads_id_seq OWNED BY public.temporary_uploads.id;


--
-- Name: text_module_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.text_module_overrides (
    id bigint NOT NULL,
    module_id integer,
    user_report_id bigint,
    editor_id bigint,
    content text,
    approved boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: text_module_overrides_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.text_module_overrides_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: text_module_overrides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.text_module_overrides_id_seq OWNED BY public.text_module_overrides.id;


--
-- Name: threesixty_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_campaigns (
    id bigint NOT NULL,
    campaign_id bigint,
    assessment_id bigint,
    report_id bigint,
    status integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    category integer DEFAULT 0,
    tenant_id bigint
);


--
-- Name: threesixty_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_campaigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_campaigns_id_seq OWNED BY public.threesixty_campaigns.id;


--
-- Name: threesixty_email_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_email_histories (
    id bigint NOT NULL,
    subject_id bigint,
    evaluator_id bigint,
    threesixty_campaign_id bigint,
    threesixty_email_schedule_id bigint,
    status smallint,
    meta json,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    consolidated boolean DEFAULT false,
    tenant_id bigint
);


--
-- Name: threesixty_email_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_email_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_email_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_email_histories_id_seq OWNED BY public.threesixty_email_histories.id;


--
-- Name: threesixty_email_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_email_schedules (
    id bigint NOT NULL,
    threesixty_campaign_id bigint,
    name character varying,
    "from" character varying,
    subject text,
    reply_to_email character varying,
    content text,
    scheduled_date timestamp without time zone,
    recipient_criteria jsonb,
    delivered_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    recipient_ids jsonb DEFAULT '[]'::jsonb,
    meta jsonb DEFAULT '{}'::jsonb,
    consolidated boolean DEFAULT false NOT NULL,
    auto_triggered boolean DEFAULT true,
    template_id bigint,
    processing_started_at timestamp(6) without time zone,
    tenant_id bigint
);


--
-- Name: threesixty_email_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_email_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_email_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_email_schedules_id_seq OWNED BY public.threesixty_email_schedules.id;


--
-- Name: threesixty_email_template_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_email_template_translations (
    id bigint NOT NULL,
    subject character varying,
    content text,
    locale character varying NOT NULL,
    threesixty_email_template_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: threesixty_email_template_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_email_template_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_email_template_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_email_template_translations_id_seq OWNED BY public.threesixty_email_template_translations.id;


--
-- Name: threesixty_email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_email_templates (
    id bigint NOT NULL,
    threesixty_campaign_id bigint,
    category integer,
    name character varying NOT NULL,
    "from" character varying NOT NULL,
    reply_to_email character varying NOT NULL,
    content text,
    subject text,
    schedulable boolean DEFAULT true,
    meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    consolidated boolean DEFAULT false NOT NULL,
    daily_digest boolean,
    schedule_time character varying,
    tenant_id bigint
);


--
-- Name: threesixty_email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_email_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_email_templates_id_seq OWNED BY public.threesixty_email_templates.id;


--
-- Name: threesixty_evaluators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_evaluators (
    id bigint NOT NULL,
    campaign_id bigint,
    user_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    approved_evaluations_count integer DEFAULT 0,
    tenant_id bigint
);


--
-- Name: threesixty_evaluators_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_evaluators_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_evaluators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_evaluators_id_seq OWNED BY public.threesixty_evaluators.id;


--
-- Name: threesixty_instruction_template_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_instruction_template_translations (
    id bigint NOT NULL,
    content text,
    locale character varying NOT NULL,
    threesixty_instruction_template_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: threesixty_instruction_template_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_instruction_template_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_instruction_template_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_instruction_template_translations_id_seq OWNED BY public.threesixty_instruction_template_translations.id;


--
-- Name: threesixty_instruction_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_instruction_templates (
    id bigint NOT NULL,
    threesixty_campaign_id bigint,
    name character varying NOT NULL,
    content text,
    enabled boolean DEFAULT true,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: threesixty_instruction_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_instruction_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_instruction_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_instruction_templates_id_seq OWNED BY public.threesixty_instruction_templates.id;


--
-- Name: threesixty_nomination_requirements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_nomination_requirements (
    id bigint NOT NULL,
    threesixty_campaign_id bigint,
    subject_conditions jsonb DEFAULT '[]'::jsonb,
    conditions jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    "position" integer NOT NULL,
    name character varying NOT NULL,
    tenant_id bigint
);


--
-- Name: threesixty_nomination_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_nomination_requirements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_nomination_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_nomination_requirements_id_seq OWNED BY public.threesixty_nomination_requirements.id;


--
-- Name: threesixty_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_options (
    id bigint NOT NULL,
    threesixty_campaign_id bigint,
    participants jsonb DEFAULT '{}'::jsonb,
    messages jsonb DEFAULT '{}'::jsonb,
    reports jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: threesixty_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_options_id_seq OWNED BY public.threesixty_options.id;


--
-- Name: threesixty_reminder_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_reminder_histories (
    id bigint NOT NULL,
    threesixty_campaign_id bigint,
    user_id bigint,
    email_name character varying,
    sent_count integer DEFAULT 0,
    last_sent_at timestamp without time zone,
    tenant_id bigint
);


--
-- Name: threesixty_reminder_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_reminder_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_reminder_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_reminder_histories_id_seq OWNED BY public.threesixty_reminder_histories.id;


--
-- Name: threesixty_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_subjects (
    id bigint NOT NULL,
    campaign_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_id bigint,
    report_approval_status integer DEFAULT 0,
    report_release_status integer DEFAULT 0,
    evaluation_status integer DEFAULT 0,
    evaluation_status_updated_by_id bigint,
    tenant_id bigint
);


--
-- Name: threesixty_subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_subjects_id_seq OWNED BY public.threesixty_subjects.id;


--
-- Name: transcriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transcriptions (
    id bigint NOT NULL,
    transcribable_type character varying NOT NULL,
    transcribable_id bigint NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    error_details jsonb DEFAULT '{}'::jsonb NOT NULL,
    status integer DEFAULT 0 NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    segments jsonb DEFAULT '[]'::jsonb NOT NULL,
    tenant_id bigint
);


--
-- Name: transcriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transcriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transcriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transcriptions_id_seq OWNED BY public.transcriptions.id;


--
-- Name: translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.translations (
    id integer NOT NULL,
    translateable_type character varying,
    translateable_id bigint,
    props json DEFAULT '{}'::json,
    locale character varying(10),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    resource_type character varying,
    resource_id integer,
    data jsonb DEFAULT '{}'::jsonb
);


--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;


--
-- Name: user_assessment_factor_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_assessment_factor_scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_assessment_factor_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_assessment_factor_scores_id_seq OWNED BY public.user_assessment_factor_scores.id;


--
-- Name: user_assessment_verification_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_assessment_verification_images (
    id bigint NOT NULL,
    file character varying,
    user_assessment_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: user_assessment_verification_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_assessment_verification_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_assessment_verification_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_assessment_verification_images_id_seq OWNED BY public.user_assessment_verification_images.id;


--
-- Name: user_assessment_verification_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_assessment_verification_media (
    id bigint NOT NULL,
    file character varying,
    media_type integer DEFAULT 0 NOT NULL,
    user_assessment_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: user_assessment_verification_media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_assessment_verification_media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_assessment_verification_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_assessment_verification_media_id_seq OWNED BY public.user_assessment_verification_media.id;


--
-- Name: user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_assessments_id_seq OWNED BY public.user_assessments.id;


--
-- Name: user_availability_dates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_availability_dates (
    id bigint NOT NULL,
    user_id bigint,
    timezone character varying NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: user_availability_dates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_availability_dates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_availability_dates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_availability_dates_id_seq OWNED BY public.user_availability_dates.id;


--
-- Name: user_availability_days; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_availability_days (
    id bigint NOT NULL,
    user_availability_date_id bigint,
    day integer DEFAULT 1 NOT NULL,
    start_time character varying NOT NULL,
    end_time character varying NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: user_availability_days_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_availability_days_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_availability_days_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_availability_days_id_seq OWNED BY public.user_availability_days.id;


--
-- Name: user_bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_bookings (
    id bigint NOT NULL,
    user_id bigint,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    booked_by_resource_type character varying,
    booked_by_resource_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: user_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_bookings_id_seq OWNED BY public.user_bookings.id;


--
-- Name: user_idp_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_idp_comments (
    id bigint NOT NULL,
    content text NOT NULL,
    user_idp_plan_id bigint,
    created_by_id bigint,
    resource_type character varying,
    resource_id bigint,
    parent_id bigint,
    resolved_by_id bigint,
    resolved_at timestamp(6) without time zone,
    read_by_user_ids integer[] DEFAULT '{}'::integer[] NOT NULL,
    replies_count integer DEFAULT 0 NOT NULL,
    edited boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: user_idp_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_idp_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_idp_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_idp_comments_id_seq OWNED BY public.user_idp_comments.id;


--
-- Name: user_idp_development_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_idp_development_actions (
    id bigint NOT NULL,
    user_idp_plan_id bigint NOT NULL,
    user_idp_skill_id bigint NOT NULL,
    development_action_id bigint,
    progress integer DEFAULT 0 NOT NULL,
    start_date_time timestamp(6) without time zone,
    end_date_time timestamp(6) without time zone,
    private boolean DEFAULT false,
    deleted_at timestamp(6) without time zone,
    deleted_by_id bigint,
    tenant_id bigint
);


--
-- Name: user_idp_development_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_idp_development_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_idp_development_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_idp_development_actions_id_seq OWNED BY public.user_idp_development_actions.id;


--
-- Name: user_idp_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_idp_plans (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    idp_template_id bigint NOT NULL,
    creator_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    campaign_id bigint NOT NULL,
    active boolean DEFAULT true,
    end_date date,
    completed_at timestamp(6) without time zone,
    started_at timestamp(6) without time zone,
    approval_status integer DEFAULT 0 NOT NULL,
    completion_status integer DEFAULT 0 NOT NULL,
    last_approved_at timestamp(6) without time zone,
    review_note text,
    tenant_id bigint
);


--
-- Name: user_idp_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_idp_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_idp_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_idp_plans_id_seq OWNED BY public.user_idp_plans.id;


--
-- Name: user_idp_skills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_idp_skills (
    id bigint NOT NULL,
    user_idp_plan_id bigint NOT NULL,
    skill_id bigint NOT NULL,
    initial_rating double precision,
    final_rating double precision,
    private boolean DEFAULT false NOT NULL,
    deleted_at timestamp(6) without time zone,
    deleted_by_id bigint,
    tenant_id bigint
);


--
-- Name: user_idp_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_idp_skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_idp_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_idp_skills_id_seq OWNED BY public.user_idp_skills.id;


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_preferences (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    category character varying NOT NULL,
    config_key character varying NOT NULL,
    name character varying,
    description text,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    resource_type character varying,
    resource_id bigint,
    tenant_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_preferences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_preferences_id_seq OWNED BY public.user_preferences.id;


--
-- Name: user_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_profiles_id_seq OWNED BY public.user_profiles.id;


--
-- Name: user_reflection_question_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_reflection_question_answers (
    id bigint NOT NULL,
    answer text,
    reflection_question_id bigint NOT NULL,
    user_idp_plan_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: user_reflection_question_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_reflection_question_answers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_reflection_question_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_reflection_question_answers_id_seq OWNED BY public.user_reflection_question_answers.id;


--
-- Name: user_report_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_report_comments (
    id bigint NOT NULL,
    user_report_id bigint,
    reports_module_id bigint,
    creator_id bigint,
    text character varying,
    resolved boolean DEFAULT false,
    deleted_at timestamp without time zone,
    deleted_by_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    parent_id bigint,
    tenant_id bigint
);


--
-- Name: user_report_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_report_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_report_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_report_comments_id_seq OWNED BY public.user_report_comments.id;


--
-- Name: user_report_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_report_events (
    id bigint NOT NULL,
    event_type character varying,
    initiator_id bigint,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    user_report_id bigint,
    tenant_id bigint
);


--
-- Name: user_report_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_report_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_report_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_report_events_id_seq OWNED BY public.user_report_events.id;


--
-- Name: user_report_pdfs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_report_pdfs (
    id bigint NOT NULL,
    user_report_id bigint,
    locale character varying NOT NULL,
    first_generated_at timestamp(6) without time zone,
    last_generated_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: user_report_pdfs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_report_pdfs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_report_pdfs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_report_pdfs_id_seq OWNED BY public.user_report_pdfs.id;


--
-- Name: user_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_reports (
    id bigint NOT NULL,
    report_id bigint,
    user_id bigint,
    campaign_id bigint,
    status integer DEFAULT 0,
    pdf character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_access boolean DEFAULT false,
    report_family_id bigint,
    pdf_path character varying,
    external_added boolean DEFAULT false,
    approval_status character varying DEFAULT 'not_ready'::character varying,
    approval_status_updated_at timestamp without time zone,
    approver_user_id bigint,
    qc_user_id integer,
    qc_at timestamp without time zone,
    approved_at timestamp without time zone,
    tenant_id bigint
);


--
-- Name: user_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_reports_id_seq OWNED BY public.user_reports.id;


--
-- Name: user_saved_filters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_saved_filters (
    id bigint NOT NULL,
    name character varying NOT NULL,
    user_id bigint NOT NULL,
    resource_type character varying NOT NULL,
    filter_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    favorite boolean DEFAULT false,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: user_saved_filters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_saved_filters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_saved_filters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_saved_filters_id_seq OWNED BY public.user_saved_filters.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_results (
    id bigint NOT NULL,
    answers jsonb,
    scoring jsonb,
    occupations jsonb,
    embedded_data jsonb,
    step integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    current_element character varying,
    current_page integer,
    seedrandom character varying,
    meta_data jsonb DEFAULT '{}'::jsonb,
    external_results jsonb DEFAULT '{}'::jsonb,
    innovation_styles jsonb DEFAULT '[]'::jsonb,
    prev_pages json DEFAULT '[]'::json,
    progress integer,
    ai_scoring_status integer,
    tenant_id bigint,
    occupation_condition_set_id bigint
);


--
-- Name: users_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_results_id_seq OWNED BY public.users_results.id;


--
-- Name: vector_embeddings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vector_embeddings (
    id bigint NOT NULL,
    embedding public.vector(512),
    resource_type character varying NOT NULL,
    resource_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    embedding1536 public.vector(1536),
    tenant_id bigint
);


--
-- Name: vector_embeddings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vector_embeddings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vector_embeddings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vector_embeddings_id_seq OWNED BY public.vector_embeddings.id;


--
-- Name: version_associations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.version_associations (
    id bigint NOT NULL,
    version_id bigint,
    foreign_key_name character varying NOT NULL,
    foreign_key_id bigint,
    foreign_type character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: version_associations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.version_associations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: version_associations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.version_associations_id_seq OWNED BY public.version_associations.id;


--
-- Name: versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.versions (
    id bigint NOT NULL,
    whodunnit character varying,
    created_at timestamp(6) without time zone,
    item_id bigint NOT NULL,
    item_type character varying NOT NULL,
    event character varying NOT NULL,
    object jsonb,
    object_changes jsonb,
    transaction_id bigint,
    meta json,
    tenant_id bigint
);


--
-- Name: versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.versions_id_seq OWNED BY public.versions.id;


--
-- Name: webhook_event_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_event_logs (
    id bigint NOT NULL,
    subscription_id bigint NOT NULL,
    event_name character varying NOT NULL,
    event_id character varying NOT NULL,
    status integer NOT NULL,
    request text NOT NULL,
    response text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: webhook_event_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.webhook_event_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: webhook_event_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.webhook_event_logs_id_seq OWNED BY public.webhook_event_logs.id;


--
-- Name: webhook_subscription_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_subscription_topics (
    id bigint NOT NULL,
    name character varying NOT NULL,
    subscription_id bigint NOT NULL,
    tenant_id bigint
);


--
-- Name: webhook_subscription_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.webhook_subscription_topics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: webhook_subscription_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.webhook_subscription_topics_id_seq OWNED BY public.webhook_subscription_topics.id;


--
-- Name: webhook_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_subscriptions (
    id bigint NOT NULL,
    url character varying NOT NULL,
    active boolean NOT NULL,
    encrypted boolean DEFAULT false NOT NULL,
    secret text,
    project_id bigint,
    username character varying,
    encrypted_password character varying,
    encrypted_password_iv character varying,
    description text,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone,
    deleted_by_id bigint,
    auth_type integer DEFAULT 0,
    include_locales boolean DEFAULT false,
    encrypted_api_key character varying,
    encrypted_api_key_iv character varying,
    api_key_header character varying,
    rate_limit integer DEFAULT 60 NOT NULL,
    rate_limit_period integer DEFAULT 1 NOT NULL,
    oauth_grant_type character varying,
    oauth_token_url character varying,
    encrypted_oauth_client_id character varying,
    encrypted_oauth_client_id_iv character varying,
    encrypted_oauth_client_secret character varying,
    encrypted_oauth_client_secret_iv character varying,
    oauth_scope character varying,
    assessment_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    tenant_id bigint
);


--
-- Name: webhook_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.webhook_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: webhook_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.webhook_subscriptions_id_seq OWNED BY public.webhook_subscriptions.id;


--
-- Name: workshop_assessors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_assessors (
    id bigint NOT NULL,
    workshop_id bigint,
    user_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: workshop_assessors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshop_assessors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshop_assessors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshop_assessors_id_seq OWNED BY public.workshop_assessors.id;


--
-- Name: workshop_invite_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_invite_logs (
    id bigint NOT NULL,
    user_id bigint,
    created_by_id bigint,
    details json,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    workshop_invite_id bigint,
    action integer,
    tenant_id bigint
);


--
-- Name: workshop_invite_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshop_invite_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshop_invite_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshop_invite_logs_id_seq OWNED BY public.workshop_invite_logs.id;


--
-- Name: workshop_invite_translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_invite_translations (
    id bigint NOT NULL,
    title character varying,
    description character varying,
    locale character varying NOT NULL,
    workshop_invite_id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: workshop_invite_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshop_invite_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshop_invite_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshop_invite_translations_id_seq OWNED BY public.workshop_invite_translations.id;


--
-- Name: workshop_invited_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_invited_subjects (
    id bigint NOT NULL,
    workshop_invite_id bigint,
    user_id bigint,
    status integer DEFAULT 0 NOT NULL,
    reason text,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    reschedule_workshop_id bigint,
    tenant_id bigint
);


--
-- Name: workshop_invited_subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshop_invited_subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshop_invited_subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshop_invited_subjects_id_seq OWNED BY public.workshop_invited_subjects.id;


--
-- Name: workshop_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_invites (
    id bigint NOT NULL,
    title character varying,
    description character varying,
    allow_language_preference boolean DEFAULT false NOT NULL,
    allowed_languages jsonb DEFAULT '[]'::jsonb,
    allow_neurodiversity_option boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    campaign_id bigint,
    campaign_assessment_group_id bigint,
    name character varying,
    tenant_id bigint
);


--
-- Name: workshop_invites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshop_invites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshop_invites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshop_invites_id_seq OWNED BY public.workshop_invites.id;


--
-- Name: workshop_invites_workshops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_invites_workshops (
    id bigint NOT NULL,
    workshop_id bigint,
    workshop_invite_id bigint
);


--
-- Name: workshop_invites_workshops_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshop_invites_workshops_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshop_invites_workshops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshop_invites_workshops_id_seq OWNED BY public.workshop_invites_workshops.id;


--
-- Name: workshop_managers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_managers (
    id bigint NOT NULL,
    workshop_id bigint,
    user_id bigint,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    tenant_id bigint
);


--
-- Name: workshop_managers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshop_managers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshop_managers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshop_managers_id_seq OWNED BY public.workshop_managers.id;


--
-- Name: workshop_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_resources (
    id bigint NOT NULL,
    name character varying,
    url character varying,
    workshop_id bigint,
    tenant_id bigint
);


--
-- Name: workshop_resources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshop_resources_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshop_resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshop_resources_id_seq OWNED BY public.workshop_resources.id;


--
-- Name: workshop_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshop_subjects (
    id bigint NOT NULL,
    workshop_id bigint,
    user_id bigint,
    attended boolean DEFAULT false NOT NULL,
    attendance_status integer DEFAULT 0 NOT NULL,
    status_remarks character varying,
    late_duration integer,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    completion_status integer DEFAULT 0 NOT NULL,
    preferred_language character varying,
    neurodivergent boolean,
    neurodivergent_comments text,
    campaign_id integer,
    workshop_invited_subject_id bigint,
    scheduling_status integer DEFAULT 0,
    tenant_id bigint
);


--
-- Name: workshop_subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshop_subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshop_subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshop_subjects_id_seq OWNED BY public.workshop_subjects.id;


--
-- Name: workshops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshops (
    id bigint NOT NULL,
    campaign_id bigint,
    start_time timestamp without time zone NOT NULL,
    timezone character varying NOT NULL,
    duration integer NOT NULL,
    video_call_type integer DEFAULT 0 NOT NULL,
    meeting_link text,
    total_seats integer DEFAULT 0 NOT NULL,
    booked_seats integer DEFAULT 0 NOT NULL,
    cancellation_lead_time integer DEFAULT 0,
    scheduling_lead_time integer DEFAULT 0,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    name character varying,
    status integer DEFAULT 0,
    allow_late_cancellation_and_rescheduling boolean DEFAULT false NOT NULL,
    campaign_assessment_group_id bigint,
    disable_cancellation_and_rescheduling boolean DEFAULT false NOT NULL,
    tenant_id bigint,
    CONSTRAINT booked_seats_not_exceed_total_seats CHECK ((booked_seats <= total_seats)),
    CONSTRAINT booked_seats_positive CHECK ((booked_seats >= 0))
);


--
-- Name: workshops_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshops_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshops_id_seq OWNED BY public.workshops.id;


--
-- Name: yoodli_user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.yoodli_user_assessments (
    id bigint NOT NULL,
    user_assessment_id bigint NOT NULL,
    email character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    yoodli_activity_id character varying,
    active boolean DEFAULT true NOT NULL,
    tenant_id bigint
);


--
-- Name: yoodli_user_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.yoodli_user_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: yoodli_user_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.yoodli_user_assessments_id_seq OWNED BY public.yoodli_user_assessments.id;


--
-- Name: active_storage_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments ALTER COLUMN id SET DEFAULT nextval('public.active_storage_attachments_id_seq'::regclass);


--
-- Name: active_storage_blobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_blobs ALTER COLUMN id SET DEFAULT nextval('public.active_storage_blobs_id_seq'::regclass);


--
-- Name: active_storage_variant_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_variant_records ALTER COLUMN id SET DEFAULT nextval('public.active_storage_variant_records_id_seq'::regclass);


--
-- Name: activesupport_tables_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activesupport_tables_migrations ALTER COLUMN id SET DEFAULT nextval('public.activesupport_tables_migrations_id_seq'::regclass);


--
-- Name: admin_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_jobs ALTER COLUMN id SET DEFAULT nextval('public.admin_jobs_id_seq'::regclass);


--
-- Name: admin_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles ALTER COLUMN id SET DEFAULT nextval('public.admin_roles_id_seq'::regclass);


--
-- Name: agile_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agile_events ALTER COLUMN id SET DEFAULT nextval('public.agile_events_id_seq'::regclass);


--
-- Name: agiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agiles ALTER COLUMN id SET DEFAULT nextval('public.agiles_id_seq'::regclass);


--
-- Name: ai_assistant_chats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_chats ALTER COLUMN id SET DEFAULT nextval('public.ai_assistant_chats_id_seq'::regclass);


--
-- Name: ai_assistant_output_schema_keys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_output_schema_keys ALTER COLUMN id SET DEFAULT nextval('public.ai_assistant_output_schema_keys_id_seq'::regclass);


--
-- Name: ai_assistant_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_requests ALTER COLUMN id SET DEFAULT nextval('public.ai_assistant_requests_id_seq'::regclass);


--
-- Name: ai_assistant_tool_calls id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_tool_calls ALTER COLUMN id SET DEFAULT nextval('public.ai_assistant_tool_calls_id_seq'::regclass);


--
-- Name: ai_assistants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistants ALTER COLUMN id SET DEFAULT nextval('public.ai_assistants_id_seq'::regclass);


--
-- Name: ai_assisted_user_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assisted_user_sessions ALTER COLUMN id SET DEFAULT nextval('public.ai_assisted_user_sessions_id_seq'::regclass);


--
-- Name: ai_factor_scores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_factor_scores ALTER COLUMN id SET DEFAULT nextval('public.ai_factor_scores_id_seq'::regclass);


--
-- Name: ai_model_registries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_model_registries ALTER COLUMN id SET DEFAULT nextval('public.ai_model_registries_id_seq'::regclass);


--
-- Name: ai_scoring_approval_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_scoring_approval_settings ALTER COLUMN id SET DEFAULT nextval('public.ai_scoring_approval_settings_id_seq'::regclass);


--
-- Name: ai_translation_results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_translation_results ALTER COLUMN id SET DEFAULT nextval('public.ai_translation_results_id_seq'::regclass);


--
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


--
-- Name: application_ip_whitelist_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_ip_whitelist_entries ALTER COLUMN id SET DEFAULT nextval('public.application_ip_whitelist_entries_id_seq'::regclass);


--
-- Name: application_public_keys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_public_keys ALTER COLUMN id SET DEFAULT nextval('public.application_public_keys_id_seq'::regclass);


--
-- Name: application_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_settings ALTER COLUMN id SET DEFAULT nextval('public.application_settings_id_seq'::regclass);


--
-- Name: application_url_whitelist_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_url_whitelist_entries ALTER COLUMN id SET DEFAULT nextval('public.application_url_whitelist_entries_id_seq'::regclass);


--
-- Name: assessment_assistants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_assistants ALTER COLUMN id SET DEFAULT nextval('public.assessment_assistants_id_seq'::regclass);


--
-- Name: assessment_consent_setting_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_consent_setting_translations ALTER COLUMN id SET DEFAULT nextval('public.assessment_consent_setting_translations_id_seq'::regclass);


--
-- Name: assessment_consent_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_consent_settings ALTER COLUMN id SET DEFAULT nextval('public.assessment_consent_settings_id_seq'::regclass);


--
-- Name: assessment_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_translations ALTER COLUMN id SET DEFAULT nextval('public.assessment_translations_id_seq'::regclass);


--
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);


--
-- Name: assessments_clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_clients ALTER COLUMN id SET DEFAULT nextval('public.assessments_clients_id_seq'::regclass);


--
-- Name: assessments_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_reports ALTER COLUMN id SET DEFAULT nextval('public.assessments_reports_id_seq'::regclass);


--
-- Name: assessors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessors ALTER COLUMN id SET DEFAULT nextval('public.assessors_id_seq'::regclass);


--
-- Name: assigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns ALTER COLUMN id SET DEFAULT nextval('public.assigns_id_seq'::regclass);


--
-- Name: assigns_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns_reports ALTER COLUMN id SET DEFAULT nextval('public.assigns_reports_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: audits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audits ALTER COLUMN id SET DEFAULT nextval('public.audits_id_seq'::regclass);


--
-- Name: blocks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks ALTER COLUMN id SET DEFAULT nextval('public.blocks_id_seq'::regclass);


--
-- Name: bulk_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulk_reports ALTER COLUMN id SET DEFAULT nextval('public.bulk_reports_id_seq'::regclass);


--
-- Name: campaign_ai_artifact_dependencies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_ai_artifact_dependencies ALTER COLUMN id SET DEFAULT nextval('public.campaign_ai_artifact_dependencies_id_seq'::regclass);


--
-- Name: campaign_ai_artifacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_ai_artifacts ALTER COLUMN id SET DEFAULT nextval('public.campaign_ai_artifacts_id_seq'::regclass);


--
-- Name: campaign_assessment_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessment_groups ALTER COLUMN id SET DEFAULT nextval('public.campaign_assessment_groups_id_seq'::regclass);


--
-- Name: campaign_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessments ALTER COLUMN id SET DEFAULT nextval('public.campaign_assessments_id_seq'::regclass);


--
-- Name: campaign_assessor_assessment_factor_weights id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessment_factor_weights ALTER COLUMN id SET DEFAULT nextval('public.campaign_assessor_assessment_factor_weights_id_seq'::regclass);


--
-- Name: campaign_assessor_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessments ALTER COLUMN id SET DEFAULT nextval('public.campaign_assessor_assessments_id_seq'::regclass);


--
-- Name: campaign_factor_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_groups ALTER COLUMN id SET DEFAULT nextval('public.campaign_factor_groups_id_seq'::regclass);


--
-- Name: campaign_factor_values id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_values ALTER COLUMN id SET DEFAULT nextval('public.campaign_factor_values_id_seq'::regclass);


--
-- Name: campaign_factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factors ALTER COLUMN id SET DEFAULT nextval('public.campaign_factors_id_seq'::regclass);


--
-- Name: campaign_idp_dependencies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_idp_dependencies ALTER COLUMN id SET DEFAULT nextval('public.campaign_idp_dependencies_id_seq'::regclass);


--
-- Name: campaign_idps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_idps ALTER COLUMN id SET DEFAULT nextval('public.campaign_idps_id_seq'::regclass);


--
-- Name: campaign_option_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_option_translations ALTER COLUMN id SET DEFAULT nextval('public.campaign_option_translations_id_seq'::regclass);


--
-- Name: campaign_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_options ALTER COLUMN id SET DEFAULT nextval('public.campaign_options_id_seq'::regclass);


--
-- Name: campaign_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_reports ALTER COLUMN id SET DEFAULT nextval('public.campaign_reports_id_seq'::regclass);


--
-- Name: campaign_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_templates ALTER COLUMN id SET DEFAULT nextval('public.campaign_templates_id_seq'::regclass);


--
-- Name: campaign_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_users ALTER COLUMN id SET DEFAULT nextval('public.campaign_users_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: client_ai_assistants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_ai_assistants ALTER COLUMN id SET DEFAULT nextval('public.client_ai_assistants_id_seq'::regclass);


--
-- Name: client_auditlog_export_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_auditlog_export_settings ALTER COLUMN id SET DEFAULT nextval('public.client_auditlog_export_settings_id_seq'::regclass);


--
-- Name: client_features id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_features ALTER COLUMN id SET DEFAULT nextval('public.client_features_id_seq'::regclass);


--
-- Name: client_privacy_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_privacy_settings ALTER COLUMN id SET DEFAULT nextval('public.client_privacy_settings_id_seq'::regclass);


--
-- Name: client_sso_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_sso_settings ALTER COLUMN id SET DEFAULT nextval('public.client_sso_settings_id_seq'::regclass);


--
-- Name: client_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_translations ALTER COLUMN id SET DEFAULT nextval('public.client_translations_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: clients_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients_reports ALTER COLUMN id SET DEFAULT nextval('public.clients_reports_id_seq'::regclass);


--
-- Name: communication_cc_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_cc_users ALTER COLUMN id SET DEFAULT nextval('public.communication_cc_users_id_seq'::regclass);


--
-- Name: communication_email_resources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_email_resources ALTER COLUMN id SET DEFAULT nextval('public.communication_email_resources_id_seq'::regclass);


--
-- Name: communication_emails id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails ALTER COLUMN id SET DEFAULT nextval('public.communication_emails_id_seq'::regclass);


--
-- Name: communication_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_translations ALTER COLUMN id SET DEFAULT nextval('public.communication_translations_id_seq'::regclass);


--
-- Name: communications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications ALTER COLUMN id SET DEFAULT nextval('public.communications_id_seq'::regclass);


--
-- Name: communications_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_assessments ALTER COLUMN id SET DEFAULT nextval('public.communications_assessments_id_seq'::regclass);


--
-- Name: communications_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_users ALTER COLUMN id SET DEFAULT nextval('public.communications_users_id_seq'::regclass);


--
-- Name: course_schedules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_schedules ALTER COLUMN id SET DEFAULT nextval('public.course_schedules_id_seq'::regclass);


--
-- Name: dashboards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboards ALTER COLUMN id SET DEFAULT nextval('public.dashboards_id_seq'::regclass);


--
-- Name: data_geos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_geos ALTER COLUMN id SET DEFAULT nextval('public.data_geos_id_seq'::regclass);


--
-- Name: data_report_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_report_jobs ALTER COLUMN id SET DEFAULT nextval('public.data_report_jobs_id_seq'::regclass);


--
-- Name: data_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_reports ALTER COLUMN id SET DEFAULT nextval('public.data_reports_id_seq'::regclass);


--
-- Name: datasheet_column_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datasheet_column_preferences ALTER COLUMN id SET DEFAULT nextval('public.datasheet_column_preferences_id_seq'::regclass);


--
-- Name: design_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.design_settings ALTER COLUMN id SET DEFAULT nextval('public.design_settings_id_seq'::regclass);


--
-- Name: development_action_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_action_translations ALTER COLUMN id SET DEFAULT nextval('public.development_action_translations_id_seq'::regclass);


--
-- Name: development_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_actions ALTER COLUMN id SET DEFAULT nextval('public.development_actions_id_seq'::regclass);


--
-- Name: dimensions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions ALTER COLUMN id SET DEFAULT nextval('public.dimensions_id_seq'::regclass);


--
-- Name: email_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);


--
-- Name: event_deliveries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_deliveries ALTER COLUMN id SET DEFAULT nextval('public.event_deliveries_id_seq'::regclass);


--
-- Name: factor_benchmark_scores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_benchmark_scores ALTER COLUMN id SET DEFAULT nextval('public.factor_benchmark_scores_id_seq'::regclass);


--
-- Name: factor_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_translations ALTER COLUMN id SET DEFAULT nextval('public.factor_translations_id_seq'::regclass);


--
-- Name: factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors ALTER COLUMN id SET DEFAULT nextval('public.factors_id_seq'::regclass);


--
-- Name: factors_aliases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_aliases ALTER COLUMN id SET DEFAULT nextval('public.factors_aliases_id_seq'::regclass);


--
-- Name: factors_norms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_norms ALTER COLUMN id SET DEFAULT nextval('public.factors_norms_id_seq'::regclass);


--
-- Name: factors_scoring id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_scoring ALTER COLUMN id SET DEFAULT nextval('public.factors_scoring_id_seq'::regclass);


--
-- Name: factors_sub_factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_sub_factors ALTER COLUMN id SET DEFAULT nextval('public.factors_sub_factors_id_seq'::regclass);


--
-- Name: hogan_credentials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_credentials ALTER COLUMN id SET DEFAULT nextval('public.hogan_credentials_id_seq'::regclass);


--
-- Name: hogan_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_logs ALTER COLUMN id SET DEFAULT nextval('public.hogan_logs_id_seq'::regclass);


--
-- Name: hogan_report_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_report_settings ALTER COLUMN id SET DEFAULT nextval('public.hogan_report_settings_id_seq'::regclass);


--
-- Name: idp_report_pdfs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_report_pdfs ALTER COLUMN id SET DEFAULT nextval('public.idp_report_pdfs_id_seq'::regclass);


--
-- Name: idp_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_settings ALTER COLUMN id SET DEFAULT nextval('public.idp_settings_id_seq'::regclass);


--
-- Name: idp_template_development_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_development_actions ALTER COLUMN id SET DEFAULT nextval('public.idp_template_development_actions_id_seq'::regclass);


--
-- Name: idp_template_interview_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_interview_questions ALTER COLUMN id SET DEFAULT nextval('public.idp_template_interview_questions_id_seq'::regclass);


--
-- Name: idp_template_reflection_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_reflection_questions ALTER COLUMN id SET DEFAULT nextval('public.idp_template_reflection_questions_id_seq'::regclass);


--
-- Name: idp_template_skills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_skills ALTER COLUMN id SET DEFAULT nextval('public.idp_template_skills_id_seq'::regclass);


--
-- Name: idp_template_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_translations ALTER COLUMN id SET DEFAULT nextval('public.idp_template_translations_id_seq'::regclass);


--
-- Name: idp_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_templates ALTER COLUMN id SET DEFAULT nextval('public.idp_templates_id_seq'::regclass);


--
-- Name: iiht_user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iiht_user_assessments ALTER COLUMN id SET DEFAULT nextval('public.iiht_user_assessments_id_seq'::regclass);


--
-- Name: innovation_styles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.innovation_styles ALTER COLUMN id SET DEFAULT nextval('public.innovation_styles_id_seq'::regclass);


--
-- Name: innovation_styles_factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.innovation_styles_factors ALTER COLUMN id SET DEFAULT nextval('public.innovation_styles_factors_id_seq'::regclass);


--
-- Name: integrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations ALTER COLUMN id SET DEFAULT nextval('public.integrations_id_seq'::regclass);


--
-- Name: interview_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_questions ALTER COLUMN id SET DEFAULT nextval('public.interview_questions_id_seq'::regclass);


--
-- Name: job_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_groups ALTER COLUMN id SET DEFAULT nextval('public.job_groups_id_seq'::regclass);


--
-- Name: job_role_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_role_translations ALTER COLUMN id SET DEFAULT nextval('public.job_role_translations_id_seq'::regclass);


--
-- Name: job_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles ALTER COLUMN id SET DEFAULT nextval('public.job_roles_id_seq'::regclass);


--
-- Name: last_job_runs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.last_job_runs ALTER COLUMN id SET DEFAULT nextval('public.last_job_runs_id_seq'::regclass);


--
-- Name: libraries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libraries ALTER COLUMN id SET DEFAULT nextval('public.libraries_id_seq'::regclass);


--
-- Name: license_usages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages ALTER COLUMN id SET DEFAULT nextval('public.license_usages_id_seq'::regclass);


--
-- Name: licenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licenses ALTER COLUMN id SET DEFAULT nextval('public.licenses_id_seq'::regclass);


--
-- Name: lti_oauth2_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lti_oauth2_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.lti_oauth2_access_tokens_id_seq'::regclass);


--
-- Name: maintenance_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_settings ALTER COLUMN id SET DEFAULT nextval('public.maintenance_settings_id_seq'::regclass);


--
-- Name: media_responses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_responses ALTER COLUMN id SET DEFAULT nextval('public.media_responses_id_seq'::regclass);


--
-- Name: meeting_recordings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_recordings ALTER COLUMN id SET DEFAULT nextval('public.meeting_recordings_id_seq'::regclass);


--
-- Name: membership_grants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_grants ALTER COLUMN id SET DEFAULT nextval('public.membership_grants_id_seq'::regclass);


--
-- Name: memberships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships ALTER COLUMN id SET DEFAULT nextval('public.memberships_id_seq'::regclass);


--
-- Name: memberships_admin_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships_admin_roles ALTER COLUMN id SET DEFAULT nextval('public.memberships_admin_roles_id_seq'::regclass);


--
-- Name: mettl_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_assessments ALTER COLUMN id SET DEFAULT nextval('public.mettl_assessments_id_seq'::regclass);


--
-- Name: mettl_schedule_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_schedule_records ALTER COLUMN id SET DEFAULT nextval('public.mettl_schedule_records_id_seq'::regclass);


--
-- Name: mettl_user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_user_assessments ALTER COLUMN id SET DEFAULT nextval('public.mettl_user_assessments_id_seq'::regclass);


--
-- Name: mhs_user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mhs_user_assessments ALTER COLUMN id SET DEFAULT nextval('public.mhs_user_assessments_id_seq'::regclass);


--
-- Name: microsite_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.microsite_assessments ALTER COLUMN id SET DEFAULT nextval('public.microsite_assessments_id_seq'::regclass);


--
-- Name: microsite_user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.microsite_user_assessments ALTER COLUMN id SET DEFAULT nextval('public.microsite_user_assessments_id_seq'::regclass);


--
-- Name: norms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms ALTER COLUMN id SET DEFAULT nextval('public.norms_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: occupation_condition_sets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupation_condition_sets ALTER COLUMN id SET DEFAULT nextval('public.occupation_condition_sets_id_seq'::regclass);


--
-- Name: occupations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations ALTER COLUMN id SET DEFAULT nextval('public.occupations_id_seq'::regclass);


--
-- Name: occupations_factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations_factors ALTER COLUMN id SET DEFAULT nextval('public.occupations_factors_id_seq'::regclass);


--
-- Name: old_passwords id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.old_passwords ALTER COLUMN id SET DEFAULT nextval('public.old_passwords_id_seq'::regclass);


--
-- Name: oracle_credentials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oracle_credentials ALTER COLUMN id SET DEFAULT nextval('public.oracle_credentials_id_seq'::regclass);


--
-- Name: pearson_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pearson_assessments ALTER COLUMN id SET DEFAULT nextval('public.pearson_assessments_id_seq'::regclass);


--
-- Name: pearson_user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pearson_user_assessments ALTER COLUMN id SET DEFAULT nextval('public.pearson_user_assessments_id_seq'::regclass);


--
-- Name: platform_exceptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_exceptions ALTER COLUMN id SET DEFAULT nextval('public.platform_exceptions_id_seq'::regclass);


--
-- Name: power_bi_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.power_bi_settings ALTER COLUMN id SET DEFAULT nextval('public.power_bi_settings_id_seq'::regclass);


--
-- Name: privacy_consents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents ALTER COLUMN id SET DEFAULT nextval('public.privacy_consents_id_seq'::regclass);


--
-- Name: privacy_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_links ALTER COLUMN id SET DEFAULT nextval('public.privacy_links_id_seq'::regclass);


--
-- Name: privacy_setting_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_setting_translations ALTER COLUMN id SET DEFAULT nextval('public.privacy_setting_translations_id_seq'::regclass);


--
-- Name: privacy_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_settings ALTER COLUMN id SET DEFAULT nextval('public.privacy_settings_id_seq'::regclass);


--
-- Name: proctoring_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proctoring_sessions ALTER COLUMN id SET DEFAULT nextval('public.proctoring_sessions_id_seq'::regclass);


--
-- Name: proficiency_level_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency_level_translations ALTER COLUMN id SET DEFAULT nextval('public.proficiency_level_translations_id_seq'::regclass);


--
-- Name: proficiency_levels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency_levels ALTER COLUMN id SET DEFAULT nextval('public.proficiency_levels_id_seq'::regclass);


--
-- Name: profile_field_values id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_field_values ALTER COLUMN id SET DEFAULT nextval('public.profile_field_values_id_seq'::regclass);


--
-- Name: profile_fields id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_fields ALTER COLUMN id SET DEFAULT nextval('public.profile_fields_id_seq'::regclass);


--
-- Name: profile_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_settings ALTER COLUMN id SET DEFAULT nextval('public.profile_settings_id_seq'::regclass);


--
-- Name: project_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_assessments ALTER COLUMN id SET DEFAULT nextval('public.project_assessments_id_seq'::regclass);


--
-- Name: project_features id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_features ALTER COLUMN id SET DEFAULT nextval('public.project_features_id_seq'::regclass);


--
-- Name: project_licenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_licenses ALTER COLUMN id SET DEFAULT nextval('public.project_licenses_id_seq'::regclass);


--
-- Name: question_recoding id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_recoding ALTER COLUMN id SET DEFAULT nextval('public.question_recoding_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: reflection_question_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflection_question_translations ALTER COLUMN id SET DEFAULT nextval('public.reflection_question_translations_id_seq'::regclass);


--
-- Name: reflection_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflection_questions ALTER COLUMN id SET DEFAULT nextval('public.reflection_questions_id_seq'::regclass);


--
-- Name: registration_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_codes ALTER COLUMN id SET DEFAULT nextval('public.registration_codes_id_seq'::regclass);


--
-- Name: registration_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_settings ALTER COLUMN id SET DEFAULT nextval('public.registration_settings_id_seq'::regclass);


--
-- Name: relationships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relationships ALTER COLUMN id SET DEFAULT nextval('public.relationships_id_seq'::regclass);


--
-- Name: report_approval_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_approval_settings ALTER COLUMN id SET DEFAULT nextval('public.report_approval_settings_id_seq'::regclass);


--
-- Name: report_families id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_families ALTER COLUMN id SET DEFAULT nextval('public.report_families_id_seq'::regclass);


--
-- Name: report_families_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_families_reports ALTER COLUMN id SET DEFAULT nextval('public.report_families_reports_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: reports_accesses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses ALTER COLUMN id SET DEFAULT nextval('public.reports_accesses_id_seq'::regclass);


--
-- Name: reports_campaign_ai_artifacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_campaign_ai_artifacts ALTER COLUMN id SET DEFAULT nextval('public.reports_campaign_ai_artifacts_id_seq'::regclass);


--
-- Name: reports_campaign_factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_campaign_factors ALTER COLUMN id SET DEFAULT nextval('public.reports_campaign_factors_id_seq'::regclass);


--
-- Name: reports_filters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_filters ALTER COLUMN id SET DEFAULT nextval('public.reports_filters_id_seq'::regclass);


--
-- Name: reports_modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_modules ALTER COLUMN id SET DEFAULT nextval('public.reports_modules_id_seq'::regclass);


--
-- Name: reports_pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_pages ALTER COLUMN id SET DEFAULT nextval('public.reports_pages_id_seq'::regclass);


--
-- Name: resource_hogan_credentials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_hogan_credentials ALTER COLUMN id SET DEFAULT nextval('public.resource_hogan_credentials_id_seq'::regclass);


--
-- Name: saml_service_providers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saml_service_providers ALTER COLUMN id SET DEFAULT nextval('public.saml_service_providers_id_seq'::regclass);


--
-- Name: saml_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saml_settings ALTER COLUMN id SET DEFAULT nextval('public.saml_settings_id_seq'::regclass);


--
-- Name: saville_factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_factors ALTER COLUMN id SET DEFAULT nextval('public.saville_factors_id_seq'::regclass);


--
-- Name: saville_report_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_report_settings ALTER COLUMN id SET DEFAULT nextval('public.saville_report_settings_id_seq'::regclass);


--
-- Name: saville_user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_user_assessments ALTER COLUMN id SET DEFAULT nextval('public.saville_user_assessments_id_seq'::regclass);


--
-- Name: security_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_settings ALTER COLUMN id SET DEFAULT nextval('public.security_settings_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: sheet_columns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_columns ALTER COLUMN id SET DEFAULT nextval('public.sheet_columns_id_seq'::regclass);


--
-- Name: sheet_row_data id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_row_data ALTER COLUMN id SET DEFAULT nextval('public.sheet_row_data_id_seq'::regclass);


--
-- Name: sheet_rows id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_rows ALTER COLUMN id SET DEFAULT nextval('public.sheet_rows_id_seq'::regclass);


--
-- Name: sheets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheets ALTER COLUMN id SET DEFAULT nextval('public.sheets_id_seq'::regclass);


--
-- Name: shortened_urls id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shortened_urls ALTER COLUMN id SET DEFAULT nextval('public.shortened_urls_id_seq'::regclass);


--
-- Name: simulation_user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulation_user_assessments ALTER COLUMN id SET DEFAULT nextval('public.simulation_user_assessments_id_seq'::regclass);


--
-- Name: skill_aliases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_aliases ALTER COLUMN id SET DEFAULT nextval('public.skill_aliases_id_seq'::regclass);


--
-- Name: skill_groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_groups ALTER COLUMN id SET DEFAULT nextval('public.skill_groups_id_seq'::regclass);


--
-- Name: skill_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_translations ALTER COLUMN id SET DEFAULT nextval('public.skill_translations_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: skills_development_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_development_actions ALTER COLUMN id SET DEFAULT nextval('public.skills_development_actions_id_seq'::regclass);


--
-- Name: skills_job_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_job_roles ALTER COLUMN id SET DEFAULT nextval('public.skills_job_roles_id_seq'::regclass);


--
-- Name: skillvue_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skillvue_assessments ALTER COLUMN id SET DEFAULT nextval('public.skillvue_assessments_id_seq'::regclass);


--
-- Name: skillvue_user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skillvue_user_assessments ALTER COLUMN id SET DEFAULT nextval('public.skillvue_user_assessments_id_seq'::regclass);


--
-- Name: sms_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_histories ALTER COLUMN id SET DEFAULT nextval('public.sms_histories_id_seq'::regclass);


--
-- Name: sms_invites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_invites ALTER COLUMN id SET DEFAULT nextval('public.sms_invites_id_seq'::regclass);


--
-- Name: sms_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_records ALTER COLUMN id SET DEFAULT nextval('public.sms_records_id_seq'::regclass);


--
-- Name: smtp_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smtp_settings ALTER COLUMN id SET DEFAULT nextval('public.smtp_settings_id_seq'::regclass);


--
-- Name: system_check_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_check_records ALTER COLUMN id SET DEFAULT nextval('public.system_check_records_id_seq'::regclass);


--
-- Name: system_check_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_check_sessions ALTER COLUMN id SET DEFAULT nextval('public.system_check_sessions_id_seq'::regclass);


--
-- Name: taggings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taggings ALTER COLUMN id SET DEFAULT nextval('public.taggings_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: taxonomy_levels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxonomy_levels ALTER COLUMN id SET DEFAULT nextval('public.taxonomy_levels_id_seq'::regclass);


--
-- Name: temporary_uploads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.temporary_uploads ALTER COLUMN id SET DEFAULT nextval('public.temporary_uploads_id_seq'::regclass);


--
-- Name: text_module_overrides id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_module_overrides ALTER COLUMN id SET DEFAULT nextval('public.text_module_overrides_id_seq'::regclass);


--
-- Name: threesixty_campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns ALTER COLUMN id SET DEFAULT nextval('public.threesixty_campaigns_id_seq'::regclass);


--
-- Name: threesixty_email_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_histories ALTER COLUMN id SET DEFAULT nextval('public.threesixty_email_histories_id_seq'::regclass);


--
-- Name: threesixty_email_schedules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_schedules ALTER COLUMN id SET DEFAULT nextval('public.threesixty_email_schedules_id_seq'::regclass);


--
-- Name: threesixty_email_template_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_template_translations ALTER COLUMN id SET DEFAULT nextval('public.threesixty_email_template_translations_id_seq'::regclass);


--
-- Name: threesixty_email_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_templates ALTER COLUMN id SET DEFAULT nextval('public.threesixty_email_templates_id_seq'::regclass);


--
-- Name: threesixty_evaluators id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_evaluators ALTER COLUMN id SET DEFAULT nextval('public.threesixty_evaluators_id_seq'::regclass);


--
-- Name: threesixty_instruction_template_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_instruction_template_translations ALTER COLUMN id SET DEFAULT nextval('public.threesixty_instruction_template_translations_id_seq'::regclass);


--
-- Name: threesixty_instruction_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_instruction_templates ALTER COLUMN id SET DEFAULT nextval('public.threesixty_instruction_templates_id_seq'::regclass);


--
-- Name: threesixty_nomination_requirements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_nomination_requirements ALTER COLUMN id SET DEFAULT nextval('public.threesixty_nomination_requirements_id_seq'::regclass);


--
-- Name: threesixty_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_options ALTER COLUMN id SET DEFAULT nextval('public.threesixty_options_id_seq'::regclass);


--
-- Name: threesixty_reminder_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_reminder_histories ALTER COLUMN id SET DEFAULT nextval('public.threesixty_reminder_histories_id_seq'::regclass);


--
-- Name: threesixty_subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects ALTER COLUMN id SET DEFAULT nextval('public.threesixty_subjects_id_seq'::regclass);


--
-- Name: transcriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcriptions ALTER COLUMN id SET DEFAULT nextval('public.transcriptions_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


--
-- Name: user_assessment_factor_scores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_factor_scores ALTER COLUMN id SET DEFAULT nextval('public.user_assessment_factor_scores_id_seq'::regclass);


--
-- Name: user_assessment_verification_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_verification_images ALTER COLUMN id SET DEFAULT nextval('public.user_assessment_verification_images_id_seq'::regclass);


--
-- Name: user_assessment_verification_media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_verification_media ALTER COLUMN id SET DEFAULT nextval('public.user_assessment_verification_media_id_seq'::regclass);


--
-- Name: user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments ALTER COLUMN id SET DEFAULT nextval('public.user_assessments_id_seq'::regclass);


--
-- Name: user_availability_dates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_availability_dates ALTER COLUMN id SET DEFAULT nextval('public.user_availability_dates_id_seq'::regclass);


--
-- Name: user_availability_days id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_availability_days ALTER COLUMN id SET DEFAULT nextval('public.user_availability_days_id_seq'::regclass);


--
-- Name: user_bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookings ALTER COLUMN id SET DEFAULT nextval('public.user_bookings_id_seq'::regclass);


--
-- Name: user_idp_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_comments ALTER COLUMN id SET DEFAULT nextval('public.user_idp_comments_id_seq'::regclass);


--
-- Name: user_idp_development_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_development_actions ALTER COLUMN id SET DEFAULT nextval('public.user_idp_development_actions_id_seq'::regclass);


--
-- Name: user_idp_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_plans ALTER COLUMN id SET DEFAULT nextval('public.user_idp_plans_id_seq'::regclass);


--
-- Name: user_idp_skills id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_skills ALTER COLUMN id SET DEFAULT nextval('public.user_idp_skills_id_seq'::regclass);


--
-- Name: user_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_preferences_id_seq'::regclass);


--
-- Name: user_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN id SET DEFAULT nextval('public.user_profiles_id_seq'::regclass);


--
-- Name: user_reflection_question_answers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reflection_question_answers ALTER COLUMN id SET DEFAULT nextval('public.user_reflection_question_answers_id_seq'::regclass);


--
-- Name: user_report_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_comments ALTER COLUMN id SET DEFAULT nextval('public.user_report_comments_id_seq'::regclass);


--
-- Name: user_report_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_events ALTER COLUMN id SET DEFAULT nextval('public.user_report_events_id_seq'::regclass);


--
-- Name: user_report_pdfs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_pdfs ALTER COLUMN id SET DEFAULT nextval('public.user_report_pdfs_id_seq'::regclass);


--
-- Name: user_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reports ALTER COLUMN id SET DEFAULT nextval('public.user_reports_id_seq'::regclass);


--
-- Name: user_saved_filters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_saved_filters ALTER COLUMN id SET DEFAULT nextval('public.user_saved_filters_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: users_results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results ALTER COLUMN id SET DEFAULT nextval('public.users_results_id_seq'::regclass);


--
-- Name: vector_embeddings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vector_embeddings ALTER COLUMN id SET DEFAULT nextval('public.vector_embeddings_id_seq'::regclass);


--
-- Name: version_associations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.version_associations ALTER COLUMN id SET DEFAULT nextval('public.version_associations_id_seq'::regclass);


--
-- Name: versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions ALTER COLUMN id SET DEFAULT nextval('public.versions_id_seq'::regclass);


--
-- Name: webhook_event_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_event_logs ALTER COLUMN id SET DEFAULT nextval('public.webhook_event_logs_id_seq'::regclass);


--
-- Name: webhook_subscription_topics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscription_topics ALTER COLUMN id SET DEFAULT nextval('public.webhook_subscription_topics_id_seq'::regclass);


--
-- Name: webhook_subscriptions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.webhook_subscriptions_id_seq'::regclass);


--
-- Name: workshop_assessors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_assessors ALTER COLUMN id SET DEFAULT nextval('public.workshop_assessors_id_seq'::regclass);


--
-- Name: workshop_invite_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_logs ALTER COLUMN id SET DEFAULT nextval('public.workshop_invite_logs_id_seq'::regclass);


--
-- Name: workshop_invite_translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_translations ALTER COLUMN id SET DEFAULT nextval('public.workshop_invite_translations_id_seq'::regclass);


--
-- Name: workshop_invited_subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invited_subjects ALTER COLUMN id SET DEFAULT nextval('public.workshop_invited_subjects_id_seq'::regclass);


--
-- Name: workshop_invites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invites ALTER COLUMN id SET DEFAULT nextval('public.workshop_invites_id_seq'::regclass);


--
-- Name: workshop_invites_workshops id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invites_workshops ALTER COLUMN id SET DEFAULT nextval('public.workshop_invites_workshops_id_seq'::regclass);


--
-- Name: workshop_managers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_managers ALTER COLUMN id SET DEFAULT nextval('public.workshop_managers_id_seq'::regclass);


--
-- Name: workshop_resources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_resources ALTER COLUMN id SET DEFAULT nextval('public.workshop_resources_id_seq'::regclass);


--
-- Name: workshop_subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_subjects ALTER COLUMN id SET DEFAULT nextval('public.workshop_subjects_id_seq'::regclass);


--
-- Name: workshops id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops ALTER COLUMN id SET DEFAULT nextval('public.workshops_id_seq'::regclass);


--
-- Name: yoodli_user_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yoodli_user_assessments ALTER COLUMN id SET DEFAULT nextval('public.yoodli_user_assessments_id_seq'::regclass);


--
-- Name: active_storage_attachments active_storage_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT active_storage_attachments_pkey PRIMARY KEY (id);


--
-- Name: active_storage_blobs active_storage_blobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_blobs
    ADD CONSTRAINT active_storage_blobs_pkey PRIMARY KEY (id);


--
-- Name: active_storage_variant_records active_storage_variant_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_variant_records
    ADD CONSTRAINT active_storage_variant_records_pkey PRIMARY KEY (id);


--
-- Name: activesupport_tables_migrations activesupport_tables_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activesupport_tables_migrations
    ADD CONSTRAINT activesupport_tables_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_jobs admin_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_jobs
    ADD CONSTRAINT admin_jobs_pkey PRIMARY KEY (id);


--
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);


--
-- Name: agile_events agile_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agile_events
    ADD CONSTRAINT agile_events_pkey PRIMARY KEY (id);


--
-- Name: agiles agiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agiles
    ADD CONSTRAINT agiles_pkey PRIMARY KEY (id);


--
-- Name: ai_assistant_chats ai_assistant_chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_chats
    ADD CONSTRAINT ai_assistant_chats_pkey PRIMARY KEY (id);


--
-- Name: ai_assistant_output_schema_keys ai_assistant_output_schema_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_output_schema_keys
    ADD CONSTRAINT ai_assistant_output_schema_keys_pkey PRIMARY KEY (id);


--
-- Name: ai_assistant_requests ai_assistant_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_requests
    ADD CONSTRAINT ai_assistant_requests_pkey PRIMARY KEY (id);


--
-- Name: ai_assistant_tool_calls ai_assistant_tool_calls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_tool_calls
    ADD CONSTRAINT ai_assistant_tool_calls_pkey PRIMARY KEY (id);


--
-- Name: ai_assistants ai_assistants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistants
    ADD CONSTRAINT ai_assistants_pkey PRIMARY KEY (id);


--
-- Name: ai_assisted_user_sessions ai_assisted_user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assisted_user_sessions
    ADD CONSTRAINT ai_assisted_user_sessions_pkey PRIMARY KEY (id);


--
-- Name: ai_factor_scores ai_factor_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_factor_scores
    ADD CONSTRAINT ai_factor_scores_pkey PRIMARY KEY (id);


--
-- Name: ai_model_registries ai_model_registries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_model_registries
    ADD CONSTRAINT ai_model_registries_pkey PRIMARY KEY (id);


--
-- Name: ai_scoring_approval_settings ai_scoring_approval_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_scoring_approval_settings
    ADD CONSTRAINT ai_scoring_approval_settings_pkey PRIMARY KEY (id);


--
-- Name: ai_translation_results ai_translation_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_translation_results
    ADD CONSTRAINT ai_translation_results_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: application_ip_whitelist_entries application_ip_whitelist_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_ip_whitelist_entries
    ADD CONSTRAINT application_ip_whitelist_entries_pkey PRIMARY KEY (id);


--
-- Name: application_public_keys application_public_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_public_keys
    ADD CONSTRAINT application_public_keys_pkey PRIMARY KEY (id);


--
-- Name: application_settings application_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_settings
    ADD CONSTRAINT application_settings_pkey PRIMARY KEY (id);


--
-- Name: application_url_whitelist_entries application_url_whitelist_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_url_whitelist_entries
    ADD CONSTRAINT application_url_whitelist_entries_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: assessment_assistants assessment_assistants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_assistants
    ADD CONSTRAINT assessment_assistants_pkey PRIMARY KEY (id);


--
-- Name: assessment_consent_setting_translations assessment_consent_setting_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_consent_setting_translations
    ADD CONSTRAINT assessment_consent_setting_translations_pkey PRIMARY KEY (id);


--
-- Name: assessment_consent_settings assessment_consent_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_consent_settings
    ADD CONSTRAINT assessment_consent_settings_pkey PRIMARY KEY (id);


--
-- Name: assessment_translations assessment_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_translations
    ADD CONSTRAINT assessment_translations_pkey PRIMARY KEY (id);


--
-- Name: assessments_clients assessments_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_clients
    ADD CONSTRAINT assessments_clients_pkey PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: assessments_reports assessments_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_reports
    ADD CONSTRAINT assessments_reports_pkey PRIMARY KEY (id);


--
-- Name: assessors assessors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessors
    ADD CONSTRAINT assessors_pkey PRIMARY KEY (id);


--
-- Name: assigns assigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT assigns_pkey PRIMARY KEY (id);


--
-- Name: assigns_reports assigns_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns_reports
    ADD CONSTRAINT assigns_reports_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: audits audits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT audits_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: bulk_reports bulk_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulk_reports
    ADD CONSTRAINT bulk_reports_pkey PRIMARY KEY (id);


--
-- Name: campaign_ai_artifact_dependencies campaign_ai_artifact_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_ai_artifact_dependencies
    ADD CONSTRAINT campaign_ai_artifact_dependencies_pkey PRIMARY KEY (id);


--
-- Name: campaign_ai_artifacts campaign_ai_artifacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_ai_artifacts
    ADD CONSTRAINT campaign_ai_artifacts_pkey PRIMARY KEY (id);


--
-- Name: campaign_assessment_groups campaign_assessment_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessment_groups
    ADD CONSTRAINT campaign_assessment_groups_pkey PRIMARY KEY (id);


--
-- Name: campaign_assessments campaign_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessments
    ADD CONSTRAINT campaign_assessments_pkey PRIMARY KEY (id);


--
-- Name: campaign_assessor_assessment_factor_weights campaign_assessor_assessment_factor_weights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessment_factor_weights
    ADD CONSTRAINT campaign_assessor_assessment_factor_weights_pkey PRIMARY KEY (id);


--
-- Name: campaign_assessor_assessments campaign_assessor_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessments
    ADD CONSTRAINT campaign_assessor_assessments_pkey PRIMARY KEY (id);


--
-- Name: campaign_factor_groups campaign_factor_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_groups
    ADD CONSTRAINT campaign_factor_groups_pkey PRIMARY KEY (id);


--
-- Name: campaign_factor_values campaign_factor_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_values
    ADD CONSTRAINT campaign_factor_values_pkey PRIMARY KEY (id);


--
-- Name: campaign_factors campaign_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factors
    ADD CONSTRAINT campaign_factors_pkey PRIMARY KEY (id);


--
-- Name: campaign_idp_dependencies campaign_idp_dependencies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_idp_dependencies
    ADD CONSTRAINT campaign_idp_dependencies_pkey PRIMARY KEY (id);


--
-- Name: campaign_idps campaign_idps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_idps
    ADD CONSTRAINT campaign_idps_pkey PRIMARY KEY (id);


--
-- Name: campaign_option_translations campaign_option_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_option_translations
    ADD CONSTRAINT campaign_option_translations_pkey PRIMARY KEY (id);


--
-- Name: campaign_options campaign_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_options
    ADD CONSTRAINT campaign_options_pkey PRIMARY KEY (id);


--
-- Name: campaign_reports campaign_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_reports
    ADD CONSTRAINT campaign_reports_pkey PRIMARY KEY (id);


--
-- Name: campaign_templates campaign_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_templates
    ADD CONSTRAINT campaign_templates_pkey PRIMARY KEY (id);


--
-- Name: campaign_users campaign_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_users
    ADD CONSTRAINT campaign_users_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: client_ai_assistants client_ai_assistants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_ai_assistants
    ADD CONSTRAINT client_ai_assistants_pkey PRIMARY KEY (id);


--
-- Name: client_auditlog_export_settings client_auditlog_export_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_auditlog_export_settings
    ADD CONSTRAINT client_auditlog_export_settings_pkey PRIMARY KEY (id);


--
-- Name: client_features client_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_features
    ADD CONSTRAINT client_features_pkey PRIMARY KEY (id);


--
-- Name: client_privacy_settings client_privacy_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_privacy_settings
    ADD CONSTRAINT client_privacy_settings_pkey PRIMARY KEY (id);


--
-- Name: client_sso_settings client_sso_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_sso_settings
    ADD CONSTRAINT client_sso_settings_pkey PRIMARY KEY (id);


--
-- Name: client_translations client_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_translations
    ADD CONSTRAINT client_translations_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients_reports clients_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients_reports
    ADD CONSTRAINT clients_reports_pkey PRIMARY KEY (id);


--
-- Name: communication_cc_users communication_cc_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_cc_users
    ADD CONSTRAINT communication_cc_users_pkey PRIMARY KEY (id);


--
-- Name: communication_email_resources communication_email_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_email_resources
    ADD CONSTRAINT communication_email_resources_pkey PRIMARY KEY (id);


--
-- Name: communication_emails communication_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails
    ADD CONSTRAINT communication_emails_pkey PRIMARY KEY (id);


--
-- Name: communication_translations communication_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_translations
    ADD CONSTRAINT communication_translations_pkey PRIMARY KEY (id);


--
-- Name: communications_assessments communications_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_assessments
    ADD CONSTRAINT communications_assessments_pkey PRIMARY KEY (id);


--
-- Name: communications communications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT communications_pkey PRIMARY KEY (id);


--
-- Name: communications_users communications_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_users
    ADD CONSTRAINT communications_users_pkey PRIMARY KEY (id);


--
-- Name: course_schedules course_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_schedules
    ADD CONSTRAINT course_schedules_pkey PRIMARY KEY (id);


--
-- Name: dashboards dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT dashboards_pkey PRIMARY KEY (id);


--
-- Name: data_geos data_geos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_geos
    ADD CONSTRAINT data_geos_pkey PRIMARY KEY (id);


--
-- Name: data_report_jobs data_report_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_report_jobs
    ADD CONSTRAINT data_report_jobs_pkey PRIMARY KEY (id);


--
-- Name: data_reports data_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_reports
    ADD CONSTRAINT data_reports_pkey PRIMARY KEY (id);


--
-- Name: datasheet_column_preferences datasheet_column_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datasheet_column_preferences
    ADD CONSTRAINT datasheet_column_preferences_pkey PRIMARY KEY (id);


--
-- Name: design_settings design_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.design_settings
    ADD CONSTRAINT design_settings_pkey PRIMARY KEY (id);


--
-- Name: development_action_translations development_action_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_action_translations
    ADD CONSTRAINT development_action_translations_pkey PRIMARY KEY (id);


--
-- Name: development_actions development_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_actions
    ADD CONSTRAINT development_actions_pkey PRIMARY KEY (id);


--
-- Name: dimensions dimensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT dimensions_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: event_deliveries event_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_deliveries
    ADD CONSTRAINT event_deliveries_pkey PRIMARY KEY (id);


--
-- Name: factor_benchmark_scores factor_benchmark_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_benchmark_scores
    ADD CONSTRAINT factor_benchmark_scores_pkey PRIMARY KEY (id);


--
-- Name: factor_translations factor_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_translations
    ADD CONSTRAINT factor_translations_pkey PRIMARY KEY (id);


--
-- Name: factors_aliases factors_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_aliases
    ADD CONSTRAINT factors_aliases_pkey PRIMARY KEY (id);


--
-- Name: factors_norms factors_norms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_norms
    ADD CONSTRAINT factors_norms_pkey PRIMARY KEY (id);


--
-- Name: factors factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors
    ADD CONSTRAINT factors_pkey PRIMARY KEY (id);


--
-- Name: factors_scoring factors_scoring_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_scoring
    ADD CONSTRAINT factors_scoring_pkey PRIMARY KEY (id);


--
-- Name: factors_sub_factors factors_sub_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_sub_factors
    ADD CONSTRAINT factors_sub_factors_pkey PRIMARY KEY (id);


--
-- Name: highlights highlights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.highlights
    ADD CONSTRAINT highlights_pkey PRIMARY KEY (id);


--
-- Name: hogan_credentials hogan_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_credentials
    ADD CONSTRAINT hogan_credentials_pkey PRIMARY KEY (id);


--
-- Name: hogan_logs hogan_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_logs
    ADD CONSTRAINT hogan_logs_pkey PRIMARY KEY (id);


--
-- Name: hogan_report_settings hogan_report_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_report_settings
    ADD CONSTRAINT hogan_report_settings_pkey PRIMARY KEY (id);


--
-- Name: idp_report_pdfs idp_report_pdfs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_report_pdfs
    ADD CONSTRAINT idp_report_pdfs_pkey PRIMARY KEY (id);


--
-- Name: idp_settings idp_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_settings
    ADD CONSTRAINT idp_settings_pkey PRIMARY KEY (id);


--
-- Name: idp_template_development_actions idp_template_development_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_development_actions
    ADD CONSTRAINT idp_template_development_actions_pkey PRIMARY KEY (id);


--
-- Name: idp_template_interview_questions idp_template_interview_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_interview_questions
    ADD CONSTRAINT idp_template_interview_questions_pkey PRIMARY KEY (id);


--
-- Name: idp_template_reflection_questions idp_template_reflection_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_reflection_questions
    ADD CONSTRAINT idp_template_reflection_questions_pkey PRIMARY KEY (id);


--
-- Name: idp_template_skills idp_template_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_skills
    ADD CONSTRAINT idp_template_skills_pkey PRIMARY KEY (id);


--
-- Name: idp_template_translations idp_template_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_translations
    ADD CONSTRAINT idp_template_translations_pkey PRIMARY KEY (id);


--
-- Name: idp_templates idp_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_templates
    ADD CONSTRAINT idp_templates_pkey PRIMARY KEY (id);


--
-- Name: iiht_user_assessments iiht_user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iiht_user_assessments
    ADD CONSTRAINT iiht_user_assessments_pkey PRIMARY KEY (id);


--
-- Name: innovation_styles_factors innovation_styles_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.innovation_styles_factors
    ADD CONSTRAINT innovation_styles_factors_pkey PRIMARY KEY (id);


--
-- Name: innovation_styles innovation_styles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.innovation_styles
    ADD CONSTRAINT innovation_styles_pkey PRIMARY KEY (id);


--
-- Name: integrations integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT integrations_pkey PRIMARY KEY (id);


--
-- Name: interview_questions interview_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_questions
    ADD CONSTRAINT interview_questions_pkey PRIMARY KEY (id);


--
-- Name: job_groups job_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_groups
    ADD CONSTRAINT job_groups_pkey PRIMARY KEY (id);


--
-- Name: job_role_translations job_role_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_role_translations
    ADD CONSTRAINT job_role_translations_pkey PRIMARY KEY (id);


--
-- Name: job_roles job_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_pkey PRIMARY KEY (id);


--
-- Name: last_job_runs last_job_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.last_job_runs
    ADD CONSTRAINT last_job_runs_pkey PRIMARY KEY (id);


--
-- Name: libraries libraries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libraries
    ADD CONSTRAINT libraries_pkey PRIMARY KEY (id);


--
-- Name: license_usages license_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT license_usages_pkey PRIMARY KEY (id);


--
-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);


--
-- Name: lti_oauth2_access_tokens lti_oauth2_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lti_oauth2_access_tokens
    ADD CONSTRAINT lti_oauth2_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: maintenance_settings maintenance_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_settings
    ADD CONSTRAINT maintenance_settings_pkey PRIMARY KEY (id);


--
-- Name: media_responses media_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_responses
    ADD CONSTRAINT media_responses_pkey PRIMARY KEY (id);


--
-- Name: meeting_recordings meeting_recordings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_recordings
    ADD CONSTRAINT meeting_recordings_pkey PRIMARY KEY (id);


--
-- Name: meeting_rooms meeting_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_rooms
    ADD CONSTRAINT meeting_rooms_pkey PRIMARY KEY (id);


--
-- Name: membership_grants membership_grants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_grants
    ADD CONSTRAINT membership_grants_pkey PRIMARY KEY (id);


--
-- Name: memberships_admin_roles memberships_admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships_admin_roles
    ADD CONSTRAINT memberships_admin_roles_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: mettl_assessments mettl_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_assessments
    ADD CONSTRAINT mettl_assessments_pkey PRIMARY KEY (id);


--
-- Name: mettl_schedule_records mettl_schedule_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_schedule_records
    ADD CONSTRAINT mettl_schedule_records_pkey PRIMARY KEY (id);


--
-- Name: mettl_user_assessments mettl_user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_user_assessments
    ADD CONSTRAINT mettl_user_assessments_pkey PRIMARY KEY (id);


--
-- Name: mhs_user_assessments mhs_user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mhs_user_assessments
    ADD CONSTRAINT mhs_user_assessments_pkey PRIMARY KEY (id);


--
-- Name: microsite_assessments microsite_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.microsite_assessments
    ADD CONSTRAINT microsite_assessments_pkey PRIMARY KEY (id);


--
-- Name: microsite_user_assessments microsite_user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.microsite_user_assessments
    ADD CONSTRAINT microsite_user_assessments_pkey PRIMARY KEY (id);


--
-- Name: norms norms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT norms_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: occupation_condition_sets occupation_condition_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupation_condition_sets
    ADD CONSTRAINT occupation_condition_sets_pkey PRIMARY KEY (id);


--
-- Name: occupations_factors occupations_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations_factors
    ADD CONSTRAINT occupations_factors_pkey PRIMARY KEY (id);


--
-- Name: occupations occupations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations
    ADD CONSTRAINT occupations_pkey PRIMARY KEY (id);


--
-- Name: old_passwords old_passwords_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.old_passwords
    ADD CONSTRAINT old_passwords_pkey PRIMARY KEY (id);


--
-- Name: oracle_credentials oracle_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oracle_credentials
    ADD CONSTRAINT oracle_credentials_pkey PRIMARY KEY (id);


--
-- Name: pearson_assessments pearson_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pearson_assessments
    ADD CONSTRAINT pearson_assessments_pkey PRIMARY KEY (id);


--
-- Name: pearson_user_assessments pearson_user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pearson_user_assessments
    ADD CONSTRAINT pearson_user_assessments_pkey PRIMARY KEY (id);


--
-- Name: platform_exceptions platform_exceptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_exceptions
    ADD CONSTRAINT platform_exceptions_pkey PRIMARY KEY (id);


--
-- Name: power_bi_settings power_bi_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.power_bi_settings
    ADD CONSTRAINT power_bi_settings_pkey PRIMARY KEY (id);


--
-- Name: privacy_consents privacy_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents
    ADD CONSTRAINT privacy_consents_pkey PRIMARY KEY (id);


--
-- Name: privacy_links privacy_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_links
    ADD CONSTRAINT privacy_links_pkey PRIMARY KEY (id);


--
-- Name: privacy_setting_translations privacy_setting_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_setting_translations
    ADD CONSTRAINT privacy_setting_translations_pkey PRIMARY KEY (id);


--
-- Name: privacy_settings privacy_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_settings
    ADD CONSTRAINT privacy_settings_pkey PRIMARY KEY (id);


--
-- Name: proctoring_sessions proctoring_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proctoring_sessions
    ADD CONSTRAINT proctoring_sessions_pkey PRIMARY KEY (id);


--
-- Name: proficiency_level_translations proficiency_level_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency_level_translations
    ADD CONSTRAINT proficiency_level_translations_pkey PRIMARY KEY (id);


--
-- Name: proficiency_levels proficiency_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency_levels
    ADD CONSTRAINT proficiency_levels_pkey PRIMARY KEY (id);


--
-- Name: profile_field_values profile_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_field_values
    ADD CONSTRAINT profile_field_values_pkey PRIMARY KEY (id);


--
-- Name: profile_fields profile_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_fields
    ADD CONSTRAINT profile_fields_pkey PRIMARY KEY (id);


--
-- Name: profile_settings profile_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_settings
    ADD CONSTRAINT profile_settings_pkey PRIMARY KEY (id);


--
-- Name: project_assessments project_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_assessments
    ADD CONSTRAINT project_assessments_pkey PRIMARY KEY (id);


--
-- Name: project_features project_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_features
    ADD CONSTRAINT project_features_pkey PRIMARY KEY (id);


--
-- Name: project_licenses project_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_licenses
    ADD CONSTRAINT project_licenses_pkey PRIMARY KEY (id);


--
-- Name: question_recoding question_recoding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_recoding
    ADD CONSTRAINT question_recoding_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: reflection_question_translations reflection_question_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflection_question_translations
    ADD CONSTRAINT reflection_question_translations_pkey PRIMARY KEY (id);


--
-- Name: reflection_questions reflection_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflection_questions
    ADD CONSTRAINT reflection_questions_pkey PRIMARY KEY (id);


--
-- Name: registration_codes registration_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_codes
    ADD CONSTRAINT registration_codes_pkey PRIMARY KEY (id);


--
-- Name: registration_settings registration_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_settings
    ADD CONSTRAINT registration_settings_pkey PRIMARY KEY (id);


--
-- Name: relationships relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT relationships_pkey PRIMARY KEY (id);


--
-- Name: report_approval_settings report_approval_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_approval_settings
    ADD CONSTRAINT report_approval_settings_pkey PRIMARY KEY (id);


--
-- Name: report_families report_families_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_families
    ADD CONSTRAINT report_families_pkey PRIMARY KEY (id);


--
-- Name: report_families_reports report_families_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_families_reports
    ADD CONSTRAINT report_families_reports_pkey PRIMARY KEY (id);


--
-- Name: reports_accesses reports_accesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses
    ADD CONSTRAINT reports_accesses_pkey PRIMARY KEY (id);


--
-- Name: reports_campaign_ai_artifacts reports_campaign_ai_artifacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_campaign_ai_artifacts
    ADD CONSTRAINT reports_campaign_ai_artifacts_pkey PRIMARY KEY (id);


--
-- Name: reports_campaign_factors reports_campaign_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_campaign_factors
    ADD CONSTRAINT reports_campaign_factors_pkey PRIMARY KEY (id);


--
-- Name: reports_filters reports_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_filters
    ADD CONSTRAINT reports_filters_pkey PRIMARY KEY (id);


--
-- Name: reports_modules reports_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_modules
    ADD CONSTRAINT reports_modules_pkey PRIMARY KEY (id);


--
-- Name: reports_pages reports_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_pages
    ADD CONSTRAINT reports_pages_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: resource_hogan_credentials resource_hogan_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_hogan_credentials
    ADD CONSTRAINT resource_hogan_credentials_pkey PRIMARY KEY (id);


--
-- Name: saml_service_providers saml_service_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saml_service_providers
    ADD CONSTRAINT saml_service_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_settings saml_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saml_settings
    ADD CONSTRAINT saml_settings_pkey PRIMARY KEY (id);


--
-- Name: saville_factors saville_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_factors
    ADD CONSTRAINT saville_factors_pkey PRIMARY KEY (id);


--
-- Name: saville_report_settings saville_report_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_report_settings
    ADD CONSTRAINT saville_report_settings_pkey PRIMARY KEY (id);


--
-- Name: saville_user_assessments saville_user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_user_assessments
    ADD CONSTRAINT saville_user_assessments_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: security_settings security_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_settings
    ADD CONSTRAINT security_settings_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sheet_columns sheet_columns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_columns
    ADD CONSTRAINT sheet_columns_pkey PRIMARY KEY (id);


--
-- Name: sheet_row_data sheet_row_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_row_data
    ADD CONSTRAINT sheet_row_data_pkey PRIMARY KEY (id);


--
-- Name: sheet_rows sheet_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_rows
    ADD CONSTRAINT sheet_rows_pkey PRIMARY KEY (id);


--
-- Name: sheets sheets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheets
    ADD CONSTRAINT sheets_pkey PRIMARY KEY (id);


--
-- Name: shortened_urls shortened_urls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shortened_urls
    ADD CONSTRAINT shortened_urls_pkey PRIMARY KEY (id);


--
-- Name: simulation_user_assessments simulation_user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulation_user_assessments
    ADD CONSTRAINT simulation_user_assessments_pkey PRIMARY KEY (id);


--
-- Name: skill_aliases skill_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_aliases
    ADD CONSTRAINT skill_aliases_pkey PRIMARY KEY (id);


--
-- Name: skill_groups skill_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_groups
    ADD CONSTRAINT skill_groups_pkey PRIMARY KEY (id);


--
-- Name: skill_translations skill_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_translations
    ADD CONSTRAINT skill_translations_pkey PRIMARY KEY (id);


--
-- Name: skills_development_actions skills_development_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_development_actions
    ADD CONSTRAINT skills_development_actions_pkey PRIMARY KEY (id);


--
-- Name: skills_job_roles skills_job_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_job_roles
    ADD CONSTRAINT skills_job_roles_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: skillvue_assessments skillvue_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skillvue_assessments
    ADD CONSTRAINT skillvue_assessments_pkey PRIMARY KEY (id);


--
-- Name: skillvue_user_assessments skillvue_user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skillvue_user_assessments
    ADD CONSTRAINT skillvue_user_assessments_pkey PRIMARY KEY (id);


--
-- Name: sms_histories sms_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_histories
    ADD CONSTRAINT sms_histories_pkey PRIMARY KEY (id);


--
-- Name: sms_invites sms_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_invites
    ADD CONSTRAINT sms_invites_pkey PRIMARY KEY (id);


--
-- Name: sms_records sms_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_records
    ADD CONSTRAINT sms_records_pkey PRIMARY KEY (id);


--
-- Name: smtp_settings smtp_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smtp_settings
    ADD CONSTRAINT smtp_settings_pkey PRIMARY KEY (id);


--
-- Name: system_check_records system_check_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_check_records
    ADD CONSTRAINT system_check_records_pkey PRIMARY KEY (id);


--
-- Name: system_check_sessions system_check_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_check_sessions
    ADD CONSTRAINT system_check_sessions_pkey PRIMARY KEY (id);


--
-- Name: taggings taggings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT taggings_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: taxonomy_levels taxonomy_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxonomy_levels
    ADD CONSTRAINT taxonomy_levels_pkey PRIMARY KEY (id);


--
-- Name: temporary_uploads temporary_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.temporary_uploads
    ADD CONSTRAINT temporary_uploads_pkey PRIMARY KEY (id);


--
-- Name: text_module_overrides text_module_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_module_overrides
    ADD CONSTRAINT text_module_overrides_pkey PRIMARY KEY (id);


--
-- Name: threesixty_campaigns threesixty_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns
    ADD CONSTRAINT threesixty_campaigns_pkey PRIMARY KEY (id);


--
-- Name: threesixty_email_histories threesixty_email_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_histories
    ADD CONSTRAINT threesixty_email_histories_pkey PRIMARY KEY (id);


--
-- Name: threesixty_email_schedules threesixty_email_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_schedules
    ADD CONSTRAINT threesixty_email_schedules_pkey PRIMARY KEY (id);


--
-- Name: threesixty_email_template_translations threesixty_email_template_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_template_translations
    ADD CONSTRAINT threesixty_email_template_translations_pkey PRIMARY KEY (id);


--
-- Name: threesixty_email_templates threesixty_email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_templates
    ADD CONSTRAINT threesixty_email_templates_pkey PRIMARY KEY (id);


--
-- Name: threesixty_evaluators threesixty_evaluators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_evaluators
    ADD CONSTRAINT threesixty_evaluators_pkey PRIMARY KEY (id);


--
-- Name: threesixty_instruction_template_translations threesixty_instruction_template_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_instruction_template_translations
    ADD CONSTRAINT threesixty_instruction_template_translations_pkey PRIMARY KEY (id);


--
-- Name: threesixty_instruction_templates threesixty_instruction_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_instruction_templates
    ADD CONSTRAINT threesixty_instruction_templates_pkey PRIMARY KEY (id);


--
-- Name: threesixty_nomination_requirements threesixty_nomination_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_nomination_requirements
    ADD CONSTRAINT threesixty_nomination_requirements_pkey PRIMARY KEY (id);


--
-- Name: threesixty_options threesixty_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_options
    ADD CONSTRAINT threesixty_options_pkey PRIMARY KEY (id);


--
-- Name: threesixty_reminder_histories threesixty_reminder_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_reminder_histories
    ADD CONSTRAINT threesixty_reminder_histories_pkey PRIMARY KEY (id);


--
-- Name: threesixty_subjects threesixty_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects
    ADD CONSTRAINT threesixty_subjects_pkey PRIMARY KEY (id);


--
-- Name: transcriptions transcriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcriptions
    ADD CONSTRAINT transcriptions_pkey PRIMARY KEY (id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: user_assessment_factor_scores user_assessment_factor_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_factor_scores
    ADD CONSTRAINT user_assessment_factor_scores_pkey PRIMARY KEY (id);


--
-- Name: user_assessment_verification_images user_assessment_verification_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_verification_images
    ADD CONSTRAINT user_assessment_verification_images_pkey PRIMARY KEY (id);


--
-- Name: user_assessment_verification_media user_assessment_verification_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_verification_media
    ADD CONSTRAINT user_assessment_verification_media_pkey PRIMARY KEY (id);


--
-- Name: user_assessments user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT user_assessments_pkey PRIMARY KEY (id);


--
-- Name: user_availability_dates user_availability_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_availability_dates
    ADD CONSTRAINT user_availability_dates_pkey PRIMARY KEY (id);


--
-- Name: user_availability_days user_availability_days_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_availability_days
    ADD CONSTRAINT user_availability_days_pkey PRIMARY KEY (id);


--
-- Name: user_bookings user_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookings
    ADD CONSTRAINT user_bookings_pkey PRIMARY KEY (id);


--
-- Name: user_idp_comments user_idp_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_comments
    ADD CONSTRAINT user_idp_comments_pkey PRIMARY KEY (id);


--
-- Name: user_idp_development_actions user_idp_development_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_development_actions
    ADD CONSTRAINT user_idp_development_actions_pkey PRIMARY KEY (id);


--
-- Name: user_idp_plans user_idp_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_plans
    ADD CONSTRAINT user_idp_plans_pkey PRIMARY KEY (id);


--
-- Name: user_idp_skills user_idp_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_skills
    ADD CONSTRAINT user_idp_skills_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_reflection_question_answers user_reflection_question_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reflection_question_answers
    ADD CONSTRAINT user_reflection_question_answers_pkey PRIMARY KEY (id);


--
-- Name: user_report_comments user_report_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_comments
    ADD CONSTRAINT user_report_comments_pkey PRIMARY KEY (id);


--
-- Name: user_report_events user_report_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_events
    ADD CONSTRAINT user_report_events_pkey PRIMARY KEY (id);


--
-- Name: user_report_pdfs user_report_pdfs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_pdfs
    ADD CONSTRAINT user_report_pdfs_pkey PRIMARY KEY (id);


--
-- Name: user_reports user_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT user_reports_pkey PRIMARY KEY (id);


--
-- Name: user_saved_filters user_saved_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_saved_filters
    ADD CONSTRAINT user_saved_filters_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_results users_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results
    ADD CONSTRAINT users_results_pkey PRIMARY KEY (id);


--
-- Name: vector_embeddings vector_embeddings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vector_embeddings
    ADD CONSTRAINT vector_embeddings_pkey PRIMARY KEY (id);


--
-- Name: version_associations version_associations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.version_associations
    ADD CONSTRAINT version_associations_pkey PRIMARY KEY (id);


--
-- Name: versions versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions
    ADD CONSTRAINT versions_pkey PRIMARY KEY (id);


--
-- Name: webhook_event_logs webhook_event_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_event_logs
    ADD CONSTRAINT webhook_event_logs_pkey PRIMARY KEY (id);


--
-- Name: webhook_subscription_topics webhook_subscription_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscription_topics
    ADD CONSTRAINT webhook_subscription_topics_pkey PRIMARY KEY (id);


--
-- Name: webhook_subscriptions webhook_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscriptions
    ADD CONSTRAINT webhook_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: workshop_assessors workshop_assessors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_assessors
    ADD CONSTRAINT workshop_assessors_pkey PRIMARY KEY (id);


--
-- Name: workshop_invite_logs workshop_invite_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_logs
    ADD CONSTRAINT workshop_invite_logs_pkey PRIMARY KEY (id);


--
-- Name: workshop_invite_translations workshop_invite_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_translations
    ADD CONSTRAINT workshop_invite_translations_pkey PRIMARY KEY (id);


--
-- Name: workshop_invited_subjects workshop_invited_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invited_subjects
    ADD CONSTRAINT workshop_invited_subjects_pkey PRIMARY KEY (id);


--
-- Name: workshop_invites workshop_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invites
    ADD CONSTRAINT workshop_invites_pkey PRIMARY KEY (id);


--
-- Name: workshop_invites_workshops workshop_invites_workshops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invites_workshops
    ADD CONSTRAINT workshop_invites_workshops_pkey PRIMARY KEY (id);


--
-- Name: workshop_managers workshop_managers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_managers
    ADD CONSTRAINT workshop_managers_pkey PRIMARY KEY (id);


--
-- Name: workshop_resources workshop_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_resources
    ADD CONSTRAINT workshop_resources_pkey PRIMARY KEY (id);


--
-- Name: workshop_subjects workshop_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_subjects
    ADD CONSTRAINT workshop_subjects_pkey PRIMARY KEY (id);


--
-- Name: workshops workshops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT workshops_pkey PRIMARY KEY (id);


--
-- Name: yoodli_user_assessments yoodli_user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yoodli_user_assessments
    ADD CONSTRAINT yoodli_user_assessments_pkey PRIMARY KEY (id);


--
-- Name: associated_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX associated_index ON public.audits USING btree (associated_type, associated_id);


--
-- Name: auditable_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auditable_index ON public.audits USING btree (auditable_type, auditable_id, version);


--
-- Name: datasheet_column_preference_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX datasheet_column_preference_resource ON public.datasheet_column_preferences USING btree (resource_type, resource_id);


--
-- Name: email_histories_campaign; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_histories_campaign ON public.threesixty_email_histories USING btree (threesixty_campaign_id);


--
-- Name: email_histories_email_schedule; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_histories_email_schedule ON public.threesixty_email_histories USING btree (threesixty_email_schedule_id);


--
-- Name: idx_ai_factor_scores_unique_aggregated; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_ai_factor_scores_unique_aggregated ON public.ai_factor_scores USING btree (users_result_id, factor_id) WHERE (question_id IS NULL);


--
-- Name: idx_ai_factor_scores_unique_with_question; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_ai_factor_scores_unique_with_question ON public.ai_factor_scores USING btree (users_result_id, factor_id, question_id) WHERE (question_id IS NOT NULL);


--
-- Name: idx_on_ai_assistant_id_key_1d1a169fc1; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_ai_assistant_id_key_1d1a169fc1 ON public.ai_assistant_output_schema_keys USING btree (ai_assistant_id, key);


--
-- Name: idx_on_application_setting_id_c2c1c3f547; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_application_setting_id_c2c1c3f547 ON public.application_url_whitelist_entries USING btree (application_setting_id);


--
-- Name: idx_on_application_setting_id_e570a8a095; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_application_setting_id_e570a8a095 ON public.application_ip_whitelist_entries USING btree (application_setting_id);


--
-- Name: idx_on_application_setting_id_enabled_bef3a46920; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_application_setting_id_enabled_bef3a46920 ON public.application_url_whitelist_entries USING btree (application_setting_id, enabled);


--
-- Name: idx_on_application_setting_id_enabled_f85a302e40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_application_setting_id_enabled_f85a302e40 ON public.application_ip_whitelist_entries USING btree (application_setting_id, enabled);


--
-- Name: idx_on_assessment_id_3b131a93ee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_assessment_id_3b131a93ee ON public.campaign_assessor_assessment_factor_weights USING btree (assessment_id);


--
-- Name: idx_on_campaign_ai_artifact_id_aaea21b6d6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_campaign_ai_artifact_id_aaea21b6d6 ON public.campaign_ai_artifact_dependencies USING btree (campaign_ai_artifact_id);


--
-- Name: idx_on_campaign_assessment_group_id_b2579ac76b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_campaign_assessment_group_id_b2579ac76b ON public.campaign_assessor_assessments USING btree (campaign_assessment_group_id);


--
-- Name: idx_on_campaign_id_assessment_id_53807fc1b9; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_campaign_id_assessment_id_53807fc1b9 ON public.ai_scoring_approval_settings USING btree (campaign_id, assessment_id);


--
-- Name: idx_on_campaign_id_bbe9cda192; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_campaign_id_bbe9cda192 ON public.campaign_assessor_assessment_factor_weights USING btree (campaign_id);


--
-- Name: idx_on_campaign_id_user_id_campaign_factor_id_5dd941be00; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_campaign_id_user_id_campaign_factor_id_5dd941be00 ON public.campaign_factor_values USING btree (campaign_id, user_id, campaign_factor_id);


--
-- Name: idx_on_communication_id_assessment_id_d9ce30e955; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_communication_id_assessment_id_d9ce30e955 ON public.communications_assessments USING btree (communication_id, assessment_id);


--
-- Name: idx_on_description_locale_02e909ba33; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_description_locale_02e909ba33 ON public.development_action_translations USING btree (description, locale);


--
-- Name: idx_on_development_action_id_46ceccdf9a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_development_action_id_46ceccdf9a ON public.idp_template_development_actions USING btree (development_action_id);


--
-- Name: idx_on_development_action_id_locale_ccabbebe4d; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_development_action_id_locale_ccabbebe4d ON public.development_action_translations USING btree (development_action_id, locale);


--
-- Name: idx_on_idp_template_id_development_action_id_catego_bd39b965f7; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_idp_template_id_development_action_id_catego_bd39b965f7 ON public.idp_template_development_actions USING btree (idp_template_id, development_action_id, category);


--
-- Name: idx_on_idp_template_id_skill_id_category_11f5232638; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_idp_template_id_skill_id_category_11f5232638 ON public.idp_template_skills USING btree (idp_template_id, skill_id, category);


--
-- Name: idx_on_interview_question_id_cf15f719f7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_interview_question_id_cf15f719f7 ON public.idp_template_interview_questions USING btree (interview_question_id);


--
-- Name: idx_on_proficiency_level_id_locale_e9e7beb006; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_proficiency_level_id_locale_e9e7beb006 ON public.proficiency_level_translations USING btree (proficiency_level_id, locale);


--
-- Name: idx_on_project_id_hierarchy_type_depth_ec0c21635f; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_on_project_id_hierarchy_type_depth_ec0c21635f ON public.taxonomy_levels USING btree (project_id, hierarchy_type, depth);


--
-- Name: idx_on_reflection_question_id_081af4b0ec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_reflection_question_id_081af4b0ec ON public.idp_template_reflection_questions USING btree (reflection_question_id);


--
-- Name: idx_on_reflection_question_id_5b36f1a8ed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_reflection_question_id_5b36f1a8ed ON public.user_reflection_question_answers USING btree (reflection_question_id);


--
-- Name: idx_on_reflection_question_id_fcc1b0bca7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_reflection_question_id_fcc1b0bca7 ON public.reflection_question_translations USING btree (reflection_question_id);


--
-- Name: idx_on_resource_id_resource_type_76c375ea65; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_resource_id_resource_type_76c375ea65 ON public.resource_hogan_credentials USING btree (resource_id, resource_type);


--
-- Name: idx_on_skill_gap_report_analysis_ai_assistant_id_2a87d39fe6; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_skill_gap_report_analysis_ai_assistant_id_2a87d39fe6 ON public.idp_templates USING btree (skill_gap_report_analysis_ai_assistant_id);


--
-- Name: idx_on_tenant_id_8f3a1ee70f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_tenant_id_8f3a1ee70f ON public.threesixty_instruction_template_translations USING btree (tenant_id);


--
-- Name: idx_on_user_assessment_id_cb9cc55a9e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_user_assessment_id_cb9cc55a9e ON public.user_assessment_verification_images USING btree (user_assessment_id);


--
-- Name: idx_sessions_user_tenant_impersonator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_user_tenant_impersonator ON public.sessions USING btree (user_id, tenant_id, impersonator_id);


--
-- Name: idx_user_assessments_status_expiry_users_result_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_assessments_status_expiry_users_result_id ON public.user_assessments USING btree (status, expiry_date) INCLUDE (users_result_id);


--
-- Name: idx_user_prefs_unique_global; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_prefs_unique_global ON public.user_preferences USING btree (user_id, category, config_key) WHERE (resource_id IS NULL);


--
-- Name: idx_user_prefs_unique_scoped; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_prefs_unique_scoped ON public.user_preferences USING btree (user_id, category, config_key, resource_type, resource_id) WHERE (resource_id IS NOT NULL);


--
-- Name: index_53a664e244a4bc3ce19609177c48692ee2fa83fa; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_53a664e244a4bc3ce19609177c48692ee2fa83fa ON public.threesixty_instruction_template_translations USING btree (threesixty_instruction_template_id, locale);


--
-- Name: index_57aa4720fb18a9d3160720802166a1fa6020dfdf; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_57aa4720fb18a9d3160720802166a1fa6020dfdf ON public.workshop_invite_translations USING btree (workshop_invite_id, locale);


--
-- Name: index_887f45023887ef83411209851cdd913a49fb74dd; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_887f45023887ef83411209851cdd913a49fb74dd ON public.threesixty_email_template_translations USING btree (threesixty_email_template_id, locale);


--
-- Name: index_acst_setting_t18n_on_consent_setting_id_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_acst_setting_t18n_on_consent_setting_id_and_locale ON public.assessment_consent_setting_translations USING btree (assessment_consent_setting_id, locale);


--
-- Name: index_active_storage_attachments_on_blob_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_active_storage_attachments_on_blob_id ON public.active_storage_attachments USING btree (blob_id);


--
-- Name: index_active_storage_attachments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_active_storage_attachments_on_tenant_id ON public.active_storage_attachments USING btree (tenant_id);


--
-- Name: index_active_storage_attachments_uniqueness; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_attachments_uniqueness ON public.active_storage_attachments USING btree (record_type, record_id, name, blob_id);


--
-- Name: index_active_storage_blobs_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_blobs_on_key ON public.active_storage_blobs USING btree (key);


--
-- Name: index_active_storage_variant_records_uniqueness; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_active_storage_variant_records_uniqueness ON public.active_storage_variant_records USING btree (blob_id, variation_digest);


--
-- Name: index_activesupport_tables_migrations_on_model_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_activesupport_tables_migrations_on_model_name ON public.activesupport_tables_migrations USING btree (model_name);


--
-- Name: index_activesupport_tables_migrations_on_table_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_activesupport_tables_migrations_on_table_name ON public.activesupport_tables_migrations USING btree (table_name);


--
-- Name: index_admin_jobs_on_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_jobs_on_owner_id ON public.admin_jobs USING btree (owner_id);


--
-- Name: index_admin_jobs_on_parent_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_jobs_on_parent_job_id ON public.admin_jobs USING btree (parent_job_id);


--
-- Name: index_admin_jobs_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_jobs_on_tenant_id ON public.admin_jobs USING btree (tenant_id);


--
-- Name: index_admin_roles_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_roles_on_client_id ON public.admin_roles USING btree (client_id);


--
-- Name: index_admin_roles_on_name_and_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_admin_roles_on_name_and_client_id ON public.admin_roles USING btree (name, client_id);


--
-- Name: index_admin_roles_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_admin_roles_on_tenant_id ON public.admin_roles USING btree (tenant_id);


--
-- Name: index_agile_events_on_assign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_agile_events_on_assign_id ON public.agile_events USING btree (assign_id);


--
-- Name: index_agile_events_on_users_result_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_agile_events_on_users_result_id ON public.agile_events USING btree (users_result_id);


--
-- Name: index_agiles_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_agiles_on_assessment_id ON public.agiles USING btree (assessment_id);


--
-- Name: index_agiles_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_agiles_on_tenant_id ON public.agiles USING btree (tenant_id);


--
-- Name: index_ai_assistant_chats_on_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_chats_on_ai_assistant_id ON public.ai_assistant_chats USING btree (ai_assistant_id);


--
-- Name: index_ai_assistant_chats_on_ai_assisted_user_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_chats_on_ai_assisted_user_session_id ON public.ai_assistant_chats USING btree (ai_assisted_user_session_id);


--
-- Name: index_ai_assistant_chats_on_ai_model_registry_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_chats_on_ai_model_registry_id ON public.ai_assistant_chats USING btree (ai_model_registry_id);


--
-- Name: index_ai_assistant_chats_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_chats_on_client_id ON public.ai_assistant_chats USING btree (client_id);


--
-- Name: index_ai_assistant_chats_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_chats_on_tenant_id ON public.ai_assistant_chats USING btree (tenant_id);


--
-- Name: index_ai_assistant_chats_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_chats_on_user_id ON public.ai_assistant_chats USING btree (user_id);


--
-- Name: index_ai_assistant_output_schema_keys_on_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_output_schema_keys_on_ai_assistant_id ON public.ai_assistant_output_schema_keys USING btree (ai_assistant_id);


--
-- Name: index_ai_assistant_output_schema_keys_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_output_schema_keys_on_tenant_id ON public.ai_assistant_output_schema_keys USING btree (tenant_id);


--
-- Name: index_ai_assistant_requests_on_ai_assistant_chat_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_requests_on_ai_assistant_chat_id ON public.ai_assistant_requests USING btree (ai_assistant_chat_id);


--
-- Name: index_ai_assistant_requests_on_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_requests_on_ai_assistant_id ON public.ai_assistant_requests USING btree (ai_assistant_id);


--
-- Name: index_ai_assistant_requests_on_ai_assistant_tool_call_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_requests_on_ai_assistant_tool_call_id ON public.ai_assistant_requests USING btree (ai_assistant_tool_call_id);


--
-- Name: index_ai_assistant_requests_on_ai_model_registry_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_requests_on_ai_model_registry_id ON public.ai_assistant_requests USING btree (ai_model_registry_id);


--
-- Name: index_ai_assistant_requests_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_requests_on_tenant_id ON public.ai_assistant_requests USING btree (tenant_id);


--
-- Name: index_ai_assistant_tool_calls_on_ai_assistant_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_tool_calls_on_ai_assistant_request_id ON public.ai_assistant_tool_calls USING btree (ai_assistant_request_id);


--
-- Name: index_ai_assistant_tool_calls_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistant_tool_calls_on_tenant_id ON public.ai_assistant_tool_calls USING btree (tenant_id);


--
-- Name: index_ai_assistant_tool_calls_on_tool_call_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_ai_assistant_tool_calls_on_tool_call_id ON public.ai_assistant_tool_calls USING btree (tool_call_id);


--
-- Name: index_ai_assistants_on_last_modified_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistants_on_last_modified_by_id ON public.ai_assistants USING btree (last_modified_by_id);


--
-- Name: index_ai_assistants_on_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistants_on_owner_id ON public.ai_assistants USING btree (owner_id);


--
-- Name: index_ai_assistants_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assistants_on_tenant_id ON public.ai_assistants USING btree (tenant_id);


--
-- Name: index_ai_assisted_user_sessions_on_assistable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assisted_user_sessions_on_assistable ON public.ai_assisted_user_sessions USING btree (assistable_type, assistable_id);


--
-- Name: index_ai_assisted_user_sessions_on_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assisted_user_sessions_on_resource ON public.ai_assisted_user_sessions USING btree (resource_type, resource_id);


--
-- Name: index_ai_assisted_user_sessions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assisted_user_sessions_on_tenant_id ON public.ai_assisted_user_sessions USING btree (tenant_id);


--
-- Name: index_ai_assisted_user_sessions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assisted_user_sessions_on_user_id ON public.ai_assisted_user_sessions USING btree (user_id);


--
-- Name: index_ai_assisted_user_sessions_on_user_id_and_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_assisted_user_sessions_on_user_id_and_type ON public.ai_assisted_user_sessions USING btree (user_id, type);


--
-- Name: index_ai_factor_scores_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_factor_scores_on_factor_id ON public.ai_factor_scores USING btree (factor_id);


--
-- Name: index_ai_factor_scores_on_parent_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_factor_scores_on_parent_factor_id ON public.ai_factor_scores USING btree (parent_factor_id);


--
-- Name: index_ai_factor_scores_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_factor_scores_on_question_id ON public.ai_factor_scores USING btree (question_id);


--
-- Name: index_ai_factor_scores_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_factor_scores_on_tenant_id ON public.ai_factor_scores USING btree (tenant_id);


--
-- Name: index_ai_factor_scores_on_users_result_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_factor_scores_on_users_result_id ON public.ai_factor_scores USING btree (users_result_id);


--
-- Name: index_ai_model_registries_on_capabilities; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_model_registries_on_capabilities ON public.ai_model_registries USING gin (capabilities);


--
-- Name: index_ai_model_registries_on_family; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_model_registries_on_family ON public.ai_model_registries USING btree (family);


--
-- Name: index_ai_model_registries_on_modalities; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_model_registries_on_modalities ON public.ai_model_registries USING gin (modalities);


--
-- Name: index_ai_model_registries_on_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_model_registries_on_provider ON public.ai_model_registries USING btree (provider);


--
-- Name: index_ai_model_registries_on_provider_and_model_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_ai_model_registries_on_provider_and_model_id ON public.ai_model_registries USING btree (provider, model_id);


--
-- Name: index_ai_scoring_approval_settings_on_approver_ids; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_scoring_approval_settings_on_approver_ids ON public.ai_scoring_approval_settings USING gin (approver_ids);


--
-- Name: index_ai_scoring_approval_settings_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_scoring_approval_settings_on_assessment_id ON public.ai_scoring_approval_settings USING btree (assessment_id);


--
-- Name: index_ai_scoring_approval_settings_on_assessor_ids; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_scoring_approval_settings_on_assessor_ids ON public.ai_scoring_approval_settings USING gin (assessor_ids);


--
-- Name: index_ai_scoring_approval_settings_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_scoring_approval_settings_on_campaign_id ON public.ai_scoring_approval_settings USING btree (campaign_id);


--
-- Name: index_ai_scoring_approval_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_scoring_approval_settings_on_tenant_id ON public.ai_scoring_approval_settings USING btree (tenant_id);


--
-- Name: index_ai_sessions_on_assistable_and_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_sessions_on_assistable_and_type ON public.ai_assisted_user_sessions USING btree (assistable_type, assistable_id, type);


--
-- Name: index_ai_translation_results_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ai_translation_results_on_tenant_id ON public.ai_translation_results USING btree (tenant_id);


--
-- Name: index_api_keys_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_api_keys_on_created_by_id ON public.api_keys USING btree (created_by_id);


--
-- Name: index_api_keys_on_encrypted_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_api_keys_on_encrypted_token ON public.api_keys USING btree (encrypted_token);


--
-- Name: index_api_keys_on_encrypted_token_iv; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_api_keys_on_encrypted_token_iv ON public.api_keys USING btree (encrypted_token_iv);


--
-- Name: index_api_keys_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_api_keys_on_key ON public.api_keys USING btree (key);


--
-- Name: index_api_keys_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_api_keys_on_tenant_id ON public.api_keys USING btree (tenant_id);


--
-- Name: index_api_keys_on_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_api_keys_on_updated_by_id ON public.api_keys USING btree (updated_by_id);


--
-- Name: index_api_keys_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_api_keys_on_user_id ON public.api_keys USING btree (user_id);


--
-- Name: index_application_ip_whitelist_entries_on_ip_or_cidr; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_application_ip_whitelist_entries_on_ip_or_cidr ON public.application_ip_whitelist_entries USING btree (ip_or_cidr);


--
-- Name: index_application_ip_whitelist_entries_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_application_ip_whitelist_entries_on_tenant_id ON public.application_ip_whitelist_entries USING btree (tenant_id);


--
-- Name: index_application_public_keys_on_key_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_application_public_keys_on_key_id ON public.application_public_keys USING btree (key_id);


--
-- Name: index_application_public_keys_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_application_public_keys_on_tenant_id ON public.application_public_keys USING btree (tenant_id);


--
-- Name: index_application_public_keys_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_application_public_keys_on_user_id ON public.application_public_keys USING btree (user_id);


--
-- Name: index_application_public_keys_on_user_id_and_disabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_application_public_keys_on_user_id_and_disabled ON public.application_public_keys USING btree (user_id, disabled);


--
-- Name: index_application_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_application_settings_on_tenant_id ON public.application_settings USING btree (tenant_id);


--
-- Name: index_application_settings_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_application_settings_on_user_id ON public.application_settings USING btree (user_id);


--
-- Name: index_application_url_whitelist_entries_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_application_url_whitelist_entries_on_tenant_id ON public.application_url_whitelist_entries USING btree (tenant_id);


--
-- Name: index_application_url_whitelist_entries_on_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_application_url_whitelist_entries_on_url ON public.application_url_whitelist_entries USING btree (url);


--
-- Name: index_assessment_assistants_on_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_assistants_on_ai_assistant_id ON public.assessment_assistants USING btree (ai_assistant_id);


--
-- Name: index_assessment_assistants_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_assistants_on_assessment_id ON public.assessment_assistants USING btree (assessment_id);


--
-- Name: index_assessment_assistants_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_assistants_on_tenant_id ON public.assessment_assistants USING btree (tenant_id);


--
-- Name: index_assessment_consent_setting_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_consent_setting_translations_on_locale ON public.assessment_consent_setting_translations USING btree (locale);


--
-- Name: index_assessment_consent_setting_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_consent_setting_translations_on_tenant_id ON public.assessment_consent_setting_translations USING btree (tenant_id);


--
-- Name: index_assessment_consent_settings_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_consent_settings_on_assessment_id ON public.assessment_consent_settings USING btree (assessment_id);


--
-- Name: index_assessment_consent_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_consent_settings_on_tenant_id ON public.assessment_consent_settings USING btree (tenant_id);


--
-- Name: index_assessment_t18n_tables_on_assessment_id_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_assessment_t18n_tables_on_assessment_id_and_locale ON public.assessment_translations USING btree (assessment_id, locale);


--
-- Name: index_assessment_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_translations_on_locale ON public.assessment_translations USING btree (locale);


--
-- Name: index_assessment_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_translations_on_tenant_id ON public.assessment_translations USING btree (tenant_id);


--
-- Name: index_assessments_clients_on_client_id_and_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_assessments_clients_on_client_id_and_assessment_id ON public.assessments_clients USING btree (client_id, assessment_id);


--
-- Name: index_assessments_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_created_by_id ON public.assessments USING btree (created_by_id);


--
-- Name: index_assessments_on_deleted_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_deleted_by_id ON public.assessments USING btree (deleted_by_id);


--
-- Name: index_assessments_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_dimension_id ON public.assessments USING btree (dimension_id);


--
-- Name: index_assessments_on_linked_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_linked_assessment_id ON public.assessments USING btree (linked_assessment_id);


--
-- Name: index_assessments_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_project_id ON public.assessments USING btree (project_id);


--
-- Name: index_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_tenant_id ON public.assessments USING btree (tenant_id);


--
-- Name: index_assessments_on_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_updated_by_id ON public.assessments USING btree (updated_by_id);


--
-- Name: index_assessments_reports_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_reports_on_assessment_id ON public.assessments_reports USING btree (assessment_id);


--
-- Name: index_assessments_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_reports_on_report_id ON public.assessments_reports USING btree (report_id);


--
-- Name: index_assessments_reports_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_reports_on_tenant_id ON public.assessments_reports USING btree (tenant_id);


--
-- Name: index_assessors_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessors_on_campaign_id ON public.assessors USING btree (campaign_id);


--
-- Name: index_assessors_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessors_on_tenant_id ON public.assessors USING btree (tenant_id);


--
-- Name: index_assessors_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessors_on_user_id ON public.assessors USING btree (user_id);


--
-- Name: index_assigns_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_on_campaign_id ON public.assigns USING btree (campaign_id);


--
-- Name: index_assigns_on_evaluator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_on_evaluator_id ON public.assigns USING btree (evaluator_id);


--
-- Name: index_assigns_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_on_membership_id ON public.assigns USING btree (membership_id);


--
-- Name: index_assigns_on_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_on_subject_id ON public.assigns USING btree (subject_id);


--
-- Name: index_assigns_reports_on_assign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_reports_on_assign_id ON public.assigns_reports USING btree (assign_id);


--
-- Name: index_assigns_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_reports_on_report_id ON public.assigns_reports USING btree (report_id);


--
-- Name: index_assigns_reports_on_report_id_and_assign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_assigns_reports_on_report_id_and_assign_id ON public.assigns_reports USING btree (report_id, assign_id);


--
-- Name: index_audit_logs_on_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audit_logs_on_action ON public.audit_logs USING btree (action);


--
-- Name: index_audit_logs_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audit_logs_on_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: index_audit_logs_on_impersonated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audit_logs_on_impersonated_by_id ON public.audit_logs USING btree (impersonated_by_id);


--
-- Name: index_audit_logs_on_record_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audit_logs_on_record_id ON public.audit_logs USING btree (record_id);


--
-- Name: index_audit_logs_on_record_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audit_logs_on_record_type ON public.audit_logs USING btree (record_type);


--
-- Name: index_audit_logs_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audit_logs_on_tenant_id ON public.audit_logs USING btree (tenant_id);


--
-- Name: index_audit_logs_on_user_id_and_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audit_logs_on_user_id_and_action ON public.audit_logs USING btree (user_id, action);


--
-- Name: index_audit_logs_on_user_id_and_action_and_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audit_logs_on_user_id_and_action_and_created_at ON public.audit_logs USING btree (user_id, action, created_at);


--
-- Name: index_audits_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audits_on_created_at ON public.audits USING btree (created_at);


--
-- Name: index_audits_on_request_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audits_on_request_uuid ON public.audits USING btree (request_uuid);


--
-- Name: index_audits_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_audits_on_tenant_id ON public.audits USING btree (tenant_id);


--
-- Name: index_blocks_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_blocks_on_assessment_id ON public.blocks USING btree (assessment_id);


--
-- Name: index_blocks_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_blocks_on_template_id ON public.blocks USING btree (template_id);


--
-- Name: index_blocks_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_blocks_on_tenant_id ON public.blocks USING btree (tenant_id);


--
-- Name: index_bulk_reports_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_bulk_reports_on_campaign_id ON public.bulk_reports USING btree (campaign_id);


--
-- Name: index_bulk_reports_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_bulk_reports_on_tenant_id ON public.bulk_reports USING btree (tenant_id);


--
-- Name: index_bulk_reports_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_bulk_reports_on_user_id ON public.bulk_reports USING btree (user_id);


--
-- Name: index_campaign_ai_artifact_dependencies_on_dependency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_ai_artifact_dependencies_on_dependency ON public.campaign_ai_artifact_dependencies USING btree (dependency_type, dependency_id);


--
-- Name: index_campaign_ai_artifact_dependencies_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_ai_artifact_dependencies_on_tenant_id ON public.campaign_ai_artifact_dependencies USING btree (tenant_id);


--
-- Name: index_campaign_ai_artifacts_on_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_ai_artifacts_on_ai_assistant_id ON public.campaign_ai_artifacts USING btree (ai_assistant_id);


--
-- Name: index_campaign_ai_artifacts_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_ai_artifacts_on_campaign_id ON public.campaign_ai_artifacts USING btree (campaign_id);


--
-- Name: index_campaign_ai_artifacts_on_campaign_id_and_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_campaign_ai_artifacts_on_campaign_id_and_code ON public.campaign_ai_artifacts USING btree (campaign_id, code);


--
-- Name: index_campaign_ai_artifacts_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_ai_artifacts_on_tenant_id ON public.campaign_ai_artifacts USING btree (tenant_id);


--
-- Name: index_campaign_assessment_groups_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessment_groups_on_campaign_id ON public.campaign_assessment_groups USING btree (campaign_id);


--
-- Name: index_campaign_assessment_groups_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessment_groups_on_tenant_id ON public.campaign_assessment_groups USING btree (tenant_id);


--
-- Name: index_campaign_assessments_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessments_on_assessment_id ON public.campaign_assessments USING btree (assessment_id);


--
-- Name: index_campaign_assessments_on_assessor_form_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessments_on_assessor_form_id ON public.campaign_assessments USING btree (assessor_form_id);


--
-- Name: index_campaign_assessments_on_campaign_assessment_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessments_on_campaign_assessment_group_id ON public.campaign_assessments USING btree (campaign_assessment_group_id);


--
-- Name: index_campaign_assessments_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessments_on_campaign_id ON public.campaign_assessments USING btree (campaign_id);


--
-- Name: index_campaign_assessments_on_campaign_id_and_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_campaign_assessments_on_campaign_id_and_assessment_id ON public.campaign_assessments USING btree (campaign_id, assessment_id);


--
-- Name: index_campaign_assessments_on_norm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessments_on_norm_id ON public.campaign_assessments USING btree (norm_id);


--
-- Name: index_campaign_assessments_on_occupation_condition_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessments_on_occupation_condition_set_id ON public.campaign_assessments USING btree (occupation_condition_set_id);


--
-- Name: index_campaign_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessments_on_tenant_id ON public.campaign_assessments USING btree (tenant_id);


--
-- Name: index_campaign_assessor_assessment_factor_weights_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessor_assessment_factor_weights_on_factor_id ON public.campaign_assessor_assessment_factor_weights USING btree (factor_id);


--
-- Name: index_campaign_assessor_assessment_factor_weights_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessor_assessment_factor_weights_on_tenant_id ON public.campaign_assessor_assessment_factor_weights USING btree (tenant_id);


--
-- Name: index_campaign_assessor_assessments_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessor_assessments_on_assessment_id ON public.campaign_assessor_assessments USING btree (assessment_id);


--
-- Name: index_campaign_assessor_assessments_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessor_assessments_on_campaign_id ON public.campaign_assessor_assessments USING btree (campaign_id);


--
-- Name: index_campaign_assessor_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_assessor_assessments_on_tenant_id ON public.campaign_assessor_assessments USING btree (tenant_id);


--
-- Name: index_campaign_factor_groups_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factor_groups_on_campaign_id ON public.campaign_factor_groups USING btree (campaign_id);


--
-- Name: index_campaign_factor_groups_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factor_groups_on_tenant_id ON public.campaign_factor_groups USING btree (tenant_id);


--
-- Name: index_campaign_factor_values_on_campaign_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factor_values_on_campaign_factor_id ON public.campaign_factor_values USING btree (campaign_factor_id);


--
-- Name: index_campaign_factor_values_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factor_values_on_campaign_id ON public.campaign_factor_values USING btree (campaign_id);


--
-- Name: index_campaign_factor_values_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factor_values_on_tenant_id ON public.campaign_factor_values USING btree (tenant_id);


--
-- Name: index_campaign_factor_values_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factor_values_on_user_id ON public.campaign_factor_values USING btree (user_id);


--
-- Name: index_campaign_factors_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factors_on_assessment_id ON public.campaign_factors USING btree (assessment_id);


--
-- Name: index_campaign_factors_on_campaign_factor_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factors_on_campaign_factor_group_id ON public.campaign_factors USING btree (campaign_factor_group_id);


--
-- Name: index_campaign_factors_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factors_on_campaign_id ON public.campaign_factors USING btree (campaign_id);


--
-- Name: index_campaign_factors_on_campaign_id_and_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_campaign_factors_on_campaign_id_and_code ON public.campaign_factors USING btree (campaign_id, code);


--
-- Name: index_campaign_factors_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factors_on_factor_id ON public.campaign_factors USING btree (factor_id);


--
-- Name: index_campaign_factors_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_factors_on_tenant_id ON public.campaign_factors USING btree (tenant_id);


--
-- Name: index_campaign_idp_dependencies_on_campaign_idp_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_idp_dependencies_on_campaign_idp_id ON public.campaign_idp_dependencies USING btree (campaign_idp_id);


--
-- Name: index_campaign_idp_dependencies_on_dependency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_idp_dependencies_on_dependency ON public.campaign_idp_dependencies USING btree (dependency_type, dependency_id);


--
-- Name: index_campaign_idp_dependencies_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_idp_dependencies_on_tenant_id ON public.campaign_idp_dependencies USING btree (tenant_id);


--
-- Name: index_campaign_idps_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_idps_on_campaign_id ON public.campaign_idps USING btree (campaign_id);


--
-- Name: index_campaign_idps_on_campaign_id_and_idp_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_campaign_idps_on_campaign_id_and_idp_template_id ON public.campaign_idps USING btree (campaign_id, idp_template_id);


--
-- Name: index_campaign_idps_on_idp_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_idps_on_idp_template_id ON public.campaign_idps USING btree (idp_template_id);


--
-- Name: index_campaign_idps_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_idps_on_tenant_id ON public.campaign_idps USING btree (tenant_id);


--
-- Name: index_campaign_option_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_option_translations_on_locale ON public.campaign_option_translations USING btree (locale);


--
-- Name: index_campaign_option_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_option_translations_on_tenant_id ON public.campaign_option_translations USING btree (tenant_id);


--
-- Name: index_campaign_options_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_options_on_campaign_id ON public.campaign_options USING btree (campaign_id);


--
-- Name: index_campaign_options_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_options_on_tenant_id ON public.campaign_options USING btree (tenant_id);


--
-- Name: index_campaign_reports_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_reports_on_campaign_id ON public.campaign_reports USING btree (campaign_id);


--
-- Name: index_campaign_reports_on_campaign_id_and_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_campaign_reports_on_campaign_id_and_report_id ON public.campaign_reports USING btree (campaign_id, report_id);


--
-- Name: index_campaign_reports_on_report_family_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_reports_on_report_family_id ON public.campaign_reports USING btree (report_family_id);


--
-- Name: index_campaign_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_reports_on_report_id ON public.campaign_reports USING btree (report_id);


--
-- Name: index_campaign_reports_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_reports_on_tenant_id ON public.campaign_reports USING btree (tenant_id);


--
-- Name: index_campaign_templates_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_templates_on_campaign_id ON public.campaign_templates USING btree (campaign_id);


--
-- Name: index_campaign_templates_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_templates_on_tenant_id ON public.campaign_templates USING btree (tenant_id);


--
-- Name: index_campaign_users_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_users_on_campaign_id ON public.campaign_users USING btree (campaign_id);


--
-- Name: index_campaign_users_on_campaign_id_and_external_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_campaign_users_on_campaign_id_and_external_id ON public.campaign_users USING btree (campaign_id, external_id);


--
-- Name: index_campaign_users_on_campaign_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_campaign_users_on_campaign_id_and_user_id ON public.campaign_users USING btree (campaign_id, user_id);


--
-- Name: index_campaign_users_on_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_users_on_completed_at ON public.campaign_users USING btree (completed_at);


--
-- Name: index_campaign_users_on_completion_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_users_on_completion_status ON public.campaign_users USING btree (completion_status);


--
-- Name: index_campaign_users_on_current_job_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_users_on_current_job_role_id ON public.campaign_users USING btree (current_job_role_id);


--
-- Name: index_campaign_users_on_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_users_on_started_at ON public.campaign_users USING btree (started_at);


--
-- Name: index_campaign_users_on_target_job_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_users_on_target_job_role_id ON public.campaign_users USING btree (target_job_role_id);


--
-- Name: index_campaign_users_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_users_on_tenant_id ON public.campaign_users USING btree (tenant_id);


--
-- Name: index_campaign_users_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaign_users_on_user_id ON public.campaign_users USING btree (user_id);


--
-- Name: index_campaigns_on_default_idp_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaigns_on_default_idp_template_id ON public.campaigns USING btree (default_idp_template_id);


--
-- Name: index_campaigns_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaigns_on_project_id ON public.campaigns USING btree (project_id);


--
-- Name: index_campaigns_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaigns_on_tenant_id ON public.campaigns USING btree (tenant_id);


--
-- Name: index_client_ai_assistants_on_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_ai_assistants_on_ai_assistant_id ON public.client_ai_assistants USING btree (ai_assistant_id);


--
-- Name: index_client_ai_assistants_on_license_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_ai_assistants_on_license_id ON public.client_ai_assistants USING btree (license_id);


--
-- Name: index_client_ai_assistants_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_ai_assistants_on_tenant_id ON public.client_ai_assistants USING btree (tenant_id);


--
-- Name: index_client_auditlog_export_settings_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_auditlog_export_settings_on_client_id ON public.client_auditlog_export_settings USING btree (client_id);


--
-- Name: index_client_auditlog_export_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_auditlog_export_settings_on_tenant_id ON public.client_auditlog_export_settings USING btree (tenant_id);


--
-- Name: index_client_features_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_features_on_client_id ON public.client_features USING btree (client_id);


--
-- Name: index_client_features_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_features_on_tenant_id ON public.client_features USING btree (tenant_id);


--
-- Name: index_client_privacy_settings_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_privacy_settings_on_client_id ON public.client_privacy_settings USING btree (client_id);


--
-- Name: index_client_privacy_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_privacy_settings_on_tenant_id ON public.client_privacy_settings USING btree (tenant_id);


--
-- Name: index_client_sso_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_client_sso_settings_on_tenant_id ON public.client_sso_settings USING btree (tenant_id);


--
-- Name: index_client_t18n_tables_on_client_id_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_client_t18n_tables_on_client_id_and_locale ON public.client_translations USING btree (client_id, locale);


--
-- Name: index_client_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_translations_on_locale ON public.client_translations USING btree (locale);


--
-- Name: index_client_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_translations_on_tenant_id ON public.client_translations USING btree (tenant_id);


--
-- Name: index_clients_on_ancestry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_ancestry ON public.clients USING btree (ancestry);


--
-- Name: index_clients_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_created_by_id ON public.clients USING btree (created_by_id);


--
-- Name: index_clients_on_end_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_end_level ON public.clients USING btree (end_level);


--
-- Name: index_clients_on_modified_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_modified_by_id ON public.clients USING btree (modified_by_id);


--
-- Name: index_clients_on_project_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_project_manager_id ON public.clients USING btree (project_manager_id);


--
-- Name: index_clients_on_subdomain; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_clients_on_subdomain ON public.clients USING btree (subdomain);


--
-- Name: index_clients_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_tenant_id ON public.clients USING btree (tenant_id);


--
-- Name: index_clients_on_tte_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_tte_id ON public.clients USING btree (tte_id);


--
-- Name: index_clients_report_families_on_client_id_and_report_family_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_report_families_on_client_id_and_report_family_id ON public.clients_report_families USING btree (client_id, report_family_id);


--
-- Name: index_clients_reports_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_reports_on_client_id ON public.clients_reports USING btree (client_id);


--
-- Name: index_clients_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_reports_on_report_id ON public.clients_reports USING btree (report_id);


--
-- Name: index_communication_cc_users_on_communication_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_cc_users_on_communication_id ON public.communication_cc_users USING btree (communication_id);


--
-- Name: index_communication_cc_users_on_communication_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_communication_cc_users_on_communication_id_and_user_id ON public.communication_cc_users USING btree (communication_id, user_id);


--
-- Name: index_communication_cc_users_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_cc_users_on_tenant_id ON public.communication_cc_users USING btree (tenant_id);


--
-- Name: index_communication_cc_users_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_cc_users_on_user_id ON public.communication_cc_users USING btree (user_id);


--
-- Name: index_communication_email_resources_on_communication_email_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_email_resources_on_communication_email_id ON public.communication_email_resources USING btree (communication_email_id);


--
-- Name: index_communication_email_resources_on_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_email_resources_on_resource ON public.communication_email_resources USING btree (resource_type, resource_id);


--
-- Name: index_communication_email_resources_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_email_resources_on_tenant_id ON public.communication_email_resources USING btree (tenant_id);


--
-- Name: index_communication_emails_on_campaign_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_campaign_user_id ON public.communication_emails USING btree (campaign_user_id);


--
-- Name: index_communication_emails_on_communication_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_communication_id ON public.communication_emails USING btree (communication_id);


--
-- Name: index_communication_emails_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_membership_id ON public.communication_emails USING btree (membership_id);


--
-- Name: index_communication_emails_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_tenant_id ON public.communication_emails USING btree (tenant_id);


--
-- Name: index_communication_emails_on_workshop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_workshop_id ON public.communication_emails USING btree (workshop_id);


--
-- Name: index_communication_emails_on_workshop_invite_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_workshop_invite_id ON public.communication_emails USING btree (workshop_invite_id);


--
-- Name: index_communication_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_translations_on_locale ON public.communication_translations USING btree (locale);


--
-- Name: index_communication_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_translations_on_tenant_id ON public.communication_translations USING btree (tenant_id);


--
-- Name: index_communications_assessments_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_assessments_on_assessment_id ON public.communications_assessments USING btree (assessment_id);


--
-- Name: index_communications_assessments_on_communication_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_assessments_on_communication_id ON public.communications_assessments USING btree (communication_id);


--
-- Name: index_communications_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_assessments_on_tenant_id ON public.communications_assessments USING btree (tenant_id);


--
-- Name: index_communications_copy_memberships; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_copy_memberships ON public.communications_copy_memberships USING btree (communication_id, membership_id);


--
-- Name: index_communications_copy_memberships_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_copy_memberships_on_tenant_id ON public.communications_copy_memberships USING btree (tenant_id);


--
-- Name: index_communications_memberships; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_memberships ON public.communications_memberships USING btree (communication_id, membership_id);


--
-- Name: index_communications_memberships_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_memberships_on_tenant_id ON public.communications_memberships USING btree (tenant_id);


--
-- Name: index_communications_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_assessment_id ON public.communications USING btree (assessment_id);


--
-- Name: index_communications_on_campaign_assessment_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_campaign_assessment_group_id ON public.communications USING btree (campaign_assessment_group_id);


--
-- Name: index_communications_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_campaign_id ON public.communications USING btree (campaign_id);


--
-- Name: index_communications_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_client_id ON public.communications USING btree (client_id);


--
-- Name: index_communications_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_created_by_id ON public.communications USING btree (created_by_id);


--
-- Name: index_communications_on_end_level_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_end_level_id ON public.communications USING btree (end_level_id);


--
-- Name: index_communications_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_project_id ON public.communications USING btree (project_id);


--
-- Name: index_communications_on_sub_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_sub_campaign_id ON public.communications USING btree (sub_campaign_id);


--
-- Name: index_communications_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_tenant_id ON public.communications USING btree (tenant_id);


--
-- Name: index_communications_on_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_updated_by_id ON public.communications USING btree (updated_by_id);


--
-- Name: index_communications_users_on_communication_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_users_on_communication_id ON public.communications_users USING btree (communication_id);


--
-- Name: index_communications_users_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_users_on_tenant_id ON public.communications_users USING btree (tenant_id);


--
-- Name: index_communications_users_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_users_on_user_id ON public.communications_users USING btree (user_id);


--
-- Name: index_course_schedules_on_development_action_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_course_schedules_on_development_action_id ON public.course_schedules USING btree (development_action_id);


--
-- Name: index_d7f2c041d1fd872ae4c401b79ce81a4ed229f121; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_d7f2c041d1fd872ae4c401b79ce81a4ed229f121 ON public.communication_translations USING btree (communication_id, locale);


--
-- Name: index_dashboards_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_dashboards_on_campaign_id ON public.dashboards USING btree (campaign_id);


--
-- Name: index_dashboards_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_dashboards_on_tenant_id ON public.dashboards USING btree (tenant_id);


--
-- Name: index_data_report_jobs_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_data_report_jobs_on_tenant_id ON public.data_report_jobs USING btree (tenant_id);


--
-- Name: index_data_reports_on_report_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_data_reports_on_report_type ON public.data_reports USING btree (report_type);


--
-- Name: index_data_reports_on_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_data_reports_on_scope ON public.data_reports USING btree (scope);


--
-- Name: index_data_reports_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_data_reports_on_tenant_id ON public.data_reports USING btree (tenant_id);


--
-- Name: index_datasheet_column_preferences_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_datasheet_column_preferences_on_tenant_id ON public.datasheet_column_preferences USING btree (tenant_id);


--
-- Name: index_dd1550fac3e20f3c72e929b92570e38fc03f70a8; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_dd1550fac3e20f3c72e929b92570e38fc03f70a8 ON public.campaign_option_translations USING btree (campaign_option_id, locale);


--
-- Name: index_design_settings_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_design_settings_on_client_id ON public.design_settings USING btree (client_id);


--
-- Name: index_design_settings_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_design_settings_on_project_id ON public.design_settings USING btree (project_id);


--
-- Name: index_design_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_design_settings_on_tenant_id ON public.design_settings USING btree (tenant_id);


--
-- Name: index_development_action_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_development_action_translations_on_locale ON public.development_action_translations USING btree (locale);


--
-- Name: index_development_action_translations_on_name_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_development_action_translations_on_name_and_locale ON public.development_action_translations USING btree (name, locale);


--
-- Name: index_development_action_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_development_action_translations_on_tenant_id ON public.development_action_translations USING btree (tenant_id);


--
-- Name: index_development_actions_on_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_development_actions_on_owner ON public.development_actions USING btree (owner_type, owner_id);


--
-- Name: index_development_actions_on_source_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_development_actions_on_source_type ON public.development_actions USING btree (source_type);


--
-- Name: index_development_actions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_development_actions_on_tenant_id ON public.development_actions USING btree (tenant_id);


--
-- Name: index_dimensions_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_dimensions_on_created_by_id ON public.dimensions USING btree (created_by_id);


--
-- Name: index_dimensions_on_default_occupation_condition_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_dimensions_on_default_occupation_condition_set_id ON public.dimensions USING btree (default_occupation_condition_set_id);


--
-- Name: index_dimensions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_dimensions_on_tenant_id ON public.dimensions USING btree (tenant_id);


--
-- Name: index_dimensions_on_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_dimensions_on_updated_by_id ON public.dimensions USING btree (updated_by_id);


--
-- Name: index_email_templates_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_templates_on_campaign_id ON public.email_templates USING btree (campaign_id);


--
-- Name: index_event_deliveries_on_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_event_deliveries_on_resource ON public.event_deliveries USING btree (resource_type, resource_id);


--
-- Name: index_factor_benchmark_scores_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factor_benchmark_scores_on_assessment_id ON public.factor_benchmark_scores USING btree (assessment_id);


--
-- Name: index_factor_benchmark_scores_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factor_benchmark_scores_on_campaign_id ON public.factor_benchmark_scores USING btree (campaign_id);


--
-- Name: index_factor_benchmark_scores_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factor_benchmark_scores_on_factor_id ON public.factor_benchmark_scores USING btree (factor_id);


--
-- Name: index_factor_benchmark_scores_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factor_benchmark_scores_on_tenant_id ON public.factor_benchmark_scores USING btree (tenant_id);


--
-- Name: index_factor_translations_on_description_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factor_translations_on_description_and_locale ON public.factor_translations USING btree (description, locale);


--
-- Name: index_factor_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factor_translations_on_locale ON public.factor_translations USING btree (locale);


--
-- Name: index_factor_translations_on_name_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factor_translations_on_name_and_locale ON public.factor_translations USING btree (name, locale);


--
-- Name: index_factor_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factor_translations_on_tenant_id ON public.factor_translations USING btree (tenant_id);


--
-- Name: index_factors_aliases_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_aliases_on_factor_id ON public.factors_aliases USING btree (factor_id);


--
-- Name: index_factors_aliases_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_aliases_on_report_id ON public.factors_aliases USING btree (report_id);


--
-- Name: index_factors_aliases_on_report_id_and_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_factors_aliases_on_report_id_and_factor_id ON public.factors_aliases USING btree (report_id, factor_id);


--
-- Name: index_factors_aliases_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_aliases_on_tenant_id ON public.factors_aliases USING btree (tenant_id);


--
-- Name: index_factors_norms_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_norms_on_factor_id ON public.factors_norms USING btree (factor_id);


--
-- Name: index_factors_norms_on_norm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_norms_on_norm_id ON public.factors_norms USING btree (norm_id);


--
-- Name: index_factors_norms_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_norms_on_tenant_id ON public.factors_norms USING btree (tenant_id);


--
-- Name: index_factors_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_on_dimension_id ON public.factors USING btree (dimension_id);


--
-- Name: index_factors_on_factor_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_on_factor_type ON public.factors USING btree (factor_type);


--
-- Name: index_factors_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_on_parent_id ON public.factors USING btree (parent_id);


--
-- Name: index_factors_on_skill_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_factors_on_skill_id ON public.factors USING btree (skill_id) WHERE (skill_id IS NOT NULL);


--
-- Name: index_factors_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_on_tenant_id ON public.factors USING btree (tenant_id);


--
-- Name: index_factors_scoring_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_assessment_id ON public.factors_scoring USING btree (assessment_id);


--
-- Name: index_factors_scoring_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_factor_id ON public.factors_scoring USING btree (factor_id);


--
-- Name: index_factors_scoring_on_factor_question_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_factors_scoring_on_factor_question_assessment_id ON public.factors_scoring USING btree (factor_id, question_id, assessment_id);


--
-- Name: index_factors_scoring_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_question_id ON public.factors_scoring USING btree (question_id);


--
-- Name: index_factors_scoring_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_tenant_id ON public.factors_scoring USING btree (tenant_id);


--
-- Name: index_factors_sub_factors_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_sub_factors_on_factor_id ON public.factors_sub_factors USING btree (factor_id);


--
-- Name: index_factors_sub_factors_on_sub_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_sub_factors_on_sub_factor_id ON public.factors_sub_factors USING btree (sub_factor_id);


--
-- Name: index_factors_sub_factors_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_sub_factors_on_tenant_id ON public.factors_sub_factors USING btree (tenant_id);


--
-- Name: index_highlights_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_highlights_on_assessment_id ON public.highlights USING btree (assessment_id);


--
-- Name: index_highlights_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_highlights_on_tenant_id ON public.highlights USING btree (tenant_id);


--
-- Name: index_highlights_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_highlights_on_user_id ON public.highlights USING btree (user_id);


--
-- Name: index_hogan_credentials_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_hogan_credentials_on_membership_id ON public.hogan_credentials USING btree (membership_id);


--
-- Name: index_hogan_credentials_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_hogan_credentials_on_tenant_id ON public.hogan_credentials USING btree (tenant_id);


--
-- Name: index_hogan_credentials_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_hogan_credentials_on_user_id ON public.hogan_credentials USING btree (user_id);


--
-- Name: index_hogan_logs_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_hogan_logs_on_tenant_id ON public.hogan_logs USING btree (tenant_id);


--
-- Name: index_hogan_report_settings_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_hogan_report_settings_on_report_id ON public.hogan_report_settings USING btree (report_id);


--
-- Name: index_hogan_report_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_hogan_report_settings_on_tenant_id ON public.hogan_report_settings USING btree (tenant_id);


--
-- Name: index_idp_report_pdfs_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_report_pdfs_on_tenant_id ON public.idp_report_pdfs USING btree (tenant_id);


--
-- Name: index_idp_report_pdfs_on_user_idp_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_report_pdfs_on_user_idp_plan_id ON public.idp_report_pdfs USING btree (user_idp_plan_id);


--
-- Name: index_idp_settings_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_settings_on_project_id ON public.idp_settings USING btree (project_id);


--
-- Name: index_idp_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_settings_on_tenant_id ON public.idp_settings USING btree (tenant_id);


--
-- Name: index_idp_template_development_actions_on_idp_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_development_actions_on_idp_template_id ON public.idp_template_development_actions USING btree (idp_template_id);


--
-- Name: index_idp_template_development_actions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_development_actions_on_tenant_id ON public.idp_template_development_actions USING btree (tenant_id);


--
-- Name: index_idp_template_interview_questions_on_idp_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_interview_questions_on_idp_template_id ON public.idp_template_interview_questions USING btree (idp_template_id);


--
-- Name: index_idp_template_interview_questions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_interview_questions_on_tenant_id ON public.idp_template_interview_questions USING btree (tenant_id);


--
-- Name: index_idp_template_reflection_questions_on_idp_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_reflection_questions_on_idp_template_id ON public.idp_template_reflection_questions USING btree (idp_template_id);


--
-- Name: index_idp_template_reflection_questions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_reflection_questions_on_tenant_id ON public.idp_template_reflection_questions USING btree (tenant_id);


--
-- Name: index_idp_template_skills_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_skills_on_assessment_id ON public.idp_template_skills USING btree (assessment_id);


--
-- Name: index_idp_template_skills_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_skills_on_factor_id ON public.idp_template_skills USING btree (factor_id);


--
-- Name: index_idp_template_skills_on_idp_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_skills_on_idp_template_id ON public.idp_template_skills USING btree (idp_template_id);


--
-- Name: index_idp_template_skills_on_skill_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_skills_on_skill_id ON public.idp_template_skills USING btree (skill_id);


--
-- Name: index_idp_template_skills_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_skills_on_tenant_id ON public.idp_template_skills USING btree (tenant_id);


--
-- Name: index_idp_template_translations_on_idp_template_id_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_idp_template_translations_on_idp_template_id_and_locale ON public.idp_template_translations USING btree (idp_template_id, locale);


--
-- Name: index_idp_template_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_translations_on_locale ON public.idp_template_translations USING btree (locale);


--
-- Name: index_idp_template_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_template_translations_on_tenant_id ON public.idp_template_translations USING btree (tenant_id);


--
-- Name: index_idp_templates_on_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_templates_on_ai_assistant_id ON public.idp_templates USING btree (ai_assistant_id);


--
-- Name: index_idp_templates_on_document_analysis_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_templates_on_document_analysis_ai_assistant_id ON public.idp_templates USING btree (document_analysis_ai_assistant_id);


--
-- Name: index_idp_templates_on_one_click_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_templates_on_one_click_ai_assistant_id ON public.idp_templates USING btree (one_click_ai_assistant_id);


--
-- Name: index_idp_templates_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_templates_on_project_id ON public.idp_templates USING btree (project_id);


--
-- Name: index_idp_templates_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_templates_on_report_id ON public.idp_templates USING btree (report_id);


--
-- Name: index_idp_templates_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_idp_templates_on_tenant_id ON public.idp_templates USING btree (tenant_id);


--
-- Name: index_iiht_user_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_iiht_user_assessments_on_tenant_id ON public.iiht_user_assessments USING btree (tenant_id);


--
-- Name: index_iiht_user_assessments_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_iiht_user_assessments_on_user_assessment_id ON public.iiht_user_assessments USING btree (user_assessment_id);


--
-- Name: index_innovation_styles_factors_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_innovation_styles_factors_on_factor_id ON public.innovation_styles_factors USING btree (factor_id);


--
-- Name: index_innovation_styles_factors_on_innovation_style_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_innovation_styles_factors_on_innovation_style_id ON public.innovation_styles_factors USING btree (innovation_style_id);


--
-- Name: index_innovation_styles_factors_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_innovation_styles_factors_on_tenant_id ON public.innovation_styles_factors USING btree (tenant_id);


--
-- Name: index_innovation_styles_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_innovation_styles_on_dimension_id ON public.innovation_styles USING btree (dimension_id);


--
-- Name: index_innovation_styles_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_innovation_styles_on_tenant_id ON public.innovation_styles USING btree (tenant_id);


--
-- Name: index_integrations_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_integrations_on_project_id ON public.integrations USING btree (project_id);


--
-- Name: index_integrations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_integrations_on_tenant_id ON public.integrations USING btree (tenant_id);


--
-- Name: index_interview_questions_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_interview_questions_on_project_id ON public.interview_questions USING btree (project_id);


--
-- Name: index_interview_questions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_interview_questions_on_tenant_id ON public.interview_questions USING btree (tenant_id);


--
-- Name: index_job_groups_on_ancestry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_groups_on_ancestry ON public.job_groups USING btree (ancestry);


--
-- Name: index_job_groups_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_groups_on_project_id ON public.job_groups USING btree (project_id);


--
-- Name: index_job_groups_on_project_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_job_groups_on_project_id_and_name ON public.job_groups USING btree (project_id, name);


--
-- Name: index_job_groups_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_groups_on_tenant_id ON public.job_groups USING btree (tenant_id);


--
-- Name: index_job_role_translations_on_description_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_role_translations_on_description_and_locale ON public.job_role_translations USING btree (description, locale);


--
-- Name: index_job_role_translations_on_job_role_id_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_job_role_translations_on_job_role_id_and_locale ON public.job_role_translations USING btree (job_role_id, locale);


--
-- Name: index_job_role_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_role_translations_on_locale ON public.job_role_translations USING btree (locale);


--
-- Name: index_job_role_translations_on_name_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_role_translations_on_name_and_locale ON public.job_role_translations USING btree (name, locale);


--
-- Name: index_job_role_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_role_translations_on_tenant_id ON public.job_role_translations USING btree (tenant_id);


--
-- Name: index_job_roles_on_code_and_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_job_roles_on_code_and_project_id ON public.job_roles USING btree (code, project_id);


--
-- Name: index_job_roles_on_job_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_roles_on_job_group_id ON public.job_roles USING btree (job_group_id);


--
-- Name: index_job_roles_on_name_and_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_job_roles_on_name_and_project_id ON public.job_roles USING btree (name, project_id);


--
-- Name: index_job_roles_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_roles_on_project_id ON public.job_roles USING btree (project_id);


--
-- Name: index_job_roles_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_job_roles_on_tenant_id ON public.job_roles USING btree (tenant_id);


--
-- Name: index_libraries_on_ancestry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_ancestry ON public.libraries USING btree (ancestry);


--
-- Name: index_libraries_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_created_by_id ON public.libraries USING btree (created_by_id);


--
-- Name: index_libraries_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_tenant_id ON public.libraries USING btree (tenant_id);


--
-- Name: index_libraries_on_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_updated_by_id ON public.libraries USING btree (updated_by_id);


--
-- Name: index_license_usages_on_assigns_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_assigns_report_id ON public.license_usages USING btree (assigns_report_id);


--
-- Name: index_license_usages_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_campaign_id ON public.license_usages USING btree (campaign_id);


--
-- Name: index_license_usages_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_client_id ON public.license_usages USING btree (client_id);


--
-- Name: index_license_usages_on_license_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_license_id ON public.license_usages USING btree (license_id);


--
-- Name: index_license_usages_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_project_id ON public.license_usages USING btree (project_id);


--
-- Name: index_license_usages_on_project_license_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_project_license_id ON public.license_usages USING btree (project_license_id);


--
-- Name: index_license_usages_on_registration_code_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_registration_code_id ON public.license_usages USING btree (registration_code_id);


--
-- Name: index_license_usages_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_tenant_id ON public.license_usages USING btree (tenant_id);


--
-- Name: index_license_usages_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_user_id ON public.license_usages USING btree (user_id);


--
-- Name: index_licenses_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_licenses_on_client_id ON public.licenses USING btree (client_id);


--
-- Name: index_licenses_on_client_id_and_report_family_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_licenses_on_client_id_and_report_family_id ON public.licenses USING btree (client_id, report_family_id);


--
-- Name: index_licenses_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_licenses_on_tenant_id ON public.licenses USING btree (tenant_id);


--
-- Name: index_lti_oauth2_access_tokens_on_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_lti_oauth2_access_tokens_on_expires_at ON public.lti_oauth2_access_tokens USING btree (expires_at);


--
-- Name: index_lti_oauth2_access_tokens_on_integration_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_lti_oauth2_access_tokens_on_integration_id ON public.lti_oauth2_access_tokens USING btree (integration_id);


--
-- Name: index_lti_oauth2_access_tokens_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_lti_oauth2_access_tokens_on_project_id ON public.lti_oauth2_access_tokens USING btree (project_id);


--
-- Name: index_lti_oauth2_access_tokens_on_project_id_and_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_lti_oauth2_access_tokens_on_project_id_and_expires_at ON public.lti_oauth2_access_tokens USING btree (project_id, expires_at);


--
-- Name: index_lti_oauth2_access_tokens_on_token_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_lti_oauth2_access_tokens_on_token_hash ON public.lti_oauth2_access_tokens USING btree (token_hash);


--
-- Name: index_maintenance_settings_on_sub_system; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_maintenance_settings_on_sub_system ON public.maintenance_settings USING btree (sub_system);


--
-- Name: index_media_responses_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_media_responses_on_question_id ON public.media_responses USING btree (question_id);


--
-- Name: index_media_responses_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_media_responses_on_tenant_id ON public.media_responses USING btree (tenant_id);


--
-- Name: index_media_responses_on_users_result_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_media_responses_on_users_result_id ON public.media_responses USING btree (users_result_id);


--
-- Name: index_meeting_recordings_on_meeting_room_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_meeting_recordings_on_meeting_room_id ON public.meeting_recordings USING btree (meeting_room_id);


--
-- Name: index_meeting_recordings_on_meeting_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_meeting_recordings_on_meeting_session_id ON public.meeting_recordings USING btree (meeting_session_id);


--
-- Name: index_meeting_recordings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_meeting_recordings_on_tenant_id ON public.meeting_recordings USING btree (tenant_id);


--
-- Name: index_meeting_rooms_on_meetable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_meeting_rooms_on_meetable ON public.meeting_rooms USING btree (meetable_type, meetable_id);


--
-- Name: index_meeting_rooms_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_meeting_rooms_on_tenant_id ON public.meeting_rooms USING btree (tenant_id);


--
-- Name: index_membership_grants_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_membership_grants_on_membership_id ON public.membership_grants USING btree (membership_id);


--
-- Name: index_membership_grants_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_membership_grants_on_tenant_id ON public.membership_grants USING btree (tenant_id);


--
-- Name: index_memberships_admin_roles_on_admin_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_admin_roles_on_admin_role_id ON public.memberships_admin_roles USING btree (admin_role_id);


--
-- Name: index_memberships_admin_roles_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_admin_roles_on_membership_id ON public.memberships_admin_roles USING btree (membership_id);


--
-- Name: index_memberships_admin_roles_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_admin_roles_on_tenant_id ON public.memberships_admin_roles USING btree (tenant_id);


--
-- Name: index_memberships_on_ancestry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_ancestry ON public.memberships USING btree (ancestry);


--
-- Name: index_memberships_on_assigns_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_assigns_completed ON public.memberships USING btree (assigns_completed);


--
-- Name: index_memberships_on_assigns_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_assigns_count ON public.memberships USING btree (assigns_count);


--
-- Name: index_memberships_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_campaign_id ON public.memberships USING btree (campaign_id);


--
-- Name: index_memberships_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_client_id ON public.memberships USING btree (client_id);


--
-- Name: index_memberships_on_hris; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_hris ON public.memberships USING gin (hris);


--
-- Name: index_memberships_on_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_role ON public.memberships USING btree (role);


--
-- Name: index_memberships_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_tenant_id ON public.memberships USING btree (tenant_id);


--
-- Name: index_memberships_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_user_id ON public.memberships USING btree (user_id);


--
-- Name: index_mettl_assessments_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_mettl_assessments_on_product_id ON public.mettl_assessments USING btree (product_id);


--
-- Name: index_mettl_assessments_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mettl_assessments_on_project_id ON public.mettl_assessments USING btree (project_id);


--
-- Name: index_mettl_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mettl_assessments_on_tenant_id ON public.mettl_assessments USING btree (tenant_id);


--
-- Name: index_mettl_schedule_records_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mettl_schedule_records_on_assessment_id ON public.mettl_schedule_records USING btree (assessment_id);


--
-- Name: index_mettl_schedule_records_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mettl_schedule_records_on_project_id ON public.mettl_schedule_records USING btree (project_id);


--
-- Name: index_mettl_schedule_records_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mettl_schedule_records_on_tenant_id ON public.mettl_schedule_records USING btree (tenant_id);


--
-- Name: index_mettl_user_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mettl_user_assessments_on_tenant_id ON public.mettl_user_assessments USING btree (tenant_id);


--
-- Name: index_mettl_user_assessments_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mettl_user_assessments_on_user_assessment_id ON public.mettl_user_assessments USING btree (user_assessment_id);


--
-- Name: index_mhs_user_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mhs_user_assessments_on_tenant_id ON public.mhs_user_assessments USING btree (tenant_id);


--
-- Name: index_mhs_user_assessments_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mhs_user_assessments_on_user_assessment_id ON public.mhs_user_assessments USING btree (user_assessment_id);


--
-- Name: index_microsite_assessments_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_microsite_assessments_on_product_id ON public.microsite_assessments USING btree (product_id);


--
-- Name: index_microsite_assessments_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_microsite_assessments_on_project_id ON public.microsite_assessments USING btree (project_id);


--
-- Name: index_microsite_user_assessments_on_participant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_microsite_user_assessments_on_participant_id ON public.microsite_user_assessments USING btree (participant_id);


--
-- Name: index_microsite_user_assessments_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_microsite_user_assessments_on_user_assessment_id ON public.microsite_user_assessments USING btree (user_assessment_id);


--
-- Name: index_norms_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_norms_on_dimension_id ON public.norms USING btree (dimension_id);


--
-- Name: index_norms_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_norms_on_tenant_id ON public.norms USING btree (tenant_id);


--
-- Name: index_notifications_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_assessment_id ON public.notifications USING btree (assessment_id);


--
-- Name: index_notifications_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_membership_id ON public.notifications USING btree (membership_id);


--
-- Name: index_notifications_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_tenant_id ON public.notifications USING btree (tenant_id);


--
-- Name: index_occupation_condition_sets_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupation_condition_sets_on_dimension_id ON public.occupation_condition_sets USING btree (dimension_id);


--
-- Name: index_occupation_condition_sets_on_dimension_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_occupation_condition_sets_on_dimension_id_and_name ON public.occupation_condition_sets USING btree (dimension_id, name);


--
-- Name: index_occupation_condition_sets_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupation_condition_sets_on_tenant_id ON public.occupation_condition_sets USING btree (tenant_id);


--
-- Name: index_occupations_factors_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_factors_on_factor_id ON public.occupations_factors USING btree (factor_id);


--
-- Name: index_occupations_factors_on_occupation_condition_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_factors_on_occupation_condition_set_id ON public.occupations_factors USING btree (occupation_condition_set_id);


--
-- Name: index_occupations_factors_on_occupation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_factors_on_occupation_id ON public.occupations_factors USING btree (occupation_id);


--
-- Name: index_occupations_factors_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_factors_on_tenant_id ON public.occupations_factors USING btree (tenant_id);


--
-- Name: index_occupations_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_on_dimension_id ON public.occupations USING btree (dimension_id);


--
-- Name: index_occupations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_on_tenant_id ON public.occupations USING btree (tenant_id);


--
-- Name: index_oracle_credentials_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_oracle_credentials_on_user_id ON public.oracle_credentials USING btree (user_id);


--
-- Name: index_password_archivable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_password_archivable ON public.old_passwords USING btree (password_archivable_type, password_archivable_id);


--
-- Name: index_pearson_user_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_pearson_user_assessments_on_tenant_id ON public.pearson_user_assessments USING btree (tenant_id);


--
-- Name: index_pearson_user_assessments_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_pearson_user_assessments_on_user_assessment_id ON public.pearson_user_assessments USING btree (user_assessment_id);


--
-- Name: index_platform_exceptions_on_identifier; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_platform_exceptions_on_identifier ON public.platform_exceptions USING btree (identifier);


--
-- Name: index_platform_exceptions_on_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_platform_exceptions_on_resource ON public.platform_exceptions USING btree (resource_type, resource_id);


--
-- Name: index_power_bi_settings_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_power_bi_settings_on_project_id ON public.power_bi_settings USING btree (project_id);


--
-- Name: index_power_bi_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_power_bi_settings_on_tenant_id ON public.power_bi_settings USING btree (tenant_id);


--
-- Name: index_privacy_consents_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_consents_on_assessment_id ON public.privacy_consents USING btree (assessment_id);


--
-- Name: index_privacy_consents_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_consents_on_campaign_id ON public.privacy_consents USING btree (campaign_id);


--
-- Name: index_privacy_consents_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_consents_on_membership_id ON public.privacy_consents USING btree (membership_id);


--
-- Name: index_privacy_consents_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_consents_on_tenant_id ON public.privacy_consents USING btree (tenant_id);


--
-- Name: index_privacy_consents_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_consents_on_user_id ON public.privacy_consents USING btree (user_id);


--
-- Name: index_privacy_links_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_links_on_client_id ON public.privacy_links USING btree (client_id);


--
-- Name: index_privacy_setting_t18n_on_privacy_setting_id_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_privacy_setting_t18n_on_privacy_setting_id_and_locale ON public.privacy_setting_translations USING btree (privacy_setting_id, locale);


--
-- Name: index_privacy_setting_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_setting_translations_on_locale ON public.privacy_setting_translations USING btree (locale);


--
-- Name: index_privacy_setting_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_setting_translations_on_tenant_id ON public.privacy_setting_translations USING btree (tenant_id);


--
-- Name: index_privacy_settings_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_settings_on_project_id ON public.privacy_settings USING btree (project_id);


--
-- Name: index_privacy_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_settings_on_tenant_id ON public.privacy_settings USING btree (tenant_id);


--
-- Name: index_proctoring_sessions_on_campaign_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proctoring_sessions_on_campaign_user_id ON public.proctoring_sessions USING btree (campaign_user_id);


--
-- Name: index_proctoring_sessions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proctoring_sessions_on_tenant_id ON public.proctoring_sessions USING btree (tenant_id);


--
-- Name: index_proctoring_sessions_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proctoring_sessions_on_user_assessment_id ON public.proctoring_sessions USING btree (user_assessment_id);


--
-- Name: index_proficiency_level_translations_on_proficiency_level_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proficiency_level_translations_on_proficiency_level_id ON public.proficiency_level_translations USING btree (proficiency_level_id);


--
-- Name: index_proficiency_level_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proficiency_level_translations_on_tenant_id ON public.proficiency_level_translations USING btree (tenant_id);


--
-- Name: index_proficiency_levels_on_proficiency_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proficiency_levels_on_proficiency_type ON public.proficiency_levels USING btree (proficiency_type);


--
-- Name: index_proficiency_levels_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proficiency_levels_on_project_id ON public.proficiency_levels USING btree (project_id);


--
-- Name: index_proficiency_levels_on_skill_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proficiency_levels_on_skill_id ON public.proficiency_levels USING btree (skill_id);


--
-- Name: index_proficiency_levels_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_proficiency_levels_on_tenant_id ON public.proficiency_levels USING btree (tenant_id);


--
-- Name: index_profile_field_values_on_profile_field_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_profile_field_values_on_profile_field_id ON public.profile_field_values USING btree (profile_field_id);


--
-- Name: index_profile_field_values_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_profile_field_values_on_tenant_id ON public.profile_field_values USING btree (tenant_id);


--
-- Name: index_profile_field_values_on_user_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_profile_field_values_on_user_profile_id ON public.profile_field_values USING btree (user_profile_id);


--
-- Name: index_profile_fields_on_profile_setting_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_profile_fields_on_profile_setting_id ON public.profile_fields USING btree (profile_setting_id);


--
-- Name: index_profile_fields_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_profile_fields_on_question_id ON public.profile_fields USING btree (question_id);


--
-- Name: index_profile_fields_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_profile_fields_on_tenant_id ON public.profile_fields USING btree (tenant_id);


--
-- Name: index_profile_settings_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_profile_settings_on_project_id ON public.profile_settings USING btree (project_id);


--
-- Name: index_profile_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_profile_settings_on_tenant_id ON public.profile_settings USING btree (tenant_id);


--
-- Name: index_project_assessments_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_assessments_on_assessment_id ON public.project_assessments USING btree (assessment_id);


--
-- Name: index_project_assessments_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_assessments_on_project_id ON public.project_assessments USING btree (project_id);


--
-- Name: index_project_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_assessments_on_tenant_id ON public.project_assessments USING btree (tenant_id);


--
-- Name: index_project_features_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_project_features_on_project_id ON public.project_features USING btree (project_id);


--
-- Name: index_project_features_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_features_on_tenant_id ON public.project_features USING btree (tenant_id);


--
-- Name: index_project_licenses_on_license_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_licenses_on_license_id ON public.project_licenses USING btree (license_id);


--
-- Name: index_project_licenses_on_license_id_and_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_project_licenses_on_license_id_and_project_id ON public.project_licenses USING btree (license_id, project_id);


--
-- Name: index_project_licenses_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_licenses_on_project_id ON public.project_licenses USING btree (project_id);


--
-- Name: index_project_licenses_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_licenses_on_tenant_id ON public.project_licenses USING btree (tenant_id);


--
-- Name: index_question_recoding_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_question_recoding_on_assessment_id ON public.question_recoding USING btree (assessment_id);


--
-- Name: index_question_recoding_on_question_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_question_recoding_on_question_assessment_id ON public.question_recoding USING btree (question_id, assessment_id);


--
-- Name: index_question_recoding_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_question_recoding_on_question_id ON public.question_recoding USING btree (question_id);


--
-- Name: index_question_recoding_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_question_recoding_on_tenant_id ON public.question_recoding USING btree (tenant_id);


--
-- Name: index_questions_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_assessment_id ON public.questions USING btree (assessment_id);


--
-- Name: index_questions_on_block_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_block_id ON public.questions USING btree (block_id);


--
-- Name: index_questions_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_created_by_id ON public.questions USING btree (created_by_id);


--
-- Name: index_questions_on_skill_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_questions_on_skill_id ON public.questions USING btree (skill_id) WHERE (skill_id IS NOT NULL);


--
-- Name: index_questions_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_template_id ON public.questions USING btree (template_id);


--
-- Name: index_questions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_tenant_id ON public.questions USING btree (tenant_id);


--
-- Name: index_questions_on_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_updated_by_id ON public.questions USING btree (updated_by_id);


--
-- Name: index_reflection_question_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reflection_question_translations_on_tenant_id ON public.reflection_question_translations USING btree (tenant_id);


--
-- Name: index_reflection_questions_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reflection_questions_on_project_id ON public.reflection_questions USING btree (project_id);


--
-- Name: index_reflection_questions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reflection_questions_on_tenant_id ON public.reflection_questions USING btree (tenant_id);


--
-- Name: index_registration_codes_on_project_id_and_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_registration_codes_on_project_id_and_code ON public.registration_codes USING btree (project_id, code);


--
-- Name: index_registration_codes_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_registration_codes_on_tenant_id ON public.registration_codes USING btree (tenant_id);


--
-- Name: index_registration_settings_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_registration_settings_on_project_id ON public.registration_settings USING btree (project_id);


--
-- Name: index_registration_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_registration_settings_on_tenant_id ON public.registration_settings USING btree (tenant_id);


--
-- Name: index_relationships_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_relationships_on_campaign_id ON public.relationships USING btree (campaign_id);


--
-- Name: index_relationships_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_relationships_on_tenant_id ON public.relationships USING btree (tenant_id);


--
-- Name: index_report_approval_settings_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_approval_settings_on_campaign_id ON public.report_approval_settings USING btree (campaign_id);


--
-- Name: index_report_approval_settings_on_campaign_id_and_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_report_approval_settings_on_campaign_id_and_report_id ON public.report_approval_settings USING btree (campaign_id, report_id);


--
-- Name: index_report_approval_settings_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_approval_settings_on_report_id ON public.report_approval_settings USING btree (report_id);


--
-- Name: index_report_approval_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_approval_settings_on_tenant_id ON public.report_approval_settings USING btree (tenant_id);


--
-- Name: index_report_families_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_families_on_tenant_id ON public.report_families USING btree (tenant_id);


--
-- Name: index_report_families_reports_on_report_family_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_families_reports_on_report_family_id ON public.report_families_reports USING btree (report_family_id);


--
-- Name: index_report_families_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_families_reports_on_report_id ON public.report_families_reports USING btree (report_id);


--
-- Name: index_reports_accesses_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_accesses_on_assessment_id ON public.reports_accesses USING btree (assessment_id);


--
-- Name: index_reports_accesses_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_accesses_on_membership_id ON public.reports_accesses USING btree (membership_id);


--
-- Name: index_reports_accesses_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_accesses_on_report_id ON public.reports_accesses USING btree (report_id);


--
-- Name: index_reports_accesses_on_report_id_membership_id_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_reports_accesses_on_report_id_membership_id_assessment_id ON public.reports_accesses USING btree (report_id, membership_id, assessment_id);


--
-- Name: index_reports_campaign_ai_artifacts_on_ai_assistant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_campaign_ai_artifacts_on_ai_assistant_id ON public.reports_campaign_ai_artifacts USING btree (ai_assistant_id);


--
-- Name: index_reports_campaign_ai_artifacts_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_campaign_ai_artifacts_on_report_id ON public.reports_campaign_ai_artifacts USING btree (report_id);


--
-- Name: index_reports_campaign_ai_artifacts_on_report_id_and_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_reports_campaign_ai_artifacts_on_report_id_and_code ON public.reports_campaign_ai_artifacts USING btree (report_id, code);


--
-- Name: index_reports_campaign_ai_artifacts_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_campaign_ai_artifacts_on_tenant_id ON public.reports_campaign_ai_artifacts USING btree (tenant_id);


--
-- Name: index_reports_campaign_factors_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_campaign_factors_on_report_id ON public.reports_campaign_factors USING btree (report_id);


--
-- Name: index_reports_campaign_factors_on_report_id_and_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_reports_campaign_factors_on_report_id_and_code ON public.reports_campaign_factors USING btree (report_id, code);


--
-- Name: index_reports_campaign_factors_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_campaign_factors_on_tenant_id ON public.reports_campaign_factors USING btree (tenant_id);


--
-- Name: index_reports_filters_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_filters_on_report_id ON public.reports_filters USING btree (report_id);


--
-- Name: index_reports_filters_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_filters_on_tenant_id ON public.reports_filters USING btree (tenant_id);


--
-- Name: index_reports_modules_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_modules_on_assessment_id ON public.reports_modules USING btree (assessment_id);


--
-- Name: index_reports_modules_on_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_modules_on_page_id ON public.reports_modules USING btree (page_id);


--
-- Name: index_reports_modules_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_modules_on_tenant_id ON public.reports_modules USING btree (tenant_id);


--
-- Name: index_reports_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_on_assessment_id ON public.reports USING btree (assessment_id);


--
-- Name: index_reports_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_on_created_by_id ON public.reports USING btree (created_by_id);


--
-- Name: index_reports_on_deleted_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_on_deleted_by_id ON public.reports USING btree (deleted_by_id);


--
-- Name: index_reports_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_on_tenant_id ON public.reports USING btree (tenant_id);


--
-- Name: index_reports_on_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_on_updated_by_id ON public.reports USING btree (updated_by_id);


--
-- Name: index_reports_pages_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_pages_on_report_id ON public.reports_pages USING btree (report_id);


--
-- Name: index_reports_pages_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_pages_on_tenant_id ON public.reports_pages USING btree (tenant_id);


--
-- Name: index_resource_hogan_credentials_on_hogan_credential_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_resource_hogan_credentials_on_hogan_credential_id ON public.resource_hogan_credentials USING btree (hogan_credential_id);


--
-- Name: index_resource_hogan_credentials_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_resource_hogan_credentials_on_tenant_id ON public.resource_hogan_credentials USING btree (tenant_id);


--
-- Name: index_saml_service_providers_on_entity_id_and_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_saml_service_providers_on_entity_id_and_project_id ON public.saml_service_providers USING btree (entity_id, project_id);


--
-- Name: index_saml_service_providers_on_integration_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saml_service_providers_on_integration_type ON public.saml_service_providers USING btree (integration_type);


--
-- Name: index_saml_service_providers_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saml_service_providers_on_project_id ON public.saml_service_providers USING btree (project_id);


--
-- Name: index_saml_service_providers_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saml_service_providers_on_tenant_id ON public.saml_service_providers USING btree (tenant_id);


--
-- Name: index_saml_settings_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saml_settings_on_project_id ON public.saml_settings USING btree (project_id);


--
-- Name: index_saml_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saml_settings_on_tenant_id ON public.saml_settings USING btree (tenant_id);


--
-- Name: index_saville_factors_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saville_factors_on_tenant_id ON public.saville_factors USING btree (tenant_id);


--
-- Name: index_saville_report_settings_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saville_report_settings_on_report_id ON public.saville_report_settings USING btree (report_id);


--
-- Name: index_saville_report_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saville_report_settings_on_tenant_id ON public.saville_report_settings USING btree (tenant_id);


--
-- Name: index_saville_user_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saville_user_assessments_on_tenant_id ON public.saville_user_assessments USING btree (tenant_id);


--
-- Name: index_saville_user_assessments_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_saville_user_assessments_on_user_assessment_id ON public.saville_user_assessments USING btree (user_assessment_id);


--
-- Name: index_security_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_security_settings_on_tenant_id ON public.security_settings USING btree (tenant_id);


--
-- Name: index_sessions_on_impersonator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sessions_on_impersonator_id ON public.sessions USING btree (impersonator_id);


--
-- Name: index_sessions_on_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_sessions_on_session_id ON public.sessions USING btree (session_id);


--
-- Name: index_sessions_on_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sessions_on_updated_at ON public.sessions USING btree (updated_at);


--
-- Name: index_sessions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sessions_on_user_id ON public.sessions USING btree (user_id);


--
-- Name: index_sessions_on_user_id_and_subdomain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sessions_on_user_id_and_subdomain ON public.sessions USING btree (user_id, subdomain);


--
-- Name: index_sheet_columns_on_sheet_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheet_columns_on_sheet_id ON public.sheet_columns USING btree (sheet_id);


--
-- Name: index_sheet_columns_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheet_columns_on_tenant_id ON public.sheet_columns USING btree (tenant_id);


--
-- Name: index_sheet_row_data_on_sheet_row_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheet_row_data_on_sheet_row_id ON public.sheet_row_data USING btree (sheet_row_id);


--
-- Name: index_sheet_row_data_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheet_row_data_on_tenant_id ON public.sheet_row_data USING btree (tenant_id);


--
-- Name: index_sheet_rows_on_sheet_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheet_rows_on_sheet_id ON public.sheet_rows USING btree (sheet_id);


--
-- Name: index_sheet_rows_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheet_rows_on_tenant_id ON public.sheet_rows USING btree (tenant_id);


--
-- Name: index_sheets_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheets_on_campaign_id ON public.sheets USING btree (campaign_id);


--
-- Name: index_sheets_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheets_on_project_id ON public.sheets USING btree (project_id);


--
-- Name: index_sheets_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheets_on_tenant_id ON public.sheets USING btree (tenant_id);


--
-- Name: index_sheets_on_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sheets_on_type ON public.sheets USING btree (type);


--
-- Name: index_shortened_urls_on_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_shortened_urls_on_category ON public.shortened_urls USING btree (category);


--
-- Name: index_shortened_urls_on_owner_id_and_owner_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_shortened_urls_on_owner_id_and_owner_type ON public.shortened_urls USING btree (owner_id, owner_type);


--
-- Name: index_shortened_urls_on_unique_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_shortened_urls_on_unique_key ON public.shortened_urls USING btree (unique_key);


--
-- Name: index_shortened_urls_on_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_shortened_urls_on_url ON public.shortened_urls USING btree (url);


--
-- Name: index_simulation_user_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_simulation_user_assessments_on_tenant_id ON public.simulation_user_assessments USING btree (tenant_id);


--
-- Name: index_simulation_user_assessments_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_simulation_user_assessments_on_user_assessment_id ON public.simulation_user_assessments USING btree (user_assessment_id);


--
-- Name: index_skill_aliases_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_aliases_on_client_id ON public.skill_aliases USING btree (client_id);


--
-- Name: index_skill_aliases_on_skill_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_aliases_on_skill_id ON public.skill_aliases USING btree (skill_id);


--
-- Name: index_skill_aliases_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_aliases_on_tenant_id ON public.skill_aliases USING btree (tenant_id);


--
-- Name: index_skill_groups_on_ancestry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_groups_on_ancestry ON public.skill_groups USING btree (ancestry);


--
-- Name: index_skill_groups_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_groups_on_project_id ON public.skill_groups USING btree (project_id);


--
-- Name: index_skill_groups_on_project_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_skill_groups_on_project_id_and_name ON public.skill_groups USING btree (project_id, name);


--
-- Name: index_skill_groups_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_groups_on_tenant_id ON public.skill_groups USING btree (tenant_id);


--
-- Name: index_skill_translations_on_description_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_translations_on_description_and_locale ON public.skill_translations USING btree (description, locale);


--
-- Name: index_skill_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_translations_on_locale ON public.skill_translations USING btree (locale);


--
-- Name: index_skill_translations_on_name_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_translations_on_name_and_locale ON public.skill_translations USING btree (name, locale);


--
-- Name: index_skill_translations_on_skill_id_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_skill_translations_on_skill_id_and_locale ON public.skill_translations USING btree (skill_id, locale);


--
-- Name: index_skill_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skill_translations_on_tenant_id ON public.skill_translations USING btree (tenant_id);


--
-- Name: index_skills_development_actions_on_development_action_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_development_actions_on_development_action_id ON public.skills_development_actions USING btree (development_action_id);


--
-- Name: index_skills_development_actions_on_skill_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_development_actions_on_skill_id ON public.skills_development_actions USING btree (skill_id);


--
-- Name: index_skills_development_actions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_development_actions_on_tenant_id ON public.skills_development_actions USING btree (tenant_id);


--
-- Name: index_skills_job_roles_on_job_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_job_roles_on_job_role_id ON public.skills_job_roles USING btree (job_role_id);


--
-- Name: index_skills_job_roles_on_job_role_skill_and_project; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_skills_job_roles_on_job_role_skill_and_project ON public.skills_job_roles USING btree (job_role_id, skill_id, project_id);


--
-- Name: index_skills_job_roles_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_job_roles_on_project_id ON public.skills_job_roles USING btree (project_id);


--
-- Name: index_skills_job_roles_on_skill_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_job_roles_on_skill_id ON public.skills_job_roles USING btree (skill_id);


--
-- Name: index_skills_job_roles_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_job_roles_on_tenant_id ON public.skills_job_roles USING btree (tenant_id);


--
-- Name: index_skills_on_name_and_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_skills_on_name_and_project_id ON public.skills USING btree (name, project_id);


--
-- Name: index_skills_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_on_project_id ON public.skills USING btree (project_id);


--
-- Name: index_skills_on_project_id_and_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_skills_on_project_id_and_name ON public.skills USING btree (project_id, name);


--
-- Name: index_skills_on_skill_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_on_skill_group_id ON public.skills USING btree (skill_group_id);


--
-- Name: index_skills_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skills_on_tenant_id ON public.skills USING btree (tenant_id);


--
-- Name: index_skillvue_assessments_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_skillvue_assessments_on_product_id ON public.skillvue_assessments USING btree (product_id);


--
-- Name: index_skillvue_assessments_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skillvue_assessments_on_project_id ON public.skillvue_assessments USING btree (project_id);


--
-- Name: index_skillvue_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skillvue_assessments_on_tenant_id ON public.skillvue_assessments USING btree (tenant_id);


--
-- Name: index_skillvue_user_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skillvue_user_assessments_on_tenant_id ON public.skillvue_user_assessments USING btree (tenant_id);


--
-- Name: index_skillvue_user_assessments_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_skillvue_user_assessments_on_user_assessment_id ON public.skillvue_user_assessments USING btree (user_assessment_id);


--
-- Name: index_sms_histories_on_sms_record_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sms_histories_on_sms_record_id ON public.sms_histories USING btree (sms_record_id);


--
-- Name: index_sms_histories_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sms_histories_on_tenant_id ON public.sms_histories USING btree (tenant_id);


--
-- Name: index_sms_invites_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sms_invites_on_campaign_id ON public.sms_invites USING btree (campaign_id);


--
-- Name: index_sms_invites_on_campaign_id_and_mobile_no; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_sms_invites_on_campaign_id_and_mobile_no ON public.sms_invites USING btree (campaign_id, mobile_no);


--
-- Name: index_sms_invites_on_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sms_invites_on_creator_id ON public.sms_invites USING btree (creator_id);


--
-- Name: index_sms_invites_on_registered_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sms_invites_on_registered_user_id ON public.sms_invites USING btree (registered_user_id);


--
-- Name: index_sms_invites_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sms_invites_on_tenant_id ON public.sms_invites USING btree (tenant_id);


--
-- Name: index_sms_records_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sms_records_on_campaign_id ON public.sms_records USING btree (campaign_id);


--
-- Name: index_sms_records_on_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sms_records_on_creator_id ON public.sms_records USING btree (creator_id);


--
-- Name: index_sms_records_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_sms_records_on_tenant_id ON public.sms_records USING btree (tenant_id);


--
-- Name: index_smtp_settings_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_smtp_settings_on_project_id ON public.smtp_settings USING btree (project_id);


--
-- Name: index_smtp_settings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_smtp_settings_on_tenant_id ON public.smtp_settings USING btree (tenant_id);


--
-- Name: index_system_check_records_on_system_check_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_system_check_records_on_system_check_session_id ON public.system_check_records USING btree (system_check_session_id);


--
-- Name: index_system_check_records_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_system_check_records_on_tenant_id ON public.system_check_records USING btree (tenant_id);


--
-- Name: index_system_check_sessions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_system_check_sessions_on_tenant_id ON public.system_check_sessions USING btree (tenant_id);


--
-- Name: index_system_check_sessions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_system_check_sessions_on_user_id ON public.system_check_sessions USING btree (user_id);


--
-- Name: index_taggings_on_context; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_context ON public.taggings USING btree (context);


--
-- Name: index_taggings_on_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_tag_id ON public.taggings USING btree (tag_id);


--
-- Name: index_taggings_on_taggable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_taggable_id ON public.taggings USING btree (taggable_id);


--
-- Name: index_taggings_on_taggable_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_taggable_type ON public.taggings USING btree (taggable_type);


--
-- Name: index_taggings_on_taggable_type_and_taggable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_taggable_type_and_taggable_id ON public.taggings USING btree (taggable_type, taggable_id);


--
-- Name: index_taggings_on_tagger_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_tagger_id ON public.taggings USING btree (tagger_id);


--
-- Name: index_taggings_on_tagger_id_and_tagger_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_tagger_id_and_tagger_type ON public.taggings USING btree (tagger_id, tagger_type);


--
-- Name: index_taggings_on_tagger_type_and_tagger_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_tagger_type_and_tagger_id ON public.taggings USING btree (tagger_type, tagger_id);


--
-- Name: index_taggings_on_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_tenant ON public.taggings USING btree (tenant);


--
-- Name: index_taggings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taggings_on_tenant_id ON public.taggings USING btree (tenant_id);


--
-- Name: index_tags_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_tags_on_name ON public.tags USING btree (name);


--
-- Name: index_taxonomy_levels_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taxonomy_levels_on_project_id ON public.taxonomy_levels USING btree (project_id);


--
-- Name: index_taxonomy_levels_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_taxonomy_levels_on_tenant_id ON public.taxonomy_levels USING btree (tenant_id);


--
-- Name: index_temporary_uploads_on_status_and_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_temporary_uploads_on_status_and_created_at ON public.temporary_uploads USING btree (status, created_at);


--
-- Name: index_temporary_uploads_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_temporary_uploads_on_user_id ON public.temporary_uploads USING btree (user_id);


--
-- Name: index_text_module_overrides_on_editor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_text_module_overrides_on_editor_id ON public.text_module_overrides USING btree (editor_id);


--
-- Name: index_text_module_overrides_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_text_module_overrides_on_tenant_id ON public.text_module_overrides USING btree (tenant_id);


--
-- Name: index_text_module_overrides_on_user_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_text_module_overrides_on_user_report_id ON public.text_module_overrides USING btree (user_report_id);


--
-- Name: index_threesixty_campaigns_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_campaigns_on_assessment_id ON public.threesixty_campaigns USING btree (assessment_id);


--
-- Name: index_threesixty_campaigns_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_campaigns_on_campaign_id ON public.threesixty_campaigns USING btree (campaign_id);


--
-- Name: index_threesixty_campaigns_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_campaigns_on_report_id ON public.threesixty_campaigns USING btree (report_id);


--
-- Name: index_threesixty_campaigns_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_campaigns_on_tenant_id ON public.threesixty_campaigns USING btree (tenant_id);


--
-- Name: index_threesixty_email_histories_on_evaluator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_histories_on_evaluator_id ON public.threesixty_email_histories USING btree (evaluator_id);


--
-- Name: index_threesixty_email_histories_on_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_histories_on_subject_id ON public.threesixty_email_histories USING btree (subject_id);


--
-- Name: index_threesixty_email_histories_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_histories_on_tenant_id ON public.threesixty_email_histories USING btree (tenant_id);


--
-- Name: index_threesixty_email_schedules_on_delivered_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_schedules_on_delivered_at ON public.threesixty_email_schedules USING btree (delivered_at);


--
-- Name: index_threesixty_email_schedules_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_schedules_on_name ON public.threesixty_email_schedules USING btree (name);


--
-- Name: index_threesixty_email_schedules_on_scheduled_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_schedules_on_scheduled_date ON public.threesixty_email_schedules USING btree (scheduled_date);


--
-- Name: index_threesixty_email_schedules_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_schedules_on_template_id ON public.threesixty_email_schedules USING btree (template_id);


--
-- Name: index_threesixty_email_schedules_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_schedules_on_tenant_id ON public.threesixty_email_schedules USING btree (tenant_id);


--
-- Name: index_threesixty_email_template_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_template_translations_on_locale ON public.threesixty_email_template_translations USING btree (locale);


--
-- Name: index_threesixty_email_template_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_template_translations_on_tenant_id ON public.threesixty_email_template_translations USING btree (tenant_id);


--
-- Name: index_threesixty_email_templates_campaign_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_threesixty_email_templates_campaign_name ON public.threesixty_email_templates USING btree (threesixty_campaign_id, name);


--
-- Name: index_threesixty_email_templates_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_email_templates_on_tenant_id ON public.threesixty_email_templates USING btree (tenant_id);


--
-- Name: index_threesixty_evaluators_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_evaluators_on_campaign_id ON public.threesixty_evaluators USING btree (campaign_id);


--
-- Name: index_threesixty_evaluators_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_evaluators_on_tenant_id ON public.threesixty_evaluators USING btree (tenant_id);


--
-- Name: index_threesixty_evaluators_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_evaluators_on_user_id ON public.threesixty_evaluators USING btree (user_id);


--
-- Name: index_threesixty_instruction_template_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_instruction_template_translations_on_locale ON public.threesixty_instruction_template_translations USING btree (locale);


--
-- Name: index_threesixty_instruction_templates_campaign_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_threesixty_instruction_templates_campaign_name ON public.threesixty_instruction_templates USING btree (threesixty_campaign_id, name);


--
-- Name: index_threesixty_instruction_templates_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_instruction_templates_on_tenant_id ON public.threesixty_instruction_templates USING btree (tenant_id);


--
-- Name: index_threesixty_nomination_requirements_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_nomination_requirements_on_tenant_id ON public.threesixty_nomination_requirements USING btree (tenant_id);


--
-- Name: index_threesixty_options_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_options_on_tenant_id ON public.threesixty_options USING btree (tenant_id);


--
-- Name: index_threesixty_options_on_threesixty_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_options_on_threesixty_campaign_id ON public.threesixty_options USING btree (threesixty_campaign_id);


--
-- Name: index_threesixty_reminder_histories_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_reminder_histories_on_tenant_id ON public.threesixty_reminder_histories USING btree (tenant_id);


--
-- Name: index_threesixty_reminder_histories_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_reminder_histories_on_user_id ON public.threesixty_reminder_histories USING btree (user_id);


--
-- Name: index_threesixty_subjects_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_subjects_on_campaign_id ON public.threesixty_subjects USING btree (campaign_id);


--
-- Name: index_threesixty_subjects_on_evaluation_status_updated_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_subjects_on_evaluation_status_updated_by_id ON public.threesixty_subjects USING btree (evaluation_status_updated_by_id);


--
-- Name: index_threesixty_subjects_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_subjects_on_tenant_id ON public.threesixty_subjects USING btree (tenant_id);


--
-- Name: index_threesixty_subjects_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_subjects_on_user_id ON public.threesixty_subjects USING btree (user_id);


--
-- Name: index_transcriptions_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_transcriptions_on_status ON public.transcriptions USING btree (status);


--
-- Name: index_transcriptions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_transcriptions_on_tenant_id ON public.transcriptions USING btree (tenant_id);


--
-- Name: index_transcriptions_on_transcribable; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_transcriptions_on_transcribable ON public.transcriptions USING btree (transcribable_type, transcribable_id);


--
-- Name: index_transcriptions_on_transcribable_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_transcriptions_on_transcribable_unique ON public.transcriptions USING btree (transcribable_type, transcribable_id);


--
-- Name: index_translations_on_resource_type_and_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_translations_on_resource_type_and_resource_id ON public.translations USING btree (resource_type, resource_id);


--
-- Name: index_translations_on_translateable_type_and_translateable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_translations_on_translateable_type_and_translateable_id ON public.translations USING btree (translateable_type, translateable_id);


--
-- Name: index_unique_dependency_per_artifact; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_unique_dependency_per_artifact ON public.campaign_ai_artifact_dependencies USING btree (campaign_ai_artifact_id, dependency_type, dependency_id);


--
-- Name: index_unique_dependency_per_campaign_idp; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_unique_dependency_per_campaign_idp ON public.campaign_idp_dependencies USING btree (campaign_idp_id, dependency_type, dependency_id);


--
-- Name: index_user_assessment_factor_scores_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessment_factor_scores_on_factor_id ON public.user_assessment_factor_scores USING btree (factor_id);


--
-- Name: index_user_assessment_factor_scores_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessment_factor_scores_on_tenant_id ON public.user_assessment_factor_scores USING btree (tenant_id);


--
-- Name: index_user_assessment_factor_scores_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessment_factor_scores_on_user_assessment_id ON public.user_assessment_factor_scores USING btree (user_assessment_id);


--
-- Name: index_user_assessment_verification_images_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessment_verification_images_on_tenant_id ON public.user_assessment_verification_images USING btree (tenant_id);


--
-- Name: index_user_assessment_verification_media_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessment_verification_media_on_tenant_id ON public.user_assessment_verification_media USING btree (tenant_id);


--
-- Name: index_user_assessment_verification_media_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessment_verification_media_on_user_assessment_id ON public.user_assessment_verification_media USING btree (user_assessment_id);


--
-- Name: index_user_assessments_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessments_on_assessment_id ON public.user_assessments USING btree (assessment_id);


--
-- Name: index_user_assessments_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessments_on_campaign_id ON public.user_assessments USING btree (campaign_id);


--
-- Name: index_user_assessments_on_evaluator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessments_on_evaluator_id ON public.user_assessments USING btree (evaluator_id);


--
-- Name: index_user_assessments_on_norm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessments_on_norm_id ON public.user_assessments USING btree (norm_id);


--
-- Name: index_user_assessments_on_prework; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessments_on_prework ON public.user_assessments USING btree (prework);


--
-- Name: index_user_assessments_on_relationship_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessments_on_relationship_id ON public.user_assessments USING btree (relationship_id);


--
-- Name: index_user_assessments_on_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessments_on_subject_id ON public.user_assessments USING btree (subject_id);


--
-- Name: index_user_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessments_on_tenant_id ON public.user_assessments USING btree (tenant_id);


--
-- Name: index_user_assessments_on_users_result_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_assessments_on_users_result_id ON public.user_assessments USING btree (users_result_id);


--
-- Name: index_user_availability_dates_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_availability_dates_on_user_id ON public.user_availability_dates USING btree (user_id);


--
-- Name: index_user_availability_days_on_user_availability_date_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_availability_days_on_user_availability_date_id ON public.user_availability_days USING btree (user_availability_date_id);


--
-- Name: index_user_bookings_on_booked_by_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_bookings_on_booked_by_resource ON public.user_bookings USING btree (booked_by_resource_type, booked_by_resource_id);


--
-- Name: index_user_bookings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_bookings_on_tenant_id ON public.user_bookings USING btree (tenant_id);


--
-- Name: index_user_bookings_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_bookings_on_user_id ON public.user_bookings USING btree (user_id);


--
-- Name: index_user_idp_comments_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_comments_on_created_at ON public.user_idp_comments USING btree (created_at);


--
-- Name: index_user_idp_comments_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_comments_on_created_by_id ON public.user_idp_comments USING btree (created_by_id);


--
-- Name: index_user_idp_comments_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_comments_on_parent_id ON public.user_idp_comments USING btree (parent_id);


--
-- Name: index_user_idp_comments_on_read_by_user_ids; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_comments_on_read_by_user_ids ON public.user_idp_comments USING gin (read_by_user_ids);


--
-- Name: index_user_idp_comments_on_resolved_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_comments_on_resolved_by_id ON public.user_idp_comments USING btree (resolved_by_id);


--
-- Name: index_user_idp_comments_on_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_comments_on_resource ON public.user_idp_comments USING btree (resource_type, resource_id);


--
-- Name: index_user_idp_comments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_comments_on_tenant_id ON public.user_idp_comments USING btree (tenant_id);


--
-- Name: index_user_idp_comments_on_user_idp_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_comments_on_user_idp_plan_id ON public.user_idp_comments USING btree (user_idp_plan_id);


--
-- Name: index_user_idp_comments_on_user_idp_plan_id_and_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_comments_on_user_idp_plan_id_and_created_by_id ON public.user_idp_comments USING btree (user_idp_plan_id, created_by_id);


--
-- Name: index_user_idp_development_actions_on_deleted_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_development_actions_on_deleted_by_id ON public.user_idp_development_actions USING btree (deleted_by_id);


--
-- Name: index_user_idp_development_actions_on_development_action_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_development_actions_on_development_action_id ON public.user_idp_development_actions USING btree (development_action_id);


--
-- Name: index_user_idp_development_actions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_development_actions_on_tenant_id ON public.user_idp_development_actions USING btree (tenant_id);


--
-- Name: index_user_idp_development_actions_on_user_idp_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_development_actions_on_user_idp_plan_id ON public.user_idp_development_actions USING btree (user_idp_plan_id);


--
-- Name: index_user_idp_development_actions_on_user_idp_skill_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_development_actions_on_user_idp_skill_id ON public.user_idp_development_actions USING btree (user_idp_skill_id);


--
-- Name: index_user_idp_plans_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_plans_on_campaign_id ON public.user_idp_plans USING btree (campaign_id);


--
-- Name: index_user_idp_plans_on_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_plans_on_creator_id ON public.user_idp_plans USING btree (creator_id);


--
-- Name: index_user_idp_plans_on_idp_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_plans_on_idp_template_id ON public.user_idp_plans USING btree (idp_template_id);


--
-- Name: index_user_idp_plans_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_plans_on_tenant_id ON public.user_idp_plans USING btree (tenant_id);


--
-- Name: index_user_idp_plans_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_plans_on_user_id ON public.user_idp_plans USING btree (user_id);


--
-- Name: index_user_idp_plans_on_user_id_and_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_user_idp_plans_on_user_id_and_active ON public.user_idp_plans USING btree (user_id, active) WHERE active;


--
-- Name: index_user_idp_skills_on_deleted_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_skills_on_deleted_by_id ON public.user_idp_skills USING btree (deleted_by_id);


--
-- Name: index_user_idp_skills_on_private; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_skills_on_private ON public.user_idp_skills USING btree (private);


--
-- Name: index_user_idp_skills_on_skill_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_skills_on_skill_id ON public.user_idp_skills USING btree (skill_id);


--
-- Name: index_user_idp_skills_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_skills_on_tenant_id ON public.user_idp_skills USING btree (tenant_id);


--
-- Name: index_user_idp_skills_on_user_idp_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_idp_skills_on_user_idp_plan_id ON public.user_idp_skills USING btree (user_idp_plan_id);


--
-- Name: index_user_preferences_on_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_preferences_on_category ON public.user_preferences USING btree (category);


--
-- Name: index_user_preferences_on_resource_type_and_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_preferences_on_resource_type_and_resource_id ON public.user_preferences USING btree (resource_type, resource_id);


--
-- Name: index_user_preferences_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_preferences_on_tenant_id ON public.user_preferences USING btree (tenant_id);


--
-- Name: index_user_preferences_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_preferences_on_user_id ON public.user_preferences USING btree (user_id);


--
-- Name: index_user_profiles_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_profiles_on_tenant_id ON public.user_profiles USING btree (tenant_id);


--
-- Name: index_user_profiles_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_profiles_on_user_id ON public.user_profiles USING btree (user_id);


--
-- Name: index_user_reflection_question_answers_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_reflection_question_answers_on_tenant_id ON public.user_reflection_question_answers USING btree (tenant_id);


--
-- Name: index_user_reflection_question_answers_on_user_idp_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_reflection_question_answers_on_user_idp_plan_id ON public.user_reflection_question_answers USING btree (user_idp_plan_id);


--
-- Name: index_user_report_comments_on_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_comments_on_creator_id ON public.user_report_comments USING btree (creator_id);


--
-- Name: index_user_report_comments_on_deleted_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_comments_on_deleted_by_id ON public.user_report_comments USING btree (deleted_by_id);


--
-- Name: index_user_report_comments_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_comments_on_parent_id ON public.user_report_comments USING btree (parent_id);


--
-- Name: index_user_report_comments_on_reports_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_comments_on_reports_module_id ON public.user_report_comments USING btree (reports_module_id);


--
-- Name: index_user_report_comments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_comments_on_tenant_id ON public.user_report_comments USING btree (tenant_id);


--
-- Name: index_user_report_comments_on_user_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_comments_on_user_report_id ON public.user_report_comments USING btree (user_report_id);


--
-- Name: index_user_report_events_on_initiator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_events_on_initiator_id ON public.user_report_events USING btree (initiator_id);


--
-- Name: index_user_report_events_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_events_on_tenant_id ON public.user_report_events USING btree (tenant_id);


--
-- Name: index_user_report_events_on_user_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_events_on_user_report_id ON public.user_report_events USING btree (user_report_id);


--
-- Name: index_user_report_pdfs_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_pdfs_on_tenant_id ON public.user_report_pdfs USING btree (tenant_id);


--
-- Name: index_user_report_pdfs_on_user_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_report_pdfs_on_user_report_id ON public.user_report_pdfs USING btree (user_report_id);


--
-- Name: index_user_report_pdfs_on_user_report_id_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_user_report_pdfs_on_user_report_id_and_locale ON public.user_report_pdfs USING btree (user_report_id, locale);


--
-- Name: index_user_reports_on_approver_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_reports_on_approver_user_id ON public.user_reports USING btree (approver_user_id);


--
-- Name: index_user_reports_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_reports_on_campaign_id ON public.user_reports USING btree (campaign_id);


--
-- Name: index_user_reports_on_report_family_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_reports_on_report_family_id ON public.user_reports USING btree (report_family_id);


--
-- Name: index_user_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_reports_on_report_id ON public.user_reports USING btree (report_id);


--
-- Name: index_user_reports_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_reports_on_tenant_id ON public.user_reports USING btree (tenant_id);


--
-- Name: index_user_reports_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_reports_on_user_id ON public.user_reports USING btree (user_id);


--
-- Name: index_user_saved_filters_on_filter_params; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_saved_filters_on_filter_params ON public.user_saved_filters USING gin (filter_params);


--
-- Name: index_user_saved_filters_on_name_and_user_id_and_resource_type; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_user_saved_filters_on_name_and_user_id_and_resource_type ON public.user_saved_filters USING btree (name, user_id, resource_type);


--
-- Name: index_user_saved_filters_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_saved_filters_on_user_id ON public.user_saved_filters USING btree (user_id);


--
-- Name: index_user_saved_filters_on_user_id_and_resource_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_saved_filters_on_user_id_and_resource_type ON public.user_saved_filters USING btree (user_id, resource_type);


--
-- Name: index_users_on_authentication_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_authentication_token ON public.users USING btree (authentication_token);


--
-- Name: index_users_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_created_by_id ON public.users USING btree (created_by_id);


--
-- Name: index_users_on_email_and_project_id_and_role; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_email_and_project_id_and_role ON public.users USING btree (email, project_id, role);


--
-- Name: index_users_on_encrypted_otp_secret_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_encrypted_otp_secret_key ON public.users USING btree (encrypted_otp_secret_key);


--
-- Name: index_users_on_external_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_external_id ON public.users USING btree (external_id);


--
-- Name: index_users_on_grants; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_grants ON public.users USING gin (grants);


--
-- Name: index_users_on_invitation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_invitation_token ON public.users USING btree (invitation_token);


--
-- Name: index_users_on_invitations_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_invitations_count ON public.users USING btree (invitations_count);


--
-- Name: index_users_on_invited_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_invited_by_id ON public.users USING btree (invited_by_id);


--
-- Name: index_users_on_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_manager_id ON public.users USING btree (manager_id);


--
-- Name: index_users_on_modified_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_modified_by_id ON public.users USING btree (modified_by_id);


--
-- Name: index_users_on_reset_password_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_reset_password_token ON public.users USING btree (reset_password_token);


--
-- Name: index_users_on_spoofed_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_spoofed_by_id ON public.users USING btree (spoofed_by_id);


--
-- Name: index_users_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_tenant_id ON public.users USING btree (tenant_id);


--
-- Name: index_users_results_on_occupation_condition_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_results_on_occupation_condition_set_id ON public.users_results USING btree (occupation_condition_set_id);


--
-- Name: index_users_results_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_results_on_tenant_id ON public.users_results USING btree (tenant_id);


--
-- Name: index_vector_embeddings_on_embedding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vector_embeddings_on_embedding ON public.vector_embeddings USING hnsw (embedding public.vector_cosine_ops);


--
-- Name: index_vector_embeddings_on_embedding1536; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vector_embeddings_on_embedding1536 ON public.vector_embeddings USING hnsw (embedding1536 public.vector_cosine_ops);


--
-- Name: index_vector_embeddings_on_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vector_embeddings_on_resource ON public.vector_embeddings USING btree (resource_type, resource_id);


--
-- Name: index_vector_embeddings_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vector_embeddings_on_tenant_id ON public.vector_embeddings USING btree (tenant_id);


--
-- Name: index_version_associations_on_foreign_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_version_associations_on_foreign_key ON public.version_associations USING btree (foreign_key_name, foreign_key_id, foreign_type);


--
-- Name: index_version_associations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_version_associations_on_tenant_id ON public.version_associations USING btree (tenant_id);


--
-- Name: index_version_associations_on_version_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_version_associations_on_version_id ON public.version_associations USING btree (version_id);


--
-- Name: index_versions_on_item_type_and_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_versions_on_item_type_and_item_id ON public.versions USING btree (item_type, item_id);


--
-- Name: index_versions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_versions_on_tenant_id ON public.versions USING btree (tenant_id);


--
-- Name: index_versions_on_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_versions_on_transaction_id ON public.versions USING btree (transaction_id);


--
-- Name: index_webhook_event_logs_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_event_logs_on_created_at ON public.webhook_event_logs USING btree (created_at);


--
-- Name: index_webhook_event_logs_on_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_event_logs_on_event_id ON public.webhook_event_logs USING btree (event_id);


--
-- Name: index_webhook_event_logs_on_event_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_event_logs_on_event_name ON public.webhook_event_logs USING btree (event_name);


--
-- Name: index_webhook_event_logs_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_event_logs_on_status ON public.webhook_event_logs USING btree (status);


--
-- Name: index_webhook_event_logs_on_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_event_logs_on_subscription_id ON public.webhook_event_logs USING btree (subscription_id);


--
-- Name: index_webhook_event_logs_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_event_logs_on_tenant_id ON public.webhook_event_logs USING btree (tenant_id);


--
-- Name: index_webhook_subscription_topics_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_subscription_topics_on_name ON public.webhook_subscription_topics USING btree (name);


--
-- Name: index_webhook_subscription_topics_on_subscription_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_subscription_topics_on_subscription_id ON public.webhook_subscription_topics USING btree (subscription_id);


--
-- Name: index_webhook_subscription_topics_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_subscription_topics_on_tenant_id ON public.webhook_subscription_topics USING btree (tenant_id);


--
-- Name: index_webhook_subscriptions_on_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_subscriptions_on_active ON public.webhook_subscriptions USING btree (active);


--
-- Name: index_webhook_subscriptions_on_assessment_ids; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_subscriptions_on_assessment_ids ON public.webhook_subscriptions USING gin (assessment_ids);


--
-- Name: index_webhook_subscriptions_on_deleted_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_subscriptions_on_deleted_by_id ON public.webhook_subscriptions USING btree (deleted_by_id);


--
-- Name: index_webhook_subscriptions_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_subscriptions_on_project_id ON public.webhook_subscriptions USING btree (project_id);


--
-- Name: index_webhook_subscriptions_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_webhook_subscriptions_on_tenant_id ON public.webhook_subscriptions USING btree (tenant_id);


--
-- Name: index_workshop_assessors_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_assessors_on_tenant_id ON public.workshop_assessors USING btree (tenant_id);


--
-- Name: index_workshop_assessors_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_assessors_on_user_id ON public.workshop_assessors USING btree (user_id);


--
-- Name: index_workshop_assessors_on_workshop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_assessors_on_workshop_id ON public.workshop_assessors USING btree (workshop_id);


--
-- Name: index_workshop_invite_logs_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invite_logs_on_created_by_id ON public.workshop_invite_logs USING btree (created_by_id);


--
-- Name: index_workshop_invite_logs_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invite_logs_on_tenant_id ON public.workshop_invite_logs USING btree (tenant_id);


--
-- Name: index_workshop_invite_logs_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invite_logs_on_user_id ON public.workshop_invite_logs USING btree (user_id);


--
-- Name: index_workshop_invite_logs_on_workshop_invite_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invite_logs_on_workshop_invite_id ON public.workshop_invite_logs USING btree (workshop_invite_id);


--
-- Name: index_workshop_invite_translations_on_description_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invite_translations_on_description_and_locale ON public.workshop_invite_translations USING btree (description, locale);


--
-- Name: index_workshop_invite_translations_on_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invite_translations_on_locale ON public.workshop_invite_translations USING btree (locale);


--
-- Name: index_workshop_invite_translations_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invite_translations_on_tenant_id ON public.workshop_invite_translations USING btree (tenant_id);


--
-- Name: index_workshop_invite_translations_on_title_and_locale; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invite_translations_on_title_and_locale ON public.workshop_invite_translations USING btree (title, locale);


--
-- Name: index_workshop_invited_subjects_on_reschedule_workshop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invited_subjects_on_reschedule_workshop_id ON public.workshop_invited_subjects USING btree (reschedule_workshop_id);


--
-- Name: index_workshop_invited_subjects_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invited_subjects_on_tenant_id ON public.workshop_invited_subjects USING btree (tenant_id);


--
-- Name: index_workshop_invited_subjects_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invited_subjects_on_user_id ON public.workshop_invited_subjects USING btree (user_id);


--
-- Name: index_workshop_invited_subjects_on_workshop_invite_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invited_subjects_on_workshop_invite_id ON public.workshop_invited_subjects USING btree (workshop_invite_id);


--
-- Name: index_workshop_invites_on_campaign_assessment_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invites_on_campaign_assessment_group_id ON public.workshop_invites USING btree (campaign_assessment_group_id);


--
-- Name: index_workshop_invites_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invites_on_campaign_id ON public.workshop_invites USING btree (campaign_id);


--
-- Name: index_workshop_invites_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invites_on_tenant_id ON public.workshop_invites USING btree (tenant_id);


--
-- Name: index_workshop_invites_workshops_on_workshop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invites_workshops_on_workshop_id ON public.workshop_invites_workshops USING btree (workshop_id);


--
-- Name: index_workshop_invites_workshops_on_workshop_invite_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_invites_workshops_on_workshop_invite_id ON public.workshop_invites_workshops USING btree (workshop_invite_id);


--
-- Name: index_workshop_managers_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_managers_on_tenant_id ON public.workshop_managers USING btree (tenant_id);


--
-- Name: index_workshop_managers_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_managers_on_user_id ON public.workshop_managers USING btree (user_id);


--
-- Name: index_workshop_managers_on_workshop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_managers_on_workshop_id ON public.workshop_managers USING btree (workshop_id);


--
-- Name: index_workshop_resources_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_resources_on_tenant_id ON public.workshop_resources USING btree (tenant_id);


--
-- Name: index_workshop_resources_on_workshop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_resources_on_workshop_id ON public.workshop_resources USING btree (workshop_id);


--
-- Name: index_workshop_subjects_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_subjects_on_tenant_id ON public.workshop_subjects USING btree (tenant_id);


--
-- Name: index_workshop_subjects_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_subjects_on_user_id ON public.workshop_subjects USING btree (user_id);


--
-- Name: index_workshop_subjects_on_workshop_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_subjects_on_workshop_id ON public.workshop_subjects USING btree (workshop_id);


--
-- Name: index_workshop_subjects_on_workshop_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_workshop_subjects_on_workshop_id_and_user_id ON public.workshop_subjects USING btree (workshop_id, user_id);


--
-- Name: index_workshop_subjects_on_workshop_invited_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshop_subjects_on_workshop_invited_subject_id ON public.workshop_subjects USING btree (workshop_invited_subject_id);


--
-- Name: index_workshops_on_campaign_assessment_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshops_on_campaign_assessment_group_id ON public.workshops USING btree (campaign_assessment_group_id);


--
-- Name: index_workshops_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshops_on_campaign_id ON public.workshops USING btree (campaign_id);


--
-- Name: index_workshops_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_workshops_on_tenant_id ON public.workshops USING btree (tenant_id);


--
-- Name: index_yoodli_user_assessments_on_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_yoodli_user_assessments_on_active ON public.yoodli_user_assessments USING btree (active);


--
-- Name: index_yoodli_user_assessments_on_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_yoodli_user_assessments_on_tenant_id ON public.yoodli_user_assessments USING btree (tenant_id);


--
-- Name: index_yoodli_user_assessments_on_user_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_yoodli_user_assessments_on_user_assessment_id ON public.yoodli_user_assessments USING btree (user_assessment_id);


--
-- Name: membership_columns_uniq_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX membership_columns_uniq_index ON public.memberships USING btree (client_id, user_id, role, campaign_id);


--
-- Name: taggings_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX taggings_idx ON public.taggings USING btree (tag_id, taggable_id, taggable_type, context, tagger_id, tagger_type);


--
-- Name: taggings_idy; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX taggings_idy ON public.taggings USING btree (taggable_id, taggable_type, tagger_id, context);


--
-- Name: taggings_taggable_context_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX taggings_taggable_context_idx ON public.taggings USING btree (taggable_id, taggable_type, context);


--
-- Name: threesixty_email_schedule_cam_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX threesixty_email_schedule_cam_id ON public.threesixty_email_schedules USING btree (threesixty_campaign_id);


--
-- Name: threesixty_email_template_cam_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX threesixty_email_template_cam_id ON public.threesixty_email_templates USING btree (threesixty_campaign_id);


--
-- Name: threesixty_instruction_templates_cam_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX threesixty_instruction_templates_cam_id ON public.threesixty_instruction_templates USING btree (threesixty_campaign_id);


--
-- Name: threesixty_nomination_requirements_cam_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX threesixty_nomination_requirements_cam_id ON public.threesixty_nomination_requirements USING btree (threesixty_campaign_id);


--
-- Name: threesixty_reminder_histories_cam_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX threesixty_reminder_histories_cam_id ON public.threesixty_reminder_histories USING btree (threesixty_campaign_id);


--
-- Name: user_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_index ON public.audits USING btree (user_id, user_type);


--
-- Name: users_email_project_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_project_id_index ON public.users USING btree (email, COALESCE(project_id, 0));


--
-- Name: sms_invites creator_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_invites
    ADD CONSTRAINT creator_id FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sms_records creator_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_records
    ADD CONSTRAINT creator_id FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ai_factor_scores fk_rails_0020bf4fc6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_factor_scores
    ADD CONSTRAINT fk_rails_0020bf4fc6 FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: campaign_idp_dependencies fk_rails_00704dede9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_idp_dependencies
    ADD CONSTRAINT fk_rails_00704dede9 FOREIGN KEY (campaign_idp_id) REFERENCES public.campaign_idps(id);


--
-- Name: profile_settings fk_rails_008694ea3f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_settings
    ADD CONSTRAINT fk_rails_008694ea3f FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: user_assessments fk_rails_00bab7d492; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT fk_rails_00bab7d492 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: mettl_user_assessments fk_rails_010752ae59; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_user_assessments
    ADD CONSTRAINT fk_rails_010752ae59 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: skill_translations fk_rails_0180bb7b05; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_translations
    ADD CONSTRAINT fk_rails_0180bb7b05 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: saml_settings fk_rails_01ff451dbb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saml_settings
    ADD CONSTRAINT fk_rails_01ff451dbb FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_invited_subjects fk_rails_0236e105b0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invited_subjects
    ADD CONSTRAINT fk_rails_0236e105b0 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: skills fk_rails_026350ab95; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT fk_rails_026350ab95 FOREIGN KEY (skill_group_id) REFERENCES public.skill_groups(id);


--
-- Name: report_approval_settings fk_rails_0338cad702; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_approval_settings
    ADD CONSTRAINT fk_rails_0338cad702 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: audits fk_rails_03e3e18aab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT fk_rails_03e3e18aab FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_options fk_rails_0437d1f6f7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_options
    ADD CONSTRAINT fk_rails_0437d1f6f7 FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


--
-- Name: sheets fk_rails_048d5b6779; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheets
    ADD CONSTRAINT fk_rails_048d5b6779 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: idp_template_interview_questions fk_rails_04a975ec35; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_interview_questions
    ADD CONSTRAINT fk_rails_04a975ec35 FOREIGN KEY (interview_question_id) REFERENCES public.interview_questions(id) ON DELETE CASCADE;


--
-- Name: threesixty_email_template_translations fk_rails_04c41c48a8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_template_translations
    ADD CONSTRAINT fk_rails_04c41c48a8 FOREIGN KEY (threesixty_email_template_id) REFERENCES public.threesixty_email_templates(id);


--
-- Name: campaign_users fk_rails_056e63be0f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_users
    ADD CONSTRAINT fk_rails_056e63be0f FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: ai_assistant_output_schema_keys fk_rails_05ae770713; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_output_schema_keys
    ADD CONSTRAINT fk_rails_05ae770713 FOREIGN KEY (ai_assistant_id) REFERENCES public.ai_assistants(id);


--
-- Name: idp_template_skills fk_rails_05becee7c5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_skills
    ADD CONSTRAINT fk_rails_05becee7c5 FOREIGN KEY (factor_id) REFERENCES public.factors(id) ON DELETE RESTRICT;


--
-- Name: assigns fk_rails_05e55ff955; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_05e55ff955 FOREIGN KEY (project_assign_id) REFERENCES public.assigns(id) ON DELETE CASCADE;


--
-- Name: system_check_sessions fk_rails_061c27fb51; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_check_sessions
    ADD CONSTRAINT fk_rails_061c27fb51 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: versions fk_rails_06b8b76679; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions
    ADD CONSTRAINT fk_rails_06b8b76679 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: iiht_user_assessments fk_rails_071fc242ae; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iiht_user_assessments
    ADD CONSTRAINT fk_rails_071fc242ae FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_factor_values fk_rails_07fa4c59b5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_values
    ADD CONSTRAINT fk_rails_07fa4c59b5 FOREIGN KEY (campaign_factor_id) REFERENCES public.campaign_factors(id) ON DELETE CASCADE;


--
-- Name: campaign_assessor_assessment_factor_weights fk_rails_08dafb599b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessment_factor_weights
    ADD CONSTRAINT fk_rails_08dafb599b FOREIGN KEY (factor_id) REFERENCES public.factors(id) ON DELETE CASCADE;


--
-- Name: skills_development_actions fk_rails_09ac776adc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_development_actions
    ADD CONSTRAINT fk_rails_09ac776adc FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: users fk_rails_09d354f20c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_rails_09d354f20c FOREIGN KEY (modified_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: idp_templates fk_rails_0a97b8b97a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_templates
    ADD CONSTRAINT fk_rails_0a97b8b97a FOREIGN KEY (skill_gap_report_analysis_ai_assistant_id) REFERENCES public.ai_assistants(id);


--
-- Name: skillvue_assessments fk_rails_0b2142735a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skillvue_assessments
    ADD CONSTRAINT fk_rails_0b2142735a FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: meeting_recordings fk_rails_0b64b80f51; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_recordings
    ADD CONSTRAINT fk_rails_0b64b80f51 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_resources fk_rails_0b9b541d1c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_resources
    ADD CONSTRAINT fk_rails_0b9b541d1c FOREIGN KEY (workshop_id) REFERENCES public.workshops(id) ON DELETE CASCADE;


--
-- Name: profile_settings fk_rails_0ca0529d6f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_settings
    ADD CONSTRAINT fk_rails_0ca0529d6f FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_invite_logs fk_rails_0cb58ea600; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_logs
    ADD CONSTRAINT fk_rails_0cb58ea600 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skillvue_user_assessments fk_rails_0d404785ab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skillvue_user_assessments
    ADD CONSTRAINT fk_rails_0d404785ab FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: sms_histories fk_rails_0defde8966; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_histories
    ADD CONSTRAINT fk_rails_0defde8966 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communications_copy_memberships fk_rails_0df4abe90c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_copy_memberships
    ADD CONSTRAINT fk_rails_0df4abe90c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: relationships fk_rails_0e33db3c74; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT fk_rails_0e33db3c74 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: skills_job_roles fk_rails_0e5c3b4ba1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_job_roles
    ADD CONSTRAINT fk_rails_0e5c3b4ba1 FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id) ON DELETE CASCADE;


--
-- Name: user_idp_development_actions fk_rails_0ec64897bc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_development_actions
    ADD CONSTRAINT fk_rails_0ec64897bc FOREIGN KEY (user_idp_skill_id) REFERENCES public.user_idp_skills(id) ON DELETE CASCADE;


--
-- Name: campaign_assessor_assessments fk_rails_0f3a69b748; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessments
    ADD CONSTRAINT fk_rails_0f3a69b748 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_bookings fk_rails_0f6d7c0f39; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookings
    ADD CONSTRAINT fk_rails_0f6d7c0f39 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ai_scoring_approval_settings fk_rails_0fab93dd72; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_scoring_approval_settings
    ADD CONSTRAINT fk_rails_0fab93dd72 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports fk_rails_0fcc82136b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_rails_0fcc82136b FOREIGN KEY (deleted_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: assessments_reports fk_rails_105380adfd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_reports
    ADD CONSTRAINT fk_rails_105380adfd FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: idp_template_development_actions fk_rails_108b41b8fc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_development_actions
    ADD CONSTRAINT fk_rails_108b41b8fc FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_invites_workshops fk_rails_10a86b74cb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invites_workshops
    ADD CONSTRAINT fk_rails_10a86b74cb FOREIGN KEY (workshop_id) REFERENCES public.workshops(id) ON DELETE CASCADE;


--
-- Name: hogan_credentials fk_rails_120ca138e4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_credentials
    ADD CONSTRAINT fk_rails_120ca138e4 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_reports fk_rails_12e9be82ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_rails_12e9be82ff FOREIGN KEY (report_family_id) REFERENCES public.report_families(id) ON DELETE RESTRICT;


--
-- Name: users fk_rails_135c8f54b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_rails_135c8f54b2 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: licenses fk_rails_139c7e09c4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT fk_rails_139c7e09c4 FOREIGN KEY (report_family_id) REFERENCES public.report_families(id) ON DELETE RESTRICT;


--
-- Name: campaign_reports fk_rails_13aa9f63fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_reports
    ADD CONSTRAINT fk_rails_13aa9f63fd FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_email_histories fk_rails_14d2e43e9e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_histories
    ADD CONSTRAINT fk_rails_14d2e43e9e FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communication_cc_users fk_rails_1530ab8a7e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_cc_users
    ADD CONSTRAINT fk_rails_1530ab8a7e FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_assessment_groups fk_rails_154a268175; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessment_groups
    ADD CONSTRAINT fk_rails_154a268175 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_assistant_chats fk_rails_15a36d90ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_chats
    ADD CONSTRAINT fk_rails_15a36d90ff FOREIGN KEY (ai_assisted_user_session_id) REFERENCES public.ai_assisted_user_sessions(id);


--
-- Name: user_report_pdfs fk_rails_16b14d3148; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_pdfs
    ADD CONSTRAINT fk_rails_16b14d3148 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: dimensions fk_rails_16b68b71cd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT fk_rails_16b68b71cd FOREIGN KEY (updated_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: admin_jobs fk_rails_16c3530f54; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_jobs
    ADD CONSTRAINT fk_rails_16c3530f54 FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: client_features fk_rails_16fbe20b71; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_features
    ADD CONSTRAINT fk_rails_16fbe20b71 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: privacy_settings fk_rails_1756fc8ca2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_settings
    ADD CONSTRAINT fk_rails_1756fc8ca2 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: workshop_assessors fk_rails_176303cc7d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_assessors
    ADD CONSTRAINT fk_rails_176303cc7d FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports fk_rails_1805bc3762; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_rails_1805bc3762 FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: questions fk_rails_182a857994; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_rails_182a857994 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: project_features fk_rails_18513d9b92; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_features
    ADD CONSTRAINT fk_rails_18513d9b92 FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- Name: hogan_report_settings fk_rails_1a1f1f15cb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_report_settings
    ADD CONSTRAINT fk_rails_1a1f1f15cb FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_reports fk_rails_1a6f653d96; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_rails_1a6f653d96 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: assessments fk_rails_1acaaff98a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_rails_1acaaff98a FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: assigns fk_rails_1b51e2cce0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_1b51e2cce0 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: campaign_templates fk_rails_1c9a1bba8f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_templates
    ADD CONSTRAINT fk_rails_1c9a1bba8f FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: threesixty_email_schedules fk_rails_1d28372050; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_schedules
    ADD CONSTRAINT fk_rails_1d28372050 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: idp_settings fk_rails_1d8833379b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_settings
    ADD CONSTRAINT fk_rails_1d8833379b FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: proficiency_level_translations fk_rails_1dbceeb51b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency_level_translations
    ADD CONSTRAINT fk_rails_1dbceeb51b FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: privacy_consents fk_rails_1dc6eadc30; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents
    ADD CONSTRAINT fk_rails_1dc6eadc30 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: course_schedules fk_rails_1df435457d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_schedules
    ADD CONSTRAINT fk_rails_1df435457d FOREIGN KEY (development_action_id) REFERENCES public.development_actions(id) ON DELETE CASCADE;


--
-- Name: memberships fk_rails_1e06b93eb5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_1e06b93eb5 FOREIGN KEY (project_membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: admin_jobs fk_rails_1e3a30cff2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_jobs
    ADD CONSTRAINT fk_rails_1e3a30cff2 FOREIGN KEY (parent_job_id) REFERENCES public.admin_jobs(id) ON DELETE SET NULL;


--
-- Name: agiles fk_rails_1e58a4732c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agiles
    ADD CONSTRAINT fk_rails_1e58a4732c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: questions fk_rails_1e5e392d5a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_rails_1e5e392d5a FOREIGN KEY (skill_id) REFERENCES public.skills(id);


--
-- Name: communication_email_resources fk_rails_1e6187986b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_email_resources
    ADD CONSTRAINT fk_rails_1e6187986b FOREIGN KEY (communication_email_id) REFERENCES public.communication_emails(id);


--
-- Name: saville_factors fk_rails_1ee38b5608; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_factors
    ADD CONSTRAINT fk_rails_1ee38b5608 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_reports fk_rails_1eecc2fd8d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_reports
    ADD CONSTRAINT fk_rails_1eecc2fd8d FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE RESTRICT;


--
-- Name: ai_factor_scores fk_rails_204568e44d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_factor_scores
    ADD CONSTRAINT fk_rails_204568e44d FOREIGN KEY (factor_id) REFERENCES public.factors(id);


--
-- Name: campaign_assessment_groups fk_rails_20a5099c5a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessment_groups
    ADD CONSTRAINT fk_rails_20a5099c5a FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: skill_aliases fk_rails_21523805f1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_aliases
    ADD CONSTRAINT fk_rails_21523805f1 FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: client_privacy_settings fk_rails_21d818f4cd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_privacy_settings
    ADD CONSTRAINT fk_rails_21d818f4cd FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: innovation_styles fk_rails_23071c14a6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.innovation_styles
    ADD CONSTRAINT fk_rails_23071c14a6 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: assessors fk_rails_232405a599; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessors
    ADD CONSTRAINT fk_rails_232405a599 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: skills fk_rails_232b6298ae; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT fk_rails_232b6298ae FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: mettl_schedule_records fk_rails_237b56bea4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_schedule_records
    ADD CONSTRAINT fk_rails_237b56bea4 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: license_usages fk_rails_2397339a92; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_2397339a92 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: transcriptions fk_rails_23b8230a7c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcriptions
    ADD CONSTRAINT fk_rails_23b8230a7c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: idp_template_reflection_questions fk_rails_2414e644c0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_reflection_questions
    ADD CONSTRAINT fk_rails_2414e644c0 FOREIGN KEY (idp_template_id) REFERENCES public.idp_templates(id) ON DELETE CASCADE;


--
-- Name: data_reports fk_rails_2417dda3dd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_reports
    ADD CONSTRAINT fk_rails_2417dda3dd FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communication_emails fk_rails_2429635fcd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails
    ADD CONSTRAINT fk_rails_2429635fcd FOREIGN KEY (workshop_invite_id) REFERENCES public.workshop_invites(id);


--
-- Name: dimensions fk_rails_24904426c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT fk_rails_24904426c2 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: assessment_consent_settings fk_rails_24a0bd06fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_consent_settings
    ADD CONSTRAINT fk_rails_24a0bd06fd FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: sms_invites fk_rails_24c0e9c4ce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_invites
    ADD CONSTRAINT fk_rails_24c0e9c4ce FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: communications fk_rails_255082bfab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_255082bfab FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_idps fk_rails_257140097b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_idps
    ADD CONSTRAINT fk_rails_257140097b FOREIGN KEY (idp_template_id) REFERENCES public.idp_templates(id);


--
-- Name: campaign_assessments fk_rails_26caa38e1a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessments
    ADD CONSTRAINT fk_rails_26caa38e1a FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE RESTRICT;


--
-- Name: users fk_rails_26f59ec390; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_rails_26f59ec390 FOREIGN KEY (spoofed_by_id) REFERENCES public.users(id);


--
-- Name: user_reports fk_rails_28ab0c4f85; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_rails_28ab0c4f85 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: assessments fk_rails_292907b1cc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_rails_292907b1cc FOREIGN KEY (deleted_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: threesixty_subjects fk_rails_293bb22649; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects
    ADD CONSTRAINT fk_rails_293bb22649 FOREIGN KEY (evaluation_status_updated_by_id) REFERENCES public.users(id);


--
-- Name: workshop_subjects fk_rails_29528926c0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_subjects
    ADD CONSTRAINT fk_rails_29528926c0 FOREIGN KEY (workshop_id) REFERENCES public.workshops(id) ON DELETE CASCADE;


--
-- Name: assessment_assistants fk_rails_29a8207386; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_assistants
    ADD CONSTRAINT fk_rails_29a8207386 FOREIGN KEY (ai_assistant_id) REFERENCES public.ai_assistants(id);


--
-- Name: communication_emails fk_rails_2a329ed34d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails
    ADD CONSTRAINT fk_rails_2a329ed34d FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: data_report_jobs fk_rails_2a7c0b49ad; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_report_jobs
    ADD CONSTRAINT fk_rails_2a7c0b49ad FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_option_translations fk_rails_2a7cce45bd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_option_translations
    ADD CONSTRAINT fk_rails_2a7cce45bd FOREIGN KEY (campaign_option_id) REFERENCES public.campaign_options(id);


--
-- Name: campaign_reports fk_rails_2acc607ab4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_reports
    ADD CONSTRAINT fk_rails_2acc607ab4 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: temporary_uploads fk_rails_2aedf92c49; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.temporary_uploads
    ADD CONSTRAINT fk_rails_2aedf92c49 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: power_bi_settings fk_rails_2c58befa94; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.power_bi_settings
    ADD CONSTRAINT fk_rails_2c58befa94 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: resource_hogan_credentials fk_rails_2ca37623d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_hogan_credentials
    ADD CONSTRAINT fk_rails_2ca37623d5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: idp_template_reflection_questions fk_rails_2ca5733848; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_reflection_questions
    ADD CONSTRAINT fk_rails_2ca5733848 FOREIGN KEY (reflection_question_id) REFERENCES public.reflection_questions(id) ON DELETE CASCADE;


--
-- Name: innovation_styles_factors fk_rails_2d436cbfdb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.innovation_styles_factors
    ADD CONSTRAINT fk_rails_2d436cbfdb FOREIGN KEY (innovation_style_id) REFERENCES public.innovation_styles(id);


--
-- Name: power_bi_settings fk_rails_2f05b80bd4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.power_bi_settings
    ADD CONSTRAINT fk_rails_2f05b80bd4 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_campaigns fk_rails_2f45aa472a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns
    ADD CONSTRAINT fk_rails_2f45aa472a FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE RESTRICT;


--
-- Name: report_approval_settings fk_rails_2f5e81c8e9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_approval_settings
    ADD CONSTRAINT fk_rails_2f5e81c8e9 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: memberships_admin_roles fk_rails_2fd8627d72; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships_admin_roles
    ADD CONSTRAINT fk_rails_2fd8627d72 FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: bulk_reports fk_rails_305b903068; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulk_reports
    ADD CONSTRAINT fk_rails_305b903068 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: idp_template_reflection_questions fk_rails_30bc07fffb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_reflection_questions
    ADD CONSTRAINT fk_rails_30bc07fffb FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: oracle_credentials fk_rails_30dd1b931a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oracle_credentials
    ADD CONSTRAINT fk_rails_30dd1b931a FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: client_features fk_rails_30e279c9bd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_features
    ADD CONSTRAINT fk_rails_30e279c9bd FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: workshop_subjects fk_rails_3180e6c333; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_subjects
    ADD CONSTRAINT fk_rails_3180e6c333 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: system_check_records fk_rails_31829aa176; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_check_records
    ADD CONSTRAINT fk_rails_31829aa176 FOREIGN KEY (system_check_session_id) REFERENCES public.system_check_sessions(id);


--
-- Name: ai_translation_results fk_rails_321d4a2d21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_translation_results
    ADD CONSTRAINT fk_rails_321d4a2d21 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: license_usages fk_rails_3268c52319; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_3268c52319 FOREIGN KEY (project_license_id) REFERENCES public.project_licenses(id);


--
-- Name: api_keys fk_rails_32c28d0dc2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT fk_rails_32c28d0dc2 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: communications fk_rails_335957e44b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_335957e44b FOREIGN KEY (updated_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: microsite_user_assessments fk_rails_338c864fb2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.microsite_user_assessments
    ADD CONSTRAINT fk_rails_338c864fb2 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id);


--
-- Name: libraries fk_rails_33d493c854; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libraries
    ADD CONSTRAINT fk_rails_33d493c854 FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: workshop_invites fk_rails_3495a4f69c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invites
    ADD CONSTRAINT fk_rails_3495a4f69c FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: datasheet_column_preferences fk_rails_34f958abd8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datasheet_column_preferences
    ADD CONSTRAINT fk_rails_34f958abd8 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_assistants fk_rails_35091bc14b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistants
    ADD CONSTRAINT fk_rails_35091bc14b FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports fk_rails_3523aa4198; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_rails_3523aa4198 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: question_recoding fk_rails_353fbe9a3f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_recoding
    ADD CONSTRAINT fk_rails_353fbe9a3f FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_assessor_assessment_factor_weights fk_rails_35545a6526; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessment_factor_weights
    ADD CONSTRAINT fk_rails_35545a6526 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: development_action_translations fk_rails_355bf2e419; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_action_translations
    ADD CONSTRAINT fk_rails_355bf2e419 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_factor_values fk_rails_3708573fdc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_values
    ADD CONSTRAINT fk_rails_3708573fdc FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: agile_events fk_rails_37e3f56836; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agile_events
    ADD CONSTRAINT fk_rails_37e3f56836 FOREIGN KEY (users_result_id) REFERENCES public.users_results(id);


--
-- Name: dimensions fk_rails_38223be8a7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT fk_rails_38223be8a7 FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: campaign_ai_artifacts fk_rails_38577b2c69; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_ai_artifacts
    ADD CONSTRAINT fk_rails_38577b2c69 FOREIGN KEY (ai_assistant_id) REFERENCES public.ai_assistants(id);


--
-- Name: memberships fk_rails_385eeb68ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_385eeb68ea FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: campaign_assessments fk_rails_3874b11207; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessments
    ADD CONSTRAINT fk_rails_3874b11207 FOREIGN KEY (occupation_condition_set_id) REFERENCES public.occupation_condition_sets(id);


--
-- Name: questions fk_rails_38b686d55b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_rails_38b686d55b FOREIGN KEY (updated_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: threesixty_reminder_histories fk_rails_38fa0fe639; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_reminder_histories
    ADD CONSTRAINT fk_rails_38fa0fe639 FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


--
-- Name: application_ip_whitelist_entries fk_rails_3973e593f4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_ip_whitelist_entries
    ADD CONSTRAINT fk_rails_3973e593f4 FOREIGN KEY (application_setting_id) REFERENCES public.application_settings(id) ON DELETE CASCADE;


--
-- Name: reports_accesses fk_rails_3a283de8a1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses
    ADD CONSTRAINT fk_rails_3a283de8a1 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: occupation_condition_sets fk_rails_3abfce3f69; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupation_condition_sets
    ADD CONSTRAINT fk_rails_3abfce3f69 FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id) ON DELETE CASCADE;


--
-- Name: admin_roles fk_rails_3b1aac0d32; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT fk_rails_3b1aac0d32 FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: highlights fk_rails_3b86ceac89; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.highlights
    ADD CONSTRAINT fk_rails_3b86ceac89 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assessment_assistants fk_rails_3ba0082822; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_assistants
    ADD CONSTRAINT fk_rails_3ba0082822 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: privacy_consents fk_rails_3bf1289bd9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents
    ADD CONSTRAINT fk_rails_3bf1289bd9 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: libraries fk_rails_3c26848d46; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libraries
    ADD CONSTRAINT fk_rails_3c26848d46 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_assistant_chats fk_rails_3c77b7a900; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_chats
    ADD CONSTRAINT fk_rails_3c77b7a900 FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: threesixty_email_histories fk_rails_3cb35a810a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_histories
    ADD CONSTRAINT fk_rails_3cb35a810a FOREIGN KEY (threesixty_email_schedule_id) REFERENCES public.threesixty_email_schedules(id) ON DELETE CASCADE;


--
-- Name: mettl_assessments fk_rails_3d11060354; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_assessments
    ADD CONSTRAINT fk_rails_3d11060354 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_idp_skills fk_rails_3da8352e19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_skills
    ADD CONSTRAINT fk_rails_3da8352e19 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_instruction_templates fk_rails_3e304e0709; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_instruction_templates
    ADD CONSTRAINT fk_rails_3e304e0709 FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


--
-- Name: campaign_reports fk_rails_3fef21b497; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_reports
    ADD CONSTRAINT fk_rails_3fef21b497 FOREIGN KEY (report_family_id) REFERENCES public.report_families(id) ON DELETE RESTRICT;


--
-- Name: registration_settings fk_rails_40695b33e5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_settings
    ADD CONSTRAINT fk_rails_40695b33e5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_resources fk_rails_4101702f57; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_resources
    ADD CONSTRAINT fk_rails_4101702f57 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: yoodli_user_assessments fk_rails_41044cc377; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yoodli_user_assessments
    ADD CONSTRAINT fk_rails_41044cc377 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id);


--
-- Name: active_storage_attachments fk_rails_416c0e3daf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT fk_rails_416c0e3daf FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communications fk_rails_41c5e93ac9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_41c5e93ac9 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: job_roles fk_rails_41e0791cf4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT fk_rails_41e0791cf4 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_assessors fk_rails_43709c1a28; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_assessors
    ADD CONSTRAINT fk_rails_43709c1a28 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: meeting_rooms fk_rails_43d463df7a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_rooms
    ADD CONSTRAINT fk_rails_43d463df7a FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_availability_dates fk_rails_4408ce5ec7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_availability_dates
    ADD CONSTRAINT fk_rails_4408ce5ec7 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: factors_scoring fk_rails_44210345ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_scoring
    ADD CONSTRAINT fk_rails_44210345ff FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: profile_fields fk_rails_44c222c31a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_fields
    ADD CONSTRAINT fk_rails_44c222c31a FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: skills_job_roles fk_rails_44d3a0575b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_job_roles
    ADD CONSTRAINT fk_rails_44d3a0575b FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: users fk_rails_45307c95a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_rails_45307c95a3 FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: skills_development_actions fk_rails_4593dac76e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_development_actions
    ADD CONSTRAINT fk_rails_4593dac76e FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: media_responses fk_rails_4769c5e3ce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_responses
    ADD CONSTRAINT fk_rails_4769c5e3ce FOREIGN KEY (users_result_id) REFERENCES public.users_results(id) ON DELETE CASCADE;


--
-- Name: clients fk_rails_47b47683a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT fk_rails_47b47683a3 FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: threesixty_options fk_rails_481a08952d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_options
    ADD CONSTRAINT fk_rails_481a08952d FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: sheets fk_rails_481da9714d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheets
    ADD CONSTRAINT fk_rails_481da9714d FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: clients fk_rails_4904dbddb8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT fk_rails_4904dbddb8 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: libraries fk_rails_491d7a5b1f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libraries
    ADD CONSTRAINT fk_rails_491d7a5b1f FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_instruction_template_translations fk_rails_4950e70e58; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_instruction_template_translations
    ADD CONSTRAINT fk_rails_4950e70e58 FOREIGN KEY (threesixty_instruction_template_id) REFERENCES public.threesixty_instruction_templates(id);


--
-- Name: communication_cc_users fk_rails_495dba4204; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_cc_users
    ADD CONSTRAINT fk_rails_495dba4204 FOREIGN KEY (communication_id) REFERENCES public.communications(id) ON DELETE CASCADE;


--
-- Name: resource_hogan_credentials fk_rails_49693360a7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_hogan_credentials
    ADD CONSTRAINT fk_rails_49693360a7 FOREIGN KEY (hogan_credential_id) REFERENCES public.hogan_credentials(id);


--
-- Name: sheet_columns fk_rails_49d87605e5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_columns
    ADD CONSTRAINT fk_rails_49d87605e5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_report_comments fk_rails_4a3b56dde9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_comments
    ADD CONSTRAINT fk_rails_4a3b56dde9 FOREIGN KEY (user_report_id) REFERENCES public.user_reports(id) ON DELETE CASCADE;


--
-- Name: application_url_whitelist_entries fk_rails_4ab0221ecf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_url_whitelist_entries
    ADD CONSTRAINT fk_rails_4ab0221ecf FOREIGN KEY (application_setting_id) REFERENCES public.application_settings(id) ON DELETE CASCADE;


--
-- Name: simulation_user_assessments fk_rails_4b5406d610; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulation_user_assessments
    ADD CONSTRAINT fk_rails_4b5406d610 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id) ON DELETE CASCADE;


--
-- Name: factor_benchmark_scores fk_rails_4c3153b621; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_benchmark_scores
    ADD CONSTRAINT fk_rails_4c3153b621 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: factor_benchmark_scores fk_rails_4ca0980ea6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_benchmark_scores
    ADD CONSTRAINT fk_rails_4ca0980ea6 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: dashboards fk_rails_4d4d1beb84; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT fk_rails_4d4d1beb84 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: project_assessments fk_rails_4e1aa7f7d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_assessments
    ADD CONSTRAINT fk_rails_4e1aa7f7d5 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: user_reflection_question_answers fk_rails_4e78d614fb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reflection_question_answers
    ADD CONSTRAINT fk_rails_4e78d614fb FOREIGN KEY (user_idp_plan_id) REFERENCES public.user_idp_plans(id) ON DELETE CASCADE;


--
-- Name: privacy_setting_translations fk_rails_4f38fd7ce2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_setting_translations
    ADD CONSTRAINT fk_rails_4f38fd7ce2 FOREIGN KEY (privacy_setting_id) REFERENCES public.privacy_settings(id);


--
-- Name: user_idp_skills fk_rails_4f4a0d21de; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_skills
    ADD CONSTRAINT fk_rails_4f4a0d21de FOREIGN KEY (deleted_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: idp_templates fk_rails_4f7686052e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_templates
    ADD CONSTRAINT fk_rails_4f7686052e FOREIGN KEY (report_id) REFERENCES public.reports(id);


--
-- Name: project_licenses fk_rails_4fca944b71; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_licenses
    ADD CONSTRAINT fk_rails_4fca944b71 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: idp_templates fk_rails_50e8be9955; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_templates
    ADD CONSTRAINT fk_rails_50e8be9955 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: users_results fk_rails_514f3ba943; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results
    ADD CONSTRAINT fk_rails_514f3ba943 FOREIGN KEY (occupation_condition_set_id) REFERENCES public.occupation_condition_sets(id);


--
-- Name: assessments fk_rails_516ec5451d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_rails_516ec5451d FOREIGN KEY (updated_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: client_auditlog_export_settings fk_rails_51a5f6cc28; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_auditlog_export_settings
    ADD CONSTRAINT fk_rails_51a5f6cc28 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: taggings fk_rails_51de8abb84; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT fk_rails_51de8abb84 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_assessors fk_rails_524f182ee9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_assessors
    ADD CONSTRAINT fk_rails_524f182ee9 FOREIGN KEY (workshop_id) REFERENCES public.workshops(id) ON DELETE CASCADE;


--
-- Name: campaign_ai_artifact_dependencies fk_rails_527a9ce116; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_ai_artifact_dependencies
    ADD CONSTRAINT fk_rails_527a9ce116 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: interview_questions fk_rails_53c904b7d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_questions
    ADD CONSTRAINT fk_rails_53c904b7d5 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: user_report_comments fk_rails_54fe2d8f31; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_comments
    ADD CONSTRAINT fk_rails_54fe2d8f31 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_factor_values fk_rails_576c8dd023; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_values
    ADD CONSTRAINT fk_rails_576c8dd023 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: sms_records fk_rails_58b8df5ee3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_records
    ADD CONSTRAINT fk_rails_58b8df5ee3 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: workshop_invited_subjects fk_rails_592e1c2e7f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invited_subjects
    ADD CONSTRAINT fk_rails_592e1c2e7f FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workshops fk_rails_5a18ed4b75; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT fk_rails_5a18ed4b75 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: lti_oauth2_access_tokens fk_rails_5aa1c20c50; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lti_oauth2_access_tokens
    ADD CONSTRAINT fk_rails_5aa1c20c50 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: admin_roles fk_rails_5ac63da10f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT fk_rails_5ac63da10f FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: membership_grants fk_rails_5ae73a639d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_grants
    ADD CONSTRAINT fk_rails_5ae73a639d FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_assistants fk_rails_5b2628499c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistants
    ADD CONSTRAINT fk_rails_5b2628499c FOREIGN KEY (last_modified_by_id) REFERENCES public.users(id);


--
-- Name: questions fk_rails_5b54a08d0b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_rails_5b54a08d0b FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_report_pdfs fk_rails_5b977973ce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_pdfs
    ADD CONSTRAINT fk_rails_5b977973ce FOREIGN KEY (user_report_id) REFERENCES public.user_reports(id);


--
-- Name: ai_factor_scores fk_rails_5bbde41351; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_factor_scores
    ADD CONSTRAINT fk_rails_5bbde41351 FOREIGN KEY (users_result_id) REFERENCES public.users_results(id);


--
-- Name: user_idp_plans fk_rails_5bddf269aa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_plans
    ADD CONSTRAINT fk_rails_5bddf269aa FOREIGN KEY (idp_template_id) REFERENCES public.idp_templates(id) ON DELETE RESTRICT;


--
-- Name: idp_template_interview_questions fk_rails_5c13980b03; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_interview_questions
    ADD CONSTRAINT fk_rails_5c13980b03 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communication_emails fk_rails_5c47ebbe76; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails
    ADD CONSTRAINT fk_rails_5c47ebbe76 FOREIGN KEY (workshop_id) REFERENCES public.workshops(id);


--
-- Name: taxonomy_levels fk_rails_5ceb3c0449; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxonomy_levels
    ADD CONSTRAINT fk_rails_5ceb3c0449 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_scoring_approval_settings fk_rails_5d3d4a6d03; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_scoring_approval_settings
    ADD CONSTRAINT fk_rails_5d3d4a6d03 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: campaign_factors fk_rails_5dd929bdc4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factors
    ADD CONSTRAINT fk_rails_5dd929bdc4 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: workshop_invite_logs fk_rails_5f05631202; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_logs
    ADD CONSTRAINT fk_rails_5f05631202 FOREIGN KEY (workshop_invite_id) REFERENCES public.workshop_invites(id) ON DELETE CASCADE;


--
-- Name: factors_sub_factors fk_rails_5f180a6f59; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_sub_factors
    ADD CONSTRAINT fk_rails_5f180a6f59 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_preferences fk_rails_608075df96; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT fk_rails_608075df96 FOREIGN KEY (tenant_id) REFERENCES public.clients(id);


--
-- Name: user_assessments fk_rails_60c2fd6734; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT fk_rails_60c2fd6734 FOREIGN KEY (subject_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: ai_factor_scores fk_rails_60d20d0f4f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_factor_scores
    ADD CONSTRAINT fk_rails_60d20d0f4f FOREIGN KEY (parent_factor_id) REFERENCES public.factors(id);


--
-- Name: campaign_assessments fk_rails_60f414e63f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessments
    ADD CONSTRAINT fk_rails_60f414e63f FOREIGN KEY (norm_id) REFERENCES public.norms(id) ON DELETE RESTRICT;


--
-- Name: saville_user_assessments fk_rails_60f7c22dd4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_user_assessments
    ADD CONSTRAINT fk_rails_60f7c22dd4 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id) ON DELETE CASCADE;


--
-- Name: threesixty_email_template_translations fk_rails_620a591be5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_template_translations
    ADD CONSTRAINT fk_rails_620a591be5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_idp_comments fk_rails_625bce6b01; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_comments
    ADD CONSTRAINT fk_rails_625bce6b01 FOREIGN KEY (resolved_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_reports fk_rails_6280270170; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_rails_6280270170 FOREIGN KEY (approver_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skill_aliases fk_rails_62ecda0058; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_aliases
    ADD CONSTRAINT fk_rails_62ecda0058 FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: application_public_keys fk_rails_63201df07f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_public_keys
    ADD CONSTRAINT fk_rails_63201df07f FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: communications fk_rails_639c49fe3d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_639c49fe3d FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: occupations fk_rails_63bf08b91c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations
    ADD CONSTRAINT fk_rails_63bf08b91c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports fk_rails_6437d9c02f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_rails_6437d9c02f FOREIGN KEY (updated_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: workshop_invite_translations fk_rails_6453ada747; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_translations
    ADD CONSTRAINT fk_rails_6453ada747 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communication_translations fk_rails_649fbaaf30; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_translations
    ADD CONSTRAINT fk_rails_649fbaaf30 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_managers fk_rails_64dc0c729a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_managers
    ADD CONSTRAINT fk_rails_64dc0c729a FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: factors_norms fk_rails_65037f07dc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_norms
    ADD CONSTRAINT fk_rails_65037f07dc FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_reports fk_rails_662ac624d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_rails_662ac624d5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_factors fk_rails_667cccdf0c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factors
    ADD CONSTRAINT fk_rails_667cccdf0c FOREIGN KEY (campaign_factor_group_id) REFERENCES public.campaign_factor_groups(id);


--
-- Name: profile_field_values fk_rails_67bd976b7b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_field_values
    ADD CONSTRAINT fk_rails_67bd976b7b FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: project_licenses fk_rails_67e6a7fdac; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_licenses
    ADD CONSTRAINT fk_rails_67e6a7fdac FOREIGN KEY (license_id) REFERENCES public.licenses(id);


--
-- Name: user_idp_comments fk_rails_67fb1b4907; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_comments
    ADD CONSTRAINT fk_rails_67fb1b4907 FOREIGN KEY (parent_id) REFERENCES public.user_idp_comments(id) ON DELETE CASCADE;


--
-- Name: webhook_subscriptions fk_rails_68548bd5a8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscriptions
    ADD CONSTRAINT fk_rails_68548bd5a8 FOREIGN KEY (deleted_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: users_results fk_rails_68864abce3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results
    ADD CONSTRAINT fk_rails_68864abce3 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_templates fk_rails_6914dfd8eb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_templates
    ADD CONSTRAINT fk_rails_6914dfd8eb FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: pearson_user_assessments fk_rails_6974a21fca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pearson_user_assessments
    ADD CONSTRAINT fk_rails_6974a21fca FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id) ON DELETE CASCADE;


--
-- Name: webhook_subscriptions fk_rails_69d6421690; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscriptions
    ADD CONSTRAINT fk_rails_69d6421690 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: campaign_factor_values fk_rails_6a0d5562d2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_values
    ADD CONSTRAINT fk_rails_6a0d5562d2 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: campaign_idp_dependencies fk_rails_6a5f6a838e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_idp_dependencies
    ADD CONSTRAINT fk_rails_6a5f6a838e FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: registration_codes fk_rails_6b0d3224cb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_codes
    ADD CONSTRAINT fk_rails_6b0d3224cb FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_reflection_question_answers fk_rails_6b85256d6b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reflection_question_answers
    ADD CONSTRAINT fk_rails_6b85256d6b FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: profile_field_values fk_rails_6bc6ed19b8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_field_values
    ADD CONSTRAINT fk_rails_6bc6ed19b8 FOREIGN KEY (profile_field_id) REFERENCES public.profile_fields(id) ON DELETE CASCADE;


--
-- Name: privacy_setting_translations fk_rails_6bc706fc4d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_setting_translations
    ADD CONSTRAINT fk_rails_6bc706fc4d FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: email_templates fk_rails_6bdfe93e2e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT fk_rails_6bdfe93e2e FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: development_actions fk_rails_6c3ca0d8a1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_actions
    ADD CONSTRAINT fk_rails_6c3ca0d8a1 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_assessments fk_rails_6ccad88168; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT fk_rails_6ccad88168 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE SET NULL;


--
-- Name: privacy_consents fk_rails_6cd91d815a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents
    ADD CONSTRAINT fk_rails_6cd91d815a FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: job_role_translations fk_rails_6d3315144b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_role_translations
    ADD CONSTRAINT fk_rails_6d3315144b FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id);


--
-- Name: registration_settings fk_rails_6dc2196721; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_settings
    ADD CONSTRAINT fk_rails_6dc2196721 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: factors fk_rails_6dd2ac3794; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors
    ADD CONSTRAINT fk_rails_6dd2ac3794 FOREIGN KEY (skill_id) REFERENCES public.skills(id);


--
-- Name: workshop_invite_logs fk_rails_6e03291780; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_logs
    ADD CONSTRAINT fk_rails_6e03291780 FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: campaign_ai_artifact_dependencies fk_rails_6e28ba4651; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_ai_artifact_dependencies
    ADD CONSTRAINT fk_rails_6e28ba4651 FOREIGN KEY (campaign_ai_artifact_id) REFERENCES public.campaign_ai_artifacts(id) ON DELETE CASCADE;


--
-- Name: security_settings fk_rails_6e59d3360c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_settings
    ADD CONSTRAINT fk_rails_6e59d3360c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: questions fk_rails_6ec04ddf91; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_rails_6ec04ddf91 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_invites fk_rails_6f5632544f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invites
    ADD CONSTRAINT fk_rails_6f5632544f FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_idp_comments fk_rails_6fb8f1ccac; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_comments
    ADD CONSTRAINT fk_rails_6fb8f1ccac FOREIGN KEY (user_idp_plan_id) REFERENCES public.user_idp_plans(id) ON DELETE CASCADE;


--
-- Name: user_assessments fk_rails_70902006e4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT fk_rails_70902006e4 FOREIGN KEY (norm_id) REFERENCES public.norms(id) ON DELETE SET NULL;


--
-- Name: skills_development_actions fk_rails_70b2e78217; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_development_actions
    ADD CONSTRAINT fk_rails_70b2e78217 FOREIGN KEY (development_action_id) REFERENCES public.development_actions(id) ON DELETE CASCADE;


--
-- Name: memberships_admin_roles fk_rails_712aed4296; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships_admin_roles
    ADD CONSTRAINT fk_rails_712aed4296 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_assessment_factor_scores fk_rails_71d3d729a1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_factor_scores
    ADD CONSTRAINT fk_rails_71d3d729a1 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id) ON DELETE CASCADE;


--
-- Name: bulk_reports fk_rails_72688d2e09; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulk_reports
    ADD CONSTRAINT fk_rails_72688d2e09 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: assessment_consent_settings fk_rails_7340e6fd68; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_consent_settings
    ADD CONSTRAINT fk_rails_7340e6fd68 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: assessment_translations fk_rails_73d33bf7fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_translations
    ADD CONSTRAINT fk_rails_73d33bf7fd FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: norms fk_rails_745f8fa5e7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT fk_rails_745f8fa5e7 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports_accesses fk_rails_74cd2e276f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses
    ADD CONSTRAINT fk_rails_74cd2e276f FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: text_module_overrides fk_rails_7558551b5d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_module_overrides
    ADD CONSTRAINT fk_rails_7558551b5d FOREIGN KEY (module_id) REFERENCES public.reports_modules(id) ON DELETE CASCADE;


--
-- Name: design_settings fk_rails_7751627d9c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.design_settings
    ADD CONSTRAINT fk_rails_7751627d9c FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: ai_assistant_requests fk_rails_77cb200183; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_requests
    ADD CONSTRAINT fk_rails_77cb200183 FOREIGN KEY (ai_model_registry_id) REFERENCES public.ai_model_registries(id);


--
-- Name: sheet_rows fk_rails_782a23bcc9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_rows
    ADD CONSTRAINT fk_rails_782a23bcc9 FOREIGN KEY (sheet_id) REFERENCES public.sheets(id) ON DELETE CASCADE;


--
-- Name: hogan_credentials fk_rails_783b6b7a7c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_credentials
    ADD CONSTRAINT fk_rails_783b6b7a7c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: privacy_consents fk_rails_78a8331821; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents
    ADD CONSTRAINT fk_rails_78a8331821 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: hogan_logs fk_rails_7920aef002; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_logs
    ADD CONSTRAINT fk_rails_7920aef002 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: text_module_overrides fk_rails_79319e5680; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_module_overrides
    ADD CONSTRAINT fk_rails_79319e5680 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: innovation_styles fk_rails_793ed7fb90; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.innovation_styles
    ADD CONSTRAINT fk_rails_793ed7fb90 FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id);


--
-- Name: sms_histories fk_rails_79c274d22c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_histories
    ADD CONSTRAINT fk_rails_79c274d22c FOREIGN KEY (sms_record_id) REFERENCES public.sms_records(id);


--
-- Name: ai_assistant_tool_calls fk_rails_79c54a9dce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_tool_calls
    ADD CONSTRAINT fk_rails_79c54a9dce FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communications_users fk_rails_7a00292b33; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_users
    ADD CONSTRAINT fk_rails_7a00292b33 FOREIGN KEY (communication_id) REFERENCES public.communications(id) ON DELETE CASCADE;


--
-- Name: factors fk_rails_7b28110d6b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors
    ADD CONSTRAINT fk_rails_7b28110d6b FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id) ON DELETE CASCADE;


--
-- Name: user_idp_plans fk_rails_7b601e5428; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_plans
    ADD CONSTRAINT fk_rails_7b601e5428 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: factor_translations fk_rails_7bc93eacca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_translations
    ADD CONSTRAINT fk_rails_7bc93eacca FOREIGN KEY (factor_id) REFERENCES public.factors(id) ON DELETE CASCADE;


--
-- Name: iiht_user_assessments fk_rails_7c920335f3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iiht_user_assessments
    ADD CONSTRAINT fk_rails_7c920335f3 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id);


--
-- Name: notifications fk_rails_7c99fe0556; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_rails_7c99fe0556 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: saml_settings fk_rails_7cfb21e09c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saml_settings
    ADD CONSTRAINT fk_rails_7cfb21e09c FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: idp_template_skills fk_rails_7d3a970a77; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_skills
    ADD CONSTRAINT fk_rails_7d3a970a77 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: system_check_records fk_rails_7d46b13fcb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_check_records
    ADD CONSTRAINT fk_rails_7d46b13fcb FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports_modules fk_rails_7d52ca6463; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_modules
    ADD CONSTRAINT fk_rails_7d52ca6463 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: workshop_invites fk_rails_7d9ff1544c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invites
    ADD CONSTRAINT fk_rails_7d9ff1544c FOREIGN KEY (campaign_assessment_group_id) REFERENCES public.campaign_assessment_groups(id) ON DELETE SET NULL;


--
-- Name: saml_service_providers fk_rails_7da955acbf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saml_service_providers
    ADD CONSTRAINT fk_rails_7da955acbf FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- Name: reports_campaign_ai_artifacts fk_rails_7dd73ea1a6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_campaign_ai_artifacts
    ADD CONSTRAINT fk_rails_7dd73ea1a6 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: proficiency_level_translations fk_rails_7e2f5d2b33; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency_level_translations
    ADD CONSTRAINT fk_rails_7e2f5d2b33 FOREIGN KEY (proficiency_level_id) REFERENCES public.proficiency_levels(id);


--
-- Name: mettl_assessments fk_rails_7f18bbad7b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_assessments
    ADD CONSTRAINT fk_rails_7f18bbad7b FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: highlights fk_rails_7f297908a0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.highlights
    ADD CONSTRAINT fk_rails_7f297908a0 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communications_assessments fk_rails_8164f9bc1a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_assessments
    ADD CONSTRAINT fk_rails_8164f9bc1a FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_assessments fk_rails_819dfa2a29; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT fk_rails_819dfa2a29 FOREIGN KEY (users_result_id) REFERENCES public.users_results(id) ON DELETE SET NULL;


--
-- Name: mhs_user_assessments fk_rails_81bd2b6ddf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mhs_user_assessments
    ADD CONSTRAINT fk_rails_81bd2b6ddf FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id);


--
-- Name: ai_assistant_requests fk_rails_81e44e1700; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_requests
    ADD CONSTRAINT fk_rails_81e44e1700 FOREIGN KEY (ai_assistant_id) REFERENCES public.ai_assistants(id);


--
-- Name: sheet_row_data fk_rails_82211a7ad0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_row_data
    ADD CONSTRAINT fk_rails_82211a7ad0 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_idp_comments fk_rails_824db9755d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_comments
    ADD CONSTRAINT fk_rails_824db9755d FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profile_fields fk_rails_837627e94f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_fields
    ADD CONSTRAINT fk_rails_837627e94f FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_users fk_rails_842e3c5f7e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_users
    ADD CONSTRAINT fk_rails_842e3c5f7e FOREIGN KEY (target_job_role_id) REFERENCES public.job_roles(id);


--
-- Name: assigns fk_rails_8538dc1cd7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_8538dc1cd7 FOREIGN KEY (subject_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: sheet_row_data fk_rails_85fbb5163d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_row_data
    ADD CONSTRAINT fk_rails_85fbb5163d FOREIGN KEY (sheet_row_id) REFERENCES public.sheet_rows(id) ON DELETE CASCADE;


--
-- Name: sms_invites fk_rails_860e8cda3d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_invites
    ADD CONSTRAINT fk_rails_860e8cda3d FOREIGN KEY (registered_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_idp_development_actions fk_rails_86286612db; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_development_actions
    ADD CONSTRAINT fk_rails_86286612db FOREIGN KEY (development_action_id) REFERENCES public.development_actions(id) ON DELETE CASCADE;


--
-- Name: user_profiles fk_rails_87a6352e58; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_rails_87a6352e58 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reports_accesses fk_rails_88e27a8e2d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses
    ADD CONSTRAINT fk_rails_88e27a8e2d FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: user_assessments fk_rails_892b304988; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT fk_rails_892b304988 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: user_report_events fk_rails_899d2b3ded; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_events
    ADD CONSTRAINT fk_rails_899d2b3ded FOREIGN KEY (initiator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_licenses fk_rails_89ca2fa15c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_licenses
    ADD CONSTRAINT fk_rails_89ca2fa15c FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- Name: privacy_consents fk_rails_8a77231dc4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents
    ADD CONSTRAINT fk_rails_8a77231dc4 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: webhook_event_logs fk_rails_8b120bcf25; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_event_logs
    ADD CONSTRAINT fk_rails_8b120bcf25 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: hogan_credentials fk_rails_8b50dd238d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_credentials
    ADD CONSTRAINT fk_rails_8b50dd238d FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: meeting_recordings fk_rails_8babb7808d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_recordings
    ADD CONSTRAINT fk_rails_8babb7808d FOREIGN KEY (meeting_room_id) REFERENCES public.meeting_rooms(id) ON DELETE CASCADE;


--
-- Name: job_groups fk_rails_8bebc41e84; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_groups
    ADD CONSTRAINT fk_rails_8bebc41e84 FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- Name: mettl_user_assessments fk_rails_8bf226c657; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_user_assessments
    ADD CONSTRAINT fk_rails_8bf226c657 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id) ON DELETE CASCADE;


--
-- Name: user_assessments fk_rails_8c39407ad4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT fk_rails_8c39407ad4 FOREIGN KEY (evaluator_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: design_settings fk_rails_8c47501b9a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.design_settings
    ADD CONSTRAINT fk_rails_8c47501b9a FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: client_ai_assistants fk_rails_8c95cbfa65; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_ai_assistants
    ADD CONSTRAINT fk_rails_8c95cbfa65 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: occupations_factors fk_rails_8da89aeab3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations_factors
    ADD CONSTRAINT fk_rails_8da89aeab3 FOREIGN KEY (occupation_condition_set_id) REFERENCES public.occupation_condition_sets(id) ON DELETE CASCADE;


--
-- Name: campaigns fk_rails_8de91ec8d1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT fk_rails_8de91ec8d1 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reflection_question_translations fk_rails_8dff8966af; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflection_question_translations
    ADD CONSTRAINT fk_rails_8dff8966af FOREIGN KEY (reflection_question_id) REFERENCES public.reflection_questions(id);


--
-- Name: campaign_factors fk_rails_8e6105ce73; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factors
    ADD CONSTRAINT fk_rails_8e6105ce73 FOREIGN KEY (factor_id) REFERENCES public.factors(id) ON DELETE RESTRICT;


--
-- Name: job_role_translations fk_rails_8e86d5b5e3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_role_translations
    ADD CONSTRAINT fk_rails_8e86d5b5e3 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_invited_subjects fk_rails_8ec909c062; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invited_subjects
    ADD CONSTRAINT fk_rails_8ec909c062 FOREIGN KEY (workshop_invite_id) REFERENCES public.workshop_invites(id) ON DELETE CASCADE;


--
-- Name: vector_embeddings fk_rails_8edacfd04b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vector_embeddings
    ADD CONSTRAINT fk_rails_8edacfd04b FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: project_assessments fk_rails_8fd810d074; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_assessments
    ADD CONSTRAINT fk_rails_8fd810d074 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: factors_sub_factors fk_rails_8feda8b335; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_sub_factors
    ADD CONSTRAINT fk_rails_8feda8b335 FOREIGN KEY (sub_factor_id) REFERENCES public.factors(id) ON DELETE CASCADE;


--
-- Name: communications fk_rails_904f7c8764; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_904f7c8764 FOREIGN KEY (sub_campaign_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: campaign_ai_artifacts fk_rails_90ae173860; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_ai_artifacts
    ADD CONSTRAINT fk_rails_90ae173860 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: norms fk_rails_922fac4f2e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT fk_rails_922fac4f2e FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: saville_report_settings fk_rails_92d211f01b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_report_settings
    ADD CONSTRAINT fk_rails_92d211f01b FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_email_templates fk_rails_93d2d461ed; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_templates
    ADD CONSTRAINT fk_rails_93d2d461ed FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


--
-- Name: campaign_idps fk_rails_93f035e4b1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_idps
    ADD CONSTRAINT fk_rails_93f035e4b1 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: assigns_reports fk_rails_9418a5a870; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns_reports
    ADD CONSTRAINT fk_rails_9418a5a870 FOREIGN KEY (assign_id) REFERENCES public.assigns(id) ON DELETE CASCADE;


--
-- Name: threesixty_instruction_templates fk_rails_945b478737; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_instruction_templates
    ADD CONSTRAINT fk_rails_945b478737 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: microsite_assessments fk_rails_95ef37ace3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.microsite_assessments
    ADD CONSTRAINT fk_rails_95ef37ace3 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: campaign_users fk_rails_962f0dea91; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_users
    ADD CONSTRAINT fk_rails_962f0dea91 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: sessions fk_rails_96502740f9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_rails_96502740f9 FOREIGN KEY (impersonator_id) REFERENCES public.users(id);


--
-- Name: threesixty_email_schedules fk_rails_965ab844ab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_schedules
    ADD CONSTRAINT fk_rails_965ab844ab FOREIGN KEY (template_id) REFERENCES public.threesixty_email_templates(id) ON DELETE SET NULL;


--
-- Name: workshop_invite_translations fk_rails_96cf57bb2e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_translations
    ADD CONSTRAINT fk_rails_96cf57bb2e FOREIGN KEY (workshop_invite_id) REFERENCES public.workshop_invites(id) ON DELETE CASCADE;


--
-- Name: reports_modules fk_rails_9748809208; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_modules
    ADD CONSTRAINT fk_rails_9748809208 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: assigns fk_rails_981aa6c161; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_981aa6c161 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: membership_grants fk_rails_98668bfd47; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_grants
    ADD CONSTRAINT fk_rails_98668bfd47 FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: sheets fk_rails_987c02568d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheets
    ADD CONSTRAINT fk_rails_987c02568d FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_instruction_template_translations fk_rails_98be498569; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_instruction_template_translations
    ADD CONSTRAINT fk_rails_98be498569 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_evaluators fk_rails_991c04b7d6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_evaluators
    ADD CONSTRAINT fk_rails_991c04b7d6 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: memberships fk_rails_99326fb65d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_99326fb65d FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: active_storage_variant_records fk_rails_993965df05; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_variant_records
    ADD CONSTRAINT fk_rails_993965df05 FOREIGN KEY (blob_id) REFERENCES public.active_storage_blobs(id);


--
-- Name: mettl_schedule_records fk_rails_993b57125e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_schedule_records
    ADD CONSTRAINT fk_rails_993b57125e FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: campaign_assessments fk_rails_99631752e1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessments
    ADD CONSTRAINT fk_rails_99631752e1 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: user_report_comments fk_rails_9a8fd863c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_comments
    ADD CONSTRAINT fk_rails_9a8fd863c2 FOREIGN KEY (parent_id) REFERENCES public.user_report_comments(id) ON DELETE CASCADE;


--
-- Name: assessment_consent_setting_translations fk_rails_9ad47467cc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_consent_setting_translations
    ADD CONSTRAINT fk_rails_9ad47467cc FOREIGN KEY (assessment_consent_setting_id) REFERENCES public.assessment_consent_settings(id);


--
-- Name: skillvue_assessments fk_rails_9ba716734a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skillvue_assessments
    ADD CONSTRAINT fk_rails_9ba716734a FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: idp_report_pdfs fk_rails_9bef385cc9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_report_pdfs
    ADD CONSTRAINT fk_rails_9bef385cc9 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports fk_rails_9c1b8d7e35; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_rails_9c1b8d7e35 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communications_memberships fk_rails_9c70af2c70; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_memberships
    ADD CONSTRAINT fk_rails_9c70af2c70 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_campaigns fk_rails_9cb58b8a3f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns
    ADD CONSTRAINT fk_rails_9cb58b8a3f FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE RESTRICT;


--
-- Name: saville_report_settings fk_rails_9dbdc763fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_report_settings
    ADD CONSTRAINT fk_rails_9dbdc763fd FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: factor_translations fk_rails_9dc88c24b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_translations
    ADD CONSTRAINT fk_rails_9dc88c24b2 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: assessments_reports fk_rails_9de6d6093f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_reports
    ADD CONSTRAINT fk_rails_9de6d6093f FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_assistant_chats fk_rails_9e1d60be6d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_chats
    ADD CONSTRAINT fk_rails_9e1d60be6d FOREIGN KEY (ai_model_registry_id) REFERENCES public.ai_model_registries(id);


--
-- Name: user_idp_comments fk_rails_9e711aa4d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_comments
    ADD CONSTRAINT fk_rails_9e711aa4d5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: taggings fk_rails_9fcd2e236b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taggings
    ADD CONSTRAINT fk_rails_9fcd2e236b FOREIGN KEY (tag_id) REFERENCES public.tags(id);


--
-- Name: user_assessments fk_rails_a0f5b5ec09; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT fk_rails_a0f5b5ec09 FOREIGN KEY (relationship_id) REFERENCES public.relationships(id) ON DELETE RESTRICT;


--
-- Name: user_report_comments fk_rails_a10e238eba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_comments
    ADD CONSTRAINT fk_rails_a10e238eba FOREIGN KEY (reports_module_id) REFERENCES public.reports_modules(id) ON DELETE CASCADE;


--
-- Name: api_keys fk_rails_a12322a5ba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT fk_rails_a12322a5ba FOREIGN KEY (updated_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: project_features fk_rails_a12db21c61; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_features
    ADD CONSTRAINT fk_rails_a12db21c61 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: profile_fields fk_rails_a132f26c57; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_fields
    ADD CONSTRAINT fk_rails_a132f26c57 FOREIGN KEY (profile_setting_id) REFERENCES public.profile_settings(id) ON DELETE CASCADE;


--
-- Name: idp_template_development_actions fk_rails_a1971262fa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_development_actions
    ADD CONSTRAINT fk_rails_a1971262fa FOREIGN KEY (development_action_id) REFERENCES public.development_actions(id) ON DELETE CASCADE;


--
-- Name: idp_templates fk_rails_a2aec4f928; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_templates
    ADD CONSTRAINT fk_rails_a2aec4f928 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_reminder_histories fk_rails_a2f976ebf2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_reminder_histories
    ADD CONSTRAINT fk_rails_a2f976ebf2 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: communications fk_rails_a3fa31bbf3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_a3fa31bbf3 FOREIGN KEY (campaign_assessment_group_id) REFERENCES public.campaign_assessment_groups(id) ON DELETE SET NULL;


--
-- Name: workshops fk_rails_a420799614; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT fk_rails_a420799614 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: skills_job_roles fk_rails_a518d3f016; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_job_roles
    ADD CONSTRAINT fk_rails_a518d3f016 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: text_module_overrides fk_rails_a5943c7cee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_module_overrides
    ADD CONSTRAINT fk_rails_a5943c7cee FOREIGN KEY (editor_id) REFERENCES public.users(id);


--
-- Name: campaign_assessor_assessments fk_rails_a5e89b4d8c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessments
    ADD CONSTRAINT fk_rails_a5e89b4d8c FOREIGN KEY (campaign_assessment_group_id) REFERENCES public.campaign_assessment_groups(id) ON DELETE SET NULL;


--
-- Name: user_report_events fk_rails_a5eeb9e965; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_events
    ADD CONSTRAINT fk_rails_a5eeb9e965 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_preferences fk_rails_a69bfcfd81; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT fk_rails_a69bfcfd81 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: assessments_clients fk_rails_a7b4e42c48; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_clients
    ADD CONSTRAINT fk_rails_a7b4e42c48 FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: saml_service_providers fk_rails_a926eacb83; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saml_service_providers
    ADD CONSTRAINT fk_rails_a926eacb83 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_assistant_chats fk_rails_a92f88de99; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_chats
    ADD CONSTRAINT fk_rails_a92f88de99 FOREIGN KEY (ai_assistant_id) REFERENCES public.ai_assistants(id);


--
-- Name: memberships fk_rails_a959f0d1fb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_a959f0d1fb FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communications_users fk_rails_a984a80778; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_users
    ADD CONSTRAINT fk_rails_a984a80778 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: report_families fk_rails_aadaa73397; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_families
    ADD CONSTRAINT fk_rails_aadaa73397 FOREIGN KEY (tenant_id) REFERENCES public.clients(id);


--
-- Name: agiles fk_rails_aaee109dc4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agiles
    ADD CONSTRAINT fk_rails_aaee109dc4 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: user_assessment_verification_images fk_rails_abb6eb0a48; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_verification_images
    ADD CONSTRAINT fk_rails_abb6eb0a48 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id) ON DELETE CASCADE;


--
-- Name: workshop_invited_subjects fk_rails_abd52ff719; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invited_subjects
    ADD CONSTRAINT fk_rails_abd52ff719 FOREIGN KEY (reschedule_workshop_id) REFERENCES public.workshops(id);


--
-- Name: user_idp_skills fk_rails_abf9c48254; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_skills
    ADD CONSTRAINT fk_rails_abf9c48254 FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: campaign_users fk_rails_ac3edb40a0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_users
    ADD CONSTRAINT fk_rails_ac3edb40a0 FOREIGN KEY (current_job_role_id) REFERENCES public.job_roles(id);


--
-- Name: user_assessment_verification_images fk_rails_ac7695fcce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_verification_images
    ADD CONSTRAINT fk_rails_ac7695fcce FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_factor_groups fk_rails_ac7ac4c1fa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_groups
    ADD CONSTRAINT fk_rails_ac7ac4c1fa FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_email_schedules fk_rails_ac81b040c5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_schedules
    ADD CONSTRAINT fk_rails_ac81b040c5 FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


--
-- Name: user_assessment_verification_media fk_rails_ad009f2bd6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_verification_media
    ADD CONSTRAINT fk_rails_ad009f2bd6 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id) ON DELETE CASCADE;


--
-- Name: reports_campaign_factors fk_rails_ad96b42625; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_campaign_factors
    ADD CONSTRAINT fk_rails_ad96b42625 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: dimensions fk_rails_ae68a3a37d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT fk_rails_ae68a3a37d FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: simulation_user_assessments fk_rails_ae6b550ac4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulation_user_assessments
    ADD CONSTRAINT fk_rails_ae6b550ac4 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communication_translations fk_rails_af0644ded0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_translations
    ADD CONSTRAINT fk_rails_af0644ded0 FOREIGN KEY (communication_id) REFERENCES public.communications(id);


--
-- Name: design_settings fk_rails_af556142e4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.design_settings
    ADD CONSTRAINT fk_rails_af556142e4 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: factor_benchmark_scores fk_rails_b025f0548c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_benchmark_scores
    ADD CONSTRAINT fk_rails_b025f0548c FOREIGN KEY (factor_id) REFERENCES public.factors(id);


--
-- Name: sms_records fk_rails_b03234e439; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_records
    ADD CONSTRAINT fk_rails_b03234e439 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: webhook_subscriptions fk_rails_b079b5ac77; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscriptions
    ADD CONSTRAINT fk_rails_b079b5ac77 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: system_check_sessions fk_rails_b07f269d86; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_check_sessions
    ADD CONSTRAINT fk_rails_b07f269d86 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: innovation_styles_factors fk_rails_b0b768b7ef; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.innovation_styles_factors
    ADD CONSTRAINT fk_rails_b0b768b7ef FOREIGN KEY (factor_id) REFERENCES public.factors(id);


--
-- Name: threesixty_evaluators fk_rails_b0d68ad21e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_evaluators
    ADD CONSTRAINT fk_rails_b0d68ad21e FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: communication_emails fk_rails_b0fa8c7a1b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails
    ADD CONSTRAINT fk_rails_b0fa8c7a1b FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: question_recoding fk_rails_b15be6b218; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_recoding
    ADD CONSTRAINT fk_rails_b15be6b218 FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: threesixty_campaigns fk_rails_b2d78bd457; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns
    ADD CONSTRAINT fk_rails_b2d78bd457 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: norms fk_rails_b3f9f037c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT fk_rails_b3f9f037c2 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: blocks fk_rails_b464d88af5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT fk_rails_b464d88af5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: innovation_styles_factors fk_rails_b67c448aab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.innovation_styles_factors
    ADD CONSTRAINT fk_rails_b67c448aab FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: privacy_links fk_rails_b70067b747; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_links
    ADD CONSTRAINT fk_rails_b70067b747 FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: campaign_assessor_assessment_factor_weights fk_rails_b77e3149f6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessment_factor_weights
    ADD CONSTRAINT fk_rails_b77e3149f6 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: norms fk_rails_b7d8a0337d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT fk_rails_b7d8a0337d FOREIGN KEY (updated_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: assessments fk_rails_b8a90301a9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_rails_b8a90301a9 FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: dimensions fk_rails_b8c3fe7ea4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT fk_rails_b8c3fe7ea4 FOREIGN KEY (default_occupation_condition_set_id) REFERENCES public.occupation_condition_sets(id) ON DELETE SET NULL;


--
-- Name: idp_template_interview_questions fk_rails_b9b361c335; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_interview_questions
    ADD CONSTRAINT fk_rails_b9b361c335 FOREIGN KEY (idp_template_id) REFERENCES public.idp_templates(id) ON DELETE CASCADE;


--
-- Name: workshops fk_rails_bad3af4e15; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT fk_rails_bad3af4e15 FOREIGN KEY (campaign_assessment_group_id) REFERENCES public.campaign_assessment_groups(id) ON DELETE SET NULL;


--
-- Name: communications_users fk_rails_bc228f8bf6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_users
    ADD CONSTRAINT fk_rails_bc228f8bf6 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sheet_columns fk_rails_bcdb1073fb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_columns
    ADD CONSTRAINT fk_rails_bcdb1073fb FOREIGN KEY (sheet_id) REFERENCES public.sheets(id);


--
-- Name: idp_templates fk_rails_bce39bdbc9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_templates
    ADD CONSTRAINT fk_rails_bce39bdbc9 FOREIGN KEY (ai_assistant_id) REFERENCES public.ai_assistants(id) ON DELETE SET NULL;


--
-- Name: threesixty_subjects fk_rails_bdd0f9c656; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects
    ADD CONSTRAINT fk_rails_bdd0f9c656 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_options fk_rails_be239b96ac; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_options
    ADD CONSTRAINT fk_rails_be239b96ac FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: proctoring_sessions fk_rails_be5ab3be9f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proctoring_sessions
    ADD CONSTRAINT fk_rails_be5ab3be9f FOREIGN KEY (campaign_user_id) REFERENCES public.campaign_users(id) ON DELETE CASCADE;


--
-- Name: reports_filters fk_rails_be92bb6806; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_filters
    ADD CONSTRAINT fk_rails_be92bb6806 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: smtp_settings fk_rails_bf519d8986; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smtp_settings
    ADD CONSTRAINT fk_rails_bf519d8986 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_reports fk_rails_c02c547c00; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT fk_rails_c02c547c00 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE RESTRICT;


--
-- Name: report_approval_settings fk_rails_c0e49f8ff2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_approval_settings
    ADD CONSTRAINT fk_rails_c0e49f8ff2 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: occupation_condition_sets fk_rails_c1f1e397b2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupation_condition_sets
    ADD CONSTRAINT fk_rails_c1f1e397b2 FOREIGN KEY (tenant_id) REFERENCES public.clients(id);


--
-- Name: user_idp_plans fk_rails_c2e94ce0f4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_plans
    ADD CONSTRAINT fk_rails_c2e94ce0f4 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: media_responses fk_rails_c34a28fea5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_responses
    ADD CONSTRAINT fk_rails_c34a28fea5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: active_storage_attachments fk_rails_c3b3935057; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_storage_attachments
    ADD CONSTRAINT fk_rails_c3b3935057 FOREIGN KEY (blob_id) REFERENCES public.active_storage_blobs(id);


--
-- Name: license_usages fk_rails_c3b6c6c33d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_c3b6c6c33d FOREIGN KEY (registration_code_id) REFERENCES public.registration_codes(id);


--
-- Name: smtp_settings fk_rails_c49f929933; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smtp_settings
    ADD CONSTRAINT fk_rails_c49f929933 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: idp_template_translations fk_rails_c4b210f807; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_translations
    ADD CONSTRAINT fk_rails_c4b210f807 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_idps fk_rails_c613668bf8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_idps
    ADD CONSTRAINT fk_rails_c613668bf8 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: proctoring_sessions fk_rails_c63aaef42d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proctoring_sessions
    ADD CONSTRAINT fk_rails_c63aaef42d FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: integrations fk_rails_c64246fbe5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT fk_rails_c64246fbe5 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: idp_template_skills fk_rails_c74dc02c61; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_skills
    ADD CONSTRAINT fk_rails_c74dc02c61 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE RESTRICT;


--
-- Name: workshop_subjects fk_rails_c7aa966031; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_subjects
    ADD CONSTRAINT fk_rails_c7aa966031 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_idp_development_actions fk_rails_c7e72c8a13; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_development_actions
    ADD CONSTRAINT fk_rails_c7e72c8a13 FOREIGN KEY (deleted_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: factor_benchmark_scores fk_rails_c83a2d4b31; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factor_benchmark_scores
    ADD CONSTRAINT fk_rails_c83a2d4b31 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: proficiency_levels fk_rails_c8ae3f4099; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency_levels
    ADD CONSTRAINT fk_rails_c8ae3f4099 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports_campaign_ai_artifacts fk_rails_c8d4637ba7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_campaign_ai_artifacts
    ADD CONSTRAINT fk_rails_c8d4637ba7 FOREIGN KEY (ai_assistant_id) REFERENCES public.ai_assistants(id);


--
-- Name: threesixty_email_histories fk_rails_c9b5f538f9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_histories
    ADD CONSTRAINT fk_rails_c9b5f538f9 FOREIGN KEY (subject_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: job_groups fk_rails_c9bd10dd9e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_groups
    ADD CONSTRAINT fk_rails_c9bd10dd9e FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: skills fk_rails_ca04e2fd46; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT fk_rails_ca04e2fd46 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: campaign_assessments fk_rails_cabfb7f2da; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessments
    ADD CONSTRAINT fk_rails_cabfb7f2da FOREIGN KEY (campaign_assessment_group_id) REFERENCES public.campaign_assessment_groups(id) ON DELETE CASCADE;


--
-- Name: taxonomy_levels fk_rails_cb13b90645; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taxonomy_levels
    ADD CONSTRAINT fk_rails_cb13b90645 FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- Name: workshop_managers fk_rails_cb61879a66; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_managers
    ADD CONSTRAINT fk_rails_cb61879a66 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: media_responses fk_rails_cbc8996aca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_responses
    ADD CONSTRAINT fk_rails_cbc8996aca FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: proctoring_sessions fk_rails_cbf6ba4401; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proctoring_sessions
    ADD CONSTRAINT fk_rails_cbf6ba4401 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id);


--
-- Name: assessments_clients fk_rails_cc339dda78; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_clients
    ADD CONSTRAINT fk_rails_cc339dda78 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: user_idp_development_actions fk_rails_cc6a771861; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_development_actions
    ADD CONSTRAINT fk_rails_cc6a771861 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_scoring_approval_settings fk_rails_cc75bf0bd2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_scoring_approval_settings
    ADD CONSTRAINT fk_rails_cc75bf0bd2 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: privacy_settings fk_rails_cd3488c540; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_settings
    ADD CONSTRAINT fk_rails_cd3488c540 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_assessor_assessment_factor_weights fk_rails_ce86ab4ccb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessment_factor_weights
    ADD CONSTRAINT fk_rails_ce86ab4ccb FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: skill_translations fk_rails_cf44d9c794; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_translations
    ADD CONSTRAINT fk_rails_cf44d9c794 FOREIGN KEY (skill_id) REFERENCES public.skills(id);


--
-- Name: campaigns fk_rails_cf4a35c4c9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT fk_rails_cf4a35c4c9 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: threesixty_campaigns fk_rails_cfede195a2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns
    ADD CONSTRAINT fk_rails_cfede195a2 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: campaign_factors fk_rails_cff428b57f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factors
    ADD CONSTRAINT fk_rails_cff428b57f FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_email_histories fk_rails_d00d71891f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_histories
    ADD CONSTRAINT fk_rails_d00d71891f FOREIGN KEY (evaluator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: licenses fk_rails_d0e4537c54; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT fk_rails_d0e4537c54 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: question_recoding fk_rails_d1991e6723; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_recoding
    ADD CONSTRAINT fk_rails_d1991e6723 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: user_reflection_question_answers fk_rails_d1daa1ae8e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reflection_question_answers
    ADD CONSTRAINT fk_rails_d1daa1ae8e FOREIGN KEY (reflection_question_id) REFERENCES public.reflection_questions(id) ON DELETE CASCADE;


--
-- Name: text_module_overrides fk_rails_d255d5b433; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.text_module_overrides
    ADD CONSTRAINT fk_rails_d255d5b433 FOREIGN KEY (user_report_id) REFERENCES public.user_reports(id) ON DELETE CASCADE;


--
-- Name: assigns fk_rails_d2e6622e0f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_d2e6622e0f FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: integrations fk_rails_d329ca1b17; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.integrations
    ADD CONSTRAINT fk_rails_d329ca1b17 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: clients_reports fk_rails_d336b71b0b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients_reports
    ADD CONSTRAINT fk_rails_d336b71b0b FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: license_usages fk_rails_d35fd7791e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_d35fd7791e FOREIGN KEY (license_id) REFERENCES public.licenses(id) ON DELETE CASCADE;


--
-- Name: idp_template_skills fk_rails_d36f05e26d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_skills
    ADD CONSTRAINT fk_rails_d36f05e26d FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: skillvue_user_assessments fk_rails_d3910f4496; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skillvue_user_assessments
    ADD CONSTRAINT fk_rails_d3910f4496 FOREIGN KEY (user_assessment_id) REFERENCES public.user_assessments(id);


--
-- Name: clients_reports fk_rails_d3a555a5c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients_reports
    ADD CONSTRAINT fk_rails_d3a555a5c2 FOREIGN KEY (report_family_id) REFERENCES public.report_families(id);


--
-- Name: campaign_assessor_assessments fk_rails_d47904be93; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessments
    ADD CONSTRAINT fk_rails_d47904be93 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: workshop_invites_workshops fk_rails_d4e62fe94f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invites_workshops
    ADD CONSTRAINT fk_rails_d4e62fe94f FOREIGN KEY (workshop_invite_id) REFERENCES public.workshop_invites(id) ON DELETE CASCADE;


--
-- Name: license_usages fk_rails_d511a75463; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_d511a75463 FOREIGN KEY (assigns_report_id) REFERENCES public.assigns_reports(id) ON DELETE SET NULL;


--
-- Name: proficiency_levels fk_rails_d5d16ef0fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proficiency_levels
    ADD CONSTRAINT fk_rails_d5d16ef0fd FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: workshop_managers fk_rails_d60918274d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_managers
    ADD CONSTRAINT fk_rails_d60918274d FOREIGN KEY (workshop_id) REFERENCES public.workshops(id) ON DELETE CASCADE;


--
-- Name: clients_reports fk_rails_d62c12c5d3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients_reports
    ADD CONSTRAINT fk_rails_d62c12c5d3 FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: ai_assistant_chats fk_rails_d6359b75ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_chats
    ADD CONSTRAINT fk_rails_d6359b75ff FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: highlights fk_rails_d662418e45; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.highlights
    ADD CONSTRAINT fk_rails_d662418e45 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ai_assisted_user_sessions fk_rails_d7280fb251; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assisted_user_sessions
    ADD CONSTRAINT fk_rails_d7280fb251 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: relationships fk_rails_d734d0e1e6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT fk_rails_d734d0e1e6 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: assessors fk_rails_d77930f003; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessors
    ADD CONSTRAINT fk_rails_d77930f003 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: hogan_report_settings fk_rails_d77e15b1b7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_report_settings
    ADD CONSTRAINT fk_rails_d77e15b1b7 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: idp_template_translations fk_rails_d812d00ca7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_translations
    ADD CONSTRAINT fk_rails_d812d00ca7 FOREIGN KEY (idp_template_id) REFERENCES public.idp_templates(id);


--
-- Name: idp_template_skills fk_rails_d863699667; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_skills
    ADD CONSTRAINT fk_rails_d863699667 FOREIGN KEY (idp_template_id) REFERENCES public.idp_templates(id) ON DELETE CASCADE;


--
-- Name: ai_factor_scores fk_rails_d8ab2df12d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_factor_scores
    ADD CONSTRAINT fk_rails_d8ab2df12d FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: libraries fk_rails_d8bfc9ac20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libraries
    ADD CONSTRAINT fk_rails_d8bfc9ac20 FOREIGN KEY (updated_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: client_translations fk_rails_d90d0664a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_translations
    ADD CONSTRAINT fk_rails_d90d0664a3 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_subjects fk_rails_d91185866e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects
    ADD CONSTRAINT fk_rails_d91185866e FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: campaign_assessments fk_rails_d92726ee86; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessments
    ADD CONSTRAINT fk_rails_d92726ee86 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: communications_assessments fk_rails_d9557c0769; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_assessments
    ADD CONSTRAINT fk_rails_d9557c0769 FOREIGN KEY (communication_id) REFERENCES public.communications(id);


--
-- Name: campaign_option_translations fk_rails_d98986c45a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_option_translations
    ADD CONSTRAINT fk_rails_d98986c45a FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: profile_field_values fk_rails_da47a0e23d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_field_values
    ADD CONSTRAINT fk_rails_da47a0e23d FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: application_settings fk_rails_da47b0ce69; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_settings
    ADD CONSTRAINT fk_rails_da47b0ce69 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: assessments fk_rails_da7f5005f0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_rails_da7f5005f0 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: factors_aliases fk_rails_da816dc3ab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_aliases
    ADD CONSTRAINT fk_rails_da816dc3ab FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: skill_aliases fk_rails_dae6991e57; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_aliases
    ADD CONSTRAINT fk_rails_dae6991e57 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_ai_artifacts fk_rails_db2057ad60; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_ai_artifacts
    ADD CONSTRAINT fk_rails_db2057ad60 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_profiles fk_rails_db79de0ef5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT fk_rails_db79de0ef5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports_pages fk_rails_db7fa0a509; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_pages
    ADD CONSTRAINT fk_rails_db7fa0a509 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: job_roles fk_rails_dbfcfb127b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT fk_rails_dbfcfb127b FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- Name: user_availability_days fk_rails_dc0c48bc79; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_availability_days
    ADD CONSTRAINT fk_rails_dc0c48bc79 FOREIGN KEY (user_availability_date_id) REFERENCES public.user_availability_dates(id) ON DELETE CASCADE;


--
-- Name: user_report_comments fk_rails_dc18fe0d04; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_comments
    ADD CONSTRAINT fk_rails_dc18fe0d04 FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skill_groups fk_rails_dc4f438553; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_groups
    ADD CONSTRAINT fk_rails_dc4f438553 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_users fk_rails_dd0d199f89; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_users
    ADD CONSTRAINT fk_rails_dd0d199f89 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: webhook_subscription_topics fk_rails_dd33716dd0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_subscription_topics
    ADD CONSTRAINT fk_rails_dd33716dd0 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: idp_templates fk_rails_dd38452656; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_templates
    ADD CONSTRAINT fk_rails_dd38452656 FOREIGN KEY (one_click_ai_assistant_id) REFERENCES public.ai_assistants(id) ON DELETE SET NULL;


--
-- Name: memberships_admin_roles fk_rails_dd856566e9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships_admin_roles
    ADD CONSTRAINT fk_rails_dd856566e9 FOREIGN KEY (admin_role_id) REFERENCES public.admin_roles(id) ON DELETE CASCADE;


--
-- Name: mettl_schedule_records fk_rails_dda6b322d7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mettl_schedule_records
    ADD CONSTRAINT fk_rails_dda6b322d7 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: client_ai_assistants fk_rails_de2abeae70; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_ai_assistants
    ADD CONSTRAINT fk_rails_de2abeae70 FOREIGN KEY (ai_assistant_id) REFERENCES public.ai_assistants(id);


--
-- Name: threesixty_email_histories fk_rails_dee061b324; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_histories
    ADD CONSTRAINT fk_rails_dee061b324 FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE CASCADE;


--
-- Name: communication_emails fk_rails_def9fc1a96; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails
    ADD CONSTRAINT fk_rails_def9fc1a96 FOREIGN KEY (campaign_user_id) REFERENCES public.campaign_users(id) ON DELETE CASCADE;


--
-- Name: sheet_row_data fk_rails_df2f5b23b1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_row_data
    ADD CONSTRAINT fk_rails_df2f5b23b1 FOREIGN KEY (sheet_column_id) REFERENCES public.sheet_columns(id) ON DELETE CASCADE;


--
-- Name: assessments_reports fk_rails_df744d4dd0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_reports
    ADD CONSTRAINT fk_rails_df744d4dd0 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: threesixty_reminder_histories fk_rails_e12dc4543e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_reminder_histories
    ADD CONSTRAINT fk_rails_e12dc4543e FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_saved_filters fk_rails_e25c5bac06; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_saved_filters
    ADD CONSTRAINT fk_rails_e25c5bac06 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ai_assistant_requests fk_rails_e310ce83f8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_requests
    ADD CONSTRAINT fk_rails_e310ce83f8 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: version_associations fk_rails_e35f5b7625; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.version_associations
    ADD CONSTRAINT fk_rails_e35f5b7625 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reflection_questions fk_rails_e37d558366; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflection_questions
    ADD CONSTRAINT fk_rails_e37d558366 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_assessments fk_rails_e37db7e3eb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessments
    ADD CONSTRAINT fk_rails_e37db7e3eb FOREIGN KEY (assessor_form_id) REFERENCES public.assessments(id) ON DELETE RESTRICT;


--
-- Name: user_idp_plans fk_rails_e4006a6748; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_plans
    ADD CONSTRAINT fk_rails_e4006a6748 FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_assessment_factor_scores fk_rails_e405efb3a1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_factor_scores
    ADD CONSTRAINT fk_rails_e405efb3a1 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: workshop_subjects fk_rails_e41aec218b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_subjects
    ADD CONSTRAINT fk_rails_e41aec218b FOREIGN KEY (workshop_invited_subject_id) REFERENCES public.workshop_invited_subjects(id) ON DELETE SET NULL;


--
-- Name: threesixty_subjects fk_rails_e425b52825; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects
    ADD CONSTRAINT fk_rails_e425b52825 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: user_report_comments fk_rails_e471e365a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_comments
    ADD CONSTRAINT fk_rails_e471e365a3 FOREIGN KEY (deleted_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: communications_assessments fk_rails_e5086a4dc7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_assessments
    ADD CONSTRAINT fk_rails_e5086a4dc7 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: workshop_invite_logs fk_rails_e5676f2fa7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshop_invite_logs
    ADD CONSTRAINT fk_rails_e5676f2fa7 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: sms_invites fk_rails_e5ead21bf8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_invites
    ADD CONSTRAINT fk_rails_e5ead21bf8 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_assistant_chats fk_rails_e6115669f1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_chats
    ADD CONSTRAINT fk_rails_e6115669f1 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: license_usages fk_rails_e622a076e5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_e622a076e5 FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- Name: mhs_user_assessments fk_rails_e7d7ca1dde; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mhs_user_assessments
    ADD CONSTRAINT fk_rails_e7d7ca1dde FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_idp_skills fk_rails_e822374aec; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_skills
    ADD CONSTRAINT fk_rails_e822374aec FOREIGN KEY (user_idp_plan_id) REFERENCES public.user_idp_plans(id) ON DELETE CASCADE;


--
-- Name: job_roles fk_rails_e89ecf4513; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT fk_rails_e89ecf4513 FOREIGN KEY (job_group_id) REFERENCES public.job_groups(id);


--
-- Name: assessment_translations fk_rails_e8b68f05ba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_translations
    ADD CONSTRAINT fk_rails_e8b68f05ba FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: sheet_rows fk_rails_e8feaeff28; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet_rows
    ADD CONSTRAINT fk_rails_e8feaeff28 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: development_action_translations fk_rails_e95d83a2fe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_action_translations
    ADD CONSTRAINT fk_rails_e95d83a2fe FOREIGN KEY (development_action_id) REFERENCES public.development_actions(id);


--
-- Name: threesixty_evaluators fk_rails_e96676a310; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_evaluators
    ADD CONSTRAINT fk_rails_e96676a310 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: dashboards fk_rails_ea67961578; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT fk_rails_ea67961578 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: bulk_reports fk_rails_ea7da51ed5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulk_reports
    ADD CONSTRAINT fk_rails_ea7da51ed5 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skills_job_roles fk_rails_eb22ce8ffe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skills_job_roles
    ADD CONSTRAINT fk_rails_eb22ce8ffe FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- Name: assigns_reports fk_rails_eb27834cf2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns_reports
    ADD CONSTRAINT fk_rails_eb27834cf2 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE RESTRICT;


--
-- Name: idp_templates fk_rails_eb7007f4f0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_templates
    ADD CONSTRAINT fk_rails_eb7007f4f0 FOREIGN KEY (document_analysis_ai_assistant_id) REFERENCES public.ai_assistants(id);


--
-- Name: user_report_events fk_rails_eb9cac4a43; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_report_events
    ADD CONSTRAINT fk_rails_eb9cac4a43 FOREIGN KEY (user_report_id) REFERENCES public.user_reports(id) ON DELETE CASCADE;


--
-- Name: idp_report_pdfs fk_rails_ec5513f5d4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_report_pdfs
    ADD CONSTRAINT fk_rails_ec5513f5d4 FOREIGN KEY (user_idp_plan_id) REFERENCES public.user_idp_plans(id);


--
-- Name: audit_logs fk_rails_ecbd71e2ce; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fk_rails_ecbd71e2ce FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: norms fk_rails_ecfeaf1ba0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT fk_rails_ecfeaf1ba0 FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id) ON DELETE RESTRICT;


--
-- Name: communication_cc_users fk_rails_ed3adcc70f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_cc_users
    ADD CONSTRAINT fk_rails_ed3adcc70f FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: campaign_assessor_assessments fk_rails_ee2e737b88; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_assessor_assessments
    ADD CONSTRAINT fk_rails_ee2e737b88 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: threesixty_email_templates fk_rails_ee64242b49; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_templates
    ADD CONSTRAINT fk_rails_ee64242b49 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: audit_logs fk_rails_ee678a1ab9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fk_rails_ee678a1ab9 FOREIGN KEY (impersonated_by_id) REFERENCES public.users(id);


--
-- Name: skill_groups fk_rails_eee5517ca5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_groups
    ADD CONSTRAINT fk_rails_eee5517ca5 FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- Name: campaign_factors fk_rails_ef0b6e1637; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factors
    ADD CONSTRAINT fk_rails_ef0b6e1637 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE RESTRICT;


--
-- Name: assessments fk_rails_ef32d4a334; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_rails_ef32d4a334 FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id) ON DELETE RESTRICT;


--
-- Name: reports_campaign_ai_artifacts fk_rails_ef96ec6fef; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_campaign_ai_artifacts
    ADD CONSTRAINT fk_rails_ef96ec6fef FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: assessment_assistants fk_rails_efe6237df0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_assistants
    ADD CONSTRAINT fk_rails_efe6237df0 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: communications fk_rails_efeba527b3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_efeba527b3 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: admin_jobs fk_rails_f051f81fee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_jobs
    ADD CONSTRAINT fk_rails_f051f81fee FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: assessments fk_rails_f076a5c10f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_rails_f076a5c10f FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_nomination_requirements fk_rails_f0f1000797; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_nomination_requirements
    ADD CONSTRAINT fk_rails_f0f1000797 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_assistants fk_rails_f14e9d0301; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistants
    ADD CONSTRAINT fk_rails_f14e9d0301 FOREIGN KEY (owner_id) REFERENCES public.clients(id);


--
-- Name: idp_template_development_actions fk_rails_f16ae884e9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_template_development_actions
    ADD CONSTRAINT fk_rails_f16ae884e9 FOREIGN KEY (idp_template_id) REFERENCES public.idp_templates(id) ON DELETE CASCADE;


--
-- Name: interview_questions fk_rails_f179bb7be6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.interview_questions
    ADD CONSTRAINT fk_rails_f179bb7be6 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: occupations_factors fk_rails_f1834f8dbf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations_factors
    ADD CONSTRAINT fk_rails_f1834f8dbf FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: idp_settings fk_rails_f18b32fc3c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.idp_settings
    ADD CONSTRAINT fk_rails_f18b32fc3c FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: clients fk_rails_f28b175e74; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT fk_rails_f28b175e74 FOREIGN KEY (modified_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: yoodli_user_assessments fk_rails_f2ce628c93; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yoodli_user_assessments
    ADD CONSTRAINT fk_rails_f2ce628c93 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: client_auditlog_export_settings fk_rails_f330a54325; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_auditlog_export_settings
    ADD CONSTRAINT fk_rails_f330a54325 FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: saville_user_assessments fk_rails_f33a76b413; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saville_user_assessments
    ADD CONSTRAINT fk_rails_f33a76b413 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reflection_questions fk_rails_f3551a0ee3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflection_questions
    ADD CONSTRAINT fk_rails_f3551a0ee3 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: project_assessments fk_rails_f36f27136e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_assessments
    ADD CONSTRAINT fk_rails_f36f27136e FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: license_usages fk_rails_f412a5330c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_f412a5330c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: api_keys fk_rails_f435faf77d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT fk_rails_f435faf77d FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: client_translations fk_rails_f4479d6612; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_translations
    ADD CONSTRAINT fk_rails_f4479d6612 FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: user_assessment_verification_media fk_rails_f4738fdb51; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_verification_media
    ADD CONSTRAINT fk_rails_f4738fdb51 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: license_usages fk_rails_f4894a9b56; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_f4894a9b56 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reflection_question_translations fk_rails_f5a66c415e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reflection_question_translations
    ADD CONSTRAINT fk_rails_f5a66c415e FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: assessors fk_rails_f693f76e0a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessors
    ADD CONSTRAINT fk_rails_f693f76e0a FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ai_assistant_output_schema_keys fk_rails_f6e524851c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assistant_output_schema_keys
    ADD CONSTRAINT fk_rails_f6e524851c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_nomination_requirements fk_rails_f78f0657d6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_nomination_requirements
    ADD CONSTRAINT fk_rails_f78f0657d6 FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


--
-- Name: agile_events fk_rails_f7d0aa809c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agile_events
    ADD CONSTRAINT fk_rails_f7d0aa809c FOREIGN KEY (assign_id) REFERENCES public.assigns(id) ON DELETE CASCADE;


--
-- Name: communication_email_resources fk_rails_f7eb156bc0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_email_resources
    ADD CONSTRAINT fk_rails_f7eb156bc0 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports_campaign_factors fk_rails_f82d6f32ac; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_campaign_factors
    ADD CONSTRAINT fk_rails_f82d6f32ac FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_factor_groups fk_rails_f82fe585a1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_factor_groups
    ADD CONSTRAINT fk_rails_f82fe585a1 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: ai_assisted_user_sessions fk_rails_f8424d4f42; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_assisted_user_sessions
    ADD CONSTRAINT fk_rails_f8424d4f42 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: campaign_options fk_rails_f8a1a37b68; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_options
    ADD CONSTRAINT fk_rails_f8a1a37b68 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: clients fk_rails_f99d964d82; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT fk_rails_f99d964d82 FOREIGN KEY (project_manager_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: assigns fk_rails_f9a46f0162; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_f9a46f0162 FOREIGN KEY (evaluator_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: campaigns fk_rails_f9de3f6425; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT fk_rails_f9de3f6425 FOREIGN KEY (default_idp_template_id) REFERENCES public.idp_templates(id) ON DELETE CASCADE;


--
-- Name: pearson_user_assessments fk_rails_fa0873e37c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pearson_user_assessments
    ADD CONSTRAINT fk_rails_fa0873e37c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: factors fk_rails_fade5b73f5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors
    ADD CONSTRAINT fk_rails_fade5b73f5 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: assessment_consent_setting_translations fk_rails_fb98bf721c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_consent_setting_translations
    ADD CONSTRAINT fk_rails_fb98bf721c FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: client_privacy_settings fk_rails_fbcbbfe438; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_privacy_settings
    ADD CONSTRAINT fk_rails_fbcbbfe438 FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: user_idp_development_actions fk_rails_fca1cf9d59; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_idp_development_actions
    ADD CONSTRAINT fk_rails_fca1cf9d59 FOREIGN KEY (user_idp_plan_id) REFERENCES public.user_idp_plans(id) ON DELETE CASCADE;


--
-- Name: user_assessment_factor_scores fk_rails_fceff3a97b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessment_factor_scores
    ADD CONSTRAINT fk_rails_fceff3a97b FOREIGN KEY (factor_id) REFERENCES public.factors(id) ON DELETE RESTRICT;


--
-- Name: user_bookings fk_rails_fd5eac44ec; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookings
    ADD CONSTRAINT fk_rails_fd5eac44ec FOREIGN KEY (tenant_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: client_ai_assistants fk_rails_fd6eb30a9b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_ai_assistants
    ADD CONSTRAINT fk_rails_fd6eb30a9b FOREIGN KEY (license_id) REFERENCES public.licenses(id);


--
-- Name: factors_sub_factors fk_rails_fe8dca5bf7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.factors_sub_factors
    ADD CONSTRAINT fk_rails_fe8dca5bf7 FOREIGN KEY (factor_id) REFERENCES public.factors(id) ON DELETE CASCADE;


--
-- Name: users fk_rails_fedc809cf8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_rails_fedc809cf8 FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20260724095212'),
('20260724091252'),
('20260724075701'),
('20260717000000'),
('20260713060835'),
('20260713060508'),
('20260709000000'),
('20260702091252'),
('20260702075701'),
('20260630180650'),
('20260630180649'),
('20260630180648'),
('20260619141340'),
('20260618120212'),
('20260618120113'),
('20260616103502'),
('20260615195000'),
('20260612100749'),
('20260612074019'),
('20260610152535'),
('20260605122018'),
('20260605000000'),
('20260603081303'),
('20260602120000'),
('20260602000002'),
('20260602000001'),
('20260527180000'),
('20260526000001'),
('20260520094000'),
('20260514200000'),
('20260513115126'),
('20260513115038'),
('20260513115037'),
('20260512165457'),
('20260511093000'),
('20260511092923'),
('20260507171240'),
('20260507171239'),
('20260507091734'),
('20260504120000'),
('20260424120000'),
('20260423084117'),
('20260417093000'),
('20260415153054'),
('20260414030000'),
('20260409120000'),
('20260408123820'),
('20260408120000'),
('20260401053041'),
('20260401045303'),
('20260401031414'),
('20260401030425'),
('20260331100000'),
('20260325000001'),
('20260323084342'),
('20260320102153'),
('20260320100000'),
('20260316160000'),
('20260314030950'),
('20260311085954'),
('20260310164641'),
('20260306120000'),
('20260306090626'),
('20260305110830'),
('20260304133958'),
('20260228091708'),
('20260225062612'),
('20260225060929'),
('20260224071226'),
('20260223114729'),
('20260218075116'),
('20260217103234'),
('20260213140414'),
('20260213112719'),
('20260213095708'),
('20260212131448'),
('20260212093958'),
('20260212060354'),
('20260211083300'),
('20260211000144'),
('20260210181932'),
('20260210130000'),
('20260210084851'),
('20260209204914'),
('20260209123134'),
('20260209114529'),
('20260209112420'),
('20260209020330'),
('20260204083410'),
('20260203070450'),
('20260203060658'),
('20260125173235'),
('20260124061828'),
('20260123131309'),
('20260123090109'),
('20260123071239'),
('20260122074311'),
('20260122034210'),
('20260119144024'),
('20260119122705'),
('20260119063943'),
('20260119052541'),
('20260119030942'),
('20260115095847'),
('20260113191036'),
('20260113121455'),
('20260113120000'),
('20260113071404'),
('20260112091820'),
('20260112072559'),
('20260109141947'),
('20260106133315'),
('20260102064238'),
('20260102051528'),
('20251217070713'),
('20251216163732'),
('20251215073428'),
('20251215063046'),
('20251214060951'),
('20251212110032'),
('20251212100342'),
('20251211083522'),
('20251210125615'),
('20251206120622'),
('20251201130649'),
('20251127063311'),
('20251125161740'),
('20251121123824'),
('20251121093812'),
('20251120061522'),
('20251118130440'),
('20251118103050'),
('20251118061850'),
('20251114123626'),
('20251112120914'),
('20251112112802'),
('20251105093356'),
('20251104075938'),
('20251101094930'),
('20251031101349'),
('20251031094133'),
('20251029094535'),
('20251029094056'),
('20251029073341'),
('20251027145358'),
('20251027054548'),
('20251027054547'),
('20251024105239'),
('20251024030039'),
('20251023050642'),
('20251015075724'),
('20251014070912'),
('20251012210205'),
('20251010111349'),
('20251010104305'),
('20251008145654'),
('20251008145653'),
('20251008144511'),
('20251008144510'),
('20251007225856'),
('20251007225411'),
('20251006101155'),
('20251006100719'),
('20251006071723'),
('20251003104731'),
('20251001034346'),
('20250930153016'),
('20250924140546'),
('20250917104111'),
('20250917090000'),
('20250915111321'),
('20250914210724'),
('20250911053831'),
('20250910080315'),
('20250909133040'),
('20250909093543'),
('20250908030102'),
('20250905055920'),
('20250904112108'),
('20250901091203'),
('20250901084702'),
('20250901060902'),
('20250828122244'),
('20250826115114'),
('20250825062532'),
('20250825030208'),
('20250821160002'),
('20250821160001'),
('20250821122411'),
('20250821102225'),
('20250821055720'),
('20250820163652'),
('20250807144839'),
('20250807141543'),
('20250807052600'),
('20250806140955'),
('20250806102146'),
('20250806080321'),
('20250804045044'),
('20250802165525'),
('20250801074743'),
('20250731114640'),
('20250731101510'),
('20250730134619'),
('20250728141620'),
('20250723144840'),
('20250723095133'),
('20250718071328'),
('20250715133541'),
('20250714092101'),
('20250714084320'),
('20250713120000'),
('20250712120001'),
('20250712120000'),
('20250711074243'),
('20250710074104'),
('20250709102014'),
('20250709100241'),
('20250704103208'),
('20250703094817'),
('20250703072154'),
('20250702073753'),
('20250701114237'),
('20250628000002'),
('20250627045222'),
('20250626102948'),
('20250625120000'),
('20250625073055'),
('20250624125911'),
('20250624110503'),
('20250623090517'),
('20250622122302'),
('20250622114250'),
('20250620104201'),
('20250620000000'),
('20250619111229'),
('20250618100750'),
('20250616132941'),
('20250616122251'),
('20250616053812'),
('20250613121201'),
('20250612122526'),
('20250611091619'),
('20250610070045'),
('20250609112516'),
('20250605154240'),
('20250605151652'),
('20250603083219'),
('20250602071331'),
('20250530122354'),
('20250530095701'),
('20250528132845'),
('20250528062059'),
('20250526181739'),
('20250526161051'),
('20250523071937'),
('20250522122128'),
('20250522061329'),
('20250521193031'),
('20250519061737'),
('20250519045905'),
('20250516082303'),
('20250515140030'),
('20250515123148'),
('20250514075923'),
('20250512082901'),
('20250507133702'),
('20250507113234'),
('20250507111247'),
('20250507102952'),
('20250506122929'),
('20250506113935'),
('20250505090254'),
('20250504102702'),
('20250430135151'),
('20250430110314'),
('20250429125102'),
('20250429103216'),
('20250427174443'),
('20250425102837'),
('20250423120813'),
('20250423114951'),
('20250421113712'),
('20250421113540'),
('20250421072058'),
('20250421071841'),
('20250416102558'),
('20250415070851'),
('20250415064739'),
('20250411120337'),
('20250411062532'),
('20250410170845'),
('20250410065159'),
('20250404115157'),
('20250326104351'),
('20250324124118'),
('20250320091944'),
('20250318075204'),
('20250305105355'),
('20250304084629'),
('20250304060832'),
('20250228060708'),
('20250226084133'),
('20250224095420'),
('20250224075920'),
('20250221102354'),
('20250221073030'),
('20250219224132'),
('20250213113601'),
('20250211125313'),
('20250210121434'),
('20250207113529'),
('20250206082916'),
('20250204092029'),
('20250130090802'),
('20250129060829'),
('20250127090320'),
('20250127043743'),
('20250124102224'),
('20250124101641'),
('20250123071220'),
('20250121155800'),
('20250121141028'),
('20250121134222'),
('20250121130354'),
('20250121061959'),
('20250115135401'),
('20250115134236'),
('20250113111540'),
('20250113105032'),
('20250113081931'),
('20250113070808'),
('20250110050233'),
('20250109001045'),
('20250107101319'),
('20250107095005'),
('20250106151909'),
('20250102162920'),
('20250102114258'),
('20241226171404'),
('20241224114259'),
('20241224114214'),
('20241224114112'),
('20241223122302'),
('20241220000000'),
('20241219131514'),
('20241219060937'),
('20241216104819'),
('20241216103218'),
('20241210073446'),
('20241205111711'),
('20241203151030'),
('20241129104313'),
('20241128105109'),
('20241126112602'),
('20241108085232'),
('20241106103020'),
('20241105093139'),
('20241101110602'),
('20241030111222'),
('20241025070422'),
('20241025042720'),
('20241023071718'),
('20241018100709'),
('20241015071157'),
('20241015064129'),
('20241013183453'),
('20241011121150'),
('20241010122532'),
('20241009075129'),
('20241008100312'),
('20241007113728'),
('20241001103146'),
('20240920142940'),
('20240920083324'),
('20240912114619'),
('20240911121555'),
('20240910083932'),
('20240905041021'),
('20240904115105'),
('20240904091820'),
('20240903092308'),
('20240902131904'),
('20240902112318'),
('20240830062230'),
('20240829113349'),
('20240827094045'),
('20240826085931'),
('20240826050104'),
('20240823114034'),
('20240822061229'),
('20240820083735'),
('20240816122815'),
('20240816043248'),
('20240814093440'),
('20240813091709'),
('20240809081127'),
('20240808093057'),
('20240806160845'),
('20240801132558'),
('20240801121907'),
('20240801093652'),
('20240721171706'),
('20240721171655'),
('20240705073952'),
('20240703110220'),
('20240628111224'),
('20240621084730'),
('20240619103701'),
('20240614104722'),
('20240606133151'),
('20240604174136'),
('20240604173936'),
('20240603125218'),
('20240603082942'),
('20240523124219'),
('20240523115956'),
('20240521084702'),
('20240514065558'),
('20240510095101'),
('20240508075421'),
('20240429145945'),
('20240426140020'),
('20240424120254'),
('20240424100332'),
('20240424072007'),
('20240419160359'),
('20240419121317'),
('20240419110536'),
('20240417083055'),
('20240416093121'),
('20240415123000'),
('20240403123008'),
('20240401134614'),
('20240401112155'),
('20240401110550'),
('20240328111136'),
('20240327093347'),
('20240325103207'),
('20240321100551'),
('20240321000000'),
('20240319091619'),
('20240314103438'),
('20240314103437'),
('20240314103436'),
('20240314103435'),
('20240314103434'),
('20240314103433'),
('20240314103432'),
('20240314080041'),
('20240307081523'),
('20240229091603'),
('20240221091507'),
('20240213142024'),
('20240213123231'),
('20240206082940'),
('20240131091031'),
('20240129143541'),
('20240126082502'),
('20240118090133'),
('20240117104237'),
('20240108124935'),
('20240108073500'),
('20231226114810'),
('20231219105643'),
('20231218084715'),
('20231213104811'),
('20231213080938'),
('20231211111901'),
('20231119201209'),
('20231117074000'),
('20231117072837'),
('20231117071951'),
('20231117071639'),
('20231112145927'),
('20231101104312'),
('20231030120937'),
('20231026090227'),
('20231020065639'),
('20231017110648'),
('20231006103234'),
('20231005095250'),
('20231005095208'),
('20231003130242'),
('20231003100838'),
('20230927131437'),
('20230926124141'),
('20230921123131'),
('20230920072704'),
('20230919093339'),
('20230919070332'),
('20230919051922'),
('20230918143010'),
('20230918133925'),
('20230912064131'),
('20230905113355'),
('20230829143631'),
('20230829124517'),
('20230824083112'),
('20230823110647'),
('20230822081633'),
('20230821100124'),
('20230821092143'),
('20230818140419'),
('20230818091139'),
('20230811114945'),
('20230810103629'),
('20230809193508'),
('20230809193337'),
('20230808200613'),
('20230807112038'),
('20230803064449'),
('20230801090740'),
('20230731105207'),
('20230728041212'),
('20230728040657'),
('20230727152255'),
('20230725084846'),
('20230721125540'),
('20230721123804'),
('20230719111228'),
('20230717125048'),
('20230627181938'),
('20230627162930'),
('20230615093244'),
('20230608150754'),
('20230608131331'),
('20230608131330'),
('20230608131329'),
('20230606123535'),
('20230531090613'),
('20230531090612'),
('20230518123651'),
('20230518075547'),
('20230511105741'),
('20230504155413'),
('20230417090859'),
('20230406132537'),
('20230328102230'),
('20230320091546'),
('20230317094144'),
('20230315112437'),
('20230223085853'),
('20230216143441'),
('20230207074200'),
('20230117130759'),
('20230116123826'),
('20230113060633'),
('20230112121853'),
('20230112110725'),
('20230110201437'),
('20221227102943'),
('20221214083458'),
('20221213173037'),
('20221208114251'),
('20221207122631'),
('20221207114653'),
('20221205213642'),
('20221128115835'),
('20221122172756'),
('20221122172755'),
('20221122133505'),
('20221108082420'),
('20221102142001'),
('20221102141534'),
('20221102140423'),
('20220929190534'),
('20220929123807'),
('20220927180013'),
('20220927143437'),
('20220920101241'),
('20220909080050'),
('20220908094242'),
('20220829100916'),
('20220822202512'),
('20220820184329'),
('20220818101822'),
('20220817165939'),
('20220817094010'),
('20220810132037'),
('20220809130239'),
('20220729103746'),
('20220728134015'),
('20220728121608'),
('20220728085459'),
('20220727115619'),
('20220727081709'),
('20220725113027'),
('20220721114549'),
('20220720075400'),
('20220714145940'),
('20220713095522'),
('20220712103553'),
('20220704083505'),
('20220630112848'),
('20220616103155'),
('20220613192348'),
('20220610114559'),
('20220609125511'),
('20220609124428'),
('20220609123501'),
('20220609120021'),
('20220609114435'),
('20220609112219'),
('20220609111758'),
('20220609110619'),
('20220609042528'),
('20220608104948'),
('20220606151635'),
('20220527125017'),
('20220527063033'),
('20220513062033'),
('20220512120041'),
('20220512111341'),
('20220428111329'),
('20220427143253'),
('20220425201109'),
('20220425192928'),
('20220412191741'),
('20220329105142'),
('20220321102808'),
('20220311105318'),
('20220311084649'),
('20220215140722'),
('20220201110758'),
('20220131062936'),
('20220131060602'),
('20220124132616'),
('20220121064435'),
('20220118121431'),
('20220114152459'),
('20220105083037'),
('20220105075135'),
('20220104123545'),
('20211219131442'),
('20211216105541'),
('20211209113042'),
('20211121115043'),
('20211114082155'),
('20211111110056'),
('20211102165147'),
('20211027170600'),
('20211026125300'),
('20211018123332'),
('20211018074847'),
('20211017084949'),
('20211013070031'),
('20211011103826'),
('20210919105932'),
('20210917131407'),
('20210913092232'),
('20210830121355'),
('20210823132111'),
('20210823120858'),
('20210812053648'),
('20210805081530'),
('20210804125607'),
('20210728151708'),
('20210718070252'),
('20210715124554'),
('20210627134315'),
('20210627110306'),
('20210623082242'),
('20210621071756'),
('20210617154459'),
('20210616195712'),
('20210614064633'),
('20210610160411'),
('20210606105059'),
('20210606072330'),
('20210531064834'),
('20210527094321'),
('20210518140350'),
('20210512100320'),
('20210509083519'),
('20210429142157'),
('20210419092225'),
('20210419090439'),
('20210411073736'),
('20210321142256'),
('20210321134006'),
('20210320201644'),
('20210319150315'),
('20210316134414'),
('20210308170950'),
('20210304111041'),
('20210304111031'),
('20210228092218'),
('20210216133140'),
('20210216092744'),
('20210215142202'),
('20210209133316'),
('20210209061539'),
('20210206160719'),
('20210201174626'),
('20210127111351'),
('20210124114207'),
('20210118113839'),
('20210112082218'),
('20210104093506'),
('20201226152556'),
('20201226142007'),
('20201223192549'),
('20201223181811'),
('20201223095358'),
('20201219091914'),
('20201216101338'),
('20201215150644'),
('20201210065543'),
('20201208081411'),
('20201117134043'),
('20201111132959'),
('20201110230420'),
('20201108094635'),
('20201021071559'),
('20201020224539'),
('20201020084827'),
('20201015102640'),
('20201011102042'),
('20201007072553'),
('20201007061140'),
('20201004131024'),
('20200930103418'),
('20200929061648'),
('20200927105604'),
('20200923102431'),
('20200922123931'),
('20200914055928'),
('20200913071803'),
('20200913050839'),
('20200909073506'),
('20200908070555'),
('20200903100939'),
('20200830120330'),
('20200826053004'),
('20200823094516'),
('20200823090240'),
('20200816155957'),
('20200802191402'),
('20200730091354'),
('20200729181439'),
('20200728071304'),
('20200727190907'),
('20200727142806'),
('20200726145344'),
('20200723074255'),
('20200723074036'),
('20200716130505'),
('20200712101935'),
('20200712100454'),
('20200709155934'),
('20200707220715'),
('20200705132139'),
('20200705114339'),
('20200702112737'),
('20200701154607'),
('20200701144435'),
('20200701104517'),
('20200630075308'),
('20200624204627'),
('20200531072928'),
('20200525102435'),
('20200524174421'),
('20200519155451'),
('20200420102632'),
('20200420102139'),
('20200420101736'),
('20200406101817'),
('20200402115623'),
('20200402112802'),
('20200402101021'),
('20200402100717'),
('20200326091232'),
('20200322064957'),
('20200318224159'),
('20200317122132'),
('20200303084836'),
('20200219084808'),
('20200216190542'),
('20200216190418'),
('20200207070850'),
('20200204141530'),
('20200127101833'),
('20200122113926'),
('20200119071623'),
('20191225145152'),
('20191218192252'),
('20191211142942'),
('20191111104014'),
('20191111083124'),
('20191110113047'),
('20191030081833'),
('20191029104332'),
('20191028205331'),
('20191016134103'),
('20191007075951'),
('20191001075231'),
('20190930140807'),
('20190930111830'),
('20190926112747'),
('20190926091345'),
('20190925143623'),
('20190925142902'),
('20190925063942'),
('20190917140510'),
('20190917122130'),
('20190917082805'),
('20190916212215'),
('20190916070101'),
('20190916070023'),
('20190915124839'),
('20190903131845'),
('20190902100625'),
('20190902100425'),
('20190901150954'),
('20190901055329'),
('20190829135506'),
('20190828084401'),
('20190827080838'),
('20190825132401'),
('20190825114742'),
('20190825080403'),
('20190819122944'),
('20190819122240'),
('20190805173213'),
('20190804195715'),
('20190728141145'),
('20190726090828'),
('20190726083527'),
('20190724064016'),
('20190724063809'),
('20190721170324'),
('20190721163707'),
('20190720204116'),
('20190717131104'),
('20190713155551'),
('20190710140100'),
('20190706094201'),
('20190703092738'),
('20190630092817'),
('20190620132719'),
('20190617125849'),
('20190613190324'),
('20190612132144'),
('20190612100829'),
('20190604121645'),
('20190601163131'),
('20190525115528'),
('20190523104920'),
('20190520160715'),
('20190507170817'),
('20190507170240'),
('20190507165939'),
('20190506131431'),
('20190501212516'),
('20190421102715'),
('20190419202055'),
('20190419193357'),
('20190419104112'),
('20190418194558'),
('20190411194041'),
('20190407142655'),
('20190407085318'),
('20190406205517'),
('20190406093054'),
('20190331125508'),
('20190315160908'),
('20190312220042'),
('20190304063803'),
('20190303082715'),
('20190221202711'),
('20190210123606'),
('20190210122115'),
('20190127164957'),
('20190113180725'),
('20190105160407'),
('20190101143027'),
('20181224184633'),
('20181217073128'),
('20181209135656'),
('20181124083412'),
('20181119095817'),
('20181118154257'),
('20181117114931'),
('20181114150808'),
('20181114075818'),
('20181112210040'),
('20181111105703'),
('20181103095056'),
('20181028180057'),
('20181028143714'),
('20181022210715'),
('20181013151355'),
('20181010120450'),
('20181002152730'),
('20180915101319'),
('20180731094932'),
('20180724151241'),
('20180723121434'),
('20180710120413'),
('20180619110647'),
('20180618090010'),
('20180601084716'),
('20180529094014'),
('20180522075755'),
('20180514140843'),
('20180504091841'),
('20180504082538'),
('20180504075242'),
('20180504074309'),
('20180503095443'),
('20180428143634'),
('20171212142402'),
('20171210004245'),
('20171208171730'),
('20171208153022'),
('20171207135522'),
('20171207080044'),
('20171206161732'),
('20171206151008'),
('20171201131314'),
('20171117122756'),
('20171117095652'),
('20171115115739'),
('20171115115658'),
('20171115115341'),
('20170725101235'),
('20170708231022'),
('20170706095454'),
('20170704060854'),
('20170629130155'),
('20170628110320'),
('20170628110310'),
('20170627145630'),
('20170627115325'),
('20170627080609'),
('20170626093642'),
('20170619095847'),
('20170619091417'),
('20170619080808'),
('20170613125409'),
('20170613120241'),
('20170613095544'),
('20170613075933'),
('20170607160409'),
('20170607153346'),
('20170607143545'),
('20170606124638'),
('20170605192137'),
('20170605123103'),
('20170529093632'),
('20170529070551'),
('20170525130219'),
('20170524094716'),
('20170523102840'),
('20170522131832'),
('20170301091546'),
('20170227091003'),
('20170224110918'),
('20170224073543'),
('20170222151629'),
('20170222125039'),
('20170222124313'),
('20170221140404'),
('20170221103830'),
('20170213114450'),
('20170206123137'),
('20170202144948'),
('20170117071238'),
('20170112124314'),
('20170112100616'),
('20170111162217'),
('20170110140747'),
('20170104152307'),
('20170103143542'),
('20170103114938'),
('20161230083037'),
('20161229135459'),
('20161229122752'),
('20161228155944'),
('20161228153020'),
('20161227132227'),
('20161223081235'),
('20161223065642'),
('20161221074304'),
('20161221074135'),
('20161215150257'),
('20161215150055'),
('20161215093728'),
('20161215061834'),
('20161214140548'),
('20161214081142'),
('20161212140458'),
('20161212094131'),
('20161202113205'),
('20161128114937'),
('20161128103519'),
('20161125125141'),
('20161125121349'),
('20161123094818'),
('20161121143132'),
('20161118142126'),
('20161115143900'),
('20161111102005'),
('20161110090142'),
('20161108112600'),
('20161103154036'),
('20161103111612'),
('20161102115438'),
('20161102110210'),
('20161102071143'),
('20161101141317'),
('20161031105418'),
('20161031105250'),
('20161031094940'),
('20161031091451'),
('20161027095910'),
('20161026120042'),
('20161026111535'),
('20161025154640'),
('20161025152859'),
('20161025151414'),
('20161021080332'),
('20161020145001'),
('20161019113157'),
('20161014065337'),
('20161013161101'),
('20161013134427'),
('20161013125051'),
('20161013102335'),
('20161013084133'),
('20161012114132'),
('20161011144225'),
('20161011141925'),
('20161010082144'),
('20160930140037'),
('20160923160817'),
('20160922072552'),
('20160920142609'),
('20160919082421'),
('20160919071110'),
('20160919070648'),
('20160916124428'),
('20160916111821'),
('20160913102254'),
('20160912064637'),
('20160909134047'),
('20160907162030'),
('20160907153406'),
('20160906140931'),
('20160901134715'),
('20160901125651'),
('20160830144749'),
('20160826113309'),
('20160819162030'),
('20160818140150'),
('20160815153553'),
('20160815094812'),
('20160804080947'),
('20160804075858'),
('20160803141451'),
('20160802155248'),
('20160802125448'),
('20160801134001'),
('20160801114116'),
('20160729153128'),
('20160729151936'),
('20160729132345'),
('20160729131418'),
('20160729125547'),
('20160728132804'),
('20160727114043'),
('20160720135509'),
('20160719133948'),
('20160719101711'),
('20160715170819'),
('20160715135817'),
('20160715101548'),
('20160712152012'),
('20160707123619'),
('20160704140756');

