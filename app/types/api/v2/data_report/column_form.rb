# frozen_string_literal: true

module Api::V2::DataReport
  class ColumnForm < Rectify::Form
    FORM_TYPES = {
      'assessment_score' => Api::V2::DataReport::TypesForms::AssessmentScoreForm,
      'campaign_score' => Api::V2::DataReport::TypesForms::CampaignScoreForm,
      'user_detail' => Api::V2::DataReport::TypesForms::UserDetailForm,
      'campaign_detail' => Api::V2::DataReport::TypesForms::CampaignDetailForm,
      'project_detail' => Api::V2::DataReport::TypesForms::ProjectDetailForm,
      'user_assessment_detail' => Api::V2::DataReport::TypesForms::UserAssessmentDetailForm,
      'datasheet_value' => Api::V2::DataReport::TypesForms::DatasheetValueForm
    }.freeze

    attribute :name
    attribute :type

    validates :type, inclusion: { in: FORM_TYPES.keys,
                                  message: I18n.t('administration.data_reports.errors.inclusion',
                                                  values: FORM_TYPES.keys), allow_blank: true }
    validates :type, presence: true

    validate :validate_by_type, if: :valid_type?

    def initialize(attributes = {})
      super
      @params = attributes
    end

    private

    def valid_type?
      FORM_TYPES.key?(type)
    end

    def validate_by_type
      form = FORM_TYPES[type].new(@params).with_context(context)
      form.validate

      form.errors.full_messages.each do |error|
        errors.add('', error)
      end
    end
  end
end
