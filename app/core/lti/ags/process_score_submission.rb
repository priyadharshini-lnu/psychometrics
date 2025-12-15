# frozen_string_literal: true

module Lti
  module Ags
    class ProcessScoreSubmission < BaseCommand
      attr_reader :score_data, :request, :token_record, :project

      def initialize(score_data, request)
        @score_data = score_data
        @request = request
      end

      def call
        unless authenticate_request
          return { error: 'Unauthorized' }
        end

        process_score_submission
      end

      private

      def authenticate_request
        access_token = extract_access_token
        return false unless access_token

        validation_result = validate_access_token(access_token)

        if validation_result[:success]
          @token_record = validation_result[:token_record]
          @project = @token_record.project
          true
        else
          audit_authentication_failure(validation_result[:error])
          Rails.logger.warn "LTI AGS authentication failed: #{validation_result[:error]}"
          false
        end
      end

      def extract_access_token
        auth_header = request.headers['Authorization']
        return nil unless auth_header&.start_with?('Bearer ')

        auth_header.sub('Bearer ', '')
      end

      def validate_access_token(token)
        Lti::Oauth2TokenValidator.new(
          token: token,
          required_scope: ['https://purl.imsglobal.org/spec/lti-ags/scope/score']
        ).call
      end

      def process_score_submission
        user_assessment = find_user_assessment_from_score_data

        unless user_assessment
          return { error: 'User assessment not found' }
        end

        save_score_to_user_assessment(user_assessment)

        { success: true, project_id: project.id, user_assessment_id: user_assessment.id,
          user_assessment: user_assessment }
      rescue StandardError => e
        audit_score_processing_error(user_assessment, e)
        Rails.logger.error "Failed to process score submission: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        { error: 'Internal server error' }
      end

      def find_user_assessment_from_score_data
        user_id = score_data['userId']

        user_assessment = UserAssessment.find_by_encoded_id(user_id) if user_id # rubocop:disable Rails/DynamicFindBy

        user_assessment
      rescue Hashids::InputError, ActiveRecord::RecordNotFound => e
        Rails.logger.error "LTI AGS: Invalid userId in score data: #{user_id} - #{e.message}"
        nil
      end

      def save_score_to_user_assessment(user_assessment)
        if score_data['activityProgress'] == 'Completed'
          unless user_assessment.completed?
            user_assessment.complete!
            audit_assessment_completed(user_assessment)
          end
          Lti::Ags::SaveScoresAndReport.call!(user_assessment, score_data)
        end
      end

      def audit_authentication_failure(error)
        AuditLogModule.audit!(:lti_ags_authentication_failure, nil,
                              payload: {
                                error: error,
                                score_data: score_data
                              })
      end

      def audit_score_processing_error(user_assessment, error)
        AuditLogModule.audit!(:lti_ags_score_processing_error, user_assessment,
                              project: project,
                              campaign: user_assessment&.campaign,
                              payload: {
                                error: error.message,
                                score_data: score_data
                              })
      end

      def audit_assessment_completed(user_assessment)
        AuditLogModule.audit!(:lti_ags_assessment_completed, user_assessment,
                              project: project,
                              campaign: user_assessment.campaign,
                              payload: score_data.merge(
                                assessment_id: user_assessment.assessment.id,
                                assessment_name: user_assessment.assessment.name
                              ))
      end
    end
  end
end
