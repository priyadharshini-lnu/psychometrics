# frozen_string_literal: true

module CommunicationCenter
  class Migrate
    # Migration step implementations mixed into Migrate.
    # Each method corresponds to one labelled step in the migration pipeline:
    #   Step 1 — create CommunicationTemplate
    #   Step 2 — create CommunicationDelivery
    #   Step 3 — migrate join tables (users, CC users, assessments)
    #   Step 4 — backfill CommunicationEmail rows
    #   Step 5 — re-activate recurring deliveries
    module Steps
      def create_template(comm)
        level, client_id, project_id, campaign_id = derive_scope(comm)

        template = CommunicationTemplate.new(
          name:                    template_name(comm),
          kind:                    comm.kind,
          level:                   level,
          status:                  :active,
          recipients_default:      comm.recipients,
          client_id:               client_id,
          project_id:              project_id,
          campaign_id:             campaign_id,
          created_by_id:           comm.created_by_id || system_user_id,
          updated_by_id:           comm.updated_by_id || system_user_id,
          tenant_id:               comm.tenant_id,
          source_communication_id: comm.id
        )

        template.subject = comm.subject
        template.body    = comm.body
        template.save!

        copy_translations(comm, template)
        template
      end

      def copy_translations(comm, template)
        non_default_translations(comm).each do |t|
          Mobility.with_locale(t.locale) do
            template.subject = t.subject if t.subject.present?
            template.body    = t.body    if t.body.present?
            template.save!
          end
        end
      end

      def non_default_translations(comm)
        comm.translations.where.not(locale: I18n.default_locale.to_s)
      end

      def create_delivery(comm, template)
        delivery = CommunicationDelivery.create!(build_delivery_attributes(comm, template))

        delivery.subject = comm.subject
        delivery.body    = comm.body
        delivery.save!
        delivery
      end

      def build_delivery_attributes(comm, template)
        level, _client_id, project_id, campaign_id = derive_scope(comm)
        # CommunicationDelivery validates that campaign and project cannot both be set.
        # For campaign-scoped communications the old model stores both project_id and
        # campaign_id (campaign belongs to project), but the delivery must only carry
        # campaign_id — project_id must be nil.
        project_id = nil if level == :campaign
        interval_number, interval_period = parse_interval(comm.delivery_interval)

        {
          communication_template: template,
          trigger_type: derive_trigger_type(comm),
          status: derive_status(comm),
          delivery_rule: coerce_delivery_rule(comm.delivery_rule),
          recipients: comm.recipients,
          delivery_at: comm.delivery_at,
          delivery_interval_number: interval_number,
          delivery_interval_period: interval_period,
          delivery_start_date: comm.delivery_start_date,
          delivery_end_date: comm.delivery_end_date,
          delivery_time_of_day: comm.delivery_time_of_day,
          delivery_timezone: comm.delivery_timezone,
          delivery_frequency: comm.delivery_frequency,
          delivery_weekdays: comm.delivery_weekdays,
          delivery_delay_hours: comm.delivery_delay_hours,
          assessment_completion_status_code: comm.assessment_completion_status_code,
          campaign_assessment_group_id: comm.campaign_assessment_group_id,
          stop_reminder_datetime: comm.stop_reminder_datetime,
          last_ran_at: comm.last_ran_at,
          campaign_id: campaign_id,
          project_id: project_id,
          created_by_id: comm.created_by_id || system_user_id,
          updated_by_id: comm.updated_by_id || system_user_id,
          tenant_id: comm.tenant_id,
          source_communication_id: comm.id
        }
      end

      def migrate_join_tables(comm, delivery)
        migrate_selected_users(comm, delivery)
        migrate_cc_users(comm, delivery)
        migrate_assessments(comm, delivery)
      end

      def migrate_selected_users(comm, delivery)
        membership_user_ids = comm.memberships.joins(:user).pluck('users.id')
        direct_user_ids     = comm.users.pluck(:id)
        user_ids            = (membership_user_ids + direct_user_ids).uniq

        user_ids.each do |user_id|
          CommunicationDeliveryUser.create!(
            communication_delivery: delivery,
            user_id:                user_id,
            tenant_id:              delivery.tenant_id
          )
        rescue ActiveRecord::RecordInvalid => e
          # user_is_campaign_member validation fails if the user left the campaign —
          # log and skip rather than aborting the whole communication migration.
          Rails.logger.warn("Skipping selected user id=#{user_id} for comm id=#{comm.id}: #{e.message}")
        end
      end

      def migrate_cc_users(comm, delivery)
        comm.copy_memberships.joins(:user).pluck('users.id').each do |user_id|
          CommunicationDeliveryCcUser.create!(
            communication_delivery: delivery,
            user_id:                user_id,
            tenant_id:              delivery.tenant_id
          )
        rescue ActiveRecord::RecordInvalid => e
          Rails.logger.warn("Skipping CC user id=#{user_id} for comm id=#{comm.id}: #{e.message}")
        end
      end

      def migrate_assessments(comm, delivery)
        comm.selected_assessments.each do |assessment|
          CommunicationDeliveryAssessment.create!(
            communication_delivery: delivery,
            assessment:             assessment,
            tenant_id:              delivery.tenant_id
          )
        end
      end

      def backfill_emails(comm, delivery)
        # Populate communication_delivery_id on existing CommunicationEmail rows.
        # Leave communication_id intact — ContentSource checks delivery_id first,
        # so the old FK is ignored after backfill. Preserving it keeps rollback safe.
        count = CommunicationEmail.
                where(communication_id: comm.id, communication_delivery_id: nil).
                update_all(communication_delivery_id: delivery.id)
        @stats[:emails_backfilled] += count

        # Some email rows were created with only campaign_user_id set and user_id nil,
        # probably because they were created before the user_id column was added. Without
        # user_id the email list resource cannot resolve recipient name/email, causing "-"
        # in the UI. This only affects certain clients, not all migrated communications.
        backfill_email_user_ids(comm)
      end

      def backfill_email_user_ids(comm)
        count = CommunicationEmail.
                where(communication_id: comm.id, user_id: nil).
                where.not(campaign_user_id: nil).
                update_all(<<~SQL.squish)
                  user_id = (SELECT user_id FROM campaign_users WHERE campaign_users.id = communication_emails.campaign_user_id)
                SQL
        @stats[:user_ids_backfilled] += count
      end

      def activate_recurring(delivery, comm)
        next_run_at = if comm.last_ran_at && (duration = interval_duration(comm))
                        comm.last_ran_at + duration
                      else
                        Time.current
                      end

        delivery.update_columns(
          status:      CommunicationDelivery.statuses[:active],
          next_run_at: next_run_at
        )

        Communications::Deliveries::DispatchJob.perform_later(delivery.id)
        @stats[:recurring_reactivated] += 1
      end
    end
  end
end
