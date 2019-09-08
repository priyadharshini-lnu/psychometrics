# frozen_string_literal: true

module Callbacks
  module Models
    module Factors
      class DestroyFactorSource
        def after_destroy(record)
          modules = Queries::Reports::Modules::ByPropsSourceFactor.call(record.id)
          modules.each do |modul|
            modul.props['source']['factors'].reject! { |factor| factor['id'] == record.id }
            modul.save
          end
        end
      end
    end
  end
end
