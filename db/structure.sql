SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


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

SET default_with_oids = false;

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
    encrypted_token_iv character varying
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
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


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
    mindmill_id integer,
    enable_back boolean DEFAULT false NOT NULL,
    enable_progress boolean DEFAULT true,
    extra jsonb DEFAULT '{}'::jsonb NOT NULL,
    icon character varying
);


--
-- Name: assessments_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments_clients (
    id bigint NOT NULL,
    client_id bigint,
    assessment_id bigint,
    "position" integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
    updated_at timestamp without time zone NOT NULL
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
    campaign_id bigint,
    evaluator_id bigint,
    subject_id bigint
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
    template_id integer
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
    file character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
-- Name: campaign_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_templates (
    id bigint NOT NULL,
    name character varying,
    assessment_id integer,
    report_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id bigint NOT NULL,
    project_id bigint,
    name character varying,
    type integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


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
-- Name: campaigns_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns_users (
    id bigint NOT NULL,
    campaign_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_id bigint
);


--
-- Name: campaigns_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaigns_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaigns_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaigns_users_id_seq OWNED BY public.campaigns_users.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name character varying,
    subdomain character varying,
    logo character varying,
    design json,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    background character varying,
    type integer DEFAULT 0,
    licenses_count integer DEFAULT 0,
    number character varying,
    country character varying,
    year integer,
    applicable_level integer DEFAULT 0,
    account_manager_id integer,
    project_manager_id integer,
    archived boolean DEFAULT false,
    tte_id integer,
    created_by_id integer,
    modified_by_id integer,
    ancestry character varying,
    ancestry_depth integer DEFAULT 0,
    end_level boolean DEFAULT false,
    hogan_group_name character varying,
    privacy_consent boolean
);


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
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    text character varying,
    created_by integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    commentable_id integer,
    commentable_type character varying
);


--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: communication_emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communication_emails (
    id integer NOT NULL,
    membership_id integer,
    communication_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    sent_at timestamp without time zone
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
    creator_id integer,
    stop_reminder_datetime timestamp without time zone,
    stop_reminder boolean DEFAULT false NOT NULL
);


--
-- Name: communications_copy_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communications_copy_memberships (
    communication_id integer NOT NULL,
    membership_id integer NOT NULL
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
    membership_id integer NOT NULL
);


--
-- Name: communications_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communications_users (
    id integer NOT NULL,
    user_id integer,
    communication_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
-- Name: datasheet_rows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.datasheet_rows (
    id bigint NOT NULL,
    datasheet_id bigint,
    email public.citext,
    data jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: datasheet_rows_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.datasheet_rows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: datasheet_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.datasheet_rows_id_seq OWNED BY public.datasheet_rows.id;


--
-- Name: datasheets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.datasheets (
    id bigint NOT NULL,
    project_id bigint,
    columns jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: datasheets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.datasheets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: datasheets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.datasheets_id_seq OWNED BY public.datasheets.id;


--
-- Name: dimensions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dimensions (
    id integer NOT NULL,
    name character varying,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    factors_count integer DEFAULT 0,
    owner_id integer
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
-- Name: ecommerce_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecommerce_orders (
    id integer NOT NULL,
    membership_id integer,
    status integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: ecommerce_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ecommerce_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ecommerce_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ecommerce_orders_id_seq OWNED BY public.ecommerce_orders.id;


--
-- Name: ecommerce_purchase_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecommerce_purchase_invites (
    id integer NOT NULL,
    purchase_id integer,
    email character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: ecommerce_purchase_invites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ecommerce_purchase_invites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ecommerce_purchase_invites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ecommerce_purchase_invites_id_seq OWNED BY public.ecommerce_purchase_invites.id;


--
-- Name: ecommerce_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecommerce_purchases (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    price_cents integer DEFAULT 0 NOT NULL,
    price_currency character varying DEFAULT 'USD'::character varying NOT NULL,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: ecommerce_purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ecommerce_purchases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ecommerce_purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ecommerce_purchases_id_seq OWNED BY public.ecommerce_purchases.id;


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
-- Name: factors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factors (
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
-- Name: factors_aliases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.factors_aliases (
    id bigint NOT NULL,
    factor_id bigint NOT NULL,
    report_id bigint NOT NULL,
    name character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
    props json
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
    question_id integer
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
-- Name: hogan_assessment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hogan_assessment_settings (
    id bigint NOT NULL,
    hogan_assessment_id character varying,
    hogan_form_id character varying NOT NULL,
    assessment_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: hogan_assessment_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hogan_assessment_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hogan_assessment_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hogan_assessment_settings_id_seq OWNED BY public.hogan_assessment_settings.id;


--
-- Name: hogan_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hogan_credentials (
    id bigint NOT NULL,
    membership_id bigint NOT NULL,
    encrypted_password character varying NOT NULL,
    encrypted_password_iv character varying NOT NULL,
    participant_id character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
    updated_at timestamp without time zone NOT NULL
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
    ancestry character varying
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
    user_id bigint
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
    report_family_id integer NOT NULL,
    disabled boolean DEFAULT false
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
-- Name: membership_grants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_grants (
    id bigint NOT NULL,
    membership_id bigint,
    data jsonb,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
    already_invited boolean DEFAULT false NOT NULL
);


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
-- Name: norms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.norms (
    id integer NOT NULL,
    name character varying,
    disabled boolean DEFAULT false,
    created_by integer,
    updated_by integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    dimension_id integer,
    owner_id integer
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
    membership_id integer
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
    key_career_tracks_image character varying
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
    "position" integer
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
-- Name: participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.participants (
    id bigint NOT NULL,
    project_id bigint,
    campaign_id bigint,
    relationship_id bigint,
    manager_nomination_status integer DEFAULT 0,
    evaluator_nomination_status integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    subject_id bigint,
    evaluator_id bigint,
    manager_evaluation_status integer DEFAULT 0
);


--
-- Name: participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.participants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.participants_id_seq OWNED BY public.participants.id;


--
-- Name: privacy_consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.privacy_consents (
    id bigint NOT NULL,
    membership_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    image character varying,
    "position" integer,
    product_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: product_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_prices (
    id integer NOT NULL,
    price_cents integer DEFAULT 0 NOT NULL,
    price_currency character varying DEFAULT 'USD'::character varying NOT NULL,
    product_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: product_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_prices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_prices_id_seq OWNED BY public.product_prices.id;


--
-- Name: product_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_reports (
    id integer NOT NULL,
    product_id integer,
    report_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: product_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_reports_id_seq OWNED BY public.product_reports.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying,
    description text,
    image character varying,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


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
    owner_id integer
);


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
-- Name: relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.relationships (
    id bigint NOT NULL,
    campaign_id bigint,
    name character varying,
    type integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assign_type integer DEFAULT 0
);


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
-- Name: report_families; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_families (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
    report_family_id integer
);


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
    type integer DEFAULT 0,
    owner_id integer,
    mindmill boolean DEFAULT false,
    extra jsonb DEFAULT '{}'::jsonb NOT NULL,
    icon character varying,
    props jsonb DEFAULT '{}'::jsonb NOT NULL,
    data_configuration jsonb DEFAULT '{}'::jsonb,
    default_language character varying DEFAULT 'en'::character varying,
    data_sheet_columns jsonb DEFAULT '[]'::jsonb NOT NULL,
    category integer DEFAULT 0
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
-- Name: reports_filters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports_filters (
    id integer NOT NULL,
    report_id integer,
    name character varying,
    conditions json,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    assessment_id integer
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
    assessment_id bigint
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
    display_logic jsonb
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
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    membership_id integer,
    factor_id integer,
    assessment_id integer,
    name character varying,
    description text,
    priority integer,
    status integer,
    planned_completed_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    parent_id integer,
    owner_id integer
);


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


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
    updated_at timestamp without time zone NOT NULL
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
    updated_at timestamp without time zone NOT NULL
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
    evaluations_count integer DEFAULT 0,
    completed_evaluations_count integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    approved_evaluations_count integer DEFAULT 0
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
-- Name: threesixty_instruction_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_instruction_templates (
    id bigint NOT NULL,
    threesixty_campaign_id bigint,
    name character varying NOT NULL,
    content text,
    enabled boolean DEFAULT true,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
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
    name character varying NOT NULL
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
    updated_at timestamp without time zone NOT NULL
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
-- Name: threesixty_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_subjects (
    id bigint NOT NULL,
    campaign_id bigint,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_id bigint,
    report_approval_status integer DEFAULT 0,
    evaluators_count integer DEFAULT 0,
    completed_evaluators_count integer DEFAULT 0,
    report_release_status integer DEFAULT 0,
    evaluation_status integer DEFAULT 0
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
-- Name: threesixty_subjects_relationships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.threesixty_subjects_relationships (
    id bigint NOT NULL,
    campaign_id bigint,
    subject_id bigint,
    relationship_id bigint,
    completed_evaluators_count integer DEFAULT 0,
    approved_evaluators_count integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: threesixty_subjects_relationships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.threesixty_subjects_relationships_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: threesixty_subjects_relationships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.threesixty_subjects_relationships_id_seq OWNED BY public.threesixty_subjects_relationships.id;


--
-- Name: translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.translations (
    id integer NOT NULL,
    translateable_type character varying,
    translateable_id integer,
    props json DEFAULT '{}'::json,
    locale character varying(10),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    resource_type character varying,
    resource_id integer
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
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
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
    project_id integer
);


--
-- Name: users_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_assessments (
    id bigint NOT NULL,
    assessment_id bigint,
    user_id bigint,
    campaign_id bigint,
    selected_locale character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: users_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_assessments_id_seq OWNED BY public.users_assessments.id;


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
-- Name: users_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_reports (
    id bigint NOT NULL,
    report_id bigint,
    user_id bigint,
    campaign_id bigint,
    status integer DEFAULT 0,
    pdf character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: users_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_reports_id_seq OWNED BY public.users_reports.id;


--
-- Name: users_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_results (
    id bigint NOT NULL,
    subject_id bigint,
    evaluator_id bigint,
    assessment_id bigint,
    answers jsonb,
    scoring jsonb,
    occupations jsonb,
    embedded_data jsonb,
    step integer DEFAULT 0,
    status integer DEFAULT 0,
    completed_at timestamp without time zone,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    norm_id bigint,
    campaign_id bigint
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
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


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
-- Name: assigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns ALTER COLUMN id SET DEFAULT nextval('public.assigns_id_seq'::regclass);


--
-- Name: assigns_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns_reports ALTER COLUMN id SET DEFAULT nextval('public.assigns_reports_id_seq'::regclass);


--
-- Name: blocks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks ALTER COLUMN id SET DEFAULT nextval('public.blocks_id_seq'::regclass);


--
-- Name: bulk_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulk_reports ALTER COLUMN id SET DEFAULT nextval('public.bulk_reports_id_seq'::regclass);


--
-- Name: campaign_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_templates ALTER COLUMN id SET DEFAULT nextval('public.campaign_templates_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: campaigns_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns_users ALTER COLUMN id SET DEFAULT nextval('public.campaigns_users_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: clients_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients_reports ALTER COLUMN id SET DEFAULT nextval('public.clients_reports_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: communication_emails id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails ALTER COLUMN id SET DEFAULT nextval('public.communication_emails_id_seq'::regclass);


--
-- Name: communications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications ALTER COLUMN id SET DEFAULT nextval('public.communications_id_seq'::regclass);


--
-- Name: communications_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_users ALTER COLUMN id SET DEFAULT nextval('public.communications_users_id_seq'::regclass);


--
-- Name: data_geos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_geos ALTER COLUMN id SET DEFAULT nextval('public.data_geos_id_seq'::regclass);


--
-- Name: datasheet_rows id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datasheet_rows ALTER COLUMN id SET DEFAULT nextval('public.datasheet_rows_id_seq'::regclass);


--
-- Name: datasheets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datasheets ALTER COLUMN id SET DEFAULT nextval('public.datasheets_id_seq'::regclass);


--
-- Name: dimensions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions ALTER COLUMN id SET DEFAULT nextval('public.dimensions_id_seq'::regclass);


--
-- Name: ecommerce_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_orders ALTER COLUMN id SET DEFAULT nextval('public.ecommerce_orders_id_seq'::regclass);


--
-- Name: ecommerce_purchase_invites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_purchase_invites ALTER COLUMN id SET DEFAULT nextval('public.ecommerce_purchase_invites_id_seq'::regclass);


--
-- Name: ecommerce_purchases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_purchases ALTER COLUMN id SET DEFAULT nextval('public.ecommerce_purchases_id_seq'::regclass);


--
-- Name: email_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);


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
-- Name: hogan_assessment_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_assessment_settings ALTER COLUMN id SET DEFAULT nextval('public.hogan_assessment_settings_id_seq'::regclass);


--
-- Name: hogan_credentials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_credentials ALTER COLUMN id SET DEFAULT nextval('public.hogan_credentials_id_seq'::regclass);


--
-- Name: hogan_report_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_report_settings ALTER COLUMN id SET DEFAULT nextval('public.hogan_report_settings_id_seq'::regclass);


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
-- Name: membership_grants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_grants ALTER COLUMN id SET DEFAULT nextval('public.membership_grants_id_seq'::regclass);


--
-- Name: memberships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships ALTER COLUMN id SET DEFAULT nextval('public.memberships_id_seq'::regclass);


--
-- Name: norms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms ALTER COLUMN id SET DEFAULT nextval('public.norms_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: occupations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations ALTER COLUMN id SET DEFAULT nextval('public.occupations_id_seq'::regclass);


--
-- Name: occupations_factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupations_factors ALTER COLUMN id SET DEFAULT nextval('public.occupations_factors_id_seq'::regclass);


--
-- Name: participants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants ALTER COLUMN id SET DEFAULT nextval('public.participants_id_seq'::regclass);


--
-- Name: privacy_consents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents ALTER COLUMN id SET DEFAULT nextval('public.privacy_consents_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: product_prices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices ALTER COLUMN id SET DEFAULT nextval('public.product_prices_id_seq'::regclass);


--
-- Name: product_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reports ALTER COLUMN id SET DEFAULT nextval('public.product_reports_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: relationships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relationships ALTER COLUMN id SET DEFAULT nextval('public.relationships_id_seq'::regclass);


--
-- Name: report_families id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_families ALTER COLUMN id SET DEFAULT nextval('public.report_families_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: reports_accesses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses ALTER COLUMN id SET DEFAULT nextval('public.reports_accesses_id_seq'::regclass);


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
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: threesixty_campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns ALTER COLUMN id SET DEFAULT nextval('public.threesixty_campaigns_id_seq'::regclass);


--
-- Name: threesixty_email_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_templates ALTER COLUMN id SET DEFAULT nextval('public.threesixty_email_templates_id_seq'::regclass);


--
-- Name: threesixty_evaluators id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_evaluators ALTER COLUMN id SET DEFAULT nextval('public.threesixty_evaluators_id_seq'::regclass);


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
-- Name: threesixty_subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects ALTER COLUMN id SET DEFAULT nextval('public.threesixty_subjects_id_seq'::regclass);


--
-- Name: threesixty_subjects_relationships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects_relationships ALTER COLUMN id SET DEFAULT nextval('public.threesixty_subjects_relationships_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: users_assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_assessments ALTER COLUMN id SET DEFAULT nextval('public.users_assessments_id_seq'::regclass);


--
-- Name: users_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_reports ALTER COLUMN id SET DEFAULT nextval('public.users_reports_id_seq'::regclass);


--
-- Name: users_results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results ALTER COLUMN id SET DEFAULT nextval('public.users_results_id_seq'::regclass);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


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
-- Name: campaign_templates campaign_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_templates
    ADD CONSTRAINT campaign_templates_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: campaigns_users campaigns_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns_users
    ADD CONSTRAINT campaigns_users_pkey PRIMARY KEY (id);


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
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communication_emails communication_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails
    ADD CONSTRAINT communication_emails_pkey PRIMARY KEY (id);


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
-- Name: data_geos data_geos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_geos
    ADD CONSTRAINT data_geos_pkey PRIMARY KEY (id);


--
-- Name: datasheet_rows datasheet_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datasheet_rows
    ADD CONSTRAINT datasheet_rows_pkey PRIMARY KEY (id);


--
-- Name: datasheets datasheets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datasheets
    ADD CONSTRAINT datasheets_pkey PRIMARY KEY (id);


--
-- Name: dimensions dimensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT dimensions_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_orders ecommerce_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_orders
    ADD CONSTRAINT ecommerce_orders_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_purchase_invites ecommerce_purchase_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_purchase_invites
    ADD CONSTRAINT ecommerce_purchase_invites_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_purchases ecommerce_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_purchases
    ADD CONSTRAINT ecommerce_purchases_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


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
-- Name: hogan_assessment_settings hogan_assessment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_assessment_settings
    ADD CONSTRAINT hogan_assessment_settings_pkey PRIMARY KEY (id);


--
-- Name: hogan_credentials hogan_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_credentials
    ADD CONSTRAINT hogan_credentials_pkey PRIMARY KEY (id);


--
-- Name: hogan_report_settings hogan_report_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_report_settings
    ADD CONSTRAINT hogan_report_settings_pkey PRIMARY KEY (id);


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
-- Name: membership_grants membership_grants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_grants
    ADD CONSTRAINT membership_grants_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


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
-- Name: participants participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT participants_pkey PRIMARY KEY (id);


--
-- Name: privacy_consents privacy_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents
    ADD CONSTRAINT privacy_consents_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_prices product_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_prices
    ADD CONSTRAINT product_prices_pkey PRIMARY KEY (id);


--
-- Name: product_reports product_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reports
    ADD CONSTRAINT product_reports_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: relationships relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT relationships_pkey PRIMARY KEY (id);


--
-- Name: report_families report_families_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_families
    ADD CONSTRAINT report_families_pkey PRIMARY KEY (id);


--
-- Name: reports_accesses reports_accesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses
    ADD CONSTRAINT reports_accesses_pkey PRIMARY KEY (id);


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
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: threesixty_campaigns threesixty_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns
    ADD CONSTRAINT threesixty_campaigns_pkey PRIMARY KEY (id);


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
-- Name: threesixty_subjects threesixty_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects
    ADD CONSTRAINT threesixty_subjects_pkey PRIMARY KEY (id);


--
-- Name: threesixty_subjects_relationships threesixty_subjects_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects_relationships
    ADD CONSTRAINT threesixty_subjects_relationships_pkey PRIMARY KEY (id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: users_assessments users_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_assessments
    ADD CONSTRAINT users_assessments_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_reports users_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_reports
    ADD CONSTRAINT users_reports_pkey PRIMARY KEY (id);


--
-- Name: users_results users_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results
    ADD CONSTRAINT users_results_pkey PRIMARY KEY (id);


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
-- Name: index_api_keys_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_api_keys_on_user_id ON public.api_keys USING btree (user_id);


--
-- Name: index_assessments_clients_on_client_id_and_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_assessments_clients_on_client_id_and_assessment_id ON public.assessments_clients USING btree (client_id, assessment_id);


--
-- Name: index_assessments_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_dimension_id ON public.assessments USING btree (dimension_id);


--
-- Name: index_assessments_reports_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_reports_on_assessment_id ON public.assessments_reports USING btree (assessment_id);


--
-- Name: index_assessments_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_reports_on_report_id ON public.assessments_reports USING btree (report_id);


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
-- Name: index_blocks_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_blocks_on_assessment_id ON public.blocks USING btree (assessment_id);


--
-- Name: index_blocks_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_blocks_on_template_id ON public.blocks USING btree (template_id);


--
-- Name: index_bulk_reports_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_bulk_reports_on_user_id ON public.bulk_reports USING btree (user_id);


--
-- Name: index_campaigns_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaigns_on_project_id ON public.campaigns USING btree (project_id);


--
-- Name: index_campaigns_users_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaigns_users_on_campaign_id ON public.campaigns_users USING btree (campaign_id);


--
-- Name: index_campaigns_users_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_campaigns_users_on_user_id ON public.campaigns_users USING btree (user_id);


--
-- Name: index_clients_on_account_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_account_manager_id ON public.clients USING btree (account_manager_id);


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
-- Name: index_communication_emails_on_communication_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_communication_id ON public.communication_emails USING btree (communication_id);


--
-- Name: index_communication_emails_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communication_emails_on_membership_id ON public.communication_emails USING btree (membership_id);


--
-- Name: index_communications_copy_memberships; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_copy_memberships ON public.communications_copy_memberships USING btree (communication_id, membership_id);


--
-- Name: index_communications_memberships; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_memberships ON public.communications_memberships USING btree (communication_id, membership_id);


--
-- Name: index_communications_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_assessment_id ON public.communications USING btree (assessment_id);


--
-- Name: index_communications_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_campaign_id ON public.communications USING btree (campaign_id);


--
-- Name: index_communications_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_client_id ON public.communications USING btree (client_id);


--
-- Name: index_communications_on_creator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_on_creator_id ON public.communications USING btree (creator_id);


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
-- Name: index_communications_users_on_communication_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_users_on_communication_id ON public.communications_users USING btree (communication_id);


--
-- Name: index_communications_users_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_communications_users_on_user_id ON public.communications_users USING btree (user_id);


--
-- Name: index_datasheet_rows_on_datasheet_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_datasheet_rows_on_datasheet_id ON public.datasheet_rows USING btree (datasheet_id);


--
-- Name: index_datasheet_rows_on_email_and_datasheet_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_datasheet_rows_on_email_and_datasheet_id ON public.datasheet_rows USING btree (email, datasheet_id);


--
-- Name: index_datasheets_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_datasheets_on_project_id ON public.datasheets USING btree (project_id);


--
-- Name: index_ecommerce_orders_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ecommerce_orders_on_membership_id ON public.ecommerce_orders USING btree (membership_id);


--
-- Name: index_ecommerce_purchase_invites_on_purchase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ecommerce_purchase_invites_on_purchase_id ON public.ecommerce_purchase_invites USING btree (purchase_id);


--
-- Name: index_ecommerce_purchases_on_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ecommerce_purchases_on_order_id ON public.ecommerce_purchases USING btree (order_id);


--
-- Name: index_ecommerce_purchases_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ecommerce_purchases_on_product_id ON public.ecommerce_purchases USING btree (product_id);


--
-- Name: index_email_templates_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_email_templates_on_campaign_id ON public.email_templates USING btree (campaign_id);


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
-- Name: index_factors_norms_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_norms_on_factor_id ON public.factors_norms USING btree (factor_id);


--
-- Name: index_factors_norms_on_norm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_norms_on_norm_id ON public.factors_norms USING btree (norm_id);


--
-- Name: index_factors_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_on_dimension_id ON public.factors USING btree (dimension_id);


--
-- Name: index_factors_on_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_on_parent_id ON public.factors USING btree (parent_id);


--
-- Name: index_factors_scoring_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_assessment_id ON public.factors_scoring USING btree (assessment_id);


--
-- Name: index_factors_scoring_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_factor_id ON public.factors_scoring USING btree (factor_id);


--
-- Name: index_factors_scoring_on_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_factors_scoring_on_question_id ON public.factors_scoring USING btree (question_id);


--
-- Name: index_hogan_assessment_settings_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_hogan_assessment_settings_on_assessment_id ON public.hogan_assessment_settings USING btree (assessment_id);


--
-- Name: index_hogan_credentials_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_hogan_credentials_on_membership_id ON public.hogan_credentials USING btree (membership_id);


--
-- Name: index_hogan_report_settings_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_hogan_report_settings_on_report_id ON public.hogan_report_settings USING btree (report_id);


--
-- Name: index_libraries_on_ancestry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_ancestry ON public.libraries USING btree (ancestry);


--
-- Name: index_license_usages_on_assigns_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_assigns_report_id ON public.license_usages USING btree (assigns_report_id);


--
-- Name: index_license_usages_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_client_id ON public.license_usages USING btree (client_id);


--
-- Name: index_license_usages_on_license_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_license_id ON public.license_usages USING btree (license_id);


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
-- Name: index_membership_grants_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_membership_grants_on_membership_id ON public.membership_grants USING btree (membership_id);


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
-- Name: index_memberships_on_hris; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_hris ON public.memberships USING gin (hris);


--
-- Name: index_norms_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_norms_on_dimension_id ON public.norms USING btree (dimension_id);


--
-- Name: index_notifications_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_assessment_id ON public.notifications USING btree (assessment_id);


--
-- Name: index_notifications_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_notifications_on_membership_id ON public.notifications USING btree (membership_id);


--
-- Name: index_occupations_factors_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_factors_on_factor_id ON public.occupations_factors USING btree (factor_id);


--
-- Name: index_occupations_factors_on_occupation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_factors_on_occupation_id ON public.occupations_factors USING btree (occupation_id);


--
-- Name: index_occupations_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_occupations_on_dimension_id ON public.occupations USING btree (dimension_id);


--
-- Name: index_participants_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_participants_on_campaign_id ON public.participants USING btree (campaign_id);


--
-- Name: index_participants_on_evaluator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_participants_on_evaluator_id ON public.participants USING btree (evaluator_id);


--
-- Name: index_participants_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_participants_on_project_id ON public.participants USING btree (project_id);


--
-- Name: index_participants_on_relationship_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_participants_on_relationship_id ON public.participants USING btree (relationship_id);


--
-- Name: index_participants_on_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_participants_on_subject_id ON public.participants USING btree (subject_id);


--
-- Name: index_privacy_consents_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_privacy_consents_on_membership_id ON public.privacy_consents USING btree (membership_id);


--
-- Name: index_product_images_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_product_images_on_product_id ON public.product_images USING btree (product_id);


--
-- Name: index_product_prices_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_product_prices_on_product_id ON public.product_prices USING btree (product_id);


--
-- Name: index_product_reports_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_product_reports_on_product_id ON public.product_reports USING btree (product_id);


--
-- Name: index_product_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_product_reports_on_report_id ON public.product_reports USING btree (report_id);


--
-- Name: index_questions_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_assessment_id ON public.questions USING btree (assessment_id);


--
-- Name: index_questions_on_block_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_block_id ON public.questions USING btree (block_id);


--
-- Name: index_questions_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_questions_on_template_id ON public.questions USING btree (template_id);


--
-- Name: index_relationships_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_relationships_on_campaign_id ON public.relationships USING btree (campaign_id);


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
-- Name: index_reports_filters_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_filters_on_report_id ON public.reports_filters USING btree (report_id);


--
-- Name: index_reports_modules_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_modules_on_assessment_id ON public.reports_modules USING btree (assessment_id);


--
-- Name: index_reports_modules_on_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_modules_on_page_id ON public.reports_modules USING btree (page_id);


--
-- Name: index_reports_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_on_assessment_id ON public.reports USING btree (assessment_id);


--
-- Name: index_reports_pages_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_reports_pages_on_report_id ON public.reports_pages USING btree (report_id);


--
-- Name: index_tasks_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_assessment_id ON public.tasks USING btree (assessment_id);


--
-- Name: index_tasks_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_factor_id ON public.tasks USING btree (factor_id);


--
-- Name: index_tasks_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_membership_id ON public.tasks USING btree (membership_id);


--
-- Name: index_tasks_on_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_owner_id ON public.tasks USING btree (owner_id);


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
-- Name: index_threesixty_evaluators_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_evaluators_on_campaign_id ON public.threesixty_evaluators USING btree (campaign_id);


--
-- Name: index_threesixty_evaluators_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_evaluators_on_user_id ON public.threesixty_evaluators USING btree (user_id);


--
-- Name: index_threesixty_options_on_threesixty_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_options_on_threesixty_campaign_id ON public.threesixty_options USING btree (threesixty_campaign_id);


--
-- Name: index_threesixty_subjects_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_subjects_on_campaign_id ON public.threesixty_subjects USING btree (campaign_id);


--
-- Name: index_threesixty_subjects_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_subjects_on_user_id ON public.threesixty_subjects USING btree (user_id);


--
-- Name: index_threesixty_subjects_relationships_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_subjects_relationships_on_campaign_id ON public.threesixty_subjects_relationships USING btree (campaign_id);


--
-- Name: index_threesixty_subjects_relationships_on_relationship_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_subjects_relationships_on_relationship_id ON public.threesixty_subjects_relationships USING btree (relationship_id);


--
-- Name: index_threesixty_subjects_relationships_on_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_threesixty_subjects_relationships_on_subject_id ON public.threesixty_subjects_relationships USING btree (subject_id);


--
-- Name: index_translations_on_resource_type_and_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_translations_on_resource_type_and_resource_id ON public.translations USING btree (resource_type, resource_id);


--
-- Name: index_translations_on_translateable_type_and_translateable_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_translations_on_translateable_type_and_translateable_id ON public.translations USING btree (translateable_type, translateable_id);


--
-- Name: index_users_assessments_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_assessments_on_assessment_id ON public.users_assessments USING btree (assessment_id);


--
-- Name: index_users_assessments_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_assessments_on_campaign_id ON public.users_assessments USING btree (campaign_id);


--
-- Name: index_users_assessments_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_assessments_on_user_id ON public.users_assessments USING btree (user_id);


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
-- Name: index_users_on_modified_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_modified_by_id ON public.users USING btree (modified_by_id);


--
-- Name: index_users_on_reset_password_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_reset_password_token ON public.users USING btree (reset_password_token);


--
-- Name: index_users_reports_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_reports_on_campaign_id ON public.users_reports USING btree (campaign_id);


--
-- Name: index_users_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_reports_on_report_id ON public.users_reports USING btree (report_id);


--
-- Name: index_users_reports_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_reports_on_user_id ON public.users_reports USING btree (user_id);


--
-- Name: index_users_results_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_results_on_assessment_id ON public.users_results USING btree (assessment_id);


--
-- Name: index_users_results_on_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_results_on_campaign_id ON public.users_results USING btree (campaign_id);


--
-- Name: index_users_results_on_evaluator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_results_on_evaluator_id ON public.users_results USING btree (evaluator_id);


--
-- Name: index_users_results_on_norm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_results_on_norm_id ON public.users_results USING btree (norm_id);


--
-- Name: index_users_results_on_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_results_on_subject_id ON public.users_results USING btree (subject_id);


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
-- Name: users_assessments_user_uniquesness_index; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_assessments_user_uniquesness_index ON public.users_assessments USING btree (user_id, campaign_id, assessment_id);


--
-- Name: communications fk_rails_03e5799fcb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_03e5799fcb FOREIGN KEY (end_level_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: threesixty_options fk_rails_0437d1f6f7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_options
    ADD CONSTRAINT fk_rails_0437d1f6f7 FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


--
-- Name: campaigns_users fk_rails_056e63be0f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns_users
    ADD CONSTRAINT fk_rails_056e63be0f FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: assigns fk_rails_05e55ff955; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_05e55ff955 FOREIGN KEY (project_assign_id) REFERENCES public.assigns(id) ON DELETE CASCADE;


--
-- Name: users fk_rails_09d354f20c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_rails_09d354f20c FOREIGN KEY (modified_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: assessments_reports fk_rails_105380adfd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_reports
    ADD CONSTRAINT fk_rails_105380adfd FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: users_assessments fk_rails_11a087a70e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_assessments
    ADD CONSTRAINT fk_rails_11a087a70e FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: licenses fk_rails_139c7e09c4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT fk_rails_139c7e09c4 FOREIGN KEY (report_family_id) REFERENCES public.report_families(id) ON DELETE RESTRICT;


--
-- Name: users_assessments fk_rails_15bb97bf96; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_assessments
    ADD CONSTRAINT fk_rails_15bb97bf96 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: users_reports fk_rails_1a6f653d96; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_reports
    ADD CONSTRAINT fk_rails_1a6f653d96 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: assigns fk_rails_1b51e2cce0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_1b51e2cce0 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: memberships fk_rails_1e06b93eb5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_1e06b93eb5 FOREIGN KEY (project_membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: users_reports fk_rails_28ab0c4f85; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_reports
    ADD CONSTRAINT fk_rails_28ab0c4f85 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: communication_emails fk_rails_2a329ed34d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_emails
    ADD CONSTRAINT fk_rails_2a329ed34d FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: threesixty_campaigns fk_rails_2f45aa472a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns
    ADD CONSTRAINT fk_rails_2f45aa472a FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE RESTRICT;


--
-- Name: api_keys fk_rails_32c28d0dc2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT fk_rails_32c28d0dc2 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ecommerce_purchases fk_rails_3546ed727a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_purchases
    ADD CONSTRAINT fk_rails_3546ed727a FOREIGN KEY (order_id) REFERENCES public.ecommerce_orders(id) ON DELETE CASCADE;


--
-- Name: memberships fk_rails_385eeb68ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_385eeb68ea FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: reports_accesses fk_rails_3a283de8a1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses
    ADD CONSTRAINT fk_rails_3a283de8a1 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: libraries fk_rails_3c26848d46; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.libraries
    ADD CONSTRAINT fk_rails_3c26848d46 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_instruction_templates fk_rails_3e304e0709; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_instruction_templates
    ADD CONSTRAINT fk_rails_3e304e0709 FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


--
-- Name: communications fk_rails_41c5e93ac9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_41c5e93ac9 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: users fk_rails_45307c95a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_rails_45307c95a3 FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: clients fk_rails_47b47683a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT fk_rails_47b47683a3 FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: datasheets fk_rails_481da9714d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datasheets
    ADD CONSTRAINT fk_rails_481da9714d FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: ecommerce_orders fk_rails_4e7fc0242c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_orders
    ADD CONSTRAINT fk_rails_4e7fc0242c FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: users_results fk_rails_4eb165810a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results
    ADD CONSTRAINT fk_rails_4eb165810a FOREIGN KEY (subject_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: clients fk_rails_5b49237ec1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT fk_rails_5b49237ec1 FOREIGN KEY (account_manager_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: participants fk_rails_60c2fd6734; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT fk_rails_60c2fd6734 FOREIGN KEY (subject_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: communications fk_rails_639c49fe3d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_639c49fe3d FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: email_templates fk_rails_6bdfe93e2e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT fk_rails_6bdfe93e2e FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: privacy_consents fk_rails_6cd91d815a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_consents
    ADD CONSTRAINT fk_rails_6cd91d815a FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: questions fk_rails_6ec04ddf91; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_rails_6ec04ddf91 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reports_accesses fk_rails_74cd2e276f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses
    ADD CONSTRAINT fk_rails_74cd2e276f FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: users_results fk_rails_773500ba49; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results
    ADD CONSTRAINT fk_rails_773500ba49 FOREIGN KEY (evaluator_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: datasheet_rows fk_rails_782a23bcc9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datasheet_rows
    ADD CONSTRAINT fk_rails_782a23bcc9 FOREIGN KEY (datasheet_id) REFERENCES public.datasheets(id) ON DELETE CASCADE;


--
-- Name: communications_users fk_rails_7a00292b33; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_users
    ADD CONSTRAINT fk_rails_7a00292b33 FOREIGN KEY (communication_id) REFERENCES public.communications(id) ON DELETE CASCADE;


--
-- Name: threesixty_subjects_relationships fk_rails_7c9b18d465; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects_relationships
    ADD CONSTRAINT fk_rails_7c9b18d465 FOREIGN KEY (relationship_id) REFERENCES public.relationships(id) ON DELETE RESTRICT;


--
-- Name: reports_modules fk_rails_7d52ca6463; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_modules
    ADD CONSTRAINT fk_rails_7d52ca6463 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: comments fk_rails_7f3b1733e2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_rails_7f3b1733e2 FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: assigns fk_rails_8538dc1cd7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_8538dc1cd7 FOREIGN KEY (subject_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: tasks fk_rails_877a66d795; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_rails_877a66d795 FOREIGN KEY (owner_id) REFERENCES public.memberships(id);


--
-- Name: threesixty_subjects_relationships fk_rails_88d5501028; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects_relationships
    ADD CONSTRAINT fk_rails_88d5501028 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: reports_accesses fk_rails_88e27a8e2d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports_accesses
    ADD CONSTRAINT fk_rails_88e27a8e2d FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: participants fk_rails_892b304988; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT fk_rails_892b304988 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: hogan_credentials fk_rails_8b50dd238d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_credentials
    ADD CONSTRAINT fk_rails_8b50dd238d FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


--
-- Name: participants fk_rails_8c39407ad4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT fk_rails_8c39407ad4 FOREIGN KEY (evaluator_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: communications fk_rails_904f7c8764; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_904f7c8764 FOREIGN KEY (sub_campaign_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: norms fk_rails_922fac4f2e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT fk_rails_922fac4f2e FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: threesixty_email_templates fk_rails_93d2d461ed; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_email_templates
    ADD CONSTRAINT fk_rails_93d2d461ed FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


--
-- Name: assigns_reports fk_rails_9418a5a870; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns_reports
    ADD CONSTRAINT fk_rails_9418a5a870 FOREIGN KEY (assign_id) REFERENCES public.assigns(id) ON DELETE CASCADE;


--
-- Name: campaigns_users fk_rails_962f0dea91; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns_users
    ADD CONSTRAINT fk_rails_962f0dea91 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: communications fk_rails_9635882d64; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_9635882d64 FOREIGN KEY (campaign_id) REFERENCES public.clients(id) ON DELETE CASCADE;


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
-- Name: memberships fk_rails_99326fb65d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT fk_rails_99326fb65d FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reports fk_rails_9c1b8d7e35; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_rails_9c1b8d7e35 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_campaigns fk_rails_9cb58b8a3f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_campaigns
    ADD CONSTRAINT fk_rails_9cb58b8a3f FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE RESTRICT;


--
-- Name: participants fk_rails_a0f5b5ec09; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT fk_rails_a0f5b5ec09 FOREIGN KEY (relationship_id) REFERENCES public.relationships(id) ON DELETE RESTRICT;


--
-- Name: assessments_clients fk_rails_a7b4e42c48; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_clients
    ADD CONSTRAINT fk_rails_a7b4e42c48 FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: threesixty_subjects_relationships fk_rails_a892ac1dd0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects_relationships
    ADD CONSTRAINT fk_rails_a892ac1dd0 FOREIGN KEY (subject_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: users_assessments fk_rails_ab767322bc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_assessments
    ADD CONSTRAINT fk_rails_ab767322bc FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE RESTRICT;


--
-- Name: ecommerce_purchase_invites fk_rails_acede09d2c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_purchase_invites
    ADD CONSTRAINT fk_rails_acede09d2c FOREIGN KEY (purchase_id) REFERENCES public.ecommerce_purchases(id) ON DELETE CASCADE;


--
-- Name: dimensions fk_rails_ae68a3a37d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dimensions
    ADD CONSTRAINT fk_rails_ae68a3a37d FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: threesixty_evaluators fk_rails_b0d68ad21e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_evaluators
    ADD CONSTRAINT fk_rails_b0d68ad21e FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: norms fk_rails_b3f9f037c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT fk_rails_b3f9f037c2 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: norms fk_rails_b7d8a0337d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT fk_rails_b7d8a0337d FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: communications_users fk_rails_bc228f8bf6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications_users
    ADD CONSTRAINT fk_rails_bc228f8bf6 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users_reports fk_rails_c02c547c00; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_reports
    ADD CONSTRAINT fk_rails_c02c547c00 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE RESTRICT;


--
-- Name: assessments_clients fk_rails_cc339dda78; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_clients
    ADD CONSTRAINT fk_rails_cc339dda78 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: users_results fk_rails_ce283804a5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results
    ADD CONSTRAINT fk_rails_ce283804a5 FOREIGN KEY (norm_id) REFERENCES public.norms(id) ON DELETE RESTRICT;


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
-- Name: hogan_assessment_settings fk_rails_d0f7b433a7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_assessment_settings
    ADD CONSTRAINT fk_rails_d0f7b433a7 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- Name: assigns fk_rails_d2e6622e0f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns
    ADD CONSTRAINT fk_rails_d2e6622e0f FOREIGN KEY (membership_id) REFERENCES public.memberships(id) ON DELETE CASCADE;


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
-- Name: clients_reports fk_rails_d3a555a5c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients_reports
    ADD CONSTRAINT fk_rails_d3a555a5c2 FOREIGN KEY (report_family_id) REFERENCES public.report_families(id);


--
-- Name: license_usages fk_rails_d511a75463; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_d511a75463 FOREIGN KEY (assigns_report_id) REFERENCES public.assigns_reports(id) ON DELETE SET NULL;


--
-- Name: clients_reports fk_rails_d62c12c5d3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients_reports
    ADD CONSTRAINT fk_rails_d62c12c5d3 FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: relationships fk_rails_d734d0e1e6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.relationships
    ADD CONSTRAINT fk_rails_d734d0e1e6 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: hogan_report_settings fk_rails_d77e15b1b7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hogan_report_settings
    ADD CONSTRAINT fk_rails_d77e15b1b7 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: threesixty_subjects fk_rails_d91185866e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects
    ADD CONSTRAINT fk_rails_d91185866e FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: users_results fk_rails_dc09b8ec60; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_results
    ADD CONSTRAINT fk_rails_dc09b8ec60 FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE RESTRICT;


--
-- Name: assessments_reports fk_rails_df744d4dd0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments_reports
    ADD CONSTRAINT fk_rails_df744d4dd0 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE;


--
-- Name: threesixty_subjects fk_rails_e425b52825; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_subjects
    ADD CONSTRAINT fk_rails_e425b52825 FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE RESTRICT;


--
-- Name: threesixty_evaluators fk_rails_e96676a310; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_evaluators
    ADD CONSTRAINT fk_rails_e96676a310 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: bulk_reports fk_rails_ea7da51ed5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bulk_reports
    ADD CONSTRAINT fk_rails_ea7da51ed5 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: assigns_reports fk_rails_eb27834cf2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assigns_reports
    ADD CONSTRAINT fk_rails_eb27834cf2 FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE RESTRICT;


--
-- Name: norms fk_rails_ecfeaf1ba0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.norms
    ADD CONSTRAINT fk_rails_ecfeaf1ba0 FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id) ON DELETE RESTRICT;


--
-- Name: assessments fk_rails_ef32d4a334; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_rails_ef32d4a334 FOREIGN KEY (dimension_id) REFERENCES public.dimensions(id) ON DELETE RESTRICT;


--
-- Name: communications fk_rails_efeba527b3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communications
    ADD CONSTRAINT fk_rails_efeba527b3 FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: assessments fk_rails_f076a5c10f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT fk_rails_f076a5c10f FOREIGN KEY (owner_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: clients fk_rails_f28b175e74; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT fk_rails_f28b175e74 FOREIGN KEY (modified_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: license_usages fk_rails_f4894a9b56; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_usages
    ADD CONSTRAINT fk_rails_f4894a9b56 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: participants fk_rails_f5ead802f1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participants
    ADD CONSTRAINT fk_rails_f5ead802f1 FOREIGN KEY (project_id) REFERENCES public.clients(id) ON DELETE RESTRICT;


--
-- Name: threesixty_nomination_requirements fk_rails_f78f0657d6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.threesixty_nomination_requirements
    ADD CONSTRAINT fk_rails_f78f0657d6 FOREIGN KEY (threesixty_campaign_id) REFERENCES public.threesixty_campaigns(id) ON DELETE RESTRICT;


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
-- Name: users fk_rails_fedc809cf8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_rails_fedc809cf8 FOREIGN KEY (project_id) REFERENCES public.clients(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20160704140756'),
('20160707123619'),
('20160712152012'),
('20160715101548'),
('20160715135817'),
('20160715170819'),
('20160719101711'),
('20160719133948'),
('20160720135509'),
('20160727114043'),
('20160728132804'),
('20160729125547'),
('20160729131418'),
('20160729132345'),
('20160729151936'),
('20160729153128'),
('20160801114116'),
('20160801134001'),
('20160802125448'),
('20160802155248'),
('20160803141451'),
('20160804075858'),
('20160804080947'),
('20160815094812'),
('20160815153553'),
('20160818140150'),
('20160819162030'),
('20160826113309'),
('20160830144749'),
('20160901125651'),
('20160901134715'),
('20160906140931'),
('20160907153406'),
('20160907162030'),
('20160909134047'),
('20160912064637'),
('20160913102254'),
('20160916111821'),
('20160916124428'),
('20160919070648'),
('20160919071110'),
('20160919082421'),
('20160920142609'),
('20160922072552'),
('20160923160817'),
('20160930140037'),
('20161010082144'),
('20161011141925'),
('20161011144225'),
('20161012114132'),
('20161013084133'),
('20161013102335'),
('20161013125051'),
('20161013134427'),
('20161013161101'),
('20161014065337'),
('20161019113157'),
('20161020145001'),
('20161021080332'),
('20161025151414'),
('20161025152859'),
('20161025154640'),
('20161026111535'),
('20161026120042'),
('20161027095910'),
('20161031091451'),
('20161031094940'),
('20161031105250'),
('20161031105418'),
('20161101141317'),
('20161102071143'),
('20161102110210'),
('20161102115438'),
('20161103111612'),
('20161103154036'),
('20161108112600'),
('20161110090142'),
('20161111102005'),
('20161115143900'),
('20161118142126'),
('20161121143132'),
('20161123094818'),
('20161125121349'),
('20161125125141'),
('20161128103519'),
('20161128114937'),
('20161202113205'),
('20161212094131'),
('20161212140458'),
('20161214081142'),
('20161214140548'),
('20161215061834'),
('20161215093728'),
('20161215150055'),
('20161215150257'),
('20161221074135'),
('20161221074304'),
('20161223065642'),
('20161223081235'),
('20161227132227'),
('20161228153020'),
('20161228155944'),
('20161229122752'),
('20161229135459'),
('20161230083037'),
('20170103114938'),
('20170103143542'),
('20170104152307'),
('20170110140747'),
('20170111162217'),
('20170112100616'),
('20170112124314'),
('20170117071238'),
('20170202144948'),
('20170206123137'),
('20170213114450'),
('20170221103830'),
('20170221140404'),
('20170222124313'),
('20170222125039'),
('20170222151629'),
('20170224073543'),
('20170224110918'),
('20170227091003'),
('20170301091546'),
('20170522131832'),
('20170523102840'),
('20170524094716'),
('20170525130219'),
('20170529070551'),
('20170529093632'),
('20170605123103'),
('20170605192137'),
('20170606124638'),
('20170607143545'),
('20170607153346'),
('20170607160409'),
('20170613075933'),
('20170613095544'),
('20170613120241'),
('20170613125409'),
('20170619080808'),
('20170619091417'),
('20170619095847'),
('20170626093642'),
('20170627080609'),
('20170627115325'),
('20170627145630'),
('20170628110310'),
('20170628110320'),
('20170629130155'),
('20170704060854'),
('20170706095454'),
('20170708231022'),
('20170725101235'),
('20171115115341'),
('20171115115658'),
('20171115115739'),
('20171117095652'),
('20171117122756'),
('20171201131314'),
('20171206151008'),
('20171206161732'),
('20171207080044'),
('20171207135522'),
('20171208153022'),
('20171208171730'),
('20171210004245'),
('20171212142402'),
('20180428143634'),
('20180503095443'),
('20180504074309'),
('20180504075242'),
('20180504082538'),
('20180504091841'),
('20180514140843'),
('20180522075755'),
('20180529094014'),
('20180601084716'),
('20180618090010'),
('20180619110647'),
('20180710120413'),
('20180723121434'),
('20180724151241'),
('20180731094932'),
('20180915101319'),
('20181002152730'),
('20181010120450'),
('20181013151355'),
('20181022210715'),
('20181028143714'),
('20181028180057'),
('20181103095056'),
('20181111105703'),
('20181112210040'),
('20181114075818'),
('20181114150808'),
('20181117114931'),
('20181118154257'),
('20181119095817'),
('20181124083412'),
('20181209135656'),
('20181217073128'),
('20181224184633'),
('20190101143027'),
('20190105160407'),
('20190113180725'),
('20190127164957'),
('20190210122115'),
('20190210123606'),
('20190221202711'),
('20190303082715'),
('20190304063803'),
('20190312220042'),
('20190315160908'),
('20190331125508'),
('20190406093054'),
('20190406205517'),
('20190407085318'),
('20190407142655'),
('20190411194041'),
('20190418194558'),
('20190419104112'),
('20190419193357'),
('20190419202055'),
('20190421102715'),
('20190501212516'),
('20190506131431'),
('20190507165939'),
('20190507170240'),
('20190507170817'),
('20190520160715'),
('20190523104920'),
('20190525115528'),
('20190601163131'),
('20190604121645'),
('20190612100829'),
('20190617125849');


