class UserResultSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :answers, :scoring, :user_id, :assessment_id,
             :data_sheet, :relationship, :norm_data, :embedded_data
             #:external_scoring,

  attribute :relationship, if: -> { object.assessment.threesixty? }

  has_one :user, serializer: UserSerializer
  has_one :subject, serializer: UserSerializer

  def is_self
    object.evaluator_id === object.subject_id
  end

  def user
    object.evaluator
  end

  def user_id
    object.evaluator_id
  end

  def relationship
    participant&.relationship&.name
  end

  def embedded_data
    {} # TODO: add embeded data
  end

  def norm_data
    {} # TODO: add norm data
  end

  # TODO (atanych): refactor within https://gitlab.com/tte-lighthouse/psychometrics/issues/59
  # TODO update to use extrnal scoring if it's needed
  def external_scoring
    return {} if object.assessment.psychometric?
    return object.external_results if object.assessment.mindmill?
    if object.assessment.hogan?
      assign_report = object.original_assign.assigns_reports.find { |r| r.hogan_score.present? }
      score = assign_report&.hogan_score&.dig('participant', 'assessment', 'score') || {}
      if score.present?
        return score.each_with_object({}) do |v, res|
          res[normalize_hogan_type(v["type"])] = v["scales"]["scale"].each_with_object({}) do |factor, inner_res|
            inner_res[factor["id"]] = factor["__content__"].to_f
          end
        end
      end
    end
    {}
  end

  def data_sheet
    row = DatasheetRow.joins(:datasheet).
            find_by(datasheets: { project_id: campaign.project }, email: object.evaluator.email)
    row&.data || {}
  end

  def normalize_hogan_type(type)
    return 'Raw' if type == 'RAW'
    return 'Percentile' if type == 'percentile'
    raise "Not supported hogan type #{type}"
  end

  private

  def participant
    @participant ||= instance_options[:participant]
  end

  def campaign
    @campaing ||= instance_options[:campaign]
  end

end
