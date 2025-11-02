# frozen_string_literal: true

module Projects
  module Licenses
    class Create < BaseCommand
      def self.call!(form, project)
        project.project_licenses.create!(form.attributes.except(:project_license))
      end
    end
  end
end
