# frozen_string_literal: true

module UsersResults
  class UpdateUsersResult < BaseCommand
    def initialize(form, users_result, threesixty_campaign = nil)
      @form = form
      @users_result = users_result
      @subject_user = users_result.subject
      @evaluator_user = users_result.evaluator
      @threesixty_campaign = threesixty_campaign
    end

    def call
      return broadcast(:invalid) if form.invalid?

      update_users_result
      if users_result.completed?
        if users_result.campaign.common?
          generate_report
        else
          send_necessary_emails
        end
      end

      broadcast(:ok)
    end

    private

    attr_reader :form, :users_result, :subject_user, :threesixty_campaign

    # Sets new data to the users_result
    #   and increases the step of users_result
    #
    def update_users_result
      attributes = form.attributes_with_values
      attributes.delete(:status) if users_result.completed?
      users_result.update!(attributes)

      # Calculates scoring and sets time of completion
      if users_result.completed?
        users_result.answers = ::UsersResults::ExpandAnswersByRecoding.call!(users_result)
        users_result.scoring = ::UsersResults::CalculateScoring.call!(users_result, {})
        users_result.occupations = ::Assigns::CalculateOccupations.call!(users_result)
        users_result.completed_at = Time.now
        if users_result.campaign.threesixty?
          participant = @threesixty_campaign.
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

    def generate_report
      # UserAssessment::GenerateReport.call(assign, current_user)
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
  end
end
