# frozen_string_literal: true

module Communications
  class CopyTemplate < BaseCommand
    private_attr_reader :source_template, :user, :target_project_id, :target_campaign_id

    def initialize(source_template, user, target_project_id: nil, target_campaign_id: nil, **)
      @source_template = source_template
      @user = user
      @target_project_id = target_project_id
      @target_campaign_id = target_campaign_id
    end

    def call
      return broadcast(:error, validation_error) if validation_error

      copied_template = ActiveRecord::Base.transaction do
        copy = build_copy
        save_with_translations(copy)
      end

      broadcast :ok, copied_template
    end

    private

    def build_copy
      source_template.dup.tap do |copy|
        copy.name = "#{source_template.name} (Copy)"
        copy.created_by = user
        copy.updated_by = user
        assign_target_scope(copy)
      end
    end

    def assign_target_scope(copy)
      case source_template.level
        when 'project' then assign_project_scope(copy)
        when 'campaign' then assign_campaign_scope(copy)
      end
    end

    def assign_project_scope(copy)
      copy.client = target_project.client
      copy.project = target_project
      copy.campaign = nil
    end

    def assign_campaign_scope(copy)
      copy.client = target_campaign.client
      copy.project = target_campaign.project
      copy.campaign = target_campaign
    end

    def save_with_translations(copy)
      source_template.translations.each do |translation|
        Mobility.with_locale(translation.locale) do
          copy.subject = translation.subject
          copy.body    = translation.body
        end
      end
      copy.save!
      copy
    end

    def validation_error
      @validation_error ||= validate_source_level ||
                            validate_project_target ||
                            validate_campaign_target ||
                            validate_target_client
    end

    def validate_source_level
      if source_template.platform?
        I18n.t('admin.communication_template_platform_copy_unsupported')
      elsif source_template.client?
        I18n.t('admin.communication_template_client_copy_unsupported')
      end
    end

    def validate_project_target
      return unless source_template.project?
      return I18n.t('admin.communication_template_target_project_required') if target_project_id.blank?

      I18n.t('admin.communication_template_target_project_required') unless target_project
    end

    def validate_campaign_target
      return unless source_template.campaign?
      return I18n.t('admin.communication_template_target_campaign_required') if target_campaign_id.blank?

      I18n.t('admin.communication_template_target_campaign_required') unless target_campaign
    end

    def validate_target_client
      return if source_template.client_id == target_scope_client_id

      I18n.t('admin.communication_template_target_client_mismatch')
    end

    def target_scope_client_id
      return target_project&.parent_id if source_template.project?

      target_campaign&.client&.id
    end

    def target_project
      @target_project ||= ActsAsTenant.without_tenant { Client.projects.find_by(id: target_project_id) }
    end

    def target_campaign
      @target_campaign ||= ActsAsTenant.without_tenant { Campaign.find_by(id: target_campaign_id) }
    end
  end
end
