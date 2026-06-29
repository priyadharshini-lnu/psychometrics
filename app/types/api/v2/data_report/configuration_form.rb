# frozen_string_literal: true

module Api::V2::DataReport
  class ConfigurationForm < Rectify::Form
    attribute :configuration

    validate :validate_configuration
    validate :validate_project_and_campaign, if: :data
    validate :validate_sections, if: :data

    def validate_configuration
      errors.add(:configuration, :invalid_json) unless data
    end

    def validate_project_and_campaign
      if data['project_ids'].blank? && data['campaign_ids'].blank?
        errors.add(:configuration, I18n.t('administration.data_reports.validations.project_or_campaign_required'))
      end

      if data['project_ids'].present? && data['campaign_ids'].present?
        errors.add(:configuration, I18n.t('administration.data_reports.validations.project_and_campaigns_not_allowed'))
      end

      if data['project_ids'].present?
        projects = Project.where(id: data['project_ids'])
        projects.each do |project|
          next if context[:client_id].nil?
          next if project.tte_id == context[:client_id]

          errors.add(
            :configuration,
            I18n.t('admin.project_not_related_to_client', { project_id: project.id })
          )
        end
      end
    end

    def validate_sections
      if data['sections'].blank?
        return errors.add(:configuration, I18n.t('administration.data_reports.validations.sections_required'))
      end

      data['sections'].each.with_index do |section, section_num|
        form = Api::V2::DataReport::SectionForm.new(section).with_context(
          context.to_h.merge(campaign_ids: data['campaign_ids'], project_ids: data['project_ids'])
        )
        form.validate
        err = form.errors.full_messages.join(', ')
        errors.add(:configuration, "section##{section_num + 1}: #{err}") if err.present?
      end
    end

    private

    def data
      @data ||= Oj.load(configuration)
    rescue Oj::ParseError
      nil
    end
  end
end
