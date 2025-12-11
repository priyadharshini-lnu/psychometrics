# frozen_string_literal: true

module AdminJobs
  class BulkUpdateEvaluationStatus < AdminJobs::Base
    def call
      subjects.find_each do |subject|
        ::CampaignReports::UpdateEvaluationStatus.call!(subject, subject_data['status'], record.owner)
      end

      broadcast :ok
    end

    def generate_title_link
      # rubocop:disable Layout/LineLength
      {
        href: "/admin/clients/#{campaign.client.id}/projects/#{campaign.project_id}/threesixty_campaigns/#{threesixty_campaign.id}/participants/subjects",
        label: "#{campaign.name} Subjects"
      }
      # rubocop:enable Layout/LineLength
    end

    def generate_details
      [
        [
          "#{I18n.t('administration.reports.bulk_marked_as_done')} - #{status_name}",
          subjects.map(&:id).join(', ')
        ]
      ]
    end

    def valid?
      campaign.present?
    end

    private

    def subjects
      subjects = campaign.subjects

      subjects = subjects.where.not(id: subject_data['excluded_ids'].presence || [])
      subjects = subjects.where(id: subject_data['selected_ids']) if subject_data['selected_ids'].present?

      subjects
    end

    def status_name
      if subject_data['status'] == 'completed'
        I18n.t('campaign_assessment.actions.bulk_update_evaluation_as_done')
      else
        I18n.t('campaign_assessment.actions.bulk_update_evaluation_as_undone')
      end
    end

    def campaign
      @campaign ||= threesixty_campaign.campaign
    end

    def threesixty_campaign
      @threesixty_campaign ||= ::Threesixty::Campaign.find(record.data['threesixty_id'])
    end

    def subject_data
      record.data['evaluation_status_params'] || {}
    end
  end
end
