# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class SaveAllForm < Rectify::Form
      attribute :nomination_requirements, [SaveForm]
    end
  end
end
