# frozen_string_literal: true

module Idp::IdpPlan
  class CalculateDiff < BaseCommand
    private_attr_accessor :plan, :current_user
    EXCLUDED_FIELDS = %w[user_id user_idp_plan_id].freeze

    def initialize(plan, current_user)
      @plan = plan
      @current_user = current_user
    end

    def call
      from_status, to_status = determine_statuses_to_compare

      return broadcast :error, I18n.t('validations.idp.no_changes_to_compare') unless from_status && to_status

      from_version = find_version_by_status(from_status)
      to_version = find_version_by_status(to_status)

      return broadcast :error, I18n.t('validations.idp.no_changes_to_compare') unless from_version && to_version

      old = from_version&.reify(has_many: true) || @plan
      new = to_version&.reify(has_many: true)   || @plan

      plan_changes = {
        plan_changes: attribute_diff(old.attributes, new.attributes),
        actions_diff: collection_diff(old.user_idp_development_actions, new.user_idp_development_actions),
        skills_diff: collection_diff(old.user_idp_skills, new.user_idp_skills)
      }

      broadcast :ok, @plan, { plan_changes: plan_changes }
    end

    private

    def determine_statuses_to_compare
      return if current_user_manager? && plan.draft?

      last_finalized_status = plan.versions.where(
        "object ->> 'approval_status' IN (?)", %w[rejected approved]
      ).last&.object&.dig('approval_status')

      return unless last_finalized_status

      return [last_finalized_status, plan.approval_status] if plan.pending_approval? || plan.in_review?

      [last_finalized_status, plan.approval_status] if !current_user_manager? && plan.draft?
    end

    def current_user_manager?
      plan.user.manager == current_user
    end

    def find_version_by_status(status)
      plan.versions.where("versions.object ->> 'approval_status' = ?", status).last
    end

    def attribute_diff(old_attrs, new_attrs)
      keys_to_compare = new_attrs.keys - EXCLUDED_FIELDS
      old_values = old_attrs.slice(*keys_to_compare)
      new_values = new_attrs.slice(*keys_to_compare)

      new_values.each_with_object({}) do |(key, new_val), diffs|
        old_val = old_values[key]
        diffs[key] = { from: old_val, to: new_val } if old_val != new_val
      end
    end

    def collection_diff(old_records, new_records)
      active_new_records = new_records.reject { |record| record.try(:deleted_at).present? }

      old_map = index_by_id(old_records)
      new_map = index_by_id(active_new_records)
      all_new_map = index_by_id(new_records)

      old_keys = old_map.keys
      new_keys = new_map.keys

      potentially_deleted_keys = old_keys - new_keys
      soft_deleted_keys = potentially_deleted_keys.select { |key| all_new_map[key]&.deleted_at }

      {
        created: created_items(new_map, new_keys - old_keys),
        deleted: deleted_items(all_new_map, soft_deleted_keys),
        updated: updated_items(old_map, new_map, new_keys & old_keys)
      }
    end

    def created_items(record_map, keys)
      keys.map do |key|
        record = record_map[key]
        attributes = record.attributes.except(*EXCLUDED_FIELDS)
        enrich_record_attributes(record, attributes)
      end
    end

    def deleted_items(record_map, keys)
      keys.filter_map do |key|
        record = record_map[key]
        next unless record.respond_to?(:deleted_at) && record.deleted_at.present?

        attributes = record.attributes.except(*EXCLUDED_FIELDS)
        enrich_record_attributes(record, attributes)
      end
    end

    def updated_items(old_map, new_map, keys)
      keys.filter_map do |key|
        changes = attribute_diff(old_map[key].attributes, new_map[key].attributes)
        next unless changes.any?

        record = new_map[key]
        attributes = record.attributes.except(*EXCLUDED_FIELDS)
        enrich_record_attributes(record, attributes, changes)
      end
    end

    def enrich_record_attributes(record, attributes, changes = nil)
      enriched_attributes = attributes
      case record
        when UserIdpDevelopmentAction
          enriched_attributes = enriched_attributes.merge(
            name: record.development_action&.name,
            skill_name: record.user_idp_skill&.skill&.name
          )
        when UserIdpSkill
          enriched_attributes = enriched_attributes.merge(name: record.skill&.name)
      end

      enriched_attributes[:changes] = changes if changes.present?
      enriched_attributes
    end

    def index_by_id(records)
      records.index_by(&:id)
    end
  end
end
