# frozen_string_literal: true

module Api
  module V2
    module Administration
      module Projects
        class LicenseForm < Rectify::Form
          mimic :project_license

          attribute :project_license, Object
          attribute :usage_limit, Integer
          attribute :enabled, Boolean
          attribute :license_id, Integer
          attribute :project, Object

          validates :project, presence: true, unless: :update?
          validates :license_id, presence: true, unless: :update?
          validates :usage_limit, numericality: { only_integer: true, greater_than_or_equal_to: 0, allow_nil: true }

          validate :uniqueness_of_license_per_project, unless: :update?
          validate :cannot_reduce_below_used_number, if: :update?
          validate :used_number_validation, if: :update?
          validate :cannot_allot_more_than_available

          def save
            return false unless valid?

            if update?
              project_license.update(attributes.slice(:usage_limit, :enabled))
              project_license
            else
              ::ProjectLicense.create(attributes.slice(:project, :license_id, :usage_limit, :enabled))
            end
          end

          def update?
            project_license.present?
          end

          private

          def uniqueness_of_license_per_project
            return unless project && license_id

            if ::ProjectLicense.exists?(project: project, license_id: license_id)
              errors.add(:license_id, :already_present)
            end
          end

          def cannot_reduce_below_used_number
            return if usage_limit.blank?

            used_count = project_license.used_number

            if used_count.positive? && usage_limit < used_count
              errors.add(:usage_limit, :cant_be_less_than_used, used_count: used_count)
            end
          end

          def used_number_validation
            return if enabled

            used_count = project_license.used_number

            if used_count.positive?
              errors.add(:enabled, :in_use)
            end
          end

          def cannot_allot_more_than_available
            return if usage_limit.blank?

            parent_license = update? ? project_license.license : ::License.find_by(id: license_id)
            return unless parent_license
            return if parent_license.number.nil?

            if usage_limit > parent_license.number
              errors.add(:usage_limit, :cant_be_more_than_available, usage_limit: parent_license.number)
            end
          end
        end
      end
    end
  end
end
