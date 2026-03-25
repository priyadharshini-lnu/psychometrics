# frozen_string_literal: true

module EndUser
  class SystemCheckSessionSerializer < Panko::Serializer
    attributes :id, :user_id, :created_at, :finished_at,
               :in_progress, :completed

    def in_progress
      object.in_progress?
    end

    def completed
      object.completed?
    end
  end
end
