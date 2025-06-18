# frozen_string_literal: true

module CampaignAssessmentGroups
  class Destroy < BaseCommand
    private_attr_reader :campaign, :group

    def initialize(campaign, group)
      @campaign = campaign
      @group = group
    end

    def call
      if has_workshops?
        return broadcast(:error, I18n.t('assessments_reports.sequencing.modal.delete.cannot_delete_with_workshops'))
      end

      ActiveRecord::Base.transaction do
        max_position = campaign.campaign_assessments.where(campaign_assessment_group_id: nil).maximum('position') || 0

        group.campaign_assessments.each do |ca|
          attributes = { position: max_position + 1 }

          if group.assessment_center?
            attributes[:workshop_activity_duration] = nil
            attributes[:workshop_activity] = false
          end

          ca.update(attributes)
          max_position += 1
        end

        group.destroy
      end

      broadcast :ok
    end

    private

    def has_workshops?
      Workshop.exists?(campaign_assessment_group_id: group.id)
    end
  end
end
