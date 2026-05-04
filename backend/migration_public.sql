--
-- PostgreSQL database dump
--

\restrict AgxjdlkdKFRsbfqYK2MF8jebeVpFWOAkpdjRhOUvOf2ZGgSYPaeHf5NbHqlSMZK

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

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

ALTER TABLE IF EXISTS ONLY public.work_orders DROP CONSTRAINT IF EXISTS work_orders_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reward_redemptions DROP CONSTRAINT IF EXISTS reward_redemptions_reward_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reward_redemptions DROP CONSTRAINT IF EXISTS reward_redemptions_reseller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.resellers DROP CONSTRAINT IF EXISTS resellers_tier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.production_statuses DROP CONSTRAINT IF EXISTS production_statuses_stage_id_fkey;
ALTER TABLE IF EXISTS ONLY public.production_statuses DROP CONSTRAINT IF EXISTS production_statuses_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.points DROP CONSTRAINT IF EXISTS points_reseller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_reseller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_payments DROP CONSTRAINT IF EXISTS order_payments_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_reseller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.commissions DROP CONSTRAINT IF EXISTS commissions_reseller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.commission_withdrawals DROP CONSTRAINT IF EXISTS commission_withdrawals_reseller_id_fkey;
DROP INDEX IF EXISTS public.work_orders_order_id_key;
DROP INDEX IF EXISTS public.work_orders_lk_number_key;
DROP INDEX IF EXISTS public.resellers_google_id_key;
DROP INDEX IF EXISTS public.resellers_email_key;
DROP INDEX IF EXISTS public.orders_po_number_key;
DROP INDEX IF EXISTS public.admins_email_key;
ALTER TABLE IF EXISTS ONLY public.work_orders DROP CONSTRAINT IF EXISTS work_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.rewards DROP CONSTRAINT IF EXISTS rewards_pkey;
ALTER TABLE IF EXISTS ONLY public.reward_redemptions DROP CONSTRAINT IF EXISTS reward_redemptions_pkey;
ALTER TABLE IF EXISTS ONLY public.resellers DROP CONSTRAINT IF EXISTS resellers_pkey;
ALTER TABLE IF EXISTS ONLY public.production_statuses DROP CONSTRAINT IF EXISTS production_statuses_pkey;
ALTER TABLE IF EXISTS ONLY public.production_stages DROP CONSTRAINT IF EXISTS production_stages_pkey;
ALTER TABLE IF EXISTS ONLY public.points DROP CONSTRAINT IF EXISTS points_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_payments DROP CONSTRAINT IF EXISTS order_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.commissions DROP CONSTRAINT IF EXISTS commissions_pkey;
ALTER TABLE IF EXISTS ONLY public.commission_withdrawals DROP CONSTRAINT IF EXISTS commission_withdrawals_pkey;
ALTER TABLE IF EXISTS ONLY public.commission_tiers DROP CONSTRAINT IF EXISTS commission_tiers_pkey;
ALTER TABLE IF EXISTS ONLY public.admins DROP CONSTRAINT IF EXISTS admins_pkey;
DROP TABLE IF EXISTS public.work_orders;
DROP TABLE IF EXISTS public.rewards;
DROP TABLE IF EXISTS public.reward_redemptions;
DROP TABLE IF EXISTS public.resellers;
DROP TABLE IF EXISTS public.production_statuses;
DROP TABLE IF EXISTS public.production_stages;
DROP TABLE IF EXISTS public.points;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.order_payments;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.commissions;
DROP TABLE IF EXISTS public.commission_withdrawals;
DROP TABLE IF EXISTS public.commission_tiers;
DROP TABLE IF EXISTS public.admins;
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    permissions text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: commission_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commission_tiers (
    id text NOT NULL,
    name text NOT NULL,
    percentage double precision NOT NULL,
    min_orders integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: commission_withdrawals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commission_withdrawals (
    id text NOT NULL,
    reseller_id text NOT NULL,
    amount double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    bank_name text,
    bank_account text,
    account_name text,
    notes text,
    admin_notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at timestamp(3) without time zone
);


--
-- Name: commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commissions (
    id text NOT NULL,
    reseller_id text NOT NULL,
    order_id text,
    amount double precision NOT NULL,
    percentage double precision NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    confirmed_at timestamp(3) without time zone
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    reseller_id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    data text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    unit_price double precision NOT NULL,
    collar_type text,
    pattern text,
    fabric_type text,
    additional_attrs text,
    subtotal double precision DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_payments (
    id text NOT NULL,
    order_id text NOT NULL,
    payment_type text NOT NULL,
    amount double precision NOT NULL,
    required_amount double precision NOT NULL,
    midtrans_order_id text,
    midtrans_transaction_id text,
    payment_method text,
    status text DEFAULT 'pending'::text NOT NULL,
    proof_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp(3) without time zone
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    reseller_id text NOT NULL,
    po_number text NOT NULL,
    order_type text NOT NULL,
    customer_name text NOT NULL,
    brand_name text NOT NULL,
    order_date timestamp(3) without time zone NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    description text,
    notes text,
    subtotal double precision DEFAULT 0 NOT NULL,
    discount double precision DEFAULT 0 NOT NULL,
    total_amount double precision DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    lk_approved boolean DEFAULT false NOT NULL,
    design_file_url text,
    mockup_file_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.points (
    id text NOT NULL,
    reseller_id text NOT NULL,
    order_id text,
    amount integer NOT NULL,
    type text NOT NULL,
    note text,
    expires_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: production_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_stages (
    id text NOT NULL,
    name text NOT NULL,
    order_index integer NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: production_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.production_statuses (
    id text NOT NULL,
    order_id text NOT NULL,
    stage_id text NOT NULL,
    status text NOT NULL,
    started_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    duration_minutes integer,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: resellers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resellers (
    id text NOT NULL,
    google_id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    photo_url text,
    phone text,
    address text,
    status text DEFAULT 'pending'::text NOT NULL,
    tier_id text,
    onboarding_data text,
    fcm_token text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: reward_redemptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reward_redemptions (
    id text NOT NULL,
    reseller_id text NOT NULL,
    reward_id text NOT NULL,
    points_used integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    address text,
    notes text,
    admin_notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at timestamp(3) without time zone
);


--
-- Name: rewards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rewards (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    image_url text,
    points_cost integer NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_orders (
    id text NOT NULL,
    order_id text NOT NULL,
    lk_number text NOT NULL,
    size_run text,
    back_name text,
    back_number text,
    additional_details text,
    status text DEFAULT 'draft'::text NOT NULL,
    approved_at timestamp(3) without time zone,
    approved_by_reseller boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.admins VALUES ('f7e665b6-18e9-4b9c-9847-fa721fa0b00d', 'admin@calsub.com', 'admin123', 'Super Admin CALSUB', 'super_admin', NULL, true, '2026-04-22 06:41:18.738', '2026-04-22 06:41:18.738');


--
-- Data for Name: commission_tiers; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: commission_withdrawals; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: commissions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.order_items VALUES ('f5e173e5-b49f-4b50-828c-7076bfa98432', '9ef35e09-d598-46df-a1bd-721ef11d1372', 'jersey home', 2, 150000, 'kerah', 'pola', 'kain', NULL, 300000, '2026-04-23 04:44:09.352');


--
-- Data for Name: order_payments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.order_payments VALUES ('4af12859-feb8-453e-831e-8bf77dee4392', '9ef35e09-d598-46df-a1bd-721ef11d1372', 'dp_design', 100000, 100000, 'PAY-1776919489454-5ca2b6b6', NULL, NULL, 'pending', NULL, '2026-04-23 04:44:49.456', NULL);
INSERT INTO public.order_payments VALUES ('df0e27f2-1984-4639-9fe3-1f3441be6bc7', '9ef35e09-d598-46df-a1bd-721ef11d1372', 'dp_design', 100000, 100000, 'PAY-1776919503404-df773ad2', NULL, NULL, 'pending', NULL, '2026-04-23 04:45:03.405', NULL);


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.orders VALUES ('9ef35e09-d598-46df-a1bd-721ef11d1372', '4742ab1e-17d4-46ad-b1c2-807205bda1eb', 'PO-1776919449348-09GE1X520', 'BASIC', 'futsal', 'calsub', '2026-04-23 04:44:08.958', '2026-05-07 04:44:08.958', NULL, NULL, 300000, 0, 300000, 'draft', false, NULL, NULL, '2026-04-23 04:44:09.352', '2026-04-23 04:44:09.352');


--
-- Data for Name: points; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: production_stages; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: production_statuses; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: resellers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.resellers VALUES ('1fb51728-19d4-4a5f-acf4-d7a6c13ea087', 'dev_test4@dev.com', 'test4@dev.com', 'Test User 4', NULL, '081234567890', 'Dev Office', 'active', NULL, NULL, NULL, '2026-04-22 06:08:16.515', '2026-04-22 06:08:16.515');
INSERT INTO public.resellers VALUES ('ac45f82c-3081-49a4-8e6b-ba81078d204e', 'dev_tester@calsub.com', 'tester@calsub.com', 'Tester Reseller', NULL, '08999999', 'Test Street', 'active', NULL, NULL, NULL, '2026-04-22 06:27:07.145', '2026-04-22 06:27:07.145');
INSERT INTO public.resellers VALUES ('4742ab1e-17d4-46ad-b1c2-807205bda1eb', 'dev_admin@coba.com', 'admin@coba.com', 'Dev User', NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-04-22 06:35:52.96', '2026-04-22 06:35:52.96');


--
-- Data for Name: reward_redemptions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: rewards; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: commission_tiers commission_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_tiers
    ADD CONSTRAINT commission_tiers_pkey PRIMARY KEY (id);


--
-- Name: commission_withdrawals commission_withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_withdrawals
    ADD CONSTRAINT commission_withdrawals_pkey PRIMARY KEY (id);


--
-- Name: commissions commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_payments order_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_payments
    ADD CONSTRAINT order_payments_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: points points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_pkey PRIMARY KEY (id);


--
-- Name: production_stages production_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_stages
    ADD CONSTRAINT production_stages_pkey PRIMARY KEY (id);


--
-- Name: production_statuses production_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_statuses
    ADD CONSTRAINT production_statuses_pkey PRIMARY KEY (id);


--
-- Name: resellers resellers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resellers
    ADD CONSTRAINT resellers_pkey PRIMARY KEY (id);


--
-- Name: reward_redemptions reward_redemptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_redemptions
    ADD CONSTRAINT reward_redemptions_pkey PRIMARY KEY (id);


--
-- Name: rewards rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: admins_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admins_email_key ON public.admins USING btree (email);


--
-- Name: orders_po_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_po_number_key ON public.orders USING btree (po_number);


--
-- Name: resellers_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX resellers_email_key ON public.resellers USING btree (email);


--
-- Name: resellers_google_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX resellers_google_id_key ON public.resellers USING btree (google_id);


--
-- Name: work_orders_lk_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX work_orders_lk_number_key ON public.work_orders USING btree (lk_number);


--
-- Name: work_orders_order_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX work_orders_order_id_key ON public.work_orders USING btree (order_id);


--
-- Name: commission_withdrawals commission_withdrawals_reseller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commission_withdrawals
    ADD CONSTRAINT commission_withdrawals_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.resellers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: commissions commissions_reseller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.resellers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_reseller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.resellers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_payments order_payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_payments
    ADD CONSTRAINT order_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_reseller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.resellers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: points points_reseller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.points
    ADD CONSTRAINT points_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.resellers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: production_statuses production_statuses_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_statuses
    ADD CONSTRAINT production_statuses_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: production_statuses production_statuses_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.production_statuses
    ADD CONSTRAINT production_statuses_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.production_stages(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: resellers resellers_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resellers
    ADD CONSTRAINT resellers_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.commission_tiers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reward_redemptions reward_redemptions_reseller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_redemptions
    ADD CONSTRAINT reward_redemptions_reseller_id_fkey FOREIGN KEY (reseller_id) REFERENCES public.resellers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reward_redemptions reward_redemptions_reward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_redemptions
    ADD CONSTRAINT reward_redemptions_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES public.rewards(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: work_orders work_orders_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict AgxjdlkdKFRsbfqYK2MF8jebeVpFWOAkpdjRhOUvOf2ZGgSYPaeHf5NbHqlSMZK

