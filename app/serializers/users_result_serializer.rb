class UsersResultSerializer < ActiveModel::Serializer
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

  def data_sheet
    row = DatasheetRow.
          joins(:datasheet).
          find_by(datasheets: { project_id: campaign.project.id }, email: object.evaluator.email)
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
