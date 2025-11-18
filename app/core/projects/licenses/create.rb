# frozen_string_literal: true

module Projects
  module Licenses
    class Create < BaseCommand
      def self.call!(attributes, project)
        project.project_licenses.create!(attributes.except(:project_license))
      end
    end
  end
end
