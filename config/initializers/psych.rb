# frozen_string_literal: true

# config/initializers/psych.rb
module Psych
  class << self
    alias original_safe_load safe_load

    def safe_load(yaml, permitted_classes: [], **)
      # Allowing pathname to be included in safe load permitted classes to prevent Psych::DisallowedClass errors
      # This is being used in lot of places including loading of locale
      permitted_classes = [*permitted_classes, Pathname]
      original_safe_load(yaml, permitted_classes: permitted_classes, **)
    end
  end
end
