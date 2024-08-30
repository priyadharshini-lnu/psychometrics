# frozen_string_literal: true

module UsersResults
  class UpdateUsersResult < BaseCommand
    private_attr_reader :form, :users_result, :user_assessment, :subject_user, :current_user, :project

    def initialize(form, users_result, current_user)
      @form = form
      @users_result = users_result
      @user_assessment = users_result.user_assessment
      @subject_user = users_result.subject
      @evaluator_user = users_result.evaluator
      @current_user = current_user
      @project = user_assessment.campaign.project
    end

    def call
      return broadcast(:invalid) if form.invalid?

      update_users_result
      if users_result.completed?
        if threesixty_campaign
          send_necessary_emails
        else
          UserAssessments::Webhook.new(user_assessment).publish_results_available
          generate_report
        end
      end

      broadcast(:ok)
    end

    private

    # Sets new data to the users_result
    #   and increases the step of users_result
    #
    # rubocop:disable Metrics/AbcSize
    def update_users_result
      attributes = form.attributes_with_values
      if user_assessment.progress_reseted?
        attributes = attributes.merge(current_element: nil, current_page: nil,
                                      answers: attributes[:answers]&.each { |_, r| r['dirty'] = true },
                                      progress_reseted: false)
      end
      users_result.update!(attributes.except(*user_assessment_attribute_names))
      user_assessment_form_attributes = attributes.slice(*user_assessment_attribute_names)
      user_assessment.update!(user_assessment_form_attributes.except(:norm_id))
      # Calculates scoring and sets time of completion
      if user_assessment.completed?
        norm_id = user_assessment.applicable_norm_id || user_assessment_form_attributes[:norm_id]
        user_assessment.update!(completed_at: Time.zone.now, norm_id: norm_id)
        users_result.answers = ::UsersResults::RemoveDirtyResults.call!(users_result.answers)
        users_result.answers = ::UsersResults::ExpandAnswersByRecoding.call!(users_result)
        users_result.scoring = ::UsersResults::CalculateScoring.call!(users_result)
        users_result.occupations = ::UsersResults::CalculateOccupations.call!(users_result)
        users_result.innovation_styles = UsersResults::CalculateInnovationStyles.call!(users_result)
        UserAssessments::Webhook.new(user_assessment).publish_assessment_completed
        if threesixty_campaign
          user_assessment_attrs = { evaluator_nomination_status: :completed }
          if user_assessment.relationship_id == Relationship.manager_relationship.id
            user_assessment_attrs[:manager_evaluation_status] = :approved
          end
          user_assessment.update!(user_assessment_attrs)
        end
      end
      if user_assessment.deemed_completed?
        user_assessment.update!(completed_at: Time.zone.now)
        users_result.progress = 100
      end

      users_result.save!
    end
    # rubocop:enable Metrics/AbcSize

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

    def user_assessment_attribute_names
      %i[norm_id status completion_reason last_activity_at progress_reseted completion_status_code]
    end
  end
end
