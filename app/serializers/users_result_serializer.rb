class UsersResultSerializer < ActiveModel::Serializer
  attributes :id, :status, :step, :answers, :results, :scoring, :user_id, :assessment_id,
             :data_sheet, :relationship, :norm_id, :embedded_data, :is_self, :as_manager

  attribute :relationship, if: -> { object.assessment.threesixty? }

  has_one :user, serializer: UserSerializer
  has_one :subject, serializer: UserSerializer
  has_one :participant, serializer: Threesixty::EndUser::NomineeSerializer

  def results
    object.answers
  end

  def is_self
    object.evaluator_id == object.subject_id
  end

  def as_manager
    object.evaluator_id != current_user.id
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

  def participant
    @participant ||= instance_options[:participant]
  end

  private

  def campaign
    @campaing ||= instance_options[:campaign]
  end

  def current_user
    if instance_options[:current_user]
      instance_options[:current_user]
    else
      super
    end
  end
end
