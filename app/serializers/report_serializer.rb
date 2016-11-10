class ReportSerializer < ActiveModel::Serializer
  attributes :id, :name, :disabled, :created_at, :filters, :factors, :assigns

  has_many :pages, serializer: Reports::PageSerializer
  has_many :filters, serializer: Reports::FilterSerializer
  has_one :assessment, serializer: AssessmentSerializer

  def factors
    Factor.where(dimension_id: object.assessment.dimension_id).order(name: :asc).map do |obj|
      Factors::WithoutSubFactorsSerializer.new(obj, assessment_id: object.assessment_id)
    end
  end

  def assigns
    if @instance_options[:membership]
      Assign.joins(:membership).where(assessment_id: object.assessment_id, memberships: { client_id: @instance_options[:membership].client_id }).map do |assign|
        AssignShortSerializer.new(assign, membership: @instance_options[:membership])
      end
    else
      []
    end
  end
end
