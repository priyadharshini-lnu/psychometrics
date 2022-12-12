# frozen_string_literal: true

class UserReportCommentSerializer < ActiveModel::Serializer
  attributes :id, :text, :parent_id, :module_id, :created_at, :resolved

  def module_id
    object.reports_module_id
  end

  has_one :creator, serializer: ::ShortUserSerializer
end
