# frozen_string_literal: true

module Mettl
  class ResetCandidateAssessment < Base
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      mettl_schedule_record = Mettl::GetMettlScheduleRecordForReset.call!(user_assessment)

      if mettl_schedule_record.present?
        delete_candidates_existing_result
        mettl_user_assessment.update!(mettl_schedule_record_id: mettl_schedule_record.id, url: nil)
      end

      broadcast :ok
    end

    private

    def delete_candidates_existing_result
      Mettl::DeleteCandidateResult.call!(user_assessment)
    end

    def mettl_user_assessment
      user_assessment.mettl_user_assessment
    end
  end
end
