class ReportSerializer < ActiveModel::Serializer
  attributes :id, :name, :disabled, :created_at, :flow

  has_many :pages, serializer: Reports::PageSerializer
end
