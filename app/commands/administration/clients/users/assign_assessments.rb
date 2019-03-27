# frozen_string_literal: true

module Administration
  module Clients
    module Users
      class AssignAssessments < Rectify::Command
        def initialize(form, membership)
          @form = form
          @membership = membership
        end

        def call
          return broadcast(:invalid) if form.invalid?

          transaction do
            form.assessment_ids.each do |assessment_id|
              membership.assigns.find_or_create_by!(assessment_id: assessment_id)
            end
          end

          broadcast(:ok)
        end

        private

        attr_reader :form, :membership

      end
    end
  end
end
