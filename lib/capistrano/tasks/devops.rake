namespace :devops do

  desc "Prepare pid files directories"
  task :prepare_pid_files_dirs do
    on roles(:all) do
      within shared_path do
        execute :mkdir, "-p", "tmp/pids"
      end
    end
  end


  desc "Flush Cache"
  task :flush_cache do
    on roles(:all) do
      within current_path do
        with rails_env: fetch(:rails_env) do
          execute :rm, "-rf", "tmp/cache/*"
        end
      end
    end
  end

  desc "Restart Passenger"
  task :restart_passenger do
    on roles(:app), in: :sequence, wait: 5 do
      within release_path do
        execute :mkdir, "-p", "tmp"
        execute :touch, "tmp/restart.txt"
      end
    end
  end
end
