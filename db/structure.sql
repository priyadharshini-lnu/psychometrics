--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.3
-- Dumped by pg_dump version 9.6.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
    access_reports_at timestamp without time zone,
    status integer,
    owner_id integer
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
-- Name: assign_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE assign_clients (
    id integer NOT NULL,
    assessment_id integer,
    client_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: assign_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE assign_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assign_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE assign_clients_id_seq OWNED BY assign_clients.id;


--
-- Name: assign_clients_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE assign_clients_reports (
    id integer NOT NULL,
    report_id integer,
    assign_client_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: assign_clients_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE assign_clients_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assign_clients_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE assign_clients_reports_id_seq OWNED BY assign_clients_reports.id;


--
-- Name: assigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE assigns (
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
    project_assign_id integer
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
-- Name: assigns_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE assigns_reports (
    id integer NOT NULL,
    report_id integer,
    assign_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    access_reports_at timestamp without time zone
);


--
-- Name: assigns_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE assigns_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assigns_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE assigns_reports_id_seq OWNED BY assigns_reports.id;


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
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE clients (
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
    users_count integer DEFAULT 0,
    archived boolean DEFAULT false,
    tte_id integer,
    created_by_id integer,
    modified_by_id integer,
    ancestry character varying,
    ancestry_depth integer DEFAULT 0,
    end_level boolean DEFAULT false
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
-- Name: clients_report_families; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE clients_report_families (
    client_id integer NOT NULL,
    report_family_id integer NOT NULL
);


--
-- Name: clients_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE clients_reports (
    id integer NOT NULL,
    client_id integer,
    report_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: clients_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE clients_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE clients_reports_id_seq OWNED BY clients_reports.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE comments (
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
    updated_at timestamp without time zone NOT NULL,
    owner_id integer
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
    factors_count integer DEFAULT 0,
    owner_id integer
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
-- Name: ecommerce_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE ecommerce_orders (
    id integer NOT NULL,
    membership_id integer,
    status integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: ecommerce_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE ecommerce_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ecommerce_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE ecommerce_orders_id_seq OWNED BY ecommerce_orders.id;


--
-- Name: ecommerce_purchase_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE ecommerce_purchase_invites (
    id integer NOT NULL,
    purchase_id integer,
    email character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: ecommerce_purchase_invites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE ecommerce_purchase_invites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ecommerce_purchase_invites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE ecommerce_purchase_invites_id_seq OWNED BY ecommerce_purchase_invites.id;


--
-- Name: ecommerce_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE ecommerce_purchases (
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

CREATE SEQUENCE ecommerce_purchases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ecommerce_purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE ecommerce_purchases_id_seq OWNED BY ecommerce_purchases.id;


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
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    owner_id integer,
    ancestry character varying
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
-- Name: license_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE license_usages (
    id integer NOT NULL,
    license_id integer,
    assigns_report_id integer,
    client_id integer NOT NULL
);


--
-- Name: license_usages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE license_usages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: license_usages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE license_usages_id_seq OWNED BY license_usages.id;


--
-- Name: licenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE licenses (
    id integer NOT NULL,
    number integer DEFAULT 0,
    overuse_number integer DEFAULT 0,
    used_number integer DEFAULT 0,
    client_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    end_date date NOT NULL,
    start_date date NOT NULL,
    report_family_id integer NOT NULL
);


--
-- Name: licenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE licenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: licenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE licenses_id_seq OWNED BY licenses.id;


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE memberships (
    id integer NOT NULL,
    client_id integer,
    user_id integer,
    hris jsonb DEFAULT '{}'::jsonb,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_retail boolean DEFAULT false,
    role character varying DEFAULT 'member'::character varying,
    assigns_count integer DEFAULT 0,
    assigns_completed boolean DEFAULT false,
    project_membership_id integer,
    ancestry character varying
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
    dimension_id integer,
    owner_id integer
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
    updated_at timestamp without time zone NOT NULL,
    "position" integer
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
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE product_images (
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

CREATE SEQUENCE product_images_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE product_images_id_seq OWNED BY product_images.id;


--
-- Name: product_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE product_prices (
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

CREATE SEQUENCE product_prices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE product_prices_id_seq OWNED BY product_prices.id;


--
-- Name: product_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE product_reports (
    id integer NOT NULL,
    product_id integer,
    report_id integer,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: product_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE product_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE product_reports_id_seq OWNED BY product_reports.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE products (
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

CREATE SEQUENCE products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE products_id_seq OWNED BY products.id;


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
    assessment_id integer,
    owner_id integer
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
-- Name: report_families; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE report_families (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: report_families_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE report_families_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: report_families_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE report_families_id_seq OWNED BY report_families.id;


--
-- Name: report_families_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE report_families_reports (
    report_id integer,
    report_family_id integer
);


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE reports (
    id integer NOT NULL,
    assessment_id integer,
    name character varying,
    disabled boolean DEFAULT false,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    type integer DEFAULT 0,
    owner_id integer
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
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE tasks (
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

CREATE SEQUENCE tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tasks_id_seq OWNED BY tasks.id;


--
-- Name: translations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE translations (
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
    spoof_token character varying
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
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY assessments ALTER COLUMN id SET DEFAULT nextval('assessments_id_seq'::regclass);


--
-- Name: assign_clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY assign_clients ALTER COLUMN id SET DEFAULT nextval('assign_clients_id_seq'::regclass);


--
-- Name: assign_clients_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY assign_clients_reports ALTER COLUMN id SET DEFAULT nextval('assign_clients_reports_id_seq'::regclass);


--
-- Name: assigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns ALTER COLUMN id SET DEFAULT nextval('assigns_id_seq'::regclass);


--
-- Name: assigns_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns_reports ALTER COLUMN id SET DEFAULT nextval('assigns_reports_id_seq'::regclass);


--
-- Name: blocks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY blocks ALTER COLUMN id SET DEFAULT nextval('blocks_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients ALTER COLUMN id SET DEFAULT nextval('clients_id_seq'::regclass);


--
-- Name: clients_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients_reports ALTER COLUMN id SET DEFAULT nextval('clients_reports_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments ALTER COLUMN id SET DEFAULT nextval('comments_id_seq'::regclass);


--
-- Name: communication_emails id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY communication_emails ALTER COLUMN id SET DEFAULT nextval('communication_emails_id_seq'::regclass);


--
-- Name: communications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY communications ALTER COLUMN id SET DEFAULT nextval('communications_id_seq'::regclass);


--
-- Name: data_geos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY data_geos ALTER COLUMN id SET DEFAULT nextval('data_geos_id_seq'::regclass);


--
-- Name: dimensions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY dimensions ALTER COLUMN id SET DEFAULT nextval('dimensions_id_seq'::regclass);


--
-- Name: ecommerce_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY ecommerce_orders ALTER COLUMN id SET DEFAULT nextval('ecommerce_orders_id_seq'::regclass);


--
-- Name: ecommerce_purchase_invites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY ecommerce_purchase_invites ALTER COLUMN id SET DEFAULT nextval('ecommerce_purchase_invites_id_seq'::regclass);


--
-- Name: ecommerce_purchases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY ecommerce_purchases ALTER COLUMN id SET DEFAULT nextval('ecommerce_purchases_id_seq'::regclass);


--
-- Name: factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors ALTER COLUMN id SET DEFAULT nextval('factors_id_seq'::regclass);


--
-- Name: factors_norms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors_norms ALTER COLUMN id SET DEFAULT nextval('factors_norms_id_seq'::regclass);


--
-- Name: factors_scoring id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors_scoring ALTER COLUMN id SET DEFAULT nextval('factors_scoring_id_seq'::regclass);


--
-- Name: libraries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY libraries ALTER COLUMN id SET DEFAULT nextval('libraries_id_seq'::regclass);


--
-- Name: license_usages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY license_usages ALTER COLUMN id SET DEFAULT nextval('license_usages_id_seq'::regclass);


--
-- Name: licenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY licenses ALTER COLUMN id SET DEFAULT nextval('licenses_id_seq'::regclass);


--
-- Name: memberships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships ALTER COLUMN id SET DEFAULT nextval('memberships_id_seq'::regclass);


--
-- Name: norms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms ALTER COLUMN id SET DEFAULT nextval('norms_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY notifications ALTER COLUMN id SET DEFAULT nextval('notifications_id_seq'::regclass);


--
-- Name: occupations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY occupations ALTER COLUMN id SET DEFAULT nextval('occupations_id_seq'::regclass);


--
-- Name: occupations_factors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY occupations_factors ALTER COLUMN id SET DEFAULT nextval('occupations_factors_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY product_images ALTER COLUMN id SET DEFAULT nextval('product_images_id_seq'::regclass);


--
-- Name: product_prices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY product_prices ALTER COLUMN id SET DEFAULT nextval('product_prices_id_seq'::regclass);


--
-- Name: product_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY product_reports ALTER COLUMN id SET DEFAULT nextval('product_reports_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY products ALTER COLUMN id SET DEFAULT nextval('products_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions ALTER COLUMN id SET DEFAULT nextval('questions_id_seq'::regclass);


--
-- Name: report_families id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY report_families ALTER COLUMN id SET DEFAULT nextval('report_families_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports ALTER COLUMN id SET DEFAULT nextval('reports_id_seq'::regclass);


--
-- Name: reports_filters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_filters ALTER COLUMN id SET DEFAULT nextval('reports_filters_id_seq'::regclass);


--
-- Name: reports_modules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_modules ALTER COLUMN id SET DEFAULT nextval('reports_modules_id_seq'::regclass);


--
-- Name: reports_pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_pages ALTER COLUMN id SET DEFAULT nextval('reports_pages_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tasks ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY translations ALTER COLUMN id SET DEFAULT nextval('translations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: assign_clients assign_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assign_clients
    ADD CONSTRAINT assign_clients_pkey PRIMARY KEY (id);


--
-- Name: assign_clients_reports assign_clients_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assign_clients_reports
    ADD CONSTRAINT assign_clients_reports_pkey PRIMARY KEY (id);


--
-- Name: assigns assigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns
    ADD CONSTRAINT assigns_pkey PRIMARY KEY (id);


--
-- Name: assigns_reports assigns_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns_reports
    ADD CONSTRAINT assigns_reports_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients_reports clients_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients_reports
    ADD CONSTRAINT clients_reports_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: communication_emails communication_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY communication_emails
    ADD CONSTRAINT communication_emails_pkey PRIMARY KEY (id);


--
-- Name: communications communications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY communications
    ADD CONSTRAINT communications_pkey PRIMARY KEY (id);


--
-- Name: data_geos data_geos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY data_geos
    ADD CONSTRAINT data_geos_pkey PRIMARY KEY (id);


--
-- Name: dimensions dimensions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY dimensions
    ADD CONSTRAINT dimensions_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_orders ecommerce_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ecommerce_orders
    ADD CONSTRAINT ecommerce_orders_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_purchase_invites ecommerce_purchase_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ecommerce_purchase_invites
    ADD CONSTRAINT ecommerce_purchase_invites_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_purchases ecommerce_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ecommerce_purchases
    ADD CONSTRAINT ecommerce_purchases_pkey PRIMARY KEY (id);


--
-- Name: factors_norms factors_norms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors_norms
    ADD CONSTRAINT factors_norms_pkey PRIMARY KEY (id);


--
-- Name: factors factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors
    ADD CONSTRAINT factors_pkey PRIMARY KEY (id);


--
-- Name: factors_scoring factors_scoring_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY factors_scoring
    ADD CONSTRAINT factors_scoring_pkey PRIMARY KEY (id);


--
-- Name: libraries libraries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY libraries
    ADD CONSTRAINT libraries_pkey PRIMARY KEY (id);


--
-- Name: license_usages license_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY license_usages
    ADD CONSTRAINT license_usages_pkey PRIMARY KEY (id);


--
-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: norms norms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms
    ADD CONSTRAINT norms_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: occupations_factors occupations_factors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY occupations_factors
    ADD CONSTRAINT occupations_factors_pkey PRIMARY KEY (id);


--
-- Name: occupations occupations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY occupations
    ADD CONSTRAINT occupations_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_prices product_prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY product_prices
    ADD CONSTRAINT product_prices_pkey PRIMARY KEY (id);


--
-- Name: product_reports product_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY product_reports
    ADD CONSTRAINT product_reports_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: report_families report_families_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY report_families
    ADD CONSTRAINT report_families_pkey PRIMARY KEY (id);


--
-- Name: reports_filters reports_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_filters
    ADD CONSTRAINT reports_filters_pkey PRIMARY KEY (id);


--
-- Name: reports_modules reports_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_modules
    ADD CONSTRAINT reports_modules_pkey PRIMARY KEY (id);


--
-- Name: reports_pages reports_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports_pages
    ADD CONSTRAINT reports_pages_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: index_assessments_on_dimension_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assessments_on_dimension_id ON assessments USING btree (dimension_id);


--
-- Name: index_assign_clients_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assign_clients_on_assessment_id ON assign_clients USING btree (assessment_id);


--
-- Name: index_assign_clients_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assign_clients_on_client_id ON assign_clients USING btree (client_id);


--
-- Name: index_assign_clients_reports_on_assign_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assign_clients_reports_on_assign_client_id ON assign_clients_reports USING btree (assign_client_id);


--
-- Name: index_assign_clients_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assign_clients_reports_on_report_id ON assign_clients_reports USING btree (report_id);


--
-- Name: index_assigns_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_on_membership_id ON assigns USING btree (membership_id);


--
-- Name: index_assigns_reports_on_assign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_reports_on_assign_id ON assigns_reports USING btree (assign_id);


--
-- Name: index_assigns_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_assigns_reports_on_report_id ON assigns_reports USING btree (report_id);


--
-- Name: index_assigns_reports_on_report_id_and_assign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_assigns_reports_on_report_id_and_assign_id ON assigns_reports USING btree (report_id, assign_id);


--
-- Name: index_blocks_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_blocks_on_assessment_id ON blocks USING btree (assessment_id);


--
-- Name: index_blocks_on_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_blocks_on_template_id ON blocks USING btree (template_id);


--
-- Name: index_clients_on_account_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_account_manager_id ON clients USING btree (account_manager_id);


--
-- Name: index_clients_on_ancestry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_ancestry ON clients USING btree (ancestry);


--
-- Name: index_clients_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_created_by_id ON clients USING btree (created_by_id);


--
-- Name: index_clients_on_end_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_end_level ON clients USING btree (end_level);


--
-- Name: index_clients_on_modified_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_modified_by_id ON clients USING btree (modified_by_id);


--
-- Name: index_clients_on_project_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_project_manager_id ON clients USING btree (project_manager_id);


--
-- Name: index_clients_on_subdomain; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_clients_on_subdomain ON clients USING btree (subdomain);


--
-- Name: index_clients_on_tte_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_on_tte_id ON clients USING btree (tte_id);


--
-- Name: index_clients_report_families_on_client_id_and_report_family_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_report_families_on_client_id_and_report_family_id ON clients_report_families USING btree (client_id, report_family_id);


--
-- Name: index_clients_reports_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_reports_on_client_id ON clients_reports USING btree (client_id);


--
-- Name: index_clients_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_clients_reports_on_report_id ON clients_reports USING btree (report_id);


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
-- Name: index_ecommerce_orders_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ecommerce_orders_on_membership_id ON ecommerce_orders USING btree (membership_id);


--
-- Name: index_ecommerce_purchase_invites_on_purchase_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ecommerce_purchase_invites_on_purchase_id ON ecommerce_purchase_invites USING btree (purchase_id);


--
-- Name: index_ecommerce_purchases_on_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ecommerce_purchases_on_order_id ON ecommerce_purchases USING btree (order_id);


--
-- Name: index_ecommerce_purchases_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_ecommerce_purchases_on_product_id ON ecommerce_purchases USING btree (product_id);


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
-- Name: index_libraries_on_ancestry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_libraries_on_ancestry ON libraries USING btree (ancestry);


--
-- Name: index_license_usages_on_assigns_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_assigns_report_id ON license_usages USING btree (assigns_report_id);


--
-- Name: index_license_usages_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_client_id ON license_usages USING btree (client_id);


--
-- Name: index_license_usages_on_license_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_license_usages_on_license_id ON license_usages USING btree (license_id);


--
-- Name: index_licenses_on_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_licenses_on_client_id ON licenses USING btree (client_id);


--
-- Name: index_licenses_on_client_id_and_report_family_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_licenses_on_client_id_and_report_family_id ON licenses USING btree (client_id, report_family_id);


--
-- Name: index_memberships_on_ancestry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_ancestry ON memberships USING btree (ancestry);


--
-- Name: index_memberships_on_assigns_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_assigns_completed ON memberships USING btree (assigns_completed);


--
-- Name: index_memberships_on_assigns_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_assigns_count ON memberships USING btree (assigns_count);


--
-- Name: index_memberships_on_hris; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_memberships_on_hris ON memberships USING gin (hris);


--
-- Name: index_memberships_uniq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_memberships_uniq ON memberships USING btree (client_id, user_id, role);


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
-- Name: index_product_images_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_product_images_on_product_id ON product_images USING btree (product_id);


--
-- Name: index_product_prices_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_product_prices_on_product_id ON product_prices USING btree (product_id);


--
-- Name: index_product_reports_on_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_product_reports_on_product_id ON product_reports USING btree (product_id);


--
-- Name: index_product_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_product_reports_on_report_id ON product_reports USING btree (report_id);


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
-- Name: index_report_families_reports_on_report_family_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_families_reports_on_report_family_id ON report_families_reports USING btree (report_family_id);


--
-- Name: index_report_families_reports_on_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_report_families_reports_on_report_id ON report_families_reports USING btree (report_id);


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
-- Name: index_tasks_on_assessment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_assessment_id ON tasks USING btree (assessment_id);


--
-- Name: index_tasks_on_factor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_factor_id ON tasks USING btree (factor_id);


--
-- Name: index_tasks_on_membership_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_membership_id ON tasks USING btree (membership_id);


--
-- Name: index_tasks_on_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_owner_id ON tasks USING btree (owner_id);


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
-- Name: index_users_on_created_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_created_by_id ON users USING btree (created_by_id);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_email ON users USING btree (email);


--
-- Name: index_users_on_grants; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_grants ON users USING gin (grants);


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
-- Name: index_users_on_modified_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_users_on_modified_by_id ON users USING btree (modified_by_id);


--
-- Name: index_users_on_reset_password_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_reset_password_token ON users USING btree (reset_password_token);


--
-- Name: assigns fk_rails_05e55ff955; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns
    ADD CONSTRAINT fk_rails_05e55ff955 FOREIGN KEY (project_assign_id) REFERENCES assigns(id) ON DELETE CASCADE;


--
-- Name: users fk_rails_09d354f20c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT fk_rails_09d354f20c FOREIGN KEY (modified_by_id) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: licenses fk_rails_139c7e09c4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY licenses
    ADD CONSTRAINT fk_rails_139c7e09c4 FOREIGN KEY (report_family_id) REFERENCES report_families(id) ON DELETE RESTRICT;


--
-- Name: assigns fk_rails_1b51e2cce0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns
    ADD CONSTRAINT fk_rails_1b51e2cce0 FOREIGN KEY (assessment_id) REFERENCES assessments(id);


--
-- Name: memberships fk_rails_1e06b93eb5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships
    ADD CONSTRAINT fk_rails_1e06b93eb5 FOREIGN KEY (project_membership_id) REFERENCES memberships(id) ON DELETE CASCADE;


--
-- Name: communication_emails fk_rails_2a329ed34d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY communication_emails
    ADD CONSTRAINT fk_rails_2a329ed34d FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE;


--
-- Name: ecommerce_purchases fk_rails_3546ed727a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ecommerce_purchases
    ADD CONSTRAINT fk_rails_3546ed727a FOREIGN KEY (order_id) REFERENCES ecommerce_orders(id) ON DELETE CASCADE;


--
-- Name: memberships fk_rails_385eeb68ea; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships
    ADD CONSTRAINT fk_rails_385eeb68ea FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;


--
-- Name: libraries fk_rails_3c26848d46; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY libraries
    ADD CONSTRAINT fk_rails_3c26848d46 FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE SET NULL;


--
-- Name: users fk_rails_45307c95a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT fk_rails_45307c95a3 FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: clients fk_rails_47b47683a3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT fk_rails_47b47683a3 FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: ecommerce_orders fk_rails_4e7fc0242c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ecommerce_orders
    ADD CONSTRAINT fk_rails_4e7fc0242c FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE;


--
-- Name: clients fk_rails_5b49237ec1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT fk_rails_5b49237ec1 FOREIGN KEY (account_manager_id) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: questions fk_rails_6ec04ddf91; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT fk_rails_6ec04ddf91 FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE SET NULL;


--
-- Name: comments fk_rails_7f3b1733e2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT fk_rails_7f3b1733e2 FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: tasks fk_rails_877a66d795; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY tasks
    ADD CONSTRAINT fk_rails_877a66d795 FOREIGN KEY (owner_id) REFERENCES memberships(id);


--
-- Name: norms fk_rails_922fac4f2e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms
    ADD CONSTRAINT fk_rails_922fac4f2e FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: assigns_reports fk_rails_9418a5a870; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns_reports
    ADD CONSTRAINT fk_rails_9418a5a870 FOREIGN KEY (assign_id) REFERENCES assigns(id) ON DELETE CASCADE;


--
-- Name: memberships fk_rails_99326fb65d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY memberships
    ADD CONSTRAINT fk_rails_99326fb65d FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: reports fk_rails_9c1b8d7e35; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY reports
    ADD CONSTRAINT fk_rails_9c1b8d7e35 FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE SET NULL;


--
-- Name: ecommerce_purchase_invites fk_rails_acede09d2c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY ecommerce_purchase_invites
    ADD CONSTRAINT fk_rails_acede09d2c FOREIGN KEY (purchase_id) REFERENCES ecommerce_purchases(id) ON DELETE CASCADE;


--
-- Name: dimensions fk_rails_ae68a3a37d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY dimensions
    ADD CONSTRAINT fk_rails_ae68a3a37d FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE SET NULL;


--
-- Name: norms fk_rails_b3f9f037c2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms
    ADD CONSTRAINT fk_rails_b3f9f037c2 FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE SET NULL;


--
-- Name: norms fk_rails_b7d8a0337d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms
    ADD CONSTRAINT fk_rails_b7d8a0337d FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: assigns fk_rails_d2e6622e0f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns
    ADD CONSTRAINT fk_rails_d2e6622e0f FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE;


--
-- Name: clients_reports fk_rails_d336b71b0b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients_reports
    ADD CONSTRAINT fk_rails_d336b71b0b FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE;


--
-- Name: license_usages fk_rails_d35fd7791e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY license_usages
    ADD CONSTRAINT fk_rails_d35fd7791e FOREIGN KEY (license_id) REFERENCES licenses(id) ON DELETE CASCADE;


--
-- Name: license_usages fk_rails_d511a75463; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY license_usages
    ADD CONSTRAINT fk_rails_d511a75463 FOREIGN KEY (assigns_report_id) REFERENCES assigns_reports(id) ON DELETE SET NULL;


--
-- Name: clients_reports fk_rails_d62c12c5d3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients_reports
    ADD CONSTRAINT fk_rails_d62c12c5d3 FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;


--
-- Name: assigns_reports fk_rails_eb27834cf2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assigns_reports
    ADD CONSTRAINT fk_rails_eb27834cf2 FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE RESTRICT;


--
-- Name: norms fk_rails_ecfeaf1ba0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY norms
    ADD CONSTRAINT fk_rails_ecfeaf1ba0 FOREIGN KEY (dimension_id) REFERENCES dimensions(id) ON DELETE RESTRICT;


--
-- Name: assessments fk_rails_ef32d4a334; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assessments
    ADD CONSTRAINT fk_rails_ef32d4a334 FOREIGN KEY (dimension_id) REFERENCES dimensions(id) ON DELETE RESTRICT;


--
-- Name: communications fk_rails_efeba527b3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY communications
    ADD CONSTRAINT fk_rails_efeba527b3 FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE SET NULL;


--
-- Name: assessments fk_rails_f076a5c10f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY assessments
    ADD CONSTRAINT fk_rails_f076a5c10f FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE SET NULL;


--
-- Name: clients fk_rails_f28b175e74; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT fk_rails_f28b175e74 FOREIGN KEY (modified_by_id) REFERENCES users(id) ON DELETE SET NULL;


--
-- Name: clients fk_rails_f99d964d82; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY clients
    ADD CONSTRAINT fk_rails_f99d964d82 FOREIGN KEY (project_manager_id) REFERENCES users(id) ON DELETE SET NULL;


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
('20170627145630');


