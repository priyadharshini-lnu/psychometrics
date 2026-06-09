# frozen_string_literal: true

module AdminJobs
  class WorkshopStatusExport < BaseExportCsv
    def generate_details
      [[I18n.t('common.model.completion_statuses'), file_link]]
    end

    def generate_title_link
      {
        href: "/admin/projects/#{project.id}/new_campaigns",
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
        'AC Group Name',
        'AC Name',
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
      campaign_users = CampaignUser.
                       preload(:workshop_subjects, :workshop_invited_subjects).
                       includes(:campaign, :user).where(campaigns: { project_id: project.id })

      unless include_inactive_users
        campaign_users = campaign_users.where(active: true)
      end

      campaign_users.find_each(batch_size: 1000)
    end

    def data_row(campaign_user) # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
      prework_status_value = prework_status(campaign_user)

      workshop_groups = get_workshop_groups(campaign_user)

      workshop_groups = { nil => [] } if workshop_groups.empty?

      rows = []

      workshop_groups.each do |assessment_group, workshop_subjects| # rubocop:disable Metrics/BlockLength
        latest_workshop_subject = workshop_subjects.find(&:scheduled?) ||
                                  workshop_subjects.
                                  reject { |ws| ws.rescheduled? || ws.late_rescheduled? }.
                                  max_by(&:created_at)
        latest_workshop = latest_workshop_subject&.workshop
        scheduling_status = latest_workshop_subject&.scheduling_status
        assessment_group_name = assessment_group&.name

        rows << [
          campaign_user.user_id,
          campaign_user.user.first_name,
          campaign_user.user.last_name,
          campaign_user.user.email,
          campaign_user.campaign.name,
          campaign_user.active? ? 'Yes' : 'No',
          prework_status_value,
          prework_status_value == 'Completed' ? last_prework_completed_at(campaign_user)&.to_s : nil,
          scheduling_status&.humanize,
          assessment_group_name,
          latest_workshop&.name,
          workshop_invite_status(campaign_user, assessment_group),
          scheduling_status == 'scheduled' ? assessment_center_status(campaign_user) : nil,
          latest_workshop_subject&.attendance_status&.humanize,
          latest_workshop&.start_time&.to_s,
          latest_workshop_subject ? latest_workshop_subject.preferred_language || 'Not Selected' : nil,
          workshop_subjects.count { |ws| ws.scheduling_status == 'late_cancelled' },
          workshop_subjects.count { |ws| ws.scheduling_status == 'late_rescheduled' }
        ]
      end

      rows
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

    def include_inactive_users
      record.data['include_inactive_users'] || false
    end

    def workshop_invite_status(campaign_user, assessment_group)
      return 'Not Invited' if assessment_group.nil?

      invited_to_group = campaign_user.workshop_invited_subjects.joins(:workshop_invite).
                         exists?(workshop_invites: { campaign_assessment_group: assessment_group })

      invited_to_group ? 'Invited' : 'Not Invited'
    end

    def get_workshop_groups(campaign_user)
      workshop_groups = campaign_user.workshop_subjects.joins(workshop: :campaign_assessment_group).group_by do |ws|
        ws.workshop.campaign_assessment_group
      end

      invited_groups = campaign_user.workshop_invited_subjects.joins(:workshop_invite).
                       includes(workshop_invite: :campaign_assessment_group).
                       filter_map { |wis| wis.workshop_invite.campaign_assessment_group }.
                       uniq

      invited_groups.each do |assessment_group|
        workshop_groups[assessment_group] ||= []
      end

      workshop_groups
    end
  end
end
