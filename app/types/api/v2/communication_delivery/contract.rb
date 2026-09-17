# frozen_string_literal: true

module Api
  module V2
    module CommunicationDelivery
      class Contract < Api::Base::Contract
        NO_DELIVERY_RULE_RECIPIENTS = %w[new_users new_assignment].freeze
        SCHEDULE_FIELDS = %i[delivery_start_date delivery_end_date delivery_time_of_day delivery_timezone
                             delivery_frequency].freeze
        IDP_KINDS = %w[
          idp_template_assigned idp_template_approved idp_template_rejected idp_deadline_missed
          development_action_deadline_missed
        ].freeze
        WORKSHOP_EVENT_KINDS = %w[workshop_invite workshop_booked workshop_cancelled workshop_upcoming_reminder].freeze

        rule(:data) do
          attrs = values.dig(:data, :attributes) || {}
          delivery_rule = attrs[:delivery_rule]
          trigger_type = attrs[:trigger_type]
          recipients = attrs[:recipients]
          scope_ids = {
            campaign_id: values.dig(:data, :relationships, :campaign, :data, :id),
            project_id: values.dig(:data, :relationships, :project, :data, :id)
          }
          template_id = values.dig(:data, :relationships, :communication_template, :data, :id)

          errors = basic_field_errors(attrs, delivery_rule, trigger_type)
          template = nil

          if template_id.present?
            template = find_template(template_id)
            errors << 'communication_template not found' if template.nil?
            if template
              errors.concat(template_kind_errors(template, delivery_rule, recipients, attrs, scope_ids))
            end
          end

          if attrs[:communication_delivery_assessments_attributes].present? &&
             !selected_assessments_allowed?(template, delivery_rule)
            errors << 'selected assessments are only valid for delivery_rule not_completed'
          end

          errors.each { |message| key.failure(message) }
        end

        private

        def basic_field_errors(attrs, delivery_rule, trigger_type)
          errors = []
          if delivery_rule == 'specific_datetime' && attrs[:delivery_at].blank?
            errors << 'delivery_at is required when delivery_rule is specific_datetime'
          end
          if trigger_type == 'scheduled' && attrs[:delivery_start_date].blank?
            errors << 'delivery_start_date is required when trigger_type is scheduled'
          end
          errors
        end

        def find_template(template_id)
          # Platform-level templates are tenant_id: nil by design (visible from every tenant); a plain
          # find_by here would fall under acts_as_tenant's default scope and silently miss them whenever
          # a request-scoped tenant is set, wrongly reporting "not found" for a valid platform template.
          ActsAsTenant.without_tenant { ::CommunicationTemplate.find_by(id: template_id) }
        end

        def selected_assessments_allowed?(template, delivery_rule)
          delivery_rule == 'not_completed' || template&.kind == 'completion'
        end

        def template_kind_errors(template, delivery_rule, recipients, attrs, scope_ids)
          if ::CommunicationTemplate::DELIVERABLE_KINDS.exclude?(template.kind)
            return ["deliveries cannot be created for template kind #{template.kind}"]
          end

          if template.kind == 'magic_link_email'
            return magic_link_email_errors(scope_ids) +
                   no_delivery_rule_or_recipients_errors(delivery_rule, recipients, 'magic_link_email')
          end

          if IDP_KINDS.include?(template.kind)
            return idp_kind_errors(scope_ids, template.kind) +
                   no_delivery_rule_or_recipients_errors(delivery_rule, recipients, template.kind)
          end
          return ['campaign is required'] if scope_ids[:campaign_id].blank?

          case template.kind
            when 'workshop_invite_reminder'
              campaign_assessment_group_errors(attrs, scope_ids[:campaign_id], 'workshop_invite_reminder')
            when 'assessment_center_booking_summary' then booking_summary_errors(recipients, attrs)
            when 'report_available' then no_delivery_rule_or_recipients_errors(delivery_rule, recipients,
                                                                               'report_available')
            when 'completion' then completion_errors(attrs)
            when *WORKSHOP_EVENT_KINDS
              campaign_assessment_group_errors(attrs, scope_ids[:campaign_id], template.kind) +
                no_delivery_rule_or_recipients_errors(delivery_rule, recipients, template.kind)
            else delivery_rule_errors(template.kind, delivery_rule, recipients)
          end
        end

        def magic_link_email_errors(scope_ids)
          errors = []
          errors << 'project is required for template kind magic_link_email' if scope_ids[:project_id].blank?
          errors << 'campaign is not valid for template kind magic_link_email' if scope_ids[:campaign_id].present?
          errors
        end

        def idp_kind_errors(scope_ids, kind)
          errors = []
          if scope_ids[:campaign_id].blank? && scope_ids[:project_id].blank?
            errors << "campaign or project is required for template kind #{kind}"
          end
          if scope_ids[:campaign_id].present? && scope_ids[:project_id].present?
            errors << "campaign and project cannot both be set for template kind #{kind}"
          end
          errors
        end

        def no_delivery_rule_or_recipients_errors(delivery_rule, recipients, kind)
          errors = []
          errors << "delivery_rule is not valid for template kind #{kind}" if delivery_rule.present?
          errors << "recipients is not valid for template kind #{kind}" if recipients.present?
          errors
        end

        def completion_errors(attrs)
          assessments = attrs[:communication_delivery_assessments_attributes]
          return [] if assessments.blank? || assessments.size <= 1

          ['completion deliveries support at most one selected assessment']
        end

        def delivery_rule_errors(kind, delivery_rule, recipients)
          return [] if NO_DELIVERY_RULE_RECIPIENTS.include?(recipients)

          if delivery_rule.blank?
            ['delivery_rule is required']
          elsif ::Communications::Deliveries::Rules::MAP[kind]&.exclude?(delivery_rule)
            ["delivery_rule #{delivery_rule} is not valid for template kind #{kind}"]
          else
            []
          end
        end

        def campaign_assessment_group_errors(attrs, campaign_id, kind)
          group_id = attrs[:campaign_assessment_group_id]

          if group_id.blank?
            ["campaign_assessment_group_id is required for template kind #{kind}"]
          elsif campaign_id.present? && !CampaignAssessmentGroup.exists?(id: group_id, campaign_id: campaign_id)
            ['campaign_assessment_group_id does not belong to the delivery campaign']
          else
            []
          end
        end

        def booking_summary_errors(recipients, attrs)
          errors = []
          if recipients.present? && recipients != 'selected'
            errors << 'recipients must be selected for template kind assessment_center_booking_summary'
          end
          errors.concat(booking_summary_schedule_errors(attrs))
        end

        def booking_summary_schedule_errors(attrs)
          errors = SCHEDULE_FIELDS.select { |field| attrs[field].blank? }.
                   map { |field| "#{field} is required for template kind assessment_center_booking_summary" }

          start_date = parse_date(attrs[:delivery_start_date])
          end_date = parse_date(attrs[:delivery_end_date])
          if start_date && end_date && end_date < start_date
            errors << 'delivery_end_date must be on or after delivery_start_date'
          end

          if attrs[:delivery_frequency] == 'specific_weekdays' && attrs[:delivery_weekdays].blank?
            errors << 'delivery_weekdays is required when delivery_frequency is specific_weekdays'
          end

          errors << booking_summary_start_in_past_error(start_date, attrs)
          errors.compact
        end

        def booking_summary_start_in_past_error(start_date, attrs)
          return unless start_date && attrs[:delivery_timezone].present? && attrs[:delivery_time_of_day].present?

          tz = ActiveSupport::TimeZone[attrs[:delivery_timezone]]
          return unless tz

          time_of_day = Time.zone.parse(attrs[:delivery_time_of_day].to_s)
          return unless time_of_day

          start_datetime = tz.local(start_date.year, start_date.month, start_date.day, time_of_day.hour,
                                    time_of_day.min)
          'delivery_start_date is in the past' if start_datetime < Time.current
        end

        def parse_date(value)
          value.present? ? Date.parse(value.to_s) : nil
        rescue ArgumentError
          nil
        end
      end
    end
  end
end
