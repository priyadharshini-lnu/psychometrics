--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.4
-- Dumped by pg_dump version 9.5.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: assessment_categories; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE assessment_categories AS ENUM (
    'psychometric',
    'organisational',
    '360'
);


--
-- Name: factors_norms_types; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE factors_norms_types AS ENUM (
    'yti',
    'eti'
);


--
-- Name: user_roles; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE user_roles AS ENUM (
    'superadmin',
    'admin',
    'manager',
    'user'
);


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: assessment_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE assessment_clients (
    id integer NOT NULL,
    assessment_id integer,
    client_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: assessment_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE assessment_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE assessment_clients_id_seq OWNED BY assessment_clients.id;


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE assessments (
    id integer NOT NULL,
    name character varying,
    category assessment_categories DEFAULT 'psychometric'::assessment_categories,
    dimension_id integer,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    flow json,
    norm_rules json,
    description text,
    timing character varying,
    access_reports_at timestamp without time zone
);


--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE assessments_id_seq OWNED BY assessments.id;


--
-- Name: assigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE assigns (
    id integer NOT NULL,
    assessment_id integer,
    results jsonb,
    scoring jsonb,
    embedded_data jsonb,
    status integer DEFAULT 0,
    role integer DEFAULT 0,
    completed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    step integer,
    membership_id integer,
    norm_data jsonb,
    agile_scoring jsonb,
    started_at timestamp without time zone
);


--
-- Name: assigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE assigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE assigns_id_seq OWNED BY assigns.id;


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE blocks (
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
    template_id integer
);


--
-- Name: blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE blocks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE blocks_id_seq OWNED BY blocks.id;


--
-- Name: client_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE client_reports (
    id integer NOT NULL,
    client_id integer,
    report_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    access_reports_at timestamp without time zone
);


--
-- Name: client_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE client_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE client_reports_id_seq OWNED BY client_reports.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE clients (
    id integer NOT NULL,
    name character varying,
    licenses integer DEFAULT 0,
    licenses_used integer DEFAULT 0,
    licenses_expire date,
    subdomain character varying,
    logo character varying,
    design json,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    background character varying
);


--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE clients_id_seq OWNED BY clients.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE comments (
    id integer NOT NULL,
    text character varying,
    created_by integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    question_id integer
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE comments_id_seq OWNED BY comments.id;


--
-- Name: communication_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE communication_emails (
    id integer NOT NULL,
    membership_id integer,
    communication_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: communication_emails_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE communication_emails_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communication_emails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE communication_emails_id_seq OWNED BY communication_emails.id;


--
-- Name: communications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE communications (
    id integer NOT NULL,
    subject character varying,
    body text,
    assessment_id integer,
    client_id integer,
    recipients integer DEFAULT 0,
    disabled boolean DEFAULT false,
    delivery_rule integer DEFAULT 0,
    delivery_at timestamp without time zone,
    delivery_interval character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: communications_copy_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE communications_copy_memberships (
    communication_id integer NOT NULL,
    membership_id integer NOT NULL
);


--
-- Name: communications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE communications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE communications_id_seq OWNED BY communications.id;


--
-- Name: communications_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE communications_memberships (
    communication_id integer NOT NULL,
    membership_id integer NOT NULL
);


--
-- Name: data_geos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE data_geos (
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

CREATE SEQUENCE data_geos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_geos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE data_geos_id_seq OWNED BY data_geos.id;


--
-- Name: dimensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE dimensions (
    id integer NOT NULL,
    name character varying,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    factors_count integer DEFAULT 0
);


--
-- Name: dimensions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE dimensions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dimensions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE dimensions_id_seq OWNED BY dimensions.id;


--
-- Name: factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE factors (
    id integer NOT NULL,
    name character varying,
    subfactors_count integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    dimension_id integer,
    parent_id integer,
    disabled boolean DEFAULT false,
    icon character varying,
    description text
);


--
-- Name: factors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE factors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE factors_id_seq OWNED BY factors.id;


--
-- Name: factors_norms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE factors_norms (
    id integer NOT NULL,
    type factors_norms_types,
    factor_id integer,
    norm_id integer,
    props json
);


--
-- Name: factors_norms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE factors_norms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factors_norms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE factors_norms_id_seq OWNED BY factors_norms.id;


--
-- Name: factors_scoring; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE factors_scoring (
    id integer NOT NULL,
    props json,
    factor_id integer,
    assessment_id integer,
    question_id integer
);


--
-- Name: factors_scoring_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE factors_scoring_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: factors_scoring_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE factors_scoring_id_seq OWNED BY factors_scoring.id;


--
-- Name: libraries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE libraries (
    id integer NOT NULL,
    name character varying,
    description text,
    type integer DEFAULT 0,
    file character varying,
    parent_id integer,
    lft integer NOT NULL,
    rgt integer NOT NULL,
    depth integer DEFAULT 0 NOT NULL,
    children_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: libraries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE libraries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: libraries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE libraries_id_seq OWNED BY libraries.id;


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE memberships (
    id integer NOT NULL,
    client_id integer,
    user_id integer,
    parent_id integer,
    lft integer,
    rgt integer,
    depth integer,
    children_count integer,
    hris jsonb DEFAULT '{}'::jsonb,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE memberships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE memberships_id_seq OWNED BY memberships.id;


--
-- Name: norms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE norms (
    id integer NOT NULL,
    name character varying,
    disabled boolean DEFAULT false,
    created_by integer,
    updated_by integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    dimension_id integer
);


--
-- Name: norms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE norms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: norms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE norms_id_seq OWNED BY norms.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE notifications (
    id integer NOT NULL,
    text character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assessment_id integer,
    membership_id integer
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE notifications_id_seq OWNED BY notifications.id;


--
-- Name: occupations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE occupations (
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
    bachelors_or_masters_qualification text
);


--
-- Name: occupations_factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE occupations_factors (
    id integer NOT NULL,
    occupation_id integer,
    factor_id integer,
    predicate character varying,
    value double precision,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: occupations_factors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE occupations_factors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: occupations_factors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE occupations_factors_id_seq OWNED BY occupations_factors.id;


--
-- Name: occupations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE occupations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: occupations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE occupations_id_seq OWNED BY occupations.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE questions (
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
    assessment_id integer
);


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE questions_id_seq OWNED BY questions.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE reports (
    id integer NOT NULL,
    assessment_id integer,
    name character varying,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: reports_filters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE reports_filters (
    id integer NOT NULL,
    report_id integer,
    name character varying,
    conditions json,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: reports_filters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE reports_filters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_filters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE reports_filters_id_seq OWNED BY reports_filters.id;


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE reports_id_seq OWNED BY reports.id;


--
-- Name: reports_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE reports_modules (
    id integer NOT NULL,
    page_id integer,
    name character varying,
    props json,
    "position" integer,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    type character varying
);


--
-- Name: reports_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE reports_modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE reports_modules_id_seq OWNED BY reports_modules.id;


--
-- Name: reports_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE reports_pages (
    id integer NOT NULL,
    report_id integer,
    name character varying,
    props json,
    "position" integer,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: reports_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE reports_pages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE reports_pages_id_seq OWNED BY reports_pages.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE schema_migrations (
    version character varying NOT NULL
);


--
-- Name: translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE translations (
    id integer NOT NULL,
    translateable_type character varying,
    translateable_id integer,
    props json DEFAULT '{}'::json,
    locale character varying(4),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    resource_type character varying,
    resource_id integer
);


--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE translations_id_seq OWNED BY translations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    id integer NOT NULL,
    email character varying DEFAULT ''::character varying NOT NULL,
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
    role character varying DEFAULT 'Users::Member'::character varying,
    invitation_token character varying,
    invitation_created_at timestamp without time zone,
    invitation_sent_at timestamp without time zone,
    invitation_accepted_at timestamp without time zone,
    invitation_limit integer,
    invited_by_type character varying,
    invited_by_id integer,
    invitations_count integer DEFAULT 0,
    authentication_token character varying(30),
    is_anonym boolean DEFAULT false
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY assessment_clients ALTER COLUMN id SET DEFAULT nextval('assessment_clients_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY assessments ALTER COLUMN id SET DEFAULT nextval('assessments_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns ALTER COLUMN id SET DEFAULT nextval('assigns_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY blocks ALTER COLUMN id SET DEFAULT nextval('blocks_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY client_reports ALTER COLUMN id SET DEFAULT nextval('client_reports_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients ALTER COLUMN id SET DEFAULT nextval('clients_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments ALTER COLUMN id SET DEFAULT nextval('comments_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY communication_emails ALTER COLUMN id SET DEFAULT nextval('communication_emails_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY communications ALTER COLUMN id SET DEFAULT nextval('communications_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY data_geos ALTER COLUMN id SET DEFAULT nextval('data_geos_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY dimensions ALTER COLUMN id SET DEFAULT nextval('dimensions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors ALTER COLUMN id SET DEFAULT nextval('factors_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors_norms ALTER COLUMN id SET DEFAULT nextval('factors_norms_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors_scoring ALTER COLUMN id SET DEFAULT nextval('factors_scoring_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY libraries ALTER COLUMN id SET DEFAULT nextval('libraries_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships ALTER COLUMN id SET DEFAULT nextval('memberships_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms ALTER COLUMN id SET DEFAULT nextval('norms_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY notifications ALTER COLUMN id SET DEFAULT nextval('notifications_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY occupations ALTER COLUMN id SET DEFAULT nextval('occupations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY occupations_factors ALTER COLUMN id SET DEFAULT nextval('occupations_factors_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions ALTER COLUMN id SET DEFAULT nextval('questions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports ALTER COLUMN id SET DEFAULT nextval('reports_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_filters ALTER COLUMN id SET DEFAULT nextval('reports_filters_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_modules ALTER COLUMN id SET DEFAULT nextval('reports_modules_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_pages ALTER COLUMN id SET DEFAULT nextval('reports_pages_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY translations ALTER COLUMN id SET DEFAULT nextval('translations_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: assessment_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assessment_clients
    ADD CONSTRAINT assessment_clients_pkey PRIMARY KEY (id);


--
-- Name: assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: assigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns
    ADD CONSTRAINT assigns_pkey PRIMARY KEY (id);


--
-- Name: blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: client_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY client_reports
    ADD CONSTRAINT client_reports_pkey PRIMARY KEY (id);


--
-- Name: clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communication_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY communication_emails
    ADD CONSTRAINT communication_emails_pkey PRIMARY KEY (id);


--
-- Name: communications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY communications
    ADD CONSTRAINT communications_pkey PRIMARY KEY (id);


--
-- Name: data_geos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY data_geos
    ADD CONSTRAINT data_geos_pkey PRIMARY KEY (id);


--
-- Name: dimensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY dimensions
    ADD CONSTRAINT dimensions_pkey PRIMARY KEY (id);


--
-- Name: factors_norms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors_norms
    ADD CONSTRAINT factors_norms_pkey PRIMARY KEY (id);


--
-- Name: factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors
    ADD CONSTRAINT factors_pkey PRIMARY KEY (id);


--
-- Name: factors_scoring_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors_scoring
    ADD CONSTRAINT factors_scoring_pkey PRIMARY KEY (id);


--
-- Name: libraries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY libraries
    ADD CONSTRAINT libraries_pkey PRIMARY KEY (id);


--
-- Name: memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: norms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms
    ADD CONSTRAINT norms_pkey PRIMARY KEY (id);


--
-- Name: notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: occupations_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY occupations_factors
    ADD CONSTRAINT occupations_factors_pkey PRIMARY KEY (id);


--
-- Name: occupations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY occupations
    ADD CONSTRAINT occupations_pkey PRIMARY KEY (id);


--
-- Name: questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: reports_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_filters
    ADD CONSTRAINT reports_filters_pkey PRIMARY KEY (id);


--
-- Name: reports_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_modules
    ADD CONSTRAINT reports_modules_pkey PRIMARY KEY (id);


--
-- Name: reports_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_pages
    ADD CONSTRAINT reports_pages_pkey PRIMARY KEY (id);


--
-- Name: reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: index_assessment_clients_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_clients_on_assessment_id ON assessment_clients USING btree (assessment_id);


--
-- Name: index_assessment_clients_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessment_clients_on_client_id ON assessment_clients USING btree (client_id);


--
-- Name: index_assessments_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_dimension_id ON assessments USING btree (dimension_id);


--
-- Name: index_assigns_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_on_membership_id ON assigns USING btree (membership_id);


--
-- Name: index_blocks_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_blocks_on_assessment_id ON blocks USING btree (assessment_id);


--
-- Name: index_blocks_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_blocks_on_template_id ON blocks USING btree (template_id);


--
-- Name: index_client_reports_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_reports_on_client_id ON client_reports USING btree (client_id);


--
-- Name: index_client_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_client_reports_on_report_id ON client_reports USING btree (report_id);


--
-- Name: index_clients_on_subdomain; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_clients_on_subdomain ON clients USING btree (subdomain);


--
-- Name: index_comments_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_comments_on_question_id ON comments USING btree (question_id);


--
-- Name: index_communication_emails_on_communication_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_communication_id ON communication_emails USING btree (communication_id);


--
-- Name: index_communication_emails_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_membership_id ON communication_emails USING btree (membership_id);


--
-- Name: index_communications_copy_memberships; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_copy_memberships ON communications_copy_memberships USING btree (communication_id, membership_id);


--
-- Name: index_communications_memberships; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_memberships ON communications_memberships USING btree (communication_id, membership_id);


--
-- Name: index_communications_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_assessment_id ON communications USING btree (assessment_id);


--
-- Name: index_communications_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_client_id ON communications USING btree (client_id);


--
-- Name: index_factors_norms_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_norms_on_factor_id ON factors_norms USING btree (factor_id);


--
-- Name: index_factors_norms_on_norm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_norms_on_norm_id ON factors_norms USING btree (norm_id);


--
-- Name: index_factors_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_on_dimension_id ON factors USING btree (dimension_id);


--
-- Name: index_factors_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_on_parent_id ON factors USING btree (parent_id);


--
-- Name: index_factors_scoring_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_assessment_id ON factors_scoring USING btree (assessment_id);


--
-- Name: index_factors_scoring_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_factor_id ON factors_scoring USING btree (factor_id);


--
-- Name: index_factors_scoring_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_question_id ON factors_scoring USING btree (question_id);


--
-- Name: index_libraries_on_lft; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_lft ON libraries USING btree (lft);


--
-- Name: index_libraries_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_parent_id ON libraries USING btree (parent_id);


--
-- Name: index_libraries_on_rgt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_rgt ON libraries USING btree (rgt);


--
-- Name: index_memberships_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_client_id ON memberships USING btree (client_id);


--
-- Name: index_memberships_on_client_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_memberships_on_client_id_and_user_id ON memberships USING btree (client_id, user_id);


--
-- Name: index_memberships_on_hris; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_hris ON memberships USING gin (hris);


--
-- Name: index_memberships_on_lft; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_lft ON memberships USING btree (lft);


--
-- Name: index_memberships_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_parent_id ON memberships USING btree (parent_id);


--
-- Name: index_memberships_on_rgt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_rgt ON memberships USING btree (rgt);


--
-- Name: index_memberships_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_user_id ON memberships USING btree (user_id);


--
-- Name: index_norms_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_norms_on_dimension_id ON norms USING btree (dimension_id);


--
-- Name: index_notifications_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_assessment_id ON notifications USING btree (assessment_id);


--
-- Name: index_notifications_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_membership_id ON notifications USING btree (membership_id);


--
-- Name: index_occupations_factors_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_factors_on_factor_id ON occupations_factors USING btree (factor_id);


--
-- Name: index_occupations_factors_on_occupation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_factors_on_occupation_id ON occupations_factors USING btree (occupation_id);


--
-- Name: index_occupations_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_on_dimension_id ON occupations USING btree (dimension_id);


--
-- Name: index_questions_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_assessment_id ON questions USING btree (assessment_id);


--
-- Name: index_questions_on_block_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_block_id ON questions USING btree (block_id);


--
-- Name: index_questions_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_template_id ON questions USING btree (template_id);


--
-- Name: index_reports_filters_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_filters_on_report_id ON reports_filters USING btree (report_id);


--
-- Name: index_reports_modules_on_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_modules_on_page_id ON reports_modules USING btree (page_id);


--
-- Name: index_reports_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_on_assessment_id ON reports USING btree (assessment_id);


--
-- Name: index_reports_pages_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_pages_on_report_id ON reports_pages USING btree (report_id);


--
-- Name: index_translations_on_resource_type_and_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_translations_on_resource_type_and_resource_id ON translations USING btree (resource_type, resource_id);


--
-- Name: index_translations_on_translateable_type_and_translateable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_translations_on_translateable_type_and_translateable_id ON translations USING btree (translateable_type, translateable_id);


--
-- Name: index_users_on_authentication_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_authentication_token ON users USING btree (authentication_token);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_email ON users USING btree (email);


--
-- Name: index_users_on_invitation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_invitation_token ON users USING btree (invitation_token);


--
-- Name: index_users_on_invitations_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_invitations_count ON users USING btree (invitations_count);


--
-- Name: index_users_on_invited_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_invited_by_id ON users USING btree (invited_by_id);


--
-- Name: index_users_on_reset_password_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_reset_password_token ON users USING btree (reset_password_token);


--
-- Name: fk_rails_385eeb68ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships
    ADD CONSTRAINT fk_rails_385eeb68ea FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;


--
-- Name: fk_rails_7f3b1733e2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT fk_rails_7f3b1733e2 FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: fk_rails_922fac4f2e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms
    ADD CONSTRAINT fk_rails_922fac4f2e FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: fk_rails_99326fb65d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships
    ADD CONSTRAINT fk_rails_99326fb65d FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: fk_rails_b7d8a0337d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms
    ADD CONSTRAINT fk_rails_b7d8a0337d FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO schema_migrations (version) VALUES ('20160704140756'), ('20160707123619'), ('20160712152012'), ('20160715101548'), ('20160715135817'), ('20160715170819'), ('20160719101711'), ('20160719133948'), ('20160720135509'), ('20160727114043'), ('20160728132804'), ('20160729125547'), ('20160729131418'), ('20160729132345'), ('20160729151936'), ('20160729153128'), ('20160801114116'), ('20160801134001'), ('20160802125448'), ('20160802155248'), ('20160803141451'), ('20160804075858'), ('20160804080947'), ('20160815094812'), ('20160815153553'), ('20160818140150'), ('20160819162030'), ('20160826113309'), ('20160830144749'), ('20160901125651'), ('20160901134715'), ('20160906140931'), ('20160907153406'), ('20160907162030'), ('20160909134047'), ('20160912064637'), ('20160913102254'), ('20160916111821'), ('20160916124428'), ('20160919070648'), ('20160919071110'), ('20160919082421'), ('20160920142609'), ('20160922072552'), ('20160923160817'), ('20160930140037'), ('20161010082144'), ('20161011105808'), ('20161011141925'), ('20161011144225'), ('20161012114132'), ('20161013084133'), ('20161013102335'), ('20161013125051'), ('20161013134427'), ('20161013161101'), ('20161014065337'), ('20161019113157'), ('20161020145001'), ('20161021080332'), ('20161025151414'), ('20161025152859'), ('20161025154640'), ('20161026111535'), ('20161026120042'), ('20161027095910'), ('20161031091451'), ('20161031094940'), ('20161031105250'), ('20161031105418'), ('20161101141317'), ('20161102071143'), ('20161102110210'), ('20161102115438'), ('20161103111612'), ('20161103154036'), ('20161108112600'), ('20161110090142'), ('20161111102005'), ('20161115143900'), ('20161118142126'), ('20161121143132'), ('20161123094818'), ('20161125121349'), ('20161125125141'), ('20161128103519'), ('20161128114937'), ('20161202113205');


