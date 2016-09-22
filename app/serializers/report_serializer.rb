class ReportSerializer < ActiveModel::Serializer
  attributes :id, :name, :disabled, :created_at

  has_many :pages, serializer: Reports::PageSerializer
  has_one :assessment, serializer: AssessmentSerializer
end
