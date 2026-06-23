# frozen_string_literal: true

module UserReports
  class AssessmentNotCompletedReasonBuilder
    private_attr_reader :user_report

    def initialize(user_report)
      @user_report = user_report
    end

    def build
      return if user_report.all_assessments_are_scored?

      assessment_names = incomplete_non_assessor_assessment_names
      assessment_messages = build_assessment_messages(assessment_names)
      assessor_messages = build_assessor_messages

      all_messages = assessment_messages + assessor_messages
      return if all_messages.blank?

      {
        available: false,
        reason_code: 'assessment_not_completed',
        reason_message: format_messages_as_bullet_list(all_messages)
      }
    end

    private

    def build_assessment_messages(assessment_names)
      messages = []
      messages << build_assessment_message(assessment_names, singular: true) if assessment_names.one?
      messages << build_assessment_message(assessment_names, singular: false) if assessment_names.many?
      messages
    end

    def build_assessor_messages
      messages = []
      assessor_form_user_names = incomplete_assessor_form_user_names
      lead_assessor_form_user_names = incomplete_lead_assessor_form_user_names

      if assessor_form_user_names.present?
        messages << build_assessor_reason(
          assessor_form_user_names,
          singular: assessor_form_user_names.one?
        )
      end

      if lead_assessor_form_user_names.present?
        messages << build_lead_assessor_reason(
          lead_assessor_form_user_names,
          singular: lead_assessor_form_user_names.one?
        )
      end

      messages
    end

    def format_messages_as_bullet_list(messages)
      return messages.first if messages.one?

      messages.map { |message| "- #{message}" }.join("\n")
    end

    def build_assessment_message(names, singular:)
      translation_key = if singular
                          'shared.user_reports_assessment_name_not_completed_reason_template'
                        else
                          'shared.user_reports_assessments_name_not_completed_reason_template'
                        end

      I18n.t(translation_key, names: singular ? names.first : names.join(', '))
    end

    def build_assessor_reason(names, singular:)
      translation_key = if singular
                          'shared.user_reports_assessor_not_completed_reason_template'
                        else
                          'shared.user_reports_assessors_not_completed_reason_template'
                        end

      I18n.t(translation_key, names: singular ? names.first : names.join(', '))
    end

    def build_lead_assessor_reason(names, singular:)
      translation_key = if singular
                          'shared.user_reports_lead_assessor_not_completed_reason_template'
                        else
                          'shared.user_reports_lead_assessors_not_completed_reason_template'
                        end

      I18n.t(translation_key, names: singular ? names.first : names.join(', '))
    end

    def incomplete_assessor_form_user_names
      incomplete_assessor_user_names_for_categories([Assessment::ASSESSOR_FORM])
    end

    def incomplete_lead_assessor_form_user_names
      incomplete_assessor_user_names_for_categories([Assessment::LEAD_ASSESSOR_FORM])
    end

    def incomplete_assessor_user_names_for_categories(categories)
      assessor_relationship_id = Relationship.assessor_relationship&.id
      return [] if assessor_relationship_id.blank?

      UserAssessment.joins(:assessment).
        joins(:evaluator).
        where(
          campaign_id: user_report.campaign_id,
          subject_id: user_report.user_id,
          assessment_id: user_report.report.assessment_ids,
          relationship_id: assessor_relationship_id,
          assessments: { category: categories }
        ).
        merge(UserAssessment.deemed_incomplete).
        distinct.
        pluck(Arel.sql("COALESCE(NULLIF(TRIM(CONCAT(users.first_name, ' ', users.last_name)), ''), users.email)"))
    end

    def incomplete_non_assessor_assessment_names
      completed_assessment_ids = UserAssessment.
                                 where(
                                   campaign_id: user_report.campaign_id,
                                   subject_id: user_report.user_id,
                                   assessment_id: user_report.report.assessment_ids,
                                   status: :completed
                                 ).
                                 pluck(:assessment_id)
      incomplete_assessment_ids = user_report.report.assessment_ids - completed_assessment_ids

      return [] if incomplete_assessment_ids.empty?

      Assessment.where(id: incomplete_assessment_ids).
        where.not(category: [Assessment::ASSESSOR_FORM, Assessment::LEAD_ASSESSOR_FORM]).
        pluck(:name)
    end
  end
end
