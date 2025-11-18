# frozen_string_literal: true

module Projects
  module Licenses
    class Update < BaseCommand
      def self.call!(attributes, project_license)
        project_license.update!(attributes.except(:project_license, :license_id))
        project_license
      end
    end
  end
end
