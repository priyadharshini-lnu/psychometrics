# frozen_string_literal: true

module Validators
  module Forms
    module Communications
      class SelectedMembers < ActiveModel::Validator
        def validate(record)
          record.errors.add(:user_ids, "can't be blank") if record.model.users.blank?
        end
      end
    end
  end
end
