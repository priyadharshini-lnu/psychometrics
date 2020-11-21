I18n.translations || (I18n.translations = {});
I18n.translations["ar"] = I18n.extend((I18n.translations["ar"] || {}), {
  "anonym": {
    "continue": "Continue",
    "copy": {
      "archived": "has been archived",
      "expired": "has expired",
      "not_active": "is no longer active"
    },
    "labels": {
      "archived": "Archived",
      "expired": "Expired",
      "not_active": "Not Active"
    },
    "notifications": {
      "restart": {
        "copy": "You had already started this survey. You can choose to Continue or Restart.",
        "title": "Continue?"
      }
    },
    "restart": "Restart"
  },
  "assessments": {
    "actions": {
      "extend_time": "Extend time",
      "goto_dashboard": "الذهاب إلى الصفحة الرئيسية",
      "rescore": "Rescore"
    },
    "audio_response": {
      "permission_denied_message": "يرجى تمكين الميكروفون في متصفحك لتسجيل الإجابة",
      "permission_text": "يرجى السماح باستخدام الميكروفون لتسجيل الصوت"
    },
    "categories": {
      "360": "360 Campaign",
      "agile": "AGILE",
      "case_study": "Case Study",
      "hogan": "Hogan",
      "mindmill": "Mindmill",
      "organisational": "Survey",
      "psychometric": "Assessment"
    },
    "decorator": {
      "no_description": "Description is empty"
    },
    "file_upload": {
      "select_file": "Select file"
    },
    "index": {
      "managers_assessments_button": "Action Planning",
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "messages": {
      "finish": "لقد قمت باستكمال الاستبيان، وتم تسجيل اجاباتك. نشكرك على المشاركة"
    },
    "page": {
      "back": "Back",
      "next": "Next"
    },
    "pickgrouprank": {
      "items": "العبارات"
    },
    "proceed": "Proceed Anyway",
    "resource": {
      "assigned": "Assigned %{date}",
      "invite_users": "Invite Users",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    },
    "unknown_error": "Unknown error occurred.",
    "video_response": {
      "delete": "حذف",
      "device": "السماح",
      "discard": "تجاهل",
      "file_upload": {
        "select_file": "اختر الملف"
      },
      "media_recorder": {
        "failure": "هذا المستعرض لا يدعم خاصية \"تسجيل الفيديو\". الرجاء استخدام Chrome أو Firefox لتسجيل الفيديو.",
        "success": "يرجى السماح باستخدام الكاميرا والميكروفون لتسجيل الصوت والفيديو"
      },
      "offline_message": "Please check your internet connection.",
      "retake": "أعد مرة أخرى",
      "retry": "أعد المحاولة",
      "save": "حفظ",
      "saved": "تم الحفظ",
      "saving": "يتم الحفظ...",
      "selected": "تم الاختيار",
      "start_recording": "ابدأ التسجيل",
      "status": {
        "recording": "Recording"
      },
      "tracker": {
        "backward": "أنت قريب جدًا من الشاشة. يرجى التحرك قليلاً الى الوراء.",
        "forward": "اضغط على زر التسجيل عندما تكون جاهزًا",
        "frame": "يرجى التأكد من أن وجهك في وضع مناسب مع الإطار",
        "ready": "اضغط على زر التسجيل عندما تكون جاهزًا"
      },
      "use_this": "استخدم ذلك"
    },
    "wait": "Wait"
  },
  "campaign": {
    "begin": "Begin Assessment",
    "campaign_closed_assessment_take_message": "Can't take assessment as this campaign is closed.",
    "closed_campaign_message": "This campaign is closed. You can't take any assessment within this campaign.",
    "complete_all": "Complete all related assessments",
    "complete_prev": "Complete all prev assessments",
    "completed": "Completed",
    "continue": "Continue Assessment",
    "in_progress": "In Progress",
    "instructions": {
      "heading": "Instructions to follow"
    },
    "interrupted": "Interrupted",
    "language": {
      "cancel": "Cancel",
      "content": "This assessment is not available in the language that you have selected. Please pick the language in which you want to give the assessment",
      "proceed": "Proceed",
      "single_lang": "This assessment is only available in %{lang}, which is different than you selected language.",
      "title": "Select language"
    },
    "new": "New",
    "not_started": "New",
    "time_left": {
      "cancel": "Cancel",
      "continue": "Continue",
      "notification": "Your allocated time for this task \"%{assessmentName}\" was %{x} minutes. Due to the overall elapsed time, you now have only %{y} minutes as your adjusted time to complete this task.",
      "title": "Time left warning"
    },
    "timer": {
      "message": "Time left to complete all activities",
      "notification": "You have %{minutes} minutes and %{seconds} seconds to complete"
    },
    "ungrouped": "Ungrouped assessments",
    "welcome": "Welcome"
  },
  "checking_wizard": {
    "audio_check": {
      "access": "Access",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use microphone to record audio",
      "continue": "Continue",
      "processing": "Processing",
      "record_title": "Please speak and repeat the following sentence 3 times.",
      "run_again": "Run again",
      "speech_detection": "Speech detection",
      "test_message": "arabic",
      "title": "We need to ensure your system can record audio."
    },
    "network_check": {
      "continue": "Continue",
      "download": "Download",
      "levels": {
        "0": "Network broken (reconnecting)",
        "1": "Very bad network",
        "2": "Bad network",
        "3": "Average network",
        "4": "Good network",
        "5": "Very good network"
      },
      "network": "Network",
      "please_check_connection": "Please check your Internet Connection",
      "processing": "Processing",
      "run_again": "Run again",
      "run_again_title": "And run this test again",
      "start": "Start",
      "title": "Click start to begin internet speed test.",
      "upload": "Upload"
    },
    "steps": {
      "audio_check": "Microphone Test",
      "network_check": "Internet Speed Test",
      "system_check": "System Check",
      "video_check": "Video Camera Test"
    },
    "success": {
      "start": "Start assessment",
      "title": "You have successfully completed all checks."
    },
    "system_check": {
      "continue": "Continue",
      "start": "Start",
      "title": "Before starting this assessment, your system needs to undergo some checks."
    },
    "video_check": {
      "access": "Access",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use camera to record Video",
      "ambient_light": "Ambient Light",
      "continue": "Continue",
      "face_detection": "Face detection",
      "processing": "Processing",
      "run_again": "Run again",
      "title": "We need to ensure your system can record the video"
    }
  },
  "languages": {
    "ar": "Arabic",
    "bg": "Bulgarian",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cn": "Chinese",
    "cs": "Czech",
    "cy": "Cymraeg",
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en": "English",
    "en-GB": "English - UK",
    "eo": "Esperanto",
    "es": "Spanish (Latin America)",
    "es-ES": "Spanish (Spain)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Bahasa Indonesia",
    "it": "Italian",
    "ja": "Japanese",
    "km": "Khmer",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "mn": "Mongolian",
    "ms": "Bahasa Malaysia",
    "my": "Myanmar",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt-BR": "Brazilian Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr-Cyrl": "Serbian Cyrillic",
    "sr-Latn": "Serbian Latin",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tl": "Tagalog",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh": "Chinese Simplified",
    "zh-TW": "Chinese Traditional"
  },
  "reports": {
    "actions": {
      "add": "Add Report",
      "download": "Download report",
      "view": "View Report"
    },
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Indicator",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Competency"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Indicator",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Competency",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "الأسئلة"
      },
      "single_value_cluster": {
        "competency": "كفاءة",
        "description": "وصف",
        "developmental_rating": "التصنيف التطويري",
        "questions": "الأسئلة"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "number_by_filter_evaluations_received": "عدد تقييم (%{filter}) المدير المباشر",
        "number_of_evaluators_invited": "مدعو التقييم",
        "number_of_evaluators_received": "تم تلقي التقييمات",
        "number_of_evaluators_responded": "Number of evaluators responded",
        "subject": "Subject",
        "title": "ملخص تقرير",
        "total_evaluations": "Total evaluations for this assessment"
      },
      "video_response": {
        "no_results": "No videos recorded"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold",
      "released": "Released"
    }
  },
  "shared": {
    "filters": {
      "clear": "Clear Filters"
    },
    "internet_disconnected_message": "Trying to reconnect. Please check your internet connection.",
    "password_reset": {
      "description": "Please enter your email address in the box below and click 'Reset Password'.",
      "email_label": "Email Address",
      "instruction": "Enter the email associated with your account",
      "submit": "Reset Password",
      "title": "Forgot Password?"
    },
    "terms_conditions_privacy": "Privacy Statement",
    "tte_terms_and_condition": "TTE - Terms, Conditions and Privacy Statement"
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "declined": "Declined",
      "denied": "Denied",
      "done": "Done",
      "not_completed": "Not Completed",
      "waiting": "Waiting"
    }
  },
  "threesixty": {
    "accept_privacy_modal": {
      "accept": "Accept",
      "reject": "Reject",
      "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
      "title": "Data processing consent"
    },
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_all_successful": "Approved all nominations",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "approving_mail_sent": "Mail for approving nomination has been sent to managers",
    "as_my": "as my",
    "assessment": "Assessment",
    "back_to_tasks": "Back to tasks",
    "begin": "Begin",
    "cancel": "Cancel",
    "close_evaluation_modal": {
      "message": "Once you view the report, %{pronoun_or_name} won't be able to receive any further evaluations",
      "title": "Are you sure you want to view the report?"
    },
    "closed_campaign_message": "This 360 campaign is closed. You can't nominate or evaluate anyone for this campaign.",
    "completed": "Completed",
    "confirm": "Are you sure?",
    "confirmation_for_nomination_removal": "Are you sure you want to remove the nomination",
    "confirmation_required": "Confirmation required",
    "confirmation_text_incorrect": "Confirmation text is incorrect",
    "confirmation_text_placeholder": "Confirmation text here",
    "continue": "Continue",
    "dashboard_title": "Welcome %{name}",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "deny_all_successful": "Denied all nominations",
    "download_pdf": "Download PDF",
    "download_report": "Download Report",
    "download_reports": "Download Reports",
    "edit_user": "Edit User",
    "email_approve_request": "Email Approval Request",
    "email_schedules": {
      "delete_successful": "Email schedule deleted successfully"
    },
    "evaluate": "Evaluate",
    "evaluation": "Evaluation",
    "evaluation_closed_nomination_message": "You can't nominate for this subject as evaluation is closed for this subject",
    "evaluations": "Evaluations",
    "evaluator": "Evaluator",
    "export_pdf": "Export PDF",
    "first_name": "First Name",
    "first_name_error": "Please input First Name",
    "help": "Help",
    "helps": {
      "evaluation": "<h2>Evaluations</h2> <p>There can be two different sections under Evaluations.</p> <h3>EVALUATIONS</h3> <p>Click on the person’s name to complete an evaluation of them.</p> <p>If you leave the page before you finish, you will be prompted to save.</p> <h3>APPROVE EVALUATIONS</h3> <p>This section only appears if you’re a Manager and have been given permission to approve your direct reports’ evaluations. An evaluation will not be added to the data in your direct report’s report until you approve.</p>\n<ol> <li><p>Navigate between your direct reports.</p></li> <li><p>Navigate between your direct reports’ evaluators.</p></li> <li><p>Change the status of the evaluation to <b>Approved</b>  or <b>Denied</b>.</p></li> </ol> <p>You can also download a PDF of the evaluation you’re reviewing.</p>",
      "main": "<h2>Help</h2> <p>need content for help modal</p>",
      "nomination": "<h2>Nominations</h2> <p>You either need to nominate people to evaluate you, nominate people to evaluate your direct reports, or approve your direct reports’ nominations.</p> <h3>SET UP NOMINATIONS</h3> <p>Sometimes, you will be asked to nominate coworkers you want to evaluate you.</p><ol> <li><p>To nominate an evaluator, type their name or email to find them. Then define their relationship to you. Click <b>Nominate Evaluator</b>  when finished.</p></li> <li><p>If your Manager is responsible for approving your nominations, remind them by clicking  <b>Email Approval Request</b> This option will not appear for everyone.</p></li> <li><p>Review the Approval and Evaluation status of your nominations.</p></li> <li><p>Remove a nomination by clicking the dropdown arrow and selecting <b>Remove</b>. This will not delete the data, but it will remove it from your report, and your evaluator won’t be able to retake this assessment.</p></li> </ol> <p>If you are a Manager, you may also be asked to nominate evaluators for your direct reports. In that case, the process will look the same.</p> <h3>APPROVE NOMINATIONS</h3> <p>If you are a Manager, you may be asked to approve the people your direct reports nominated to evaluate them. These evaluators will not be able to evaluate your direct report until you approve. Any email notifications set up will also not go out until the manager has approved a nomination.</p> <p>Approval technically takes place on the same screen where you’d set up your direct reports’ nominations, if you had that task.</p>​ <ol> <li><p>Click <b>Approve All</b>  to approve all nominations on the page.</p></li> <li><p>Click <b>Deny All</b>  to deny all nominations on the page.</p></li> <li><p>Click the dropdown next to a particular nomination to approve or deny just that nomination. <b>Waiting</b> means you haven’t made a decision yet.</p></li> </ol>",
      "report": "<h2>Report</h2> <p>There can be two different sections under Report.</p> <h3>VIEW REPORT</h3> <p>Here, you can view any reports you have access to. For most people, this is just their own.</p> <ol> <li><p>Change whose report you’re viewing.</p></li> <li><p>Determine if you are viewing the report as a subject or Manager.</p></li> <li><p>Click the arrow to download your report. If you click the dropdown menu, you can also select <b>Download All Reports</b>  to download all the reports you have access to. All downloads are in PDF format.</p></li> <li><p>Click the email icon to send a copy of the report to the email associated with your login.</p></li> </ol> <h3>APPROVE REPORTS</h3> <p>If you are a Manager, you may be asked to approve reports. Your direct report will not see their report until you approve it.</p> <p>On this page, you can switch between subject and Manager views, download, and email these reports just as your would your own, with a few differences.</p> <ol> <li><p>Navigate between direct reports.</p></li> <li><p><b>Deny</b>  the report release.</p></li> <li><p>Approve the report for release.</p></li> </ol>"
    },
    "language": "Language",
    "last_name": "Last Name",
    "last_name_error": "Please input Last Name",
    "load_results": "Load Results",
    "mail_history": {
      "statuses": {
        "success": "Success",
        "undelivered": "Undelivered"
      }
    },
    "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "options": {
      "global": {
        "cannot_re_edit": "Participants cannot edit evaluations"
      }
    },
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "participant_list": {
      "actions": {
        "approve_report": "Approve Report",
        "download_report": "Download Report",
        "edit": "Edit",
        "hold_report": "Hold report",
        "login": "Login",
        "mark_as_done": "Mark as done",
        "release_report": "Release report",
        "remove_campaign": "Remove from campaign",
        "remove_report_approval": "Remove report approval",
        "remove_report_hold_release_report": "Remove Report Hold/Release",
        "remove_subject": "Remove subject",
        "unmark_as_done": "Unmark as done",
        "view_report": "View Report",
        "view_responses": "View Responses"
      },
      "confirmation_messages": {
        "approve_report": "Are you sure you want to approve report?",
        "hold_report": "Are you sure you want to hold report?",
        "mark_evaluation_done": "Are you sure you want to mark evaluation as done? Evaluation will be closed for this subject.",
        "release_report": "Are you sure you want to release report?",
        "remove_from_campaign": "Are you sure you want to remove user from the campaign?",
        "remove_release_hold": "Are you sure you want to remove Release/Hold status?",
        "remove_report_approval": "Are you sure you want to remove report approval?",
        "remove_subject": "Are you sure you want to remove subject with email from campaign?",
        "umark_evaluation_as_complete": "Are you sure you want to unmark evaluation as done?"
      },
      "report_generation_message": "Report is generating. We will let you know when the report is ready."
    },
    "processing": "Processing",
    "processing_report": "Processing Report",
    "question": {
      "chat_type": {
        "input_placeholder": "اكتب رسالتك..."
      },
      "email_type": {
        "bcc": "نسخة مخفية الوجهة",
        "cc": "نسخة إلى",
        "edit": "تعديل",
        "max_length_warning": "%{x} characters remaining",
        "message": "رسالتك",
        "send": "إرسال",
        "subject": "الموضوع",
        "successful_message": "لقد قمت بإرسال البريد الإلكتروني بنجاح",
        "to": "إلى"
      }
    },
    "remind_all": "Remind All",
    "remind_mail_sent": "Reminders sent to evaluators who haven't completed the evaluation",
    "report_for": "Report for",
    "report_generation_in_progress": "Report is generating. We will let you know when the report is ready.",
    "reports": "Reports",
    "reset_campaign_confirmation": "Enter current campaign name given below in text box to reset all participants",
    "reset_nomination_confirmation": "Enter current campaign name given below in text box to reset all nominations",
    "save": "Save",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "self": "Self",
    "set_name_for_evaluator": "Set name for Evaluator",
    "setup_nominations": "Set up nominations",
    "subject": "Subject",
    "submit": "Submit",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "validation_errors": "Validation Errors",
    "view_my_report": "View My Report",
    "view_nominations": "View nominations",
    "view_reports": "View Reports",
    "waiting": "Waiting",
    "you": "You",
    "yourself": "Yourself"
  },
  "user_reports": {
    "actions": {
      "regenerate": "Regenerate"
    },
    "messages": {
      "regenerate_successful": "Report regeneration job scheduled successfully"
    },
    "modals": {
      "remove": {
        "content": "Are you sure you want to remove report %{userReportName}?",
        "successfully": "%{userReportName} report removed successfully"
      }
    },
    "preview_report": "Preview Report",
    "statuses": {
      "generating": "Generating",
      "not_prepared": "Not Available",
      "prepared": "Available"
    }
  },
  "validations": {
    "AudioResponse": {
      "in_progress": {
        "RECORDED": "تم تسجيل الصوت ولكن لم يتم حفظه",
        "RECORDING": "يتم التسجيل الصوتي",
        "SAVING": "يتم تحميل التسجيل الصوتي"
      },
      "required": "يرجى تسجيل الصوت وحفظه قبل المتابعة"
    },
    "FileUpload": {
      "in_progress": {
        "SAVING": "يتم تحميل الملف"
      },
      "required": "الرجاء رفع الملف"
    },
    "TextEntry": {
      "Email": {
        "character_range": "يجب أن تتكون رسالة البريد الإلكتروني التي تم إدخالها من %{min} حرف على الأقل وألا تزيد عن %{max} حرف.",
        "max_length": "يجب ألا يزيد عدد أحرف رسالة البريد الإلكتروني التي تم إدخالها عن {max}% حرف.",
        "min_length": "يجب أن تتكون رسالة البريد الإلكتروني التي تم إدخالها من %{min} حرف على الأقل.",
        "subject": {
          "min_length": "يجب أن تحتوي خانة \"الموضوع\" على 10 أحرف على الأقل."
        },
        "to": {
          "required": "يجب تعبئة الخانة \"إلى\""
        }
      }
    },
    "VideoResponse": {
      "in_progress": {
        "recorded": "تم تسجيل الفيديو ولكن لم يتم حفظه",
        "recording": "يتم تسجيل الفيديو",
        "saving": "يتم تحميل الفيديو المسجل"
      },
      "required": "يرجى تسجيل الفيديو وحفظه قبل المتابعة"
    },
    "actions_still_in_progress": "Below actions are in progress. If you proceed you will lose these data.",
    "blank": "can't be blank",
    "character_range": "يجب أن تتكون إجابتك من  %{min} حرفاً كحد أدنى وألا تزيد عن %{max} حرفًا كحد أقصى.",
    "date": "(mm/dd/yyyy) يجب أن يتم إدخال تاريخ صحيح",
    "each_group_contains": "يجب أن تحتوي كل مجموعة على  %{min} عنصر كحد أدنى ولا تزيد عن %{max} كحد أقصى",
    "email": "البريد الإلكتروني غير صحيح",
    "file_upload": {
      "EntityTooLarge": "يجب أن يكون حجم الملف أقل من %{maxFileSize} ميجابايت",
      "WrongFileType": "يجب أن يكون نوع الملف واحدًا من الأنواع التالية %{allowedFileTypes}"
    },
    "issue": " الخطأ",
    "least": "الرجاء اختيار %{min} خيارات كحد أدنى.",
    "least_hotspot": "الرجاء اختيار %{min} خيارات كحد أدنى.",
    "max_length": " يجب ألا تتجاوز إجابتك %{max} حرفًا.",
    "min_length": "يجب أن تتكون إجابتك من  %{min} حرفًا كحد أدنى. ",
    "must_rank_between": " يرجى وضع قيمة من %{min} إلى %{max} لكل عنصر. لا يجب أن تتكرر القيم.",
    "must_select": "الرجاء اختيار من  %{min} إلى %{max} من الاختيارات",
    "number": "يجب أن تحتوي الإجابة على أرقام",
    "range": "الرجاء الإجابة عن  %{min} كحد أدنى و  %{max} كحد أقصى من الخيارات. ",
    "required": "الرجاء الإجابة على هذا السؤال",
    "text": "يجب ألا تحتوي إجابتك على أرقام",
    "title": {
      "one": "هناك خطأ واحد ، يرجى التحقق من ردودك",
      "other": "هناك %{count} أخطاء ، يرجى التحقق من إجاباتك",
      "two": "يوجد خطأان ، يرجى التحقق من إجاباتك"
    }
  }
});
I18n.translations["en"] = I18n.extend((I18n.translations["en"] || {}), {
  "anonym": {
    "continue": "Continue",
    "copy": {
      "archived": "has been archived",
      "expired": "has expired",
      "not_active": "is no longer active"
    },
    "labels": {
      "archived": "Archived",
      "expired": "Expired",
      "not_active": "Not Active"
    },
    "notifications": {
      "restart": {
        "copy": "You had already started this survey. You can choose to Continue or Restart.",
        "title": "Continue?"
      }
    },
    "restart": "Restart"
  },
  "assessments": {
    "actions": {
      "extend_time": "Extend time",
      "goto_dashboard": "Go To Dashboard",
      "rescore": "Rescore"
    },
    "audio_response": {
      "permission_denied_message": "Please enable microphone permission in your browser to record the answer",
      "permission_text": "Please allow to use microphone to record audio"
    },
    "categories": {
      "360": "360 Campaign",
      "agile": "AGILE",
      "case_study": "Case Study",
      "hogan": "Hogan",
      "mindmill": "Mindmill",
      "organisational": "Survey",
      "psychometric": "Assessment"
    },
    "decorator": {
      "no_description": "Description is empty"
    },
    "file_upload": {
      "select_file": "Select file"
    },
    "index": {
      "managers_assessments_button": "Action Planning",
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "messages": {
      "finish": "Thank you for your time. \nYour responses have now been recorded."
    },
    "page": {
      "back": "Back",
      "next": "Next"
    },
    "pickgrouprank": {
      "items": "Items"
    },
    "proceed": "Proceed Anyway",
    "resource": {
      "assigned": "Assigned %{date}",
      "invite_users": "Invite Users",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    },
    "unknown_error": "Unknown error occurred.",
    "video_response": {
      "delete": "Delete",
      "device": "Allow",
      "discard": "Discard",
      "media_recorder": {
        "failure": "This browser doesn't support Video Recording. Please use Chrome or Firefox for Video Recording",
        "success": "Please allow to use camera and microphone to record audio and Video"
      },
      "offline_message": "Please check your internet connection.",
      "retake": "Retake",
      "retry": "Retry",
      "save": "Save",
      "saved": {
        "label": "Saved",
        "tooltip": "This video has been marked for submission. Alternatively you can choose another take."
      },
      "saving": "Saving...",
      "selected": "Selected",
      "start_recording": "Start recording",
      "status": {
        "recording": "Recording"
      },
      "tracker": {
        "backward": "You are too close to the screen. Please move a bit back",
        "forward": "You are too far away from the screen. Please move a bit closer",
        "frame": "Please make sure that your face aligns with the frame",
        "ready": "Press the Record button when ready to record"
      },
      "use_this": "Submit this take"
    },
    "wait": "Wait"
  },
  "campaign": {
    "begin": "Begin Assessment",
    "campaign_closed_assessment_take_message": "Can't take assessment as this campaign is closed.",
    "closed_campaign_message": "This campaign is closed. You can't take any assessment within this campaign.",
    "complete_all": "Complete all related assessments",
    "complete_prev": "Complete all prev assessments",
    "completed": "Completed",
    "continue": "Continue Assessment",
    "in_progress": "In Progress",
    "instructions": {
      "heading": "Instructions to follow"
    },
    "interrupted": "Interrupted",
    "language": {
      "cancel": "Cancel",
      "content": "This assessment is not available in the language that you have selected. Please pick the language in which you want to give the assessment",
      "proceed": "Proceed",
      "single_lang": "This assessment is only available in %{lang}, which is different than you selected language.",
      "title": "Select language"
    },
    "new": "New",
    "not_started": "New",
    "time_left": {
      "cancel": "Cancel",
      "continue": "Continue",
      "notification": "Your allocated time for this task \"%{assessmentName}\" was %{x} minutes. Due to the overall elapsed time, you now have only %{y} minutes as your adjusted time to complete this task.",
      "title": "Time left warning"
    },
    "timer": {
      "message": "Time left to complete all activities",
      "notification": "You have %{minutes} minutes and %{seconds} seconds to complete"
    },
    "ungrouped": "Ungrouped assessments",
    "welcome": "Welcome"
  },
  "checking_wizard": {
    "audio_check": {
      "access": "Access",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use microphone to record audio",
      "continue": "Continue",
      "processing": "Processing",
      "record_title": "Please speak and repeat the following sentence 3 times.",
      "run_again": "Run again",
      "speech_detection": "Speech detection",
      "test_message": "great to speak with you",
      "title": "We need to ensure your system can record audio."
    },
    "network_check": {
      "continue": "Continue",
      "download": "Download",
      "levels": {
        "0": "Network broken (reconnecting)",
        "1": "Very bad network",
        "2": "Bad network",
        "3": "Average network",
        "4": "Good network",
        "5": "Very good network"
      },
      "network": "Network",
      "please_check_connection": "Please check your Internet Connection",
      "processing": "Processing",
      "run_again": "Run again",
      "run_again_title": "And run this test again",
      "start": "Start",
      "title": "Click start to begin internet speed test.",
      "upload": "Upload"
    },
    "steps": {
      "audio_check": "Microphone Test",
      "network_check": "Internet Speed Test",
      "system_check": "System Check",
      "video_check": "Video Camera Test"
    },
    "success": {
      "start": "Start assessment",
      "title": "You have successfully completed all checks."
    },
    "system_check": {
      "continue": "Continue",
      "start": "Start",
      "title": "Before starting this assessment, your system needs to undergo some checks."
    },
    "video_check": {
      "access": "Access",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use camera to record Video",
      "ambient_light": "Ambient Light",
      "continue": "Continue",
      "face_detection": "Face detection",
      "processing": "Processing",
      "run_again": "Run again",
      "title": "We need to ensure your system can record the video"
    }
  },
  "languages": {
    "ar": "Arabic",
    "bg": "Bulgarian",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cn": "Chinese",
    "cs": "Czech",
    "cy": "Cymraeg",
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en": "English",
    "en-GB": "English - UK",
    "eo": "Esperanto",
    "es": "Spanish (Latin America)",
    "es-ES": "Spanish (Spain)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Bahasa Indonesia",
    "it": "Italian",
    "ja": "Japanese",
    "km": "Khmer",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "mn": "Mongolian",
    "ms": "Bahasa Malaysia",
    "my": "Myanmar",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt-BR": "Brazilian Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr-Cyrl": "Serbian Cyrillic",
    "sr-Latn": "Serbian Latin",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tl": "Tagalog",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh": "Chinese Simplified",
    "zh-TW": "Chinese Traditional"
  },
  "reports": {
    "actions": {
      "add": "Add Report",
      "download": "Download report",
      "view": "View Report"
    },
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Indicator",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Competency"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Indicator",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Competency",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "Questions"
      },
      "single_value_cluster": {
        "competency": "Competency",
        "description": "Description",
        "developmental_rating": "Developmental Rating",
        "questions": "Questions"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "number_by_filter_evaluations_received": "Number of %{filter} evaluations received",
        "number_of_evaluators_invited": "Number of evaluators invited",
        "number_of_evaluators_received": "Number of evaluations received",
        "number_of_evaluators_responded": "Number of evaluators responded",
        "subject": "Subject",
        "title": "Report Summary",
        "total_evaluations": "Total evaluations for this assessment"
      },
      "video_response": {
        "no_results": "No videos recorded"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold",
      "released": "Released"
    }
  },
  "shared": {
    "filters": {
      "clear": "Clear Filters"
    },
    "internet_disconnected_message": "Trying to reconnect. Please check your internet connection.",
    "password_reset": {
      "description": "Please enter your email address in the box below and click 'Reset Password'.",
      "email_label": "Email Address",
      "instruction": "Enter the email associated with your account",
      "submit": "Reset Password",
      "title": "Forgot Password?"
    },
    "terms_conditions_privacy": "Privacy Statement",
    "tte_terms_and_condition": "TTE - Terms, Conditions and Privacy Statement"
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "declined": "Declined",
      "denied": "Denied",
      "done": "Done",
      "not_completed": "Not Completed",
      "waiting": "Waiting"
    }
  },
  "threesixty": {
    "accept_privacy_modal": {
      "accept": "Accept",
      "reject": "Reject",
      "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
      "title": "Data processing consent"
    },
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_all_successful": "Approved all nominations",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "approving_mail_sent": "Mail for approving nomination has been sent to managers",
    "as_my": "as my",
    "assessment": "Assessment",
    "back_to_tasks": "Back to tasks",
    "begin": "Begin",
    "cancel": "Cancel",
    "close_evaluation_modal": {
      "message": "Once you view the report, %{pronoun_or_name} won't be able to receive any further evaluations",
      "title": "Are you sure you want to view the report?"
    },
    "closed_campaign_message": "This 360 campaign is closed. You can't nominate or evaluate anyone for this campaign.",
    "completed": "Completed",
    "confirm": "Are you sure?",
    "confirmation_for_nomination_removal": "Are you sure you want to remove the nomination",
    "confirmation_required": "Confirmation required",
    "confirmation_text_incorrect": "Confirmation text is incorrect",
    "confirmation_text_placeholder": "Confirmation text here",
    "continue": "Continue",
    "dashboard_title": "Welcome %{name}",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "deny_all_successful": "Denied all nominations",
    "download_pdf": "Download PDF",
    "download_report": "Download Report",
    "download_reports": "Download Reports",
    "edit_user": "Edit User",
    "email_approve_request": "Email Approval Request",
    "email_schedules": {
      "delete_successful": "Email schedule deleted successfully"
    },
    "evaluate": "Evaluate",
    "evaluation": "Evaluation",
    "evaluation_closed_nomination_message": "You can't nominate for this subject as evaluation is closed for this subject",
    "evaluations": "Evaluations",
    "evaluator": "Evaluator",
    "export_pdf": "Export PDF",
    "first_name": "First Name",
    "first_name_error": "Please input First Name",
    "help": "Help",
    "helps": {
      "main": "<h2>Help</h2> <p>need content for help modal</p>"
    },
    "language": "Language",
    "last_name": "Last Name",
    "last_name_error": "Please input Last Name",
    "load_results": "Load Results",
    "mail_history": {
      "statuses": {
        "success": "Success",
        "undelivered": "Undelivered"
      }
    },
    "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "options": {
      "global": {
        "cannot_re_edit": "Participants cannot edit evaluations"
      }
    },
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "participant_list": {
      "actions": {
        "approve_report": "Approve Report",
        "download_report": "Download Report",
        "edit": "Edit",
        "hold_report": "Hold report",
        "login": "Login",
        "mark_as_done": "Mark as done",
        "release_report": "Release report",
        "remove_campaign": "Remove from campaign",
        "remove_report_approval": "Remove report approval",
        "remove_report_hold_release_report": "Remove Report Hold/Release",
        "remove_subject": "Remove subject",
        "unmark_as_done": "Unmark as done",
        "view_report": "View Report",
        "view_responses": "View Responses"
      },
      "confirmation_messages": {
        "approve_report": "Are you sure you want to approve report?",
        "hold_report": "Are you sure you want to hold report?",
        "mark_evaluation_done": "Are you sure you want to mark evaluation as done? Evaluation will be closed for this subject.",
        "release_report": "Are you sure you want to release report?",
        "remove_from_campaign": "Are you sure you want to remove user from the campaign?",
        "remove_release_hold": "Are you sure you want to remove Release/Hold status?",
        "remove_report_approval": "Are you sure you want to remove report approval?",
        "remove_subject": "Are you sure you want to remove subject with email from campaign?",
        "umark_evaluation_as_complete": "Are you sure you want to unmark evaluation as done?"
      },
      "report_generation_message": "Report is generating. We will let you know when the report is ready."
    },
    "processing": "Processing",
    "processing_report": "Processing Report",
    "question": {
      "chat_type": {
        "input_placeholder": "Write your Message..."
      },
      "email_type": {
        "bcc": "Bcc",
        "cc": "Cc",
        "edit": "Edit",
        "max_length_warning": "%{x} characters remaining",
        "message": "Your Message",
        "send": "Send",
        "subject": "Subject",
        "successful_message": "You have successfully sent the email",
        "to": "To"
      }
    },
    "remind_all": "Remind All",
    "remind_mail_sent": "Reminders sent to evaluators who haven't completed the evaluation",
    "report_for": "Report for",
    "report_generation_in_progress": "Report is generating. We will let you know when the report is ready.",
    "reports": "Reports",
    "reset_campaign_confirmation": "Enter current campaign name given below in text box to reset all participants",
    "reset_nomination_confirmation": "Enter current campaign name given below in text box to reset all nominations",
    "save": "Save",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "self": "Self",
    "set_name_for_evaluator": "Set name for Evaluator",
    "setup_nominations": "Set up nominations",
    "subject": "Subject",
    "submit": "Submit",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "validation_errors": "Validation Errors",
    "view_my_report": "View My Report",
    "view_nominations": "View nominations",
    "view_reports": "View Reports",
    "waiting": "Waiting",
    "you": "You",
    "yourself": "Yourself"
  },
  "user_reports": {
    "actions": {
      "regenerate": "Regenerate"
    },
    "messages": {
      "regenerate_successful": "Report regeneration job scheduled successfully"
    },
    "modals": {
      "remove": {
        "content": "Are you sure you want to remove report %{userReportName}?",
        "successfully": "%{userReportName} report removed successfully"
      }
    },
    "preview_report": "Preview Report",
    "statuses": {
      "generating": "Generating",
      "not_prepared": "Not Available",
      "prepared": "Available"
    }
  },
  "validations": {
    "AudioResponse": {
      "in_progress": {
        "RECORDED": "Audio is recorded but not saved",
        "RECORDING": "Audio recording is in progress",
        "SAVING": "Recorded audio upload is in progress"
      },
      "required": "Please record and save the audio before you continue"
    },
    "FileUpload": {
      "in_progress": {
        "SAVING": "File upload is in progress"
      },
      "required": "Please upload the file"
    },
    "TextEntry": {
      "Email": {
        "character_range": "Email message entered must be at least %{min} and no more than %{max} characters.",
        "max_length": "Email message entered must be no more than %{max} characters.",
        "min_length": "Email message entered must be at least %{min} characters.",
        "subject": {
          "min_length": "Subject field should have minimum of 10 characters"
        },
        "to": {
          "required": "To field is required"
        }
      }
    },
    "VideoResponse": {
      "in_progress": {
        "recorded": "Video is recorded but not saved",
        "recording": "Video recording is in progress",
        "saving": "Recorded video upload is in progress"
      },
      "required": "Please record and save the video before you continue"
    },
    "actions_still_in_progress": "Below actions are in progress. If you proceed you will lose these data.",
    "blank": "can't be blank",
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (mm/dd/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "file_upload": {
      "EntityTooLarge": "File size should be less than %{maxFileSize} MB",
      "WrongFileType": "File type should be one of the following %{allowedFileTypes}"
    },
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "required": "Please answer this question",
    "text": "Your response must not contain a numbers",
    "title": {
      "one": "There is one error, please check your responses",
      "other": "There are %{count} errors, please check your responses"
    }
  }
});
I18n.translations["ms"] = I18n.extend((I18n.translations["ms"] || {}), {
  "anonym": {
    "continue": "Continue",
    "copy": {
      "archived": "has been archived",
      "expired": "has expired",
      "not_active": "is no longer active"
    },
    "labels": {
      "archived": "Archived",
      "expired": "Expired",
      "not_active": "Not Active"
    },
    "notifications": {
      "restart": {
        "copy": "You had already started this survey. You can choose to Continue or Restart.",
        "title": "Continue?"
      }
    },
    "restart": "Restart"
  },
  "assessments": {
    "actions": {
      "extend_time": "Extend time",
      "goto_dashboard": "Go To Dashboard",
      "rescore": "Rescore"
    },
    "audio_response": {
      "permission_denied_message": "Please enable microphone permission in your browser to record the answer",
      "permission_text": "Please allow to use microphone to record audio"
    },
    "categories": {
      "360": "360 Campaign",
      "agile": "AGILE",
      "case_study": "Case Study",
      "hogan": "Hogan",
      "mindmill": "Mindmill",
      "organisational": "Survey",
      "psychometric": "Assessment"
    },
    "decorator": {
      "no_description": "Description is empty"
    },
    "file_upload": {
      "select_file": "Select file"
    },
    "index": {
      "managers_assessments_button": "Action Planning",
      "managers_dashboard_button": "Managers Dashboard",
      "user_dashboard_button": "User Dashboard"
    },
    "messages": {
      "finish": "Thank you for your time. \nYour responses have now been recorded."
    },
    "page": {
      "back": "Back",
      "next": "Next"
    },
    "pickgrouprank": {
      "items": "Items"
    },
    "proceed": "Proceed Anyway",
    "resource": {
      "assigned": "Assigned %{date}",
      "invite_users": "Invite Users",
      "questions": {
        "one": "1 Question",
        "other": "%{count} Questions",
        "zero": "No Questions"
      },
      "results": "Results",
      "status": {
        "completed": "Completed",
        "in_progress": "Resume",
        "not_started": "Start"
      }
    },
    "unknown_error": "Unknown error occurred.",
    "video_response": {
      "delete": "Delete",
      "device": "Allow",
      "discard": "Discard",
      "media_recorder": {
        "failure": "This browser doesn't support Video Recording. Please use Chrome or Firefox for Video Recording",
        "success": "Please allow to use camera and microphone to record audio and Video"
      },
      "offline_message": "Please check your internet connection.",
      "retake": "Retake",
      "retry": "Retry",
      "save": "Save",
      "saved": {
        "label": "Saved",
        "tooltip": "This video has been marked for submission. Alternatively you can choose another take."
      },
      "saving": "Saving...",
      "selected": "Selected",
      "start_recording": "Start recording",
      "status": {
        "recording": "Recording"
      },
      "tracker": {
        "backward": "You are too close to the screen. Please move a bit back",
        "forward": "You are too far away from the screen. Please move a bit closer",
        "frame": "Please make sure that your face aligns with the frame",
        "ready": "Press the Record button when ready to record"
      },
      "use_this": "Submit this take"
    },
    "wait": "Wait"
  },
  "campaign": {
    "begin": "Begin Assessment",
    "campaign_closed_assessment_take_message": "Can't take assessment as this campaign is closed.",
    "closed_campaign_message": "This campaign is closed. You can't take any assessment within this campaign.",
    "complete_all": "Complete all related assessments",
    "complete_prev": "Complete all prev assessments",
    "completed": "Completed",
    "continue": "Continue Assessment",
    "in_progress": "In Progress",
    "instructions": {
      "heading": "Instructions to follow"
    },
    "interrupted": "Interrupted",
    "language": {
      "cancel": "Cancel",
      "content": "This assessment is not available in the language that you have selected. Please pick the language in which you want to give the assessment",
      "proceed": "Proceed",
      "single_lang": "This assessment is only available in %{lang}, which is different than you selected language.",
      "title": "Select language"
    },
    "new": "New",
    "not_started": "New",
    "time_left": {
      "cancel": "Cancel",
      "continue": "Continue",
      "notification": "Your allocated time for this task \"%{assessmentName}\" was %{x} minutes. Due to the overall elapsed time, you now have only %{y} minutes as your adjusted time to complete this task.",
      "title": "Time left warning"
    },
    "timer": {
      "message": "Time left to complete all activities",
      "notification": "You have %{minutes} minutes and %{seconds} seconds to complete"
    },
    "ungrouped": "Ungrouped assessments",
    "welcome": "Welcome"
  },
  "checking_wizard": {
    "audio_check": {
      "access": "Access",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use microphone to record audio",
      "continue": "Continue",
      "processing": "Processing",
      "record_title": "Please speak and repeat the following sentence 3 times.",
      "run_again": "Run again",
      "speech_detection": "Speech detection",
      "test_message": "great to speak with you",
      "title": "We need to ensure your system can record audio."
    },
    "network_check": {
      "continue": "Continue",
      "download": "Download",
      "levels": {
        "0": "Network broken (reconnecting)",
        "1": "Very bad network",
        "2": "Bad network",
        "3": "Average network",
        "4": "Good network",
        "5": "Very good network"
      },
      "network": "Network",
      "please_check_connection": "Please check your Internet Connection",
      "processing": "Processing",
      "run_again": "Run again",
      "run_again_title": "And run this test again",
      "start": "Start",
      "title": "Click start to begin internet speed test.",
      "upload": "Upload"
    },
    "steps": {
      "audio_check": "Microphone Test",
      "network_check": "Internet Speed Test",
      "system_check": "System Check",
      "video_check": "Video Camera Test"
    },
    "success": {
      "start": "Start assessment",
      "title": "You have successfully completed all checks."
    },
    "system_check": {
      "continue": "Continue",
      "start": "Start",
      "title": "Before starting this assessment, your system needs to undergo some checks."
    },
    "video_check": {
      "access": "Access",
      "access_help": "Click here for help.",
      "allow": "Allow",
      "allow_title": "Please allow to use camera to record Video",
      "ambient_light": "Ambient Light",
      "continue": "Continue",
      "face_detection": "Face detection",
      "processing": "Processing",
      "run_again": "Run again",
      "title": "We need to ensure your system can record the video"
    }
  },
  "languages": {
    "ar": "Arabic",
    "bg": "Bulgarian",
    "bs": "Bosnian",
    "ca": "Catalan",
    "cn": "Chinese",
    "cs": "Czech",
    "cy": "Cymraeg",
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en": "English",
    "en-GB": "English - UK",
    "eo": "Esperanto",
    "es": "Spanish (Latin America)",
    "es-ES": "Spanish (Spain)",
    "et": "Estonian",
    "fa": "Persian",
    "fi": "Finnish",
    "fr": "French",
    "gu": "Gujarati",
    "he": "Hebrew",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Bahasa Indonesia",
    "it": "Italian",
    "ja": "Japanese",
    "km": "Khmer",
    "ko": "Korean",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "mk": "Macedonian",
    "mn": "Mongolian",
    "ms": "Bahasa Malaysia",
    "my": "Myanmar",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "pt-BR": "Brazilian Portuguese",
    "ro": "Romanian",
    "ru": "Russian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "sr-Cyrl": "Serbian Cyrillic",
    "sr-Latn": "Serbian Latin",
    "sv": "Swedish",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tl": "Tagalog",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "zh": "Chinese Simplified",
    "zh-TW": "Chinese Traditional"
  },
  "reports": {
    "actions": {
      "add": "Add Report",
      "download": "Download report",
      "view": "View Report"
    },
    "modules": {
      "common": {
        "almost_always": "Almost Always",
        "less_typical": "Less Typical",
        "moderate": "Moderate",
        "more_typical": "More Typical",
        "rare": "Rare"
      },
      "cpi_occupations": {
        "occupations": "Occupations",
        "your_potential_suitability": "Your Potential Suitability"
      },
      "gap_assessment": {
        "gap": "Gap",
        "item": "Indicator",
        "negative_gap": "Negative Gaps",
        "no_negative_gaps": "There are no Negative Gaps",
        "no_positive_gaps": "There are no Positive Gaps",
        "positive_gap": "Positive Gaps",
        "rank": "Rank",
        "scoring_category": "Competency"
      },
      "highest_lowest": {
        "average": "Average",
        "bottom_5": "BOTTOM 5",
        "category": "Category",
        "email": "Email",
        "first_name": "First Name",
        "highest_scores": "Highest Scores",
        "item": "Indicator",
        "last_name": "Last Name",
        "lowest_scores": "Lowest scores",
        "mean_score": "Mean Score",
        "rank": "Rank",
        "result": "Result",
        "score": "Score",
        "scoring_category": "Competency",
        "sub_competenties": "Sub-Competencies",
        "top_5": "TOP 5"
      },
      "potential_career_full": {
        "bachelors_or_masters_qualification": "Bachelors or Masters Qualification",
        "career_strengths_and_results": "Career Strengths and Your Results",
        "career_sub_tracks": "Career Sub-tracks",
        "detailed_career_guide": "Detailed Career Guide",
        "diploma_qualification": "Diploma Qualification",
        "education_level": "Education Level",
        "high_school_entry_roles": "High School Entry Roles",
        "key_career_tracks_within": "Below is a list of potential job roles for each of the career tracks. Remember this list is indicative only, and not exhaustive. Do note that roles in italics require higher levels of education and / or experience.",
        "potential_areas_of_study": "Potential Areas of Study",
        "potential_roles": "Potential Roles",
        "strength_high": "Signature Strength",
        "strength_low": "Developmental Strength",
        "strength_moderate": "Potential Strength",
        "work_environment": "Work Environment",
        "your_suitability": "Your Suitability"
      },
      "potential_career_short": {
        "career": "career",
        "for_this": "for this",
        "key": "key",
        "strengths": "strengths",
        "your_scores": "Your Scores"
      },
      "single_value": {
        "factor_name": "Scoring Category",
        "question_name": "Questions"
      },
      "single_value_cluster": {
        "competency": "Competency",
        "description": "Description",
        "developmental_rating": "Developmental Rating",
        "questions": "Questions"
      },
      "strength_clusters": {
        "index_sub_factors_considered": "Thriving Index sub-factors that have been considered to provide your final score for the %{workstyle} work environment",
        "possible_roles": "Possible Roles",
        "work_environments": "Expected Work Environments"
      },
      "three_sixty_default": {
        "factor": {
          "items": "Items",
          "max": "Max Value",
          "mean": "Mean",
          "min": "Min Value",
          "standardDeviation": "Standard Deviation",
          "sum": "Sum",
          "totalResponses": "Total Responses",
          "variance": "Variance",
          "weightedMean": "Weighted Mean"
        },
        "statistic": "Statistic",
        "value": "Value"
      },
      "three_sixty_report_summary": {
        "number_by_filter_evaluations_received": "Number of %{filter} evaluations received",
        "number_of_evaluators_invited": "Number of evaluators invited",
        "number_of_evaluators_received": "Number of evaluations received",
        "number_of_evaluators_responded": "Number of evaluators responded",
        "subject": "Subject",
        "title": "Report Summary",
        "total_evaluations": "Total evaluations for this assessment"
      },
      "video_response": {
        "no_results": "No videos recorded"
      }
    },
    "show": {
      "export_pdf": "Export to PDF",
      "header": "Report"
    },
    "statuses": {
      "approved": "Approved",
      "available": "Available",
      "denied": "Denied",
      "incomplete": "Incomplete",
      "not_available": "Not available",
      "on_hold": "On hold",
      "released": "Released"
    }
  },
  "shared": {
    "filters": {
      "clear": "Clear Filters"
    },
    "internet_disconnected_message": "Trying to reconnect. Please check your internet connection.",
    "password_reset": {
      "description": "Please enter your email address in the box below and click 'Reset Password'.",
      "email_label": "Email Address",
      "instruction": "Enter the email associated with your account",
      "submit": "Reset Password",
      "title": "Forgot Password?"
    },
    "terms_conditions_privacy": "Privacy Statement",
    "tte_terms_and_condition": "TTE - Terms, Conditions and Privacy Statement"
  },
  "subjects": {
    "statuses": {
      "completed": "Completed",
      "declined": "Declined",
      "denied": "Denied",
      "done": "Done",
      "not_completed": "Not Completed",
      "waiting": "Waiting"
    }
  },
  "threesixty": {
    "accept_privacy_modal": {
      "accept": "Accept",
      "reject": "Reject",
      "text": "In completing this questionnaire(s), you are consenting for any data collected as a result to be used for the purposes intended and described in the communication you have already received. Your responses to the questions asked, along with any other associated data provided, will be used for the purposes of analysing and reporting your individual responses. We may also use your responses as part of large scale research projects. Your data will be treated with the requisite sensitivity and security. Please click <a href='https://thetalententerprise.com/privacy-statement/' target='_blank'>here</a> / go to this website to find out more or to contact someone for any more specific queries you may have.",
      "title": "Data processing consent"
    },
    "add": "Add",
    "and": "And",
    "approve_all": "Approve All",
    "approve_all_successful": "Approved all nominations",
    "approve_evaluations": "Approve Evaluations",
    "approve_nominations": "Approve Nominations",
    "approve_reports": "Approve Reports",
    "approved": "Approved",
    "approving_mail_sent": "Mail for approving nomination has been sent to managers",
    "as_my": "as my",
    "assessment": "Assessment",
    "back_to_tasks": "Back to tasks",
    "begin": "Begin",
    "cancel": "Cancel",
    "close_evaluation_modal": {
      "message": "Once you view the report, %{pronoun_or_name} won't be able to receive any further evaluations",
      "title": "Are you sure you want to view the report?"
    },
    "closed_campaign_message": "This 360 campaign is closed. You can't nominate or evaluate anyone for this campaign.",
    "completed": "Completed",
    "confirm": "Are you sure?",
    "confirmation_for_nomination_removal": "Are you sure you want to remove the nomination",
    "confirmation_required": "Confirmation required",
    "confirmation_text_incorrect": "Confirmation text is incorrect",
    "confirmation_text_placeholder": "Confirmation text here",
    "continue": "Continue",
    "dashboard_title": "Welcome %{name}",
    "decline": "Decline",
    "decline_invite": "Decline Invite",
    "denied": "Denied",
    "deny_all": "Deny All",
    "deny_all_successful": "Denied all nominations",
    "download_pdf": "Download PDF",
    "download_report": "Download Report",
    "download_reports": "Download Reports",
    "edit_user": "Edit User",
    "email_approve_request": "Email Approval Request",
    "email_schedules": {
      "delete_successful": "Email schedule deleted successfully"
    },
    "evaluate": "Evaluate",
    "evaluation": "Evaluation",
    "evaluation_closed_nomination_message": "You can't nominate for this subject as evaluation is closed for this subject",
    "evaluations": "Evaluations",
    "evaluator": "Evaluator",
    "export_pdf": "Export PDF",
    "first_name": "First Name",
    "first_name_error": "Please input First Name",
    "help": "Help",
    "helps": {
      "main": "<h2>Help</h2> <p>need content for help modal</p>"
    },
    "language": "Language",
    "last_name": "Last Name",
    "last_name_error": "Please input Last Name",
    "load_results": "Load Results",
    "mail_history": {
      "statuses": {
        "success": "Success",
        "undelivered": "Undelivered"
      }
    },
    "mindmill_confirmation": "Starting this assessment you will lost results \"%{assessment}\". Click \"Cancel\" if you want leave results, and click \"Ok\" if you want continue",
    "my_projects": "My Projects",
    "nominate": "Nominate",
    "nominate_evaluators": "Nominate Evaluators to",
    "nomination": "Nomination",
    "nominations": "Nominations",
    "options": {
      "global": {
        "cannot_re_edit": "Participants cannot edit evaluations"
      }
    },
    "or": "Or",
    "page_title": "Signify 360° Review - Apply Level",
    "participant_list": {
      "actions": {
        "approve_report": "Approve Report",
        "download_report": "Download Report",
        "edit": "Edit",
        "hold_report": "Hold report",
        "login": "Login",
        "mark_as_done": "Mark as done",
        "release_report": "Release report",
        "remove_campaign": "Remove from campaign",
        "remove_report_approval": "Remove report approval",
        "remove_report_hold_release_report": "Remove Report Hold/Release",
        "remove_subject": "Remove subject",
        "unmark_as_done": "Unmark as done",
        "view_report": "View Report",
        "view_responses": "View Responses"
      },
      "confirmation_messages": {
        "approve_report": "Are you sure you want to approve report?",
        "hold_report": "Are you sure you want to hold report?",
        "mark_evaluation_done": "Are you sure you want to mark evaluation as done? Evaluation will be closed for this subject.",
        "release_report": "Are you sure you want to release report?",
        "remove_from_campaign": "Are you sure you want to remove user from the campaign?",
        "remove_release_hold": "Are you sure you want to remove Release/Hold status?",
        "remove_report_approval": "Are you sure you want to remove report approval?",
        "remove_subject": "Are you sure you want to remove subject with email from campaign?",
        "umark_evaluation_as_complete": "Are you sure you want to unmark evaluation as done?"
      },
      "report_generation_message": "Report is generating. We will let you know when the report is ready."
    },
    "processing": "Processing",
    "processing_report": "Processing Report",
    "question": {
      "chat_type": {
        "input_placeholder": "Write your Message..."
      },
      "email_type": {
        "bcc": "Bcc",
        "cc": "Cc",
        "edit": "Edit",
        "max_length_warning": "%{x} characters remaining",
        "message": "Your Message",
        "send": "Send",
        "subject": "Subject",
        "successful_message": "You have successfully sent the email",
        "to": "To"
      }
    },
    "remind_all": "Remind All",
    "remind_mail_sent": "Reminders sent to evaluators who haven't completed the evaluation",
    "report_for": "Report for",
    "report_generation_in_progress": "Report is generating. We will let you know when the report is ready.",
    "reports": "Reports",
    "reset_campaign_confirmation": "Enter current campaign name given below in text box to reset all participants",
    "reset_nomination_confirmation": "Enter current campaign name given below in text box to reset all nominations",
    "save": "Save",
    "select_relationnship": "Select Relationship",
    "select_relationship": "Select Relationship",
    "self": "Self",
    "set_name_for_evaluator": "Set name for Evaluator",
    "setup_nominations": "Set up nominations",
    "subject": "Subject",
    "submit": "Submit",
    "total_progress": "Total progress",
    "user_name_input_placeholder": "type name or email...",
    "validation_errors": "Validation Errors",
    "view_my_report": "View My Report",
    "view_nominations": "View nominations",
    "view_reports": "View Reports",
    "waiting": "Waiting",
    "you": "You",
    "yourself": "Yourself"
  },
  "user_reports": {
    "actions": {
      "regenerate": "Regenerate"
    },
    "messages": {
      "regenerate_successful": "Report regeneration job scheduled successfully"
    },
    "modals": {
      "remove": {
        "content": "Are you sure you want to remove report %{userReportName}?",
        "successfully": "%{userReportName} report removed successfully"
      }
    },
    "preview_report": "Preview Report",
    "statuses": {
      "generating": "Generating",
      "not_prepared": "Not Available",
      "prepared": "Available"
    }
  },
  "validations": {
    "AudioResponse": {
      "in_progress": {
        "RECORDED": "Audio is recorded but not saved",
        "RECORDING": "Audio recording is in progress",
        "SAVING": "Recorded audio upload is in progress"
      },
      "required": "Please record and save the audio before you continue"
    },
    "FileUpload": {
      "in_progress": {
        "SAVING": "File upload is in progress"
      },
      "required": "Please upload the file"
    },
    "TextEntry": {
      "Email": {
        "character_range": "Email message entered must be at least %{min} and no more than %{max} characters.",
        "max_length": "Email message entered must be no more than %{max} characters.",
        "min_length": "Email message entered must be at least %{min} characters.",
        "subject": {
          "min_length": "Subject field should have minimum of 10 characters"
        },
        "to": {
          "required": "To field is required"
        }
      }
    },
    "VideoResponse": {
      "in_progress": {
        "recorded": "Video is recorded but not saved",
        "recording": "Video recording is in progress",
        "saving": "Recorded video upload is in progress"
      },
      "required": "Please record and save the video before you continue"
    },
    "actions_still_in_progress": "Below actions are in progress. If you proceed you will lose these data.",
    "blank": "can't be blank",
    "character_range": "Your response must be at least %{min} and no more than %{max} characters.",
    "date": "Your response must be a valid date (mm/dd/yyyy)",
    "each_group_contains": "Each group needs to contain not less than %{min} and not more than %{max} items",
    "email": "Your response must be a valid email",
    "file_upload": {
      "EntityTooLarge": "File size should be less than %{maxFileSize} MB",
      "WrongFileType": "File type should be one of the following %{allowedFileTypes}"
    },
    "issue": "Issue",
    "least": "Please answer at least %{min} choice(s).",
    "least_hotspot": "Please answer at least %{min} choice(s).",
    "max_length": "Your response must be no more than %{max} characters.",
    "min_length": "Your response must be at least %{min} characters.",
    "must_rank_between": "Please assign a value from %{min} to %{max} for each item. Values may not be repeated.",
    "must_select": "Please select from %{min} to %{max} choices",
    "number": "Your response must be a number",
    "range": "Please answer at least %{min} and no more than %{max} choice(s).",
    "required": "Please answer this question",
    "text": "Your response must not contain a numbers",
    "title": {
      "one": "There is one error, please check your responses",
      "other": "There are %{count} errors, please check your responses"
    }
  }
});
