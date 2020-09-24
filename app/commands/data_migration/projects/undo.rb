# frozen_string_literal: true

module DataMigration
  module Projects
    class Undo < Rectify::Command
      private_attr_reader :project, :logger

      delegate :log, to: :logger

      def initialize(project_id, level = 0, out = $stdout)
        @project = Client.find_by(ancestry_depth: 1, id: project_id)
        @logger = DataMigration::Logger.new('Project', project_id, level, out)
      end

      def call
        return broadcast(:invalid) if project.nil?
        return broadcast(:invalid) unless project.migrated?

        log('preparing to undo project migration')
        transaction do
          subjects = case project.applicable_level
                       when 'project'
                         [project]
                       when 'campaign'
                         Client.campaigns_of(project.id)
                       when 'sub_campaign'
                         Client.sub_campaigns_of(project.id)
                     end

          subjects.each do |subject|
            campaign = Campaign.find_by(id: subject.id)
            destroy(campaign) if campaign
          end

          log('done.')
          log('updating migration status')

          project.update_attribute(:migrated, false)
        end

        broadcast(:ok)
      rescue ActiveRecord::RecordInvalid
        broadcast(:error)
      end

      private

      def destroy(campaign)
        delete_user_reports(campaign)
        delete_user_assessments(campaign)
        delete_campaign_users(campaign)

        campaign.destroy!
      end

      def delete_campaign_users(campaign)
        campaign.campaign_users.destroy_all
      end

      def delete_user_assessments(campaign)
        UserAssessment.where(campaign_id: campaign.id, project_id: project.id).destroy_all
      end

      def delete_user_reports(campaign)
        UserReport.where(campaign_id: campaign.id).destroy_all
      end
    end
  end
end
