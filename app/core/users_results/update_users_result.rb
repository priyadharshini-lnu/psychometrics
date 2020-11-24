# frozen_string_literal: true

module UsersResults
  class UpdateUsersResult < BaseCommand
    private_attr_reader :form, :users_result, :subject_user, :current_user

    def initialize(form, users_result, current_user)
      @form = form
      @users_result = users_result
      @subject_user = users_result.subject
      @evaluator_user = users_result.evaluator
      @current_user = current_user
    end

    def call
      return broadcast(:invalid) if form.invalid?

      update_users_result
      if users_result.completed?
        if threesixty_campaign
          send_necessary_emails
        else
          set_completion_status
          generate_report
        end
      end

      broadcast(:ok)
    end

    private

    # Sets new data to the users_result
    #   and increases the step of users_result
    #
    def update_users_result
      attributes = form.attributes_with_values
      attributes.delete(:status) if users_result.completed?
      users_result.update!(attributes)
      # Calculates scoring and sets time of completion
      if users_result.completed?
        users_result.answers = ::UsersResults::RemoveDirtyResults.call!(users_result.answers)
        users_result.answers = ::UsersResults::ExpandAnswersByRecoding.call!(users_result)
        users_result.scoring = ::UsersResults::CalculateScoring.call!(users_result)
        users_result.occupations = ::Assigns::CalculateOccupations.call!(users_result)
        users_result.completed_at = Time.now
        if threesixty_campaign
          participant = threesixty_campaign.
                        participants.
                        find_by(subject_id: @subject_user, evaluator_id: @evaluator_user)
          participant.update_attributes(evaluator_nomination_status: :completed, users_result_id: users_result.id)
          if participant.relationship_id == Relationship.manager_relationship.id
            participant.update_attributes(manager_evaluation_status: :approved)
          end
        end
      end

      users_result.save!
    end

    def set_completion_status
      camapaign = users_result.user_assessment.campaign
      return if camapaign.fixed_time?

      campaign_user = current_user.campaign_users.where(campaign_id: camapaign.id).first
      ::CampaignUsers::MarkCompleted.call!(campaign_user) if campaign_user.user_assessments.all?(&:completed?)
    end

    def generate_report
      ::UsersResults::GenerateReports.call!(users_result, current_user)
    end

    def send_necessary_emails
      subject = users_result.threesixty_subject
      Threesixty::Emails::Send.call!(
        Threesixty::Emails::Name::SUBJECT_REPORT_READY, threesixty_campaign: threesixty_campaign, subject: subject
      )
      Threesixty::Emails::Send.call!(
        Threesixty::Emails::Name::MANAGER_REPORT_READY, threesixty_campaign: threesixty_campaign, subject: subject
      )
      Threesixty::Emails::Send.call!(
        Threesixty::Emails::Name::APPROVE_REPORT, threesixty_campaign: threesixty_campaign, subject: subject
      )
    end

    def threesixty_campaign
      users_result.threesixty_campaign
    end
  end
end
