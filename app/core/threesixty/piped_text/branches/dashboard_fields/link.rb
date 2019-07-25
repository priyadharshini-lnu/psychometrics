# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module DashboardFields
        class Link < BaseField
          def call
            url = Threesixty::PipedText::Branches::DashboardFields::Url.call!([], params, context)

            broadcast :ok, "<a href='#{url}'>#{params['d']}</a>"
          end
        end
      end
    end
  end
end
