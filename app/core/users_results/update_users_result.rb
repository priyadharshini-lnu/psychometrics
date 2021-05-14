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
          publish_results_to_webhook
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
      users_result.update!(attributes.except(*user_assessment_attribute_names))
      user_assessment_form_attributes = attributes.slice(*user_assessment_attribute_names)
      user_assessment.update!(user_assessment_form_attributes.except(:norm_id))
      # Calculates scoring and sets time of completion
      if user_assessment.completed?
        norm_id = user_assessment.applicable_norm_id || user_assessment_form_attributes[:norm_id]
        user_assessment.update!(completed_at: Time.now, norm_id: norm_id)
        users_result.answers = ::UsersResults::RemoveDirtyResults.call!(users_result.answers)
        users_result.answers = ::UsersResults::ExpandAnswersByRecoding.call!(users_result)
        users_result.scoring = ::UsersResults::CalculateScoring.call!(users_result)
        users_result.occupations = ::Assigns::CalculateOccupations.call!(users_result)
        publish_assessment_completion_to_webhook
        if threesixty_campaign
          user_assessment_attrs = { evaluator_nomination_status: :completed }
          if user_assessment.relationship_id == Relationship.manager_relationship.id
            user_assessment_attrs[:manager_evaluation_status] = :approved
          end
          user_assessment.update!(user_assessment_attrs)
        end
      end

      users_result.save!
    end

    def publish_assessment_completion_to_webhook
      data = {
        campaign: users_result.user_assessment.campaign,
        assessment: users_result.assessment,
        evaluator: users_result.evaluator,
        subject: users_result.subject
      }
      WebhookSubscriptions::Publish.call!(project, :assessment_completed, data)
    end

    def publish_results_to_webhook
      users_result.user_reports.each do |user_report|
        next unless user_report.generatable?
        next if user_report.report.data_configuration.empty?

        built_results = ::Reports::BuildResults.call(user_report.report, user_report.user_results, true)[:ok]
        data = {
          campaign: users_result.user_assessment.campaign,
          subject: users_result.subject,
          report: user_report.report,
          results: Api::V1::ResultSerializer.new(built_results, user_report: user_report).to_h
        }
        WebhookSubscriptions::Publish.call!(project, :results_available, data)
      end
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

    def user_assessment_attribute_names
      %i[norm_id status completion_reason]
    end
  end
end
