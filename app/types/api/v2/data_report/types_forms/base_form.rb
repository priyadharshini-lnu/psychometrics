# frozen_string_literal: true

module Api::V2::DataReport
  module TypesForms
    class BaseForm < Rectify::Form
      attribute :name

      validates :name, presence: true

      def self.human_attribute_name(attr, _opts)
        attr.to_s
      end
    end
  end
end
