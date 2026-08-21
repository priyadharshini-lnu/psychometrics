# frozen_string_literal: true

module Communications
  module Export
    class AssessmentCenterBookingSummary
      HEADERS = [
        'ClientName',
        'ProjectName',
        'CampaignName',
        'AssessmentCenterGroupName',
        'AssessmentCenterName',
        'Slot Date & Time',
        'Participant Name',
        'Participant Email',
        'Status'
      ].freeze

      def self.generate(communication)
        package = ExcelSafe.new
        project_campaign = communication.project_campaign
        return package if project_campaign.blank?

        workshops = project_campaign.workshops.includes(:workshop_subjects, :campaign_assessment_group,
                                                        workshop_subjects: { user: :campaign_users })

        client_name, project_name, campaign_name = extract_names(communication, project_campaign)

        package.add_worksheet('AC Booking Summary') do |sheet|
          sheet.add_row HEADERS
          add_workshop_rows(
            sheet: sheet,
            workshops: workshops,
            client_name: client_name,
            project_name: project_name,
            campaign_name: campaign_name
          )
        end
        package
      end

      def self.extract_names(communication, project_campaign)
        Mobility.with_locale(I18n.locale) do
          [
            communication.client&.name,
            communication.project&.name,
            project_campaign&.name
          ]
        end
      end

      def self.add_workshop_rows(sheet:, workshops:, client_name:, project_name:, campaign_name:)
        workshops&.each do |workshop|
          slot_datetime = workshop.start_time.strftime('%Y-%m-%d %H:%M')
          assessment_center_group_name = Mobility.with_locale(I18n.locale) { workshop.campaign_assessment_group&.name }
          assessment_center_name = workshop.name
          workshop.workshop_subjects.includes(:user).find_each do |subject|
            campaign_user = CampaignUser.find_by(user_id: subject.user_id, campaign_id: workshop.campaign_id)
            next unless campaign_user

            participant_name = campaign_user.user&.name
            participant_email = campaign_user.user&.email
            status = format_status(subject&.scheduling_status)
            sheet.add_row [
              client_name,
              project_name,
              campaign_name,
              assessment_center_group_name,
              assessment_center_name,
              slot_datetime,
              participant_name,
              participant_email,
              status
            ]
          end
        end
      end

      def self.format_status(status)
        return '' if status.blank?

        status.to_s.humanize
      end
    end
  end
end
