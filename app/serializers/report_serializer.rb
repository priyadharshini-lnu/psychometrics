class ReportSerializer < ActiveModel::Serializer
  attributes :id, :name, :disabled, :created_at

  has_many :pages, serializer: Reports::PageSerializer
  has_one :assessment, serializer: AssessmentSerializer


  has_many :factors, serializer: Factors::WithoutSubFactorsSerializer do
    Factor.where(dimension_id: object.assessment.dimension_id).order(name: :asc)
  end
end
