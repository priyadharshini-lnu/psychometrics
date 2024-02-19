# frozen_string_literal: true

class TextModuleOverrideSerializer < Panko::Serializer
  attributes :id, :content, :module_id, :user_report_id, :updated_at, :approved

  has_one :editor, serializer: UserSerializer
end
