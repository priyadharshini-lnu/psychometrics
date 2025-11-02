# frozen_string_literal: true

module Projects
  module Licenses
    class Update < BaseCommand
      def self.call!(form, project_license)
        project_license.update!(form.attributes.except(:project_license))
        project_license
      end
    end
  end
end
