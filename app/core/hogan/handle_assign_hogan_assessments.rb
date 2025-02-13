# frozen_string_literal: true

module Hogan
  class HandleAssignHoganAssessments < BaseCommand
    private_attr_reader :user, :user_assessments, :user_report, :options

    def initialize(user, user_assessments, user_report, options = {})
      @user = user
      @user_assessments = user_assessments
      @user_report = user_report
      @options = options
    end

    def call
      return if existing_hogan_credential.blank?

      user_assessments.each do |user_assessment|
        next unless user_assessment.hogan?

        handle_existing_response(user_assessment) if options[:operation] == 'add_with_existing_response'
        handle_new_response(user_assessment) if options[:operation] == 'add_and_allow_new_response'
      end

      user_report.attach_hogan_credential(existing_hogan_credential)
    end

    private

    def handle_existing_response(user_assessment)
      status = get_status_of_user_assessment(user_assessment)
      user_assessment.attach_hogan_credential(existing_hogan_credential)

      if status == 'Completed'
        user_assessment.complete!
        Hogan::HandleAssessmentCompletion.call!(user_assessment) if user_assessment.completed?
      end
    end

    def handle_new_response(user_assessment)
      status = get_status_of_user_assessment(user_assessment)

      if status != 'NotAssigned'
        raise Hogan::Exceptions::NewAssessmentResponseNotAllowed,
              I18n.t('administration.hogan.errors.new_assessment_response_not_allowed',
                     email: user.email,
                     assessment_name: user_assessment.assessment.name)
      end

      user_assessment.attach_hogan_credential(existing_hogan_credential)
    end

    def get_status_of_user_assessment(user_assessment)
      assessment_details = participant_profile && participant_profile['assessmentDetails']
      return 'NotAssigned' unless assessment_details

      external_assessment_id = user_assessment.assessment.external_settings[:assessment_id]
      external_form_id = user_assessment.assessment.external_settings[:form_id].to_s

      assessment_detail = assessment_details.find do |detail|
        detail['assessmentId'] == external_assessment_id && detail['formId'].strip == external_form_id
      end

      assessment_detail ? assessment_detail['status'] : 'NotAssigned'
    end

    def participant_profile
      @participant_profile ||= Services::Hogan::Api::Json::GetParticipantProfile.call!(
        group: existing_hogan_credential.hogan_group_name,
        participant_id: existing_hogan_credential.participant_id,
        provider: existing_hogan_credential.provider
      )
    end

    def existing_hogan_credential
      @existing_hogan_credential ||= user.hogan_credential
    end
  end
end
