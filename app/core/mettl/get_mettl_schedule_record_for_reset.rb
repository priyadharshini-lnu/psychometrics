# frozen_string_literal: true

module Mettl
  class GetMettlScheduleRecordForReset < Base
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      mettl_schedule_record = find_or_create_mettl_schedule_record
      broadcast :ok, mettl_schedule_record
    end

    private

    def find_or_create_mettl_schedule_record
      mettl_schedule_record = MettlScheduleRecord.find_by(
        schedule_number: next_schedule_number,
        project_id: project.id,
        assessment_id: user_assessment.assessment_id
      )

      return mettl_schedule_record if mettl_schedule_record.present?

      create_mettl_schedule_record
    end

    def create_mettl_schedule_record
      mettl_schedule_record = ::Mettl::CreateSchedule.call!(assessment, { name: retry_schedule_name })
      mettl_schedule_record.update!(
        duplicated_from_id: default_mettl_schedule_record.id,
        schedule_number: next_schedule_number
      )
      mettl_schedule_record
    end

    def retry_schedule_name
      "#{default_mettl_schedule_record.schedule_name} Retake-#{user_assessment.reset_count}"
    end

    def default_mettl_schedule_record
      mettl_user_assessment.mettl_schedule_record.parent_or_self
    end

    def mettl_user_assessment
      @mettl_user_assessment ||= user_assessment.mettl_user_assessment
    end

    def mettl_assessment
      @mettl_assessment ||= MettlAssessment.find_by(product_id: assessment.external_assessment_id)
    end

    def assessment
      @assessment ||= user_assessment.assessment
    end

    def next_schedule_number
      user_assessment.reset_count + 1
    end
  end
end
