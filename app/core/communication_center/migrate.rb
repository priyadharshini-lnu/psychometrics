# frozen_string_literal: true

module CommunicationCenter
  class Migrate
    include Steps

    # Recurring delivery_rules that need an active CommunicationDelivery with
    # next_run_at set so DispatchJob can resume them immediately after the flag flips.
    RECURRING_RULES = %w[not_started not_completed in_progress].freeze

    def initialize(client, dry_run: false)
      @client = client
      @dry_run = dry_run
      @stats = Hash.new(0)
      @errors = []
    end

    def call
      ActsAsTenant.without_tenant do
        communications_for_client.find_each do |comm|
          process(comm)
        rescue StandardError => e
          @stats[:errors] += 1
          @errors << "Communication id=#{comm.id}: #{e.message}"
          Rails.logger.error("CommunicationCenter::Migrate error on comm id=#{comm.id}: #{e.message}")
        end
      end

      build_result
    end

    private

    attr_reader :client, :dry_run

    def process(comm)
      if (reason = skip_reason(comm))
        @stats[:skipped] += 1
        Rails.logger.info("CommunicationCenter::Migrate skipping comm id=#{comm.id}: #{reason}")
        return
      end

      counts = collect_counts(comm)

      if dry_run
        tally_dry_run(counts)
      else
        perform_migration(comm)
        @stats[:migrated] += 1
      end
    end

    def perform_migration(comm)
      # We don't want to trigger email sending when the records are migrated
      CommunicationDelivery.without_trigger_emails do
        ActiveRecord::Base.transaction do
          template = create_template(comm)
          delivery = create_delivery(comm, template)
          migrate_join_tables(comm, delivery)
          backfill_emails(comm, delivery)
          activate_recurring(delivery, comm) if recurring?(comm)
        end
      end
    end

    def skip_reason(comm)
      if CommunicationTemplate.exists?(source_communication_id: comm.id)
        'template already exists from a previous run'
      elsif CommunicationDelivery.exists?(source_communication_id: comm.id)
        'delivery already exists from a previous run'
      end
    end

    def collect_counts(comm)
      membership_user_ids = comm.memberships.joins(:user).pluck('users.id')
      direct_user_ids     = comm.users.pluck(:id)

      {
        selected_users: (membership_user_ids + direct_user_ids).uniq.size,
        cc_users: comm.copy_memberships.joins(:user).count,
        assessments: comm.selected_assessments.count,
        emails: CommunicationEmail.where(communication_id: comm.id,
                                         communication_delivery_id: nil).count
      }
    end

    def tally_dry_run(counts)
      @stats[:would_migrate]     += 1
      @stats[:would_backfill]    += counts[:emails]
      @stats[:would_users]       += counts[:selected_users]
      @stats[:would_cc_users]    += counts[:cc_users]
      @stats[:would_assessments] += counts[:assessments]
    end

    def build_result
      @stats.to_h.merge(errors: @errors, dry_run: dry_run)
    end

    def derive_scope(comm)
      if comm.campaign_id.present?
        [:campaign, comm.client_id, comm.project_id, comm.campaign_id]
      elsif comm.project_id.present?
        [:project, comm.client_id, comm.project_id, nil]
      elsif comm.client_id.present?
        [:client, comm.client_id, nil, nil]
      else
        [:platform, nil, nil, nil]
      end
    end

    def derive_trigger_type(comm)
      comm.delivery_start_date.present? ? :scheduled : :manual
    end

    def derive_status(comm)
      case comm.delivery_rule.to_s
        when 'send_now', 'specific_datetime'
          comm.last_ran_at.present? ? :completed : :enqueued
        else
          :active
      end
    end

    def template_name(comm)
      comm.subject.presence || "[migrated] #{comm.kind}-#{comm.id}"
    end

    # Parses "2 days" style delivery_interval string into [number, period].
    def parse_interval(delivery_interval)
      return [nil, nil] if delivery_interval.blank?

      parts = delivery_interval.to_s.split
      [parts.first.to_i, parts.last]
    end

    def interval_duration(comm)
      return nil if comm.delivery_interval.blank?

      number, period = parse_interval(comm.delivery_interval)
      valid_periods  = %w[hour hours day days week weeks month months]
      return nil unless valid_periods.include?(period.to_s.downcase)

      number.to_i.public_send(period)
    end

    def recurring?(comm)
      RECURRING_RULES.include?(comm.delivery_rule.to_s)
    end

    # Pass the raw integer so the new enum maps it correctly regardless of label.
    # Handles the old typo (not_competed=3) and nil/unknown values safely.
    def coerce_delivery_rule(rule)
      Communication.delivery_rules[rule.to_s]
    end

    def communications_for_client
      tenant_id = client.tenant_id || client.id
      Communication.where(tenant_id: tenant_id)
    end

    # Prefer the current app user when available; fall back to the first
    # superadmin for terminal/script usage or when no current user is available.
    def system_user_id
      @system_user_id ||= Current.user&.id ||
                          User.where(role: 'Users::SuperAdmin').pick(:id) ||
                          raise('No superadmin user found — cannot set created_by_id')
    end
  end
end
