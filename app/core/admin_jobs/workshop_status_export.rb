# frozen_string_literal: true

module AdminJobs
  class WorkshopStatusExport < BaseExportCsv
    def generate_details
      [[I18n.t('common.model.completion_statuses'), file_link]]
    end

    def generate_title_link
      {
        href: "/administration/projects/#{project.id}/new_campaigns",
        label: project.name
      }
    end

    private

    def headers
      [
        'Id',
        'First name',
        'Last name',
        'Email',
        'Campaign',
        'User Active',
        'Prework Status',
        'Prework Completed Date',
        'Scheduling Status',
        'AC Invite',
        'AC Activity Completion',
        'AC Attendance Status',
        'AC Date',
        'Preferred Language',
        'Late Cancelled',
        'Late Rescheduled'
      ]
    end

    def records_for_export
      CampaignUser.includes(:campaign, :user, :workshop_subjects, :workshop_invited_subjects).
        where(campaigns: { project_id: project.id }).
        find_each(batch_size: 1000)
    end

    def data_row(campaign_user) # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
      prework_status = prework_status(campaign_user)
      latest_workshop_subject = campaign_user.workshop_subjects.max_by(&:created_at)
      latest_workshop = latest_workshop_subject&.workshop
      scheduling_status = latest_workshop_subject&.scheduling_status

      [
        campaign_user.user_id,
        campaign_user.user.first_name,
        campaign_user.user.last_name,
        campaign_user.user.email,
        campaign_user.campaign.name,
        campaign_user.active? ? 'Yes' : 'No',
        prework_status,
        prework_status == 'Completed' ? last_prework_completed_at(campaign_user)&.to_s : nil,
        scheduling_status&.humanize,
        campaign_user.workshop_invited_subjects.present? ? 'Invited' : 'Not Invited',
        scheduling_status == 'scheduled' ? assessment_center_status(campaign_user) : nil,
        latest_workshop_subject&.attendance_status&.humanize,
        latest_workshop&.start_time&.to_s,
        latest_workshop_subject ? latest_workshop_subject.preferred_language || 'Not Selected' : nil,
        campaign_user.workshop_subjects.count { |ws| ws.scheduling_status == 'late_cancelled' },
        campaign_user.workshop_subjects.count { |ws| ws.scheduling_status == 'late_rescheduled' }
      ]
    end

    def assessment_center_status(campaign_user)
      status_count = workshop_activities_assessment_status_count[[campaign_user.campaign_id, campaign_user.user_id]]
      return 'Completed' if status_count.blank? || status_count['total'] == status_count['completed']

      return 'Not Started' if status_count['total'] == status_count['not_started']

      'In Progress'
    end

    def prework_status(campaign_user)
      status_count = prework_user_assessment_status_count[[campaign_user.campaign_id, campaign_user.user_id]]
      return 'Completed' if status_count.blank? || status_count['total'] == status_count['completed']

      return 'Not Started' if status_count['total'] == status_count['not_started']

      'In Progress'
    end

    def last_prework_completed_at(campaign_user)
      @last_prework_completed_at ||= Projects::LastPreworkCompletedAt.call!(project)
      @last_prework_completed_at[[campaign_user.campaign_id, campaign_user.user_id]]
    end

    def prework_user_assessment_status_count
      @prework_user_assessment_status_count ||=
        Projects::UserAssessmentStatusCount.call!(project, UserAssessment.preworks(true))
    end

    def workshop_activities_assessment_status_count
      @workshop_activities_assessment_status_count ||=
        Projects::UserAssessmentStatusCount.call!(project, UserAssessment.workshop_activities(true))
    end

    def file_name
      "assessment-center-export-#{project.name.parameterize}.csv"
    end
  end
end
