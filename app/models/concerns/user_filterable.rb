# frozen_string_literal: true

module UserFilterable
  extend ActiveSupport::Concern

  included do
    scope :filterable_fields, lambda { |query|
      if (query !~ /\D/) && query.present?
        joins(:user).where(
          'users.id = ? OR users.first_name ILIKE ? OR users.last_name ILIKE ? OR ' \
          "users.email ILIKE ? OR CONCAT(users.first_name, ' ', users.last_name) ILIKE ?",
          query, "%#{query}%", "%#{query}%", "%#{query}%", "%#{query}%"
        )
      else
        joins(:user).where(
          'users.first_name ILIKE ? OR users.last_name ILIKE ? OR ' \
          "users.email ILIKE ? OR CONCAT(users.first_name, ' ', users.last_name) ILIKE ?",
          "%#{query}%", "%#{query}%", "%#{query}%", "%#{query}%"
        )
      end
    }
  end

  class_methods do
    def ransackable_scopes(_auth_object = nil)
      %i[filterable_fields]
    end
  end
end
