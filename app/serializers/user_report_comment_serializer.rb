# frozen_string_literal: true

class UserReportCommentSerializer < Panko::Serializer
  attributes :id, :text, :parent_id, :module_id, :created_at, :resolved

  has_one :creator, serializer: ::ShortUserSerializer

  def id
    object.id.to_s
  end

  def parent_id
    object.parent_id.to_s
  end

  def module_id
    object.reports_module_id.to_s
  end
end
