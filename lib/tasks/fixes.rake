namespace :fixes do
  desc 'count factors in dimensions'
  task :count_factors => :environment do
    Dimension.all.each do |dimension|
      dimension.update(factors_count: dimension.factors.count)
    end
  end
end